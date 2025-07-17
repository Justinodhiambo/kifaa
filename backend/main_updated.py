from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging
import os
from datetime import datetime
import json

# Import our modules
from credit_scoring import CreditScorer
from utils import explain_score, validate_user_data, format_api_response
from auth import get_current_user, require_score_permission, require_admin_permission, AuthManager
from rate_limiter import rate_limiter, add_rate_limit_headers, custom_rate_limit

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/kifaa_api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Kifaa Credit Scoring API",
    description="AI-powered asset financing platform for the underbanked",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize credit scorer
scorer = CreditScorer()

# Pydantic models
class UserProfile(BaseModel):
    user_id: str = Field(..., description="Unique user identifier")
    age: float = Field(..., ge=18, le=100, description="User age in years")
    income: float = Field(..., ge=0, description="Annual income in local currency")
    credit_history_length: float = Field(..., ge=0, description="Credit history length in years")
    debt_to_income_ratio: Optional[float] = Field(0.3, ge=0, le=1, description="Debt to income ratio")
    employment_length: Optional[float] = Field(2, ge=0, description="Employment length in years")
    number_of_accounts: Optional[int] = Field(3, ge=0, description="Number of credit accounts")
    payment_history_score: Optional[float] = Field(0.8, ge=0, le=1, description="Payment history score")
    credit_utilization: Optional[float] = Field(0.3, ge=0, le=1, description="Credit utilization ratio")
    recent_inquiries: Optional[int] = Field(1, ge=0, description="Number of recent credit inquiries")
    region: Optional[str] = Field("urban", description="Geographic region")

class ScoreResponse(BaseModel):
    user_id: str
    timestamp: str
    credit_score: float
    score_category: Dict[str, Any]
    explanation: Dict[str, Any]
    model_version: str
    api_version: str

class TokenRequest(BaseModel):
    user_id: str
    permissions: List[str]
    expires_minutes: Optional[int] = 30

class ApiKeyRequest(BaseModel):
    partner_name: str
    permissions: List[str]

class LogEntry(BaseModel):
    timestamp: str
    level: str
    message: str
    user_id: Optional[str] = None
    endpoint: Optional[str] = None

# Middleware for logging requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    # Log response
    process_time = (datetime.utcnow() - start_time).total_seconds()
    logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
    
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# Main scoring endpoint
@app.post("/score-user", response_model=ScoreResponse)
@custom_rate_limit("score_user")
async def score_user(
    profile: UserProfile,
    response: Response,
    current_user: Dict[str, Any] = Depends(require_score_permission())
) -> ScoreResponse:
    """
    Score a user's creditworthiness
    
    Requires authentication and score_user permission.
    Rate limited based on user tier.
    """
    try:
        # Validate input data
        user_data = validate_user_data(profile.dict())
        
        # Get rate limit info for headers
        rate_info = rate_limiter.check_rate_limit(current_user, "score_user")
        add_rate_limit_headers(response, rate_info)
        
        # Score the user
        score_result = scorer.score_user_profile(user_data)
        
        # Generate explanation
        explanation = explain_score(
            user_data, 
            score_result["score"], 
            model=scorer.model
        )
        score_result["explanation"] = explanation
        
        # Format response
        api_response = format_api_response(score_result, user_data["user_id"])
        
        # Log successful scoring
        logger.info(f"Scored user {user_data['user_id']} - Score: {score_result['score']:.2f}")
        
        return ScoreResponse(**api_response)
        
    except ValueError as e:
        logger.error(f"Validation error for user {profile.user_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Scoring failed for user {profile.user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")

# Logs management endpoint
@app.get("/logs")
async def get_logs(
    lines: int = 100,
    level: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(require_admin_permission())
) -> Dict[str, Any]:
    """
    Get application logs
    
    Requires admin permission.
    """
    try:
        log_file = "logs/kifaa_api.log"
        
        if not os.path.exists(log_file):
            return {"logs": [], "total_lines": 0}
        
        with open(log_file, 'r') as f:
            all_lines = f.readlines()
        
        # Filter by level if specified
        if level:
            filtered_lines = [
                line for line in all_lines 
                if level.upper() in line
            ]
        else:
            filtered_lines = all_lines
        
        # Get last N lines
        recent_lines = filtered_lines[-lines:] if lines > 0 else filtered_lines
        
        return {
            "logs": [line.strip() for line in recent_lines],
            "total_lines": len(filtered_lines),
            "requested_lines": lines,
            "level_filter": level
        }
        
    except Exception as e:
        logger.error(f"Failed to retrieve logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve logs")

