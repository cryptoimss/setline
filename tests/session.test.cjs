const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script); // Verify the entire shipped script, including UI event handlers.
function functionSource(name) {
  const start=script.search(new RegExp(`    (?:async )?function ${name}\\(`));
  assert.notEqual(start,-1,`Missing ${name}`);
  const next=script.slice(start+1).search(/\n    (?:async )?function /);
  assert.notEqual(next,-1,`Missing boundary for ${name}`);
  return script.slice(start,start+1+next);
}
function harness(saved) {
  let storage=JSON.stringify(saved);
  let confirmationCount=0;
  let resolveConfirmation;
  const nodes=new Map();
  const context={
    localStorage:{getItem:()=>storage,setItem:(_,value)=>{storage=value;}},
    $:selector=>{if(!nodes.has(selector))nodes.set(selector,{textContent:'',focus(){},classList:{remove(){}}});return nodes.get(selector);},
    window:{scrollTo(){}},
    clearTimeout(){}, stopTimer(){}, updateTimerUI(){}, renderFilters(){}, renderExercises(){}, focusSessionControl(){},
    showToast(){},
    confirmSheet:()=>{confirmationCount++;return new Promise(resolve=>{resolveConfirmation=resolve;});}
  };
  vm.createContext(context);
  // The data/model prefix has no browser side effects.
  vm.runInContext(script.slice(0,script.indexOf('    let state = loadState();'))+`
    let state = loadState(); let sessionResetPending = false;
    let timerRemaining=120; let timerInitial=120; let timerFinishTimeout=null;
    const toggledCards=new Set(['pa-incline']);
    const activeProgram=()=>programs.find(p=>p.id===state.programId);
    const activeDay=()=>activeProgram().days.find(d=>d.id===state.dayByProgram[state.programId]);
  `,context);
  for(const name of ['persist','safeNumber','hasTrainingData','clearSessionEntries','clearSessionTimer','resetCurrentSession'])vm.runInContext(functionSource(name),context);
  return {
    context,
    reset:()=>vm.runInContext('resetCurrentSession()',context),
    confirm:value=>resolveConfirmation(value),
    confirmations:()=>confirmationCount,
    state:()=>JSON.parse(vm.runInContext('JSON.stringify(state)',context)),
    reload:()=>{vm.runInContext('state=loadState()',context);return JSON.parse(vm.runInContext('JSON.stringify(state)',context));},
    stored:()=>JSON.parse(storage),
    timer:()=>vm.runInContext('timerRemaining',context)
  };
}
function fixture() {
 return {schemaVersion:3,programId:'chest',dayByProgram:{chest:'p-a'},filter:'Pecho',entries:{
  'chest:p-a:pa-incline:0':{weight:'18',reps:'10',completed:true,weightSource:'manual'},
  'chest:p-a:pa-incline:1':{weight:'18',reps:'10',completed:true,weightSource:'manual'},
  'chest:p-a:pa-incline:2':{weight:'18',reps:'10',completed:true,weightSource:'manual'},
  'chest:p-a:old-exercise:8':{reps:'3',completed:true},
  'chest:p-b:pb-flat:0':{weight:'40',reps:'12',completed:true},
  'solo:s-1:s1-incline:0':{weight:'20',reps:'8',completed:true},
  'chest:p-aa:future:0':{reps:'5',completed:true}
 },references:{'chest:pa-incline':'700','solo:s1-incline':'800'},lastVolumes:{'chest:pa-incline':600,'chest:pb-flat':500,'legacy:unknown':42}};
}
test('RESET clears only the captured day and does not overwrite previous or manual references, including complete exercises',async()=>{
 const data=fixture(), h=harness(data), pending=h.reset();
 h.confirm(true); await pending;
 const state=h.state();
 assert.deepEqual(state.entries,{'chest:p-b:pb-flat:0':data.entries['chest:p-b:pb-flat:0'],'solo:s-1:s1-incline:0':data.entries['solo:s-1:s1-incline:0'],'chest:p-aa:future:0':data.entries['chest:p-aa:future:0']});
 assert.deepEqual(state.references,data.references); assert.deepEqual(state.lastVolumes,data.lastVolumes);
 assert.equal(state.filter,'Todos'); assert.equal(h.timer(),0);
 assert.deepEqual(h.reload(),state);
 await h.reset(); assert.equal(h.confirmations(),1); assert.deepEqual(h.stored(),state);
});
test('Cancel leaves entries, history, filter and timer unchanged, including after reload',async()=>{
 const h=harness(fixture()), initial=h.state(), pending=h.reset();h.confirm(false);await pending;
 assert.deepEqual(h.state(),initial); assert.deepEqual(h.reload(),initial); assert.equal(h.timer(),120);
});
test('Repeated clicks produce one confirmation and one reset',async()=>{
 const h=harness(fixture()), a=h.reset(), b=h.reset(); assert.equal(h.confirmations(),1); h.confirm(true); await Promise.all([a,b]);
 assert.deepEqual(h.state().lastVolumes,fixture().lastVolumes); assert.equal(h.timer(),0);
});
test('A stale confirmation cannot reset a different program or day',async()=>{
 const h=harness(fixture()), initial=h.state(), pending=h.reset(); vm.runInContext('state.dayByProgram.chest="p-b"',h.context); h.confirm(true); await pending;
 assert.deepEqual(h.state().entries,initial.entries); assert.equal(h.timer(),120);
});
test('A rest started before any set can also be reset without a destructive confirmation',async()=>{
 const h=harness({...fixture(),entries:{}});await h.reset(); assert.equal(h.confirmations(),0); assert.equal(h.timer(),0);
});
test('Strength routines retain 30–45 minute estimates and their intended chest volume',()=>{
 const h=harness(fixture()); const programs=JSON.parse(vm.runInContext('JSON.stringify(programs)',h.context));
 const ids=new Set();
 for(const p of programs.filter(p=>!['shoulder','shoulder-focus'].includes(p.id)))for(const d of p.days.filter(d=>d.id!=='p-extra')){
  assert.ok(d.timing.min>=30 && d.timing.max<=45,`${p.id}/${d.id}: ${d.duration}`);
  assert.ok(d.timing.min<d.timing.max);assert.equal(d.duration,`${d.timing.min}–${d.timing.max} min`);
  for(const e of d.exercises){assert.ok(e.sets>=1 && e.rest>=60);assert.ok(!ids.has(e.id));ids.add(e.id);}
  if(p.id==='chest')assert.equal(d.exercises.filter(e=>e.muscle==='Pecho').reduce((sum,e)=>sum+e.sets,0),d.id==='p-shoulder'?6:7);
 }
 assert.equal(programs.filter(p=>!['shoulder','shoulder-focus'].includes(p.id)).flatMap(p=>p.days.filter(d=>d.id!=='p-extra')).length,10);
 const home=programs.find(p=>p.id==='chest').days.find(d=>d.id==='p-home');
 assert.ok(!home.exercises.some(e=>/máquina|polea|banco/i.test(e.name)));
});
test('Increasing sets or rest changes the estimate; no fixed 45-minute label or clamp',()=>{
 const h=harness(fixture()); const delta=vm.runInContext(`(()=>{
  const day=programs.find(p=>p.id==='chest').days[0];const before=estimateSessionTiming(day);
  const changed={...day,exercises:day.exercises.map((e,i)=>i===0?{...e,sets:e.sets+1,rest:e.rest+60}:e)};
  const after=estimateSessionTiming(changed);return {min:after.min-before.min,max:after.max-before.max};
 })()`,h.context);
 assert.ok(delta.min>=4 && delta.max>=4);
});

