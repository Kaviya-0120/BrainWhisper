import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import SpeechRecorder from "../components/SpeechRecorder.jsx";
import { analyzeAudio, analyzeJson } from "../api.js";
import { useAuth } from "../auth.jsx";

function MicroTests({ onChange, submitted }) {
  // --- Memory Test ---
  const WORD_POOL = [
    "river", "cloud", "garden", "mirror", "piano", "ocean", "silver", "forest", "candle", "bridge",
    "mountain", "valley", "sunset", "whisper", "lantern", "crystal", "journey", "harbor", "feather", "anchor",
    "safari", "temple", "orchard", "breeze", "statue", "canvas", "riddle", "legend", "pioneer", "stellar"
  ];
  const [memoryWords, setMemoryWords] = useState([]);
  const [memoryStarted, setMemoryStarted] = useState(false);
  const [memoryVisible, setMemoryVisible] = useState(false);
  const [memoryTimer, setMemoryTimer] = useState(10);
  const [memoryInput, setMemoryInput] = useState("");

  const startMemoryTest = () => {
    const randomWords = [...WORD_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
    setMemoryWords(randomWords);
    setMemoryStarted(true);
    setMemoryVisible(true);
    setMemoryTimer(10);
  };

  // --- Pattern Recognition ---
  const PATTERN_POOL = [
    { seq: "2, 4, 8, 16, ?", options: [24, 30, 32], correct: 32 },
    { seq: "1, 4, 9, 16, ?", options: [20, 25, 30], correct: 25 },
    { seq: "10, 20, 40, 70, ?", options: [100, 110, 120], correct: 110 },
    { seq: "2, 3, 5, 8, ?", options: [11, 12, 13], correct: 13 },
  ];
  const [patternData] = useState(() => PATTERN_POOL[Math.floor(Math.random() * PATTERN_POOL.length)]);
  const [patternChoice, setPatternChoice] = useState(null);

  // --- Reaction Time ---
  const [reactionState, setReactionState] = useState("idle");
  const [reactionStart, setReactionStart] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);

  // --- Logical Reasoning ---
  const LOGIC_POOL = [
    { q: "Bird is to Sky as Fish is to…?", options: ["Forest", "Desert", "Ocean", "Mountain"], correct: 2 },
    { q: "Book is to Reading as Fork is to…?", options: ["Writing", "Eating", "Sleeping", "Driving"], correct: 1 },
    { q: "Hand is to Glove as Foot is to…?", options: ["Sock", "Hat", "Shirt", "Belt"], correct: 0 },
    { q: "Cold is to Ice as Hot is to…?", options: ["Water", "Steam", "Stone", "Wood"], correct: 1 },
  ];
  const [logicData] = useState(() => LOGIC_POOL[Math.floor(Math.random() * LOGIC_POOL.length)]);
  const [logicChoice, setLogicChoice] = useState(null);

  // --- Attention Test ---
  const TARGET_POOL = ["A", "B", "C", "D", "E"];
  const [targetLetter] = useState(() => TARGET_POOL[Math.floor(Math.random() * TARGET_POOL.length)]);
  const [attentionGrid] = useState(() => {
    const chars = "ABCDE";
    let grid = "";
    for (let i = 0; i < 24; i++) {
      grid += chars[Math.floor(Math.random() * chars.length)];
    }
    return grid;
  });
  const trueCount = useMemo(() => attentionGrid.split("").filter((c) => c === targetLetter).length, [attentionGrid, targetLetter]);
  const [attentionAnswer, setAttentionAnswer] = useState("");

  // Memory countdown
  useEffect(() => {
    if (!memoryVisible) return;
    if (memoryTimer <= 0) {
      setMemoryVisible(false);
      return;
    }
    const id = setTimeout(() => setMemoryTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [memoryVisible, memoryTimer]);

  const startReaction = () => {
    if (reactionState !== "idle") return;
    setReactionState("waiting");
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      setReactionState("go");
      setReactionStart(performance.now());
    }, delay);
  };

  const clickReaction = () => {
    if (reactionState !== "go" || !reactionStart) return;
    const ms = performance.now() - reactionStart;
    setReactionTimes((prev) => [...prev, Math.round(ms)].slice(-3));
    setReactionState("idle");
    setReactionStart(null);
  };

  const memoryScore = useMemo(() => {
    if (!memoryWords.length) return { correct: 0, total: 5, score: 0 };
    const expected = new Set(memoryWords.map((w) => w.toLowerCase()));
    const recalled = new Set(
      memoryInput
        .split(/[,\s]+/)
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean)
    );
    let correct = 0;
    recalled.forEach((w) => {
      if (expected.has(w)) correct += 1;
    });
    return { correct, total: memoryWords.length, score: (correct / memoryWords.length) * 100 || 0 };
  }, [memoryInput, memoryWords]);

  const patternScore = useMemo(() => {
    const correct = patternChoice === patternData.correct ? 1 : 0;
    return { correct, total: 1, score: correct * 100 };
  }, [patternChoice, patternData]);

  const reactionScore = useMemo(() => {
    if (!reactionTimes.length) return { avgMs: null, score: 0 };
    const avg = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    const clamped = Math.min(Math.max(avg, 250), 1500);
    const score = ((1500 - clamped) / (1500 - 250)) * 100;
    return { avgMs: Math.round(avg), score: score || 0 };
  }, [reactionTimes]);

  const logicScore = useMemo(() => {
    const correct = logicChoice === logicData.correct ? 1 : 0;
    return { correct, total: 1, score: correct * 100 };
  }, [logicChoice, logicData]);

  const attentionScore = useMemo(() => {
    const num = parseInt(attentionAnswer, 10);
    const correct = Number.isFinite(num) && num === trueCount ? 1 : 0;
    return { correct, total: 1, score: correct * 100 };
  }, [attentionAnswer, trueCount]);

  const payload = useMemo(
    () => ({
      memory: {
        ...memoryScore,
        shownWords: memoryWords,
        input: memoryInput,
      },
      pattern: {
        ...patternScore,
        choice: patternChoice,
        patternSeq: patternData.seq
      },
      reaction: {
        score: reactionScore.score,
        avgMs: reactionScore.avgMs,
        trials: reactionTimes,
      },
      logic: {
        ...logicScore,
        choice: logicChoice,
        question: logicData.q
      },
      attention: {
        ...attentionScore,
        targetLetter,
        trueCount,
        userCount: attentionAnswer,
      },
    }),
    [
      attentionAnswer,
      attentionScore,
      logicChoice,
      logicScore,
      logicData,
      memoryInput,
      memoryScore,
      memoryWords,
      patternChoice,
      patternData,
      patternScore,
      reactionScore,
      reactionTimes,
      targetLetter,
      trueCount,
    ]
  );

  useEffect(() => {
    onChange(payload);
  }, [onChange, payload]);

  const completedCategories =
    (memoryInput ? 1 : 0) +
    (patternChoice != null ? 1 : 0) +
    (reactionTimes.length ? 1 : 0) +
    (logicChoice != null ? 1 : 0) +
    (attentionAnswer ? 1 : 0);

  const totalCategories = 5;
  const progress = (completedCategories / totalCategories) * 100;

  return (
    <div className="stack">
      <div className="stack">
        <div className="badge">
          Cognitive test progress:{" "}
          <strong>
            {completedCategories}/{totalCategories} categories
          </strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="microtest-question">
        <strong>A. Memory test</strong>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          You will see 5 random words for 10 seconds. Try to remember as many as you can.
        </p>

        {!memoryStarted ? (
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem' }} onClick={startMemoryTest}>
            Start Memory Test
          </button>
        ) : memoryVisible ? (
          <>
            <div className="badge" style={{ marginTop: "0.4rem", fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {memoryWords.join(" · ")}
            </div>
            <div className="badge" style={{ color: '#f87171' }}>Hiding in {memoryTimer}s…</div>
          </>
        ) : (
          <div style={{ marginTop: '0.5rem' }}>
            <label className="label">Type the words you remember (comma or space separated)</label>
            <input
              className="input"
              placeholder="e.g. river, garden, piano…"
              value={memoryInput}
              onChange={(e) => setMemoryInput(e.target.value)}
              autoFocus
            />
            <div className="badge" style={{ marginTop: '0.5rem' }}>
              Correct so far: {memoryScore.correct}/{memoryScore.total}
            </div>
          </div>
        )}
      </div>

      <div className="microtest-question">
        <strong>B. Pattern recognition</strong>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          What comes next in the pattern: {patternData.seq}
        </p>
        <div className="chip-row" style={{ marginTop: "0.4rem" }}>
          {patternData.options.map((opt, idx) => {
            const isSelected = patternChoice === idx;
            const correctIdx = patternData.correct; // Wait, patternChoice should be the value or index? 
            // In original code patternChoice was opt.value. Let's stick to value for pattern.
            const isSelectedVal = patternChoice === opt;
            let extraClass = "";
            if (submitted) {
              if (opt === patternData.correct) extraClass = " option-card-correct";
              if (isSelectedVal && opt !== patternData.correct) extraClass = " option-card-incorrect";
            } else if (isSelectedVal) {
              extraClass = " option-card-selected";
            }
            return (
              <button
                key={opt}
                type="button"
                className={`option-card${extraClass}`}
                onClick={() => setPatternChoice(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="microtest-question">
        <strong>C. Reaction time</strong>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Click &quot;Start&quot; and wait. When the box turns green and says &quot;Tap now!&quot;, click it as fast as
          you can.
        </p>
        <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={startReaction}
            disabled={reactionState !== "idle"}
          >
            Start trial
          </button>
          <div
            onClick={clickReaction}
            style={{
              width: 120,
              height: 40,
              borderRadius: 12,
              cursor: reactionState === "go" ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: reactionState === "go" ? "#22c55e" : "#111827",
              color: reactionState === "go" ? "#022c22" : "#e5e7eb",
              fontSize: 12,
              fontWeight: 500,
              border: "1px solid rgba(148,163,184,0.5)",
            }}
          >
            {reactionState === "idle" && "Waiting…"}
            {reactionState === "waiting" && "Get ready…"}
            {reactionState === "go" && "Tap now!"}
          </div>
          {reactionScore.avgMs != null && <span className="badge">Avg: {reactionScore.avgMs} ms</span>}
        </div>
      </div>

      <div className="microtest-question">
        <strong>D. Logical reasoning</strong>
        <p className="muted" style={{ marginTop: "0.35rem" }}>{logicData.q}</p>
        <div className="chip-row" style={{ marginTop: "0.4rem" }}>
          {logicData.options.map((opt, idx) => {
            const isSelected = logicChoice === idx;
            const correctIdx = logicData.correct;
            let extraClass = "";
            if (submitted) {
              if (idx === correctIdx) extraClass = " option-card-correct";
              if (isSelected && idx !== correctIdx) extraClass = " option-card-incorrect";
            } else if (isSelected) {
              extraClass = " option-card-selected";
            }
            return (
              <button
                key={opt}
                type="button"
                className={`option-card${extraClass}`}
                onClick={() => setLogicChoice(idx)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="microtest-question">
        <strong>E. Attention test</strong>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Count how many times the letter &quot;{targetLetter}&quot; appears in this grid:
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 4,
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          {attentionGrid.split("").map((c, idx) => (
            <div
              key={`${c}-${idx}`}
              style={{
                textAlign: "center",
                padding: 4,
                borderRadius: 6,
                background: "#0f172a",
                fontSize: 12,
                fontWeight: 500,
                color: "#e5e7eb",
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 180 }}>
          <label className="label">Your count</label>
          <input
            className="input"
            type="number"
            min={0}
            value={attentionAnswer}
            onChange={(e) => setAttentionAnswer(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default function NewTestPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [cognitive, setCognitive] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const runAnalysis = async () => {
    setError("");
    setLoading(true);
    try {
      let result;
      setSubmitted(true);
      if (audioFile) {
        result = await analyzeAudio(token, audioFile, cognitive, transcript);
      } else {
        result = await analyzeJson(token, {
          transcript: transcript || null,
          cognitive,
        });
      }
      navigate(`/history/${result.session_id}`, { state: result });
    } catch (err) {
      setError(err.message || "Unable to analyze");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <TopBar />
      <div className="card">
        <h1 className="h1">New pre-screening</h1>
        <p className="muted">
          Record or upload a short sample of your speech, complete structured micro-tests, then generate a{" "}
          <span style={{ fontWeight: 500 }}>mock dementia risk estimate</span>.
        </p>
        <div className="row" style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          <div className="col" style={{ minWidth: 0 }}>
            <h2 className="h2">1. Speech sample</h2>
            <p className="muted">
              Talk aloud for ~30 seconds about your day, a recent memory, or something you&apos;re planning.
            </p>
            <SpeechRecorder onAudioReady={setAudioFile} />
            <div style={{ margin: "0.75rem 0" }}>
              <label className="label">Or upload audio</label>
              <input type="file" accept="audio/*" onChange={onFileChange} />
            </div>
            {audioFile && (
              <div className="badge">
                Selected audio: <strong>{audioFile.name}</strong>
              </div>
            )}
            <div style={{ marginTop: "0.75rem" }}>
              <label className="label">Optional manual transcript</label>
              <textarea
                className="input"
                rows={3}
                style={{ resize: "vertical" }}
                placeholder="Rough notes of what was said (optional)…"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
          </div>
          <div className="col" style={{ minWidth: 0 }}>
            <h2 className="h2">2. Cognitive micro-tests</h2>
            <p className="muted">
              Simple, 2–3 minute tasks covering recall, pattern recognition, reaction time, and reasoning.
            </p>
            <MicroTests onChange={setCognitive} submitted={submitted} />
          </div>
        </div>
        <hr className="divider" />
        {error && <div className="error-text" style={{ marginBottom: "0.5rem" }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <div className="badge">
            This is a <strong>research prototype</strong>. Results are indicative only and must be discussed with a
            clinician.
          </div>
          <button className="btn btn-primary" type="button" onClick={runAnalysis} disabled={loading}>
            {loading ? "Analyzing…" : "Generate risk estimate"}
          </button>
        </div>
      </div>
    </div>
  );
}

