from fastapi import HTTPException, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Dict, Any, Optional
import time
import logging
from collections import defaultdict, deque
import redis
import os

logger = logging.getLogger(__name__)

# Redis configuration for production rate limiting
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class InMemoryRateLimiter:
    """In-memory rate limiter for development/testing"""
    
    def __init__(self):
        self.requests = defaultdict(deque)
        self.blocked_until = defaultdict(float)
    
    def is_allowed(self, key: str, limit: int, window_seconds: int) -> tuple[bool, Dict[str, Any]]:
        """Check if request is allowed under rate limit"""
        now = time.time()
        
        # Check if currently blocked
        if key in self.blocked_until and now < self.blocked_until[key]:
            remaining_block_time = self.blocked_until[key] - now
            return False, {
                "allowed": False,
                "limit": limit,
                "remaining": 0,
                "reset_time": self.blocked_until[key],
                "retry_after": remaining_block_time
            }
        
        # Clean old requests
        window_start = now - window_seconds
        while self.requests[key] and self.requests[key][0] <= window_start:
            self.requests[key].popleft()
        
        current_count = len(self.requests[key])
        
        if current_count >= limit:
            # Block for the window duration
            self.blocked_until[key] = now + window_seconds
            return False, {
                "allowed": False,
                "limit": limit,
                "remaining": 0,
                "reset_time": now + window_seconds,
                "retry_after": window_seconds
            }
        
        # Allow request
        self.requests[key].append(now)
        remaining = limit - (current_count + 1)
        
        return True, {
            "allowed": True,
            "limit": limit,
            "remaining": remaining,
            "reset_time": now + window_seconds,
            "retry_after": 0
        }

class RedisRateLimiter:
    """Redis-based rate limiter for production"""
    
    def __init__(self, redis_url: str = REDIS_URL):
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()  # Test connection
            logger.info("Connected to Redis for rate limiting")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Falling back to in-memory rate limiter")
            self.redis_client = None
            self.fallback = InMemoryRateLimiter()
    
    def is_allowed(self, key: str, limit: int, window_seconds: int) -> tuple[bool, Dict[str, Any]]:
        """Check if request is allowed under rate limit"""
        if self.redis_client is None:
            return self.fallback.is_allowed(key, limit, window_seconds)
        
        try:
            now = time.time()
            pipe = self.redis_client.pipeline()
            
            # Use sliding window log approach
            window_start = now - window_seconds
            
            # Remove old entries
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count current requests
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(now): now})
            
            # Set expiration
            pipe.expire(key, window_seconds + 1)
            
            results = pipe.execute()
            current_count = results[1]
            
            if current_count >= limit:
                # Remove the request we just added since it's not allowed
                self.redis_client.zrem(key, str(now))
                
                return False, {
                    "allowed": False,
                    "limit": limit,
                    "remaining": 0,
                    "reset_time": now + window_seconds,
                    "retry_after": window_seconds
                }
            
            remaining = limit - (current_count + 1)
            
            return True, {
                "allowed": True,
                "limit": limit,
                "remaining": remaining,
                "reset_time": now + window_seconds,
                "retry_after": 0
            }
            
        except Exception as e:
            logger.error(f"Redis rate limiting error: {e}. Allowing request")
            # Fail open - allow request if Redis is down
            return True, {
                "allowed": True,
                "limit": limit,
                "remaining": limit - 1,
                "reset_time": time.time() + window_seconds,
                "retry_after": 0
            }

