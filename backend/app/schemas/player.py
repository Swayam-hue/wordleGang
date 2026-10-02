from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PlayerCreate(BaseModel):
    name: str
    group_id: Optional[str] = None

class PlayerResponse(BaseModel):
    id: str
    name: str
    group_id: Optional[str] = None
    created_at: Optional[datetime] = None

