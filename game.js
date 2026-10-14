const $ = (id) => document.getElementById(id);
const WORLDS = window.LEXQUEST_WORLDS;
const ALL_CHECKPOINTS = Object.values(WORLDS).flatMap(w => w.checkpoints);
const state = { mode: 'login', backend: 'local', cloud: null, user: null, progress: {}, course: null,
  chapterId: null, playerX: 80, playerY: 400, walk: 0, keys: {left:false,right:false,up:false,down:false}, travelTo: null, activeCheckpoint: null,
  lastFrame: 0, particles: [], shareProgress: false, cloudReady: null };
const canvas = $('worldCanvas');
const ctx = canvas.getContext('2d');
const WORLD_WIDTH = 1620;
const WORLD_HEIGHT = 1090;
let WIDTH = canvas.width;
const HEIGHT = canvas.height;
function resizeCanvas(){
  // On a phone, show a close-up following the moving character, not a miniature 1120px map.
  WIDTH = window.innerWidth <= 700 ? 520 : 1120;
  if(canvas.width !== WIDTH) canvas.width = WIDTH;
}
function cameraOffset(){return {x:Math.max(0,Math.min(WORLD_WIDTH-WIDTH,state.playerX-WIDTH*.48)),y:Math.max(0,Math.min(WORLD_HEIGHT-HEIGHT,state.playerY-HEIGHT*.54))};}
function chaptersFor(course){return window.LEXQUEST_CHAPTERS[course];}
function activeChapter(){return chaptersFor(state.course)?.find(ch=>ch.id===state.chapterId);}
function activeCheckpoints(){const ids=new Set(activeChapter()?.checkpoints||[]);return WORLDS[state.course]?.checkpoints.filter(cp=>ids.has(cp.id))||[];}
function chapterProgress(ch){return ch.checkpoints.filter(id=>state.progress[itemKey(state.course,id)]?.completed).length;}
function chapterIndex(){return chaptersFor(state.course)?.findIndex(ch=>ch.id===state.chapterId)??0;}

resizeCanvas();
let toastTimeout;

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function displayScreen(which){ ['authScreen','dashboard','gameScreen'].forEach(n => $(n).classList.toggle('hidden',n!==which)); }
function setText(id,value){ $(id).textContent = String(value); }

function currentPlayerName(){
  return (state.user?.name || state.user?.display_name || 'Student').trim() || 'Student';
}
function displayCharacterName(){
  const raw = currentPlayerName().split(/\s+/)[0] || currentPlayerName();
  return raw.length > 10 ? raw.slice(0,10).toUpperCase() : raw.toUpperCase();
}
function personalize(text){
  if(!text) return text;
  const name = currentPlayerName();
  return String(text).split("Maya's").join(`${name}'s`).split("Lia's").join(`${name}'s`).split('Maya').join(name).split('Lia').join(name);
}
function notify(message){ clearTimeout(toastTimeout); $('toast').textContent = message; show($('toast')); toastTimeout=setTimeout(()=>hide($('toast')),3200); }
function slugName(name){ return name.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.+|\.+$/g,''); }
function itemKey(course,id){ return `${course}:${id}`; }
function solvedCount(course){ return WORLDS[course].checkpoints.filter(n=>state.progress[itemKey(course,n.id)]?.completed).length; }
function totalSolved(){ return Object.keys(WORLDS).reduce((n,course)=>n+solvedCount(course),0); }
function progressRate(course){return Math.round(100*solvedCount(course)/WORLDS[course].checkpoints.length);}
function setAuthMode(mode){ state.mode=mode; $('signInMode').classList.toggle('active',mode==='login'); $('registerMode').classList.toggle('active',mode==='register'); $('authSubmit').textContent=mode==='login'?'Enter the adventure →':'Create my account →'; $('authError').textContent=''; }

