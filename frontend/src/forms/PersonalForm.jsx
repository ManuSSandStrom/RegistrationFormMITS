export default function PersonalForm({ value, onChange }) {
  const v = value || {};
  const update = (k,val)=>onChange({ ...v, [k]: val });
  const BloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'];
  const Nationalities = ['Indian','Other'];
  const Religions = ['Hindu','Muslim','Christian','Sikh','Buddhist','Jain','Other','Prefer not to say'];
  return (
    <div className="row">
      <div className="col-6">
        <label className="label">Full Name</label>
        <input className="input" value={v.name||""} onChange={e=>update("name",e.target.value)} />
      </div>
      <div className="col-6">
        <label className="label">Course</label>
        <select className="select" value={v.course||"MCA"} onChange={e=>update("course",e.target.value)}>
          <option value="MCA">MCA</option>
          <option value="MBA">MBA</option>
        </select>
      </div>
      <div className="col-6">
        <label className="label">College Email</label>
        <input className="input" type="email" value={v.email||""} onChange={e=>update("email",e.target.value)} autoComplete="email" />
      </div>
      <div className="col-6">
        <label className="label">Personal Email</label>
        <input className="input" type="email" value={v.personalEmail||""} onChange={e=>update("personalEmail",e.target.value)} autoComplete="email" />
      </div>
      <div className="col-6">
        <label className="label">Phone</label>
        <input className="input" value={v.phone||""} onChange={e=>update("phone",e.target.value)} />
      </div>
      <div className="col-6">
        <label className="label">Date of Birth</label>
        <input className="input" type="date" value={v.dob||""} onChange={e=>update("dob",e.target.value)} />
      </div>
      <div className="col-6">
        <label className="label">Gender</label>
        <select className="select" value={v.gender||"Male"} onChange={e=>update("gender",e.target.value)}>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
      </div>
      <div className="col-6">
        <label className="label">Blood Group</label>
        <select className="select" value={v.bloodGroup||""} onChange={e=>update("bloodGroup",e.target.value)}>
          <option value="">Select</option>
          {BloodGroups.map(b=> <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="col-6">
        <label className="label">Nationality</label>
        <select className="select" value={v.nationality||"Indian"} onChange={e=>update("nationality",e.target.value)}>
          {Nationalities.map(n=> <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="col-6">
        <label className="label">Religion</label>
        <select className="select" value={v.religion||"Other"} onChange={e=>update("religion",e.target.value)}>
          {Religions.map(r=> <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="col-12">
        <label className="label">Address</label>
        <input className="input" value={v.address||""} onChange={e=>update("address",e.target.value)} />
      </div>
    </div>
  );
}