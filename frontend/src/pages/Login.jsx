import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'admin') {
      setEmail('mitsstaff01@mits.ac.in');
    } else {
      setEmail("");
    }
  }, [role]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const loginEmail = role === 'admin' ? 'mitsstaff01@mits.ac.in' : email;
      if (role === 'student' && !/^[\w.+-]+@gmail\.com$/i.test(loginEmail)) {
        throw new Error('Use a valid Gmail address');
      }
      await login(loginEmail, password);
      nav("/");
    } catch (error) {
      setErr(error?.response?.data?.error || error.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="container">
      <div className="card" style={{maxWidth:520, margin:"40px auto"}}>
        <h2>Login</h2>
        <form onSubmit={onSubmit}>
          <div className="grid2">
            <div>
              <label className="label">Login As</label>
              <select className="select" value={role} onChange={e=>setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          {role === 'student' && (
            <>
              <label className="label mt-16">Email (Gmail)</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
            </>
          )}
          {role === 'admin' && (
            <>
              <label className="label mt-16">Admin Email</label>
              <input className="input" value="mitsstaff01@mits.ac.in" readOnly />
            </>
          )}
          <label className="label mt-16">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
          {err && <div className="mt-16" style={{color:"#fca5a5"}}>{err}</div>}
          <button className="btn mt-16" disabled={loading}>{loading?"Logging in...":"Login"}</button>
        </form>
        <div className="mt-16">No account? <Link to="/register">Register</Link></div>
      </div>
    </div>
  );
}