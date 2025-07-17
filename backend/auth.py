from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import logging

logger = logging.getLogger(__name__)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Simple in-memory token store (use Redis in production)
valid_tokens = set()

# API Keys for partners (in production, store in database)
API_KEYS = {
    "kifaa_partner_001": {"name": "Bank ABC", "permissions": ["score_user"]},
    "kifaa_partner_002": {"name": "SACCO XYZ", "permissions": ["score_user"]},
    "kifaa_admin_001": {"name": "Admin", "permissions": ["score_user", "logs", "retrain"]},
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # Add to valid tokens set
    valid_tokens.add(encoded_jwt)
    
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode a JWT token"""
    try:
        # Check if token is in valid tokens set
        if token not in valid_tokens:
            return None
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def revoke_token(token: str) -> bool:
    """Revoke a token"""
    if token in valid_tokens:
        valid_tokens.remove(token)
        return True
    return False

def verify_api_key(api_key: str) -> Optional[Dict[str, Any]]:
    """Verify an API key"""
    if api_key in API_KEYS:
        return API_KEYS[api_key]
    return None

async def get_current_user_jwt(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload

async def get_current_user_api_key(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    """Get current user from API key"""
    api_key = credentials.credentials
    user_info = verify_api_key(api_key)
    
    if user_info is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_info

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    """Get current user from either JWT token or API key"""
    token_or_key = credentials.credentials
    
    # Try JWT first
    payload = verify_token(token_or_key)
    if payload is not None:
        return payload
    
    # Try API key
    user_info = verify_api_key(token_or_key)
    if user_info is not None:
        return user_info
    
    raise HTTPException(
        status_code=401,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

def require_permission(permission: str):
    """Decorator to require specific permission"""
    def permission_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_permissions = current_user.get("permissions", [])
        if permission not in user_permissions:
            raise HTTPException(
                status_code=403,
                detail=f"Permission '{permission}' required"
            )
        return current_user
    
    return permission_checker

# Convenience functions for common permissions
def require_score_permission():
    """Require score_user permission"""
    return require_permission("score_user")

def require_admin_permission():
    """Require admin permissions"""
    return require_permission("logs")

def require_retrain_permission():
    """Require retrain permission"""
    return require_permission("retrain")

class AuthManager:
    """Authentication manager for handling various auth operations"""
    
    @staticmethod
    def generate_api_key(partner_name: str, permissions: list) -> str:
        """Generate a new API key for a partner"""
        import secrets
        import string
        
        # Generate a secure random API key
        alphabet = string.ascii_letters + string.digits
        api_key = ''.join(secrets.choice(alphabet) for _ in range(32))
        
        # Add to API keys (in production, save to database)
        API_KEYS[api_key] = {
            "name": partner_name,
            "permissions": permissions,
            "created_at": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Generated API key for partner: {partner_name}")
        return api_key
    
    @staticmethod
    def revoke_api_key(api_key: str) -> bool:
        """Revoke an API key"""
        if api_key in API_KEYS:
            partner_name = API_KEYS[api_key]["name"]
            del API_KEYS[api_key]
            logger.info(f"Revoked API key for partner: {partner_name}")
            return True
        return False
    
    @staticmethod
    def list_api_keys() -> Dict[str, Dict[str, Any]]:
        """List all API keys (without showing the actual keys)"""
        return {
            key[:8] + "..." + key[-4:]: {
                "name": info["name"],
                "permissions": info["permissions"],
                "created_at": info.get("created_at", "unknown")
            }
            for key, info in API_KEYS.items()
        }
    
    @staticmethod
    def create_user_token(user_id: str, permissions: list, expires_minutes: int = 30) -> str:
        """Create a JWT token for a user"""
        token_data = {
            "sub": user_id,
            "permissions": permissions,
            "type": "user_token"
        }
        
        expires_delta = timedelta(minutes=expires_minutes)
        return create_access_token(token_data, expires_delta)

# Optional: Rate limiting decorator (basic implementation)
from functools import wraps
from collections import defaultdict
import time

# Simple in-memory rate limiter (use Redis in production)
request_counts = defaultdict(list)

def rate_limit(max_requests: int = 100, window_minutes: int = 1):
    """Rate limiting decorator"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get user identifier from current user
            current_user = kwargs.get('current_user')
            if current_user:
                user_id = current_user.get('sub') or current_user.get('name', 'unknown')
            else:
                user_id = 'anonymous'
            
            now = time.time()
            window_start = now - (window_minutes * 60)
            
            # Clean old requests
            request_counts[user_id] = [
                req_time for req_time in request_counts[user_id] 
                if req_time > window_start
            ]
            
            # Check rate limit
            if len(request_counts[user_id]) >= max_requests:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded: {max_requests} requests per {window_minutes} minute(s)"
                )
            
            # Add current request
            request_counts[user_id].append(now)
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator

