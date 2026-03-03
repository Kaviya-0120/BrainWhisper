from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, tests, users
from app.core.config import settings
from app.db.session import engine
from app.models import test_session, user  # noqa: F401  (import for metadata)
from app.db.base import Base


def create_app() -> FastAPI:
    app = FastAPI(title="BrainWhisper API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(tests.router)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()


@app.on_event("startup")
def _startup():
    os.makedirs("./data", exist_ok=True)
    os.makedirs(settings.uploads_dir, exist_ok=True)
    Base.metadata.create_all(bind=engine)

