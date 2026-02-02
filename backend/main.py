from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from both current dir and parent dir
load_dotenv()  # Try current dir first
load_dotenv(Path(__file__).resolve().parent.parent / ".env")  # Then parent (root project)

# Scheduler lifecycle management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the auto-posting scheduler
    from app.services.scheduler import start_scheduler
    start_scheduler()
    yield
    # Shutdown: Stop the scheduler
    from app.services.scheduler import stop_scheduler
    stop_scheduler()

app = FastAPI(
    title="FounderOS API",
    description="Backend for FounderOS AI - The Intelligent Co-Founder",
    version="0.1.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.endpoints import agents
from app.api.endpoints import marketing
from app.api.endpoints import accounts

app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(marketing.router, prefix="/api/v1/marketing", tags=["marketing"])
app.include_router(accounts.router, prefix="/api/v1/accounts", tags=["accounts"])

@app.get("/")
async def root():
    return {"message": "FounderOS Neural Core Online", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0", "scheduler": "active"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
