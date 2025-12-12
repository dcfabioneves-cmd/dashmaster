from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel
from src.database import get_db
from src.models import Project, User
from src.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

class ProjectBase(BaseModel):
    name: str
    spreadsheet_url: str
    categories: List[str]
    settings: Optional[dict] = {}

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    spreadsheet_url: Optional[str] = None
    categories: Optional[List[str]] = None
    settings: Optional[dict] = None
    is_archived: Optional[bool] = None
    is_active: Optional[bool] = None

class ProjectOut(ProjectBase):
    id: int
    owner_id: int
    is_archived: bool
    is_active: bool
    class Config:
        orm_mode = True

@router.get("", response_model=List[ProjectOut])
async def get_my_projects(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Em async, não podemos confiar no lazy loading de current_user.projects
    # É mais seguro buscar diretamente na tabela de projetos
    result = await db.execute(select(Project).where(Project.owner_id == current_user.id))
    return result.scalars().all()

@router.post("", response_model=ProjectOut)
async def create_project(project: ProjectBase, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_project = Project(
        name=project.name,
        spreadsheet_url=project.spreadsheet_url,
        categories=project.categories,
        owner_id=current_user.id
    )
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Buscar o projeto e verificar se pertence ao usuário
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado ou você não tem permissão para excluí-lo.")
    
    await db.delete(project)
    await db.commit()
    return None

@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: int, project_update: ProjectUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Buscar o projeto e verificar se pertence ao usuário
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")
    
    # Atualizar campos
    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    
    await db.commit()
    await db.refresh(project)
    return project
