import React, { useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { useAuth } from "../auth.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, fullName);
    } catch (err) {
      setError(err.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-8">
      <TopBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="card" style={{ maxWidth: 720 }}>
          <h1 className="h1">Create your BrainWhisper account</h1>
          <p className="muted">We store only basic details and anonymous screening results.</p>
          <form className="stack" style={{ marginTop: "1.25rem" }} onSubmit={onSubmit}>
            <div className="row">
              <div className="col">
                <label className="label">Full name (optional)</label>
                <input
                  className="input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Doe"
                />
              </div>
              <div className="col">
                <label className="label">Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div style={{ maxWidth: 260 }}>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account & continue"}
            </button>
            <div className="badge">
              Already have an account?{" "}
              <Link className="link" to="/login">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

