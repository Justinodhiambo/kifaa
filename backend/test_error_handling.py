import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from main import app
from credit_scoring import CreditScorer

client = TestClient(app)

class TestErrorHandling:
    """Test suite for error response handling"""
    
    def test_internal_server_error_simulation(self):
        """Test handling of internal server errors"""
        # This test would require mocking the scoring function to raise an exception
        # For now, we'll test with invalid data that might cause errors
        
        invalid_profile = {
            "user_id": "test_error",
            "age": "invalid_age",  # This should cause a validation error
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=invalid_profile)
        
        # Should return proper error response
        assert response.status_code in [400, 422, 500]
        
        if response.status_code != 500:
            # If it's a validation error, check the response format
            data = response.json()
            assert "detail" in data or "message" in data
    
    def test_malformed_request_handling(self):
        """Test handling of malformed requests"""
        # Test with completely invalid JSON structure
        response = client.post(
            "/score-user",
            data="not valid json at all",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
    
    def test_missing_content_type(self):
        """Test handling of requests without proper content type"""
        valid_profile = {
            "user_id": "test_user",
            "age": 30,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post(
            "/score-user",
            data=json.dumps(valid_profile)
            # Missing Content-Type header
        )
        
        # FastAPI should handle this gracefully
        assert response.status_code in [200, 422]
    
    def test_oversized_request(self):
        """Test handling of oversized requests"""
        # Create a very large user_id
        oversized_profile = {
            "user_id": "x" * 100000,  # Very large user ID
            "age": 30,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=oversized_profile)
        
        # Should handle gracefully
        assert response.status_code in [200, 400, 413, 422]
    
    def test_concurrent_requests(self):
        """Test handling of concurrent requests"""
        import threading
        import time
        
        results = []
        
        def make_request():
            profile = {
                "user_id": f"concurrent_user_{threading.current_thread().ident}",
                "age": 30,
                "income": 75000.0,
                "credit_history_length": 8
            }
            response = client.post("/score-user", json=profile)
            results.append(response.status_code)
        
        # Create multiple threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All requests should succeed
        assert all(status == 200 for status in results)
    
    def test_invalid_http_methods(self):
        """Test invalid HTTP methods on endpoints"""
        # Test GET on POST endpoint
        response = client.get("/score-user")
        assert response.status_code == 405  # Method Not Allowed
        
        # Test PUT on POST endpoint
        response = client.put("/score-user")
        assert response.status_code == 405
        
        # Test DELETE on POST endpoint
        response = client.delete("/score-user")
        assert response.status_code == 405
    
    def test_nonexistent_endpoints(self):
        """Test requests to nonexistent endpoints"""
        response = client.get("/nonexistent-endpoint")
        assert response.status_code == 404
        
        response = client.post("/invalid-endpoint")
        assert response.status_code == 404
    
    def test_empty_request_body(self):
        """Test handling of empty request body"""
        response = client.post("/score-user")
        assert response.status_code == 422  # Validation error
    
    def test_null_request_body(self):
        """Test handling of null request body"""
        response = client.post("/score-user", json=None)
        assert response.status_code == 422
    
    def test_array_instead_of_object(self):
        """Test sending array instead of object"""
        response = client.post("/score-user", json=[1, 2, 3])
        assert response.status_code == 422
    
    def test_string_instead_of_object(self):
        """Test sending string instead of object"""
        response = client.post("/score-user", json="invalid")
        assert response.status_code == 422

class TestCreditScorerErrorHandling:
    """Test error handling in CreditScorer class"""
    
    def test_scorer_with_corrupted_model(self):
        """Test scorer behavior with corrupted model file"""
        # Create a corrupted model file
        corrupted_model_path = "/tmp/corrupted_model.pkl"
        with open(corrupted_model_path, 'w') as f:
            f.write("This is not a valid pickle file")
        
        scorer = CreditScorer(model_path=corrupted_model_path)
        
        # Should fall back to rule-based scoring
        user_data = {
            "user_id": "test_corrupted",
            "age": 30,
            "income": 60000,
            "credit_history_length": 5
        }
        
        result = scorer.score_user_profile(user_data)
        
        assert "score" in result
        assert result["model_used"] == "fallback"
        
        # Clean up
        os.remove(corrupted_model_path)
    
    def test_scorer_with_missing_model_directory(self):
        """Test scorer with missing model directory"""
        scorer = CreditScorer(model_path="/nonexistent/directory/model.pkl")
        
        user_data = {
            "user_id": "test_missing_dir",
            "age": 30,
            "income": 60000,
            "credit_history_length": 5
        }
        
        result = scorer.score_user_profile(user_data)
        
        assert "score" in result
        assert result["model_used"] == "fallback"
    
    def test_scorer_with_invalid_user_data(self):
        """Test scorer with invalid user data"""
        scorer = CreditScorer()
        
        # Test with missing required data
        invalid_data = {}
        
        # Should handle gracefully or raise appropriate error
        try:
            result = scorer.score_user_profile(invalid_data)
            # If it doesn't raise an error, it should return valid result
            assert "score" in result
        except (KeyError, ValueError, TypeError):
            # These are acceptable errors for invalid input
            pass
    
    def test_scorer_with_nan_values(self):
        """Test scorer with NaN values in input"""
        scorer = CreditScorer()
        
        user_data = {
            "user_id": "test_nan",
            "age": float('nan'),
            "income": 60000,
            "credit_history_length": 5
        }
        
        # Should handle NaN values gracefully
        try:
            result = scorer.score_user_profile(user_data)
            assert "score" in result
            assert not np.isnan(result["score"])  # Score should not be NaN
        except (ValueError, TypeError):
            # Acceptable to raise error for NaN input
            pass
    
    def test_scorer_with_infinite_values(self):
        """Test scorer with infinite values in input"""
        scorer = CreditScorer()
        
        user_data = {
            "user_id": "test_inf",
            "age": 30,
            "income": float('inf'),
            "credit_history_length": 5
        }
        
        # Should handle infinite values gracefully
        try:
            result = scorer.score_user_profile(user_data)
            assert "score" in result
            assert np.isfinite(result["score"])  # Score should be finite
        except (ValueError, TypeError, OverflowError):
            # Acceptable to raise error for infinite input
            pass

class TestRobustness:
    """Test system robustness under various conditions"""
    
    def test_memory_usage_with_large_requests(self):
        """Test memory usage with large request data"""
        # Create a profile with large string values
        large_profile = {
            "user_id": "x" * 10000,  # Large user ID
            "age": 30,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=large_profile)
        
        # Should handle without memory issues
        assert response.status_code in [200, 400, 413, 422]
    
    def test_rapid_sequential_requests(self):
        """Test rapid sequential requests"""
        import time
        
        start_time = time.time()
        
        for i in range(10):
            profile = {
                "user_id": f"rapid_user_{i}",
                "age": 30 + i,
                "income": 75000.0 + i * 1000,
                "credit_history_length": 8
            }
            
            response = client.post("/score-user", json=profile)
            assert response.status_code == 200
        
        end_time = time.time()
        
        # Should complete within reasonable time (adjust as needed)
        assert end_time - start_time < 10  # 10 seconds for 10 requests
    
    def test_unicode_handling(self):
        """Test handling of various unicode characters"""
        unicode_profiles = [
            {
                "user_id": "用户测试",  # Chinese
                "age": 30,
                "income": 75000.0,
                "credit_history_length": 8
            },
            {
                "user_id": "пользователь",  # Russian
                "age": 30,
                "income": 75000.0,
                "credit_history_length": 8
            },
            {
                "user_id": "مستخدم",  # Arabic
                "age": 30,
                "income": 75000.0,
                "credit_history_length": 8
            },
            {
                "user_id": "🚀🌟💰",  # Emojis
                "age": 30,
                "income": 75000.0,
                "credit_history_length": 8
            }
        ]
        
        for profile in unicode_profiles:
            response = client.post("/score-user", json=profile)
            assert response.status_code == 200
            
            data = response.json()
            assert data["user_id"] == profile["user_id"]

