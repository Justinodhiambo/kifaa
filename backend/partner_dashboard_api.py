#!/usr/bin/env python3
"""
Partner Dashboard API Endpoints for Kifaa Credit Scoring Platform

This module provides API endpoints that power the partner dashboard UI,
including score management, user management, and approval workflows.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import sqlite3
import json
import time
import logging
from datetime import datetime, timedelta

from auth import get_current_user
from scoring_monitor import get_monitor
from model_manager import get_model_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router for partner dashboard endpoints
dashboard_router = APIRouter(prefix="/dashboard", tags=["partner_dashboard"])

# Request/Response models
class UserApprovalRequest(BaseModel):
    user_id: str
    decision: str  # "approve", "reject", "pending"
    credit_limit: Optional[float] = None
    interest_rate: Optional[float] = None
    terms_months: Optional[int] = None
    notes: Optional[str] = None

class UserApprovalResponse(BaseModel):
    user_id: str
    decision: str
    credit_limit: Optional[float]
    interest_rate: Optional[float]
    terms_months: Optional[int]
    approved_by: str
    approved_at: str
    notes: Optional[str]

class ScoreFilter(BaseModel):
    min_score: Optional[float] = None
    max_score: Optional[float] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    partner_id: Optional[str] = None

class DashboardStats(BaseModel):
    total_scores: int
    scores_today: int
    avg_score: float
    approval_rate: float
    pending_approvals: int
    active_users: int

class PartnerDashboardManager:
    """Manager for partner dashboard data and operations"""
    
    def __init__(self, db_path: str = "data/partner_dashboard.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize partner dashboard database"""
        import os
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # User approvals table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_approvals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    partner_id TEXT NOT NULL,
                    credit_score REAL NOT NULL,
                    decision TEXT NOT NULL,
                    credit_limit REAL,
                    interest_rate REAL,
                    terms_months INTEGER,
                    approved_by TEXT NOT NULL,
                    approved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Partner statistics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS partner_stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    partner_id TEXT NOT NULL,
                    date DATE NOT NULL,
                    total_scores INTEGER DEFAULT 0,
                    total_approvals INTEGER DEFAULT 0,
                    total_rejections INTEGER DEFAULT 0,
                    avg_score REAL DEFAULT 0,
                    total_credit_issued REAL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(partner_id, date)
                )
            """)
            
            # User profiles cache table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_profiles_cache (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT UNIQUE NOT NULL,
                    partner_id TEXT NOT NULL,
                    profile_data TEXT NOT NULL,
                    last_score REAL,
                    last_scored_at DATETIME,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    def get_scores(self, partner_id: str, filters: ScoreFilter = None, 
                   limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get scores for partner dashboard"""
        monitor = get_monitor()
        
        try:
            with sqlite3.connect(monitor.db_path) as conn:
                cursor = conn.cursor()
                
                # Build query
                query = """
                    SELECT user_id, request_data, response_data, timestamp, 
                           processing_time, status_code
                    FROM scoring_events 
                    WHERE 1=1
                """
                params = []
                
                # Add partner filter if available
                if partner_id:
                    # This would need to be implemented based on how partner_id is stored
                    # For now, we'll get all scores and filter in application
                    pass
                
                # Add score range filter
                if filters and filters.min_score is not None:
                    query += " AND JSON_EXTRACT(response_data, '$.credit_score') >= ?"
                    params.append(filters.min_score)
                
                if filters and filters.max_score is not None:
                    query += " AND JSON_EXTRACT(response_data, '$.credit_score') <= ?"
                    params.append(filters.max_score)
                
                # Add date filters
                if filters and filters.date_from:
                    from_timestamp = datetime.fromisoformat(filters.date_from).timestamp()
                    query += " AND timestamp >= ?"
                    params.append(from_timestamp)
                
                if filters and filters.date_to:
                    to_timestamp = datetime.fromisoformat(filters.date_to).timestamp()
                    query += " AND timestamp <= ?"
                    params.append(to_timestamp)
                
                query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
                params.extend([limit, offset])
                
                cursor.execute(query, params)
                rows = cursor.fetchall()
                
                scores = []
                for row in rows:
                    try:
                        request_data = json.loads(row[1])
                        response_data = json.loads(row[2])
                        
                        scores.append({
                            "user_id": row[0],
                            "credit_score": response_data.get("credit_score"),
                            "score_range": response_data.get("score_range"),
                            "model_version": response_data.get("model_version"),
                            "timestamp": row[3],
                            "date": datetime.fromtimestamp(row[3]).isoformat(),
                            "processing_time": row[4],
                            "status": "success" if row[5] == 200 else "error",
                            "user_data": {
                                "age": request_data.get("age"),
                                "income": request_data.get("income"),
                                "region": request_data.get("region")
                            }
                        })
                    except json.JSONDecodeError:
                        continue
                
                return scores
                
        except Exception as e:
            logger.error(f"Error getting scores: {e}")
            return []
    
    def get_user_details(self, user_id: str, partner_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed user information"""
        monitor = get_monitor()
        
        try:
            with sqlite3.connect(monitor.db_path) as conn:
                cursor = conn.cursor()
                
                # Get latest scoring event for user
                cursor.execute("""
                    SELECT request_data, response_data, timestamp
                    FROM scoring_events 
                    WHERE user_id = ?
                    ORDER BY timestamp DESC 
                    LIMIT 1
                """, (user_id,))
                
                row = cursor.fetchone()
                if not row:
                    return None
                
                request_data = json.loads(row[0])
                response_data = json.loads(row[1])
                
                # Get approval status
                approval_status = self._get_approval_status(user_id, partner_id)
                
                # Get scoring history
                cursor.execute("""
                    SELECT response_data, timestamp
                    FROM scoring_events 
                    WHERE user_id = ?
                    ORDER BY timestamp DESC 
                    LIMIT 10
                """, (user_id,))
                
                history_rows = cursor.fetchall()
                score_history = []
                
                for hist_row in history_rows:
                    try:
                        hist_response = json.loads(hist_row[0])
                        score_history.append({
                            "credit_score": hist_response.get("credit_score"),
                            "timestamp": hist_row[1],
                            "date": datetime.fromtimestamp(hist_row[1]).isoformat()
                        })
                    except json.JSONDecodeError:
                        continue
                
                return {
                    "user_id": user_id,
                    "profile": request_data,
                    "latest_score": response_data,
                    "approval_status": approval_status,
                    "score_history": score_history,
                    "last_updated": datetime.fromtimestamp(row[2]).isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error getting user details: {e}")
            return None
    
    def _get_approval_status(self, user_id: str, partner_id: str) -> Dict[str, Any]:
        """Get approval status for a user"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT decision, credit_limit, interest_rate, terms_months,
                       approved_by, approved_at, notes
                FROM user_approvals 
                WHERE user_id = ? AND partner_id = ?
                ORDER BY approved_at DESC 
                LIMIT 1
            """, (user_id, partner_id))
            
            row = cursor.fetchone()
            if not row:
                return {"status": "pending", "decision": None}
            
            return {
                "status": "processed",
                "decision": row[0],
                "credit_limit": row[1],
                "interest_rate": row[2],
                "terms_months": row[3],
                "approved_by": row[4],
                "approved_at": row[5],
                "notes": row[6]
            }
    
    def approve_user(self, user_id: str, partner_id: str, approval_data: UserApprovalRequest,
                    approved_by: str) -> UserApprovalResponse:
        """Process user approval decision"""
        # Get latest credit score
        monitor = get_monitor()
        
        with sqlite3.connect(monitor.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT response_data FROM scoring_events 
                WHERE user_id = ?
                ORDER BY timestamp DESC 
                LIMIT 1
            """, (user_id,))
            
            row = cursor.fetchone()
            if not row:
                raise ValueError("No scoring data found for user")
            
            response_data = json.loads(row[0])
            credit_score = response_data.get("credit_score", 0)
        
        # Store approval decision
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Insert or update approval
            cursor.execute("""
                INSERT OR REPLACE INTO user_approvals 
                (user_id, partner_id, credit_score, decision, credit_limit,
                 interest_rate, terms_months, approved_by, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, partner_id, credit_score, approval_data.decision,
                approval_data.credit_limit, approval_data.interest_rate,
                approval_data.terms_months, approved_by, approval_data.notes
            ))
            
            conn.commit()
        
        # Update partner statistics
        self._update_partner_stats(partner_id, approval_data.decision, credit_score,
                                 approval_data.credit_limit or 0)
        
        return UserApprovalResponse(
            user_id=user_id,
            decision=approval_data.decision,
            credit_limit=approval_data.credit_limit,
            interest_rate=approval_data.interest_rate,
            terms_months=approval_data.terms_months,
            approved_by=approved_by,
            approved_at=datetime.now().isoformat(),
            notes=approval_data.notes
        )
    
    def _update_partner_stats(self, partner_id: str, decision: str, 
                            credit_score: float, credit_amount: float):
        """Update partner statistics"""
        today = datetime.now().date()
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get or create today's stats
            cursor.execute("""
                SELECT total_scores, total_approvals, total_rejections, 
                       avg_score, total_credit_issued
                FROM partner_stats 
                WHERE partner_id = ? AND date = ?
            """, (partner_id, today))
            
            row = cursor.fetchone()
            
            if row:
                # Update existing stats
                total_scores = row[0] + 1
                total_approvals = row[1] + (1 if decision == "approve" else 0)
                total_rejections = row[2] + (1 if decision == "reject" else 0)
                avg_score = (row[3] * row[0] + credit_score) / total_scores
                total_credit_issued = row[4] + (credit_amount if decision == "approve" else 0)
                
                cursor.execute("""
                    UPDATE partner_stats 
                    SET total_scores = ?, total_approvals = ?, total_rejections = ?,
                        avg_score = ?, total_credit_issued = ?
                    WHERE partner_id = ? AND date = ?
                """, (total_scores, total_approvals, total_rejections,
                     avg_score, total_credit_issued, partner_id, today))
            else:
                # Create new stats
                cursor.execute("""
                    INSERT INTO partner_stats 
                    (partner_id, date, total_scores, total_approvals, total_rejections,
                     avg_score, total_credit_issued)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (partner_id, today, 1,
                     1 if decision == "approve" else 0,
                     1 if decision == "reject" else 0,
                     credit_score,
                     credit_amount if decision == "approve" else 0))
            
            conn.commit()
    
    def get_dashboard_stats(self, partner_id: str) -> DashboardStats:
        """Get dashboard statistics for partner"""
        monitor = get_monitor()
        
        # Get scoring stats from monitor
        with sqlite3.connect(monitor.db_path) as conn:
            cursor = conn.cursor()
            
            # Total scores
            cursor.execute("SELECT COUNT(*) FROM scoring_events")
            total_scores = cursor.fetchone()[0]
            
            # Scores today
            today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
            cursor.execute("SELECT COUNT(*) FROM scoring_events WHERE timestamp >= ?", (today_start,))
            scores_today = cursor.fetchone()[0]
            
            # Average score
            cursor.execute("""
                SELECT AVG(CAST(JSON_EXTRACT(response_data, '$.credit_score') AS REAL))
                FROM scoring_events 
                WHERE JSON_EXTRACT(response_data, '$.credit_score') IS NOT NULL
            """)
            avg_score_result = cursor.fetchone()[0]
            avg_score = avg_score_result if avg_score_result else 0
        
        # Get approval stats from dashboard DB
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Approval rate
            cursor.execute("""
                SELECT 
                    COUNT(CASE WHEN decision = 'approve' THEN 1 END) as approvals,
                    COUNT(*) as total
                FROM user_approvals 
                WHERE partner_id = ?
            """, (partner_id,))
            
            approval_row = cursor.fetchone()
            approval_rate = (approval_row[0] / approval_row[1] * 100) if approval_row[1] > 0 else 0
            
            # Pending approvals (users scored but not yet approved/rejected)
            cursor.execute("""
                SELECT COUNT(DISTINCT user_id) 
                FROM user_approvals 
                WHERE partner_id = ? AND decision = 'pending'
            """, (partner_id,))
            pending_approvals = cursor.fetchone()[0]
            
            # Active users (approved users)
            cursor.execute("""
                SELECT COUNT(*) 
                FROM user_approvals 
                WHERE partner_id = ? AND decision = 'approve'
            """, (partner_id,))
            active_users = cursor.fetchone()[0]
        
        return DashboardStats(
            total_scores=total_scores,
            scores_today=scores_today,
            avg_score=avg_score,
            approval_rate=approval_rate,
            pending_approvals=pending_approvals,
            active_users=active_users
        )

