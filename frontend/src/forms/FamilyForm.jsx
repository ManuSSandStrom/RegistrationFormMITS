export default function FamilyForm({ value, onChange }) {
  const v = value || {};
  const update = (k,val)=>onChange({ ...v, [k]: val });
  return (
    <div className="row">
      <div className="col-6">
        <label className="label">Father's Name</label>
        <input className="input" value={v.father||""} onChange={e=>update("father",e.target.value)} />
      </div>
      <div className="col-6">
        <label className="label">Mother's Name</label>
        <input className="input" value={v.mother||""} onChange={e=>update("mother",e.target.value)} />
      </div>
      <div className="col-6">
        <label className="label">Guardian Contact</label>
        <input className="input" value={v.guardianContact||""} onChange={e=>update("guardianContact",e.target.value)} />
      </div>
      <div className="col-6">
        <label className="label">Family Income</label>
        <input className="input" value={v.familyIncome||""} onChange={e=>update("familyIncome",e.target.value)} />
      </div>
    </div>
  );
}