from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.database import init_db
from src.routers import auth_router, projects_router, dashboard_router

# Inicializar Banco de Dados
init_db()

app = FastAPI(title="DashMaster API")

# Configurar CORS
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, restrinja isso
    allow_credentials=True,
    allow_methods=["POST"],
)

# Incluir Rotas
app.include_router(auth_router, prefix="/api/auth")
app.include_router(projects_router.router, prefix="/api")
app.include_router(dashboard_router.router, prefix="/api")

# Montar arquivos estáticos (Frontend)
# Importante: html=True permite acessar index.html na raiz
app.mount("/", StaticFiles(directory="public", html=True), name="public")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
