#!/usr/bin/env python3
"""
Monitoring API Endpoints for Kifaa Credit Scoring Platform

This module provides API endpoints for accessing monitoring data and alerts.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, List, Any, Optional
import json
from datetime import datetime, timedelta
import time

from .scoring_monitor import get_monitor, ScoringMonitor
from .auth import verify_api_key, get_current_user

# Create router for monitoring endpoints
monitor_router = APIRouter(prefix="/monitor", tags=["monitoring"])

@monitor_router.get("/stats")
async def get_monitoring_stats(
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get current monitoring statistics
    
    Requires authentication with monitoring permissions.
    """
    # Check permissions
    if "monitor" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    monitor = get_monitor()
    return monitor.get_monitoring_stats()

@monitor_router.get("/alerts")
async def get_recent_alerts(
    hours: int = Query(24, ge=1, le=168, description="Hours to look back (1-168)"),
    severity: Optional[str] = Query(None, regex="^(low|medium|high|critical)$"),
    current_user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Get recent anomaly alerts
    
    Args:
        hours: Number of hours to look back (1-168)
        severity: Filter by severity level
        
    Requires authentication with monitoring permissions.
    """
    # Check permissions
    if "monitor" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    monitor = get_monitor()
    alerts = monitor.get_recent_alerts(hours)
    
    # Filter by severity if specified
    if severity:
        alerts = [alert for alert in alerts if alert.severity == severity]
    
    # Convert to dict format
    return [
        {
            "timestamp": alert.timestamp,
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "description": alert.description,
            "affected_entities": alert.affected_entities,
            "metrics": alert.metrics,
            "recommendations": alert.recommendations,
            "created_at": datetime.fromtimestamp(alert.timestamp).isoformat()
        }
        for alert in alerts
    ]

@monitor_router.get("/weekly-summary")
async def get_weekly_summary(
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate weekly monitoring summary
    
    Requires authentication with admin permissions.
    """
    # Check permissions
    if "admin" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin permissions required")
    
    monitor = get_monitor()
    return monitor.generate_weekly_summary()

@monitor_router.get("/events")
async def get_scoring_events(
    limit: int = Query(100, ge=1, le=1000, description="Number of events to return"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    api_key: Optional[str] = Query(None, description="Filter by API key"),
    start_time: Optional[float] = Query(None, description="Start timestamp"),
    end_time: Optional[float] = Query(None, description="End timestamp"),
    current_user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Get scoring events with optional filtering
    
    Requires authentication with monitoring permissions.
    """
    # Check permissions
    if "monitor" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    monitor = get_monitor()
    
    try:
        import sqlite3
        
        # Build query
        query = "SELECT * FROM scoring_events WHERE 1=1"
        params = []
        
        if user_id:
            query += " AND user_id = ?"
            params.append(user_id)
        
        if api_key:
            query += " AND api_key = ?"
            params.append(api_key)
        
        if start_time:
            query += " AND timestamp >= ?"
            params.append(start_time)
        
        if end_time:
            query += " AND timestamp <= ?"
            params.append(end_time)
        
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        # Execute query
        with sqlite3.connect(monitor.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            # Get column names
            columns = [description[0] for description in cursor.description]
            
            # Convert to dict format
            events = []
            for row in rows:
                event_dict = dict(zip(columns, row))
                
                # Parse JSON fields
                try:
                    event_dict['request_data'] = json.loads(event_dict['request_data'])
                    event_dict['response_data'] = json.loads(event_dict['response_data'])
                except json.JSONDecodeError:
                    pass
                
                # Add human-readable timestamp
                event_dict['created_at_iso'] = datetime.fromtimestamp(event_dict['timestamp']).isoformat()
                
                events.append(event_dict)
            
            return events
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving events: {str(e)}")

@monitor_router.get("/health-check")
async def monitor_health_check() -> Dict[str, Any]:
    """
    Health check for monitoring system
    
    Public endpoint - no authentication required.
    """
    monitor = get_monitor()
    
    try:
        # Test database connection
        import sqlite3
        with sqlite3.connect(monitor.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM scoring_events")
            event_count = cursor.fetchone()[0]
        
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "database_accessible": True,
            "total_events": event_count,
            "monitoring_active": True
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": time.time(),
            "error": str(e),
            "database_accessible": False,
            "monitoring_active": False
        }

@monitor_router.post("/cleanup")
async def cleanup_old_data(
    days_to_keep: int = Query(90, ge=7, le=365, description="Days of data to keep"),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Clean up old monitoring data
    
    Requires authentication with admin permissions.
    """
    # Check permissions
    if "admin" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin permissions required")
    
    monitor = get_monitor()
    
    try:
        monitor.cleanup_old_data(days_to_keep)
        return {
            "status": "success",
            "message": f"Cleaned up data older than {days_to_keep} days",
            "timestamp": time.time()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@monitor_router.get("/dashboard-data")
async def get_dashboard_data(
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get comprehensive dashboard data for monitoring UI
    
    Requires authentication with monitoring permissions.
    """
    # Check permissions
    if "monitor" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    monitor = get_monitor()
    
    try:
        # Get basic stats
        stats = monitor.get_monitoring_stats()
        
        # Get recent alerts
        alerts = monitor.get_recent_alerts(24)
        
        # Get hourly request counts for the last 24 hours
        import sqlite3
        current_time = time.time()
        start_time = current_time - 24 * 3600
        
        with sqlite3.connect(monitor.db_path) as conn:
            cursor = conn.cursor()
            
            # Hourly request counts
            cursor.execute("""
                SELECT 
                    CAST((timestamp - ?) / 3600 AS INTEGER) as hour_offset,
                    COUNT(*) as request_count
                FROM scoring_events 
                WHERE timestamp >= ?
                GROUP BY hour_offset
                ORDER BY hour_offset
            """, (start_time, start_time))
            
            hourly_data = cursor.fetchall()
            
            # Error counts by hour
            cursor.execute("""
                SELECT 
                    CAST((timestamp - ?) / 3600 AS INTEGER) as hour_offset,
                    COUNT(*) as error_count
                FROM scoring_events 
                WHERE timestamp >= ? AND status_code >= 400
                GROUP BY hour_offset
                ORDER BY hour_offset
            """, (start_time, start_time))
            
            hourly_errors = cursor.fetchall()
            
            # Top API keys by usage
            cursor.execute("""
                SELECT api_key, COUNT(*) as request_count
                FROM scoring_events 
                WHERE timestamp >= ?
                GROUP BY api_key
                ORDER BY request_count DESC
                LIMIT 10
            """, (start_time,))
            
            top_api_keys = cursor.fetchall()
        
        # Format dashboard data
        dashboard_data = {
            "overview": stats,
            "alerts": {
                "total": len(alerts),
                "critical": len([a for a in alerts if a.severity == "critical"]),
                "high": len([a for a in alerts if a.severity == "high"]),
                "recent": alerts[:5]  # Last 5 alerts
            },
            "charts": {
                "hourly_requests": [{"hour": h[0], "requests": h[1]} for h in hourly_data],
                "hourly_errors": [{"hour": h[0], "errors": h[1]} for h in hourly_errors],
                "top_api_keys": [{"api_key": k[0], "requests": k[1]} for k in top_api_keys]
            },
            "timestamp": current_time
        }
        
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating dashboard data: {str(e)}")

# Function to integrate monitoring into main API
def integrate_monitoring_middleware(app):
    """
    Integrate monitoring middleware into FastAPI app
    
    This should be called from the main application to add monitoring to all requests.
    """
    from fastapi import Request, Response
    import time
    
    @app.middleware("http")
    async def monitoring_middleware(request: Request, call_next):
        start_time = time.time()
        
        # Get request info
        user_agent = request.headers.get("user-agent", "")
        ip_address = request.client.host if request.client else "unknown"
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Log if this is a scoring request
        if request.url.path == "/score-user" and request.method == "POST":
            try:
                # Get API key from authorization header
                auth_header = request.headers.get("authorization", "")
                api_key = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else "unknown"
                
                # Get request body (this is a simplified approach)
                # In practice, you'd need to capture this during request processing
                request_data = {}
                response_data = {}
                
                # Extract user_id if available
                user_id = "unknown"
                
                # Log the event
                from .scoring_monitor import log_scoring_request
                log_scoring_request(
                    user_id=user_id,
                    api_key=api_key,
                    request_data=request_data,
                    response_data=response_data,
                    processing_time=processing_time,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    status_code=response.status_code
                )
                
            except Exception as e:
                # Don't let monitoring errors break the main request
                import logging
                logging.error(f"Monitoring error: {e}")
        
        return response

