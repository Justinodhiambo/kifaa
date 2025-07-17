#!/usr/bin/env python3
"""
Scoring Monitor Agent for Kifaa Credit Scoring Platform

This module provides AI-powered monitoring and intelligence for credit scoring operations.
It logs every /score-user call, detects anomalies, and provides intelligent insights.
"""

import json
import time
import logging
import sqlite3
import statistics
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import threading
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ScoringEvent:
    """Represents a single scoring event"""
    timestamp: float
    user_id: str
    api_key: str
    request_data: Dict[str, Any]
    response_data: Dict[str, Any]
    processing_time: float
    ip_address: str
    user_agent: str
    status_code: int
    error_message: Optional[str] = None

@dataclass
class AnomalyAlert:
    """Represents an anomaly detection alert"""
    timestamp: float
    alert_type: str
    severity: str  # low, medium, high, critical
    description: str
    affected_entities: List[str]
    metrics: Dict[str, Any]
    recommendations: List[str]

class ScoringMonitor:
    """AI-powered scoring monitor with anomaly detection"""
    
    def __init__(self, db_path: str = "data/scoring_monitor.db", 
                 window_size: int = 1000, alert_threshold: int = 10):
        """
        Initialize the scoring monitor
        
        Args:
            db_path: Path to SQLite database for persistent storage
            window_size: Size of sliding window for real-time analysis
            alert_threshold: Minimum events before triggering alerts
        """
        self.db_path = db_path
        self.window_size = window_size
        self.alert_threshold = alert_threshold
        
        # In-memory sliding windows for real-time analysis
        self.recent_events = deque(maxlen=window_size)
        self.recent_scores = deque(maxlen=window_size)
        self.recent_response_times = deque(maxlen=window_size)
        
        # Anomaly detection state
        self.baseline_metrics = {}
        self.alerts = []
        self.user_request_counts = defaultdict(int)
        self.ip_request_counts = defaultdict(int)
        
        # Thread safety
        self.lock = threading.Lock()
        
        # Initialize database
        self._init_database()
        
        # Load baseline metrics
        self._load_baseline_metrics()
    
    def _init_database(self):
        """Initialize SQLite database for persistent storage"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create scoring events table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scoring_events (
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
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create anomaly alerts table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS anomaly_alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL NOT NULL,
                    alert_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    description TEXT NOT NULL,
                    affected_entities TEXT NOT NULL,
                    metrics TEXT NOT NULL,
                    recommendations TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON scoring_events(timestamp)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_user_id ON scoring_events(user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_api_key ON scoring_events(api_key)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON anomaly_alerts(timestamp)")
            
            conn.commit()
    
    def _load_baseline_metrics(self):
        """Load baseline metrics from historical data"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get recent events for baseline calculation
                cursor.execute("""
                    SELECT processing_time, response_data, timestamp
                    FROM scoring_events 
                    WHERE timestamp > ? 
                    ORDER BY timestamp DESC 
                    LIMIT 1000
                """, (time.time() - 7 * 24 * 3600,))  # Last 7 days
                
                events = cursor.fetchall()
                
                if events:
                    processing_times = [event[0] for event in events]
                    scores = []
                    
                    for event in events:
                        try:
                            response_data = json.loads(event[1])
                            if 'credit_score' in response_data:
                                scores.append(response_data['credit_score'])
                        except json.JSONDecodeError:
                            continue
                    
                    self.baseline_metrics = {
                        'avg_processing_time': statistics.mean(processing_times),
                        'std_processing_time': statistics.stdev(processing_times) if len(processing_times) > 1 else 0,
                        'avg_score': statistics.mean(scores) if scores else 500,
                        'std_score': statistics.stdev(scores) if len(scores) > 1 else 100,
                        'requests_per_hour': len(events) / (7 * 24),  # Average per hour over 7 days
                        'last_updated': time.time()
                    }
                else:
                    # Default baseline metrics
                    self.baseline_metrics = {
                        'avg_processing_time': 0.5,
                        'std_processing_time': 0.2,
                        'avg_score': 500,
                        'std_score': 150,
                        'requests_per_hour': 10,
                        'last_updated': time.time()
                    }
                    
        except Exception as e:
            logger.error(f"Error loading baseline metrics: {e}")
            # Use default metrics
            self.baseline_metrics = {
                'avg_processing_time': 0.5,
                'std_processing_time': 0.2,
                'avg_score': 500,
                'std_score': 150,
                'requests_per_hour': 10,
                'last_updated': time.time()
            }
    
    def log_scoring_event(self, event: ScoringEvent):
        """Log a scoring event and perform real-time analysis"""
        with self.lock:
            # Add to sliding windows
            self.recent_events.append(event)
            
            # Extract score if available
            if event.response_data and 'credit_score' in event.response_data:
                self.recent_scores.append(event.response_data['credit_score'])
            
            self.recent_response_times.append(event.processing_time)
            
            # Update request counters
            self.user_request_counts[event.user_id] += 1
            self.ip_request_counts[event.ip_address] += 1
            
            # Persist to database
            self._persist_event(event)
            
            # Perform anomaly detection
            self._detect_anomalies(event)
    
    def _persist_event(self, event: ScoringEvent):
        """Persist event to database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO scoring_events 
                    (timestamp, user_id, api_key, request_data, response_data, 
                     processing_time, ip_address, user_agent, status_code, error_message)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event.timestamp,
                    event.user_id,
                    event.api_key,
                    json.dumps(event.request_data),
                    json.dumps(event.response_data),
                    event.processing_time,
                    event.ip_address,
                    event.user_agent,
                    event.status_code,
                    event.error_message
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Error persisting event: {e}")
    
    def _detect_anomalies(self, event: ScoringEvent):
        """Detect anomalies in real-time"""
        if len(self.recent_events) < self.alert_threshold:
            return
        
        current_time = time.time()
        
        # 1. Response time anomalies
        self._detect_response_time_anomalies(event, current_time)
        
        # 2. Score anomalies
        self._detect_score_anomalies(event, current_time)
        
        # 3. Request pattern anomalies
        self._detect_request_pattern_anomalies(event, current_time)
        
        # 4. Error rate anomalies
        self._detect_error_rate_anomalies(current_time)
        
        # 5. Repeat request anomalies
        self._detect_repeat_request_anomalies(event, current_time)
    
    def _detect_response_time_anomalies(self, event: ScoringEvent, current_time: float):
        """Detect response time anomalies"""
        if len(self.recent_response_times) < 10:
            return
        
        avg_time = statistics.mean(self.recent_response_times)
        baseline_avg = self.baseline_metrics.get('avg_processing_time', 0.5)
        baseline_std = self.baseline_metrics.get('std_processing_time', 0.2)
        
        # Check if current average is significantly higher than baseline
        if avg_time > baseline_avg + 3 * baseline_std:
            alert = AnomalyAlert(
                timestamp=current_time,
                alert_type="response_time_spike",
                severity="high",
                description=f"Response time spike detected: {avg_time:.3f}s (baseline: {baseline_avg:.3f}s)",
                affected_entities=[event.api_key],
                metrics={
                    "current_avg_time": avg_time,
                    "baseline_avg_time": baseline_avg,
                    "spike_factor": avg_time / baseline_avg
                },
                recommendations=[
                    "Check system resources and database performance",
                    "Review recent model changes",
                    "Consider scaling infrastructure"
                ]
            )
            self._trigger_alert(alert)
    
    def _detect_score_anomalies(self, event: ScoringEvent, current_time: float):
        """Detect unusual score patterns"""
        if len(self.recent_scores) < 20:
            return
        
        recent_avg = statistics.mean(self.recent_scores)
        baseline_avg = self.baseline_metrics.get('avg_score', 500)
        baseline_std = self.baseline_metrics.get('std_score', 150)
        
        # Check for significant deviation from baseline
        if abs(recent_avg - baseline_avg) > 2 * baseline_std:
            severity = "high" if abs(recent_avg - baseline_avg) > 3 * baseline_std else "medium"
            
            alert = AnomalyAlert(
                timestamp=current_time,
                alert_type="score_distribution_shift",
                severity=severity,
                description=f"Score distribution shift: {recent_avg:.0f} (baseline: {baseline_avg:.0f})",
                affected_entities=["scoring_model"],
                metrics={
                    "current_avg_score": recent_avg,
                    "baseline_avg_score": baseline_avg,
                    "deviation": abs(recent_avg - baseline_avg)
                },
                recommendations=[
                    "Review model performance and training data",
                    "Check for data quality issues",
                    "Consider model retraining"
                ]
            )
            self._trigger_alert(alert)
    
    def _detect_request_pattern_anomalies(self, event: ScoringEvent, current_time: float):
        """Detect unusual request patterns"""
        # Calculate current request rate
        recent_hour_events = [e for e in self.recent_events 
                             if e.timestamp > current_time - 3600]
        current_rate = len(recent_hour_events)
        baseline_rate = self.baseline_metrics.get('requests_per_hour', 10)
        
        # Check for traffic spikes
        if current_rate > baseline_rate * 5:  # 5x normal traffic
            alert = AnomalyAlert(
                timestamp=current_time,
                alert_type="traffic_spike",
                severity="medium",
                description=f"Traffic spike detected: {current_rate} req/hour (baseline: {baseline_rate:.1f})",
                affected_entities=["api_gateway"],
                metrics={
                    "current_rate": current_rate,
                    "baseline_rate": baseline_rate,
                    "spike_factor": current_rate / baseline_rate
                },
                recommendations=[
                    "Monitor system capacity",
                    "Check for potential DDoS or bot activity",
                    "Consider rate limiting adjustments"
                ]
            )
            self._trigger_alert(alert)
    
    def _detect_error_rate_anomalies(self, current_time: float):
        """Detect high error rates"""
        recent_events = [e for e in self.recent_events 
                        if e.timestamp > current_time - 3600]
        
        if len(recent_events) < 10:
            return
        
        error_events = [e for e in recent_events if e.status_code >= 400]
        error_rate = len(error_events) / len(recent_events)
        
        if error_rate > 0.1:  # More than 10% error rate
            severity = "critical" if error_rate > 0.3 else "high"
            
            alert = AnomalyAlert(
                timestamp=current_time,
                alert_type="high_error_rate",
                severity=severity,
                description=f"High error rate detected: {error_rate:.1%}",
                affected_entities=["api_service"],
                metrics={
                    "error_rate": error_rate,
                    "total_requests": len(recent_events),
                    "error_requests": len(error_events)
                },
                recommendations=[
                    "Check application logs for error details",
                    "Review recent deployments",
                    "Monitor system health"
                ]
            )
            self._trigger_alert(alert)
    
    def _detect_repeat_request_anomalies(self, event: ScoringEvent, current_time: float):
        """Detect suspicious repeat requests"""
        # Check for same user making too many requests
        user_recent_requests = self.user_request_counts[event.user_id]
        if user_recent_requests > 50:  # More than 50 requests from same user
            alert = AnomalyAlert(
                timestamp=current_time,
                alert_type="repeat_user_requests",
                severity="medium",
                description=f"User {event.user_id} has made {user_recent_requests} requests",
                affected_entities=[event.user_id],
                metrics={
                    "user_id": event.user_id,
                    "request_count": user_recent_requests
                },
                recommendations=[
                    "Review user behavior patterns",
                    "Consider implementing user-specific rate limits",
                    "Check for potential abuse"
                ]
            )
            self._trigger_alert(alert)
        
        # Check for same IP making too many requests
        ip_recent_requests = self.ip_request_counts[event.ip_address]
        if ip_recent_requests > 100:  # More than 100 requests from same IP
            alert = AnomalyAlert(
                timestamp=current_time,
                alert_type="repeat_ip_requests",
                severity="high",
                description=f"IP {event.ip_address} has made {ip_recent_requests} requests",
                affected_entities=[event.ip_address],
                metrics={
                    "ip_address": event.ip_address,
                    "request_count": ip_recent_requests
                },
                recommendations=[
                    "Implement IP-based rate limiting",
                    "Check for bot or scraping activity",
                    "Consider blocking suspicious IPs"
                ]
            )
            self._trigger_alert(alert)
    
    def _trigger_alert(self, alert: AnomalyAlert):
        """Trigger an anomaly alert"""
        # Add to alerts list
        self.alerts.append(alert)
        
        # Persist to database
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO anomaly_alerts 
                    (timestamp, alert_type, severity, description, 
                     affected_entities, metrics, recommendations)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    alert.timestamp,
                    alert.alert_type,
                    alert.severity,
                    alert.description,
                    json.dumps(alert.affected_entities),
                    json.dumps(alert.metrics),
                    json.dumps(alert.recommendations)
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Error persisting alert: {e}")
        
        # Log alert
        logger.warning(f"ANOMALY ALERT [{alert.severity.upper()}]: {alert.description}")
        
        # Keep only recent alerts in memory
        cutoff_time = time.time() - 24 * 3600  # 24 hours
        self.alerts = [a for a in self.alerts if a.timestamp > cutoff_time]
    
    def get_recent_alerts(self, hours: int = 24) -> List[AnomalyAlert]:
        """Get recent alerts"""
        cutoff_time = time.time() - hours * 3600
        return [alert for alert in self.alerts if alert.timestamp > cutoff_time]
    
    def get_monitoring_stats(self) -> Dict[str, Any]:
        """Get current monitoring statistics"""
        current_time = time.time()
        
        # Recent events (last hour)
        recent_events = [e for e in self.recent_events 
                        if e.timestamp > current_time - 3600]
        
        # Calculate metrics
        stats = {
            "timestamp": current_time,
            "total_events_tracked": len(self.recent_events),
            "events_last_hour": len(recent_events),
            "baseline_metrics": self.baseline_metrics,
            "current_metrics": {},
            "alerts_last_24h": len(self.get_recent_alerts(24)),
            "system_health": "healthy"
        }
        
        if self.recent_response_times:
            stats["current_metrics"]["avg_response_time"] = statistics.mean(self.recent_response_times)
            stats["current_metrics"]["max_response_time"] = max(self.recent_response_times)
        
        if self.recent_scores:
            stats["current_metrics"]["avg_score"] = statistics.mean(self.recent_scores)
            stats["current_metrics"]["score_std"] = statistics.stdev(self.recent_scores) if len(self.recent_scores) > 1 else 0
        
        if recent_events:
            error_events = [e for e in recent_events if e.status_code >= 400]
            stats["current_metrics"]["error_rate"] = len(error_events) / len(recent_events)
        
        # Determine system health
        critical_alerts = [a for a in self.get_recent_alerts(1) if a.severity == "critical"]
        high_alerts = [a for a in self.get_recent_alerts(1) if a.severity == "high"]
        
        if critical_alerts:
            stats["system_health"] = "critical"
        elif high_alerts:
            stats["system_health"] = "degraded"
        elif len(self.get_recent_alerts(1)) > 5:
            stats["system_health"] = "warning"
        
        return stats
    
    def generate_weekly_summary(self) -> Dict[str, Any]:
        """Generate a human-readable weekly summary"""
        end_time = time.time()
        start_time = end_time - 7 * 24 * 3600  # 7 days ago
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get weekly events
                cursor.execute("""
                    SELECT * FROM scoring_events 
                    WHERE timestamp BETWEEN ? AND ?
                    ORDER BY timestamp
                """, (start_time, end_time))
                
                events = cursor.fetchall()
                
                # Get weekly alerts
                cursor.execute("""
                    SELECT * FROM anomaly_alerts 
                    WHERE timestamp BETWEEN ? AND ?
                    ORDER BY timestamp
                """, (start_time, end_time))
                
                alerts = cursor.fetchall()
                
                # Process data
                total_requests = len(events)
                unique_users = len(set(event[2] for event in events))  # user_id column
                unique_partners = len(set(event[3] for event in events))  # api_key column
                
                # Calculate metrics
                processing_times = [event[6] for event in events]  # processing_time column
                scores = []
                error_count = 0
                
                for event in events:
                    try:
                        response_data = json.loads(event[5])  # response_data column
                        if 'credit_score' in response_data:
                            scores.append(response_data['credit_score'])
                    except json.JSONDecodeError:
                        pass
                    
                    if event[9] >= 400:  # status_code column
                        error_count += 1
                
                # Generate summary
                summary = {
                    "period": {
                        "start_date": datetime.fromtimestamp(start_time).isoformat(),
                        "end_date": datetime.fromtimestamp(end_time).isoformat(),
                        "duration_days": 7
                    },
                    "volume_metrics": {
                        "total_requests": total_requests,
                        "daily_average": total_requests / 7,
                        "unique_users": unique_users,
                        "unique_partners": unique_partners,
                        "requests_per_user": total_requests / unique_users if unique_users > 0 else 0
                    },
                    "performance_metrics": {
                        "avg_response_time": statistics.mean(processing_times) if processing_times else 0,
                        "p95_response_time": self._percentile(processing_times, 95) if processing_times else 0,
                        "error_rate": error_count / total_requests if total_requests > 0 else 0,
                        "uptime_percentage": ((total_requests - error_count) / total_requests * 100) if total_requests > 0 else 100
                    },
                    "scoring_metrics": {
                        "total_scores_generated": len(scores),
                        "avg_credit_score": statistics.mean(scores) if scores else 0,
                        "score_distribution": self._calculate_score_distribution(scores)
                    },
                    "anomaly_summary": {
                        "total_alerts": len(alerts),
                        "critical_alerts": len([a for a in alerts if a[3] == "critical"]),  # severity column
                        "high_alerts": len([a for a in alerts if a[3] == "high"]),
                        "alert_types": self._count_alert_types(alerts)
                    },
                    "recommendations": self._generate_weekly_recommendations(events, alerts, scores, processing_times)
                }
                
                return summary
                
        except Exception as e:
            logger.error(f"Error generating weekly summary: {e}")
            return {"error": str(e)}
    
    def _percentile(self, data: List[float], percentile: int) -> float:
        """Calculate percentile of data"""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]
    
    def _calculate_score_distribution(self, scores: List[float]) -> Dict[str, int]:
        """Calculate score distribution by ranges"""
        if not scores:
            return {}
        
        distribution = {
            "poor (0-579)": 0,
            "fair (580-669)": 0,
            "good (670-739)": 0,
            "very_good (740-799)": 0,
            "excellent (800-1000)": 0
        }
        
        for score in scores:
            if score < 580:
                distribution["poor (0-579)"] += 1
            elif score < 670:
                distribution["fair (580-669)"] += 1
            elif score < 740:
                distribution["good (670-739)"] += 1
            elif score < 800:
                distribution["very_good (740-799)"] += 1
            else:
                distribution["excellent (800-1000)"] += 1
        
        return distribution
    
    def _count_alert_types(self, alerts: List[Tuple]) -> Dict[str, int]:
        """Count alerts by type"""
        alert_types = defaultdict(int)
        for alert in alerts:
            alert_types[alert[2]] += 1  # alert_type column
        return dict(alert_types)
    
    def _generate_weekly_recommendations(self, events: List[Tuple], alerts: List[Tuple], 
                                       scores: List[float], processing_times: List[float]) -> List[str]:
        """Generate weekly recommendations based on data"""
        recommendations = []
        
        # Performance recommendations
        if processing_times and statistics.mean(processing_times) > 1.0:
            recommendations.append("Consider optimizing API performance - average response time exceeds 1 second")
        
        # Volume recommendations
        if len(events) > 10000:
            recommendations.append("High volume detected - consider implementing caching and load balancing")
        
        # Error rate recommendations
        error_count = len([e for e in events if e[9] >= 400])
        if error_count / len(events) > 0.05 if events else False:
            recommendations.append("Error rate above 5% - review error logs and improve error handling")
        
        # Alert recommendations
        if len(alerts) > 20:
            recommendations.append("High number of alerts - review alert thresholds and system stability")
        
        # Score distribution recommendations
        if scores:
            avg_score = statistics.mean(scores)
            if avg_score < 400:
                recommendations.append("Low average credit scores - review model performance and training data")
            elif avg_score > 800:
                recommendations.append("High average credit scores - validate model accuracy and potential bias")
        
        if not recommendations:
            recommendations.append("System performing well - continue monitoring")
        
        return recommendations
    
    def cleanup_old_data(self, days_to_keep: int = 90):
        """Clean up old data from database"""
        cutoff_time = time.time() - days_to_keep * 24 * 3600
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Delete old events
                cursor.execute("DELETE FROM scoring_events WHERE timestamp < ?", (cutoff_time,))
                events_deleted = cursor.rowcount
                
                # Delete old alerts
                cursor.execute("DELETE FROM anomaly_alerts WHERE timestamp < ?", (cutoff_time,))
                alerts_deleted = cursor.rowcount
                
                conn.commit()
                
                logger.info(f"Cleanup completed: {events_deleted} events, {alerts_deleted} alerts deleted")
                
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")

# Global monitor instance
_monitor_instance = None

def get_monitor() -> ScoringMonitor:
    """Get global monitor instance"""
    global _monitor_instance
    if _monitor_instance is None:
        _monitor_instance = ScoringMonitor()
    return _monitor_instance

def log_scoring_request(user_id: str, api_key: str, request_data: Dict[str, Any],
                       response_data: Dict[str, Any], processing_time: float,
                       ip_address: str, user_agent: str, status_code: int,
                       error_message: Optional[str] = None):
    """Convenience function to log a scoring request"""
    event = ScoringEvent(
        timestamp=time.time(),
        user_id=user_id,
        api_key=api_key,
        request_data=request_data,
        response_data=response_data,
        processing_time=processing_time,
        ip_address=ip_address,
        user_agent=user_agent,
        status_code=status_code,
        error_message=error_message
    )
    
    monitor = get_monitor()
    monitor.log_scoring_event(event)

