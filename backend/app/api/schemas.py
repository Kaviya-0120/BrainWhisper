from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=200)
    full_name: str | None = Field(default=None, max_length=200)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CognitivePayload(BaseModel):
    # Flexible payload from frontend micro-tests
    totalQuestions: int | None = None
    correct: int | None = None
    avgReactionMs: float | None = None
    memoryRecallCorrect: int | None = None
    patternCorrect: int | None = None
    logicCorrect: int | None = None
    raw: dict | None = None


class AnalyzeRequest(BaseModel):
    transcript: str | None = None
    cognitive: dict | None = None


class AnalyzeResponse(BaseModel):
    session_id: int
    risk_score: float
    risk_level: str
    explanation: str
    recommendation: str

    cognitive_score: float | None = None
    category_scores: dict | None = None


class TestSessionOut(BaseModel):
    id: int
    created_at: datetime
    risk_score: float
    risk_level: str
    explanation: str
    recommendation: str

    cognitive_score: float | None = None
    category_scores: dict | None = None