class KifaaRateLimiter:
    """Main rate limiter for Kifaa API"""
    
    def __init__(self, use_redis: bool = True):
        if use_redis:
            self.limiter = RedisRateLimiter()
        else:
            self.limiter = InMemoryRateLimiter()
        
        # Rate limit configurations
        self.rate_limits = {
            "default": {"limit": 100, "window": 3600},  # 100 requests per hour
            "premium": {"limit": 1000, "window": 3600},  # 1000 requests per hour
            "admin": {"limit": 10000, "window": 3600},   # 10000 requests per hour
            "burst": {"limit": 10, "window": 60},        # 10 requests per minute (burst protection)
        }
    
    def get_user_tier(self, user_info: Dict[str, Any]) -> str:
        """Determine user tier for rate limiting"""
        permissions = user_info.get("permissions", [])
        
        if "admin" in permissions or "logs" in permissions:
            return "admin"
        elif "premium" in permissions:
            return "premium"
        else:
            return "default"
    
    def get_rate_limit_key(self, user_info: Dict[str, Any], endpoint: str) -> str:
        """Generate rate limit key for user and endpoint"""
        user_id = user_info.get("sub") or user_info.get("name", "anonymous")
        return f"rate_limit:{user_id}:{endpoint}"
    
    def check_rate_limit(self, user_info: Dict[str, Any], endpoint: str) -> Dict[str, Any]:
        """Check if request is within rate limits"""
        user_tier = self.get_user_tier(user_info)
        rate_config = self.rate_limits[user_tier]
        
        # Check main rate limit
        main_key = self.get_rate_limit_key(user_info, endpoint)
        main_allowed, main_info = self.limiter.is_allowed(
            main_key, 
            rate_config["limit"], 
            rate_config["window"]
        )
        
        if not main_allowed:
            return main_info
        
        # Check burst protection (except for admin)
        if user_tier != "admin":
            burst_key = f"{main_key}:burst"
            burst_config = self.rate_limits["burst"]
            burst_allowed, burst_info = self.limiter.is_allowed(
                burst_key,
                burst_config["limit"],
                burst_config["window"]
            )
            
            if not burst_allowed:
                return burst_info
        
        return main_info
    
    def create_rate_limit_response(self, rate_info: Dict[str, Any]) -> HTTPException:
        """Create HTTP exception for rate limit exceeded"""
        return HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "limit": rate_info["limit"],
                "remaining": rate_info["remaining"],
                "reset_time": rate_info["reset_time"],
                "retry_after": rate_info["retry_after"]
            },
            headers={
                "X-RateLimit-Limit": str(rate_info["limit"]),
                "X-RateLimit-Remaining": str(rate_info["remaining"]),
                "X-RateLimit-Reset": str(int(rate_info["reset_time"])),
                "Retry-After": str(int(rate_info["retry_after"]))
            }
        )

# Global rate limiter instance
rate_limiter = KifaaRateLimiter()

# SlowAPI limiter for additional protection
limiter = Limiter(key_func=get_remote_address)

def rate_limit_dependency(endpoint: str = "default"):
    """Dependency for rate limiting specific endpoints"""
    def check_limits(user_info: Dict[str, Any]) -> Dict[str, Any]:
        rate_info = rate_limiter.check_rate_limit(user_info, endpoint)
        
        if not rate_info["allowed"]:
            raise rate_limiter.create_rate_limit_response(rate_info)
        
        return user_info
    
    return check_limits

def add_rate_limit_headers(response, rate_info: Dict[str, Any]):
    """Add rate limit headers to response"""
    response.headers["X-RateLimit-Limit"] = str(rate_info["limit"])
    response.headers["X-RateLimit-Remaining"] = str(rate_info["remaining"])
    response.headers["X-RateLimit-Reset"] = str(int(rate_info["reset_time"]))

# Custom rate limit decorator
def custom_rate_limit(endpoint: str = "default"):
    """Custom rate limit decorator"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract user info from kwargs
            user_info = None
            for key, value in kwargs.items():
                if isinstance(value, dict) and ("sub" in value or "name" in value):
                    user_info = value
                    break
            
            if user_info:
                rate_info = rate_limiter.check_rate_limit(user_info, endpoint)
                
                if not rate_info["allowed"]:
                    raise rate_limiter.create_rate_limit_response(rate_info)
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator

# IP-based rate limiting for unauthenticated endpoints
def ip_rate_limit(max_requests: int = 50, window_minutes: int = 15):
    """IP-based rate limiting for unauthenticated endpoints"""
    def decorator(func):
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = get_remote_address(request)
            key = f"ip_rate_limit:{client_ip}"
            
            allowed, rate_info = rate_limiter.limiter.is_allowed(
                key, max_requests, window_minutes * 60
            )
            
            if not allowed:
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many requests from IP {client_ip}",
                    headers={
                        "Retry-After": str(int(rate_info["retry_after"]))
                    }
                )
            
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator

