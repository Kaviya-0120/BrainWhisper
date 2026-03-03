import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { historyRequest } from "../api.js";
import { useAuth } from "../auth.jsx";

function RiskChip({ level }) {
  const cls =
    level === "High Risk" ? "risk-chip risk-high" : level === "Medium Risk" ? "risk-chip risk-medium" : "risk-chip risk-low";
  return <span className={cls}>{level}</span>;
}

export default function HistoryPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await historyRequest(token);
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Unable to load history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="page">
      <TopBar
        right={
          <Link className="btn btn-primary btn-sm" to="/new-test">
            New screening
          </Link>
        }
      />
      <div className="card">
        <h1 className="h1">Previous screenings</h1>
        <p className="muted">
          Track how your mock risk estimates evolve over time. Each entry includes risk level, explanation, and
          recommendation.
        </p>
        <hr className="divider" />
        {loading && <div className="badge">Loading…</div>}
        {error && <div className="error-text">{error}</div>}
        {!loading && !items.length && !error && <div className="badge">No sessions yet. Run your first screening.</div>}
        <ul className="list" style={{ marginTop: "0.5rem" }}>
          {items.map((it) => (
            <li key={it.id} className="list-item">
              <div>
                <div style={{ fontSize: "0.9rem" }}>
                  Session #{it.id} ·{" "}
                  <span className="muted">
                    {new Date(it.created_at).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="chip-row" style={{ marginTop: "0.2rem" }}>
                  <RiskChip level={it.risk_level} />
                  <span className="chip">Risk {it.risk_score.toFixed(1)}/100</span>
                  {typeof it.cognitive_score === "number" && (
                    <span className="chip">Cognitive {it.cognitive_score.toFixed(1)}/100</span>
                  )}
                </div>
              </div>
              <Link className="btn btn-ghost btn-sm" to={`/history/${it.id}`}>
                View details
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

