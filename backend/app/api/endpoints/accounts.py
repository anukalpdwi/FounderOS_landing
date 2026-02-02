"""
Connected Accounts API Endpoints

Handles connecting and managing social media accounts:
- Discord (webhook URL)
- Instagram/Facebook (Meta OAuth)
- YouTube (Google OAuth)
- X/LinkedIn (Chrome Extension instructions)
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime
import uuid

from app.db.database import get_db_connection
from app.services.scheduler import schedule_post, get_scheduled_posts, cancel_scheduled_post
from app.services.meta_oauth import meta_oauth

router = APIRouter()


# ============================================================================
# MODELS
# ============================================================================

class ConnectDiscordRequest(BaseModel):
    """Request to connect a Discord webhook."""
    user_id: str
    webhook_url: str
    server_name: Optional[str] = None


class ConnectMetaRequest(BaseModel):
    """Request to connect Instagram/Facebook via OAuth."""
    user_id: str
    platform: Literal["instagram", "facebook"]
    access_token: str
    page_id: str
    page_name: Optional[str] = None


class SchedulePostRequest(BaseModel):
    """Request to schedule a post for auto-publishing."""
    user_id: str
    content: str
    platforms: List[str]
    scheduled_time: str  # ISO format datetime
    image_url: Optional[str] = None


class ConnectedAccount(BaseModel):
    """Response model for a connected account."""
    id: str
    platform: str
    account_name: Optional[str]
    is_active: bool
    connected_at: str


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/")
async def get_connected_accounts(user_id: str = Query(...)):
    """Get all connected accounts for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, platform, account_name, account_avatar, is_active, created_at
        FROM connected_accounts 
        WHERE user_id = ?
        ORDER BY created_at DESC
    """, (user_id,))
    
    accounts = cursor.fetchall()
    conn.close()
    
    return {
        "accounts": [
            {
                "id": acc["id"],
                "platform": acc["platform"],
                "account_name": acc["account_name"] or f"{acc['platform'].title()} Account",
                "account_avatar": acc["account_avatar"],
                "is_active": bool(acc["is_active"]),
                "connected_at": acc["created_at"]
            }
            for acc in accounts
        ]
    }


@router.post("/discord")
async def connect_discord(request: ConnectDiscordRequest):
    """Connect a Discord server via webhook URL."""
    # Validate webhook URL format
    if not request.webhook_url.startswith("https://discord.com/api/webhooks/"):
        raise HTTPException(
            status_code=400, 
            detail="Invalid Discord webhook URL. Must start with https://discord.com/api/webhooks/"
        )
    
    account_id = str(uuid.uuid4())
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO connected_accounts 
            (id, user_id, platform, webhook_url, account_name, is_active, created_at, updated_at)
            VALUES (?, ?, 'discord', ?, ?, 1, datetime('now'), datetime('now'))
        """, (account_id, request.user_id, request.webhook_url, request.server_name or "Discord Server"))
        
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to save: {str(e)}")
    
    conn.close()
    
    return {
        "success": True,
        "message": "Discord connected successfully!",
        "account_id": account_id
    }


