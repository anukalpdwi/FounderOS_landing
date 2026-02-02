"""
Database Models and Schemas for FounderOS

These Pydantic models define the database structure.
In production, use SQLAlchemy or Supabase client.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from uuid import UUID, uuid4


# ============================================================================
# USER PROFILES
# ============================================================================

class UserProfile(BaseModel):
    """User's marketing profile with Writing DNA."""
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    
    # Writing DNA
    brand_voice: str = "professional"
    target_audience: str = "startup founders"
    topics: List[str] = []
    writing_dna: dict = {}  # Full WritingDNA as JSON
    
    # Connected platforms
    connected_platforms: List[str] = []
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# ============================================================================
# AGENT MEMORIES
# ============================================================================

class AgentMemory(BaseModel):
    """Long-term memory for the Marketing Agent."""
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    
    memory_type: Literal["semantic", "episodic", "procedural"]
    content: dict  # The memory content
    
    # For vector search
    embedding: Optional[List[float]] = None
    
    created_at: datetime = Field(default_factory=datetime.now)


# ============================================================================
# POSTS
# ============================================================================

class Post(BaseModel):
    """A social media post (pending, scheduled, or published)."""
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    
    # Content
    content: str
    platform: str
    content_type: str = "post"
    hashtags: List[str] = []
    media_urls: List[str] = []
    
    # Quality metrics
    authenticity_score: float = 0.0
    revision_count: int = 0
    
    # Status
    status: Literal["draft", "pending", "approved", "rejected", "scheduled", "posted", "failed"]
    
    # Scheduling
    scheduled_time: Optional[datetime] = None
    posted_at: Optional[datetime] = None
    
    # Platform response
    platform_post_id: Optional[str] = None
    platform_url: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# ============================================================================
# PLATFORM CREDENTIALS
# ============================================================================

class PlatformConnection(BaseModel):
    """OAuth credentials for a connected platform."""
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    
    platform: str  # x, instagram, facebook, linkedin, youtube, discord
    
    # OAuth tokens (encrypted in production)
    access_token: str
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    
    # Platform-specific IDs
    platform_user_id: Optional[str] = None
    page_id: Optional[str] = None  # For FB/IG pages
    channel_id: Optional[str] = None  # For YouTube
    webhook_url: Optional[str] = None  # For Discord
    
    # Status
    is_active: bool = True
    last_used_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.now)


# ============================================================================
# ANALYTICS
# ============================================================================

class PostAnalytics(BaseModel):
    """Analytics for a posted content."""
    id: UUID = Field(default_factory=uuid4)
    post_id: UUID
    
    # Engagement metrics
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    clicks: int = 0
    
    # Derived metrics
    engagement_rate: float = 0.0
    
    # Timestamps
    recorded_at: datetime = Field(default_factory=datetime.now)


# ============================================================================
# SUPABASE SQL SCHEMA
# ============================================================================

SUPABASE_SCHEMA = """
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles (Writing DNA)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    brand_voice TEXT DEFAULT 'professional',
    target_audience TEXT DEFAULT 'startup founders',
    topics JSONB DEFAULT '[]',
    writing_dna JSONB DEFAULT '{}',
    connected_platforms TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Agent Memories (Long-term memory)
CREATE TABLE agent_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('semantic', 'episodic', 'procedural')),
    content JSONB NOT NULL,
    embedding VECTOR(1536), -- For OpenAI embeddings
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts (Pending, Scheduled, Published)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    content TEXT NOT NULL,
    platform TEXT NOT NULL,
    content_type TEXT DEFAULT 'post',
    hashtags TEXT[] DEFAULT '{}',
    media_urls TEXT[] DEFAULT '{}',
    authenticity_score FLOAT DEFAULT 0.0,
    revision_count INT DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'scheduled', 'posted', 'failed')),
    scheduled_time TIMESTAMPTZ,
    posted_at TIMESTAMPTZ,
    platform_post_id TEXT,
    platform_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Connections (OAuth)
CREATE TABLE platform_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    platform TEXT NOT NULL,
    access_token TEXT NOT NULL, -- Encrypt in production!
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    platform_user_id TEXT,
    page_id TEXT,
    channel_id TEXT,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Post Analytics
CREATE TABLE post_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    clicks INT DEFAULT 0,
    engagement_rate FLOAT DEFAULT 0.0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_platform ON posts(platform);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_time) WHERE status = 'scheduled';
CREATE INDEX idx_memories_user ON agent_memories(user_id);
CREATE INDEX idx_connections_user ON platform_connections(user_id);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users see own profiles" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own posts" ON posts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own connections" ON platform_connections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own memories" ON agent_memories
    FOR ALL USING (auth.uid() = user_id);
"""
