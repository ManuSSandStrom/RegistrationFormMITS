export default function SchoolingForm({ value, onChange }) {
  const v = value || {};
  const update = (k,val)=>onChange({ ...v, [k]: { ...(v[k]||{}), ...val }});
  const section = (title, key) => (
    <div className="card">
      <h3 style={{marginTop:0}}>{title}</h3>
      <div className="grid2">
        <div>
          <label className="label">School/College</label>
          <input className="input" value={v[key]?.institute||""} onChange={e=>update(key,{institute:e.target.value})}/>
        </div>
        <div>
          <label className="label">Board/University</label>
          <input className="input" value={v[key]?.board||""} onChange={e=>update(key,{board:e.target.value})}/>
        </div>
        <div>
          <label className="label">Year of Joining</label>
          <input className="input" value={v[key]?.joinYear||""} onChange={e=>update(key,{joinYear:e.target.value.replace(/[^0-9]/g,'').slice(0,4)})}/>
        </div>
        <div>
          <label className="label">Year Passed Out</label>
          <input className="input" value={v[key]?.passYear||""} onChange={e=>update(key,{passYear:e.target.value.replace(/[^0-9]/g,'').slice(0,4)})}/>
        </div>
        <div>
          <label className="label">Percent/CGPA</label>
          <input className="input" value={v[key]?.score||""} onChange={e=>update(key,{score:e.target.value})}/>
        </div>
      </div>
    </div>
  );
  return (
    <div className="row">
      <div className="col-12">{section("10th","tenth")}</div>
      <div className="col-12 mt-16">{section("Intermediate","inter")}</div>
      <div className="col-12 mt-16">{section("Degree","degree")}</div>
    </div>
  );
}