# Global dashboard manager
_dashboard_manager = None

def get_dashboard_manager() -> PartnerDashboardManager:
    """Get global dashboard manager instance"""
    global _dashboard_manager
    if _dashboard_manager is None:
        _dashboard_manager = PartnerDashboardManager()
    return _dashboard_manager

# API Endpoints
@dashboard_router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)) -> DashboardStats:
    """
    Get dashboard statistics for the current partner
    
    Requires 'partner' permission.
    """
    if "partner" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner permissions required"
        )
    
    partner_id = current_user.get("partner_id")
    if not partner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partner ID not found in user profile"
        )
    
    dashboard_manager = get_dashboard_manager()
    return dashboard_manager.get_dashboard_stats(partner_id)

@dashboard_router.get("/scores")
async def get_scores(
    min_score: Optional[float] = Query(None, description="Minimum credit score"),
    max_score: Optional[float] = Query(None, description="Maximum credit score"),
    date_from: Optional[str] = Query(None, description="Start date (ISO format)"),
    date_to: Optional[str] = Query(None, description="End date (ISO format)"),
    limit: int = Query(100, ge=1, le=1000, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Get credit scores for partner dashboard
    
    Requires 'partner' permission.
    """
    if "partner" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner permissions required"
        )
    
    partner_id = current_user.get("partner_id")
    if not partner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partner ID not found in user profile"
        )
    
    # Create filters
    filters = ScoreFilter(
        min_score=min_score,
        max_score=max_score,
        date_from=date_from,
        date_to=date_to,
        partner_id=partner_id
    )
    
    dashboard_manager = get_dashboard_manager()
    scores = dashboard_manager.get_scores(partner_id, filters, limit, offset)
    
    return scores

@dashboard_router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get detailed user information
    
    Requires 'partner' permission.
    """
    if "partner" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner permissions required"
        )
    
    partner_id = current_user.get("partner_id")
    if not partner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partner ID not found in user profile"
        )
    
    dashboard_manager = get_dashboard_manager()
    user_details = dashboard_manager.get_user_details(user_id, partner_id)
    
    if not user_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user_details

