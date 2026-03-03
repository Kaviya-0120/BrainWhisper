import React from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { useAuth } from "../auth.jsx";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="w-full min-h-screen px-10 py-8 flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome, {user?.full_name?.split(' ')[0] || 'Explorer'}</h1>
          <p className="text-slate-400 text-lg">
            Monitor your cognitive health with AI-powered insights.
          </p>
        </div>
        <Link className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }} to="/new-test">
          Start New Screening
        </Link>
      </div>

      {/* Stats Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Tests Completed', value: '12', color: '#6366f1' },
          { label: 'Average Risk', value: 'Low', color: '#22c55e' },
          { label: 'Last Screening', value: '2 days ago', color: '#a5b4fc' },
          { label: 'Health Score', value: '92/100', color: '#fbbf24' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 rounded-2xl border border-white/10 p-6 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</span>
            <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Main Content Stack */}
      <div className="flex flex-col gap-8">
        {/* Quick Actions Section */}
        <div className="w-full bg-slate-900 rounded-2xl border border-white/10 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-white">Quick Actions</h2>
              <p className="text-slate-400">Jump straight into your next cognitive evaluation.</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-8">
            <Link className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem', borderRadius: '1rem' }} to="/new-test">
              Begin AI Screening
            </Link>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">Evaluation Modules</span>
              <div className="flex gap-2">
                <span className="tag" style={{ padding: '0.4rem 0.8rem' }}>Speech Patterns</span>
                <span className="tag" style={{ padding: '0.4rem 0.8rem' }}>Short-term Memory</span>
                <span className="tag" style={{ padding: '0.4rem 0.8rem' }}>Visual Logic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Medical Note Section */}
        <div className="w-full bg-slate-900 rounded-2xl border border-white/10 p-8">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span>🩺</span> Important Medical Note
          </h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            BrainWhisper is a research-backed tool for <strong>pre-screening only</strong>. It analyzes vocal biomarkers and cognitive performance but is not a clinical diagnosis.
          </p>
          <div className="rounded-xl p-0 border-none">
            <span className="text-sm font-semibold text-slate-300 mb-2 block">Consult a specialist if:</span>
            <ul className="list gap-2">
              <li className="text-sm text-slate-400 flex gap-2"><span>•</span> Persistent memory lapses occur</li>
              <li className="text-sm text-slate-400 flex gap-2"><span>•</span> Risk levels remain elevated</li>
              <li className="text-sm text-slate-400 flex gap-2"><span>•</span> Daily tasks become challenging</li>
            </ul>
          </div>
        </div>

        {/* Recent Activity / Previous Sessions */}
        <div className="w-full bg-slate-900 rounded-2xl border border-white/10 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <Link className="text-indigo-400 text-sm font-semibold hover:underline" to="/history">View all</Link>
          </div>
          <div className="flex flex-col gap-0">
            {[
              { date: 'Oct 24, 2023', risk: 'Low', score: '94%' },
              { date: 'Oct 12, 2023', risk: 'Medium', score: '78%' },
              { date: 'Sep 28, 2023', risk: 'Low', score: '91%' },
            ].map((session, i) => (
              <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 transition-all">
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{session.date}</span>
                  <span className="text-xs text-slate-500">Screening Session</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${session.risk === 'Low' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {session.risk} Risk
                  </span>
                  <span className="text-sm font-mono text-slate-400">{session.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Brain Tips */}
        <div className="w-full bg-slate-900 rounded-2xl border border-white/10 p-8">
          <h2 className="text-xl font-bold mb-4 text-white">Daily Brain Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">🧩</div>
              <div>
                <h3 className="text-sm font-semibold text-white">Stay Curious</h3>
                <p className="text-xs text-slate-400">Learning a new skill or language helps build cognitive reserve and strengthens neural pathways.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400">🥗</div>
              <div>
                <h3 className="text-sm font-semibold text-white">Check Your Diet</h3>
                <p className="text-xs text-slate-400">Omega-3 fatty acids and antioxidants support long-term brain health and protect against cognitive decline.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

