from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = "sqlite:///./productivity.db"
    secret_key: str = "a7F3kL9xQ2mP8vR1tY6bH4cD0sN5wZJ"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    anthropic_api_key: str = "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"
    allowed_origins: str = "http://localhost:5173"

    @property
    def origins_list(self):
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache
def get_settings():
    return Settings()
