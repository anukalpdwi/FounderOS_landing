from fastapi import APIRouter, HTTPException
from typing import List
from ...models.agent import Agent, AgentStatus

router = APIRouter()

# Mock Data (In-memory storage for now, will replace with Supabase)
MOCK_AGENTS_DB = [
    {
        "id": "1",
        "name": "Marketing Director",
        "role": "Growth & Social",
        "status": "active",
        "efficiency": 98,
        "tasksCompleted": 1420,
        "cost": "$0.04/task",
        "avatar": "📣",
        "currentTask": "Analyzing viral trends on Twitter (X)...",
        "models": ["GPT-4", "DALL-E 3", "Twitter API"],
        "lastActive": "Now"
    },
    {
        "id": "2",
        "name": "Sales Development",
        "role": "Outbound Leads",
        "status": "paused",
        "efficiency": 85,
        "tasksCompleted": 840,
        "cost": "$0.12/lead",
        "avatar": "💼",
        "currentTask": "Waiting for new criteria...",
        "models": ["Claude 3", "LinkedIn", "Search"],
        "lastActive": "2h ago"
    },
     {
        "id": "3",
        "name": "Market Researcher",
        "role": "Data Analysis",
        "status": "idle",
        "efficiency": 92,
        "tasksCompleted": 340,
        "cost": "$0.08/query",
        "avatar": "🔬",
        "currentTask": None,
        "models": ["Gemini Ultra", "Bing Search", "Scraper"],
        "lastActive": "15m ago"
    },
    {
        "id": "4",
        "name": "Content Strategist",
        "role": "Blog & SEO",
        "status": "active",
        "efficiency": 95,
        "tasksCompleted": 650,
        "cost": "$0.06/article",
        "avatar": "✍️",
        "currentTask": "Drafting 'AI Trends 2026' outline...",
        "models": ["GPT-4", "SEO API", "Grammarly"],
        "lastActive": "Now"
    }
]

@router.get("/", response_model=List[Agent])
async def get_agents():
    """Fetch all AI agents."""
    return MOCK_AGENTS_DB

@router.post("/{agent_id}/toggle", response_model=Agent)
async def toggle_agent_status(agent_id: str):
    """Pause or Resume an agent."""
    for agent in MOCK_AGENTS_DB:
        if agent["id"] == agent_id:
            current = agent["status"]
            new_status = "paused" if current == "active" else "active"
            agent["status"] = new_status
            
            # Update current task if paused
            if new_status == "paused":
                agent["currentTask"] = "Paused by user."
            elif new_status == "active" and agent["currentTask"] == "Paused by user.":
                 agent["currentTask"] = "Resuming operations..."
            
            return agent
    
    raise HTTPException(status_code=404, detail="Agent not found")