@router.post("/meta")
async def connect_meta(request: ConnectMetaRequest):
    """Connect Instagram or Facebook via Meta OAuth tokens."""
    account_id = str(uuid.uuid4())
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO connected_accounts 
            (id, user_id, platform, access_token, page_id, account_name, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        """, (
            account_id, 
            request.user_id, 
            request.platform,
            request.access_token,
            request.page_id,
            request.page_name or f"{request.platform.title()} Page"
        ))
        
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to save: {str(e)}")
    
    conn.close()
    
    return {
        "success": True,
        "message": f"{request.platform.title()} connected successfully!",
        "account_id": account_id
    }


@router.delete("/{account_id}")
async def disconnect_account(account_id: str, user_id: str = Query(...)):
    """Disconnect (deactivate) a social media account."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE connected_accounts 
        SET is_active = 0, updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
    """, (account_id, user_id))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Account not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Account disconnected"}


# ============================================================================
# INSTAGRAM OAUTH ENDPOINTS
# ============================================================================

class InstagramConnectRequest(BaseModel):
    """Request to connect an Instagram account after OAuth."""
    user_id: str
    instagram_id: str
    username: str
    page_id: str
    access_token: str
    page_access_token: str
    expires_at: Optional[str] = None
    profile_picture: Optional[str] = None


@router.get("/instagram/auth")
async def get_instagram_auth_url(user_id: str = Query(...)):
    """
    Get the Instagram OAuth authorization URL.
    
    The frontend should redirect the user to this URL to start the OAuth flow.
    """
    import os
    
    # Check if Meta OAuth is configured
    if not os.getenv("META_APP_ID") or not os.getenv("META_APP_SECRET"):
        return {
            "success": False,
            "error": "Instagram OAuth not configured",
            "setup_required": True,
            "instructions": {
                "step1": "Go to https://developers.facebook.com and create a new app",
                "step2": "Choose 'Business' app type",
                "step3": "Add 'Instagram Graph API' and 'Facebook Login' products",
                "step4": "In Facebook Login settings, add redirect URI: http://localhost:8000/api/v1/accounts/instagram/callback",
                "step5": "Copy your App ID and App Secret",
                "step6": "Add to your .env file: META_APP_ID=your_app_id and META_APP_SECRET=your_app_secret",
                "step7": "Restart the backend server",
                "note": "Your Instagram must be a Business or Creator account connected to a Facebook Page"
            }
        }
    
    # Generate authorization URL
    auth_url = meta_oauth.get_authorization_url(state=user_id)
    
    return {
        "success": True,
        "auth_url": auth_url,
        "redirect_uri": os.getenv("META_REDIRECT_URI", "http://localhost:8000/api/v1/accounts/instagram/callback")
    }


@router.get("/instagram/callback")
async def instagram_oauth_callback(code: str = Query(...), state: str = Query("")):
    """
    Handle the Instagram OAuth callback.
    
    This endpoint is called by Facebook after the user authorizes the app.
    It completes the OAuth flow and returns the Instagram account(s) found.
    """
    from fastapi.responses import HTMLResponse
    
    # Complete the OAuth flow
    success, result = await meta_oauth.complete_oauth_flow(code)
    
    if not success:
        # Return HTML that shows error and closes popup
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Instagram Connection Failed</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                       padding: 40px; text-align: center; background: #0A0A0F; color: white; }}
                .error {{ background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
                         border-radius: 12px; padding: 20px; margin: 20px 0; }}
                h1 {{ color: #ef4444; }}
            </style>
        </head>
        <body>
            <h1>⚠️ Connection Failed</h1>
            <div class="error">
                <p>{result.get("error", "OAuth flow failed")}</p>
            </div>
            <p>This window will close automatically...</p>
            <script>
                // Send error to parent window
                if (window.opener) {{
                    window.opener.postMessage({{ 
                        type: 'instagram_oauth_error',
                        error: '{result.get("error", "OAuth flow failed").replace("'", "\\'")}'
                    }}, '*');
                }}
                setTimeout(() => window.close(), 3000);
            </script>
        </body>
        </html>
        """
        return HTMLResponse(content=error_html)
    
    # Success - return HTML that sends data to parent and closes
    import json
    accounts_json = json.dumps(result.get("instagram_accounts", []))
    
    success_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Instagram Connected!</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                   padding: 40px; text-align: center; background: #0A0A0F; color: white; }}
            .success {{ background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);
                       border-radius: 12px; padding: 20px; margin: 20px 0; }}
            h1 {{ color: #10b981; }}
            .loader {{ display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.2);
                      border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; }}
            @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
        </style>
    </head>
    <body>
        <h1>✅ Instagram Connected!</h1>
        <div class="success">
            <p>Successfully connected to Instagram</p>
            <div class="loader"></div>
        </div>
        <p>This window will close automatically...</p>
        <script>
            const data = {{
                type: 'instagram_oauth_success',
                user_id: '{state}',
                instagram_accounts: {accounts_json},
                access_token: '{result.get("access_token", "")}',
                expires_at: '{result.get("expires_at", "")}'
            }};
            
            // Send data to parent window
            if (window.opener) {{
                window.opener.postMessage(data, '*');
            }}
            
            // Also store in localStorage for fallback
            localStorage.setItem('instagram_oauth_result', JSON.stringify(data));
            
            setTimeout(() => window.close(), 2000);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=success_html)


