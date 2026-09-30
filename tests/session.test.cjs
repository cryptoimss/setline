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
    clearTimeout(){}, stopTimer(){}, updateTimerUI(){}, renderFilters(){}, renderExercises(){},
    showToast(){},
    confirmSheet:()=>{confirmationCount++;return new Promise(resolve=>{resolveConfirmation=resolve;});}
  };
  vm.createContext(context);
  // The data/model prefix has no browser side effects.
  vm.runInContext(script.slice(0,script.indexOf('    let state = loadState();'))+`
    let state = loadState(); let sessionResetPending = false;
    let timerRemaining=120; let timerInitial=120; let timerFinishTimeout=null;
    const expandedCompleteCards=new Set(['pa-incline']);
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
test('Every routine has a derived 30–45 minute plan and chest volume stays at seven direct sets',()=>{
 const h=harness(fixture()); const programs=JSON.parse(vm.runInContext('JSON.stringify(programs)',h.context));
 const ids=new Set();
 for(const p of programs)for(const d of p.days){
  assert.ok(d.timing.min>=30 && d.timing.max<=45,`${p.id}/${d.id}: ${d.duration}`);
  assert.ok(d.timing.min<d.timing.max);assert.equal(d.duration,`${d.timing.min}–${d.timing.max} min`);
  for(const e of d.exercises){assert.ok(e.sets>=1 && e.rest>=60);assert.ok(!ids.has(e.id));ids.add(e.id);}
  if(p.id==='chest')assert.equal(d.exercises.filter(e=>e.muscle==='Pecho').reduce((sum,e)=>sum+e.sets,0),7);
 }
 assert.equal(programs.flatMap(p=>p.days).length,12);
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
