const defaultBase = "http://localhost:8000";
const rawBase = import.meta.env.VITE_API_BASE || defaultBase;
export const apiBase = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

async function handle(resp) {
  if (!resp.ok) {
    let msg = `HTTP ${resp.status}`;
    try {
      const data = await resp.json();
      msg = data.detail || JSON.stringify(data);
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  if (resp.status === 204) return null;
  return resp.json();
}

export async function registerRequest(email, password, fullName) {
  const resp = await fetch(`${apiBase}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName || null }),
  });
  return handle(resp);
}

export async function loginRequest(email, password) {
  const resp = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handle(resp);
  return data.access_token;
}

export async function meRequest(token) {
  const resp = await fetch(`${apiBase}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(resp);
}

export async function historyRequest(token) {
  const resp = await fetch(`${apiBase}/tests/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(resp);
}

export async function sessionDetailRequest(token, id) {
  const resp = await fetch(`${apiBase}/tests/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(resp);
}

export async function analyzeJson(token, payload) {
  const resp = await fetch(`${apiBase}/tests/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handle(resp);
}

export async function analyzeAudio(token, file, cognitive, transcript) {
  const form = new FormData();
  form.append("audio", file);
  form.append("cognitive_json", JSON.stringify(cognitive));
  if (transcript) form.append("transcript", transcript);
  const resp = await fetch(`${apiBase}/tests/analyze-audio`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return handle(resp);
}