@router.post("/instagram")
async def connect_instagram(request: InstagramConnectRequest):
    """
    Connect an Instagram account after OAuth flow is complete.
    
    This is called after the user selects which Instagram account to connect
    from the accounts returned by the OAuth callback.
    """
    account_id = str(uuid.uuid4())
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if this Instagram account is already connected
        cursor.execute("""
            SELECT id FROM connected_accounts 
            WHERE user_id = ? AND platform = 'instagram' AND is_active = 1
        """, (request.user_id,))
        
        existing = cursor.fetchone()
        if existing:
            # Update existing connection
            cursor.execute("""
                UPDATE connected_accounts 
                SET access_token = ?, page_id = ?, account_name = ?, 
                    account_avatar = ?, expires_at = ?, updated_at = datetime('now')
                WHERE id = ?
            """, (
                request.page_access_token,  # Use page token for API calls
                request.page_id,
                f"@{request.username}",
                request.profile_picture,
                request.expires_at,
                existing["id"]
            ))
            account_id = existing["id"]
        else:
            # Create new connection
            cursor.execute("""
                INSERT INTO connected_accounts 
                (id, user_id, platform, access_token, page_id, account_name, 
                 account_avatar, is_active, expires_at, created_at, updated_at)
                VALUES (?, ?, 'instagram', ?, ?, ?, ?, 1, ?, datetime('now'), datetime('now'))
            """, (
                account_id,
                request.user_id,
                request.page_access_token,
                request.page_id,
                f"@{request.username}",
                request.profile_picture,
                request.expires_at
            ))
        
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to save: {str(e)}")
    
    conn.close()
    
    return {
        "success": True,
        "message": f"Instagram @{request.username} connected successfully!",
        "account_id": account_id
    }


# ============================================================================
# SCHEDULING ENDPOINTS
# ============================================================================

@router.post("/schedule")
async def schedule_new_post(request: SchedulePostRequest):
    """Schedule a post for auto-publishing."""
    try:
        scheduled_time = datetime.fromisoformat(request.scheduled_time.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format. Use ISO format.")
    
    # Validate scheduled time is in the future
    if scheduled_time <= datetime.now(scheduled_time.tzinfo) if scheduled_time.tzinfo else scheduled_time <= datetime.now():
        raise HTTPException(status_code=400, detail="Scheduled time must be in the future")
    
    post_id = schedule_post(
        user_id=request.user_id,
        content=request.content,
        platforms=request.platforms,
        scheduled_time=scheduled_time,
        image_url=request.image_url
    )
    
    return {
        "success": True,
        "post_id": post_id,
        "scheduled_time": scheduled_time.isoformat(),
        "platforms": request.platforms
    }


@router.get("/scheduled")
async def get_user_scheduled_posts(user_id: str = Query(...), status: Optional[str] = None):
    """Get all scheduled posts for a user."""
    posts = get_scheduled_posts(user_id, status)
    
    return {
        "posts": posts,
        "total": len(posts)
    }


@router.delete("/scheduled/{post_id}")
async def cancel_post(post_id: str, user_id: str = Query(...)):
    """Cancel a pending scheduled post."""
    success = cancel_scheduled_post(post_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Post not found or already published")
    
    return {"success": True, "message": "Post cancelled"}


# ============================================================================
# PLATFORM STATUS
# ============================================================================

@router.get("/platforms")
async def get_platform_status(user_id: str = Query(...)):
    """Get connection status for all platforms."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT platform, account_name, is_active
        FROM connected_accounts 
        WHERE user_id = ? AND is_active = 1
    """, (user_id,))
    
    connected = {acc["platform"]: acc["account_name"] for acc in cursor.fetchall()}
    conn.close()
    
    platforms = [
        {
            "id": "discord",
            "name": "Discord",
            "connected": "discord" in connected,
            "account_name": connected.get("discord"),
            "method": "webhook",
            "free": True
        },
        {
            "id": "instagram",
            "name": "Instagram",
            "connected": "instagram" in connected,
            "account_name": connected.get("instagram"),
            "method": "oauth",
            "free": True,
            "note": "Requires Business account"
        },
        {
            "id": "facebook",
            "name": "Facebook",
            "connected": "facebook" in connected,
            "account_name": connected.get("facebook"),
            "method": "oauth",
            "free": True
        },
        {
            "id": "x",
            "name": "X (Twitter)",
            "connected": False,
            "method": "extension",
            "free": True,
            "note": "Use FounderOS Chrome Extension"
        },
        {
            "id": "linkedin",
            "name": "LinkedIn",
            "connected": False,
            "method": "extension",
            "free": True,
            "note": "Use FounderOS Chrome Extension"
        },
        {
            "id": "youtube",
            "name": "YouTube",
            "connected": "youtube" in connected,
            "account_name": connected.get("youtube"),
            "method": "oauth",
            "free": True,
            "note": "Video uploads only"
        }
    ]
    
    return {"platforms": platforms}