test('Retiring volley repairs selection without dropping or reusing any previous training records',()=>{
 const saved={...fixture(),programId:'volley',dayByProgram:{volley:'v-b',solo:'s-2',chest:'p-b'},focusExerciseId:'vb-chest',
  entries:{...fixture().entries,'volley:v-b:vb-chest:0':{weight:'35',reps:'10',completed:true}},
  references:{'volley:vb-chest':'350'},setLog:{'volley:v-b:vb-chest:0':[{weight:'35',reps:'10',date:'2026-11-01'}]}};
 const h=harness(saved), migrated=h.state();
 assert.equal(vm.runInContext('programs.some(p=>p.id==="volley")',h.context),false);
 assert.equal(migrated.programId,'solo');assert.equal(migrated.dayByProgram.solo,'s-2');
 assert.equal(migrated.filter,'Todos');assert.equal(migrated.focusExerciseId,null);
 for(const field of ['entries','references','lastVolumes','setLog'])assert.deepEqual(migrated[field],saved[field],field);
 vm.runInContext('persist()',h.context);assert.deepEqual(h.reload(),migrated);
 assert.equal(harness(fixture()).state().programId,'chest');
});

test('Chest and shoulder alternative records real loads independently without presetting rehabilitation weights',()=>{
 const key='chest:p-shoulder:ps-external:0';
 const saved={...fixture(),dayByProgram:{chest:'p-shoulder'},loadPreset:'heavy',setLog:{[key]:[{weight:'1.5',reps:'14',date:'2026-11-01'}]}};
 const h=logHarness(saved), day=h.run('activeDay()');
 assert.ok(day.alternative);assert.equal(day.exercises.reduce((s,e)=>s+e.sets,0),13);
 assert.equal(day.exercises.filter(e=>e.muscle==='Bíceps').length,1);
 assert.equal(day.exercises.filter(e=>e.muscle==='Hombros').length,1);
 for(const e of day.exercises){
  assert.notEqual(e.tracking,'reps');assert.equal(e.manualLoad,true);
  assert.equal(h.run(`suggestedLoad(${JSON.stringify(e.id)})`),null);
  assert.ok(h.run(`exerciseGifs[${JSON.stringify(e.id)}]`)?.[0],e.id);
 }
 h.run('(ensurePresetWeights(activeDay()),null)');
 assert.equal(h.state().entries[key].weight,'1.5');
 assert.equal(h.run('defaultWeight(activeDay(),activeDay().exercises[0],0)'),'');
 h.run('(setEntry("p-shoulder","ps-external",0,{weight:"2",weightSource:"manual"}),state.loadPreset="light",ensurePresetWeights(activeDay()),null)');
 assert.equal(h.reload().entries[key].weight,'2');
 assert.equal(h.state().entries['chest:p-a:pa-incline:0'].weight,'18');
 vm.runInContext(functionSource('nextDayInRotation'),h.context);
 assert.equal(h.run('nextDayInRotation().id'),'p-a');
});

