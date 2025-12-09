import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback_secret")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    database_url = os.getenv("DATABASE_URL", "sqlite:///./dashmaster.db")
    # Fix para Render (SQLAlchemy requer postgresql:// mas Render fornece postgres://)
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        
    DATABASE_URL: str = database_url
    
    # Caminho para credenciais do Google
    CREDENTIALS_PATH: str = "credentials/service_account.json"

settings = Settings()
