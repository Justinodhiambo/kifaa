#!/usr/bin/env python3
"""
Stress Testing Suite for Kifaa Credit Scoring API

This script performs comprehensive stress testing using multiple approaches:
1. Locust-based load testing
2. Custom concurrent testing
3. Performance analysis and reporting
"""

import asyncio
import aiohttp
import time
import json
import random
import statistics
import concurrent.futures
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
import argparse
import sys
import os
from dataclasses import dataclass
import matplotlib.pyplot as plt
import pandas as pd

# Add app directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

@dataclass
class TestResult:
    """Container for individual test result"""
    timestamp: float
    response_time: float
    status_code: int
    success: bool
    error_message: str = None
    endpoint: str = None

@dataclass
class StressTestConfig:
    """Configuration for stress testing"""
    base_url: str = "http://localhost:8000"
    api_key: str = "kifaa_partner_001"
    max_users: int = 100
    ramp_up_time: int = 60  # seconds
    test_duration: int = 300  # seconds
    endpoints: List[str] = None
    
    def __post_init__(self):
        if self.endpoints is None:
            self.endpoints = ['/score-user', '/health', '/stats']

class KifaaStressTester:
    """Comprehensive stress tester for Kifaa API"""
    
    def __init__(self, config: StressTestConfig):
        self.config = config
        self.results: List[TestResult] = []
        self.user_profiles = self._generate_test_profiles(1000)
        
    def _generate_test_profiles(self, count: int) -> List[Dict[str, Any]]:
        """Generate test user profiles for stress testing"""
        profiles = []
        
        for i in range(count):
            profile = {
                "user_id": f"stress_test_user_{i:04d}",
                "age": random.randint(18, 65),
                "income": random.randint(20000, 150000),
                "credit_history_length": random.uniform(0, 20),
                "debt_to_income_ratio": random.uniform(0.1, 0.8),
                "employment_length": random.uniform(0, 15),
                "number_of_accounts": random.randint(0, 10),
                "region": random.choice(["urban", "rural", "suburban"])
            }
            profiles.append(profile)
        
        return profiles
    
    async def _make_request(self, session: aiohttp.ClientSession, endpoint: str, 
                           method: str = 'GET', data: Dict = None) -> TestResult:
        """Make a single HTTP request and record result"""
        start_time = time.time()
        
        headers = {
            'Authorization': f'Bearer {self.config.api_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            if method.upper() == 'POST' and data:
                async with session.post(
                    f"{self.config.base_url}{endpoint}",
                    json=data,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    await response.text()  # Read response body
                    response_time = time.time() - start_time
                    
                    return TestResult(
                        timestamp=start_time,
                        response_time=response_time,
                        status_code=response.status,
                        success=200 <= response.status < 400,
                        endpoint=endpoint
                    )
            else:
                async with session.get(
                    f"{self.config.base_url}{endpoint}",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    await response.text()  # Read response body
                    response_time = time.time() - start_time
                    
                    return TestResult(
                        timestamp=start_time,
                        response_time=response_time,
                        status_code=response.status,
                        success=200 <= response.status < 400,
                        endpoint=endpoint
                    )
                    
        except asyncio.TimeoutError:
            return TestResult(
                timestamp=start_time,
                response_time=time.time() - start_time,
                status_code=0,
                success=False,
                error_message="Timeout",
                endpoint=endpoint
            )
        except Exception as e:
            return TestResult(
                timestamp=start_time,
                response_time=time.time() - start_time,
                status_code=0,
                success=False,
                error_message=str(e),
                endpoint=endpoint
            )
    
    async def _simulate_user(self, user_id: int, session: aiohttp.ClientSession, 
                           test_duration: int) -> List[TestResult]:
        """Simulate a single user's behavior"""
        user_results = []
        end_time = time.time() + test_duration
        
        while time.time() < end_time:
            # Choose random endpoint
            endpoint = random.choice(self.config.endpoints)
            
            if endpoint == '/score-user':
                # Use random profile for scoring
                profile = random.choice(self.user_profiles)
                result = await self._make_request(session, endpoint, 'POST', profile)
            else:
                result = await self._make_request(session, endpoint, 'GET')
            
            user_results.append(result)
            
            # Random delay between requests (0.1 to 2 seconds)
            await asyncio.sleep(random.uniform(0.1, 2.0))
        
        return user_results
    
    async def run_async_stress_test(self) -> Dict[str, Any]:
        """Run asynchronous stress test"""
        print(f"🚀 Starting async stress test...")
        print(f"   Max users: {self.config.max_users}")
        print(f"   Ramp-up time: {self.config.ramp_up_time}s")
        print(f"   Test duration: {self.config.test_duration}s")
        
        start_time = time.time()
        
        # Create aiohttp session
        connector = aiohttp.TCPConnector(limit=self.config.max_users * 2)
        async with aiohttp.ClientSession(connector=connector) as session:
            
            # Ramp up users gradually
            tasks = []
            users_per_second = self.config.max_users / self.config.ramp_up_time
            
            for user_id in range(self.config.max_users):
                # Calculate when to start this user
                start_delay = user_id / users_per_second
                
                # Create task with delay
                task = asyncio.create_task(
                    self._delayed_user_simulation(
                        user_id, session, start_delay, self.config.test_duration
                    )
                )
                tasks.append(task)
            
            # Wait for all users to complete
            all_results = await asyncio.gather(*tasks)
            
            # Flatten results
            for user_results in all_results:
                self.results.extend(user_results)
        
        total_time = time.time() - start_time
        
        print(f"✅ Async stress test completed in {total_time:.2f}s")
        print(f"   Total requests: {len(self.results)}")
        
        return self._analyze_results()
    
    async def _delayed_user_simulation(self, user_id: int, session: aiohttp.ClientSession,
                                     delay: float, duration: int) -> List[TestResult]:
        """Start user simulation after delay"""
        await asyncio.sleep(delay)
        return await self._simulate_user(user_id, session, duration)
    
    def run_concurrent_stress_test(self) -> Dict[str, Any]:
        """Run concurrent stress test using ThreadPoolExecutor"""
        print(f"🔄 Starting concurrent stress test...")
        
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.config.max_users) as executor:
            # Submit tasks for each user
            futures = []
            for user_id in range(self.config.max_users):
                future = executor.submit(self._sync_user_simulation, user_id)
                futures.append(future)
            
            # Collect results
            for future in concurrent.futures.as_completed(futures):
                try:
                    user_results = future.result()
                    self.results.extend(user_results)
                except Exception as e:
                    print(f"User simulation failed: {e}")
        
        total_time = time.time() - start_time
        
        print(f"✅ Concurrent stress test completed in {total_time:.2f}s")
        print(f"   Total requests: {len(self.results)}")
        
        return self._analyze_results()
    
    def _sync_user_simulation(self, user_id: int) -> List[TestResult]:
        """Synchronous user simulation for thread pool"""
        import requests
        
        user_results = []
        end_time = time.time() + self.config.test_duration
        
        session = requests.Session()
        session.headers.update({
            'Authorization': f'Bearer {self.config.api_key}',
            'Content-Type': 'application/json'
        })
        
        while time.time() < end_time:
            endpoint = random.choice(self.config.endpoints)
            start_time = time.time()
            
            try:
                if endpoint == '/score-user':
                    profile = random.choice(self.user_profiles)
                    response = session.post(
                        f"{self.config.base_url}{endpoint}",
                        json=profile,
                        timeout=30
                    )
                else:
                    response = session.get(
                        f"{self.config.base_url}{endpoint}",
                        timeout=30
                    )
                
                response_time = time.time() - start_time
                
                result = TestResult(
                    timestamp=start_time,
                    response_time=response_time,
                    status_code=response.status_code,
                    success=200 <= response.status_code < 400,
                    endpoint=endpoint
                )
                
            except Exception as e:
                result = TestResult(
                    timestamp=start_time,
                    response_time=time.time() - start_time,
                    status_code=0,
                    success=False,
                    error_message=str(e),
                    endpoint=endpoint
                )
            
            user_results.append(result)
            time.sleep(random.uniform(0.1, 2.0))
        
        return user_results
    
    def _analyze_results(self) -> Dict[str, Any]:
        """Analyze stress test results"""
        if not self.results:
            return {"error": "No results to analyze"}
        
        # Basic statistics
        response_times = [r.response_time for r in self.results]
        successful_requests = [r for r in self.results if r.success]
        failed_requests = [r for r in self.results if not r.success]
        
        # Calculate metrics
        total_requests = len(self.results)
        success_rate = len(successful_requests) / total_requests * 100
        
        # Response time statistics
        avg_response_time = statistics.mean(response_times)
        median_response_time = statistics.median(response_times)
        p95_response_time = self._percentile(response_times, 95)
        p99_response_time = self._percentile(response_times, 99)
        max_response_time = max(response_times)
        min_response_time = min(response_times)
        
        # Requests per second
        if self.results:
            test_duration = max(r.timestamp for r in self.results) - min(r.timestamp for r in self.results)
            rps = total_requests / test_duration if test_duration > 0 else 0
        else:
            rps = 0
        
        # Error analysis
        error_types = {}
        status_codes = {}
        
        for result in failed_requests:
            error_msg = result.error_message or f"HTTP {result.status_code}"
            error_types[error_msg] = error_types.get(error_msg, 0) + 1
        
        for result in self.results:
            status_codes[result.status_code] = status_codes.get(result.status_code, 0) + 1
        
        # Endpoint performance
        endpoint_stats = {}
        for endpoint in self.config.endpoints:
            endpoint_results = [r for r in self.results if r.endpoint == endpoint]
            if endpoint_results:
                endpoint_response_times = [r.response_time for r in endpoint_results]
                endpoint_stats[endpoint] = {
                    'total_requests': len(endpoint_results),
                    'success_rate': len([r for r in endpoint_results if r.success]) / len(endpoint_results) * 100,
                    'avg_response_time': statistics.mean(endpoint_response_times),
                    'p95_response_time': self._percentile(endpoint_response_times, 95)
                }
        
        analysis = {
            'test_config': {
                'max_users': self.config.max_users,
                'test_duration': self.config.test_duration,
                'endpoints': self.config.endpoints
            },
            'summary': {
                'total_requests': total_requests,
                'successful_requests': len(successful_requests),
                'failed_requests': len(failed_requests),
                'success_rate': round(success_rate, 2),
                'requests_per_second': round(rps, 2)
            },
            'response_times': {
                'average': round(avg_response_time, 3),
                'median': round(median_response_time, 3),
                'p95': round(p95_response_time, 3),
                'p99': round(p99_response_time, 3),
                'min': round(min_response_time, 3),
                'max': round(max_response_time, 3)
            },
            'errors': {
                'error_types': error_types,
                'status_codes': status_codes
            },
            'endpoint_performance': endpoint_stats
        }
        
        return analysis
    
    def _percentile(self, data: List[float], percentile: int) -> float:
        """Calculate percentile of data"""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]
    
    def generate_report(self, analysis: Dict[str, Any], output_file: str = None):
        """Generate detailed stress test report"""
        report = []
        report.append("=" * 60)
        report.append("KIFAA API STRESS TEST REPORT")
        report.append("=" * 60)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Test Configuration
        report.append("TEST CONFIGURATION:")
        report.append("-" * 20)
        config = analysis['test_config']
        report.append(f"Max Users: {config['max_users']}")
        report.append(f"Test Duration: {config['test_duration']}s")
        report.append(f"Endpoints: {', '.join(config['endpoints'])}")
        report.append("")
        
        # Summary
        report.append("SUMMARY:")
        report.append("-" * 20)
        summary = analysis['summary']
        report.append(f"Total Requests: {summary['total_requests']}")
        report.append(f"Successful: {summary['successful_requests']}")
        report.append(f"Failed: {summary['failed_requests']}")
        report.append(f"Success Rate: {summary['success_rate']}%")
        report.append(f"Requests/Second: {summary['requests_per_second']}")
        report.append("")
        
        # Response Times
        report.append("RESPONSE TIMES (seconds):")
        report.append("-" * 20)
        times = analysis['response_times']
        report.append(f"Average: {times['average']}")
        report.append(f"Median: {times['median']}")
        report.append(f"95th Percentile: {times['p95']}")
        report.append(f"99th Percentile: {times['p99']}")
        report.append(f"Min: {times['min']}")
        report.append(f"Max: {times['max']}")
        report.append("")
        
        # Endpoint Performance
        report.append("ENDPOINT PERFORMANCE:")
        report.append("-" * 20)
        for endpoint, stats in analysis['endpoint_performance'].items():
            report.append(f"{endpoint}:")
            report.append(f"  Requests: {stats['total_requests']}")
            report.append(f"  Success Rate: {stats['success_rate']:.1f}%")
            report.append(f"  Avg Response: {stats['avg_response_time']:.3f}s")
            report.append(f"  P95 Response: {stats['p95_response_time']:.3f}s")
        report.append("")
        
        # Errors
        if analysis['errors']['error_types']:
            report.append("ERROR ANALYSIS:")
            report.append("-" * 20)
            for error, count in analysis['errors']['error_types'].items():
                report.append(f"{error}: {count}")
            report.append("")
        
        # Status Codes
        report.append("STATUS CODE DISTRIBUTION:")
        report.append("-" * 20)
        for code, count in analysis['errors']['status_codes'].items():
            report.append(f"HTTP {code}: {count}")
        
        report_text = "\n".join(report)
        
        if output_file:
            with open(output_file, 'w') as f:
                f.write(report_text)
            print(f"📄 Report saved to {output_file}")
        
        return report_text
    
    def create_visualizations(self, analysis: Dict[str, Any], output_dir: str = "."):
        """Create visualization charts"""
        try:
            import matplotlib.pyplot as plt
            import pandas as pd
            
            os.makedirs(output_dir, exist_ok=True)
            
            # Response time distribution
            response_times = [r.response_time for r in self.results]
            
            plt.figure(figsize=(12, 8))
            
            # Histogram
            plt.subplot(2, 2, 1)
            plt.hist(response_times, bins=50, alpha=0.7, color='blue')
            plt.title('Response Time Distribution')
            plt.xlabel('Response Time (seconds)')
            plt.ylabel('Frequency')
            
            # Timeline
            plt.subplot(2, 2, 2)
            timestamps = [r.timestamp for r in self.results]
            plt.scatter(timestamps, response_times, alpha=0.5, s=1)
            plt.title('Response Time Over Time')
            plt.xlabel('Time')
            plt.ylabel('Response Time (seconds)')
            
            # Success rate by endpoint
            plt.subplot(2, 2, 3)
            endpoints = list(analysis['endpoint_performance'].keys())
            success_rates = [analysis['endpoint_performance'][ep]['success_rate'] for ep in endpoints]
            plt.bar(endpoints, success_rates, color='green', alpha=0.7)
            plt.title('Success Rate by Endpoint')
            plt.ylabel('Success Rate (%)')
            plt.xticks(rotation=45)
            
            # Status code distribution
            plt.subplot(2, 2, 4)
            status_codes = list(analysis['errors']['status_codes'].keys())
            counts = list(analysis['errors']['status_codes'].values())
            plt.pie(counts, labels=status_codes, autopct='%1.1f%%')
            plt.title('Status Code Distribution')
            
            plt.tight_layout()
            chart_file = os.path.join(output_dir, 'stress_test_charts.png')
            plt.savefig(chart_file, dpi=300, bbox_inches='tight')
            plt.close()
            
            print(f"📊 Charts saved to {chart_file}")
            
        except ImportError:
            print("⚠️ matplotlib not available, skipping visualizations")

def run_locust_test(config: StressTestConfig):
    """Run Locust-based stress test"""
    try:
        from locust import HttpUser, task, between
        from locust.env import Environment
        from locust.stats import stats_printer, stats_history
        from locust.log import setup_logging
        import gevent
        
        class KifaaUser(HttpUser):
            wait_time = between(1, 3)
            
            def on_start(self):
                self.client.headers.update({
                    'Authorization': f'Bearer {config.api_key}',
                    'Content-Type': 'application/json'
                })
                
                # Generate test profiles
                self.profiles = []
                for i in range(10):
                    profile = {
                        "user_id": f"locust_user_{i}",
                        "age": random.randint(18, 65),
                        "income": random.randint(20000, 150000),
                        "credit_history_length": random.uniform(0, 20),
                        "debt_to_income_ratio": random.uniform(0.1, 0.8),
                        "employment_length": random.uniform(0, 15),
                        "number_of_accounts": random.randint(0, 10),
                        "region": random.choice(["urban", "rural", "suburban"])
                    }
                    self.profiles.append(profile)
            
            @task(3)
            def score_user(self):
                profile = random.choice(self.profiles)
                self.client.post("/score-user", json=profile)
            
            @task(1)
            def health_check(self):
                self.client.get("/health")
            
            @task(1)
            def get_stats(self):
                self.client.get("/stats")
        
        # Setup Locust environment
        env = Environment(user_classes=[KifaaUser])
        env.create_local_runner()
        
        # Start test
        print(f"🦗 Starting Locust stress test...")
        env.runner.start(config.max_users, spawn_rate=config.max_users/config.ramp_up_time)
        
        # Run for specified duration
        gevent.spawn_later(config.test_duration, lambda: env.runner.quit())
        env.runner.greenlet.join()
        
        # Get results
        stats = env.runner.stats
        
        return {
            'total_requests': stats.total.num_requests,
            'total_failures': stats.total.num_failures,
            'average_response_time': stats.total.avg_response_time,
            'min_response_time': stats.total.min_response_time,
            'max_response_time': stats.total.max_response_time,
            'requests_per_second': stats.total.current_rps,
            'failure_rate': stats.total.fail_ratio
        }
        
    except ImportError:
        print("⚠️ Locust not available, skipping Locust test")
        return None

def main():
    """Main function to run stress tests"""
    parser = argparse.ArgumentParser(description='Kifaa API Stress Testing')
    parser.add_argument('--url', default='http://localhost:8000', help='API base URL')
    parser.add_argument('--api-key', default='kifaa_partner_001', help='API key for authentication')
    parser.add_argument('--users', type=int, default=50, help='Maximum concurrent users')
    parser.add_argument('--ramp-up', type=int, default=30, help='Ramp-up time in seconds')
    parser.add_argument('--duration', type=int, default=120, help='Test duration in seconds')
    parser.add_argument('--test-type', choices=['async', 'concurrent', 'locust', 'all'], 
                       default='all', help='Type of stress test to run')
    parser.add_argument('--output-dir', default='stress_test_results', help='Output directory for results')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Create test configuration
    config = StressTestConfig(
        base_url=args.url,
        api_key=args.api_key,
        max_users=args.users,
        ramp_up_time=args.ramp_up,
        test_duration=args.duration
    )
    
    print("🧪 Kifaa API Stress Testing Suite")
    print("=" * 50)
    print(f"Target URL: {config.base_url}")
    print(f"Max Users: {config.max_users}")
    print(f"Duration: {config.test_duration}s")
    print("")
    
    results = {}
    
    # Run tests based on selection
    if args.test_type in ['async', 'all']:
        print("Running async stress test...")
        tester = KifaaStressTester(config)
        results['async'] = asyncio.run(tester.run_async_stress_test())
        
        # Generate report
        report = tester.generate_report(
            results['async'], 
            os.path.join(args.output_dir, 'async_stress_test_report.txt')
        )
        
        # Create visualizations
        tester.create_visualizations(results['async'], args.output_dir)
    
    if args.test_type in ['concurrent', 'all']:
        print("\nRunning concurrent stress test...")
        tester = KifaaStressTester(config)
        results['concurrent'] = tester.run_concurrent_stress_test()
        
        # Generate report
        report = tester.generate_report(
            results['concurrent'], 
            os.path.join(args.output_dir, 'concurrent_stress_test_report.txt')
        )
    
    if args.test_type in ['locust', 'all']:
        print("\nRunning Locust stress test...")
        locust_results = run_locust_test(config)
        if locust_results:
            results['locust'] = locust_results
    
    # Save combined results
    with open(os.path.join(args.output_dir, 'stress_test_results.json'), 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n✅ Stress testing completed!")
    print(f"📁 Results saved to: {args.output_dir}")
    
    # Print summary
    if 'async' in results:
        summary = results['async']['summary']
        print(f"\n📊 Async Test Summary:")
        print(f"   Success Rate: {summary['success_rate']}%")
        print(f"   Requests/Second: {summary['requests_per_second']}")
        print(f"   Avg Response Time: {results['async']['response_times']['average']}s")

if __name__ == "__main__":
    main()

