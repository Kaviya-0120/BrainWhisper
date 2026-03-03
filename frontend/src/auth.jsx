import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiBase, loginRequest, meRequest, registerRequest } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("bw_token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await meRequest(token);
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setToken("");
          localStorage.removeItem("bw_token");
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    const tok = await loginRequest(email, password);
    localStorage.setItem("bw_token", tok);
    setToken(tok);
    const me = await meRequest(tok);
    setUser(me);
    navigate("/", { replace: true });
  };

  const register = async (email, password, fullName) => {
    await registerRequest(email, password, fullName);
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("bw_token");
    setToken("");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const value = { token, user, loading, login, register, logout, apiBase };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