test('Shoulder plan follows the five video chapters and spoken starting dose without preset loads',()=>{
 const h=harness(fixture());
 const plan=JSON.parse(vm.runInContext('JSON.stringify(programs.find(p=>p.id==="shoulder"))',h.context));
 assert.equal(h.state().dayByProgram.shoulder,'h-a');
 assert.deepEqual(plan.days[0].exercises.map(e=>e.videoTime),[468,575,783,899,1019]);
 for(const e of plan.days[0].exercises){
  assert.equal(e.sets,1); assert.equal(e.tracking,'reps'); assert.equal(e.rir,undefined);
  assert.equal(vm.runInContext(`NORMAL_LOADS[${JSON.stringify(e.id)}]`,h.context),undefined);
 }
 assert.equal(plan.days[0].exercises[1].reps,'10/lado');
 assert.equal(plan.days[0].exercises[4].reps,'10');
 assert.ok(plan.days[0].timing.min<30);
});
test('RESET of shoulder session preserves gym entries and references',async()=>{
 const saved=fixture(); saved.programId='shoulder'; saved.dayByProgram.shoulder='h-a';
 saved.entries['shoulder:h-a:h-wall:0']={reps:'10',completed:true};
 const h=harness(saved), pending=h.reset(); h.confirm(true); await pending;
 assert.deepEqual(h.state().entries,fixture().entries);
 assert.deepEqual(h.state().references,saved.references);
});

