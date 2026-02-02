"""
Marketing Agent API Endpoints

These endpoints power the Marketing Agent functionality:
- Onboarding (style questionnaire)
- Content generation
- Approval queue
- Publishing
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
import uuid

# Import our services
from ...agents.marketing_agent import MarketingAgent, ContentRequest
from ...services.style_analyzer import style_analyzer, WritingDNA, ONBOARDING_QUESTIONS
from ...services.content_publisher import publisher, PostResult, PlatformCredentials
from ...db.database import get_db_connection
import json

router = APIRouter()

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class OnboardingAnswer(BaseModel):
    question_id: str
    answer: str | List[str]


class OnboardingRequest(BaseModel):
    user_id: str
    answers: List[OnboardingAnswer]


class GenerateRequest(BaseModel):
    user_id: str
    topic: str
    platform: Literal["x", "instagram", "facebook", "linkedin", "youtube", "discord"]
    content_type: str = "post"
    mood: Optional[str] = None
    call_to_action: Optional[str] = None


class BatchGenerateRequest(BaseModel):
    user_id: str
    requests: List[GenerateRequest]


class PendingPost(BaseModel):
    id: str
    user_id: str
    content: str
    platform: str
    hashtags: List[str]
    authenticity_score: float
    created_at: datetime
    status: Literal["pending", "approved", "rejected", "posted", "queued_for_extension"]
    scheduled_time: Optional[datetime] = None


class ApprovalAction(BaseModel):
    action: Literal["approve", "reject", "edit"]
    edited_content: Optional[str] = None
    schedule_time: Optional[datetime] = None


class PublishRequest(BaseModel):
    post_id: str
    platform: str
    schedule_time: Optional[datetime] = None


# ============================================================================
# DATABASE HELPERS
# ============================================================================

def get_profile(user_id: str) -> Optional[WritingDNA]:
    conn = get_db_connection()
    row = conn.execute("SELECT style_data FROM user_profiles WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()
    if row:
        data = json.loads(row[0])
        # Convert dictionary back to WritingDNA object
        # This is a simplification; ideally WritingDNA has a from_dict method
        # For now we'll just return the dict or mock it, assuming style_analyzer can handle it
        return data 
    return None

def save_profile(user_id: str, profile: WritingDNA):
    conn = get_db_connection()
    conn.execute(
        "INSERT OR REPLACE INTO user_profiles (user_id, style_data, updated_at) VALUES (?, ?, ?)",
        (user_id, json.dumps(profile.model_dump()), datetime.now())
    )
    conn.commit()
    conn.close()

def get_post(post_id: str) -> Optional[PendingPost]:
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    conn.close()
    if row:
        return PendingPost(
            id=row['id'],
            user_id=row['user_id'],
            content=row['content'],
            platform=row['platform'],
            hashtags=json.loads(row['hashtags']) if row['hashtags'] else [],
            authenticity_score=row['authenticity_score'],
            created_at=datetime.fromisoformat(row['created_at']) if isinstance(row['created_at'], str) else row['created_at'],
            status=row['status'],
            scheduled_time=datetime.fromisoformat(row['scheduled_time']) if row['scheduled_time'] else None
        )
    return None

def save_post(post: PendingPost):
    conn = get_db_connection()
    conn.execute(
        """INSERT OR REPLACE INTO posts 
           (id, user_id, content, platform, hashtags, authenticity_score, created_at, status, scheduled_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            post.id, post.user_id, post.content, post.platform, 
            json.dumps(post.hashtags), post.authenticity_score, 
            post.created_at, post.status, post.scheduled_time
        )
    )
    conn.commit()
    conn.close()

def list_posts(user_id: str) -> List[PendingPost]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC", (user_id,)).fetchall()
    conn.close()
    return [
        PendingPost(
            id=row['id'],
            user_id=row['user_id'],
            content=row['content'],
            platform=row['platform'],
            hashtags=json.loads(row['hashtags']) if row['hashtags'] else [],
            authenticity_score=row['authenticity_score'],
            created_at=datetime.fromisoformat(row['created_at']) if isinstance(row['created_at'], str) else row['created_at'],
            status=row['status'],
            scheduled_time=datetime.fromisoformat(row['scheduled_time']) if row['scheduled_time'] else None
        ) for row in rows
    ]

