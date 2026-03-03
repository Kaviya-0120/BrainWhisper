from __future__ import annotations

import json
import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.schemas import AnalyzeRequest, AnalyzeResponse, TestSessionOut
from app.core.config import settings
from app.db.session import get_db
from app.models.test_session import TestSession
from app.models.user import User
from app.services.analysis import (
    combine_into_risk,
    dumps_json,
    extract_mock_speech_features,
    score_cognitive_payload,
)


router = APIRouter(prefix="/tests", tags=["tests"])


def _save_upload(file: UploadFile) -> tuple[str, int]:
    os.makedirs(settings.uploads_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1].lower()
    safe_name = f"{uuid.uuid4().hex}{ext or '.webm'}"
    path = os.path.join(settings.uploads_dir, safe_name)

    size = 0
    with open(path, "wb") as f:
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            f.write(chunk)
    return safe_name, size


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_json(
    payload: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cognitive_score, cog_details = score_cognitive_payload(payload.cognitive)
    speech_features = extract_mock_speech_features(transcript=payload.transcript, audio_bytes_len=None)
    risk = combine_into_risk(cognitive_score_0_100=cognitive_score, speech_features=speech_features)

    session = TestSession(
        user_id=current_user.id,
        speech_filename=None,
        speech_transcript=payload.transcript,
        speech_features_json=dumps_json(speech_features),
        cognitive_payload_json=dumps_json(payload.cognitive or {}),
        cognitive_score=cognitive_score,
        risk_score=risk.risk_score,
        risk_level=risk.risk_level,
        explanation=risk.explanation + f" Cognitive details: {json.dumps(cog_details)}",
        recommendation=risk.recommendation,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return AnalyzeResponse(
        session_id=session.id,
        risk_score=session.risk_score,
        risk_level=session.risk_level,
        explanation=session.explanation,
        recommendation=session.recommendation,
        cognitive_score=session.cognitive_score,
        category_scores=cog_details.get("categories"),
    )


@router.post("/analyze-audio", response_model=AnalyzeResponse)
async def analyze_audio(
    audio: UploadFile = File(...),
    cognitive_json: str = Form(...),
    transcript: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        cognitive_payload = json.loads(cognitive_json) if cognitive_json else {}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid cognitive_json")

    filename, audio_len = _save_upload(audio)

    cognitive_score, cog_details = score_cognitive_payload(cognitive_payload)
    speech_features = extract_mock_speech_features(transcript=transcript, audio_bytes_len=audio_len)
    risk = combine_into_risk(cognitive_score_0_100=cognitive_score, speech_features=speech_features)

    session = TestSession(
        user_id=current_user.id,
        speech_filename=filename,
        speech_transcript=transcript,
        speech_features_json=dumps_json(speech_features),
        cognitive_payload_json=dumps_json(cognitive_payload or {}),
        cognitive_score=cognitive_score,
        risk_score=risk.risk_score,
        risk_level=risk.risk_level,
        explanation=risk.explanation + f" Cognitive details: {json.dumps(cog_details)}",
        recommendation=risk.recommendation,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return AnalyzeResponse(
        session_id=session.id,
        risk_score=session.risk_score,
        risk_level=session.risk_level,
        explanation=session.explanation,
        recommendation=session.recommendation,
        cognitive_score=session.cognitive_score,
        category_scores=cog_details.get("categories"),
    )


@router.get("/history", response_model=list[TestSessionOut])
def history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(TestSession)
        .filter(TestSession.user_id == current_user.id)
        .order_by(TestSession.created_at.desc())
        .limit(50)
        .all()
    )
    result: list[TestSessionOut] = []
    for s in sessions:
        try:
            payload = json.loads(s.cognitive_payload_json or "{}")
            _, cog_details = score_cognitive_payload(payload)
            cat_scores = cog_details.get("categories")
        except Exception:
            cat_scores = None
        result.append(
            TestSessionOut(
                id=s.id,
                created_at=s.created_at,
                risk_score=s.risk_score,
                risk_level=s.risk_level,
                explanation=s.explanation,
                recommendation=s.recommendation,
                cognitive_score=s.cognitive_score,
                category_scores=cat_scores,
            )
        )
    return result


@router.get("/{session_id}", response_model=TestSessionOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = (
        db.query(TestSession)
        .filter(TestSession.id == session_id, TestSession.user_id == current_user.id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        payload = json.loads(s.cognitive_payload_json or "{}")
        _, cog_details = score_cognitive_payload(payload)
        cat_scores = cog_details.get("categories")
    except Exception:
        cat_scores = None
    return TestSessionOut(
        id=s.id,
        created_at=s.created_at,
        risk_score=s.risk_score,
        risk_level=s.risk_level,
        explanation=s.explanation,
        recommendation=s.recommendation,
        cognitive_score=s.cognitive_score,
        category_scores=cat_scores,
    )