// "Última vez" and console helpers.
function logHarness(saved) {
  const h=harness(saved);
  vm.runInContext(`
    const entryKey=(dayId,exerciseId,index)=>state.programId+":"+dayId+":"+exerciseId+":"+index;
    const referenceKey=exerciseId=>state.programId+":"+exerciseId;
  `,h.context);
  for(const name of ['dateKey','rememberSet','forgetSet','previousSet','lastSessionSets','seedSetLog','repRange','knownReps','defaultReps','defaultWeight','stepWeight','getEntry','setEntry','suggestedLoad','ensurePresetWeights','automaticVolume','getReference'])vm.runInContext(functionSource(name),h.context);
  return {...h,run:code=>JSON.parse(vm.runInContext(`JSON.stringify(${code})`,h.context))};
}
const earlier=(weight,reps,date='2026-01-05')=>({weight,reps,date});
test('Weight steps follow the preset grid in both directions and never go below zero',()=>{
 const h=logHarness(fixture());
 const step=(value,direction)=>h.run(`stepWeight(${value},${direction})`);
 assert.equal(step(18,1),20); assert.equal(step(20,1),22.5); assert.equal(step(17.5,1),20);
 assert.equal(step(18,-1),17.5); assert.equal(step(12.5,-1),10); assert.equal(step(10,-1),9);
 assert.equal(step(9,1),10); assert.equal(step(10,1),12.5); assert.equal(step(4,1),5);
 assert.equal(step(0,1),1); assert.equal(step(0,-1),0); assert.equal(step(1,-1),0);
});
test('Every prescribed rep format parses, including per-side and single-number doses',()=>{
 const h=logHarness(fixture());
 const programs=h.run('programs');
 for(const p of programs)for(const d of p.days)for(const e of d.exercises){
  if(e.freeLog){assert.equal(e.reps,"—");continue;}
  const range=h.run(`repRange(${JSON.stringify(e)})`);
  assert.ok(range.min>=1 && range.max>=range.min,`${e.id}: ${e.reps}`);
 }
 assert.deepEqual(h.run('repRange({reps:"6–10"})'),{min:6,max:10});
 assert.deepEqual(h.run('repRange({reps:"8–12/lado"})'),{min:8,max:12});
 assert.deepEqual(h.run('repRange({reps:"10/lado"})'),{min:10,max:10});
 assert.deepEqual(h.run('repRange({reps:"10"})'),{min:10,max:10});
});
test('Última vez skips the set being done today, keeps the previous session and can be undone without losing it',()=>{
 const h=logHarness({...fixture(),setLog:{}});
 h.run('(state.entries.k={completed:true},rememberSet("k",{weight:"18",reps:"9"}),null)');
 assert.equal(h.run('previousSet("k")'),null,'a set ticked today is the current one, not "last time"');
 h.run('(delete state.entries.k,null)');
 assert.equal(h.run('previousSet("k").reps'),'9','once RESET clears it, today is the last time');
 h.run('(state.entries.k={completed:true},state.setLog.k=[{weight:"16",reps:"8",date:"2026-01-05"}],null)');
 h.run('(rememberSet("k",{weight:"18",reps:"9"}),null)');
 assert.deepEqual(h.run('previousSet("k")'),earlier('16','8'));
 h.run('(rememberSet("k",{weight:"20",reps:"7"}),null)');
 assert.equal(h.run('state.setLog.k.length'),2,'re-ticking today replaces, it does not grow');
 h.run('(forgetSet("k"),null)');
 assert.deepEqual(h.run('state.setLog.k'),[earlier('16','8')]);
 h.run('(state.setLog.only=[{weight:"",reps:"5",date:dateKey()}],forgetSet("only"),null)');
 assert.equal(h.run('state.setLog.only===undefined'),true);
 h.run('(rememberSet("empty",{weight:"",reps:""}),null)');
 assert.equal(h.run('state.setLog.empty===undefined'),true,'nothing logged, nothing remembered');
});
test('RESET leaves Última vez untouched and does not create references or volumes',async()=>{
 const saved={...fixture(),setLog:{'chest:p-a:pa-incline:0':[earlier('18','10')]}};
 const h=logHarness(saved), pending=h.reset();
 h.confirm(true); await pending;
 assert.deepEqual(h.state().setLog,saved.setLog);
 assert.deepEqual(h.state().references,saved.references);
 assert.deepEqual(h.state().lastVolumes,saved.lastVolumes);
});
test('Sets ticked before this feature existed survive the next RESET as Última vez',()=>{
 const h=logHarness(fixture());
 h.run('(seedSetLog(),null)');
 assert.deepEqual(h.run('previousSet("chest:p-a:pa-incline:0")'),{weight:'18',reps:'10',date:''});
 h.run('(state.setLog["chest:p-a:pa-incline:0"]=[{weight:"1",reps:"1",date:"2026-01-05"}],seedSetLog(),null)');
 assert.equal(h.run('state.setLog["chest:p-a:pa-incline:0"][0].weight'),'1','an existing log is never overwritten by seeding');
});
test('Weights come from the last session, then the preset, and never replace manual or finished sets',()=>{
 const key=index=>`solo:s-1:s1-incline:${index}`;
 const saved={...fixture(),programId:'solo',dayByProgram:{solo:'s-1'},entries:{
  [key(1)]:{weight:'30',reps:'',completed:false,weightSource:'manual'},
  [key(2)]:{weight:'18',reps:'8',completed:true,weightSource:'preset'}
 },setLog:{[key(0)]:[earlier('22.5','9')],[key(1)]:[earlier('22.5','8')],[key(2)]:[earlier('22.5','7')]}};
 const h=logHarness(saved);
 h.run('(ensurePresetWeights(activeDay()),null)');
 const entry=index=>h.run(`state.entries[${JSON.stringify(key(index))}]`);
 assert.equal(entry(0).weight,'22.5'); assert.equal(entry(0).weightSource,'last');
 assert.equal(entry(1).weight,'30','manual wins over last time');
 assert.equal(entry(2).weight,'18','a finished set keeps what was logged');
 const row=h.run('state.entries["solo:s-1:s1-row-db:0"]');
 assert.equal(row.weight,'15'); assert.equal(row.weightSource,'preset');
 h.run('(state.loadPreset="heavy",ensurePresetWeights(activeDay()),null)');
 assert.equal(entry(2).weight,'18','changing preset never rewrites a finished set');
 assert.equal(entry(0).weight,'22.5','last time outranks the preset');
 assert.equal(h.run('state.entries["solo:s-1:s1-row-db:0"].weight'),'20','heavy preset: 15 kg × 1.25, on the 2.5 kg grid');
});
test('Known reps prefer last time, then the set before, and only invent nothing for ranges',()=>{
 const saved={...fixture(),programId:'solo',dayByProgram:{solo:'s-1'},entries:{'solo:s-1:s1-incline:0':{reps:'9',completed:true}},setLog:{'solo:s-1:s1-incline:2':[earlier('18','7')]}};
 const h=logHarness(saved);
 const exercise='activeDay().exercises[0]';
 assert.equal(h.run(`knownReps(activeDay(),${exercise},0)`),'', 'first set of a range with no history: only the user knows');
 assert.equal(h.run(`knownReps(activeDay(),${exercise},1)`),'9');
 assert.equal(h.run(`knownReps(activeDay(),${exercise},2)`),'7');
 const fresh=logHarness({...fixture(),programId:'solo',dayByProgram:{solo:'s-1'},entries:{}});
 assert.equal(fresh.run(`defaultReps(activeDay(),${exercise},0)`),'6','the console proposes the bottom of the range, visibly, before it is confirmed');
 const shoulder=logHarness({...fixture(),programId:'shoulder',dayByProgram:{shoulder:'h-a'},entries:{}});
 assert.equal(shoulder.run('knownReps(activeDay(),activeDay().exercises[0],0)'),'10','a single prescribed number is known');
 assert.equal(shoulder.run('knownReps(activeDay(),activeDay().exercises[1],0)'),'10','10/lado logs 10');
});
test('The volume reference comes from a complete last session, manual targets win, and partial sessions do not count',()=>{
 const key=index=>`solo:s-1:s1-incline:${index}`;
 const h=logHarness({...fixture(),programId:'solo',dayByProgram:{solo:'s-1'},references:{},lastVolumes:{'solo:s1-row-db':111},setLog:{[key(0)]:[earlier('20','10')],[key(1)]:[earlier('20','9')],[key(2)]:[earlier('20','8')],'solo:s-1:s1-fly:0':[earlier('10','12')]}});
 assert.deepEqual(h.run('getReference("s1-incline")'),{value:540,source:'automatic'});
 assert.deepEqual(h.run('getReference("s1-row-db")'),{value:111,source:'automatic'},'legacy references keep working');
 assert.deepEqual(h.run('getReference("s1-fly")'),{value:0,source:'none'},'one of two sets is not a comparable session');
 h.run('(state.references["solo:s1-incline"]="700",null)');
 assert.deepEqual(h.run('getReference("s1-incline")'),{value:700,source:'manual'});
});

