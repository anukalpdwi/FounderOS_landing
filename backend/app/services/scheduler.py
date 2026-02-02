"""
Background Scheduler Service for Auto-Posting

Uses APScheduler to run jobs every minute, checking for posts due
and publishing them automatically to connected platforms.

Features:
- Auto-publish at scheduled times
- Retry failed posts (max 3 attempts)
- Discord, Instagram, Facebook, YouTube support
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
import sqlite3
import json
import logging
from typing import Optional

from app.db.database import get_db_connection, DB_PATH
from app.services.content_publisher import publisher, PlatformCredentials

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scheduler")

# Global scheduler instance
scheduler: Optional[AsyncIOScheduler] = None


def get_due_posts():
    """Fetch all posts that are due for publishing."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Use UTC for consistent comparison with ISO timestamps from frontend
    from datetime import timezone
    now_utc = datetime.now(timezone.utc).isoformat()
    
    cursor.execute("""
        SELECT * FROM scheduled_posts 
        WHERE status = 'pending' 
        AND scheduled_time <= ?
        AND retry_count < 3
        ORDER BY scheduled_time ASC
        LIMIT 10
    """, (now_utc,))
    
    posts = cursor.fetchall()
    conn.close()
    
    return [dict(post) for post in posts]


def get_account_credentials(user_id: str, platform: str) -> Optional[PlatformCredentials]:
    """Get OAuth credentials for a user's connected platform."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM connected_accounts 
        WHERE user_id = ? AND platform = ? AND is_active = 1
    """, (user_id, platform))
    
    account = cursor.fetchone()
    conn.close()
    
    if not account:
        return None
    
    account = dict(account)
    
    return PlatformCredentials(
        platform=account["platform"],
        access_token=account.get("access_token", ""),
        refresh_token=account.get("refresh_token"),
        expires_at=account.get("expires_at"),
        page_id=account.get("page_id"),
        channel_id=account.get("channel_id"),
        webhook_url=account.get("webhook_url")
    )


def update_post_status(post_id: str, status: str, error: Optional[str] = None):
    """Update the status of a scheduled post."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if status == "published":
        cursor.execute("""
            UPDATE scheduled_posts 
            SET status = ?, published_at = ?, error_message = NULL
            WHERE id = ?
        """, (status, datetime.now().isoformat(), post_id))
    elif status == "failed":
        cursor.execute("""
            UPDATE scheduled_posts 
            SET status = 'pending', error_message = ?, retry_count = retry_count + 1
            WHERE id = ?
        """, (error, post_id))
        
        # Check if max retries reached
        cursor.execute("SELECT retry_count FROM scheduled_posts WHERE id = ?", (post_id,))
        result = cursor.fetchone()
        if result and result["retry_count"] >= 3:
            cursor.execute("""
                UPDATE scheduled_posts 
                SET status = 'failed'
                WHERE id = ?
            """, (post_id,))
    else:
        cursor.execute("""
            UPDATE scheduled_posts 
            SET status = ?
            WHERE id = ?
        """, (status, post_id))
    
    conn.commit()
    conn.close()


async def publish_post(post: dict):
    """Publish a single post to all its target platforms."""
    platforms = json.loads(post["platforms"]) if isinstance(post["platforms"], str) else post["platforms"]
    
    logger.info(f"📤 Publishing post {post['id']} to {platforms}")
    
    all_success = True
    errors = []
    
    for platform in platforms:
        try:
            # Get credentials for this platform
            credentials = get_account_credentials(post["user_id"], platform)
            
            if not credentials and platform != "discord":
                errors.append(f"{platform}: No connected account")
                all_success = False
                continue
            
            # Publish based on platform
            if platform == "discord":
                # Discord uses webhook URL directly
                if credentials and credentials.webhook_url:
                    result = await publisher.publish(
                        platform="discord",
                        webhook_url=credentials.webhook_url,
                        content=post["content"]
                    )
                else:
                    errors.append(f"{platform}: No webhook configured")
                    all_success = False
                    continue
                    
            elif platform in ["instagram", "facebook"]:
                result = await publisher.publish(
                    platform=platform,
                    credentials=credentials,
                    content=post["content"],
                    image_url=post.get("image_url")
                )
                
            elif platform == "youtube":
                # YouTube requires video - skip for now if no video
                logger.info(f"Skipping YouTube - requires video file")
                continue
                
            else:
                # X and LinkedIn handled via Chrome Extension
                logger.info(f"Skipping {platform} - requires Chrome Extension")
                continue
            
            if not result.success:
                errors.append(f"{platform}: {result.error}")
                all_success = False
                
        except Exception as e:
            logger.error(f"Error publishing to {platform}: {e}")
            errors.append(f"{platform}: {str(e)}")
            all_success = False
    
    # Update post status
    if all_success:
        update_post_status(post["id"], "published")
        logger.info(f"✅ Post {post['id']} published successfully!")
    else:
        error_msg = "; ".join(errors)
        update_post_status(post["id"], "failed", error_msg)
        logger.warning(f"⚠️ Post {post['id']} had errors: {error_msg}")


async def check_and_publish():
    """Main scheduler job - runs every minute."""
    try:
        due_posts = get_due_posts()
        
        if not due_posts:
            return
        
        logger.info(f"⏰ Found {len(due_posts)} posts due for publishing")
        
        for post in due_posts:
            await publish_post(post)
            
    except Exception as e:
        logger.error(f"Scheduler error: {e}")


def start_scheduler():
    """Start the background scheduler."""
    global scheduler
    
    if scheduler is not None:
        logger.info("Scheduler already running")
        return scheduler
    
    scheduler = AsyncIOScheduler()
    
    # Run every 60 seconds
    scheduler.add_job(
        check_and_publish,
        IntervalTrigger(seconds=60),
        id="auto_publisher",
        name="Auto-publish scheduled posts",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("🚀 Auto-posting scheduler started (checking every 60 seconds)")
    
    return scheduler


def stop_scheduler():
    """Stop the background scheduler."""
    global scheduler
    
    if scheduler:
        scheduler.shutdown()
        scheduler = None
        logger.info("Scheduler stopped")


# Helper function to schedule a new post
def schedule_post(
    user_id: str,
    content: str,
    platforms: list[str],
    scheduled_time: datetime,
    image_url: Optional[str] = None
) -> str:
    """Add a new post to the scheduling queue."""
    import uuid
    
    post_id = str(uuid.uuid4())
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO scheduled_posts 
        (id, user_id, content, image_url, platforms, scheduled_time, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    """, (
        post_id,
        user_id,
        content,
        image_url,
        json.dumps(platforms),
        scheduled_time.isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    logger.info(f"📅 Scheduled post {post_id} for {scheduled_time}")
    
    return post_id


def get_scheduled_posts(user_id: str, status: Optional[str] = None) -> list[dict]:
    """Get all scheduled posts for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if status:
        cursor.execute("""
            SELECT * FROM scheduled_posts 
            WHERE user_id = ? AND status = ?
            ORDER BY scheduled_time ASC
        """, (user_id, status))
    else:
        cursor.execute("""
            SELECT * FROM scheduled_posts 
            WHERE user_id = ?
            ORDER BY scheduled_time DESC
        """, (user_id,))
    
    posts = cursor.fetchall()
    conn.close()
    
    return [dict(post) for post in posts]


def cancel_scheduled_post(post_id: str, user_id: str) -> bool:
    """Cancel a pending scheduled post."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE scheduled_posts 
        SET status = 'cancelled'
        WHERE id = ? AND user_id = ? AND status = 'pending'
    """, (post_id, user_id))
    
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return affected > 0