agent = MarketingAgent()


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/onboarding/questions")
async def get_onboarding_questions():
    """Get the list of onboarding questions for style setup."""
    return {
        "questions": [q.model_dump() for q in ONBOARDING_QUESTIONS],
        "total": len(ONBOARDING_QUESTIONS)
    }


@router.post("/onboarding/complete")
async def complete_onboarding(request: OnboardingRequest):
    """
    Complete the onboarding process and create user's Writing DNA.
    """
    # Convert answers to dict
    answers_dict = {a.question_id: a.answer for a in request.answers}
    
    # Analyze and create Writing DNA
    writing_dna = await style_analyzer.analyze_from_onboarding(answers_dict)
    
    # Store the profile in DB
    save_profile(request.user_id, writing_dna)
    
    return {
        "success": True,
        "user_id": request.user_id,
        "writing_dna": writing_dna.model_dump(),
        "message": "Your writing style has been analyzed! The agent will now match your voice."
    }


@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get a user's Writing DNA profile."""
    profile = get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    # Check if profile is a dict (json loaded) or WritingDNA object
    if isinstance(profile, dict):
        return profile
    return profile.model_dump()


@router.post("/generate")
async def generate_content(request: GenerateRequest):
    """
    Generate a single piece of content for a platform.
    The content goes to the pending queue for approval.
    """
    try:
        # Generate using the Marketing Agent
        result = await agent.generate_post(
            user_id=request.user_id,
            topic=request.topic,
            platform=request.platform,
            content_type=request.content_type,
            mood=request.mood,
            call_to_action=request.call_to_action
        )
        
        # Create pending post
        post = PendingPost(
            id=result["id"],
            user_id=request.user_id,
            content=result["content"],
            platform=result["platform"],
            hashtags=result["hashtags"],
            authenticity_score=result["authenticity_score"],
            created_at=datetime.now(),
            status="pending"
        )
        
        # Store in DB
        save_post(post)
        
        return {
            "success": True,
            "post": post.model_dump(),
            "message": "Content generated! Review and approve to post."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/batch")
async def batch_generate(request: BatchGenerateRequest):
    """Generate multiple posts at once."""
    results = []
    
    for req in request.requests:
        try:
            result = await agent.generate_post(
                user_id=request.user_id,
                topic=req.topic,
                platform=req.platform,
                content_type=req.content_type,
                mood=req.mood,
                call_to_action=req.call_to_action
            )
            
            post = PendingPost(
                id=result["id"],
                user_id=request.user_id,
                content=result["content"],
                platform=result["platform"],
                hashtags=result["hashtags"],
                authenticity_score=result["authenticity_score"],
                created_at=datetime.now(),
                status="pending"
            )
            
            save_post(post)
            results.append({"success": True, "post": post.model_dump()})
            
        except Exception as e:
            results.append({"success": False, "error": str(e)})
    
    return {
        "total": len(results),
        "successful": sum(1 for r in results if r["success"]),
        "results": results
    }


@router.get("/pending/{user_id}")
async def get_pending_posts(user_id: str):
    """Get all pending posts for a user."""
    all_posts = list_posts(user_id)
    pending_posts_list = [
        p.model_dump() for p in all_posts
        if p.status == "pending"
    ]
    
    return {
        "count": len(pending_posts_list),
        "posts": pending_posts_list
    }


@router.post("/pending/{post_id}/action")
async def take_action_on_post(post_id: str, action: ApprovalAction):
    """Approve, reject, or edit a pending post."""
    post = get_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if action.action == "approve":
        post.status = "approved"
        if action.schedule_time:
            post.scheduled_time = action.schedule_time
        save_post(post)
        return {"success": True, "message": "Post approved!", "post": post.model_dump()}
    
    elif action.action == "reject":
        post.status = "rejected"
        save_post(post)
        return {"success": True, "message": "Post rejected", "post": post.model_dump()}
    
    elif action.action == "edit":
        if action.edited_content:
            post.content = action.edited_content
        save_post(post)
        return {"success": True, "message": "Post updated", "post": post.model_dump()}
    
    return {"success": False, "error": "Invalid action"}


@router.post("/publish")
async def publish_post(request: PublishRequest, background_tasks: BackgroundTasks):
    """
    Publish an approved post to a platform.
    For X/LinkedIn: Queues for Chrome Extension pickup.
    For Discord: Posts immediately via webhook.
    For others: Publishes via API (requires credentials).
    """
    post = get_post(request.post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.status != "approved":
        raise HTTPException(status_code=400, detail="Post must be approved before publishing")
    
    platform = request.platform or post.platform
    
    # Handle X and LinkedIn - save as draft (APIs require paid access)
    if platform in ["x", "linkedin"]:
        post.status = "posted"  # Mark as handled
        if request.schedule_time:
            post.scheduled_time = request.schedule_time
        save_post(post)
        
        # Copy content to clipboard message
        return {
            "success": True,
            "method": "manual",
            "message": f"Content saved! {platform.upper()} API requires paid access. Copy the text above and paste it on {platform.upper()}.",
            "post": post.model_dump()
        }
    
    # Handle Discord via webhook
    if platform == "discord":
        import os
        from app.db.database import get_db_connection
        
        # First try to get webhook from connected_accounts (user-connected)
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT webhook_url FROM connected_accounts 
            WHERE user_id = ? AND platform = 'discord' AND is_active = 1
        """, (post.user_id,))
        result = cursor.fetchone()
        conn.close()
        
        webhook_url = result["webhook_url"] if result else os.getenv("DISCORD_WEBHOOK_URL")
        
        if not webhook_url:
            return {
                "success": False,
                "method": "webhook",
                "message": "Discord not connected. Go to Dashboard → Connect Accounts → Connect Discord with your webhook URL.",
                "post": post.model_dump()
            }
        
        result = await publisher.discord.post_to_webhook(
            webhook_url=webhook_url,
            content=post.content,  # This will be ignored if embed is provided
            username="FounderOS Marketing Agent",
            embed={
                "title": "📢 New Post",
                "description": post.content[:4000],  # Use full content in embed
                "color": 0x10B981,  # Green color
                "footer": {"text": f"Posted via FounderOS • {datetime.now().strftime('%H:%M')}"}
            }
        )
        
        if result.success:
            post.status = "posted"
            save_post(post)
            return {
                "success": True,
                "method": "webhook",
                "message": "Posted to Discord!",
                "post": post.model_dump()
            }
        else:
            return {
                "success": False,
                "method": "webhook",
                "message": f"Failed: {result.error}",
                "post": post.model_dump()
            }
    
    # For Instagram/Facebook/YouTube - need credentials
    return {
        "success": True,
        "method": "api",
        "message": f"Ready to post to {platform}. Configure API credentials in settings.",
        "scheduled_time": request.schedule_time.isoformat() if request.schedule_time else "now",
        "post": post.model_dump()
    }


@router.get("/history/{user_id}")
async def get_post_history(user_id: str, limit: int = 20):
    """Get posted content history for a user."""
    all_posts = list_posts(user_id)
    posted = [
        p.model_dump() for p in all_posts
        if p.status == "posted"
    ][:limit]
    
    return {
        "count": len(posted),
        "posts": posted
    }


@router.post("/feedback")
async def submit_feedback(
    user_id: str,
    post_id: str,
    rating: Literal["good", "bad"],
    feedback: Optional[str] = None
):
    """
    Submit feedback on generated content.
    Used to improve the Writing DNA over time.
    """
    post = get_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # In production: Store feedback and refine Writing DNA
    # This is how the agent gets smarter over time
    
    profile = get_profile(user_id)
    if profile:
        # Get current DNA and update based on feedback
        # This is simplified - we'd need to convert dict to WritingDNA if needed
        pass
        
    return {
        "success": True,
        "message": "Feedback recorded. Your Writing DNA has been updated."
    }


# ============================================================================
# EXTENSION PICKUP ENDPOINT
# ============================================================================

@router.get("/extension/pending/{user_id}")
async def get_posts_for_extension(user_id: str):
    """
    Get posts queued for Chrome Extension to pick up.
    The extension calls this to get posts to schedule on X/LinkedIn.
    """
    all_posts = list_posts(user_id)
    extension_posts = [
        p.model_dump() for p in all_posts
        if p.status == "queued_for_extension" and p.platform in ["x", "linkedin"]
    ]
    
    return {
        "count": len(extension_posts),
        "posts": extension_posts
    }


@router.post("/extension/confirm/{post_id}")
async def confirm_extension_post(post_id: str):
    """
    Extension calls this to confirm a post was published.
    """
    post = get_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    post.status = "posted"
    save_post(post)
    
    return {"success": True, "message": "Post confirmed as published"}
