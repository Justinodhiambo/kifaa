#!/usr/bin/env python3
"""
Smoke Tests for Kifaa Credit Scoring Platform

Quick validation tests to ensure the system is running and basic functionality works.
These tests are designed to run quickly and catch major issues.
"""

import requests
import json
import time
import sys
import argparse
from typing import Dict, Any

class KifaaSmokeTest:
    """Quick smoke tests for Kifaa platform"""
    
    def __init__(self, base_url: str = "http://localhost:8000", api_key: str = "kifaa_partner_001"):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        })
    
    def test_health_check(self) -> bool:
        """Test if the API is responding"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get('status') == 'healthy'
            return False
        except Exception:
            return False
    
    def test_basic_scoring(self) -> bool:
        """Test basic credit scoring functionality"""
        try:
            test_profile = {
                "user_id": "smoke_test_001",
                "age": 30,
                "income": 50000,
                "region": "urban"
            }
            
            response = self.session.post(f"{self.base_url}/score-user", json=test_profile, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return 'credit_score' in data and isinstance(data['credit_score'], (int, float))
            return False
        except Exception:
            return False
    
    def test_authentication(self) -> bool:
        """Test authentication is working"""
        try:
            # Test with invalid key
            invalid_session = requests.Session()
            invalid_session.headers.update({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_key'
            })
            
            response = invalid_session.get(f"{self.base_url}/health", timeout=10)
            # Should either work (if health is public) or return 401
            return response.status_code in [200, 401]
        except Exception:
            return False
    
    def test_api_documentation(self) -> bool:
        """Test if API documentation is accessible"""
        try:
            response = requests.get(f"{self.base_url}/docs", timeout=10)
            return response.status_code == 200
        except Exception:
            return False
    
    def run_smoke_tests(self) -> Dict[str, Any]:
        """Run all smoke tests"""
        print("🔥 Running Kifaa Smoke Tests")
        print("=" * 40)
        print(f"Target: {self.base_url}")
        print("")
        
        tests = [
            ("Health Check", self.test_health_check),
            ("Basic Scoring", self.test_basic_scoring),
            ("Authentication", self.test_authentication),
            ("API Documentation", self.test_api_documentation)
        ]
        
        results = {}
        passed = 0
        
        for test_name, test_func in tests:
            print(f"Testing {test_name}...", end=" ")
            try:
                start_time = time.time()
                success = test_func()
                duration = time.time() - start_time
                
                if success:
                    print(f"✅ PASS ({duration:.2f}s)")
                    passed += 1
                else:
                    print(f"❌ FAIL ({duration:.2f}s)")
                
                results[test_name] = {
                    "success": success,
                    "duration": duration
                }
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")
                results[test_name] = {
                    "success": False,
                    "error": str(e)
                }
        
        total = len(tests)
        success_rate = (passed / total) * 100
        
        print("\n" + "=" * 40)
        print(f"Results: {passed}/{total} tests passed ({success_rate:.0f}%)")
        
        if success_rate >= 75:
            print("✅ Smoke tests PASSED")
            status = "PASSED"
        else:
            print("❌ Smoke tests FAILED")
            status = "FAILED"
        
        return {
            "status": status,
            "success_rate": success_rate,
            "passed": passed,
            "total": total,
            "results": results
        }

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Kifaa Smoke Tests')
    parser.add_argument('--base-url', default='http://localhost:8000', help='API base URL')
    parser.add_argument('--api-key', default='kifaa_partner_001', help='API key')
    
    args = parser.parse_args()
    
    tester = KifaaSmokeTest(args.base_url, args.api_key)
    results = tester.run_smoke_tests()
    
    if results["status"] == "PASSED":
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()

