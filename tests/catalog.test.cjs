const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/consultation/catalog.json'),'utf8'));
test('Consultation references retain source figures, unique identities and no prescribed dose',()=>{
  assert.equal(catalog.exercises.length,19);
  assert.equal(catalog.prescription,null);
  assert.equal(new Set(catalog.exercises.map(e=>e.id)).size,19);
  for(const e of catalog.exercises){
    assert.ok(catalog.sources.some(s=>s.id===e.source));
    assert.ok(e.figure);
    for(const field of ['sets','reps','rest','rir','load','frequency']) assert.equal(e[field],undefined,`${e.id}: ${field}`);
    if(e.related) assert.ok(catalog.exercises.some(other=>other.id===e.related));
    if(e.demo) assert.ok(e.demo.url.startsWith('https://') && e.demo.verification && e.demo.match);
  }
  assert.deepEqual(catalog.exercises.filter(e=>e.advanced).map(e=>e.figure),['9.39a','9.39b','9.39c']);
  for(const source of catalog.sources) assert.ok(fs.existsSync(path.join(root,source.file)));
});
