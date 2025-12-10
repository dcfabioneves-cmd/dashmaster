# src/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio

from src.database import engine
from src.routers.auth_router import router as auth_router
from src.routers.projects_router import router as projects_router
from src.routers.dashboard_router import router as dashboard_router
from src.models import Base

app = FastAPI(title="DashMaster API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restrinja!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth_router, prefix="/api/auth")
app.include_router(projects_router, prefix="/api/projects")
app.include_router(dashboard_router, prefix="/api/dashboard")

# Frontend estático
app.mount("/", StaticFiles(directory="public", html=True), name="public")

# Cria tabelas se não existirem (Async)
@app.on_event("startup")
async def startup_event():
    # Isso permite que as tabelas sejam criadas mesmo com o motor async
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Para execução local
if __name__ == "__main__":
    import uvicorn
    
    # Wrapper para criar tabelas antes de iniciar (caso não use o evento de startup do FastAPI no uvicorn puro)
    async def main():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
    
    # Se já existir loop rodando (ex: notebooks), use-o, senão crie novo
    try:
        asyncio.run(main())
    except RuntimeError:
        # Fallback simples se asyncio.run falhar por loop existente
        uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
