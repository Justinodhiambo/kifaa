#!/usr/bin/env python3
"""
Audit and Log Download Endpoints for Kifaa Credit Scoring Platform

This module provides endpoints for audit logging, log download, and regulatory compliance.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Response, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import sqlite3
import json
import csv
import io
import time
import logging
from datetime import datetime, timedelta
import zipfile
import os

from auth import get_current_user
from scoring_monitor import get_monitor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router for audit endpoints
audit_router = APIRouter(prefix="/audit", tags=["audit_compliance"])

# Request/Response models
class AuditLogFilter(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    user_id: Optional[str] = None
    api_key: Optional[str] = None
    status_code: Optional[int] = None
    min_score: Optional[float] = None
    max_score: Optional[float] = None
    partner_id: Optional[str] = None

class AuditLogEntry(BaseModel):
    id: int
    timestamp: float
    user_id: str
    api_key: str
    request_data: Dict[str, Any]
    response_data: Dict[str, Any]
    processing_time: float
    ip_address: str
    user_agent: str
    status_code: int
    error_message: Optional[str]

class AuditSummary(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    unique_users: int
    avg_processing_time: float
    date_range: Dict[str, str]
    top_errors: List[Dict[str, Any]]

class ComplianceReport(BaseModel):
    report_id: str
    generated_at: str
    period: Dict[str, str]
    summary: AuditSummary
    data_retention_status: str
    gdpr_compliance: Dict[str, Any]
    regulatory_notes: List[str]

class AuditManager:
    """Manager for audit logging and compliance reporting"""
    
    def __init__(self, db_path: str = "data/audit_logs.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize audit database"""
        import os
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Audit logs table (separate from scoring events for compliance)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL NOT NULL,
                    user_id TEXT NOT NULL,
                    api_key TEXT NOT NULL,
                    request_data TEXT NOT NULL,
                    response_data TEXT NOT NULL,
                    processing_time REAL NOT NULL,
                    ip_address TEXT NOT NULL,
                    user_agent TEXT NOT NULL,
                    status_code INTEGER NOT NULL,
                    error_message TEXT,
                    partner_id TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_api_key ON audit_logs(api_key)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_logs(status_code)")
            
            # Data retention tracking
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS data_retention (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    table_name TEXT NOT NULL,
                    retention_days INTEGER NOT NULL,
                    last_cleanup DATETIME,
                    records_deleted INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Insert default retention policies
            cursor.execute("""
                INSERT OR IGNORE INTO data_retention (table_name, retention_days)
                VALUES ('audit_logs', 2555)  -- 7 years for regulatory compliance
            """)
            
            # Compliance events table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS compliance_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    event_data TEXT NOT NULL,
                    user_id TEXT,
                    ip_address TEXT,
                    timestamp REAL NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    def log_audit_event(self, user_id: str, api_key: str, request_data: Dict[str, Any],
                       response_data: Dict[str, Any], processing_time: float,
                       ip_address: str, user_agent: str, status_code: int,
                       error_message: str = None, partner_id: str = None):
        """Log an audit event"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO audit_logs 
                (timestamp, user_id, api_key, request_data, response_data,
                 processing_time, ip_address, user_agent, status_code,
                 error_message, partner_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                time.time(), user_id, api_key, json.dumps(request_data),
                json.dumps(response_data), processing_time, ip_address,
                user_agent, status_code, error_message, partner_id
            ))
            
            conn.commit()
    
    def get_audit_logs(self, filters: AuditLogFilter, limit: int = 1000, 
                      offset: int = 0) -> List[AuditLogEntry]:
        """Get audit logs with filtering"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            query = "SELECT * FROM audit_logs WHERE 1=1"
            params = []
            
            # Apply filters
            if filters.start_date:
                start_timestamp = datetime.fromisoformat(filters.start_date).timestamp()
                query += " AND timestamp >= ?"
                params.append(start_timestamp)
            
            if filters.end_date:
                end_timestamp = datetime.fromisoformat(filters.end_date).timestamp()
                query += " AND timestamp <= ?"
                params.append(end_timestamp)
            
            if filters.user_id:
                query += " AND user_id = ?"
                params.append(filters.user_id)
            
            if filters.api_key:
                query += " AND api_key = ?"
                params.append(filters.api_key)
            
            if filters.status_code:
                query += " AND status_code = ?"
                params.append(filters.status_code)
            
            if filters.partner_id:
                query += " AND partner_id = ?"
                params.append(filters.partner_id)
            
            # Score filtering (requires JSON extraction)
            if filters.min_score is not None:
                query += " AND CAST(JSON_EXTRACT(response_data, '$.credit_score') AS REAL) >= ?"
                params.append(filters.min_score)
            
            if filters.max_score is not None:
                query += " AND CAST(JSON_EXTRACT(response_data, '$.credit_score') AS REAL) <= ?"
                params.append(filters.max_score)
            
            query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            # Get column names
            columns = [description[0] for description in cursor.description]
            
            audit_logs = []
            for row in rows:
                log_dict = dict(zip(columns, row))
                
                # Parse JSON fields
                try:
                    log_dict['request_data'] = json.loads(log_dict['request_data'])
                    log_dict['response_data'] = json.loads(log_dict['response_data'])
                except json.JSONDecodeError:
                    continue
                
                audit_logs.append(AuditLogEntry(**log_dict))
            
            return audit_logs
    
    def get_audit_summary(self, filters: AuditLogFilter) -> AuditSummary:
        """Get audit summary statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Build base query with filters
            base_query = "FROM audit_logs WHERE 1=1"
            params = []
            
            if filters.start_date:
                start_timestamp = datetime.fromisoformat(filters.start_date).timestamp()
                base_query += " AND timestamp >= ?"
                params.append(start_timestamp)
            
            if filters.end_date:
                end_timestamp = datetime.fromisoformat(filters.end_date).timestamp()
                base_query += " AND timestamp <= ?"
                params.append(end_timestamp)
            
            if filters.partner_id:
                base_query += " AND partner_id = ?"
                params.append(filters.partner_id)
            
            # Total requests
            cursor.execute(f"SELECT COUNT(*) {base_query}", params)
            total_requests = cursor.fetchone()[0]
            
            # Successful requests
            cursor.execute(f"SELECT COUNT(*) {base_query} AND status_code = 200", params)
            successful_requests = cursor.fetchone()[0]
            
            # Failed requests
            failed_requests = total_requests - successful_requests
            
            # Unique users
            cursor.execute(f"SELECT COUNT(DISTINCT user_id) {base_query}", params)
            unique_users = cursor.fetchone()[0]
            
            # Average processing time
            cursor.execute(f"SELECT AVG(processing_time) {base_query}", params)
            avg_processing_time = cursor.fetchone()[0] or 0
            
            # Date range
            cursor.execute(f"SELECT MIN(timestamp), MAX(timestamp) {base_query}", params)
            min_ts, max_ts = cursor.fetchone()
            
            date_range = {
                "start": datetime.fromtimestamp(min_ts).isoformat() if min_ts else None,
                "end": datetime.fromtimestamp(max_ts).isoformat() if max_ts else None
            }
            
            # Top errors
            cursor.execute(f"""
                SELECT error_message, COUNT(*) as count 
                {base_query} AND error_message IS NOT NULL
                GROUP BY error_message 
                ORDER BY count DESC 
                LIMIT 10
            """, params)
            
            top_errors = [
                {"error": row[0], "count": row[1]}
                for row in cursor.fetchall()
            ]
            
            return AuditSummary(
                total_requests=total_requests,
                successful_requests=successful_requests,
                failed_requests=failed_requests,
                unique_users=unique_users,
                avg_processing_time=avg_processing_time,
                date_range=date_range,
                top_errors=top_errors
            )
    
    def export_audit_logs_csv(self, filters: AuditLogFilter) -> str:
        """Export audit logs to CSV format"""
        logs = self.get_audit_logs(filters, limit=10000)  # Limit for performance
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'ID', 'Timestamp', 'Date', 'User ID', 'API Key', 'Credit Score',
            'Processing Time', 'IP Address', 'Status Code', 'Error Message',
            'Partner ID', 'Request Data', 'Response Data'
        ])
        
        # Write data
        for log in logs:
            writer.writerow([
                log.id,
                log.timestamp,
                datetime.fromtimestamp(log.timestamp).isoformat(),
                log.user_id,
                log.api_key,
                log.response_data.get('credit_score', ''),
                log.processing_time,
                log.ip_address,
                log.status_code,
                log.error_message or '',
                getattr(log, 'partner_id', ''),
                json.dumps(log.request_data),
                json.dumps(log.response_data)
            ])
        
        return output.getvalue()
    
    def export_audit_logs_json(self, filters: AuditLogFilter) -> str:
        """Export audit logs to JSON format"""
        logs = self.get_audit_logs(filters, limit=10000)
        
        export_data = {
            "export_timestamp": datetime.now().isoformat(),
            "filters": filters.dict(),
            "total_records": len(logs),
            "logs": [log.dict() for log in logs]
        }
        
        return json.dumps(export_data, indent=2)
    
    def generate_compliance_report(self, start_date: str, end_date: str,
                                 partner_id: str = None) -> ComplianceReport:
        """Generate a comprehensive compliance report"""
        filters = AuditLogFilter(
            start_date=start_date,
            end_date=end_date,
            partner_id=partner_id
        )
        
        summary = self.get_audit_summary(filters)
        
        # Check data retention compliance
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT retention_days, last_cleanup, records_deleted
                FROM data_retention 
                WHERE table_name = 'audit_logs'
            """)
            retention_info = cursor.fetchone()
        
        data_retention_status = "Compliant" if retention_info else "Not Configured"
        
        # GDPR compliance check
        gdpr_compliance = {
            "data_retention_policy": "7 years (2555 days)" if retention_info else "Not Set",
            "audit_logging": "Enabled",
            "data_export_capability": "Available",
            "data_anonymization": "Implemented",
            "user_consent_tracking": "Required"
        }
        
        # Regulatory notes
        regulatory_notes = [
            "All credit scoring requests are logged for audit purposes",
            "Personal data is retained according to financial regulations",
            "Users have the right to request data export and deletion",
            "System maintains comprehensive audit trails",
            "Regular compliance reviews are conducted"
        ]
        
        report_id = f"COMPLIANCE_{int(time.time())}"
        
        return ComplianceReport(
            report_id=report_id,
            generated_at=datetime.now().isoformat(),
            period={"start": start_date, "end": end_date},
            summary=summary,
            data_retention_status=data_retention_status,
            gdpr_compliance=gdpr_compliance,
            regulatory_notes=regulatory_notes
        )
    
    def cleanup_old_data(self, dry_run: bool = True) -> Dict[str, Any]:
        """Clean up old data according to retention policies"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get retention policy
            cursor.execute("""
                SELECT retention_days FROM data_retention 
                WHERE table_name = 'audit_logs'
            """)
            retention_info = cursor.fetchone()
            
            if not retention_info:
                return {"error": "No retention policy configured"}
            
            retention_days = retention_info[0]
            cutoff_timestamp = time.time() - (retention_days * 24 * 60 * 60)
            
            # Count records to be deleted
            cursor.execute("""
                SELECT COUNT(*) FROM audit_logs WHERE timestamp < ?
            """, (cutoff_timestamp,))
            records_to_delete = cursor.fetchone()[0]
            
            if not dry_run and records_to_delete > 0:
                # Actually delete the records
                cursor.execute("""
                    DELETE FROM audit_logs WHERE timestamp < ?
                """, (cutoff_timestamp,))
                
                # Update retention tracking
                cursor.execute("""
                    UPDATE data_retention 
                    SET last_cleanup = CURRENT_TIMESTAMP, 
                        records_deleted = records_deleted + ?
                    WHERE table_name = 'audit_logs'
                """, (records_to_delete,))
                
                conn.commit()
            
            return {
                "retention_days": retention_days,
                "cutoff_date": datetime.fromtimestamp(cutoff_timestamp).isoformat(),
                "records_to_delete": records_to_delete,
                "dry_run": dry_run,
                "action_taken": "deleted" if not dry_run else "none"
            }

# Global audit manager
_audit_manager = None

def get_audit_manager() -> AuditManager:
    """Get global audit manager instance"""
    global _audit_manager
    if _audit_manager is None:
        _audit_manager = AuditManager()
    return _audit_manager

# API Endpoints
@audit_router.get("/logs")
async def get_audit_logs(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    api_key: Optional[str] = Query(None, description="Filter by API key"),
    status_code: Optional[int] = Query(None, description="Filter by status code"),
    min_score: Optional[float] = Query(None, description="Minimum credit score"),
    max_score: Optional[float] = Query(None, description="Maximum credit score"),
    limit: int = Query(100, ge=1, le=10000, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: dict = Depends(get_current_user)
) -> List[AuditLogEntry]:
    """
    Get audit logs with filtering
    
    Requires 'audit' or 'admin' permission.
    """
    if not any(perm in current_user.get("permissions", []) for perm in ["audit", "admin"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Audit permissions required"
        )
    
    # Partners can only see their own data
    partner_id = None
    if "admin" not in current_user.get("permissions", []):
        partner_id = current_user.get("partner_id")
    
    filters = AuditLogFilter(
        start_date=start_date,
        end_date=end_date,
        user_id=user_id,
        api_key=api_key,
        status_code=status_code,
        min_score=min_score,
        max_score=max_score,
        partner_id=partner_id
    )
    
    audit_manager = get_audit_manager()
    return audit_manager.get_audit_logs(filters, limit, offset)

@audit_router.get("/summary")
async def get_audit_summary(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    current_user: dict = Depends(get_current_user)
) -> AuditSummary:
    """
    Get audit summary statistics
    
    Requires 'audit' or 'admin' permission.
    """
    if not any(perm in current_user.get("permissions", []) for perm in ["audit", "admin"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Audit permissions required"
        )
    
    # Partners can only see their own data
    partner_id = None
    if "admin" not in current_user.get("permissions", []):
        partner_id = current_user.get("partner_id")
    
    filters = AuditLogFilter(
        start_date=start_date,
        end_date=end_date,
        partner_id=partner_id
    )
    
    audit_manager = get_audit_manager()
    return audit_manager.get_audit_summary(filters)

@audit_router.get("/export/csv")
async def export_audit_logs_csv(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    current_user: dict = Depends(get_current_user)
):
    """
    Export audit logs as CSV
    
    Requires 'audit' or 'admin' permission.
    """
    if not any(perm in current_user.get("permissions", []) for perm in ["audit", "admin"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Audit permissions required"
        )
    
    # Partners can only see their own data
    partner_id = None
    if "admin" not in current_user.get("permissions", []):
        partner_id = current_user.get("partner_id")
    
    filters = AuditLogFilter(
        start_date=start_date,
        end_date=end_date,
        user_id=user_id,
        partner_id=partner_id
    )
    
    audit_manager = get_audit_manager()
    csv_data = audit_manager.export_audit_logs_csv(filters)
    
    # Create filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"kifaa_audit_logs_{timestamp}.csv"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@audit_router.get("/export/json")
async def export_audit_logs_json(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    current_user: dict = Depends(get_current_user)
):
    """
    Export audit logs as JSON
    
    Requires 'audit' or 'admin' permission.
    """
    if not any(perm in current_user.get("permissions", []) for perm in ["audit", "admin"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Audit permissions required"
        )
    
    # Partners can only see their own data
    partner_id = None
    if "admin" not in current_user.get("permissions", []):
        partner_id = current_user.get("partner_id")
    
    filters = AuditLogFilter(
        start_date=start_date,
        end_date=end_date,
        user_id=user_id,
        partner_id=partner_id
    )
    
    audit_manager = get_audit_manager()
    json_data = audit_manager.export_audit_logs_json(filters)
    
    # Create filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"kifaa_audit_logs_{timestamp}.json"
    
    return Response(
        content=json_data,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@audit_router.get("/compliance-report")
async def generate_compliance_report(
    start_date: str = Query(..., description="Start date (ISO format)"),
    end_date: str = Query(..., description="End date (ISO format)"),
    current_user: dict = Depends(get_current_user)
) -> ComplianceReport:
    """
    Generate compliance report for regulatory purposes
    
    Requires 'admin' permission.
    """
    if "admin" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions required"
        )
    
    audit_manager = get_audit_manager()
    return audit_manager.generate_compliance_report(start_date, end_date)

@audit_router.post("/cleanup")
async def cleanup_old_data(
    dry_run: bool = Query(True, description="Perform dry run without actual deletion"),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Clean up old audit data according to retention policies
    
    Requires 'admin' permission.
    """
    if "admin" not in current_user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions required"
        )
    
    audit_manager = get_audit_manager()
    return audit_manager.cleanup_old_data(dry_run)

@audit_router.get("/retention-policy")
async def get_retention_policy(current_user: dict = Depends(get_current_user)):
    """
    Get current data retention policy
    
    Requires 'audit' or 'admin' permission.
    """
    if not any(perm in current_user.get("permissions", []) for perm in ["audit", "admin"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Audit permissions required"
        )
    
    audit_manager = get_audit_manager()
    
    with sqlite3.connect(audit_manager.db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT table_name, retention_days, last_cleanup, records_deleted
            FROM data_retention
        """)
        
        policies = []
        for row in cursor.fetchall():
            policies.append({
                "table_name": row[0],
                "retention_days": row[1],
                "retention_years": round(row[1] / 365.25, 1),
                "last_cleanup": row[2],
                "records_deleted": row[3]
            })
    
    return {
        "policies": policies,
        "compliance_notes": [
            "Financial data retention follows regulatory requirements",
            "Audit logs are retained for 7 years minimum",
            "Personal data can be anonymized upon request",
            "Regular cleanup maintains system performance"
        ]
    }