test('Undoing a tick restores the log as it was, including numbers from a restart today and across midnight',()=>{
 const h=logHarness({...fixture(),setLog:{}});
 h.run('(state.setLog.k=[{weight:"22.5",reps:"10",date:dateKey()},{weight:"20",reps:"9",date:"2026-10-28"}],null)');
 const before=h.run('state.setLog.k');
 h.run('(rememberSet("k",{weight:"20",reps:"7"}),forgetSet("k",JSON.parse(%s)),null)'.replace('%s',JSON.stringify(JSON.stringify(before))));
 assert.deepEqual(h.run('state.setLog.k'),before);
 h.run('(state.setLog.fresh=[{weight:"20",reps:"7",date:"2026-01-05"}],forgetSet("fresh",[]),null)');
 assert.equal(h.run('state.setLog.fresh===undefined'),true,'a set with no earlier log is removed even if the date moved on');
});
test('Damaged saved data is dropped on load instead of breaking the app',()=>{
 const k='solo:s-1:s1-incline:0';
 const load=extra=>{const h=logHarness({...fixture(),...extra});return h.state();};
 assert.deepEqual(load({entries:{[k]:null,ok:{reps:'8'}}}).entries,{ok:{reps:'8'}});
 assert.deepEqual(load({entries:[1,2]}).entries,{});
 for(const setLog of ['garbage',7,[1],{[k]:'nope'},{[k]:{}},{[k]:7},{[k]:[null]},{[k]:[{reps:'9',date:'not-a-date'}]},{[k]:[{reps:'9',date:12}]},{[k]:[{reps:'9'}]}])assert.deepEqual(load({setLog}).setLog,{},JSON.stringify(setLog));
 const kept=[{weight:'20',reps:'9',date:'2026-10-28'},{weight:'21',reps:'9',date:''}];
 assert.deepEqual(load({setLog:{[k]:kept}}).setLog,{[k]:kept});
});
test('A comparison uses only the latest session; a set stopped short does not blend with an older one',()=>{
 const key=index=>`solo:s-1:s1-incline:${index}`;
 const h=logHarness({...fixture(),programId:'solo',dayByProgram:{solo:'s-1'},references:{},lastVolumes:{},setLog:{[key(0)]:[earlier('30','10','2026-11-02'),earlier('20','9','2026-10-28')],[key(1)]:[earlier('20','8','2026-10-28')],[key(2)]:[earlier('20','7','2026-10-28')]}});
 assert.deepEqual(h.run('lastSessionSets(activeDay(),activeDay().exercises[0])'),[earlier('30','10','2026-11-02'),null,null]);
 assert.deepEqual(h.run('getReference("s1-incline")'),{value:0,source:'none'});
 assert.equal(h.run('previousSet(%s).reps'.replace('%s',JSON.stringify(key(1)))),'8','each set still keeps its own starting point');
});
test('A weight known for the set above is proposed, unless the user cleared this one on purpose',()=>{
 const key=index=>`chest:p-a:pa-row:${index}`;
 const exercise='activeDay().exercises.find(item=>item.id==="pa-row")';
 const h=logHarness({...fixture(),entries:{[key(0)]:{weight:'15',reps:'10'},[key(2)]:{weight:'',weightSource:'manual'}}});
 assert.equal(h.run(`defaultWeight(activeDay(),${exercise},1)`),'15');
 assert.equal(h.run(`defaultWeight(activeDay(),${exercise},2)`),'');
 assert.equal(h.run(`defaultWeight(activeDay(),${exercise},0)`),'15');
});

