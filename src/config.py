import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback_secret")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

    # ====== DATABASE (SUPABASE) ======
    database_url = "postgresql://postgres:mCVdXvXIydx1WmNB@db.bbmtemwerrgcdhgkisfm.supabase.co:5432/postgres"

    # Ajuste automático se vier com prefixo errado
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    DATABASE_URL: str = database_url

    # ====== GOOGLE CREDENTIALS ======
    CREDENTIALS_PATH: str = "credentials/service_account.json"

settings = Settings()
