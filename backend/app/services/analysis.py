from __future__ import annotations

import json
from dataclasses import asdict, dataclass


@dataclass
class RiskResult:
    risk_score: float  # 0..100
    risk_level: str
    explanation: str
    recommendation: str


def extract_mock_speech_features(*, transcript: str | None, audio_bytes_len: int | None) -> dict:
    # Placeholder for ASR + NLP feature extraction.
    # We keep this deterministic and transparent for MVP.
    t = (transcript or "").strip()
    word_count = len([w for w in t.split() if w])
    char_count = len(t)
    size_kb = (audio_bytes_len or 0) / 1024.0
    return {
        "word_count": word_count,
        "char_count": char_count,
        "audio_size_kb": round(size_kb, 2),
        "has_transcript": bool(t),
    }


def score_cognitive_payload(payload: dict | None) -> tuple[float, dict]:
    """
    Scores a richer cognitive payload with multiple categories.
    Expected (flexible) shape from frontend:
      {
        "memory": {"score": number, ...},
        "pattern": {"score": number, ...},
        "reaction": {"score": number, ...},
        "logic": {"score": number, ...},
        "attention": {"score": number, ...},
        ...
      }
    """
    p = payload or {}
    category_scores: dict[str, float] = {}
    scores: list[float] = []

    for name in ["memory", "pattern", "reaction", "logic", "attention"]:
        cat = p.get(name) or {}
        s = float(cat.get("score") or 0.0)
        if s < 0:
            s = 0.0
        if s > 100:
            s = 100.0
        category_scores[name] = round(s, 1)
        scores.append(s)

    overall = sum(scores) / len(scores) if scores else 0.0
    overall = max(0.0, min(100.0, overall))

    details = {
        "overall_score": round(overall, 1),
        "categories": category_scores,
    }
    return round(overall, 1), details


def combine_into_risk(*, cognitive_score_0_100: float | None, speech_features: dict | None) -> RiskResult:
    cs = float(cognitive_score_0_100 or 0.0)
    sf = speech_features or {}

    # Mock risk: lower cognitive score increases risk.
    base_risk = 100.0 - cs  # 0..100

    # Small speech-based adjustment: very low word count / no transcript nudges risk up.
    wc = float(sf.get("word_count") or 0.0)
    has_transcript = bool(sf.get("has_transcript"))
    speech_penalty = 0.0
    if not has_transcript:
        speech_penalty += 8.0
    if wc and wc < 25:
        speech_penalty += 6.0
    if wc == 0 and has_transcript:
        speech_penalty += 4.0

    risk_score = min(max(base_risk + speech_penalty, 0.0), 100.0)

    if risk_score < 34:
        level = "Low Risk"
        reco = "No immediate concern from this screening. Maintain healthy routines and consider periodic re-screening."
    elif risk_score < 67:
        level = "Medium Risk"
        reco = "Consider discussing these results with a healthcare professional, especially if you notice memory or language changes."
    else:
        level = "High Risk"
        reco = "We recommend consulting a doctor or specialist for a clinical evaluation. This tool is not a diagnosis."

    explanation = (
        f"Mock model combined cognitive performance (score {cs:.1f}/100) "
        f"and speech indicators (word_count={int(sf.get('word_count') or 0)}, has_transcript={has_transcript}) "
        f"to estimate a risk score of {risk_score:.1f}/100."
    )
    return RiskResult(
        risk_score=round(risk_score, 1),
        risk_level=level,
        explanation=explanation,
        recommendation=reco,
    )


def dumps_json(data: dict) -> str:
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def dumps_dataclass(dc) -> str:
    return dumps_json(asdict(dc))