// The extra day is a selectable repertoire, separate from the programmed sessions.
test('Chest extra contains thirty distinct variants with demos and stays outside the A/B rotation',()=>{
 const h=harness(fixture());
 const chest=JSON.parse(vm.runInContext('JSON.stringify(programs.find(p=>p.id==="chest"))',h.context));
 const extra=chest.days.find(d=>d.id==='p-extra');
 assert.ok(extra.optional && extra.alternative);
 assert.equal(extra.exercises.length,30);
 assert.ok(extra.exercises.every(e=>e.muscle==='Pecho' && e.sets===2));
 const ids=JSON.parse(vm.runInContext('JSON.stringify(programs.flatMap(p=>p.days.flatMap(d=>d.exercises.map(e=>e.id))))',h.context));
 assert.equal(new Set(ids).size,ids.length);
 for(const e of extra.exercises){
  const demo=vm.runInContext(`exerciseGifs[${JSON.stringify(e.id)}]`,h.context);
  assert.ok(demo?.[0] && demo?.[1],e.id);
  if(/Flexiones|Fondos|elástico/.test(e.name)) assert.equal(e.tracking,'reps');
 }
 vm.runInContext(functionSource('nextDayInRotation'),h.context);
 assert.equal(vm.runInContext('nextDayInRotation().id',h.context),'p-b');
 vm.runInContext('state.dayByProgram.chest="p-b"',h.context);
 assert.equal(vm.runInContext('nextDayInRotation().id',h.context),'p-a');
});

