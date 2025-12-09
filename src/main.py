# src/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

from src.database import init_db, engine
from src.routers.auth_router import router as auth_router
from src.routers.projects_router import router as projects_router
from src.routers.dashboard_router import router as dashboard_router

# Cria tabelas se não existirem
from src.models import Base
Base.metadata.create_all(bind=engine)

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

# Para execução local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