async function rpc(name, payload){
  const c=window.LEXQUEST_CONFIG||{};
  const response=await fetch(`${c.SUPABASE_URL.replace(/\/$/,'')}/rest/v1/rpc/${name}`,{
    method:'POST',
    headers:{'apikey':c.SUPABASE_ANON_KEY,'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.message||'Database request failed. Check the SQL setup and your network.');
  if(data?.error) throw new Error(data.error);
  return data;
}
async function initializeCloud(){
  const c=window.LEXQUEST_CONFIG||{};
  if(!c.SUPABASE_URL||!c.SUPABASE_ANON_KEY){state.backend='local';return;}
  if(!/^https:\/\/.+\.supabase\.co\/?$/.test(c.SUPABASE_URL.trim())){
    state.backend='unavailable';$('modeBanner').textContent='Invalid database URL in config.js.';return;
  }
  state.backend='cloud';
  $('modeBanner').textContent='Classroom mode · name + PIN accounts sync securely across devices';
  const token=localStorage.getItem('lexquest_cloud_session');
  if(!token)return;
  try{
    const record=await rpc('get_player_session',{p_token:token});
    await enterAccount({...record.player,slug:record.player.username},record.player.share_progress,record.progress||[]);
  }catch(err){localStorage.removeItem('lexquest_cloud_session');console.warn('Expired or invalid session:',err.message);}
}
function randomHex(bytes=16){return [...crypto.getRandomValues(new Uint8Array(bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function hashPin(pin,salt){
  if(!crypto?.subtle) throw new Error('This browser cannot securely store a local PIN. Open the preview over localhost or HTTPS.');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
  const bytes=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:160000},key,256);
  return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function readLocalAccounts(){try{return JSON.parse(localStorage.getItem('lexquest_users_v1')||'{}');}catch{return {};}}
async function localAuth(name,slug,pin){
  const users=readLocalAccounts();
  if(state.mode==='register'){
    if(users[slug])throw new Error('This study name is already taken. Choose a more specific name or log in.');
    const salt=randomHex(); users[slug]={name,salt,hash:await hashPin(pin,salt)};
    localStorage.setItem('lexquest_users_v1',JSON.stringify(users));
  } else {
    if(!users[slug])throw new Error('No account under that study name on this device. Create one first.');
    const h=await hashPin(pin,users[slug].salt);
    if(h!==users[slug].hash)throw new Error('Incorrect PIN for this local preview account.');
    name=users[slug].name;
  }
  await enterAccount({id:slug,slug,name},false);
}
async function cloudAuth(name,slug,pin){
  const fn=state.mode==='register'?'register_player':'login_player';
  const data=await rpc(fn,{p_username:slug,p_display_name:name,p_pin:pin});
  localStorage.setItem('lexquest_cloud_session',data.token);
  await enterAccount({...data.player,slug:data.player.username},!!data.player.share_progress,data.progress||[]);
}
async function handleAuth(evt){
  evt.preventDefault();
  const name=$('studyName').value.trim().replace(/\s+/g,' '),pin=$('studyPin').value.trim(),slug=slugName(name);
  $('authError').textContent='';
  if(name.length<3||slug.length<3||slug.length>50){$('authError').textContent='Please use a unique study name of at least 3 characters.';return;}
  if(!/^\d{8,12}$/.test(pin)){$('authError').textContent='Use a numeric PIN with 8–12 digits.';return;}
  $('authSubmit').disabled=true;
  try{
    if(state.cloudReady)await state.cloudReady;
    if(state.backend==='cloud')await cloudAuth(name,slug,pin);
    else if(state.backend==='local')await localAuth(name,slug,pin);
    else throw new Error('Cloud configuration could not be loaded. Check config.js or leave its keys empty to use the local preview.');
    $('studyPin').value='';
  }catch(e){$('authError').textContent=e.message||'Sign-in failed. Please try again.';}
  finally{$('authSubmit').disabled=false;}
}

async function enterAccount(user,share,cloudProgress=[]){
  state.user=user;state.shareProgress=!!share;
  if(state.backend==='cloud'){
    state.progress={};
    for(const p of cloudProgress) state.progress[itemKey(p.subject,p.checkpoint)]={completed:p.completed,attempts:p.attempts||0};
  }else{
    try{state.progress=JSON.parse(localStorage.getItem(`lexquest_progress_${user.slug}`)||'{}');}catch{state.progress={};}
  }
  updateDashboard();displayScreen('dashboard');
}
async function saveCompletion(subject,id){
  const k=itemKey(subject,id);
  const prior=state.progress[k];
  state.progress[k]={completed:true,attempts:(prior?.attempts||0)+1};
  if(state.backend==='cloud'){
    try{await rpc('save_checkpoint',{p_token:localStorage.getItem('lexquest_cloud_session'),p_subject:subject,p_checkpoint:id});}
    catch(err){notify('Could not sync progress: '+err.message);console.error(err);}
  }else localStorage.setItem(`lexquest_progress_${state.user.slug}`,JSON.stringify(state.progress));
  updateDashboard();if(state.course)updateQuestUI();
}
async function logout(){
  if(state.backend==='cloud'){
    const token=localStorage.getItem('lexquest_cloud_session');
    localStorage.removeItem('lexquest_cloud_session');
    if(token)rpc('logout_player',{p_token:token}).catch(()=>{});
  }
  state.user=null;state.progress={};state.course=null;state.keys={left:false,right:false,up:false,down:false};state.activeCheckpoint=null;
  hide($('lessonModal'));displayScreen('authScreen');
}
function updateDashboard(){
  if(!state.user)return;
  setText('welcomeName',state.user.name||state.user.display_name);
  setText('dashMode',state.backend==='cloud'?'Cloud synced':'This device only');
  setText('completedStat',`${totalSolved()} / ${ALL_CHECKPOINTS.length}`);
  setText('starsStat',`${totalSolved()*25} ✦`);
  setText('percentStat',`${Math.round(100*totalSolved()/ALL_CHECKPOINTS.length)}%`);
  for(const course of Object.keys(WORLDS)){
    $(`${course}Meter`).style.width=progressRate(course)+'%';
    setText(`${course}Count`,`${solvedCount(course)}/${WORLDS[course].checkpoints.length} checkpoints`);
  }

}

function startWorld(course){
  state.course=course;
  displayScreen('gameScreen');
  switchChapter(chaptersFor(course)[0].id);
}
function switchChapter(chapterId,checkpointId=null){
  const ch=chaptersFor(state.course).find(c=>c.id===chapterId);
  if(!ch)return;
  state.chapterId=chapterId;
  const target=WORLDS[state.course].checkpoints.find(cp=>cp.id===(checkpointId||ch.checkpoints[0]));
  state.playerX=Math.max(40,target.x-105);state.playerY=Math.min(WORLD_HEIGHT-60,target.y+74);
  state.travelTo=checkpointId ? {x:target.x,y:target.y,id:target.id} : null;
  state.walk=0;state.particles=[];state.keys={left:false,right:false,up:false,down:false};
  closeNav();updateQuestUI();drawWorld(performance.now());
  notify(ch.title+' · '+ch.checkpoints.length+' checkpoints');
}
function goNextChapter(){
  const chapters=chaptersFor(state.course),i=chapterIndex();
  if(i<chapters.length-1){closeLesson();switchChapter(chapters[i+1].id);}
  else notify('Last chapter reached. You can revisit any chapter using Navigate.');
}
function updateQuestUI(){
  if(!state.course)return;
  const ch=activeChapter();
  const count=chapterProgress(ch);
  setText('worldTitle',ch.title);setText('worldSmall',ch.label);
  setText('chapterMeta',ch.section);setText('chapterHeading',ch.title);
  setText('chapterDetails',`${ch.subtitle || ch.checkpoints.length+' focused checkpoints'} · ${ch.checkpoints.length} checkpoints`);
  setText('worldProgress',`${count}/${ch.checkpoints.length}`);
  setText('worldStars',solvedCount(state.course)*25);
  setText('navStudent',`${currentPlayerName()}'s chapters`);
  setText('journalPercent',progressRate(state.course)+'%');
  $('journalMeter').style.width=progressRate(state.course)+'%';
  $('nextChapter').disabled=chapterIndex()>=chaptersFor(state.course).length-1;
  $('nextChapter').textContent=chapterIndex()>=chaptersFor(state.course).length-1?'Last chapter ✓':'Next chapter →';
  const index=$('chapterNavGroups');index.replaceChildren();
  for(const c of chaptersFor(state.course)){
    const group=document.createElement('div');group.className='chapter-nav-group';
    const header=document.createElement('button');header.type='button';header.className='chapter-nav-header'+(c.id===state.chapterId?' active':'');
    const heading=document.createElement('span');heading.textContent=c.title;
    const subtitle=document.createElement('small');subtitle.textContent=`${c.label} · ${c.checkpoints.filter(id=>state.progress[itemKey(state.course,id)]?.completed).length}/${c.checkpoints.length}`;
    header.append(heading,subtitle);header.addEventListener('click',()=>switchChapter(c.id));group.append(header);
    if(c.subtitle){const detail=document.createElement('div');detail.className='chapter-nav-subtitle';detail.textContent=c.subtitle;group.append(detail);}
    const kids=document.createElement('div');kids.className='chapter-nav-kids';
    for(const [i,id] of c.checkpoints.entries()){
      const cp=WORLDS[state.course].checkpoints.find(x=>x.id===id);if(!cp)continue;
      const done=!!state.progress[itemKey(state.course,id)]?.completed;
      const b=document.createElement('button');b.type='button';b.className='chapter-nav-checkpoint';
      const mark=document.createElement('span');mark.className='chapter-nav-mark';mark.textContent=done?'✓':'✦';
      const label=document.createElement('span');label.textContent=`${i+1}. ${cp.title}`;
      b.append(mark,label);b.addEventListener('click',()=>{
        if(c.id!==state.chapterId)switchChapter(c.id,id);
        else{state.travelTo={x:cp.x,y:cp.y,id:cp.id};closeNav();notify('Travelling to '+cp.title);}
      });kids.append(b);
    }
    group.append(kids);index.append(group);
  }
}
function nearestCheckpoint(){
  const checkpoints=activeCheckpoints();
  if(!checkpoints.length)return null;
  return checkpoints.reduce((a,b)=>Math.hypot(b.x-state.playerX,b.y-state.playerY)<Math.hypot(a.x-state.playerX,a.y-state.playerY)?b:a);
}
function interact(){
  if(!state.course||!$('lessonModal').classList.contains('hidden')||!$('fileOverlay').classList.contains('hidden'))return;
  const cp=nearestCheckpoint();if(!cp)return;
  if(Math.hypot(cp.x-state.playerX,cp.y-state.playerY)<97)openLesson(cp);
  else notify('Walk closer to a glowing checkpoint or choose one from Navigate.');
}

function openLesson(cp){
  state.activeCheckpoint=cp; state.travelTo=null; clearTimeout(toastTimeout);hide($('toast'));
  const arr=activeCheckpoints();
  const guide=window.LEXQUEST_GUIDES[cp.id];
  setText('lessonNumber',`${activeChapter().label} · CHECKPOINT ${arr.indexOf(cp)+1} OF ${arr.length}`);
  $('checkpointCase').textContent=guide.caseIds?.length?'📁 CASE DOCUMENT':'📁 CASE INDEX';
  setText('lessonTitle',cp.title); setText('challengeTitle',personalize(cp.game.title));setText('challengePrompt',personalize(cp.game.prompt));
  const body=$('lessonBody');body.replaceChildren();
  const kicker=document.createElement('div');kicker.className='focus-kicker';kicker.textContent=cp.tag;
  const leading=document.createElement('div');leading.className='focus-leading';leading.textContent=personalize(cp.story);
  const help=document.createElement('div');help.className='keyword-help';help.textContent='TAP A KEYWORD TO UNFOLD ITS EXPLANATION ↓';
  const keywordGrid=document.createElement('div');keywordGrid.className='keyword-grid';
  const explanation=document.createElement('section');explanation.id='keywordExplanation';explanation.className='keyword-explanation hidden';explanation.setAttribute('aria-live','polite');
  for(const [label,detail,symbol] of guide.keywords){
    const btn=document.createElement('button');btn.type='button';btn.className='keyword-card';btn.setAttribute('aria-expanded','false');
    const sign=document.createElement('span');sign.className='keyword-sign';sign.textContent=symbol;
    const caption=document.createElement('strong');caption.textContent=label;
    const arrow=document.createElement('small');arrow.textContent='TAP TO EXPAND  ↗';
    btn.append(sign,caption,arrow);
    btn.addEventListener('click',()=>{
      if(btn.classList.contains('selected')){btn.classList.remove('selected');btn.setAttribute('aria-expanded','false');hide(explanation);return;}
      keywordGrid.querySelectorAll('button').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-expanded','false');});
      btn.classList.add('selected');btn.setAttribute('aria-expanded','true');explanation.replaceChildren();
      const h=document.createElement('h3');h.textContent=label;
      const p=document.createElement('p');p.textContent=personalize(detail);
      const foot=document.createElement('p');foot.className='explanation-foot';foot.textContent='Explore the corresponding law and case files below for the complete assigned material.';
      explanation.append(h,p,foot);show(explanation);
      explanation.scrollIntoView({behavior:'smooth',block:'nearest'});
    });keywordGrid.append(btn);
  }
  const caseRibbon=document.createElement('div');caseRibbon.className='checkpoint-ribbon';
  caseRibbon.textContent=`📖 ${cp.provision}     ·     📁 ${cp.case}`;
  if(cp.reviewerPage){
    const path=document.createElement('div');path.className='reviewer-breadcrumb';
    path.textContent=`CHAPTER 2 / ${activeChapter().section.includes('SECTION 6')?'SECTION 6 · DISINHERITANCE':'SECTION 5 · LEGITIME'} / ${activeChapter().title}`;
    body.append(path);
  }
  body.append(kicker,leading,help,keywordGrid,explanation);
  if(cp.diagram){
    const figure=document.createElement('figure');figure.className='lesson-original-figure';
    const open=document.createElement('button');open.type='button';open.className='lesson-figure-open';
    open.setAttribute('aria-label','Enlarge original legitime diagram from the reviewer');
    const img=document.createElement('img');img.src=cp.diagram.src;img.alt=cp.diagram.alt;img.loading='lazy';
    open.append(img);open.addEventListener('click',()=>openFigureZoom(cp.diagram.src,cp.diagram.alt,cp.diagram.caption));
    const caption=document.createElement('figcaption');caption.textContent=cp.diagram.caption+' · TAP TO ENLARGE';
    figure.append(open,caption);body.append(figure);
  }
  if(cp.reviewerPage){const src=document.createElement('p');src.className='reviewer-page-source';src.textContent=`Reviewer source: [Draft] SUCCESSION Block Notes-3.pdf, p. ${cp.reviewerPage}. Notes and charts are presented under their original headings.`;body.append(src);}
  body.append(caseRibbon);
  $('challengeFeedback').textContent='';$('challengeFeedback').className='feedback';
  renderChallenge(cp);hide($('challengePanel'));$('challengeToggle').setAttribute('aria-expanded','false');
  setText('challengeToggle','✦ TRY THE MINI-GAME  ▾');
  show($('lessonModal'));$('closeLesson').focus();
}
function setFeedback(message,success){$('challengeFeedback').textContent=message;$('challengeFeedback').className='feedback '+(success?'success':'error');}
async function winCheckpoint(cp){
  const prev=!!state.progress[itemKey(state.course,cp.id)]?.completed;
  if(!prev)await saveCompletion(state.course,cp.id);
  setFeedback((prev?'Already completed. ':'Checkpoint cleared! ✦ +25 study stars. ')+personalize(cp.game.explanation),true);
  setText('completionHint','✓ Completed · revisit whenever you like');
  if(!prev){for(let i=0;i<24;i++)state.particles.push({x:state.playerX+Math.random()*30-15,y:state.playerY-45,vx:(Math.random()-.5)*3,vy:-2-Math.random()*4,life:65,color:['#ffe5a0','#f7aecd','#acffe2'][i%3]});}
}
function renderChallenge(cp){
  const container=$('challengeGame');container.replaceChildren();
  const done=!!state.progress[itemKey(state.course,cp.id)]?.completed;
  setText('completionHint',done?'✓ Previously completed':'Complete the challenge to earn ✦ 25');
  const game=cp.game;
  if(game.type==='choice'){
    const opts=document.createElement('div');opts.className='options';
    game.options.forEach((op,ix)=>{
      const btn=document.createElement('button');btn.type='button';btn.className='option';btn.textContent=`${String.fromCharCode(65+ix)}. ${op}`;
      if(done){btn.disabled=true;if(ix===game.correct)btn.classList.add('correct');}
      btn.addEventListener('click',async()=>{
        if(ix!==game.correct){btn.classList.add('wrong');setFeedback('Not quite. Revisit the principle and try again.',false);return;}
        opts.querySelectorAll('button').forEach(x=>x.disabled=true);btn.classList.add('correct');await winCheckpoint(cp);
      });opts.append(btn);
    });container.append(opts);
    if(done)setFeedback('Checkpoint already cleared. '+personalize(game.explanation),true);
  }else if(game.type==='match'){
    const matched=new Set();let selected=null;
    const grid=document.createElement('div');grid.className='match-grid';
    const left=document.createElement('div'),right=document.createElement('div');left.className=right.className='match-column';
    const rightOrder=game.pairs.map((_,i)=>i).reverse(); // Deliberately reverse the answer column.
    game.pairs.forEach(([l],ix)=>{
      const b=document.createElement('button');b.type='button';b.className='match-option';b.textContent=l;
      if(done){b.classList.add('matched');b.disabled=true;}
      b.addEventListener('click',()=>{if(matched.has(ix))return;selected=ix;left.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');setFeedback('Now tap the matching definition.',true);});left.append(b);
    });
    rightOrder.forEach(ix=>{
      const b=document.createElement('button');b.type='button';b.className='match-option';b.textContent=game.pairs[ix][1];
      if(done){b.classList.add('matched');b.disabled=true;}
      b.addEventListener('click',async()=>{
        if(selected===null){setFeedback('Choose a concept on the left first.',false);return;}
        if(ix!==selected){setFeedback('That pair does not match. Try again.',false);return;}
        matched.add(ix);b.disabled=true;b.classList.add('matched');const lbtn=left.children[ix];lbtn.disabled=true;lbtn.classList.add('matched');lbtn.classList.remove('active');selected=null;
        if(matched.size===game.pairs.length)await winCheckpoint(cp);else setFeedback(`${matched.size}/${game.pairs.length} pairs matched. Keep going!`,true);
      });right.append(b);
    });
    grid.append(left,right);container.append(grid);
    if(done)setFeedback('Checkpoint already cleared. '+personalize(game.explanation),true);
  }
}
function closeLesson(){hide($('lessonModal'));state.activeCheckpoint=null;}

function between(a,b,t){return a+(b-a)*t;}
function box(x,y,w,h,fill,r=0){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function rect(x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);}
function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function textDraw(s,x,y,size=18,color='#fff',align='center',weight='700',family='system-ui, sans-serif'){
  ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${family}`;ctx.fillText(s,x,y);
}
function drawFacade(x,y,w,h,body,roof){
  box(x,y,w,h,body,7);box(x-8,y-14,w+16,20,roof,5);
  for(let yy=y+24;yy<y+h-36;yy+=43){
    for(let xx=x+23;xx<x+w-30;xx+=47){
      box(xx,yy,24,23,((xx+yy)/13|0)%2?'#b6a0e3':'#6fb5ca',3);
    }
  }
  box(x+w/2-20,y+h-38,40,38,'#140c2f',4);
}
function drawBackdrop(t){
  const sky=ctx.createLinearGradient(0,0,0,WORLD_HEIGHT);
  sky.addColorStop(0,'#10082f');sky.addColorStop(.5,'#1c104c');sky.addColorStop(1,'#130a32');
  rect(0,0,WORLD_WIDTH,WORLD_HEIGHT,sky);
  for(let i=0;i<65;i++){
    const x=(i*193)%WORLD_WIDTH,y=(i*123)%WORLD_HEIGHT,a=.27+.2*Math.sin(t/900+i);
    ctx.globalAlpha=a;box(x,y,5,5,'#ffefce',1);
  }
  ctx.globalAlpha=1;
  const c=state.course==='labor';
  const tops=[43,292,544,794];
  tops.forEach((y,row)=>{
    // three terraces: skyline and a broad, walkable promenade at each level
    box(0,y+125,WORLD_WIDTH,94,row%2?'#302354':'#291e50');
    box(0,y+125,WORLD_WIDTH,8,'#8570ab');
    for(let x=50;x<WORLD_WIDTH;x+=410){
      drawFacade(x,y+(row%2?10:22),288,121,
        c?(['#4a2e71','#352d72','#45285f'][((x/410)|0)%3]):(['#50386b','#3e3578','#5b365e'][((x/410)|0)%3]),
        c?'#7960a2':'#a17dae');
    }
    for(let x=35;x<WORLD_WIDTH;x+=112)box(x,y+174,47,5,'#8370ae',2);
  });
  // A dotted route visibly connects all checkpoint locations across X and Y.
  const spots=activeCheckpoints();
  if(spots.length){
    ctx.save();ctx.strokeStyle='#d2b7ee71';ctx.lineWidth=5;ctx.lineCap='round';ctx.setLineDash([3,15]);
    ctx.beginPath();ctx.moveTo(spots[0].x,spots[0].y);
    for(let i=1;i<spots.length;i++)ctx.lineTo(spots[i].x,spots[i].y);
    ctx.stroke();ctx.restore();
  }
  // Small atmospheric squares/papers, well behind playable objects
  for(let i=0;i<12;i++){
    let x=((t/75)+i*150)%(WORLD_WIDTH+60)-30,y=80+((i*137)%850);
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t/800+i)*.16);box(-6,-5,12,10,'#f4e7d8aa',1);ctx.restore();
  }
}
function drawObject(cp,i,t){
  const x=cp.x,y=cp.y,done=!!state.progress[itemKey(state.course,cp.id)]?.completed;
  const near=Math.hypot(x-state.playerX,y-state.playerY)<97;
  ctx.save();
  if(near){ctx.strokeStyle='#e6cfff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,y+9,75,20,0,0,Math.PI*2);ctx.stroke();}
  ellipse(x,y+8,54,13,done?'#8fd5c388':'#fff0b077');
  if(cp.object==='gate'||cp.object==='gateway'){
    box(x-48,y-92,19,94,'#e4c5d8',3);box(x+29,y-92,19,94,'#e4c5d8',3);box(x-59,y-104,118,19,'#ffd25d',4);box(x-22,y-72,44,66,'#3b285d',3);textDraw('§',x,y-41,30,'#ffe6a9');
  }else if(['office','building'].includes(cp.object)){
    box(x-55,y-82,110,84,'#36617b',5);box(x-62,y-95,124,16,'#ffd25d',4);box(x-42,y-57,27,31,'#75bfd0',2);box(x+15,y-57,27,31,'#75bfd0',2);box(x-12,y-29,24,31,'#251943',3);
  }else if(['scroll','files','books'].includes(cp.object)){
    box(x-49,y-75,98,75,'#f5e8c7',5);box(x-56,y-90,16,101,'#a96688',5);box(x+40,y-90,16,101,'#a96688',5);[-59,-42,-25].forEach(v=>box(x-25,y+v,50,5,'#a66e90',2));
  }else if(cp.object==='bridge'){
    box(x-66,y-43,132,44,'#9d7188',4);box(x-57,y-75,12,76,'#ffd25d',3);box(x+45,y-75,12,76,'#ffd25d',3);
    ctx.strokeStyle='#ffdc75';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-60,y-63);ctx.quadraticCurveTo(x,y-7,x+60,y-63);ctx.stroke();
  }else if(cp.object==='tower'){
    box(x-48,y-102,96,102,'#aa93cc',5);box(x-59,y-114,118,18,'#68518d',3);box(x-18,y-76,36,45,'#3a295a',4);textDraw('!',x,y-55,25,'#ffe49d');
  }else if(cp.object==='ship'){
    ctx.fillStyle='#eee2c7';ctx.beginPath();ctx.moveTo(x-62,y-31);ctx.lineTo(x+63,y-31);ctx.lineTo(x+42,y+1);ctx.lineTo(x-44,y+1);ctx.fill();
    box(x-5,y-91,8,60,'#8c6287',2);ctx.fillStyle='#ffdcba';ctx.beginPath();ctx.moveTo(x+3,y-85);ctx.lineTo(x+3,y-40);ctx.lineTo(x+44,y-40);ctx.fill();
  }
  const bob=Math.sin(t*.003+i)*5;
  ellipse(x,y-118+bob,23,23,done?'#8fd5c3':'#ffe3a2');textDraw(done?'✓':'✦',x,y-117+bob,23,'#382452');
  // Compact consistent label: never overlaps checkpoint objects, and every row follows the same baseline.
  const title=cp.title.length>23?cp.title.slice(0,21)+'…':cp.title;
  box(x-101,y-172,202,32,'#1c1245ea',10);textDraw(title,x,y-155,14,'#fff6d3');
  ctx.restore();
}
function drawCharacter(t){
  const x=state.playerX,y=state.playerY;
  const walking=state.keys.left||state.keys.right||state.keys.up||state.keys.down||state.travelTo!==null;
  const step=walking?Math.sin(state.walk)*3:0;
  ellipse(x,y+5,26,7,'#140b287b');
  ctx.save();ctx.translate(x,y+step);
  if(state.keys.left || (state.travelTo&&state.travelTo.x<x))ctx.scale(-1,1);
  box(-17,-90,37,34,'#2b1d31',5);box(-14,-74,31,29,'#d49a75',4);
  box(-22,-46,47,39,state.course==='labor'?'#b35f92':'#9d83c9',5);
  box(-30,-38,9,32,'#d49a75',3);box(24,-38,9,32,'#d49a75',3);
  box(-16,-9,13,11,'#5b3b83',2);box(6,-9,13,11,'#5b3b83',2);
  box(25,-31,12,23,'#ffd25d',4);ctx.restore();
  textDraw(displayCharacterName(),x,y+32,13,'#fff','center','900','"Courier New", monospace');
  const near=nearestCheckpoint();
  if(near&&Math.hypot(near.x-x,near.y-y)<97){
    box(x-86,y-133,172,27,'#170e3dda',10);textDraw('✦  INSPECT  ✦',x,y-119,12,'#ffdf93');
  }
}

function drawParticles(){

  state.particles=state.particles.filter(p=>p.life>0);
  for(const p of state.particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.11;p.life--;rect(p.x,p.y,8,8,p.color);}
}
function drawWorld(t){
  if(!state.course)return;
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  const camera=cameraOffset();ctx.save();ctx.translate(-camera.x,-camera.y);
  drawBackdrop(t);
  for(const [i,cp] of activeCheckpoints().entries())drawObject(cp,i,t);
  drawCharacter(t);drawParticles();ctx.restore();
}
function tick(t){
  const dt=Math.min(40,t-state.lastFrame||16);state.lastFrame=t;
  const isPlaying=state.course&&!$('gameScreen').classList.contains('hidden')
    &&$('lessonModal').classList.contains('hidden')&&$('fileOverlay').classList.contains('hidden')
    &&$('questDropdown').classList.contains('hidden');
  if(isPlaying){
    let dx=(state.keys.right?1:0)-(state.keys.left?1:0);
    let dy=(state.keys.down?1:0)-(state.keys.up?1:0);
    if(state.travelTo){
      dx=state.travelTo.x-state.playerX;dy=state.travelTo.y-state.playerY;
      const distance=Math.hypot(dx,dy);
      if(distance<8){
        const target=activeCheckpoints().find(cp=>cp.id===state.travelTo.id);
        state.playerX=state.travelTo.x;state.playerY=state.travelTo.y;state.travelTo=null;
        if(target)openLesson(target);
        dx=0;dy=0;
      }
    }
    if(dx||dy){
      const l=Math.hypot(dx,dy),speed=dt*.30;
      state.playerX=Math.max(42,Math.min(WORLD_WIDTH-42,state.playerX+dx/l*speed));
      state.playerY=Math.max(125,Math.min(WORLD_HEIGHT-53,state.playerY+dy/l*speed));
      state.walk+=dt*.035;
    }
  }
  if(state.course&&!$('gameScreen').classList.contains('hidden'))drawWorld(t);
  requestAnimationFrame(tick);
}
function startHold(btn,key){
  const stop=()=>state.keys[key]=false;
  btn.addEventListener('pointerdown',e=>{e.preventDefault();state.travelTo=null;state.keys[key]=true;btn.setPointerCapture(e.pointerId);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(evt=>btn.addEventListener(evt,stop));
}
// The reference library is a working document drawer, using the supplied report's law book / case file pattern.
let openFileType='law';let activeFileKey=null;
function fileDataset(type){return window.LEXQUEST_REFERENCE_FILES[state.course||'labor']?.[type==='law'?'laws':'cases']||{};}
function openReference(type,key=null){
  if(!state.course)return;
  openFileType=type;
  const data=fileDataset(type),keys=Object.keys(data);
  activeFileKey=key&&data[key]?key:keys[0];
  setText('fileModeTag',type==='law'?'LAW BOOK · STATUTES / PROVISIONS':'CASE FILES · DOCTRINE / FACTS / ISSUE / RULING / RATIO');
  setText('fileOverlayTitle',type==='law'?'Law & provision files':'Case documents');
  renderReference();show($('fileOverlay'));$('closeFile').focus();
}
function addTextDiv(parent,tag,label,value,className){
 const el=document.createElement(tag);if(className)el.className=className;
 if(label){const strong=document.createElement('strong');strong.textContent=label;el.append(strong);}
 const span=document.createElement('span');span.textContent=value||'Not covered in supplied notes.';el.append(span);
 parent.append(el);return el;
}
function renderReference(){
 const data=fileDataset(openFileType),index=$('fileIndex'),doc=$('fileDocument');index.replaceChildren();doc.replaceChildren();
 Object.entries(data).forEach(([key,value],i)=>{
   const b=document.createElement('button');b.type='button';b.className='file-index-item'+(key===activeFileKey?' active':'');
   const icon=document.createElement('span');icon.textContent=openFileType==='law'?'📜':'⚖';
   const text=document.createElement('span');text.textContent=value.title||value.name;
   b.append(icon,text);b.addEventListener('click',()=>{activeFileKey=key;renderReference();});index.append(b);
 });
 const item=data[activeFileKey];if(!item)return;
 const meta=document.createElement('div');meta.className='paper-meta';meta.textContent=openFileType==='law'?'PHILIPPINE LAW · STUDY FILE':'CASE DIGEST · ORIGINAL REVIEWER WORDING';
 const h=document.createElement('h3');h.textContent=item.title||item.name;
 const citation=document.createElement('div');citation.className='paper-citation';citation.textContent=item.citation||'PROVISION REFERENCE';
 const stamp=document.createElement('div');stamp.className='paper-stamp';stamp.textContent=openFileType==='law'?'LAW FILE':'CASE FILE';
 doc.append(meta,h,citation,stamp);
 if(openFileType==='law'){
    const note=document.createElement('div');note.className='paper-law';note.textContent=item.text;doc.append(note);
 }else{
    const digest=document.createElement('div');digest.className='digest-document';
    for(const [field,title] of [['doctrine','DOCTRINE'],['facts','FACTS'],['issue','ISSUE'],['ruling','RULING / HELD'],['ratio','RATIO / REASONING']]){
      const line=document.createElement('div');line.className='digest-line'+(field==='facts'?' digest-facts':'');
      const label=document.createElement('strong');label.textContent=title;
      const content=document.createElement('div');content.className='digest-content';
      const para=document.createElement('p');para.className='digest-text';
      const note=field==='ratio'?'Not separately stated in the supplied reviewer.':'Not separately stated in the supplied reviewer.';
      para.textContent=item[field]||note;
      if(!item[field])para.classList.add('digest-not-stated');
      content.append(para);
      if(field==='facts' && Array.isArray(item.figures)){
        for(const figureInfo of item.figures){
          const figure=document.createElement('figure');figure.className='case-figure';
          const link=document.createElement('a');link.href=figureInfo.src;link.target='_blank';link.rel='noopener noreferrer';link.title='Open full-size original reviewer diagram';
          link.setAttribute('aria-label','Enlarge the original relationship diagram');
          link.addEventListener('click',e=>{e.preventDefault();openFigureZoom(figureInfo.src,figureInfo.alt||'Original diagram',figureInfo.caption||'Original reviewer diagram');});
          const img=document.createElement('img');img.src=figureInfo.src;img.alt=figureInfo.alt||'Original case relationship diagram';img.loading='lazy';
          link.append(img);figure.append(link);
          const caption=document.createElement('figcaption');caption.textContent=(figureInfo.caption||'Original reviewer diagram')+' · Tap to enlarge';
          figure.append(caption);content.append(figure);
        }
      }
      line.append(label,content);digest.append(line);
    }
    doc.append(digest);
 }
 const source=document.createElement('p');source.className='paper-source';source.textContent='SOURCE · '+(item.source||'Assigned reviewer');doc.append(source);
}
function openFigureZoom(src,alt,caption){
  let zoom=$('figureZoom');
  if(!zoom){
    zoom=document.createElement('div');zoom.id='figureZoom';zoom.className='figure-zoom hidden';
    zoom.setAttribute('role','dialog');zoom.setAttribute('aria-modal','true');zoom.setAttribute('aria-label','Enlarged reviewer diagram');
    const contents=document.createElement('div');contents.className='figure-zoom-sheet';
    const close=document.createElement('button');close.type='button';close.className='figure-zoom-close';close.textContent='✕ Close';
    close.addEventListener('click',()=>hide(zoom));
    const img=document.createElement('img');img.id='figureZoomImage';
    const text=document.createElement('p');text.id='figureZoomCaption';
    contents.append(close,img,text);zoom.append(contents);document.body.append(zoom);
    zoom.addEventListener('click',e=>{if(e.target===zoom)hide(zoom);});
  }
  $('figureZoomImage').src=src;$('figureZoomImage').alt=alt;
  $('figureZoomCaption').textContent=caption;
  show(zoom);zoom.querySelector('button').focus();
}
function closeReference(){hide($('fileOverlay'));}
function closeNav(){hide($('questDropdown'));$('navToggle').setAttribute('aria-expanded','false');}
function toggleNav(){const opening=$('questDropdown').classList.contains('hidden');$('questDropdown').classList.toggle('hidden',!opening);$('navToggle').setAttribute('aria-expanded',String(opening));}
function bindEvents(){
  $('signInMode').addEventListener('click',()=>setAuthMode('login'));
  $('registerMode').addEventListener('click',()=>setAuthMode('register'));
  $('authForm').addEventListener('submit',handleAuth);
  $('logoutButton').addEventListener('click',logout);
  document.querySelectorAll('[data-course]').forEach(btn=>btn.addEventListener('click',()=>startWorld(btn.dataset.course)));
  $('backToDashboard').addEventListener('click',()=>{state.course=null;state.chapterId=null;state.travelTo=null;closeNav();displayScreen('dashboard');updateDashboard();});
  $('interactButton').addEventListener('click',interact);
  $('lawLibraryButton').addEventListener('click',()=>openReference('law'));
  $('caseLibraryButton').addEventListener('click',()=>openReference('case'));
  $('checkpointLaw').addEventListener('click',()=>openReference('law',window.LEXQUEST_GUIDES[state.activeCheckpoint?.id]?.lawIds?.[0]));
  $('checkpointCase').addEventListener('click',()=>openReference('case',window.LEXQUEST_GUIDES[state.activeCheckpoint?.id]?.caseIds?.[0]));
  $('closeFile').addEventListener('click',closeReference);
  $('fileOverlay').addEventListener('click',e=>{if(e.target===$('fileOverlay'))closeReference();});
  $('challengeToggle').addEventListener('click',()=>{
    const hidden=$('challengePanel').classList.toggle('hidden');
    $('challengeToggle').setAttribute('aria-expanded',String(!hidden));
    $('challengeToggle').textContent=hidden?'✦ TRY THE MINI-GAME  ▾':'✦ MINI-GAME OPEN  ▴';
    if(!hidden)$('challengePanel').scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  $('navToggle').addEventListener('click',toggleNav);$('navClose').addEventListener('click',closeNav);
  $('closeLesson').addEventListener('click',closeLesson);$('closeLessonBottom').addEventListener('click',closeLesson);
  $('lessonModal').addEventListener('click',e=>{if(e.target===$('lessonModal'))closeLesson();});
  startHold($('goLeft'),'left');startHold($('goRight'),'right');startHold($('goUp'),'up');startHold($('goDown'),'down');
  $('nextChapter').addEventListener('click',goNextChapter);
  document.addEventListener('pointerdown',e=>{if(!$('questDropdown').contains(e.target)&&!$('navToggle').contains(e.target))closeNav();});
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!$('fileOverlay').classList.contains('hidden')){closeReference();return;}
    if(e.key==='Escape'&&!$('questDropdown').classList.contains('hidden')){closeNav();return;}
    if(e.key==='Escape'&&!$('lessonModal').classList.contains('hidden')){closeLesson();return;}
    if($('gameScreen').classList.contains('hidden')||!$('lessonModal').classList.contains('hidden')||!$('fileOverlay').classList.contains('hidden')||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    const directions={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down'};
    if(directions[e.key]){e.preventDefault();state.travelTo=null;state.keys[directions[e.key]]=true;}
    if([' ','Enter','e','E'].includes(e.key)&&document.activeElement?.tagName!=='BUTTON'){e.preventDefault();interact();}
  });
  window.addEventListener('keyup',e=>{
    const directions={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down'};
    if(directions[e.key])state.keys[directions[e.key]]=false;
  });
  window.addEventListener('blur',()=>{state.keys={left:false,right:false,up:false,down:false};});
  canvas.addEventListener('click',e=>{
    if(!state.course)return;
    const r=canvas.getBoundingClientRect(),cam=cameraOffset();
    const x=(e.clientX-r.left)*(WIDTH/r.width)+cam.x,y=(e.clientY-r.top)*(HEIGHT/r.height)+cam.y;
    const cps=activeCheckpoints(),cp=cps.reduce((a,b)=>Math.hypot(b.x-x,b.y-y)<Math.hypot(a.x-x,a.y-y)?b:a);
    if(Math.hypot(cp.x-x,cp.y-y)<95){state.travelTo={x:cp.x,y:cp.y,id:cp.id};notify('Travelling to '+cp.title);}
    else if(Math.hypot(x-state.playerX,y-state.playerY)<80)interact();
  });
  window.addEventListener('resize',resizeCanvas);
  // Optional gamepad: both axes for four-direction walking.
  let gpButton=false;
  setInterval(()=>{
    if($('gameScreen').classList.contains('hidden')||!$('lessonModal').classList.contains('hidden')||!$('fileOverlay').classList.contains('hidden'))return;
    const pad=[...(navigator.getGamepads?.()||[])].find(Boolean);if(!pad)return;
    const ax=pad.axes?.[0]||0,ay=pad.axes?.[1]||0;
    state.keys.left=ax<-.35;state.keys.right=ax>.35;
    state.keys.up=ay<-.35;state.keys.down=ay>.35;
    if(Math.abs(ax)>.35||Math.abs(ay)>.35)state.travelTo=null;
    const pressed=!!(pad.buttons?.[0]?.pressed||pad.buttons?.[1]?.pressed);
    if(pressed&&!gpButton)interact();gpButton=pressed;
  },80);
}
bindEvents();
state.cloudReady=initializeCloud();
requestAnimationFrame(tick);
