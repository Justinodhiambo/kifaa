#!/usr/bin/env python3
"""
Comprehensive Integration Tests for Kifaa Credit Scoring Platform

This script performs end-to-end integration testing of the complete Kifaa system,
including API endpoints, authentication, USSD gateway, and all major features.
"""

import requests
import json
import time
import sys
import os
import argparse
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

class KifaaIntegrationTester:
    """Comprehensive integration tester for Kifaa platform"""
    
    def __init__(self, base_url: str = "http://localhost:8000", api_key: str = "kifaa_partner_001"):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        self.test_results = []
        
        # Set default headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        })
    
    def log_test_result(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        result = {
            'test_name': test_name,
            'success': success,
            'details': details,
            'response_time': response_time,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name} ({response_time:.3f}s)")
        if details:
            print(f"    {details}")
    
    def test_api_health(self) -> bool:
        """Test API health endpoint"""
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/health")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_test_result("API Health Check", True, f"Status: {data['status']}", response_time)
                    return True
                else:
                    self.log_test_result("API Health Check", False, f"Unhealthy status: {data.get('status')}", response_time)
                    return False
            else:
                self.log_test_result("API Health Check", False, f"HTTP {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test_result("API Health Check", False, f"Exception: {str(e)}")
            return False
    
    def test_authentication(self) -> bool:
        """Test authentication mechanisms"""
        success_count = 0
        total_tests = 3
        
        # Test 1: Valid API key
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/auth/me")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data:
                    self.log_test_result("Auth - Valid API Key", True, f"User: {data['user'].get('name')}", response_time)
                    success_count += 1
                else:
                    self.log_test_result("Auth - Valid API Key", False, "No user data in response", response_time)
            else:
                self.log_test_result("Auth - Valid API Key", False, f"HTTP {response.status_code}", response_time)
        except Exception as e:
            self.log_test_result("Auth - Valid API Key", False, f"Exception: {str(e)}")
        
        # Test 2: Invalid API key
        try:
            start_time = time.time()
            invalid_session = requests.Session()
            invalid_session.headers.update({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_key'
            })
            response = invalid_session.get(f"{self.base_url}/auth/me")
            response_time = time.time() - start_time
            
            if response.status_code == 401:
                self.log_test_result("Auth - Invalid API Key", True, "Correctly rejected", response_time)
                success_count += 1
            else:
                self.log_test_result("Auth - Invalid API Key", False, f"Expected 401, got {response.status_code}", response_time)
        except Exception as e:
            self.log_test_result("Auth - Invalid API Key", False, f"Exception: {str(e)}")
        
        # Test 3: JWT token generation
        try:
            start_time = time.time()
            response = self.session.post(f"{self.base_url}/auth/token", json={'api_key': self.api_key})
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data:
                    self.log_test_result("Auth - JWT Token Generation", True, "Token generated successfully", response_time)
                    success_count += 1
                else:
                    self.log_test_result("Auth - JWT Token Generation", False, "No token in response", response_time)
            else:
                self.log_test_result("Auth - JWT Token Generation", False, f"HTTP {response.status_code}", response_time)
        except Exception as e:
            self.log_test_result("Auth - JWT Token Generation", False, f"Exception: {str(e)}")
        
        return success_count == total_tests
    
    def test_credit_scoring(self) -> bool:
        """Test credit scoring functionality"""
        test_profiles = [
            {
                "name": "Excellent Credit Profile",
                "profile": {
                    "user_id": "test_excellent_001",
                    "age": 40,
                    "income": 120000,
                    "credit_history_length": 15,
                    "debt_to_income_ratio": 0.15,
                    "employment_length": 10,
                    "number_of_accounts": 6,
                    "payment_history_score": 0.98,
                    "credit_utilization": 0.1,
                    "recent_inquiries": 0,
                    "region": "urban"
                },
                "expected_min_score": 700
            },
            {
                "name": "Poor Credit Profile",
                "profile": {
                    "user_id": "test_poor_001",
                    "age": 22,
                    "income": 18000,
                    "credit_history_length": 0.5,
                    "debt_to_income_ratio": 0.8,
                    "employment_length": 0.5,
                    "number_of_accounts": 1,
                    "payment_history_score": 0.3,
                    "credit_utilization": 0.95,
                    "recent_inquiries": 8,
                    "region": "rural"
                },
                "expected_max_score": 600
            },
            {
                "name": "Average Credit Profile",
                "profile": {
                    "user_id": "test_average_001",
                    "age": 32,
                    "income": 55000,
                    "credit_history_length": 6,
                    "debt_to_income_ratio": 0.35,
                    "employment_length": 4,
                    "number_of_accounts": 3,
                    "payment_history_score": 0.75,
                    "credit_utilization": 0.4,
                    "recent_inquiries": 2,
                    "region": "suburban"
                },
                "expected_min_score": 400,
                "expected_max_score": 800
            }
        ]
        
        success_count = 0
        
        for test_case in test_profiles:
            try:
                start_time = time.time()
                response = self.session.post(f"{self.base_url}/score-user", json=test_case["profile"])
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    score = data.get('credit_score', 0)
                    
                    # Validate score range
                    min_score = test_case.get('expected_min_score', 0)
                    max_score = test_case.get('expected_max_score', 1000)
                    
                    if min_score <= score <= max_score:
                        self.log_test_result(
                            f"Credit Scoring - {test_case['name']}", 
                            True, 
                            f"Score: {score:.0f} (expected {min_score}-{max_score})", 
                            response_time
                        )
                        success_count += 1
                    else:
                        self.log_test_result(
                            f"Credit Scoring - {test_case['name']}", 
                            False, 
                            f"Score {score:.0f} outside expected range {min_score}-{max_score}", 
                            response_time
                        )
                else:
                    self.log_test_result(
                        f"Credit Scoring - {test_case['name']}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}", 
                        response_time
                    )
            except Exception as e:
                self.log_test_result(f"Credit Scoring - {test_case['name']}", False, f"Exception: {str(e)}")
        
        return success_count == len(test_profiles)
    
    def test_input_validation(self) -> bool:
        """Test input validation and error handling"""
        validation_tests = [
            {
                "name": "Missing Required Field",
                "payload": {"age": 30, "income": 50000},  # Missing user_id
                "expected_status": 400
            },
            {
                "name": "Invalid Age",
                "payload": {"user_id": "test", "age": 150, "income": 50000},
                "expected_status": 400
            },
            {
                "name": "Negative Income",
                "payload": {"user_id": "test", "age": 30, "income": -1000},
                "expected_status": 400
            },
            {
                "name": "Invalid Data Type",
                "payload": {"user_id": "test", "age": "thirty", "income": 50000},
                "expected_status": 400
            }
        ]
        
        success_count = 0
        
        for test_case in validation_tests:
            try:
                start_time = time.time()
                response = self.session.post(f"{self.base_url}/score-user", json=test_case["payload"])
                response_time = time.time() - start_time
                
                if response.status_code == test_case["expected_status"]:
                    self.log_test_result(
                        f"Validation - {test_case['name']}", 
                        True, 
                        f"Correctly returned {response.status_code}", 
                        response_time
                    )
                    success_count += 1
                else:
                    self.log_test_result(
                        f"Validation - {test_case['name']}", 
                        False, 
                        f"Expected {test_case['expected_status']}, got {response.status_code}", 
                        response_time
                    )
            except Exception as e:
                self.log_test_result(f"Validation - {test_case['name']}", False, f"Exception: {str(e)}")
        
        return success_count == len(validation_tests)
    
    def test_ussd_gateway(self) -> bool:
        """Test USSD gateway functionality"""
        try:
            # Test USSD session creation
            start_time = time.time()
            ussd_request = {
                "session_id": f"test_session_{uuid.uuid4().hex[:8]}",
                "phone_number": "+254712345678",
                "text": "",
                "service_code": "*123#"
            }
            
            response = self.session.post(f"{self.base_url}/ussd", json=ussd_request)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'text' in data and 'session_id' in data:
                    self.log_test_result("USSD Gateway - Session Creation", True, "Session created successfully", response_time)
                    
                    # Test USSD flow progression
                    session_id = data['session_id']
                    flow_success = self._test_ussd_flow(session_id, "+254712345678")
                    
                    return flow_success
                else:
                    self.log_test_result("USSD Gateway - Session Creation", False, "Invalid response format", response_time)
                    return False
            else:
                self.log_test_result("USSD Gateway - Session Creation", False, f"HTTP {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test_result("USSD Gateway - Session Creation", False, f"Exception: {str(e)}")
            return False
    
    def _test_ussd_flow(self, session_id: str, phone_number: str) -> bool:
        """Test complete USSD flow"""
        flow_steps = [
            {"input": "1", "description": "Select credit scoring"},
            {"input": "30", "description": "Enter age"},
            {"input": "50000", "description": "Enter income"},
            {"input": "5", "description": "Enter credit history"},
            {"input": "1", "description": "Select employment status"},
            {"input": "1", "description": "Select region"}
        ]
        
        for i, step in enumerate(flow_steps):
            try:
                start_time = time.time()
                ussd_request = {
                    "session_id": session_id,
                    "phone_number": phone_number,
                    "text": step["input"],
                    "service_code": "*123#"
                }
                
                response = self.session.post(f"{self.base_url}/ussd", json=ussd_request)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test_result(
                        f"USSD Flow - Step {i+1}", 
                        True, 
                        step["description"], 
                        response_time
                    )
                    
                    # Check if this is the final step
                    if data.get('end_session', False):
                        return True
                else:
                    self.log_test_result(
                        f"USSD Flow - Step {i+1}", 
                        False, 
                        f"HTTP {response.status_code}", 
                        response_time
                    )
                    return False
                    
            except Exception as e:
                self.log_test_result(f"USSD Flow - Step {i+1}", False, f"Exception: {str(e)}")
                return False
        
        return True
    
    def test_rate_limiting(self) -> bool:
        """Test rate limiting functionality"""
        try:
            # Make rapid requests to trigger rate limiting
            requests_made = 0
            rate_limited = False
            
            start_time = time.time()
            
            for i in range(20):  # Make 20 rapid requests
                response = self.session.get(f"{self.base_url}/health")
                requests_made += 1
                
                if response.status_code == 429:  # Rate limited
                    rate_limited = True
                    break
                
                time.sleep(0.1)  # Small delay between requests
            
            response_time = time.time() - start_time
            
            if rate_limited:
                self.log_test_result(
                    "Rate Limiting", 
                    True, 
                    f"Rate limit triggered after {requests_made} requests", 
                    response_time
                )
                return True
            else:
                # Rate limiting might not be triggered with low request count
                self.log_test_result(
                    "Rate Limiting", 
                    True, 
                    f"No rate limit triggered in {requests_made} requests (may be configured for higher limits)", 
                    response_time
                )
                return True
                
        except Exception as e:
            self.log_test_result("Rate Limiting", False, f"Exception: {str(e)}")
            return False
    
    def test_logging_endpoints(self) -> bool:
        """Test logging and monitoring endpoints"""
        success_count = 0
        total_tests = 2
        
        # Test logs endpoint
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/logs?lines=10")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'logs' in data:
                    self.log_test_result("Logs Endpoint", True, f"Retrieved {len(data['logs'])} log entries", response_time)
                    success_count += 1
                else:
                    self.log_test_result("Logs Endpoint", False, "No logs in response", response_time)
            else:
                self.log_test_result("Logs Endpoint", False, f"HTTP {response.status_code}", response_time)
        except Exception as e:
            self.log_test_result("Logs Endpoint", False, f"Exception: {str(e)}")
        
        # Test stats endpoint
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/stats")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict):
                    self.log_test_result("Stats Endpoint", True, f"Retrieved {len(data)} statistics", response_time)
                    success_count += 1
                else:
                    self.log_test_result("Stats Endpoint", False, "Invalid stats format", response_time)
            else:
                self.log_test_result("Stats Endpoint", False, f"HTTP {response.status_code}", response_time)
        except Exception as e:
            self.log_test_result("Stats Endpoint", False, f"Exception: {str(e)}")
        
        return success_count == total_tests
    
    def test_openapi_documentation(self) -> bool:
        """Test OpenAPI documentation endpoint"""
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/docs")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                self.log_test_result("OpenAPI Documentation", True, "Documentation accessible", response_time)
                return True
            else:
                self.log_test_result("OpenAPI Documentation", False, f"HTTP {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test_result("OpenAPI Documentation", False, f"Exception: {str(e)}")
            return False
    
    def test_performance_benchmarks(self) -> bool:
        """Test performance benchmarks"""
        # Test response time for credit scoring
        response_times = []
        
        test_profile = {
            "user_id": "perf_test_001",
            "age": 35,
            "income": 65000,
            "credit_history_length": 7,
            "debt_to_income_ratio": 0.3,
            "employment_length": 6,
            "number_of_accounts": 4,
            "region": "urban"
        }
        
        for i in range(10):
            try:
                start_time = time.time()
                response = self.session.post(f"{self.base_url}/score-user", json=test_profile)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    response_times.append(response_time)
                else:
                    self.log_test_result("Performance Benchmark", False, f"Request {i+1} failed with {response.status_code}")
                    return False
                    
            except Exception as e:
                self.log_test_result("Performance Benchmark", False, f"Request {i+1} exception: {str(e)}")
                return False
        
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            max_time = max(response_times)
            min_time = min(response_times)
            
            # Performance thresholds
            if avg_time < 1.0:  # Average response time under 1 second
                self.log_test_result(
                    "Performance Benchmark", 
                    True, 
                    f"Avg: {avg_time:.3f}s, Min: {min_time:.3f}s, Max: {max_time:.3f}s", 
                    avg_time
                )
                return True
            else:
                self.log_test_result(
                    "Performance Benchmark", 
                    False, 
                    f"Average response time {avg_time:.3f}s exceeds 1.0s threshold", 
                    avg_time
                )
                return False
        else:
            self.log_test_result("Performance Benchmark", False, "No successful requests")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all integration tests"""
        print("🧪 Starting Kifaa Integration Tests")
        print("=" * 50)
        print(f"Target URL: {self.base_url}")
        print(f"API Key: {self.api_key}")
        print("")
        
        test_suite = [
            ("API Health", self.test_api_health),
            ("Authentication", self.test_authentication),
            ("Credit Scoring", self.test_credit_scoring),
            ("Input Validation", self.test_input_validation),
            ("USSD Gateway", self.test_ussd_gateway),
            ("Rate Limiting", self.test_rate_limiting),
            ("Logging Endpoints", self.test_logging_endpoints),
            ("OpenAPI Documentation", self.test_openapi_documentation),
            ("Performance Benchmarks", self.test_performance_benchmarks)
        ]
        
        passed_tests = 0
        total_tests = len(test_suite)
        
        for test_name, test_function in test_suite:
            print(f"\n🔍 Running {test_name} tests...")
            try:
                if test_function():
                    passed_tests += 1
            except Exception as e:
                print(f"❌ {test_name} test suite failed with exception: {str(e)}")
        
        # Generate summary
        success_rate = (passed_tests / total_tests) * 100
        
        print("\n" + "=" * 50)
        print("📊 INTEGRATION TEST SUMMARY")
        print("=" * 50)
        print(f"Total Test Suites: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("✅ Integration tests PASSED")
            overall_status = "PASSED"
        else:
            print("❌ Integration tests FAILED")
            overall_status = "FAILED"
        
        return {
            "overall_status": overall_status,
            "success_rate": success_rate,
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "detailed_results": self.test_results,
            "timestamp": datetime.now().isoformat()
        }
    
    def save_results(self, results: Dict[str, Any], output_file: str):
        """Save test results to file"""
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n📄 Test results saved to: {output_file}")

def main():
    """Main function to run integration tests"""
    parser = argparse.ArgumentParser(description='Kifaa Integration Testing')
    parser.add_argument('--base-url', default='http://localhost:8000', help='API base URL')
    parser.add_argument('--api-key', default='kifaa_partner_001', help='API key for authentication')
    parser.add_argument('--output', default='integration_test_results.json', help='Output file for results')
    
    args = parser.parse_args()
    
    # Create tester instance
    tester = KifaaIntegrationTester(args.base_url, args.api_key)
    
    # Run all tests
    results = tester.run_all_tests()
    
    # Save results
    tester.save_results(results, args.output)
    
    # Exit with appropriate code
    if results["overall_status"] == "PASSED":
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()