test('Starting loads distinguish preset movements from individually calibrated loads and reps-only work',()=>{
 const h=logHarness({...fixture(),entries:{}});
 const plans=h.run('programs');
 for(const p of plans)for(const day of p.days)for(const e of day.exercises){
  const load=h.run(`NORMAL_LOADS[${JSON.stringify(e.id)}] ?? null`);
  if(e.tracking==='reps'||e.freeLog||e.manualLoad) { assert.equal(load,null,e.id); continue; }
  // This existing slot mixes assistance, added load and a pulldown: no shared kg meaning.
  if(e.id==='s2-pullup') { assert.equal(load,null); continue; }
  assert.ok(load>0,e.id);
 }
});
test('New chest suggestions fill untouched sets, respect presets and retain manual blanks and last time',()=>{
 const key=i=>`chest:p-extra:px-bar-flat:${i}`;
 const saved={...fixture(),dayByProgram:{chest:'p-extra'},entries:{
  [key(0)]:{weight:'',weightSource:'manual',completed:false},
 },setLog:{'chest:p-extra:px-db-flat:0':[earlier('22.5','10')]}};
 const h=logHarness(saved);
 h.run('(ensurePresetWeights(activeDay()),null)');
 assert.equal(h.run(`state.entries[${JSON.stringify(key(0))}].weight`),'');
 assert.equal(h.run(`state.entries[${JSON.stringify(key(1))}].weight`),'30');
 assert.equal(h.run('state.entries["chest:p-extra:px-db-flat:0"].weight'),'22.5');
 h.run('(state.loadPreset="light",ensurePresetWeights(activeDay()),null)');
 assert.equal(h.run(`state.entries[${JSON.stringify(key(1))}].weight`),'22.5');
 assert.equal(h.run('state.entries["chest:p-extra:px-db-flat:0"].weight'),'22.5');
 assert.equal(h.reload().entries[key(1)].weight,'22.5');
});
test('Focused shoulder session is free logging, keeps curl separate and never invents reps or loads',()=>{
 const h=logHarness({...fixture(),programId:'shoulder-focus',dayByProgram:{'shoulder-focus':'hf-main'},entries:{}});
 const p=h.run('programs.find(p=>p.id==="shoulder-focus")');assert.equal(p.days[0].exercises.length,3);assert.equal(p.days[1].optional,true);assert.equal(p.days[1].exercises[0].id,'hf-curl');
 for(const e of p.days.flatMap(d=>d.exercises)){assert.equal(e.freeLog,true);assert.equal(e.rest,0);assert.equal(e.reps,'—');assert.equal(h.run(`suggestedLoad(${JSON.stringify(e.id)})`),null);}
 const e=p.days[0].exercises[0];assert.equal(h.run(`defaultReps(activeDay(),${JSON.stringify(e)},0)`),'');
});
