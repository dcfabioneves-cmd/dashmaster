from fastapi import APIRouter, Depends, HTTPException
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

class ProjectOut(ProjectBase):
    id: int
    owner_id: int
    class Config:
        orm_mode = True

@router.get("/", response_model=List[ProjectOut])
async def get_my_projects(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Em async, não podemos confiar no lazy loading de current_user.projects
    # É mais seguro buscar diretamente na tabela de projetos
    result = await db.execute(select(Project).where(Project.owner_id == current_user.id))
    return result.scalars().all()

@router.post("/", response_model=ProjectOut)
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
