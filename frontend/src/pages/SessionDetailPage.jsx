import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { sessionDetailRequest } from "../api.js";
import { useAuth } from "../auth.jsx";

function RiskChip({ level }) {
  const cls =
    level === "High Risk" ? "risk-chip risk-high" : level === "Medium Risk" ? "risk-chip risk-medium" : "risk-chip risk-low";
  return <span className={cls}>{level}</span>;
}

function RiskBadge({ level }) {
  const base = "risk-chip";
  const cls =
    level === "High Risk" ? `${base} risk-high` : level === "Medium Risk" ? `${base} risk-medium` : `${base} risk-low`;
  return <span className={cls}>{level}</span>;
}

export default function SessionDetailPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const [item, setItem] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await sessionDetailRequest(token, id);
        if (!cancelled) setItem(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Unable to load session");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, item, token]);

  return (
    <div className="page">
      <TopBar
        right={
          <Link className="btn btn-ghost btn-sm" to="/history">
            Back to history
          </Link>
        }
      />
      <div className="card">
        {loading && <div className="badge">Loading…</div>}
        {error && <div className="error-text">{error}</div>}
        {item && (() => {
        const cleanExplanation = (item.explanation || "").split("Cognitive details:")[0].trim();
        const risk = item.risk_score || 0;
        const angle = Math.min(Math.max(risk, 0), 100) * 3.6;
        let circleColor = "#22c55e";
        if (item.risk_level === "Medium Risk") circleColor = "#eab308";
        if (item.risk_level === "High Risk") circleColor = "#ef4444";
        const circleStyle = {
          background: `conic-gradient(${circleColor} 0deg, ${circleColor} ${angle}deg, #1f2937 ${angle}deg 360deg)`,
        };
        return (
          <>
            <div className="row" style={{ alignItems: "flex-start", gap: "2rem" }}>
              <div className="col" style={{ flex: "0 0 auto", maxWidth: 260 }}>
                <div className="risk-circle" style={circleStyle}>
                  <div className="risk-circle-inner">
                    <div style={{ fontSize: "1.6rem", fontWeight: 600 }}>{risk.toFixed(1)}</div>
                    <div className="badge">risk / 100</div>
                  </div>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <RiskBadge level={item.risk_level} />
                </div>
                {typeof item.cognitive_score === "number" && (
                  <p className="muted" style={{ marginTop: "0.75rem" }}>
                    Overall cognitive score: <strong>{item.cognitive_score.toFixed(1)}/100</strong>
                  </p>
                )}
                <div className="tag-row" style={{ marginTop: "0.75rem" }}>
                  <span className="tag">Speech + cognitive features</span>
                  <span className="tag">
                    Created{" "}
                    {new Date(item.created_at || Date.now()).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <div className="col">
                <h1 className="h1">Screening #{item.session_id || item.id}</h1>
                {item.category_scores && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <h2 className="h2">Category scores</h2>
                    <div className="stack">
                      {Object.entries(item.category_scores).map(([key, value]) => {
                        const v = typeof value === "number" ? value : 0;
                        return (
                          <div key={key}>
                            <div className="badge" style={{ textTransform: "capitalize", marginBottom: "0.25rem" }}>
                              {key} · {v.toFixed(1)}/100
                            </div>
                            <div className="progress-track">
                              <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <hr className="divider" />
                <h2 className="h2">Model summary</h2>
                <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
                  {cleanExplanation}
                </p>
                <h2 className="h2">Doctor-style recommendation</h2>
                <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
                  {item.recommendation}
                </p>
                <div className="badge" style={{ marginTop: "0.75rem" }}>
                  This mock model is for educational and self-reflective purposes only. It cannot diagnose dementia or replace
                  clinical assessment.
                </div>
              </div>
            </div>
          </>
        );
        })()}
      </div>
    </div>
  );
}

