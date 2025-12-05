from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from src.database import get_db, Project, User
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
def get_my_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return current_user.projects

@router.post("/", response_model=ProjectOut)
def create_project(project: ProjectBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_project = Project(
        name=project.name,
        spreadsheet_url=project.spreadsheet_url,
        categories=project.categories,
        owner_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project