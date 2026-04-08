from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    phone: str
    name: Optional[str] = None
    email: Optional[str] = None
    language: str = "en"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"