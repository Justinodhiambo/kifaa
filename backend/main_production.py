#!/usr/bin/env python3
"""
Production Main API for Kifaa Credit Scoring Platform

This is the production-ready FastAPI application with comprehensive features:
- JWT authentication and role-based access control
- Rate limiting and security middleware
- Comprehensive monitoring and logging
- API documentation and health checks
"""

from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import time
import logging
import uvicorn
import os
from contextlib import asynccontextmanager

# Import our modules
from credit_scoring_enhanced import get_scorer
from auth import verify_api_key, get_current_user
from auth_endpoints import auth_router, get_user_manager
from jwt_auth import get_jwt_manager
from rate_limiter import RateLimiter
from logging_config import setup_logging
from scoring_monitor import log_scoring_request
from monitor_endpoints import monitor_router
from partner_dashboard_api import dashboard_router
from audit_endpoints import audit_router

# Configure logging
setup_logging()
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

# Request/Response Models
class ScoreRequest(BaseModel):
    user_id: str
    age: float
    income: float
    credit_history_length: float
    debt_to_income_ratio: float
    employment_length: Optional[float] = None
    number_of_accounts: Optional[int] = None
    payment_history_score: Optional[float] = None
    credit_utilization: Optional[float] = None
    recent_inquiries: Optional[int] = None
    region: Optional[str] = None

class ScoreResponse(BaseModel):
    credit_score: float
    score_range: str
    explanation: Dict[str, Any]
    model_version: str
    processing_time: float
    timestamp: float

class HealthResponse(BaseModel):
    status: str
    timestamp: float
    version: str
    environment: str

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting Kifaa Credit Scoring API")
    
    # Initialize components
    try:
        # Test database connections
        user_manager = get_user_manager()
        jwt_manager = get_jwt_manager()
        scorer = get_scorer()
        
        logger.info("All components initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize components: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Kifaa Credit Scoring API")

# Create FastAPI app
app = FastAPI(
    title="Kifaa Credit Scoring API",
    description="AI-powered credit scoring platform for the underbanked",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware (configure for production)
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.kifaa.com", "localhost", "127.0.0.1"]
    )

# Rate limiting middleware
rate_limiter = RateLimiter()

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    # Get client identifier
    client_id = request.client.host if request.client else "unknown"
    
    # Get API key if present
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        api_key = auth_header.replace("Bearer ", "")
        client_id = f"api_key:{api_key}"
    
    # Check rate limit
    if not rate_limiter.is_allowed(client_id, request.url.path):
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "message": "Too many requests. Please try again later.",
                "retry_after": 60
            }
        )
    
    response = await call_next(request)
    return response

# Security headers middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add security headers"""
    response = await call_next(request)
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response

# Monitoring middleware
@app.middleware("http")
async def monitoring_middleware(request: Request, call_next):
    """Monitoring and logging middleware"""
    start_time = time.time()
    
    # Get request info
    user_agent = request.headers.get("user-agent", "")
    ip_address = request.client.host if request.client else "unknown"
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    processing_time = time.time() - start_time
    
    # Log request
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {processing_time:.3f}s")
    
    return response

# Include routers
app.include_router(auth_router)
app.include_router(monitor_router)
app.include_router(dashboard_router)
app.include_router(audit_router)

# Main API endpoints
@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint with basic API information"""
    return HealthResponse(
        status="operational",
        timestamp=time.time(),
        version="2.0.0",
        environment=os.getenv("ENVIRONMENT", "development")
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check"""
    try:
        # Test scorer
        scorer = get_scorer()
        scorer_health = scorer.health_check()
        
        if scorer_health["status"] != "healthy":
            return HealthResponse(
                status="degraded",
                timestamp=time.time(),
                version="2.0.0",
                environment=os.getenv("ENVIRONMENT", "development")
            )
        
        return HealthResponse(
            status="healthy",
            timestamp=time.time(),
            version="2.0.0",
            environment=os.getenv("ENVIRONMENT", "development")
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            timestamp=time.time(),
            version="2.0.0",
            environment=os.getenv("ENVIRONMENT", "development")
        )

