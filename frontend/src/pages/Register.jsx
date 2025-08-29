import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", course:"MCA" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const validate = () => {
    if (!/^[A-Za-z]+(?: [A-Za-z]+)+$/.test(form.name.trim())) return 'Enter full name (first and last).';
    if (!/^[\w.+-]+@gmail\.com$/i.test(form.email)) return 'Use a valid Gmail address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }
    setErr(""); setLoading(true);
    try {
      await register(form);
      nav("/");
    } catch (error) {
      setErr(error?.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="container">
      <div className="row" style={{alignItems:'center'}}>
        <div className="col-6">
          <img src="/mits-admission.svg" alt="MITS Admission" style={{maxWidth:'100%', height:'auto', borderRadius:12}} />
        </div>
        <div className="col-6">
          <div className="card" style={{maxWidth:520, margin:"0 0 0 auto"}}>
            <h2>Register</h2>
            <form onSubmit={onSubmit} className="row">
              <div className="col-12">
                <label className="label">Full Name</label>
                <input className="input" name="name" value={form.name} onChange={onChange} required />
              </div>
              <div className="col-6">
                <label className="label">Email (Gmail)</label>
                <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
              </div>
              <div className="col-6">
                <label className="label">Password</label>
                <input className="input" type="password" name="password" value={form.password} onChange={onChange} required />
              </div>
              <div className="col-12">
                <label className="label">Course</label>
                <select className="select" name="course" value={form.course} onChange={onChange}>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>
              {err && <div className="col-12" style={{color:"#fca5a5"}}>{err}</div>}
              <div className="col-12">
                <button className="btn mt-16" disabled={loading}>{loading?"Registering...":"Register"}</button>
              </div>
            </form>
            <div className="mt-16">Already have an account? <Link to="/login">Login</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}