@dashboard_router.post("/approve-user", response_model=UserApprovalResponse)
async def approve_user(
    approval_request: UserApprovalRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Process user approval decision
    
    Requires 'partner' permission.
    """
    if "partner" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner permissions required"
        )
    
    partner_id = current_user.get("partner_id")
    if not partner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partner ID not found in user profile"
        )
    
    # Validate decision
    if approval_request.decision not in ["approve", "reject", "pending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decision must be 'approve', 'reject', or 'pending'"
        )
    
    try:
        dashboard_manager = get_dashboard_manager()
        approval_response = dashboard_manager.approve_user(
            approval_request.user_id,
            partner_id,
            approval_request,
            current_user.get("username", "unknown")
        )
        
        return approval_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error processing approval: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing approval"
        )

@dashboard_router.get("/approvals")
async def get_approvals(
    decision: Optional[str] = Query(None, regex="^(approve|reject|pending)$"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Get approval history for partner
    
    Requires 'partner' permission.
    """
    if "partner" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner permissions required"
        )
    
    partner_id = current_user.get("partner_id")
    if not partner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partner ID not found in user profile"
        )
    
    dashboard_manager = get_dashboard_manager()
    
    try:
        with sqlite3.connect(dashboard_manager.db_path) as conn:
            cursor = conn.cursor()
            
            query = """
                SELECT user_id, credit_score, decision, credit_limit,
                       interest_rate, terms_months, approved_by, approved_at, notes
                FROM user_approvals 
                WHERE partner_id = ?
            """
            params = [partner_id]
            
            if decision:
                query += " AND decision = ?"
                params.append(decision)
            
            query += " ORDER BY approved_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            approvals = []
            for row in rows:
                approvals.append({
                    "user_id": row[0],
                    "credit_score": row[1],
                    "decision": row[2],
                    "credit_limit": row[3],
                    "interest_rate": row[4],
                    "terms_months": row[5],
                    "approved_by": row[6],
                    "approved_at": row[7],
                    "notes": row[8]
                })
            
            return approvals
            
    except Exception as e:
        logger.error(f"Error getting approvals: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving approvals"
        )

