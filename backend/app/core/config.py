from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="BRAINWHISPER_", case_sensitive=False)

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_access_token_minutes: int = 60 * 24 * 7

    db_url: str = "sqlite:///./data/brainwhisper.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    uploads_dir: str = "./uploads"

    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

