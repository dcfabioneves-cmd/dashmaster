# src/database.py
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Obtém a URL do banco (com fallback para SQLite local async)
# Nota: SQLite async requer o driver 'aiosqlite'
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./dashmaster.db")

# Para asyncpg (Postgres), substitua "postgresql" por "postgresql+asyncpg"
if "postgresql://" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
elif "postgres://" in DATABASE_URL: # Render fornece postgres://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://")

# Configuração do Engine Async
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_async_engine(DATABASE_URL, echo=True, connect_args=connect_args)

# Sessão Async
SessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

Base = declarative_base()

# Dependência para injeção de dependência (yield session)
async def get_db():
    async with SessionLocal() as session:
        yield session
