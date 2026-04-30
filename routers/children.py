from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Child, User
from schemas import ChildCreate, ChildResponse
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/v1/children", tags=["Children"])

@router.post("/", response_model=ChildResponse)
def create_child(child: ChildCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_child = Child(name=child.name, age=child.age, parent_id=current_user.id)
    db.add(new_child)
    db.commit()
    db.refresh(new_child)
    return new_child

@router.get("/", response_model=list[ChildResponse])
def get_my_children(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    children = db.query(Child).filter(Child.parent_id == current_user.id).all()
    return children