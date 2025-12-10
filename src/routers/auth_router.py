# src/routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from datetime import timedelta

from src.database import get_db
from src.models import User
from src.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(tags=["Authentication"])

class UserCreate(BaseModel):
    email: str
    password: str
    # full_name removido do modelo no passo anterior, trocado por username? 
    # O modelo atual tem username e email. O form de registro precisa bater.
    # Vou assumir que o usuario quer username agora.
    username: str
    full_name: str = None # Mantendo opcional para compatibilidade ou removendo? 
    # O modelo do passo 186/191 tem 'username' e NÃO tem 'full_name'.
    # Vou adaptar o registro para pedir username e email.

@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Verifica se usuário já existe (por email ou username)
    # Async select
    result = await db.execute(select(User).where((User.email == user.email) | (User.username == user.username)))
    db_user = result.scalars().first()
    
    if db_user:
        raise HTTPException(status_code=400, detail="Email ou Username já registrado")
    
    # Cria novo usuário
    hashed_pwd = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        username=user.username,
        # full_name removido do model
        hashed_password=hashed_pwd
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"message": "Usuário criado com sucesso", "user_id": new_user.id}

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "created_at": current_user.created_at
    }

@router.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    # OAuth2PasswordRequestForm usa 'username' como campo de login (pode ser email)
    # Vamos buscar por email ou username
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user:
        # Tenta buscar por username
         result = await db.execute(select(User).where(User.username == form_data.username))
         user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/Username ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_email": user.email,
        "user_name": user.username
    }
