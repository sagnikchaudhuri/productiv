from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = "sqlite:///./productivity.db"
    secret_key: str = " "
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    anthropic_api_key: str = " "
    allowed_origins: str = "http://localhost:5173"

    @property
    def origins_list(self):
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env.example"
        extra = "ignore"

@lru_cache
def get_settings():
    return Settings()
