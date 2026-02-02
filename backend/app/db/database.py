"""
Database initialization and connection management.
Uses SQLite for local development to ensure persistence without external dependencies.
"""
import sqlite3
import json
from datetime import datetime
from threading import Lock

import os

# Get absolute path to this file's directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DB file will be in the same directory as this script
DB_PATH = os.path.join(BASE_DIR, "founderos.db")

db_lock = Lock()

def init_db():
    """Initialize the database schema."""
    # Ensure directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create posts table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            platform TEXT NOT NULL,
            hashtags TEXT,
            authenticity_score REAL,
            created_at TIMESTAMP,
            status TEXT NOT NULL,
            scheduled_time TIMESTAMP,
            metadata TEXT
        )
        """)
        
        # Create user_profiles table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id TEXT PRIMARY KEY,
            style_data TEXT NOT NULL,
            updated_at TIMESTAMP
        )
        """)
        
        # Create connected_accounts table (for OAuth tokens and webhooks)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS connected_accounts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            access_token TEXT,
            refresh_token TEXT,
            expires_at TIMESTAMP,
            page_id TEXT,
            channel_id TEXT,
            webhook_url TEXT,
            account_name TEXT,
            account_avatar TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, platform)
        )
        """)
        
        # Create scheduled_posts table (for auto-posting queue)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS scheduled_posts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            platforms TEXT NOT NULL,
            scheduled_time TIMESTAMP NOT NULL,
            status TEXT DEFAULT 'pending',
            published_at TIMESTAMP,
            error_message TEXT,
            retry_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        conn.commit()
        conn.close()

def get_db_connection():
    """Get a thread-safe database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize on module load
init_db()
