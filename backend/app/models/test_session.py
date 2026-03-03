from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TestSession(Base):
    __tablename__ = "test_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    speech_filename: Mapped[str | None] = mapped_column(String(500), nullable=True)
    speech_transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    speech_features_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    cognitive_payload_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    cognitive_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    risk_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False, default="Low Risk")
    explanation: Mapped[str] = mapped_column(Text, nullable=False, default="")
    recommendation: Mapped[str] = mapped_column(Text, nullable=False, default="")

