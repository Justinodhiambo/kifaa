import pytest
import json
from fastapi.testclient import TestClient
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from main import app

client = TestClient(app)

class TestScoreUserValidation:
    """Test suite for /score-user endpoint input validation"""
    
    def test_valid_user_profile(self):
        """Test with valid user profile data"""
        valid_profile = {
            "user_id": "test_user_001",
            "age": 30,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=valid_profile)
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert "score" in data
        assert "explanation" in data
        assert data["user_id"] == "test_user_001"
        assert isinstance(data["score"], (int, float))
    
    def test_missing_required_fields(self):
        """Test with missing required fields"""
        # Missing user_id
        incomplete_profile = {
            "age": 30,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=incomplete_profile)
        assert response.status_code == 422  # Validation error
    
    def test_invalid_data_types(self):
        """Test with invalid data types"""
        invalid_profile = {
            "user_id": "test_user_002",
            "age": "thirty",  # Should be number
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=invalid_profile)
        assert response.status_code == 422
    
    def test_negative_values(self):
        """Test with negative values where inappropriate"""
        negative_profile = {
            "user_id": "test_user_003",
            "age": -5,  # Invalid negative age
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=negative_profile)
        # Should either reject or handle gracefully
        assert response.status_code in [200, 422, 400]
    
    def test_extreme_values(self):
        """Test with extreme values"""
        extreme_profile = {
            "user_id": "test_user_004",
            "age": 150,  # Unrealistic age
            "income": 999999999.0,  # Extremely high income
            "credit_history_length": 100  # Very long credit history
        }
        
        response = client.post("/score-user", json=extreme_profile)
        # Should handle gracefully
        assert response.status_code in [200, 400, 422]
    
    def test_empty_user_id(self):
        """Test with empty user_id"""
        empty_id_profile = {
            "user_id": "",
            "age": 30,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=empty_id_profile)
        assert response.status_code in [400, 422]
    
    def test_null_values(self):
        """Test with null values"""
        null_profile = {
            "user_id": "test_user_005",
            "age": None,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=null_profile)
        assert response.status_code == 422
    
    def test_additional_fields(self):
        """Test with additional optional fields"""
        extended_profile = {
            "user_id": "test_user_006",
            "age": 35,
            "income": 85000.0,
            "credit_history_length": 10,
            "debt_to_income_ratio": 0.25,
            "employment_length": 5,
            "number_of_accounts": 4,
            "payment_history_score": 0.95,
            "credit_utilization": 0.15,
            "recent_inquiries": 1,
            "region": "urban"
        }
        
        response = client.post("/score-user", json=extended_profile)
        assert response.status_code == 200
        
        data = response.json()
        assert data["user_id"] == "test_user_006"
    
    def test_malformed_json(self):
        """Test with malformed JSON"""
        response = client.post(
            "/score-user", 
            data="{'invalid': json}",  # Malformed JSON
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_empty_request_body(self):
        """Test with empty request body"""
        response = client.post("/score-user", json={})
        assert response.status_code == 422
    
    def test_very_long_user_id(self):
        """Test with very long user_id"""
        long_id_profile = {
            "user_id": "a" * 1000,  # Very long user ID
            "age": 30,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=long_id_profile)
        # Should handle gracefully
        assert response.status_code in [200, 400, 422]
    
    def test_special_characters_in_user_id(self):
        """Test with special characters in user_id"""
        special_char_profile = {
            "user_id": "test@user#001$%^&*()",
            "age": 30,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=special_char_profile)
        assert response.status_code == 200  # Should accept special characters
    
    def test_unicode_user_id(self):
        """Test with unicode characters in user_id"""
        unicode_profile = {
            "user_id": "用户001",  # Chinese characters
            "age": 30,
            "income": 75000.0,
            "credit_history_length": 8
        }
        
        response = client.post("/score-user", json=unicode_profile)
        assert response.status_code == 200
    
    def test_boundary_age_values(self):
        """Test with boundary age values"""
        # Test minimum adult age
        min_age_profile = {
            "user_id": "test_user_min_age",
            "age": 18,
            "income": 30000.0,
            "credit_history_length": 1
        }
        
        response = client.post("/score-user", json=min_age_profile)
        assert response.status_code == 200
        
        # Test maximum reasonable age
        max_age_profile = {
            "user_id": "test_user_max_age",
            "age": 100,
            "income": 50000.0,
            "credit_history_length": 30
        }
        
        response = client.post("/score-user", json=max_age_profile)
        assert response.status_code == 200
    
    def test_zero_income(self):
        """Test with zero income"""
        zero_income_profile = {
            "user_id": "test_user_zero_income",
            "age": 25,
            "income": 0.0,
            "credit_history_length": 2
        }
        
        response = client.post("/score-user", json=zero_income_profile)
        assert response.status_code == 200  # Should handle zero income
        
        data = response.json()
        assert isinstance(data["score"], (int, float))
    
    def test_decimal_values(self):
        """Test with decimal values"""
        decimal_profile = {
            "user_id": "test_user_decimal",
            "age": 30.5,  # Decimal age
            "income": 75000.50,
            "credit_history_length": 8.2
        }
        
        response = client.post("/score-user", json=decimal_profile)
        assert response.status_code == 200

