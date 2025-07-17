import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from functools import wraps
from flask import request, jsonify, current_app
import logging

logger = logging.getLogger(__name__)

class JWTAuthManager:
    """JWT Authentication Manager for Kifaa API"""
    
    def __init__(self, secret_key: str = None, algorithm: str = "HS256"):
        self.secret_key = secret_key or secrets.token_urlsafe(32)
        self.algorithm = algorithm
        self.token_expiry_hours = 24
        
        # In production, store these in a database
        self.api_keys = {
            "kifaa_admin_001": {
                "name": "Admin Key",
                "permissions": ["score_user", "logs", "retrain", "admin"],
                "created_at": datetime.utcnow().isoformat(),
                "last_used": None,
                "usage_count": 0
            },
            "kifaa_partner_001": {
                "name": "Partner Key 1",
                "permissions": ["score_user"],
                "created_at": datetime.utcnow().isoformat(),
                "last_used": None,
                "usage_count": 0
            },
            "kifaa_ussd_001": {
                "name": "USSD Gateway",
                "permissions": ["score_user"],
                "created_at": datetime.utcnow().isoformat(),
                "last_used": None,
                "usage_count": 0
            }
        }
        
        # Rate limiting storage (in production, use Redis)
        self.rate_limits = {}
    
    def generate_jwt_token(self, api_key: str, additional_claims: Dict[str, Any] = None) -> Optional[str]:
        """Generate JWT token for valid API key"""
        if api_key not in self.api_keys:
            return None
        
        key_info = self.api_keys[api_key]
        
        # Update usage statistics
        key_info["last_used"] = datetime.utcnow().isoformat()
        key_info["usage_count"] += 1
        
        # Create JWT payload
        payload = {
            "api_key": api_key,
            "name": key_info["name"],
            "permissions": key_info["permissions"],
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
            "iss": "kifaa-api",
            "sub": api_key
        }
        
        if additional_claims:
            payload.update(additional_claims)
        
        try:
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            logger.info(f"JWT token generated for {key_info['name']}")
            return token
        except Exception as e:
            logger.error(f"Failed to generate JWT token: {str(e)}")
            return None
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify API key still exists and is valid
            api_key = payload.get("api_key")
            if api_key not in self.api_keys:
                logger.warning(f"JWT token contains invalid API key: {api_key}")
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"JWT verification error: {str(e)}")
            return None
    
    def verify_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Verify API key directly (fallback method)"""
        if api_key in self.api_keys:
            key_info = self.api_keys[api_key].copy()
            
            # Update usage statistics
            self.api_keys[api_key]["last_used"] = datetime.utcnow().isoformat()
            self.api_keys[api_key]["usage_count"] += 1
            
            return key_info
        return None
    
    def create_api_key(self, partner_name: str, permissions: List[str]) -> str:
        """Create new API key"""
        # Generate secure API key
        api_key = f"kifaa_{hashlib.md5(partner_name.encode()).hexdigest()[:8]}_{secrets.token_urlsafe(8)}"
        
        self.api_keys[api_key] = {
            "name": partner_name,
            "permissions": permissions,
            "created_at": datetime.utcnow().isoformat(),
            "last_used": None,
            "usage_count": 0
        }
        
        logger.info(f"Created new API key for {partner_name}")
        return api_key
    
    def revoke_api_key(self, api_key: str) -> bool:
        """Revoke API key"""
        if api_key in self.api_keys:
            del self.api_keys[api_key]
            logger.info(f"Revoked API key: {api_key}")
            return True
        return False
    
    def check_rate_limit(self, identifier: str, limit: int = 100, window_minutes: int = 60) -> Dict[str, Any]:
        """Check rate limit for identifier (API key or IP)"""
        now = datetime.utcnow()
        window_start = now - timedelta(minutes=window_minutes)
        
        if identifier not in self.rate_limits:
            self.rate_limits[identifier] = []
        
        # Clean old requests
        self.rate_limits[identifier] = [
            req_time for req_time in self.rate_limits[identifier]
            if req_time > window_start
        ]
        
        current_count = len(self.rate_limits[identifier])
        
        if current_count >= limit:
            return {
                "allowed": False,
                "current_count": current_count,
                "limit": limit,
                "reset_time": (window_start + timedelta(minutes=window_minutes)).isoformat(),
                "retry_after": window_minutes * 60
            }
        
        # Add current request
        self.rate_limits[identifier].append(now)
        
        return {
            "allowed": True,
            "current_count": current_count + 1,
            "limit": limit,
            "remaining": limit - current_count - 1
        }

# Global auth manager instance
auth_manager = JWTAuthManager()

def require_auth(permissions: List[str] = None):
    """Decorator to require authentication and optionally specific permissions"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get token from Authorization header or API key
            auth_header = request.headers.get('Authorization', '')
            api_key = None
            token = None
            
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]  # Remove 'Bearer ' prefix
            elif auth_header.startswith('ApiKey '):
                api_key = auth_header[7:]  # Remove 'ApiKey ' prefix
            else:
                # Check for API key in query params (less secure, for testing)
                api_key = request.args.get('api_key')
            
            # Verify authentication
            user_info = None
            
            if token:
                user_info = auth_manager.verify_jwt_token(token)
            elif api_key:
                user_info = auth_manager.verify_api_key(api_key)
            
            if not user_info:
                return jsonify({
                    "error": "Authentication required",
                    "message": "Valid API key or JWT token required"
                }), 401
            
            # Check permissions
            if permissions:
                user_permissions = user_info.get("permissions", [])
                if not any(perm in user_permissions for perm in permissions):
                    return jsonify({
                        "error": "Insufficient permissions",
                        "required": permissions,
                        "available": user_permissions
                    }), 403
            
            # Check rate limits
            identifier = user_info.get("api_key", request.remote_addr)
            rate_limit_result = auth_manager.check_rate_limit(identifier)
            
            if not rate_limit_result["allowed"]:
                return jsonify({
                    "error": "Rate limit exceeded",
                    "limit": rate_limit_result["limit"],
                    "retry_after": rate_limit_result["retry_after"]
                }), 429
            
            # Add user info to request context
            request.user_info = user_info
            request.rate_limit_info = rate_limit_result
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def require_admin():
    """Decorator to require admin permissions"""
    return require_auth(["admin"])

