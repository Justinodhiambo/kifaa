#!/usr/bin/env python3
"""
Android Client Simulation for Kifaa Credit Scoring Platform

This script simulates Android app interactions with the Kifaa API,
demonstrating how mobile clients would integrate with the scoring service.
"""

import requests
import json
import time
import random
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AndroidClientSimulator:
    """Simulates Android app behavior for Kifaa credit scoring"""
    
    def __init__(self, base_url: str = "http://localhost:8000", api_key: str = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key or "kifaa_partner_001"  # Default API key
        self.session = requests.Session()
        self.device_id = str(uuid.uuid4())
        self.app_version = "1.0.0"
        
        # Set default headers
        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": f"KifaaAndroid/{self.app_version}",
            "X-Device-ID": self.device_id,
            "Authorization": f"Bearer {self.api_key}"
        })
    
    def simulate_app_launch(self) -> Dict[str, Any]:
        """Simulate app launch and health check"""
        logger.info("📱 Simulating app launch...")
        
        try:
            response = self.session.get(f"{self.base_url}/health")
            response.raise_for_status()
            
            health_data = response.json()
            logger.info(f"✅ App connected successfully: {health_data['status']}")
            
            return {
                "success": True,
                "health": health_data,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ App launch failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def simulate_user_registration(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate user registration flow"""
        logger.info(f"📝 Simulating user registration for {user_profile.get('user_id', 'unknown')}")
        
        # Simulate form validation on client side
        validation_result = self._validate_user_input(user_profile)
        if not validation_result["valid"]:
            logger.warning(f"⚠️ Client-side validation failed: {validation_result['errors']}")
            return {
                "success": False,
                "error": "Validation failed",
                "details": validation_result["errors"]
            }
        
        # Simulate network delay
        time.sleep(random.uniform(0.5, 2.0))
        
        try:
            # Call scoring API
            response = self.session.post(
                f"{self.base_url}/score-user",
                json=user_profile
            )
            
            if response.status_code == 200:
                score_data = response.json()
                logger.info(f"✅ User registered and scored: {score_data['credit_score']:.0f}")
                
                # Simulate storing result locally (SQLite in real app)
                self._simulate_local_storage(user_profile, score_data)
                
                return {
                    "success": True,
                    "score_data": score_data,
                    "cached_locally": True
                }
            
            elif response.status_code == 429:
                logger.warning("⚠️ Rate limit exceeded")
                return {
                    "success": False,
                    "error": "Rate limit exceeded",
                    "retry_after": response.headers.get("Retry-After", "60")
                }
            
            else:
                error_data = response.json() if response.content else {"error": "Unknown error"}
                logger.error(f"❌ Registration failed: {error_data}")
                return {
                    "success": False,
                    "error": error_data.get("error", "API error"),
                    "status_code": response.status_code
                }
                
        except requests.exceptions.ConnectionError:
            logger.error("❌ Network connection failed")
            return {
                "success": False,
                "error": "Network connection failed",
                "offline_mode": True
            }
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def simulate_score_check(self, user_id: str) -> Dict[str, Any]:
        """Simulate checking existing user's score"""
        logger.info(f"🔍 Simulating score check for user {user_id}")
        
        # First check local cache (simulate SQLite lookup)
        cached_data = self._simulate_cache_lookup(user_id)
        if cached_data:
            logger.info("📱 Score retrieved from local cache")
            return {
                "success": True,
                "source": "cache",
                "score_data": cached_data,
                "cached_at": cached_data.get("cached_at")
            }
        
        # If not cached, make API call
        logger.info("🌐 Score not cached, fetching from API...")
        
        # Create a sample profile for the user (in real app, this would be stored)
        sample_profile = self._generate_sample_profile(user_id)
        
        return self.simulate_user_registration(sample_profile)
    
    def simulate_offline_mode(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate offline mode functionality"""
        logger.info("📴 Simulating offline mode...")
        
        # Validate input locally
        validation_result = self._validate_user_input(user_profile)
        if not validation_result["valid"]:
            return {
                "success": False,
                "error": "Validation failed",
                "details": validation_result["errors"]
            }
        
        # Store for later sync
        offline_request = {
            "user_profile": user_profile,
            "timestamp": datetime.now().isoformat(),
            "request_id": str(uuid.uuid4()),
            "status": "pending_sync"
        }
        
        self._simulate_offline_storage(offline_request)
        
        logger.info("💾 Request stored for offline sync")
        
        return {
            "success": True,
            "message": "Request saved for when connection is restored",
            "request_id": offline_request["request_id"],
            "offline_mode": True
        }
    
    def simulate_sync_offline_requests(self) -> Dict[str, Any]:
        """Simulate syncing offline requests when connection is restored"""
        logger.info("🔄 Simulating offline sync...")
        
        offline_requests = self._get_offline_requests()
        sync_results = []
        
        for request in offline_requests:
            try:
                result = self.simulate_user_registration(request["user_profile"])
                sync_results.append({
                    "request_id": request["request_id"],
                    "success": result["success"],
                    "synced_at": datetime.now().isoformat()
                })
                
                if result["success"]:
                    logger.info(f"✅ Synced offline request {request['request_id']}")
                else:
                    logger.warning(f"⚠️ Failed to sync request {request['request_id']}")
                
                # Simulate delay between requests
                time.sleep(0.5)
                
            except Exception as e:
                logger.error(f"❌ Sync error for {request['request_id']}: {str(e)}")
                sync_results.append({
                    "request_id": request["request_id"],
                    "success": False,
                    "error": str(e)
                })
        
        return {
            "total_requests": len(offline_requests),
            "successful_syncs": len([r for r in sync_results if r["success"]]),
            "failed_syncs": len([r for r in sync_results if not r["success"]]),
            "results": sync_results
        }
    
    def simulate_batch_scoring(self, user_profiles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Simulate batch scoring for multiple users"""
        logger.info(f"📊 Simulating batch scoring for {len(user_profiles)} users...")
        
        results = []
        successful = 0
        failed = 0
        
        for i, profile in enumerate(user_profiles):
            logger.info(f"Processing user {i+1}/{len(user_profiles)}: {profile.get('user_id', 'unknown')}")
            
            result = self.simulate_user_registration(profile)
            results.append({
                "user_id": profile.get("user_id"),
                "result": result
            })
            
            if result["success"]:
                successful += 1
            else:
                failed += 1
            
            # Simulate delay to respect rate limits
            time.sleep(random.uniform(0.1, 0.5))
        
        logger.info(f"📈 Batch scoring completed: {successful} successful, {failed} failed")
        
        return {
            "total_users": len(user_profiles),
            "successful": successful,
            "failed": failed,
            "results": results
        }
    
    def _validate_user_input(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate client-side validation"""
        errors = []
        
        # Required fields
        required_fields = ["user_id", "age", "income"]
        for field in required_fields:
            if field not in user_profile or user_profile[field] is None:
                errors.append(f"Field '{field}' is required")
        
        # Age validation
        age = user_profile.get("age")
        if age is not None:
            try:
                age = float(age)
                if age < 18 or age > 100:
                    errors.append("Age must be between 18 and 100")
            except (ValueError, TypeError):
                errors.append("Age must be a valid number")
        
        # Income validation
        income = user_profile.get("income")
        if income is not None:
            try:
                income = float(income)
                if income < 0:
                    errors.append("Income cannot be negative")
            except (ValueError, TypeError):
                errors.append("Income must be a valid number")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
    
    def _simulate_local_storage(self, user_profile: Dict[str, Any], score_data: Dict[str, Any]):
        """Simulate storing data in local SQLite database"""
        # In a real app, this would use SQLite or Room database
        logger.debug(f"💾 Storing score data locally for user {user_profile['user_id']}")
        
        # Add caching timestamp
        score_data["cached_at"] = datetime.now().isoformat()
        
        # Simulate storage (in memory for this simulation)
        if not hasattr(self, '_local_cache'):
            self._local_cache = {}
        
        self._local_cache[user_profile["user_id"]] = score_data
    
    def _simulate_cache_lookup(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Simulate looking up cached score data"""
        if not hasattr(self, '_local_cache'):
            return None
        
        cached_data = self._local_cache.get(user_id)
        
        if cached_data:
            # Check if cache is still valid (e.g., less than 24 hours old)
            cached_at = datetime.fromisoformat(cached_data["cached_at"])
            age_hours = (datetime.now() - cached_at).total_seconds() / 3600
            
            if age_hours < 24:  # Cache valid for 24 hours
                return cached_data
            else:
                logger.debug(f"🗑️ Cache expired for user {user_id}")
                del self._local_cache[user_id]
        
        return None
    
    def _simulate_offline_storage(self, offline_request: Dict[str, Any]):
        """Simulate storing offline requests"""
        if not hasattr(self, '_offline_requests'):
            self._offline_requests = []
        
        self._offline_requests.append(offline_request)
    
    def _get_offline_requests(self) -> List[Dict[str, Any]]:
        """Get pending offline requests"""
        if not hasattr(self, '_offline_requests'):
            return []
        
        return self._offline_requests.copy()
    
    def _generate_sample_profile(self, user_id: str) -> Dict[str, Any]:
        """Generate a sample user profile for testing"""
        return {
            "user_id": user_id,
            "age": random.randint(25, 65),
            "income": random.randint(30000, 150000),
            "credit_history_length": random.randint(1, 20),
            "debt_to_income_ratio": round(random.uniform(0.1, 0.6), 2),
            "employment_length": random.randint(1, 15),
            "number_of_accounts": random.randint(1, 10),
            "region": random.choice(["urban", "rural", "suburban"])
        }

def run_android_simulation():
    """Run a comprehensive Android client simulation"""
    print("🚀 Starting Kifaa Android Client Simulation")
    print("=" * 50)
    
    # Initialize client
    client = AndroidClientSimulator()
    
    # 1. App Launch
    print("\n1. App Launch Simulation")
    launch_result = client.simulate_app_launch()
    print(f"Result: {launch_result}")
    
    if not launch_result["success"]:
        print("❌ Cannot continue simulation - API not available")
        return
    
    # 2. Single User Registration
    print("\n2. Single User Registration")
    sample_user = {
        "user_id": "android_user_001",
        "age": 32,
        "income": 75000,
        "credit_history_length": 8,
        "debt_to_income_ratio": 0.25,
        "employment_length": 5,
        "number_of_accounts": 4,
        "region": "urban"
    }
    
    registration_result = client.simulate_user_registration(sample_user)
    print(f"Result: {registration_result}")
    
    # 3. Score Check (Cache Test)
    print("\n3. Score Check from Cache")
    cache_result = client.simulate_score_check("android_user_001")
    print(f"Result: {cache_result}")
    
    # 4. Offline Mode Simulation
    print("\n4. Offline Mode Simulation")
    offline_user = {
        "user_id": "offline_user_001",
        "age": 28,
        "income": 55000,
        "credit_history_length": 5
    }
    
    offline_result = client.simulate_offline_mode(offline_user)
    print(f"Result: {offline_result}")
    
    # 5. Sync Offline Requests
    print("\n5. Sync Offline Requests")
    sync_result = client.simulate_sync_offline_requests()
    print(f"Result: {sync_result}")
    
    # 6. Batch Scoring
    print("\n6. Batch Scoring Simulation")
    batch_users = []
    for i in range(3):
        batch_users.append(client._generate_sample_profile(f"batch_user_{i+1:03d}"))
    
    batch_result = client.simulate_batch_scoring(batch_users)
    print(f"Result: {batch_result}")
    
    print("\n✅ Android simulation completed!")

if __name__ == "__main__":
    run_android_simulation()

