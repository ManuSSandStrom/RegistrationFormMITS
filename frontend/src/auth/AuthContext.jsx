import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "student" | "admin"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function boot() {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get("/api/me");
        setUser(data.user || data);
        setRole(data.role || data.user?.role || "student");
      } catch {
        localStorage.removeItem("token");
      } finally { setLoading(false); }
    }
    boot();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", data.token);
   setUser(data.user);
    setRole(data.role || data.user?.role || "student");
  };

  const register = async (payload) => {
    const { data } = await api.post("/api/auth/register", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    setRole(data.role || data.user?.role || "student");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null); setRole(null);
    try { window.location.replace("/login"); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}