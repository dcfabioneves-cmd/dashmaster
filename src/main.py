# src/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# IMPORTS CORRETOS DOS ROUTERS (cada arquivo deve expor `router`)
from src.routers.auth_router import router as auth_router
from src.routers.projects_router import router as projects_router
from src.routers.dashboard_router import router as dashboard_router

from src.database import init_db

# Inicializar Banco de Dados
init_db()

# Criar app
app = FastAPI(title="DashMaster API")

# Configurar CORS (em produção restringir allow_origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas com prefix único /api
app.include_router(auth_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

# Montar arquivos estáticos (Frontend)
app.mount("/", StaticFiles(directory="public", html=True), name="public")

# Execução local via python -m src.main
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
