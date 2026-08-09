from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    GROQ_API_KEY: str

    GROQ_LLM_MODEL: str

    VECTOR_DB_PATH: str

    CHUNK_SIZE: int

    CHUNK_OVERLAP: int

    EMBEDDING_MODEL: str

    class Config:

        env_file = "../.env"


@lru_cache
def get_settings():

    return Settings()


settings = get_settings()