@app.delete("/logs")
async def clear_logs(
    current_user: Dict[str, Any] = Depends(require_admin_permission())
) -> Dict[str, str]:
    """
    Clear application logs
    
    Requires admin permission.
    """
    try:
        log_file = "logs/kifaa_api.log"
        
        if os.path.exists(log_file):
            with open(log_file, 'w') as f:
                f.write("")
        
        logger.info(f"Logs cleared by user: {current_user.get('name', 'unknown')}")
        
        return {"message": "Logs cleared successfully"}
        
    except Exception as e:
        logger.error(f"Failed to clear logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clear logs")

# Model retraining endpoint
@app.post("/retrain")
async def trigger_retrain(
    current_user: Dict[str, Any] = Depends(require_admin_permission())
) -> Dict[str, Any]:
    """
    Trigger manual model retraining
    
    Requires admin permission.
    """
    try:
        from train_model import ModelTrainer
        
        trainer = ModelTrainer()
        results = trainer.train_model(retrain=True)
        
        # Reload the model in the scorer
        scorer.load_model()
        
        logger.info(f"Model retrained by user: {current_user.get('name', 'unknown')}")
        
        return {
            "message": "Model retrained successfully",
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Model retraining failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

# Authentication endpoints
@app.post("/auth/token")
async def create_token(
    token_request: TokenRequest,
    current_user: Dict[str, Any] = Depends(require_admin_permission())
) -> Dict[str, str]:
    """
    Create a JWT token for a user
    
    Requires admin permission.
    """
    try:
        token = AuthManager.create_user_token(
            token_request.user_id,
            token_request.permissions,
            token_request.expires_minutes
        )
        
        logger.info(f"Token created for user: {token_request.user_id}")
        
        return {"access_token": token, "token_type": "bearer"}
        
    except Exception as e:
        logger.error(f"Token creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Token creation failed")

@app.post("/auth/api-key")
async def create_api_key(
    api_key_request: ApiKeyRequest,
    current_user: Dict[str, Any] = Depends(require_admin_permission())
) -> Dict[str, str]:
    """
    Create an API key for a partner
    
    Requires admin permission.
    """
    try:
        api_key = AuthManager.generate_api_key(
            api_key_request.partner_name,
            api_key_request.permissions
        )
        
        logger.info(f"API key created for partner: {api_key_request.partner_name}")
        
        return {"api_key": api_key, "partner_name": api_key_request.partner_name}
        
    except Exception as e:
        logger.error(f"API key creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="API key creation failed")

@app.get("/auth/api-keys")
async def list_api_keys(
    current_user: Dict[str, Any] = Depends(require_admin_permission())
) -> Dict[str, Any]:
    """
    List all API keys
    
    Requires admin permission.
    """
    try:
        api_keys = AuthManager.list_api_keys()
        return {"api_keys": api_keys}
        
    except Exception as e:
        logger.error(f"Failed to list API keys: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list API keys")

# Statistics endpoint
@app.get("/stats")
async def get_stats(
    current_user: Dict[str, Any] = Depends(require_admin_permission())
) -> Dict[str, Any]:
    """
    Get API usage statistics
    
    Requires admin permission.
    """
    try:
        # This is a basic implementation - in production, use proper analytics
        return {
            "total_requests": "N/A",  # Would track in database
            "active_users": "N/A",
            "model_version": scorer.model_path,
            "uptime": "N/A"
        }
        
    except Exception as e:
        logger.error(f"Failed to get stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get statistics")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    logger.error(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500}
    )

if __name__ == "__main__":
    import uvicorn
    
    # Ensure logs directory exists
    os.makedirs("logs", exist_ok=True)
    
    uvicorn.run(
        "main_updated:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

