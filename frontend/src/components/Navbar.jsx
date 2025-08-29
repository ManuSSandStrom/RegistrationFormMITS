import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  return (
    <nav className="nav">
      <div><strong>Mits Deemed To Be University Admission Form</strong></div>
      <div style={{display:"flex", gap:12, alignItems:"center"}}>
        {role === "admin" && <Link to="/admin">Admin</Link>}
        {user ? (
          <>
            <span style={{color:"#9ca3af"}}>{user?.name || user?.email}</span>
            <button className="btn secondary" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}