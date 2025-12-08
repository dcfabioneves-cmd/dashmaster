# src/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from src.routers.auth_router import router as auth_router
from src.routers.projects_router import router as projects_router
from src.routers.dashboard_router import router as dashboard_router

from src.database import init_db

app = FastAPI(title="DashMaster API")

# 🔥 Inicializar DB no startup (único jeito correto no Render)
@app.on_event("startup")
def on_startup():
    print("🔧 Initializing database…")
    init_db()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

# Frontend
app.mount("/", StaticFiles(directory="public", html=True), name="public")

# Execução local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
