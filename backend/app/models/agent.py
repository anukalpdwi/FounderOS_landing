from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class AgentStatus(str, Enum):
    ACTIVE = "active"
    IDLE = "idle"
    PAUSED = "paused"
    ERROR = "error"

class AgentBase(BaseModel):
    name: str
    role: str
    status: AgentStatus = AgentStatus.IDLE
    avatar: str
    cost: str
    models: List[str] = []

class Agentcreate(AgentBase):
    pass

class Agent(AgentBase):
    id: str
    efficiency: int
    tasks_completed: int = Field(alias="tasksCompleted") # Map to frontend camelCase
    current_task: Optional[str] = Field(None, alias="currentTask")
    last_active: Optional[str] = Field(None, alias="lastActive")

    class Config:
        populate_by_name = True