def get_current_user() -> Optional[Dict[str, Any]]:
    """Get current authenticated user info"""
    return getattr(request, 'user_info', None)

def get_rate_limit_info() -> Optional[Dict[str, Any]]:
    """Get current request rate limit info"""
    return getattr(request, 'rate_limit_info', None)

# Flask routes for authentication management
def setup_auth_routes(app):
    """Setup authentication routes"""
    
    @app.route('/auth/token', methods=['POST'])
    def generate_token():
        """Generate JWT token from API key"""
        data = request.get_json()
        api_key = data.get('api_key')
        
        if not api_key:
            return jsonify({"error": "API key required"}), 400
        
        token = auth_manager.generate_jwt_token(api_key)
        if token:
            return jsonify({
                "token": token,
                "expires_in": auth_manager.token_expiry_hours * 3600,
                "token_type": "Bearer"
            })
        else:
            return jsonify({"error": "Invalid API key"}), 401
    
    @app.route('/auth/api-key', methods=['POST'])
    @require_admin()
    def create_api_key():
        """Create new API key (admin only)"""
        data = request.get_json()
        partner_name = data.get('partner_name')
        permissions = data.get('permissions', ['score_user'])
        
        if not partner_name:
            return jsonify({"error": "Partner name required"}), 400
        
        api_key = auth_manager.create_api_key(partner_name, permissions)
        return jsonify({
            "api_key": api_key,
            "partner_name": partner_name,
            "permissions": permissions
        })
    
    @app.route('/auth/api-keys', methods=['GET'])
    @require_admin()
    def list_api_keys():
        """List all API keys (admin only)"""
        return jsonify({
            "api_keys": auth_manager.api_keys
        })
    
    @app.route('/auth/api-key/<api_key>', methods=['DELETE'])
    @require_admin()
    def revoke_api_key(api_key):
        """Revoke API key (admin only)"""
        if auth_manager.revoke_api_key(api_key):
            return jsonify({"message": "API key revoked successfully"})
        else:
            return jsonify({"error": "API key not found"}), 404
    
    @app.route('/auth/me', methods=['GET'])
    @require_auth()
    def get_current_user_info():
        """Get current user information"""
        user_info = get_current_user()
        rate_limit_info = get_rate_limit_info()
        
        return jsonify({
            "user": user_info,
            "rate_limit": rate_limit_info
        })

# Middleware for adding security headers
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    return response

def setup_security_middleware(app):
    """Setup security middleware"""
    app.after_request(add_security_headers)