@app.post("/score-user", response_model=ScoreResponse)
async def score_user(
    request: Request,
    score_request: ScoreRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Score a user's credit profile
    
    Requires 'score' permission.
    """
    start_time = time.time()
    
    # Check permissions
    if "score" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions for credit scoring"
        )
    
    try:
        # Get scorer
        scorer = get_scorer()
        
        # Prepare user data
        user_data = score_request.dict()
        
        # Score the user
        result = scorer.score_user_profile(user_data)
        
        # Check for errors
        if "error" in result:
            # Log the scoring request with error
            log_scoring_request(
                user_id=score_request.user_id,
                api_key=current_user.get("api_key", "jwt_token"),
                request_data=user_data,
                response_data=result,
                processing_time=time.time() - start_time,
                ip_address=request.client.host if request.client else "unknown",
                user_agent=request.headers.get("user-agent", ""),
                status_code=400,
                error_message=result["error"]
            )
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        # Log successful scoring request
        log_scoring_request(
            user_id=score_request.user_id,
            api_key=current_user.get("api_key", "jwt_token"),
            request_data=user_data,
            response_data=result,
            processing_time=result["processing_time"],
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", ""),
            status_code=200
        )
        
        # Also log to audit system
        from audit_endpoints import get_audit_manager
        audit_manager = get_audit_manager()
        audit_manager.log_audit_event(
            user_id=score_request.user_id,
            api_key=current_user.get("api_key", "jwt_token"),
            request_data=user_data,
            response_data=result,
            processing_time=result["processing_time"],
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", ""),
            status_code=200,
            partner_id=current_user.get("partner_id")
        )
        
        return ScoreResponse(
            credit_score=result["credit_score"],
            score_range=result["score_range"],
            explanation=result["explanation"],
            model_version=result["model_version"],
            processing_time=result["processing_time"],
            timestamp=result["timestamp"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in score_user: {e}")
        
        # Log the error
        log_scoring_request(
            user_id=score_request.user_id,
            api_key=current_user.get("api_key", "jwt_token"),
            request_data=score_request.dict(),
            response_data={"error": str(e)},
            processing_time=time.time() - start_time,
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", ""),
            status_code=500,
            error_message=str(e)
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during scoring"
        )

@app.get("/model-info")
async def get_model_info(current_user: dict = Depends(get_current_user)):
    """
    Get information about the current scoring model
    
    Requires 'score' or 'monitor' permission.
    """
    if not any(perm in current_user.get("permissions", []) for perm in ["score", "monitor"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        scorer = get_scorer()
        model_info = scorer.get_model_info()
        return model_info
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving model information"
        )

@app.post("/reload-model")
async def reload_model(current_user: dict = Depends(get_current_user)):
    """
    Reload the scoring model
    
    Requires 'admin' permission.
    """
    if "admin" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions required"
        )
    
    try:
        scorer = get_scorer()
        scorer.reload_model()
        
        model_info = scorer.get_model_info()
        
        return {
            "message": "Model reloaded successfully",
            "model_info": model_info,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Error reloading model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error reloading model"
        )

@app.get("/api-info")
async def get_api_info():
    """Get API information and documentation"""
    return {
        "name": "Kifaa Credit Scoring API",
        "version": "2.0.0",
        "description": "AI-powered credit scoring platform for the underbanked",
        "endpoints": {
            "authentication": "/auth/token",
            "scoring": "/score-user",
            "monitoring": "/monitor/stats",
            "health": "/health",
            "documentation": "/docs"
        },
        "features": [
            "JWT authentication",
            "Role-based access control",
            "Rate limiting",
            "Comprehensive monitoring",
            "Model versioning",
            "Audit logging"
        ],
        "supported_regions": [
            "LATAM", "Asia", "Africa"
        ],
        "contact": {
            "support": "support@kifaa.com",
            "documentation": "https://docs.kifaa.com"
        }
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": time.time(),
            "path": str(request.url.path)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": time.time(),
            "path": str(request.url.path)
        }
    )

if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "main_production:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

