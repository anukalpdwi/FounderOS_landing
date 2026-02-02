"""
Meta OAuth Service for Instagram and Facebook

Implements the OAuth 2.0 flow for Meta (Facebook/Instagram) Graph API.

Requirements:
1. Create a Meta Developer App at https://developers.facebook.com
2. Enable Instagram Graph API and Facebook Login
3. Add OAuth redirect URI: http://localhost:3000/auth/callback/instagram
4. Get App ID and App Secret

Permissions needed:
- instagram_basic
- instagram_content_publish
- pages_show_list
- pages_read_engagement
"""

import os
import httpx
import logging
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlencode
from datetime import datetime, timedelta

logger = logging.getLogger("meta_oauth")

# Meta API endpoints
META_AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth"
META_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"
META_GRAPH_URL = "https://graph.facebook.com/v19.0"


class MetaOAuthService:
    """
    Handles OAuth flow for Instagram and Facebook via Meta Graph API.
    
    Flow:
    1. Generate authorization URL
    2. User authorizes and is redirected back with code
    3. Exchange code for access token
    4. Get long-lived token (60 days)
    5. Get user's Instagram Business Account
    """
    
    def __init__(self):
        self.app_id = os.getenv("META_APP_ID", "")
        self.app_secret = os.getenv("META_APP_SECRET", "")
        self.redirect_uri = os.getenv("META_REDIRECT_URI", "http://localhost:8000/api/v1/accounts/instagram/callback")
        
        if not self.app_id or not self.app_secret:
            logger.warning("⚠️ META_APP_ID or META_APP_SECRET not set. Instagram OAuth will not work.")
    
    def get_authorization_url(self, state: str = "") -> str:
        """
        Generate the Facebook OAuth authorization URL.
        
        Args:
            state: Optional state parameter for CSRF protection
            
        Returns:
            Full authorization URL to redirect user to
        """
        params = {
            "client_id": self.app_id,
            "redirect_uri": self.redirect_uri,
            "scope": ",".join([
                "instagram_basic",
                "instagram_content_publish",
                "pages_show_list",
                "pages_read_engagement",
                "business_management",
            ]),
            "response_type": "code",
            "state": state,
        }
        
        return f"{META_AUTH_URL}?{urlencode(params)}"
    
    async def exchange_code_for_token(self, code: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from OAuth callback
            
        Returns:
            Tuple of (success, data_dict)
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(META_TOKEN_URL, params={
                    "client_id": self.app_id,
                    "client_secret": self.app_secret,
                    "redirect_uri": self.redirect_uri,
                    "code": code,
                })
                
                data = response.json()
                
                if "access_token" in data:
                    logger.info("✅ Successfully exchanged code for access token")
                    return True, data
                else:
                    error = data.get("error", {}).get("message", "Unknown error")
                    logger.error(f"❌ Token exchange failed: {error}")
                    return False, {"error": error}
                    
            except Exception as e:
                logger.error(f"❌ Token exchange exception: {e}")
                return False, {"error": str(e)}
    
    async def get_long_lived_token(self, short_lived_token: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Exchange short-lived token for long-lived token (60 days).
        
        Args:
            short_lived_token: The short-lived access token
            
        Returns:
            Tuple of (success, data_dict with access_token and expires_in)
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(META_TOKEN_URL, params={
                    "grant_type": "fb_exchange_token",
                    "client_id": self.app_id,
                    "client_secret": self.app_secret,
                    "fb_exchange_token": short_lived_token,
                })
                
                data = response.json()
                
                if "access_token" in data:
                    logger.info(f"✅ Got long-lived token, expires in {data.get('expires_in', 0) // 86400} days")
                    return True, data
                else:
                    error = data.get("error", {}).get("message", "Unknown error")
                    logger.error(f"❌ Long-lived token failed: {error}")
                    return False, {"error": error}
                    
            except Exception as e:
                logger.error(f"❌ Long-lived token exception: {e}")
                return False, {"error": str(e)}
    
    async def get_user_pages(self, access_token: str) -> Tuple[bool, list]:
        """
        Get Facebook Pages the user manages.
        These are needed to find connected Instagram Business accounts.
        
        Returns:
            Tuple of (success, list of pages)
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{META_GRAPH_URL}/me/accounts", params={
                    "access_token": access_token,
                    "fields": "id,name,access_token,instagram_business_account",
                })
                
                data = response.json()
                
                if "data" in data:
                    pages = data["data"]
                    logger.info(f"✅ Found {len(pages)} Facebook Pages")
                    return True, pages
                else:
                    error = data.get("error", {}).get("message", "Unknown error")
                    logger.error(f"❌ Get pages failed: {error}")
                    return False, []
                    
            except Exception as e:
                logger.error(f"❌ Get pages exception: {e}")
                return False, []
    
    async def get_instagram_account(self, page_id: str, page_access_token: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Get Instagram Business Account connected to a Facebook Page.
        
        Args:
            page_id: The Facebook Page ID
            page_access_token: The Page's access token
            
        Returns:
            Tuple of (success, instagram_account_data)
        """
        async with httpx.AsyncClient() as client:
            try:
                # Get the Instagram Business Account ID
                response = await client.get(
                    f"{META_GRAPH_URL}/{page_id}",
                    params={
                        "access_token": page_access_token,
                        "fields": "instagram_business_account",
                    }
                )
                
                data = response.json()
                
                if "instagram_business_account" not in data:
                    return False, {"error": "No Instagram Business Account connected to this page"}
                
                ig_account_id = data["instagram_business_account"]["id"]
                
                # Get Instagram account details
                ig_response = await client.get(
                    f"{META_GRAPH_URL}/{ig_account_id}",
                    params={
                        "access_token": page_access_token,
                        "fields": "id,username,profile_picture_url,followers_count,media_count",
                    }
                )
                
                ig_data = ig_response.json()
                
                if "id" in ig_data:
                    logger.info(f"✅ Found Instagram account: @{ig_data.get('username', 'unknown')}")
                    return True, {
                        "instagram_id": ig_data["id"],
                        "username": ig_data.get("username", ""),
                        "profile_picture": ig_data.get("profile_picture_url", ""),
                        "followers": ig_data.get("followers_count", 0),
                        "media_count": ig_data.get("media_count", 0),
                        "page_id": page_id,
                        "page_access_token": page_access_token,
                    }
                else:
                    error = ig_data.get("error", {}).get("message", "Unknown error")
                    return False, {"error": error}
                    
            except Exception as e:
                logger.error(f"❌ Get Instagram account exception: {e}")
                return False, {"error": str(e)}
    
    async def complete_oauth_flow(self, code: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Complete the full OAuth flow from code to Instagram account.
        
        Args:
            code: Authorization code from callback
            
        Returns:
            Tuple of (success, result_data)
        """
        # Step 1: Exchange code for token
        success, token_data = await self.exchange_code_for_token(code)
        if not success:
            return False, token_data
        
        short_token = token_data["access_token"]
        
        # Step 2: Get long-lived token
        success, long_token_data = await self.get_long_lived_token(short_token)
        if not success:
            return False, long_token_data
        
        access_token = long_token_data["access_token"]
        expires_in = long_token_data.get("expires_in", 5184000)  # Default 60 days
        
        # Step 3: Get user's Facebook Pages
        success, pages = await self.get_user_pages(access_token)
        if not success or not pages:
            return False, {"error": "No Facebook Pages found. You need a Facebook Page connected to Instagram."}
        
        # Step 4: Find Instagram Business Account
        instagram_accounts = []
        for page in pages:
            if "instagram_business_account" in page:
                success, ig_data = await self.get_instagram_account(
                    page["id"],
                    page["access_token"]
                )
                if success:
                    ig_data["page_name"] = page["name"]
                    instagram_accounts.append(ig_data)
        
        if not instagram_accounts:
            return False, {
                "error": "No Instagram Business Account found. Make sure your Instagram is connected to a Facebook Page in Professional mode."
            }
        
        # Return all found accounts (user can choose which to connect)
        return True, {
            "instagram_accounts": instagram_accounts,
            "access_token": access_token,
            "expires_at": (datetime.now() + timedelta(seconds=expires_in)).isoformat(),
        }


# Export singleton
meta_oauth = MetaOAuthService()
