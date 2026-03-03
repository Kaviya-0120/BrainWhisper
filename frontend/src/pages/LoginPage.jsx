import React, { useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { useAuth } from "../auth.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-8">
      <TopBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="card" style={{ maxWidth: 480 }}>
          <h1 className="h1">Welcome back</h1>
          <p className="muted">Sign in to run a quick cognitive pre-screening.</p>
          <form className="stack" style={{ marginTop: "1.25rem" }} onSubmit={onSubmit}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <div className="badge">
              New here?{" "}
              <Link className="link" to="/register">
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
