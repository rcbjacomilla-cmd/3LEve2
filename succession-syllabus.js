/* 3L EVE2 · Succession reviewer-led curriculum
 * Companion to chapters.js: keeps all previous checkpoint IDs when repurposing
 * their existing subjects. Every unit comes from the uploaded
 * [Draft] SUCCESSION Block Notes-3.pdf (pp. 1–17).
 * This file loads AFTER chapters.js and BEFORE game.js.
 * To add a new lesson later: add one checkpoint record below and its id
 * to a unit.checkpoints, or add another unit with its own list.
 */
(()=>{
const source='[Draft] SUCCESSION Block Notes-3.pdf';
const units=[
 {id:'su-foundations',title:'LEGITIME',subtitle:'Legitime · System · Nature · “Compulsion”',article:'ART. 886',pages:'pp. 1 & 18',ids:['su-legitime','su-system','su-nature','su-compulsion']},
 {id:'su-classes',title:'COMPULSORY HEIRS',subtitle:'Primary · Secondary · Concurring · Heir classifications',article:'ART. 887',pages:'pp. 1–2 & 18',ids:['su-heirs','su-legit-children','su-legit-descendants','su-legit-parents','su-surviving-spouse','su-illegit-children','su-illegit-descendants','su-illegit-parents']},
 {id:'su-combo-desc',title:'LEGITIME COMBINATIONS · DESCENDANTS & ASCENDANTS',subtitle:'Legitimate children only · legitimate parents / ascendants only',article:'ARTS. 888–890',pages:'pp. 2–3',ids:['su-descendants','su-ascendants','su-line-division']},
 {id:'su-combo-spouse',title:'LEGITIME COMBINATIONS · SURVIVING SPOUSE',subtitle:'Legitimate children & spouse · legitimate ascendants & spouse · illegitimate children & spouse',article:'ARTS. 892–894',pages:'p. 3',ids:['su-shares','su-multiple-lc-ss','su-parents-ss','su-ilc-ss']},
 {id:'su-combo-mixed',title:'LEGITIME COMBINATIONS · MIXED HEIRS',subtitle:'LC + ILC + SS · LC + ILC · LP + ILC · LP + ILC + SS · reduction of shares',article:'ARTS. 895–899',pages:'pp. 3–5',ids:['su-illegitimate','su-lc-ilc','su-lp-ilc','su-lp-ilc-ss','su-share-reduction']},
 {id:'su-combo-sole',title:'LEGITIME COMBINATIONS · SOLE HEIRS & REPRESENTATION',subtitle:'Spouse only · illegitimate children only · representation · illegitimate parents',article:'ARTS. 900–903',pages:'p. 5',ids:['su-spouse','su-ilc-only','su-ilc-representation','su-ilp-ss']},
 {id:'su-protect',title:'PROTECTION OF LEGITIMES',subtitle:'Prohibition · future legitime · completion · inofficious dispositions',article:'ARTS. 904–907',pages:'p. 6',ids:['su-protection','su-future-legitime','su-completion','su-inofficious']},
 {id:'su-compute',title:'DETERMINATION OF LEGITIME',subtitle:'Net hereditary estate · valuation of donations',article:'ART. 908',pages:'p. 6',ids:['su-computation','su-valuation']},
 {id:'su-reduce',title:'DONATIONS, REDUCTION & DEVISES',subtitle:'Imputation · order of reduction · usufruct · indivisible devise · auction / free portion',article:'ARTS. 909–914',pages:'p. 7',ids:['su-collation','su-reduction','su-usufruct','su-indivisible','su-auction']},
 {id:'su-disinherit-start',title:'DISINHERITANCE',subtitle:'Effect of disinheritance · requisites · burden of proof · ineffective disinheritance',article:'ARTS. 915–918',pages:'pp. 12–13',ids:['su-disinherit','su-requisites','su-burden','su-defective']},
 {id:'su-disinherit-grounds',title:'CAUSES FOR DISINHERITANCE',subtitle:'Descendants · parents and ascendants · surviving spouse',article:'ARTS. 919–921',pages:'pp. 13–15',ids:['su-grounds','su-parent-grounds','su-spouse-grounds']},
 {id:'su-disinherit-effects',title:'RECONCILIATION & REPRESENTATION',subtitle:'Effect of reconciliation · rights of disinherited heir’s descendants',article:'ARTS. 922–923',pages:'pp. 15–16',ids:['su-reconciliation','su-representation']}
];
const entries=[];
// Each term is [original reviewer heading / keyword, faithful study explanation, visual marker].
function add(id,title,article,page,terms,question,options,correct,opts={}){
 entries.push({id,title,article,page,terms,question,options,correct,...opts});
}
// SECTION 5: Legitime — reviewer pp. 1–7.
add('su-legitime','Legitime · Article 886','Arts. 886','1, 18',[
 ['LEGITIME','Legitime is that part of the testator’s property which he cannot dispose of because the law has reserved it for certain heirs, who are therefore called compulsory heirs.','§'],
 ['FREE OR DISPOSABLE PORTION','Portion left available for testamentary disposition after the legitimes have been covered.','✦'],
 ['COMPULSORY HEIRS','Heirs for whom the law reserves a portion. See the classification in Article 887.','♟']],
 'What portion does the law reserve for compulsory heirs?',['Legitime','The entire estate in every case','All property given to strangers'],0,{law:['art886','art887'],cases:['francisco'],figure:'table'});
add('su-system','System of Legitimes','Art. 886','1',[
 ['RESERVED PORTION','The Philippine successional system reserves a portion of the NET estate of the decedent in favor of heirs, groups of heirs, or combinations.','½'],
 ['FREE PORTION','The remainder remains available for testamentary disposition after all compulsory legitimes are covered.','⇢'],
 ['WHO GETS IT?','Compulsory heirs are identified by Article 887; their particular shares depend on which heirs concur.','♟']],
 'Which estate is the starting point in the reviewer’s System of Legitimes?',['The net estate','The gross estate without deducting debts','Every gift ever received by an heir'],0,{law:['art886','art887'],figure:'table'});
add('su-nature','Nature of Legitimes','Art. 886','1',[
 ['BY MANDATE OF LAW','The legitime is set aside by operation of law, not by the testator’s voluntary choice.','⚖'],
 ['GRATUITOUS DISPOSITIONS','The notes prohibit the testator from disposing of the protected portion by gratuitous title, whether inter vivos or mortis causa.','✕'],
 ['ONEROUS DISPOSITIONS','A genuine disposition for value is not prohibited: property sold is replaced by equivalent monetary consideration.','⇄']],
 'Why can a genuine sale for equivalent value differ from a donation?',['It merely exchanges values in the estate','A sale automatically destroys the buyer’s inheritance','The law forbids every lifetime sale'],0,{law:['art886','art908'],cases:['manongsong','locsin']});
add('su-compulsion','“Compulsion”','Art. 886','1',[
 ['WHO IS COMPELLED?','The compulsion is on the TESTATOR to preserve the legally reserved portion.','♜'],
 ['ARE HEIRS COMPELLED?','The heirs remain free to accept or reject the inheritance.','✓']],
 'Under the reviewer’s “Compulsion” heading, who is legally restricted?',['The testator','Every compulsory heir must accept','The probate clerk'],0,{law:['art886']});
add('su-heirs','Compulsory Heirs · Three Classes','Art. 887','1, 18',[
 ['PRIMARY','Legitimate children and descendants; preferred over and exclude secondary compulsory heirs.','Ⅰ'],
 ['SECONDARY','Legitimate parents / ascendants (in default of legitimate children / descendants); illegitimate parents have their distinct exclusion rule.','Ⅱ'],
 ['CONCURRING','Surviving spouse and illegitimate children / descendants can concur with primary or secondary heirs, subject to the reviewer’s qualifications.','Ⅲ']],
 'Which heir is classified as CONCURRING under the reviewer’s table?',['The surviving spouse','A remote legitimate grandparent over a surviving legitimate child','A stranger'],0,{law:['art887'],cases:['rosales','baritua'],figure:'table'});
add('su-legit-children','Legitimate Children · Family Code','Art. 887; FC Arts. 54, 164, 179','1',[
 ['CHILDREN BORN IN MARRIAGE','Family Code Art. 164: children conceived or born during the marriage of the parents are legitimate.','♡'],
 ['LEGITIMATED CHILDREN','Family Code Art. 179: legitimated children enjoy the same rights as legitimate children.','✓'],
 ['ADOPTED CHILDREN','R.A. 11642, Secs. 41 and 43 as noted: adoptee is treated as the adopter’s legitimate child for purposes of succession, including reciprocal succession rights.','⚖']],
 'Which child enjoys the succession rights of a legitimate child of the adopter under the notes?',['An adoptee under the relevant adoption law','A neighbor’s child without adoption','Every unrelated child'],0,{law:['art887'],cases:['lim','bartolome'],figure:'adoption'});
add('su-legit-descendants','Legitimate Descendants','Art. 887','1–2',[
 ['NEARER EXCLUDES REMOTE','Qualified children exclude grandchildren, and so on, as the general rule.','⇢'],
 ['EXCEPTION · REPRESENTATION','Grandchildren may inherit by representation when the statutory conditions are met.','↗'],
 ['DEGREES DOWNWARD','The reviewer notes no limit in the descending line when heirs succeed in their own right or by proper representation.','∞']],
 'Who ordinarily excludes a grandchild in the same descending line?',['A qualified nearer child','An unrelated neighbor','A surviving cousin by mere proximity'],0,{law:['art887'],cases:['rosales']});
add('su-legit-parents','Legitimate Parents & Ascendants','Art. 887','1–2',[
 ['SECONDARY HEIRS','Legitimate parents / ascendants succeed only in default of primary legitimate descendants.','Ⅱ'],
 ['ASCENDANTS','Only in default of parents; the nearer ascendant excludes more remote ascendants.','↑'],
 ['NO ASCENDING REPRESENTATION','The reviewer applies nearest-degree rules without representation in the ascending line.','✕']],
 'Can legitimate parents claim their legitime when a legitimate child of the decedent survives?',['No, the legitimate child excludes them','Yes, all three always divide equally','Yes, grandparents always prevail'],0,{law:['art887','art889','art890'],cases:['baritua']});
add('su-surviving-spouse','Surviving Spouse · Qualification','Art. 887; FC Art. 63','2',[
 ['WHO IS THE SPOUSE?','The spouse of the DECEDENT, not the widow / widower of the decedent’s predeceased child.','♡'],
 ['VALID OR VOIDABLE MARRIAGE','For a voidable marriage there must be no final decree of annulment at the death of the decedent. Mere estrangement does not disqualify.','⚖'],
 ['LEGAL SEPARATION','The offending spouse is disqualified; the innocent spouse remains qualified. Death while the proceeding is pending terminates that proceeding, under the notes.','§']],
 'Who is the compulsory surviving spouse in the estate?',['The decedent’s own surviving husband or wife','The widow of the decedent’s predeceased son','Any person residing with the family'],0,{law:['art887','art892'],cases:['rosales']});
add('su-illegit-children','Illegitimate Children','Art. 887; FC; Art. 895','2',[
 ['FAMILY CODE','The Family Code abolished the old distinction between natural and spurious children; the notes treat them as equal in legitimary portion under the current system.','='],
 ['DATE OF DEATH','For deaths before the Family Code took effect on August 3, 1988, the older distinctions may remain applicable to vested succession rights.','⌛'],
 ['FILIATION','Article 887 requires that the filiation of illegitimate children be duly proved.','✓']],
 'Why should the date of death be checked for the former natural/spurious-child categories?',['Inheritance rights vest when succession opens','The Civil Code only applies after 2050','Old categories apply to every modern succession'],0,{law:['art887','art895'],cases:['rivera']});
add('su-illegit-descendants','Illegitimate Descendants','Art. 902','2, 5',[
 ['REPRESENTATION','The reviewer says an illegitimate child may be represented by legitimate AND illegitimate descendants.','↗'],
 ['CONTRAST','A legitimate child can be represented only by legitimate descendants (see the reviewer’s Art. 902 comparison).','⇄'],
 ['NEARER DEGREE','The descending line otherwise follows the general nearer-excludes-remote rule, subject to proper representation.','↓']],
 'Who may represent an illegitimate child under Article 902?',['Legitimate or illegitimate descendants','Only unrelated heirs','No descendant in any case'],0,{law:['art902']});
add('su-illegit-parents','Illegitimate Parents','Art. 887; Art. 903','2, 5',[
 ['ASCENDING LINE STOPS','The illegitimate ascending line includes only the parent; it does not extend to grandparents.','↑'],
 ['EXCLUDED BY CHILDREN','Illegitimate parents are excluded by legitimate OR illegitimate children / descendants.','✕'],
 ['DISTINGUISH LEGITIMATE PARENTS','Legitimate parents are excluded only by legitimate children / descendants.','⇄']],
 'Which heir excludes illegitimate parents as compulsory heirs?',['Either a legitimate or illegitimate child','Only a surviving grandparent','No one'],0,{law:['art887','art903']});
add('su-descendants','Legitimate Children ONLY','Art. 888','2',[
 ['COLLECTIVE SHARE · ½','Legitimate children / descendants collectively receive one-half of the hereditary estate as their legitime.','½'],
 ['EQUAL SHARES','Where several children succeed, the collective one-half is divided equally among them, irrespective of age, sex, or origin of marriage.','='],
 ['FREE PORTION','The remaining one-half is free, subject to the rights of other compulsory heirs if any.','✦']],
 'If two legitimate children alone succeed, what is their combined legitime?',['One-half of the estate','The entire estate','One-eighth of the estate'],0,{law:['art888'],figure:'children'});
add('su-ascendants','Legitimate Parents ONLY','Arts. 889–890','2',[
 ['COLLECTIVE SHARE · ½','Legitimate parents or qualifying legitimate ascendants collectively receive one-half of the hereditary estate.','½'],
 ['BOTH PARENTS','Their reserved one-half is divided equally between father and mother.','='],
 ['ONE PARENT','If one parent has died, the surviving parent takes the entire parent’s collective one-half share.','Ⅰ']],
 'Under Article 890, when both legitimate parents are qualified, how is their half-share divided?',['Equally','All to the father','All to the mother'],0,{law:['art889','art890'],figure:'parents'});
add('su-line-division','Rules in the Ascending Line','Art. 890','2–3',[
 ['NEAREST DEGREE','The nearer ascendant excludes more remote ascendants; no ascending representation.','↑'],
 ['DIVISION BY LINE','When more than one ascendant of the same nearest degree survives, the legitime is split between paternal and maternal lines.','↔'],
 ['EQUAL WITHIN EACH LINE','After assignment of each line’s share, equal division among ascendants in that line.','=']],
 'If equally near ascendants exist on both paternal and maternal sides, what division comes first?',['Between the two lines','By alphabetical surname','Entirely to the eldest'],0,{law:['art890'],figure:'parents'});
add('su-shares','ONE Legitimate Child + Surviving Spouse','Art. 892','3',[
 ['CHILD · ½','The single legitimate child is reserved one-half of the hereditary estate.','½'],
 ['SURVIVING SPOUSE · ¼','Under Article 892, the surviving spouse is reserved one-fourth.','¼'],
 ['FREE · ¼','Without any additional compulsory heirs, one-fourth remains disposable.','✦']],
 'An ₱800,000 estate leaves one legitimate child and a spouse. What are their legitimes?',['₱400,000 child; ₱200,000 spouse','₱200,000 child; ₱200,000 spouse','₱400,000 each'],0,{law:['art888','art892'],cases:['baritua'],figure:'onechildspouse'});
add('su-multiple-lc-ss','TWO OR MORE Legitimate Children + Spouse','Art. 892','3',[
 ['CHILDREN · ½ COLLECTIVE','The legitimate children divide the reserved one-half of the estate equally.','½'],
 ['SPOUSE · ONE CHILD’S SHARE','The spouse takes a portion EQUAL to the legitime of each legitimate child.','='],
 ['SOURCE OF SPOUSE SHARE','The spouse’s share is charged against the freely disposable portion.','⇢']],
 'With two legitimate children, how is the spouse’s legitime measured?',['Equal to one child’s legitime','Always one-half of the estate','Always one-eighth of the estate'],0,{law:['art892'],figure:'multiplechildspouse'});
add('su-parents-ss','Legitimate Parents + Surviving Spouse','Art. 893','3',[
 ['ASCENDANTS · ½','Legitimate parents / ascendants collectively receive one-half.','½'],
 ['SPOUSE · ¼','The surviving spouse receives one-fourth, from the free portion.','¼'],
 ['REAPPEARANCE OF PRIOR SPOUSE','The reviewer separately addresses Family Code Arts. 41–43 and bad faith of a spouse who contracted a later marriage.','⚖']],
 'When legitimate parents and the surviving spouse concur, what is the spouse’s legitime?',['One-fourth','One-half','One-eighth'],0,{law:['art889','art893'],figure:'parentsspouse'});
add('su-ilc-ss','Illegitimate Children + Surviving Spouse','Art. 894','3',[
 ['ILLEGITIMATE CHILDREN · ⅓','The children / descendants collectively receive one-third.','⅓'],
 ['SPOUSE · ⅓','The spouse receives another one-third.','⅓'],
 ['FREE · ⅓','The remaining third is at the free disposal of the testator.','✦']],
 'If only illegitimate children and the spouse survive, what is the surviving spouse’s legitime under Art. 894?',['One-third','One-half','One-eighth'],0,{law:['art894'],figure:'ilcss'});
add('su-illegitimate','Legitimate + Illegitimate Children + Spouse','Art. 895 (read with Art. 892)','3–4',[
 ['LEGITIMATE CHILDREN · ½','The legitimate children collectively receive one-half.','½'],
 ['SURVIVING SPOUSE','With multiple legitimate children, the spouse receives the portion of one legitimate child; with one, the Art. 892 one-fourth rule applies.','♡'],
 ['ILLEGITIMATE CHILDREN','Each has a legitime in relation to the legitimate child’s share under the reviewer’s Family Code discussion, subject to free-portion availability and priority of the spouse’s legitime.','⇄']],
 'If shares cannot all fit in the disposable portion, which heir group’s shares may be reduced pro rata under the notes?',['Illegitimate children','Legitimate children','Surviving spouse'],0,{law:['art895','art892'],cases:['rivera'],figure:'mixed'});
add('su-lc-ilc','Legitimate Children + Illegitimate Children','Art. 895','4',[
 ['LEGITIMATE CHILDREN · ½','The legitimate children share one-half of the estate collectively.','½'],
 ['ILLEGITIMATE CHILDREN','The reviewer’s diagram states each illegitimate child receives one-half of one legitimate child’s share, subject to legal limits.','⇄'],
 ['REDUCTION','Where necessary, the illegitimate children’s shares are proportionately reduced to fit the disposable portion.','↘']],
 'Compared with the share of one legitimate child, what share is used for each illegitimate child in the reviewer’s Family Code illustration?',['One-half','Two times','Exactly the entire estate'],0,{law:['art895'],figure:'mixed'});
add('su-lp-ilc','Legitimate Parents + Illegitimate Children','Art. 896','4',[
 ['PARENTS · ½','Legitimate parents / ascendants collectively receive one-half.','½'],
 ['ILLEGITIMATE CHILDREN · ¼','Illegitimate children collectively receive one-fourth from the disposable portion.','¼'],
 ['MULTIPLE ASCENDANTS','Divide the legitimate parents / ascendants’ share according to Arts. 889–890.','↑']],
 'What collective legitime goes to illegitimate children concurring with legitimate parents under Art. 896?',['One-fourth','One-half','One-eighth'],0,{law:['art896','art889','art890'],figure:'lpilc'});
add('su-lp-ilc-ss','Legitimate Parents + ILC + Surviving Spouse','Art. 899','4–5',[
 ['PARENTS · ½','The legitimate parents collectively receive one-half.','½'],
 ['ILLEGITIMATE CHILDREN · ¼','They receive one-fourth collectively, from the disposable portion.','¼'],
 ['SPOUSE · ⅛','The spouse receives one-eighth; the remaining one-eighth is disposable.','⅛']],
 'Under Article 899, what is the surviving spouse’s legitime with legitimate parents and illegitimate children?',['One-eighth','One-half','One-third'],0,{law:['art899'],figure:'lpilcss'});
add('su-share-reduction','Reduction of Shares','Art. 895','4',[
 ['LEGITIMATE CHILDREN','Their legitimes should NEVER be reduced, as primary and preferred compulsory heirs.','♛'],
 ['SURVIVING SPOUSE','Under the reviewer’s Art. 895 discussion, the spouse’s legitime should never be reduced.','♡'],
 ['ILLEGITIMATE CHILDREN','If combined claims exceed the allowable amount, their legitimes are reduced pro rata, without preference.','↘']],
 'When aggregate legitimes exceed the available estate, which shares may be reduced pro rata?',['Illegitimate children’s shares','Legitimate children’s shares','Surviving spouse’s share'],0,{law:['art895'],figure:'mixed'});
add('su-spouse','Surviving Spouse ONLY','Art. 900','5',[
 ['GENERAL RULE · ½','As sole compulsory heir, the surviving spouse receives one-half.','½'],
 ['ARTICULO MORTIS EXCEPTION · ⅓','If the specified deathbed-marriage conditions apply, the share is one-third.','⅓'],
 ['EXCEPTION TO THE EXCEPTION','If the parties had lived together as husband and wife for over five years, the share returns to the general one-half.','↩']],
 'Under the general rule for a spouse as sole compulsory heir, what share is reserved?',['One-half','One-eighth','None'],0,{law:['art900'],figure:'spouseonly'});
add('su-ilc-only','Illegitimate Children ONLY','Art. 901','5',[
 ['CHILDREN · ½ COLLECTIVE','If no other compulsory heirs survive, the illegitimate children collectively receive one-half.','½'],
 ['FREE · ½','The remaining one-half is at the free disposal of the testator.','✦'],
 ['DATE OF DEATH','The reviewer notes the Family Code changed how different illegitimate children share among themselves.','⌛']],
 'What is the collective legitime of illegitimate children who are the only compulsory heirs?',['One-half','One-third','Entire estate'],0,{law:['art901'],figure:'ilconly'});
add('su-ilc-representation','Right of Representation of ILC Descendants','Art. 902','5',[
 ['BOTH CATEGORIES','Legitimate AND illegitimate descendants may represent a predeceased illegitimate child.','↗'],
 ['ARTICLE 992 CONTRAST','The notes distinguish an illegitimate child of a predeceased legitimate child from descendants of an illegitimate child (Art. 902).','⇄']],
 'May an illegitimate descendant represent a predeceased illegitimate child?',['Yes, under Article 902','No, only legitimate descendants qualify','Only if the spouse consents'],0,{law:['art902']});
add('su-ilp-ss','Illegitimate Parents + Surviving Spouse','Art. 903','5',[
 ['ILLEGITIMATE PARENTS ONLY · ½','If no descendants, spouse or illegitimate children survive, qualified illegitimate parents collectively receive one-half.','½'],
 ['PARENTS + SPOUSE · ¼ EACH','With a surviving spouse, illegitimate parents and spouse each take one-fourth under Article 903.','¼'],
 ['CHILDREN EXCLUDE PARENTS','Any surviving legitimate or illegitimate child excludes the illegitimate parents.','✕']],
 'Under Art. 903, what are the shares of illegitimate parents and surviving spouse together?',['One-fourth each','One-half each','One-third each'],0,{law:['art903'],figure:'ilpss'});
add('su-protection','Article 904 · Protection of Legitime','Art. 904','6',[
 ['GR · NO DEPRIVATION','The testator may not deprive compulsory heirs of the legitime except in cases specified by law.','⚖'],
 ['NO ENCUMBRANCE','A burden, encumbrance, condition, or substitution generally cannot be imposed on the legitime.','✕'],
 ['EXCEPTIONS / RESTRICTIONS','Notes discuss disinheritance (Arts. 915–923), certain partition measures (Arts. 1080, 1083), family home (FC Art. 159), and reserva troncal (Art. 891).','§']],
 'Which generally may NOT be imposed upon an heir’s legitime?',['A condition or encumbrance','A proper legal accounting','Knowledge of the inheritance'],0,{law:['art904'],cases:['francisco']});
add('su-future-legitime','Article 905 · Future Legitime','Art. 905','6',[
 ['VOID RENUNCIATION','A compromise or renunciation of future legitime between predecessor and prospective compulsory heir is void.','✕'],
 ['EXPECTANCY','Before death, the prospective heir’s right is merely inchoate; see the reviewer’s discussion of Art. 777.','⌛'],
 ['DUTY TO COLLATE','What the prospective heir received under the void agreement is treated as an advance to be collated.','⇄']],
 'What is the effect of a compromise over future legitime between predecessor and prospective heir?',['Void','Always enforceable','Valid without probate'],0,{law:['art905'],cases:['francisco']});
add('su-completion','Article 906 · Completion of Legitime','Art. 906','6',[
 ['ACTIO AD SUPPLENDAM LEGITIMAM','A compulsory heir who received less than the legitime may demand that the shortfall be fully satisfied.','＋'],
 ['GRATUITOUS TRANSMISSION','The reviewer applies the right of completion to conveyances by gratuitous title.','§'],
 ['IMPUTATION EXCEPTIONS','Notes discuss Art. 1062 (donor excludes an advance from legitime) and Art. 1063 (testamentary dispositions to compulsory heirs).','⇢']],
 'A compulsory heir receives less than their legitime under a gratuitous disposition. What remedy is identified?',['Demand completion of legitime','Automatically lose all rights','Ignore the shortfall'],0,{law:['art906']});
add('su-inofficious','Article 907 · Inofficious Dispositions','Art. 907','6',[
 ['INOFFICIOUS / EXCESSIVE','Testamentary dispositions become reducible insofar as they impair or diminish compulsory legitimes.','!'],
 ['ON PETITION','Compulsory heirs may petition for the reduction of excessive institutions, legacies, or devises.','⇣'],
 ['READ WITH ART. 911','The notes direct readers to the order-of-reduction rules of Article 911.','↗']],
 'Under Art. 907, what may a compulsory heir petition to reduce?',['An excessive testamentary disposition impairing legitime','Any estate debt whatsoever','A valid gift that does not impair legitime'],0,{law:['art907','art911'],cases:['dolar']});
add('su-computation','Article 908 · Net Hereditary Estate','Art. 908','6',[
 ['GROSS LESS DEBTS','Gross estate at death minus legally deductible debts and charges = net estate.','−'],
 ['ADD DONATIONS','Net estate + donations subject to collation = basis for determining legitimes.','＋'],
 ['EXCLUDE WILL CHARGES','For this computation, debts and charges do not include legacies, devises or charges imposed in the will.','✕']],
 'What is the correct reviewer formula for the basis of legitime?',['(Gross estate − debts/charges) + collatable donations','Gross estate + testamentary legacies','Only cash held at death'],0,{law:['art908'],cases:['vizconde']});
add('su-valuation','Valuation of Donations','Arts. 908, 1071','6',[
 ['TIME OF DONATION','Lifetime donations are valued at the time the donation was made (reviewer citing Art. 1071).','⌛'],
 ['APPRECIATION / DEPRECIATION','Subsequent appreciation or depreciation accrues to or is borne by the donee.','↕'],
 ['CASE','The reviewer cites Vizconde v. CA in its valuation discussion.','⚖']],
 'Under the reviewer’s valuation discussion, which time is used to value collatable donations?',['When the donation was made','Always on the date of marriage','When the heir opens the website'],0,{law:['art908'],cases:['vizconde']});
add('su-collation','Arts. 909–910 · Imputation of Donations','Arts. 909–910','7',[
 ['TO COMPULSORY HEIRS','Inter vivos donations to compulsory heirs are generally charged as advances on their legitimes.','→'],
 ['TO STRANGERS','Donations to strangers are charged to the free disposable portion.','✦'],
 ['EXCEPTIONS','The reviewer discusses contrary express direction under Art. 1062 and repudiation of inheritance.','↩']],
 'Where are lifetime donations to strangers generally charged?',['Free disposable portion','Legitime of the closest child in all cases','Only to debts'],0,{law:['art909','art910'],cases:['vizconde']});
add('su-reduction','Article 911 · Order of Reduction','Arts. 911, 773','7',[
 ['FIRST','Reduce non-preferred testamentary dispositions (legacies / devises) pro rata.','Ⅰ'],
 ['SECOND','Reduce preferred legacies and devises after the non-preferred dispositions are exhausted.','Ⅱ'],
 ['THIRD','Reduce lifetime donations in inverse date order: most recent donations first.','Ⅲ']],
 'Under the reviewer’s inverse-order priority, which lifetime donation is reduced first?',['The most recent','The oldest','The smallest regardless of date'],0,{law:['art911'],cases:['dolar']});
add('su-usufruct','Usufruct · Life Annuity · Pension','Art. 911(3)','7',[
 ['VALUE EXCEEDS FREE PORTION','The notes treat a usufruct or life annuity whose capitalized value exceeds the disposable portion.','!'],
 ['HEIRS’ ELECTION','Compulsory heirs may comply with the testamentary terms OR deliver the full ownership of the disposable portion.','⇄']],
 'If an oversized usufruct impairs the legitimes, who has the statutory election?',['The compulsory heirs','Only the devisee','No one'],0,{law:['art911'],cases:['dolar']});
add('su-indivisible','Article 912 · Indivisible Devise','Art. 912','7',[
 ['REDUCTION LESS THAN ½','If less than half the value of an indivisible devised real property must be reduced, the devisee receives the property.','<½'],
 ['REDUCTION ½ OR MORE','If reduction reaches half or more, the property goes to the compulsory heirs.','≥½'],
 ['CASH REIMBURSEMENT','Either way, the parties must reimburse each other in money for the share not received physically.','₱']],
 'If an indivisible devise requires reduction equal to one-half its value, who generally receives the property?',['Compulsory heirs, with reimbursement','Always the devisee','The nearest neighbor'],0,{law:['art912'],cases:['dolar']});
add('su-auction','Article 913 · Auction; Article 914 · Free Portion','Arts. 913–914','7',[
 ['OTHER HEIRS MAY ELECT','If the heirs or devisees entitled under Art. 912 do not choose, other qualified heirs or devisees may exercise the right.','⇢'],
 ['PUBLIC AUCTION','If no one elects, an interested party may cause the property to be sold at public auction.','⚖'],
 ['FREE PORTION','Under Art. 914, the testator may devise and bequeath the remaining free portion as deemed fit.','✦']],
 'What follows if nobody exercises the available election under Article 913?',['Public auction at an interested party’s instance','Automatic forfeiture','Property goes to the state immediately'],0,{law:['art913','art914'],cases:['dolar']});
// SECTION 6: Disinheritance — reviewer pp. 12–16.
add('su-disinherit','Disinheritance · Article 915','Art. 915','12',[
 ['ONLY A COMPULSORY HEIR','Disinheritance can remove the legitime only of a compulsory heir; merely declining inheritance is different.','⚖'],
 ['EXCLUSIVE LEGAL CAUSES','Only causes listed in the Civil Code qualify, even if the testator considers another grievance more serious.','§'],
 ['TOTAL EXCLUSION','The reviewer lists loss of legitime, possible intestate portion, and testamentary disposition from the testator’s prior will.','✕']],
 'Who can be disinherited in the technical sense of Article 915?',['A compulsory heir','Anyone to whom the testator owes money','An unrelated stranger with no reserved legitime'],0,{law:['art915'],cases:['seangio']});
add('su-requisites','Requisites · Article 916','Art. 916','12–13',[
 ['VALID WILL','Disinheritance must be made in a valid will that will be probated.','✎'],
 ['CAUSE STATED','An express legally recognized cause must be stated in the will or validly connected testamentary documents.','§'],
 ['TRUE · TOTAL · UNCONDITIONAL','The reviewer consolidates Balane, Jurado and Paras: true legal cause, proof if denied, unconditional, total, identified heir, and unrevolved will.','✓']],
 'Which document is required for an effective disinheritance?',['A valid will specifying the cause','A private verbal declaration alone','A newspaper advertisement'],0,{law:['art916','art917'],cases:['seangio']});
add('su-burden','Burden of Proof · Article 917','Art. 917','13',[
 ['CAUSE DENIED','If the disinherited heir denies the truth of the cause, the burden of proving it rests on the other heirs of the testator.','⚖'],
 ['NEVER PRESUMED','The reviewer notes the cause is not automatically assumed true from the testator’s assertion.','✕'],
 ['CONSEQUENCE','If the cause is not proved upon challenge, ineffective disinheritance follows under Art. 918.','⇢']],
 'Who must prove the disinheritance cause if the excluded heir denies it?',['Other heirs of the testator','Automatically the disinherited heir','The local recruitment agency'],0,{law:['art917','art918']});
add('su-defective','Ineffective Disinheritance · Article 918','Art. 918','13',[
 ['MISSING OR FALSE CAUSE','No stated cause, an unproved denied cause, or a cause outside the Code makes disinheritance ineffective.','✕'],
 ['PARTIAL ANNULMENT','Institution of heirs is annulled only insofar as it prejudices the disinherited person’s legitime.','⇣'],
 ['NOT PRETERITION','Preterition can annul an institution entirely; the reviewer distinguishes it from imperfect disinheritance.','⚖']],
 'Does ineffective disinheritance generally annul every legacy and devise in the will?',['No, they remain valid insofar as legitime is protected','Yes, without exception','It makes the will an inter vivos sale'],0,{law:['art918'],cases:['seangio']});
add('su-grounds','Grounds · Children & Descendants','Art. 919','13–14',[
 ['EIGHT EXCLUSIVE GROUNDS','Article 919 lists eight causes for legitimate and illegitimate descendants; they are strictly construed.','8'],
 ['PROOF VARIES','Some grounds require final conviction; others turn on unjustifiable failure to support, maltreatment, or a continuing dishonorable mode of living.','⚖'],
 ['MALTREATMENT','Review the intentionality and discernment discussion; Pecson v. Mediavillo is cited.','!']],
 'Under Art. 919, can a testator create a ninth ground because it seems morally worse?',['No, the statutory list is exclusive','Yes, any cause written in the will','Yes, if there are two witnesses'],0,{law:['art919'],cases:['pecson']});
add('su-parent-grounds','Grounds · Parents & Ascendants','Art. 920','14–15',[
 ['EIGHT GROUNDS','Article 920 specifies eight grounds including abandonment, loss of parental authority for specified causes, unjustifiable refusal of support, and attempt by one parent on the other’s life.','8'],
 ['ABANDONMENT','The reviewer cites Chua v. Cabangbang for a settled purpose to forgo parental responsibilities.','⚖'],
 ['LOSS OF PARENTAL AUTHORITY','The notes distinguish actual loss for specified causes from emancipation, adoption or majority.','✕']],
 'Which is mentioned as a special ground under Article 920?',['Abandonment by a parent','Disliking a child’s university','Living in a different barangay'],0,{law:['art920'],cases:['chua']});
add('su-spouse-grounds','Grounds · Surviving Spouse','Art. 921','15',[
 ['SIX EXCLUSIVE GROUNDS','Article 921 enumerates six causes for disinheriting a spouse.','6'],
 ['LEGAL SEPARATION','A spouse giving cause for legal separation is a statutory ground.','⚖'],
 ['REFUSAL OF SUPPORT','Unjustifiable refusal to support children or the other spouse is another listed cause.','✕']],
 'Which appears among the statutory grounds for disinheriting a spouse?',['Giving cause for legal separation','A single disagreement over dinner','Refusing to sign a school form'],0,{law:['art921'],cases:['javier']});
add('su-reconciliation','Reconciliation · Article 922','Art. 922','15–16',[
 ['EFFECT','Subsequent reconciliation extinguishes the right to disinherit and renders an earlier disinheritance ineffective.','♡'],
 ['BILATERAL','The reviewer says a unilateral pardon does nothing unless the offender accepts it.','⇄'],
 ['EXPRESS OR IMPLIED','No special form is required; reconciliation is a fact question, with examples tabulated in the notes.','✓']],
 'Does a unilateral pardon rejected by the offender constitute reconciliation under the reviewer?',['No','Yes, always','Only when written in the same will'],0,{law:['art922']});
add('su-representation','Representation of Disinherited Heir','Art. 923','16',[
 ['DESCENDANTS TAKE PLACE','Children and descendants of the disinherited child take that heir’s place to preserve the legitime.','↗'],
 ['NO PARENTAL USUFRUCT','The disinherited parent does not enjoy usufruct or administration of that legitime.','✕'],
 ['NO ASCENDING REPRESENTATION','A disinherited parent, ascendant or spouse is not represented in the ascending line.','↑']],
 'Who may preserve the legitime by representation under Article 923?',['Children or descendants of the disinherited heir','Any surviving spouse of a predeceased child','A creditor'],0,{law:['art923'],cases:['seangio']});

const figures={
 table:{src:'assets/succession-diagrams/paras-table.png',alt:'Original reviewer Simplified Table of Legitimes (Paras), p. 1',caption:'Simplified Table of Legitimes [Paras], reviewer p. 1'},
 adoption:{src:'assets/figures/lim-adoption-family-tree.png',alt:'Family relationship diagram from adoption case facts',caption:'Family relationship from case discussion'},
 children:{src:'assets/succession-diagrams/children-only.png',alt:'Original reviewer: legitimate children only, one-half and free portion',caption:'Legitimate children only · reviewer p. 2'},
 parents:{src:'assets/succession-diagrams/parents-only.png',alt:'Original reviewer: legitimate parents / ascendants only',caption:'Legitimate parents or ascendants only · reviewer p. 2'},
 onechildspouse:{src:'assets/succession-diagrams/one-child-spouse.png',alt:'Legitimate child and surviving spouse share chart',caption:'One legitimate child and spouse · reviewer p. 3'},
 multiplechildspouse:{src:'assets/succession-diagrams/multiple-children-spouse.png',alt:'Multiple legitimate children and surviving spouse share chart',caption:'Multiple legitimate children and spouse · reviewer p. 3'},
 parentsspouse:{src:'assets/succession-diagrams/parents-spouse.png',alt:'Legitimate parents and spouse share chart',caption:'Legitimate parents and surviving spouse · reviewer p. 3'},
 ilcss:{src:'assets/succession-diagrams/ilc-spouse.png',alt:'Illegitimate children and spouse share chart',caption:'Illegitimate children and spouse · reviewer p. 3'},
 mixed:{src:'assets/succession-diagrams/mixed-children.png',alt:'Legitimate and illegitimate children share figures from reviewer',caption:'Mixed legitimate and illegitimate children · reviewer p. 4'},
 lpilc:{src:'assets/succession-diagrams/lp-ilc.png',alt:'Legitimate parents and illegitimate children share chart',caption:'Legitimate parents and illegitimate children · reviewer p. 4'},
 lpilcss:{src:'assets/succession-diagrams/lp-ilc-ss.png',alt:'Legitimate parents, illegitimate children and spouse share chart',caption:'Legitimate parents, illegitimate children and spouse · reviewer p. 5'},
 spouseonly:{src:'assets/succession-diagrams/spouse-only.png',alt:'Surviving spouse only shares in general and exception diagrams',caption:'Surviving spouse alone · reviewer p. 5'},
 ilconly:{src:'assets/succession-diagrams/ilc-only.png',alt:'Illegitimate children only share chart',caption:'Illegitimate children alone · reviewer p. 5'},
 ilpss:{src:'assets/succession-diagrams/ilp-ss.png',alt:'Illegitimate parents and spouse share chart',caption:'Illegitimate parents and spouse · reviewer p. 6'}
};
const allowed=new Set(entries.map(e=>e.id));
for(const unit of units){for(const id of unit.ids){if(!allowed.has(id))throw Error('Succession outline references unknown checkpoint '+id);}}
if(new Set(units.flatMap(x=>x.ids)).size!==entries.length)throw Error('Succession outline has duplicate or orphan checkpoint IDs');
const course=window.LEXQUEST_WORLDS.succession;
course.checkpoints=entries.map((r,i)=>{
 const shapes=['scroll','office','books','gate','bridge','tower'];
 const offset=[...r.id].reduce((n,ch)=>n+ch.charCodeAt(0),0)%r.options.length;
 const cp={id:r.id,title:r.title,tag:r.article,object:r.object||shapes[i%shapes.length],story:`Study question: ${r.question}`, 
   summary:r.terms.map(x=>`${x[0]}: ${x[1]}`).join('\n'),provision:r.article,case:r.cases?.length?'See relevant case files':'See the reviewer’s cases under the Case Files library',
   source:`${source}, p. ${r.page}`,game:{type:'choice',title:'Study checkpoint · '+r.title,prompt:r.question,options:r.options.slice(offset).concat(r.options.slice(0,offset)),correct:(r.correct-offset+r.options.length)%r.options.length,explanation:r.terms[0][1]},
   reviewerPage:r.page,diagram:r.figure?figures[r.figure]:null};
 const unit=units.find(u=>u.ids.includes(r.id));const iInUnit=unit.ids.indexOf(r.id);
 const positions=[[190,315],[565,360],[940,315],[1335,365],[210,735],[590,795],[975,735],[1345,800]];
 [cp.x,cp.y]=positions[iInUnit];cp.chapterId=unit.id;
 window.LEXQUEST_GUIDES[r.id]={lawIds:(r.law||r.article.match(/\b\d{3,4}\b/g)?.map(x=>'art'+x)||['art886']).filter(id=>window.LEXQUEST_REFERENCE_FILES.succession.laws[id]),caseIds:(r.cases||[]).filter(id=>window.LEXQUEST_REFERENCE_FILES.succession.cases[id]),keywords:r.terms};
 return cp;
});
window.LEXQUEST_CHAPTERS.succession=units.map((u,i)=>({id:u.id,label:`SECTION ${i<9?'5':'6'} · UNIT ${i<9?i+1:i-8}`,
 title:u.title,subtitle:u.subtitle,section:`CHAPTER 2 · TESTAMENTARY SUCCESSION · SECTION ${i<9?'5 · LEGITIME':'6 · DISINHERITANCE'} · ${u.article}`,
 checkpoints:u.ids,source:`${source}, ${u.pages}`}));
window.LEXQUEST_SYLLABUS_META={source,figures,units};
})();
