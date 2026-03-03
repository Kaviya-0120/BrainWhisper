import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function TopBar({ right }) {
  const { user, logout } = useAuth();
  return (
    <div className="card-header">
      <div>
        <div className="logo">BrainWhisper</div>
        <div className="muted">Early-stage cognitive health pre-screening (MVP)</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {user && (
          <div className="pill">
            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Signed in as</span>{" "}
            <span style={{ fontWeight: 500 }}>{user.email}</span>
          </div>
        )}
        {right}
        {user && (
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Log out
          </button>
        )}
      </div>
    </div>
  );
}

