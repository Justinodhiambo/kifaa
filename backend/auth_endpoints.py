#!/usr/bin/env python3
"""
Authentication Endpoints for Kifaa Credit Scoring Platform

This module provides JWT token issuance and authentication management endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import jwt
import bcrypt
import time
import logging
from datetime import datetime, timedelta
import sqlite3
import json

from jwt_auth import JWTManager, get_jwt_manager
from auth import verify_api_key

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router for auth endpoints
auth_router = APIRouter(prefix="/auth", tags=["authentication"])

# Security scheme
security = HTTPBearer()

# Request/Response models
class LoginRequest(BaseModel):
    username: str
    password: str
    partner_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str] = None
    permissions: List[str]
    user_info: Dict[str, Any]

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class CreateUserRequest(BaseModel):
    username: str
    password: str
    email: str
    partner_id: str
    permissions: List[str]
    full_name: Optional[str] = None
    role: str = "partner"

class UpdateUserRequest(BaseModel):
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UserManager:
    """User management for authentication"""
    
    def __init__(self, db_path: str = "data/users.db"):
        self.db_path = db_path
        self._init_database()
        self._create_default_admin()
    
    def _init_database(self):
        """Initialize user database"""
        import os
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    partner_id TEXT,
                    permissions TEXT NOT NULL,
                    full_name TEXT,
                    role TEXT NOT NULL DEFAULT 'partner',
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    login_count INTEGER DEFAULT 0
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token_hash TEXT NOT NULL,
                    expires_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_revoked BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            conn.commit()
    
    def _create_default_admin(self):
        """Create default admin user if none exists"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
            admin_count = cursor.fetchone()[0]
            
            if admin_count == 0:
                # Create default admin
                password_hash = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
                permissions = json.dumps(["admin", "monitor", "partner", "score", "manage_users"])
                
                cursor.execute("""
                    INSERT INTO users (username, password_hash, email, permissions, 
                                     full_name, role, partner_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    "admin",
                    password_hash.decode('utf-8'),
                    "admin@kifaa.com",
                    permissions,
                    "System Administrator",
                    "admin",
                    "kifaa_system"
                ))
                conn.commit()
                logger.info("Created default admin user (username: admin, password: admin123)")
    
    def authenticate_user(self, username: str, password: str, partner_id: str = None) -> Optional[Dict[str, Any]]:
        """Authenticate user credentials"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            query = "SELECT * FROM users WHERE username = ? AND is_active = TRUE"
            params = [username]
            
            if partner_id:
                query += " AND partner_id = ?"
                params.append(partner_id)
            
            cursor.execute(query, params)
            user_row = cursor.fetchone()
            
            if not user_row:
                return None
            
            # Get column names
            columns = [description[0] for description in cursor.description]
            user = dict(zip(columns, user_row))
            
            # Verify password
            if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                # Update login info
                cursor.execute("""
                    UPDATE users 
                    SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1
                    WHERE id = ?
                """, (user['id'],))
                conn.commit()
                
                # Parse permissions
                user['permissions'] = json.loads(user['permissions'])
                
                # Remove password hash from response
                del user['password_hash']
                
                return user
            
            return None
    
    def create_user(self, user_data: CreateUserRequest) -> Dict[str, Any]:
        """Create a new user"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Check if username or email already exists
            cursor.execute("""
                SELECT username, email FROM users 
                WHERE username = ? OR email = ?
            """, (user_data.username, user_data.email))
            
            existing = cursor.fetchone()
            if existing:
                if existing[0] == user_data.username:
                    raise ValueError("Username already exists")
                else:
                    raise ValueError("Email already exists")
            
            # Hash password
            password_hash = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
            
            # Insert user
            cursor.execute("""
                INSERT INTO users (username, password_hash, email, partner_id, 
                                 permissions, full_name, role)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user_data.username,
                password_hash.decode('utf-8'),
                user_data.email,
                user_data.partner_id,
                json.dumps(user_data.permissions),
                user_data.full_name,
                user_data.role
            ))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            return {
                "id": user_id,
                "username": user_data.username,
                "email": user_data.email,
                "partner_id": user_data.partner_id,
                "permissions": user_data.permissions,
                "role": user_data.role,
                "created_at": datetime.now().isoformat()
            }
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            user_row = cursor.fetchone()
            
            if not user_row:
                return None
            
            columns = [description[0] for description in cursor.description]
            user = dict(zip(columns, user_row))
            user['permissions'] = json.loads(user['permissions'])
            del user['password_hash']
            
            return user
    
    def update_user(self, user_id: int, updates: UpdateUserRequest) -> bool:
        """Update user information"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            update_fields = []
            params = []
            
            if updates.permissions is not None:
                update_fields.append("permissions = ?")
                params.append(json.dumps(updates.permissions))
            
            if updates.is_active is not None:
                update_fields.append("is_active = ?")
                params.append(updates.is_active)
            
            if updates.role is not None:
                update_fields.append("role = ?")
                params.append(updates.role)
            
            if not update_fields:
                return False
            
            params.append(user_id)
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
            
            cursor.execute(query, params)
            conn.commit()
            
            return cursor.rowcount > 0
    
    def change_password(self, user_id: int, current_password: str, new_password: str) -> bool:
        """Change user password"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
            result = cursor.fetchone()
            
            if not result:
                return False
            
            # Verify current password
            if not bcrypt.checkpw(current_password.encode('utf-8'), result[0].encode('utf-8')):
                return False
            
            # Hash new password
            new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            
            # Update password
            cursor.execute("""
                UPDATE users SET password_hash = ? WHERE id = ?
            """, (new_hash.decode('utf-8'), user_id))
            conn.commit()
            
            return True
    
    def store_refresh_token(self, user_id: int, token: str, expires_at: datetime) -> bool:
        """Store refresh token"""
        token_hash = bcrypt.hashpw(token.encode('utf-8'), bcrypt.gensalt())
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
                VALUES (?, ?, ?)
            """, (user_id, token_hash.decode('utf-8'), expires_at))
            conn.commit()
            
            return True
    
    def verify_refresh_token(self, token: str) -> Optional[int]:
        """Verify refresh token and return user ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, token_hash FROM refresh_tokens 
                WHERE expires_at > CURRENT_TIMESTAMP AND is_revoked = FALSE
            """)
            
            for user_id, token_hash in cursor.fetchall():
                if bcrypt.checkpw(token.encode('utf-8'), token_hash.encode('utf-8')):
                    return user_id
            
            return None
    
    def revoke_refresh_token(self, token: str) -> bool:
        """Revoke a refresh token"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, token_hash FROM refresh_tokens 
                WHERE is_revoked = FALSE
            """)
            
            for token_id, token_hash in cursor.fetchall():
                if bcrypt.checkpw(token.encode('utf-8'), token_hash.encode('utf-8')):
                    cursor.execute("""
                        UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = ?
                    """, (token_id,))
                    conn.commit()
                    return True
            
            return False

# Global user manager
_user_manager = None

def get_user_manager() -> UserManager:
    """Get global user manager instance"""
    global _user_manager
    if _user_manager is None:
        _user_manager = UserManager()
    return _user_manager

@auth_router.post("/token", response_model=TokenResponse)
async def login_for_access_token(login_data: LoginRequest):
    """
    Authenticate user and issue JWT tokens
    
    Returns access token and optional refresh token.
    """
    user_manager = get_user_manager()
    jwt_manager = get_jwt_manager()
    
    # Authenticate user
    user = user_manager.authenticate_user(
        login_data.username, 
        login_data.password, 
        login_data.partner_id
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate access token
    access_token = jwt_manager.create_access_token(
        user_id=user['id'],
        username=user['username'],
        permissions=user['permissions'],
        partner_id=user['partner_id']
    )
    
    # Generate refresh token
    refresh_token = jwt_manager.create_refresh_token(user['id'])
    
    # Store refresh token
    expires_at = datetime.now() + timedelta(days=30)  # 30 days
    user_manager.store_refresh_token(user['id'], refresh_token, expires_at)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=3600,  # 1 hour
        refresh_token=refresh_token,
        permissions=user['permissions'],
        user_info={
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "partner_id": user['partner_id'],
            "role": user['role'],
            "full_name": user['full_name']
        }
    )

@auth_router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(refresh_data: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    """
    user_manager = get_user_manager()
    jwt_manager = get_jwt_manager()
    
    # Verify refresh token
    user_id = user_manager.verify_refresh_token(refresh_data.refresh_token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user info
    user = user_manager.get_user_by_id(user_id)
    if not user or not user.get('is_active'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Generate new access token
    access_token = jwt_manager.create_access_token(
        user_id=user['id'],
        username=user['username'],
        permissions=user['permissions'],
        partner_id=user['partner_id']
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=3600,
        permissions=user['permissions'],
        user_info={
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "partner_id": user['partner_id'],
            "role": user['role'],
            "full_name": user['full_name']
        }
    )

@auth_router.post("/logout")
async def logout(refresh_data: RefreshTokenRequest):
    """
    Logout user by revoking refresh token
    """
    user_manager = get_user_manager()
    
    success = user_manager.revoke_refresh_token(refresh_data.refresh_token)
    
    return {
        "message": "Logged out successfully" if success else "Token not found",
        "success": success
    }

@auth_router.post("/users")
async def create_user(
    user_data: CreateUserRequest,
    current_user: dict = Depends(verify_api_key)
):
    """
    Create a new user (admin only)
    """
    # Check admin permissions
    if "admin" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions required"
        )
    
    user_manager = get_user_manager()
    
    try:
        new_user = user_manager.create_user(user_data)
        return {
            "message": "User created successfully",
            "user": new_user
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@auth_router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    current_user: dict = Depends(verify_api_key)
):
    """
    Get user information
    """
    # Users can view their own info, admins can view any user
    if current_user.get("user_id") != user_id and "admin" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    user_manager = get_user_manager()
    user = user_manager.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@auth_router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    updates: UpdateUserRequest,
    current_user: dict = Depends(verify_api_key)
):
    """
    Update user information (admin only)
    """
    if "admin" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions required"
        )
    
    user_manager = get_user_manager()
    success = user_manager.update_user(user_id, updates)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User updated successfully"}

@auth_router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: dict = Depends(verify_api_key)
):
    """
    Change user password
    """
    user_manager = get_user_manager()
    
    success = user_manager.change_password(
        current_user["user_id"],
        password_data.current_password,
        password_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    return {"message": "Password changed successfully"}

@auth_router.get("/me")
async def get_current_user_info(current_user: dict = Depends(verify_api_key)):
    """
    Get current user information
    """
    user_manager = get_user_manager()
    user = user_manager.get_user_by_id(current_user["user_id"])
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@auth_router.get("/permissions")
async def get_available_permissions():
    """
    Get list of available permissions
    """
    return {
        "permissions": [
            {
                "name": "admin",
                "description": "Full system administration access"
            },
            {
                "name": "monitor",
                "description": "Access to monitoring and analytics"
            },
            {
                "name": "partner",
                "description": "Partner dashboard access"
            },
            {
                "name": "score",
                "description": "Credit scoring API access"
            },
            {
                "name": "manage_users",
                "description": "User management capabilities"
            },
            {
                "name": "audit",
                "description": "Access to audit logs and reports"
            }
        ]
    }

