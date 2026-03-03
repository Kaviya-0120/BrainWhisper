import React, { useEffect, useRef, useState } from "react";

export default function SpeechRecorder({ onAudioReady }) {
  const [recording, setRecording] = useState(false);
  const [support, setSupport] = useState(true);
  const [status, setStatus] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!("MediaRecorder" in window) || !navigator.mediaDevices) {
      setSupport(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const start = async () => {
    try {
      setStatus("Requesting microphone…");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "brainwhisper-recording.webm", { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioFile(file);
        setAudioUrl(url);
        setStatus("Recording saved. Preview and confirm before submitting.");
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setRecording(true);
      setStatus("Recording… speak naturally for 20–40 seconds.");
    } catch (e) {
      console.error(e);
      setStatus("Unable to access microphone.");
    }
  };

  const stop = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
      setRecording(false);
    }
  };

  const clearRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl("");
    setStatus("Recording discarded. You can record again.");
  };

  const confirmRecording = () => {
    if (!audioFile) return;
    onAudioReady(audioFile);
    setStatus("Recording confirmed. It will be used for analysis.");
  };

  if (!support) {
    return <div className="muted">Browser recording not available. You can still upload an audio file.</div>;
  }

  return (
    <div className="stack">
      <div className="audio-pill">
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "999px",
            background: recording ? "#f97316" : "#4b5563",
          }}
        />
        <span>{recording ? "Recording…" : audioFile ? "Recording ready" : "Microphone idle"}</span>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {!recording ? (
          <button className="btn btn-ghost btn-sm" type="button" onClick={start}>
            Start recording
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" type="button" onClick={stop}>
            Stop & save
          </button>
        )}
        {audioFile && (
          <>
            <button className="btn btn-ghost btn-sm" type="button" onClick={clearRecording}>
              Re-record
            </button>
          </>
        )}
      </div>
      {audioUrl && (
        <div className="stack">
          <audio ref={audioRef} controls src={audioUrl} />
          <div className="badge">Preview your recording, then confirm if you&apos;re satisfied.</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-sm" type="button" onClick={confirmRecording}>
              Yes, use this recording
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={clearRecording}>
              Re-record
            </button>
          </div>
        </div>
      )}
      {status && <div className="badge">{status}</div>}
    </div>
  );
}


