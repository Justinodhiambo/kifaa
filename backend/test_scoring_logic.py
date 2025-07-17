import pytest
import numpy as np
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from credit_scoring import CreditScorer
from utils import explain_score, validate_user_data

class TestCreditScoring:
    """Test suite for credit scoring logic and edge cases"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.scorer = CreditScorer()
    
    def test_score_user_profile_basic(self):
        """Test basic scoring functionality"""
        user_data = {
            "user_id": "test_001",
            "age": 30,
            "income": 75000,
            "credit_history_length": 8,
            "debt_to_income_ratio": 0.25,
            "employment_length": 5,
            "number_of_accounts": 4
        }
        
        result = self.scorer.score_user_profile(user_data)
        
        assert "score" in result
        assert "explanation" in result
        assert "model_used" in result
        assert 0 <= result["score"] <= 1000
        assert isinstance(result["score"], float)
    
    def test_score_consistency(self):
        """Test that same input produces same score"""
        user_data = {
            "user_id": "test_002",
            "age": 35,
            "income": 85000,
            "credit_history_length": 10,
            "debt_to_income_ratio": 0.2,
            "employment_length": 7,
            "number_of_accounts": 5
        }
        
        result1 = self.scorer.score_user_profile(user_data)
        result2 = self.scorer.score_user_profile(user_data)
        
        assert result1["score"] == result2["score"]
    
    def test_high_income_high_score(self):
        """Test that high income generally leads to higher scores"""
        low_income_user = {
            "user_id": "test_low_income",
            "age": 30,
            "income": 25000,
            "credit_history_length": 5,
            "debt_to_income_ratio": 0.4,
            "employment_length": 3,
            "number_of_accounts": 2
        }
        
        high_income_user = {
            "user_id": "test_high_income",
            "age": 30,
            "income": 150000,
            "credit_history_length": 5,
            "debt_to_income_ratio": 0.2,
            "employment_length": 3,
            "number_of_accounts": 2
        }
        
        low_score = self.scorer.score_user_profile(low_income_user)["score"]
        high_score = self.scorer.score_user_profile(high_income_user)["score"]
        
        assert high_score > low_score
    
    def test_credit_history_impact(self):
        """Test impact of credit history length"""
        short_history_user = {
            "user_id": "test_short_history",
            "age": 25,
            "income": 60000,
            "credit_history_length": 1,
            "debt_to_income_ratio": 0.3,
            "employment_length": 2,
            "number_of_accounts": 1
        }
        
        long_history_user = {
            "user_id": "test_long_history",
            "age": 45,
            "income": 60000,
            "credit_history_length": 20,
            "debt_to_income_ratio": 0.3,
            "employment_length": 15,
            "number_of_accounts": 8
        }
        
        short_score = self.scorer.score_user_profile(short_history_user)["score"]
        long_score = self.scorer.score_user_profile(long_history_user)["score"]
        
        assert long_score > short_score
    
    def test_debt_ratio_impact(self):
        """Test impact of debt-to-income ratio"""
        low_debt_user = {
            "user_id": "test_low_debt",
            "age": 35,
            "income": 70000,
            "credit_history_length": 8,
            "debt_to_income_ratio": 0.1,
            "employment_length": 5,
            "number_of_accounts": 4
        }
        
        high_debt_user = {
            "user_id": "test_high_debt",
            "age": 35,
            "income": 70000,
            "credit_history_length": 8,
            "debt_to_income_ratio": 0.6,
            "employment_length": 5,
            "number_of_accounts": 4
        }
        
        low_debt_score = self.scorer.score_user_profile(low_debt_user)["score"]
        high_debt_score = self.scorer.score_user_profile(high_debt_user)["score"]
        
        assert low_debt_score > high_debt_score
    
    def test_extreme_values_handling(self):
        """Test handling of extreme input values"""
        extreme_user = {
            "user_id": "test_extreme",
            "age": 100,
            "income": 1000000,
            "credit_history_length": 50,
            "debt_to_income_ratio": 0.0,
            "employment_length": 40,
            "number_of_accounts": 50
        }
        
        result = self.scorer.score_user_profile(extreme_user)
        
        # Should not crash and should return valid score
        assert 0 <= result["score"] <= 1000
        assert "explanation" in result
    
    def test_minimum_values_handling(self):
        """Test handling of minimum input values"""
        minimum_user = {
            "user_id": "test_minimum",
            "age": 18,
            "income": 0,
            "credit_history_length": 0,
            "debt_to_income_ratio": 0.0,
            "employment_length": 0,
            "number_of_accounts": 0
        }
        
        result = self.scorer.score_user_profile(minimum_user)
        
        # Should not crash and should return valid score
        assert 0 <= result["score"] <= 1000
        assert "explanation" in result
    
    def test_missing_optional_fields(self):
        """Test scoring with only required fields"""
        minimal_user = {
            "user_id": "test_minimal",
            "age": 30,
            "income": 50000,
            "credit_history_length": 5
        }
        
        result = self.scorer.score_user_profile(minimal_user)
        
        assert 0 <= result["score"] <= 1000
        assert "explanation" in result
    
    def test_fallback_scoring_without_model(self):
        """Test fallback scoring when model is not available"""
        # Create scorer without model
        scorer_no_model = CreditScorer(model_path="nonexistent_model.pkl")
        
        user_data = {
            "user_id": "test_fallback",
            "age": 30,
            "income": 60000,
            "credit_history_length": 6,
            "debt_to_income_ratio": 0.3,
            "employment_length": 4,
            "number_of_accounts": 3
        }
        
        result = scorer_no_model.score_user_profile(user_data)
        
        assert 0 <= result["score"] <= 1000
        assert result["model_used"] == "fallback"
    
    def test_score_ranges(self):
        """Test that different user profiles fall into expected score ranges"""
        # Excellent profile
        excellent_user = {
            "user_id": "excellent",
            "age": 40,
            "income": 120000,
            "credit_history_length": 15,
            "debt_to_income_ratio": 0.15,
            "employment_length": 10,
            "number_of_accounts": 6,
            "payment_history_score": 0.98,
            "credit_utilization": 0.1,
            "recent_inquiries": 0
        }
        
        # Poor profile
        poor_user = {
            "user_id": "poor",
            "age": 22,
            "income": 18000,
            "credit_history_length": 0.5,
            "debt_to_income_ratio": 0.7,
            "employment_length": 0.5,
            "number_of_accounts": 1,
            "payment_history_score": 0.3,
            "credit_utilization": 0.9,
            "recent_inquiries": 8
        }
        
        excellent_score = self.scorer.score_user_profile(excellent_user)["score"]
        poor_score = self.scorer.score_user_profile(poor_user)["score"]
        
        assert excellent_score > poor_score
        assert excellent_score >= 600  # Should be at least fair
        assert poor_score <= 600  # Should be poor or fair at best

class TestUtilsFunctions:
    """Test suite for utility functions"""
    
    def test_validate_user_data_valid(self):
        """Test validation with valid data"""
        valid_data = {
            "user_id": "test_001",
            "age": 30,
            "income": 75000,
            "credit_history_length": 8
        }
        
        result = validate_user_data(valid_data)
        
        assert result["user_id"] == "test_001"
        assert result["age"] == 30
        assert result["income"] == 75000
        assert result["credit_history_length"] == 8
    
    def test_validate_user_data_missing_required(self):
        """Test validation with missing required fields"""
        invalid_data = {
            "age": 30,
            "income": 75000
            # Missing user_id
        }
        
        with pytest.raises(ValueError, match="Required field 'user_id' is missing"):
            validate_user_data(invalid_data)
    
    def test_validate_user_data_invalid_age(self):
        """Test validation with invalid age"""
        invalid_data = {
            "user_id": "test_001",
            "age": 150,  # Too old
            "income": 75000
        }
        
        with pytest.raises(ValueError, match="Age must be between 18 and 100"):
            validate_user_data(invalid_data)
    
    def test_validate_user_data_negative_income(self):
        """Test validation with negative income"""
        invalid_data = {
            "user_id": "test_001",
            "age": 30,
            "income": -5000  # Negative income
        }
        
        with pytest.raises(ValueError, match="Income cannot be negative"):
            validate_user_data(invalid_data)
    
    def test_validate_user_data_with_defaults(self):
        """Test validation applies defaults for optional fields"""
        minimal_data = {
            "user_id": "test_001",
            "age": 30,
            "income": 75000
        }
        
        result = validate_user_data(minimal_data)
        
        # Should have defaults for optional fields
        assert "debt_to_income_ratio" in result
        assert "employment_length" in result
        assert "number_of_accounts" in result
        assert result["debt_to_income_ratio"] == 0.3  # Default value
    
    def test_explain_score_rule_based(self):
        """Test rule-based score explanation"""
        user_data = {
            "user_id": "test_001",
            "age": 30,
            "income": 75000,
            "credit_history_length": 8,
            "debt_to_income_ratio": 0.25
        }
        
        explanation = explain_score(user_data, 650, model=None)
        
        assert "explanation_type" in explanation
        assert explanation["explanation_type"] == "rule_based"
        assert "top_factors" in explanation
        assert "score_category" in explanation
        assert "summary" in explanation
        assert isinstance(explanation["top_factors"], list)
    
    def test_explain_score_different_profiles(self):
        """Test explanations for different user profiles"""
        high_income_user = {
            "user_id": "high_income",
            "age": 35,
            "income": 150000,
            "credit_history_length": 12,
            "debt_to_income_ratio": 0.15
        }
        
        low_income_user = {
            "user_id": "low_income",
            "age": 25,
            "income": 25000,
            "credit_history_length": 2,
            "debt_to_income_ratio": 0.5
        }
        
        high_explanation = explain_score(high_income_user, 750, model=None)
        low_explanation = explain_score(low_income_user, 450, model=None)
        
        # Should have different factors and summaries
        assert high_explanation["summary"] != low_explanation["summary"]
        assert len(high_explanation["top_factors"]) > 0
        assert len(low_explanation["top_factors"]) > 0

