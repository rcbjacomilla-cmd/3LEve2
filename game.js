const $ = (id) => document.getElementById(id);
const WORLDS = window.LEXQUEST_WORLDS;
const ALL_CHECKPOINTS = Object.values(WORLDS).flatMap(w => w.checkpoints);
const state = { mode: 'login', backend: 'local', cloud: null, user: null, progress: {}, course: null,
  playerX: 50, walk: 0, keys: {left:false,right:false}, travelTo: null, activeCheckpoint: null,
  lastFrame: 0, particles: [], shareProgress: false, cloudReady: null };
const canvas = $('worldCanvas');
const ctx = canvas.getContext('2d');
const WORLD_WIDTH = 1120;
let WIDTH = canvas.width;
const HEIGHT = canvas.height;
function resizeCanvas(){
  // On a phone, show a close-up following the moving character, not a miniature 1120px map.
  WIDTH = window.innerWidth <= 700 ? 560 : WORLD_WIDTH;
  if(canvas.width !== WIDTH) canvas.width = WIDTH;
}
function cameraOffset(){ return Math.max(0,Math.min(WORLD_WIDTH-WIDTH,state.playerX-WIDTH*.50)); }
resizeCanvas();
let toastTimeout;

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function displayScreen(which){ ['authScreen','dashboard','gameScreen'].forEach(n => $(n).classList.toggle('hidden',n!==which)); }
function setText(id,value){ $(id).textContent = String(value); }
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
  state.user=null;state.progress={};state.course=null;state.keys={left:false,right:false};state.activeCheckpoint=null;
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
  if(state.backend==='cloud'){
    setText('classStatus','Class progress is shared only by classmates who opt in.');
    show($('shareArea'));$('shareProgress').checked=state.shareProgress;
    loadLeaderboard();
  }else{
    hide($('shareArea'));setText('classStatus','Local preview: name + PIN and progress exist only in this browser. Set up Supabase for cross-device sync.');
    $('leaderboard').replaceChildren();
  }
}
async function loadLeaderboard(){
  if(state.backend!=='cloud')return;
  const board=$('leaderboard');board.textContent='Loading class progress…';
  try{
    const records=await rpc('get_class_progress',{p_token:localStorage.getItem('lexquest_cloud_session')});
    board.replaceChildren();
    if(!records.length){board.textContent='Nobody has opted in yet.';return;}
    for(const p of records){
      const row=document.createElement('div');row.className='leaderboard-row';
      const name=document.createElement('span'),num=document.createElement('strong');
      name.textContent=p.name;num.textContent=`${p.completed}/${ALL_CHECKPOINTS.length} ✓`;
      row.append(name,num);board.append(row);
    }
  }catch(err){board.textContent='Class progress is unavailable.';console.error(err);}
}
async function toggleSharing(on){
  if(state.backend!=='cloud'||!state.user)return;
  try{await rpc('set_sharing',{p_token:localStorage.getItem('lexquest_cloud_session'),p_share:on});state.shareProgress=on;loadLeaderboard();}
  catch(err){$('shareProgress').checked=!on;notify('Could not update sharing: '+err.message);}
}

