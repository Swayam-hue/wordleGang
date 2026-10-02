from pydantic import BaseModel
from typing import Optional

class SubmissionCreate(BaseModel):
    player_id: str
    attempts: int
    solved: bool
    group_id: Optional[str] = None

class SubmissionResponse(BaseModel):
    id: str
    player_id: str
    attempts: int
    solved: bool
    score: Optional[int] = None