function startWorld(course){
  state.course=course;state.playerX=70;state.travelTo=null;state.walk=0;state.particles=[];
  const w=WORLDS[course];setText('worldTitle',w.title);setText('worldSmall',course==='succession'?'WORLD 01 · SUCCESSION':'WORLD 02 · LABOR LAW');
  setText('journalTitle',course==='labor'?"Maya's checkpoints":"Lia's estate chapters");
  updateQuestUI(); displayScreen('gameScreen'); drawWorld(performance.now());
}
function updateQuestUI(){
  const course=state.course;if(!course)return;
  const w=WORLDS[course],journal=$('questItems');journal.replaceChildren();
  for(const cp of w.checkpoints){
    const done=state.progress[itemKey(course,cp.id)]?.completed;
    const btn=document.createElement('button');btn.className='quest-item'+(done?' solved':'');btn.type='button';
    const dot=document.createElement('span');dot.className='quest-dot';dot.textContent=done?'✓':'✦';
    const wrap=document.createElement('span');const strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=cp.title;small.textContent=done?'Completed · revisit':'Go to checkpoint';wrap.append(strong,small);btn.append(dot,wrap);
    btn.addEventListener('click',()=>{state.travelTo=cp.x;notify('Travelling to '+cp.title+'…');});journal.append(btn);
  }
  setText('worldProgress',`${solvedCount(course)}/${w.checkpoints.length}`);
  setText('worldStars',solvedCount(course)*25);
  setText('journalPercent',progressRate(course)+'%');$('journalMeter').style.width=progressRate(course)+'%';
}
function nearestCheckpoint(){if(!state.course)return null;return WORLDS[state.course].checkpoints.reduce((a,b)=>Math.abs(b.x-state.playerX)<Math.abs(a.x-state.playerX)?b:a);}
function interact(){if(!state.course||!$('lessonModal').classList.contains('hidden'))return;const cp=nearestCheckpoint();if(Math.abs(cp.x-state.playerX)<105)openLesson(cp);else notify('Walk closer to a glowing checkpoint (or choose it in the journal).');}
function openLesson(cp){
  state.activeCheckpoint=cp;state.travelTo=null;
  const arr=WORLDS[state.course].checkpoints;
  setText('lessonNumber',`${WORLDS[state.course].short.toUpperCase()} · CHECKPOINT ${arr.indexOf(cp)+1} OF ${arr.length}`);
  setText('lessonTitle',cp.title);setText('challengeTitle',cp.game.title);setText('challengePrompt',cp.game.prompt);
  const body=$('lessonBody');body.replaceChildren();
  const story=document.createElement('div');story.className='story-card';story.textContent=cp.story;
  const summary=document.createElement('p');summary.className='summary-note';summary.textContent=cp.summary;
  const grid=document.createElement('div');grid.className='info-grid';
  const prov=document.createElement('div');prov.className='info-block';const ph=document.createElement('h4'),pp=document.createElement('p');ph.textContent='⚖ Relevant provisions';pp.textContent=cp.provision;prov.append(ph,pp);
  const cas=document.createElement('div');cas.className='info-block';const ch=document.createElement('h4'),cpname=document.createElement('p'),cpnote=document.createElement('p'),link=document.createElement('a');ch.textContent='📘 Case connection';cpname.textContent=cp.case;cpnote.textContent=cp.caseNote;cpnote.style.marginTop='7px';if(/^https?:\/\//.test(cp.source)){link.href=cp.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open source ↗';link.style.display='block';link.style.marginTop='9px';}
  else{link.textContent='Source: '+cp.source;link.removeAttribute('href');link.style.display='block';link.style.marginTop='9px';link.style.color='#d3bded';link.style.fontSize='12px';}
  cas.append(ch,cpname,cpnote,link);grid.append(prov,cas);
  body.append(story,summary,grid);
  $('challengeFeedback').textContent='';$('challengeFeedback').className='feedback';
  renderChallenge(cp);show($('lessonModal'));$('closeLesson').focus();
}
function setFeedback(message,success){$('challengeFeedback').textContent=message;$('challengeFeedback').className='feedback '+(success?'success':'error');}
async function winCheckpoint(cp){
  const prev=!!state.progress[itemKey(state.course,cp.id)]?.completed;
  if(!prev)await saveCompletion(state.course,cp.id);
  setFeedback((prev?'Already completed. ':'Checkpoint cleared! ✦ +25 study stars. ')+cp.game.explanation,true);
  setText('completionHint','✓ Completed · revisit whenever you like');
  if(!prev){for(let i=0;i<24;i++)state.particles.push({x:state.playerX+Math.random()*30-15,y:355,vx:(Math.random()-.5)*3,vy:-2-Math.random()*4,life:65,color:['#ffe5a0','#f7aecd','#acffe2'][i%3]});}
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
    if(done)setFeedback('Checkpoint already cleared. '+game.explanation,true);
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
    if(done)setFeedback('Checkpoint already cleared. '+game.explanation,true);
  }
}
function closeLesson(){hide($('lessonModal'));state.activeCheckpoint=null;}
function between(a,b,t){return a+(b-a)*t;}
function rect(x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);}
function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function textDraw(s,x,y,size=18,color='#fff',align='center',weight='700'){
  ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui, sans-serif`;ctx.fillText(s,x,y);
}
function drawBackdrop(t){
  const con=state.course==='succession';const sky=ctx.createLinearGradient(0,0,0,HEIGHT);
  if(con){sky.addColorStop(0,'#4b518e');sky.addColorStop(.6,'#a185ba');sky.addColorStop(1,'#e0b5bd');}
  else{sky.addColorStop(0,'#2a617e');sky.addColorStop(.5,'#70b6b6');sky.addColorStop(1,'#f2bd9b');}
  rect(0,0,WORLD_WIDTH,HEIGHT,sky);
  ellipse(con?770:865,118,67,67,con?'#fbe0bc':'#ffeab1');
  // Parallax mountain silhouettes
  ctx.fillStyle=con?'#6f6898':'#5a8d93';ctx.beginPath();ctx.moveTo(0,365);
  for(let x=0;x<=WORLD_WIDTH;x+=55)ctx.lineTo(x,300+Math.sin(x*.013)*30+Math.sin(x*.027)*19);
  ctx.lineTo(WORLD_WIDTH,450);ctx.lineTo(0,450);ctx.fill();
  if(con){
    // Court district: columns and pediments
    [75,360,660,930].forEach((x,i)=>{
      rect(x-42,260,133,174,'#574e85');rect(x-48,248,145,17,'#d9bfd1');rect(x-48,425,145,18,'#433a71');
      for(let c=0;c<3;c++){rect(x-23+c*40,273,22,153,'#cbbad3');rect(x-27+c*40,273,30,10,'#f1d7dd');}
      ctx.fillStyle='#ddd0df';ctx.beginPath();ctx.moveTo(x-55,245);ctx.lineTo(x+25,199);ctx.lineTo(x+104,245);ctx.fill();
    });
  }else{
    for(let x=0;x<WORLD_WIDTH;x+=210){rect(x+25,265,83,166,'#477787');rect(x+40,248,56,19,'#fae4b2');rect(x+45,300,17,25,'#a7d0c7');rect(x+72,300,17,25,'#a7d0c7');}
    ctx.fillStyle='#438ca1';ctx.beginPath();ctx.moveTo(0,443);for(let x=0;x<=WORLD_WIDTH;x+=20)ctx.lineTo(x,440+Math.sin(t/500+x/38)*4);ctx.lineTo(WORLD_WIDTH,520);ctx.lineTo(0,520);ctx.fill();
    for(let x=0;x<WORLD_WIDTH;x+=115)rect(x+10,415,24,28,'#6f618a');
  }
  rect(0,450,WORLD_WIDTH,20,con?'#f4d0b8':'#ddb99c');
  rect(0,469,WORLD_WIDTH,151,con?'#3a2e66':'#264b67');
  for(let x=0;x<WORLD_WIDTH;x+=62){rect(x,474,54,15,con?'#514078':'#355a77');rect(x+4,498,54,18,con?'#33275c':'#203f57');}
}
function drawObject(cp,i,t){
  const y=415,x=cp.x,con=state.course==='succession',done=!!state.progress[itemKey(state.course,cp.id)]?.completed;
  ctx.save();
  // pool of light and collectible symbol
  ellipse(x,448,61,12,done?'#7dedb66b':'#fff3ad61');
  const bob=Math.sin(t*.0028+i)*7;
  if(cp.object==='gateway'||cp.object==='gate'){
    rect(x-51,y-125,21,126,con?'#e4cbdb':'#ddd39e');rect(x+31,y-125,21,126,con?'#e4cbdb':'#ddd39e');rect(x-59,y-136,118,17,'#7e638d');
    ellipse(x,y-91,32,32,'#382756');textDraw(cp.object==='gateway'?'⚖':'3+',x,y-92,24,'#ffdcab');
  }else if(cp.object==='scroll'){
    rect(x-38,y-100,78,94,'#f1d7b5');rect(x-47,y-113,18,120,'#a66a84');rect(x+32,y-113,18,120,'#a66a84');
    [-76,-55,-34].forEach(p=>rect(x-22,y+p,44,4,'#aa7895'));
  }else if(cp.object==='building'||cp.object==='office'){
    rect(x-59,y-108,119,112,con?'#c5add4':'#e3bf9d');rect(x-66,y-116,132,18,con?'#6d5187':'#487484');
    rect(x-18,y-58,38,63,'#5a446f');textDraw('§',x,y-80,33,'#fff1b5');
  }else if(cp.object==='tower'){
    rect(x-44,y-146,88,153,'#bda7cc');rect(x-59,y-158,118,24,'#705486');rect(x-22,y-106,45,54,'#594174');textDraw('!',x,y-79,32,'#ffe0aa');
  }else if(cp.object==='bridge'){
    rect(x-67,y-48,134,45,'#a26e83');for(let j=-1;j<=1;j++)rect(x+j*41-6,y-80,14,78,'#67487c');
    ctx.strokeStyle='#f4c9a8';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-64,y-66);ctx.quadraticCurveTo(x,y-9,x+64,y-66);ctx.stroke();
  }else if(cp.object==='ship'){
    ctx.fillStyle='#efe8c8';ctx.beginPath();ctx.moveTo(x-65,y-47);ctx.lineTo(x+68,y-47);ctx.lineTo(x+38,y-5);ctx.lineTo(x-41,y-5);ctx.fill();
    rect(x-4,y-117,7,69,'#765572');ctx.fillStyle='#ffdfb5';ctx.beginPath();ctx.moveTo(x+1,y-111);ctx.lineTo(x+1,y-56);ctx.lineTo(x+46,y-56);ctx.fill();
  }
  ellipse(x,y-164+bob,24,24,done?'#72dfba':'#ffe29b');
  textDraw(done?'✓':'✦',x,y-165+bob,24,'#372553');
  const title=cp.title.length>23?cp.title.slice(0,21)+'…':cp.title;
  const labelY=y-(i%2===0?208:243);
  ctx.fillStyle='#150c33dd';ctx.beginPath();ctx.roundRect(x-100,labelY,200,30,11);ctx.fill();
  textDraw(title,x,labelY+16,15,'#fff8e9');
  ctx.restore();
}
function drawCharacter(t){
  const x=state.playerX,y=435+Math.sin(state.walk*.22)*Math.min(3,state.walk>0?3:0);
  ellipse(x,y+14,27,7,'#1b123570');
  const walking=Math.abs(state.keys.left||state.keys.right)||state.travelTo!==null;
  const step=walking?Math.sin(state.walk)*7:0;
  ctx.save();ctx.translate(x,y);if(state.keys.left||state.travelTo!==null&&state.travelTo<x)ctx.scale(-1,1);
  rect(-14,-21+step,11,25,'#d8a98c');rect(4,-21-step,11,25,'#d8a98c');
  rect(-23,-52,46,37, state.course==='labor'?'#c37eb5':'#86b6d1');
  ctx.fillStyle='#543871';ctx.beginPath();ctx.moveTo(-23,-23);ctx.lineTo(23,-23);ctx.lineTo(28,-13);ctx.lineTo(-28,-13);ctx.fill();
  ellipse(0,-76,24,27,'#322541');ellipse(0,-70,20,22,'#e7aa8d');
  rect(-21,-99,41,12,'#302442');rect(-24,-88,13,27,'#322541');
  rect(-9,-70,5,5,'#392742');rect(8,-70,5,5,'#392742');
  ctx.restore();
  const closest=nearestCheckpoint();if(closest&&Math.abs(closest.x-x)<105){
    ctx.fillStyle='#26183bd9';ctx.beginPath();ctx.roundRect(x-75,y-133,150,29,13);ctx.fill();textDraw(window.innerWidth<=700?'TAP ✦ INTERACT':'SPACE · INTERACT',x,y-119,13,'#ffe29b');
  }
}
function drawParticles(){
  state.particles=state.particles.filter(p=>p.life>0);
  for(const p of state.particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.11;p.life--;rect(p.x,p.y,8,8,p.color);}
}
function drawWorld(t){
  if(!state.course)return;
  ctx.clearRect(0,0,WIDTH,HEIGHT);ctx.save();ctx.translate(-cameraOffset(),0);drawBackdrop(t);
  WORLDS[state.course].checkpoints.forEach((c,i)=>drawObject(c,i,t));
  drawCharacter(t);drawParticles();ctx.restore();
  if(totalSolved()===ALL_CHECKPOINTS.length){textDraw('✦ MASTER OF BOTH WORLDS ✦',WIDTH/2,55,24,'#ffecab');}
}
function tick(t){
  const dt=Math.min(40,(t-state.lastFrame)||16);state.lastFrame=t;
  if(state.course&&!$('gameScreen').classList.contains('hidden')&&$('lessonModal').classList.contains('hidden')){
    let delta=0;
    if(state.keys.left)delta=-1;else if(state.keys.right)delta=1;
    if(state.travelTo!==null){const distance=state.travelTo-state.playerX;if(Math.abs(distance)<7){state.playerX=state.travelTo;state.travelTo=null;const cp=nearestCheckpoint();openLesson(cp);}else delta=Math.sign(distance);}
    if(delta){state.playerX=Math.max(35,Math.min(WORLD_WIDTH-35,state.playerX+delta*dt*.30));state.walk+=dt*.025;}
  }
  if(state.course&&!$('gameScreen').classList.contains('hidden'))drawWorld(t);
  requestAnimationFrame(tick);
}
function startHold(btn,key){
  const stop=()=>state.keys[key]=false;
  btn.addEventListener('pointerdown',e=>{e.preventDefault();state.travelTo=null;state.keys[key]=true;btn.setPointerCapture(e.pointerId);});
  for(const evt of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(evt,stop);
}
function bindEvents(){
  $('signInMode').addEventListener('click',()=>setAuthMode('login'));
  $('registerMode').addEventListener('click',()=>setAuthMode('register'));
  $('authForm').addEventListener('submit',handleAuth);
  $('logoutButton').addEventListener('click',logout);
  document.querySelectorAll('[data-course]').forEach(btn=>btn.addEventListener('click',()=>startWorld(btn.dataset.course)));
  $('backToDashboard').addEventListener('click',()=>{state.course=null;state.travelTo=null;displayScreen('dashboard');updateDashboard();});
  $('interactButton').addEventListener('click',interact);
  $('closeLesson').addEventListener('click',closeLesson);$('closeLessonBottom').addEventListener('click',closeLesson);
  $('lessonModal').addEventListener('click',e=>{if(e.target===$('lessonModal'))closeLesson();});
  $('shareProgress').addEventListener('change',e=>toggleSharing(e.target.checked));
  startHold($('goLeft'),'left');startHold($('goRight'),'right');
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!$('lessonModal').classList.contains('hidden')){closeLesson();return;}
    if($('gameScreen').classList.contains('hidden')||!$('lessonModal').classList.contains('hidden')||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(['ArrowLeft','a','A'].includes(e.key)){e.preventDefault();state.travelTo=null;state.keys.left=true;}
    if(['ArrowRight','d','D'].includes(e.key)){e.preventDefault();state.travelTo=null;state.keys.right=true;}
    if([' ','Enter'].includes(e.key)&&document.activeElement?.tagName!=='BUTTON'){e.preventDefault();interact();}
  });
  window.addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))state.keys.left=false;if(['ArrowRight','d','D'].includes(e.key))state.keys.right=false;});
  window.addEventListener('blur',()=>{state.keys.left=false;state.keys.right=false;});
  canvas.addEventListener('click',e=>{
    if(!state.course)return;const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*(WIDTH/r.width)+cameraOffset();
    const cp=WORLDS[state.course].checkpoints.reduce((a,b)=>Math.abs(b.x-x)<Math.abs(a.x-x)?b:a);
    if(Math.abs(cp.x-x)<90){state.travelTo=cp.x;}else if(Math.abs(x-state.playerX)<75)interact();
  });
  window.addEventListener('resize',resizeCanvas);
  // Optional Switch/USB gamepad support. Do not override an active keyboard press.
  let gpButton=false;
  setInterval(()=>{
    if($('gameScreen').classList.contains('hidden')||!$('lessonModal').classList.contains('hidden'))return;
    const pad=[...(navigator.getGamepads?.()||[])].find(Boolean);if(!pad)return;
    const axis=pad.axes?.[0]||0;
    if(Math.abs(axis)>.35){state.keys[axis<0?'left':'right']=true;state.keys[axis<0?'right':'left']=false;state.travelTo=null;}
    else if(!document.activeElement?.matches('button')){state.keys.left=false;state.keys.right=false;}
    const pressed=!!(pad.buttons?.[0]?.pressed||pad.buttons?.[1]?.pressed);if(pressed&&!gpButton)interact();gpButton=pressed;
  },80);
}
bindEvents();
state.cloudReady=initializeCloud();
requestAnimationFrame(tick);
