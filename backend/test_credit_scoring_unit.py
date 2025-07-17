import pytest
import numpy as np
import pandas as pd
import sys
import os
from unittest.mock import Mock, patch, MagicMock
import tempfile
import pickle

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from credit_scoring import CreditScorer
from shap_explainer import ShapExplainer
from utils import explain_score, validate_user_data

class TestCreditScorerUnit:
    """Unit tests for CreditScorer class methods"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.scorer = CreditScorer()
        self.sample_user_data = {
            "user_id": "test_001",
            "age": 30,
            "income": 75000,
            "credit_history_length": 8,
            "debt_to_income_ratio": 0.25,
            "employment_length": 5,
            "number_of_accounts": 4,
            "payment_history_score": 0.85,
            "credit_utilization": 0.3,
            "recent_inquiries": 1
        }
    
    def test_extract_features(self):
        """Test feature extraction from user data"""
        features = self.scorer._extract_features(self.sample_user_data)
        
        assert isinstance(features, np.ndarray)
        assert features.shape == (1, 6)  # Default feature count
        assert features[0][0] == 30  # age
        assert features[0][1] == 75000  # income
        assert features[0][2] == 8  # credit_history_length
    
    def test_extract_features_missing_data(self):
        """Test feature extraction with missing data"""
        incomplete_data = {"user_id": "test", "age": 25}
        features = self.scorer._extract_features(incomplete_data)
        
        assert isinstance(features, np.ndarray)
        assert features[0][0] == 25  # age should be present
        assert features[0][1] == 50000  # income should use default
    
    def test_fallback_scoring(self):
        """Test fallback scoring logic"""
        features = np.array([[30, 75000, 8, 0.25, 5, 4]])
        score = self.scorer._fallback_scoring(features)
        
        assert isinstance(score, float)
        assert 0 <= score <= 1000
    
    def test_fallback_scoring_edge_cases(self):
        """Test fallback scoring with edge case values"""
        # Test with very low values
        low_features = np.array([[18, 0, 0, 1.0, 0, 0]])
        low_score = self.scorer._fallback_scoring(low_features)
        assert 0 <= low_score <= 1000
        
        # Test with very high values
        high_features = np.array([[65, 200000, 20, 0.1, 15, 8]])
        high_score = self.scorer._fallback_scoring(high_features)
        assert 0 <= high_score <= 1000
        assert high_score > low_score  # High values should give higher score
    
    def test_generate_explanation(self):
        """Test explanation generation"""
        features = np.array([[35, 85000, 10, 0.2, 7, 5]])
        score = 750.0
        explanation = self.scorer._generate_explanation(features, score)
        
        assert isinstance(explanation, dict)
        assert "primary_factors" in explanation
        assert "score_range" in explanation
        assert "recommendation" in explanation
        assert isinstance(explanation["primary_factors"], list)
    
    def test_get_score_range(self):
        """Test score range categorization"""
        assert self.scorer._get_score_range(850)["category"] == "Excellent"
        assert self.scorer._get_score_range(750)["category"] == "Good"
        assert self.scorer._get_score_range(650)["category"] == "Fair"
        assert self.scorer._get_score_range(550)["category"] == "Poor"
        assert self.scorer._get_score_range(450)["category"] == "Very Poor"
    
    def test_get_recommendation(self):
        """Test recommendation generation"""
        excellent_rec = self.scorer._get_recommendation(800)
        poor_rec = self.scorer._get_recommendation(400)
        
        assert isinstance(excellent_rec, str)
        assert isinstance(poor_rec, str)
        assert "Approve" in excellent_rec
        assert "Decline" in poor_rec or "require" in poor_rec.lower()
    
    def test_score_user_profile_complete(self):
        """Test complete score_user_profile workflow"""
        result = self.scorer.score_user_profile(self.sample_user_data)
        
        assert isinstance(result, dict)
        assert "score" in result
        assert "explanation" in result
        assert "model_used" in result
        assert isinstance(result["score"], float)
        assert 0 <= result["score"] <= 1000
    
    def test_score_user_profile_consistency(self):
        """Test that scoring is consistent for same input"""
        result1 = self.scorer.score_user_profile(self.sample_user_data)
        result2 = self.scorer.score_user_profile(self.sample_user_data)
        
        assert result1["score"] == result2["score"]
        assert result1["model_used"] == result2["model_used"]
    
    def test_score_user_profile_different_inputs(self):
        """Test scoring with different user profiles"""
        high_income_user = self.sample_user_data.copy()
        high_income_user["income"] = 150000
        high_income_user["debt_to_income_ratio"] = 0.15
        
        low_income_user = self.sample_user_data.copy()
        low_income_user["income"] = 25000
        low_income_user["debt_to_income_ratio"] = 0.6
        
        high_score = self.scorer.score_user_profile(high_income_user)["score"]
        low_score = self.scorer.score_user_profile(low_income_user)["score"]
        
        assert high_score > low_score
    
    @patch('credit_scoring.pickle.load')
    @patch('credit_scoring.os.path.exists')
    def test_load_model_success(self, mock_exists, mock_pickle_load):
        """Test successful model loading"""
        mock_exists.return_value = True
        mock_model = Mock()
        mock_pickle_load.return_value = mock_model
        
        scorer = CreditScorer("test_model.pkl")
        scorer.load_model()
        
        assert scorer.model == mock_model
        mock_pickle_load.assert_called_once()
    
    @patch('credit_scoring.os.path.exists')
    def test_load_model_file_not_found(self, mock_exists):
        """Test model loading when file doesn't exist"""
        mock_exists.return_value = False
        
        scorer = CreditScorer("nonexistent_model.pkl")
        scorer.load_model()
        
        assert scorer.model is None
    
    @patch('credit_scoring.pickle.load')
    @patch('credit_scoring.os.path.exists')
    def test_load_model_exception(self, mock_exists, mock_pickle_load):
        """Test model loading with exception"""
        mock_exists.return_value = True
        mock_pickle_load.side_effect = Exception("Pickle error")
        
        scorer = CreditScorer("test_model.pkl")
        scorer.load_model()
        
        assert scorer.model is None
    
    def test_predict_with_model_no_model(self):
        """Test prediction when no model is loaded"""
        scorer = CreditScorer("nonexistent_model.pkl")
        features = np.array([[30, 75000, 8, 0.25, 5, 4]])
        
        # Should fall back to rule-based scoring
        score = scorer._predict_with_model(features)
        assert isinstance(score, float)
        assert 0 <= score <= 1000

class TestShapExplainerUnit:
    """Unit tests for ShapExplainer class"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.explainer = ShapExplainer()
        self.sample_user_data = {
            "user_id": "test_001",
            "age": 30,
            "income": 75000,
            "credit_history_length": 8,
            "debt_to_income_ratio": 0.25,
            "employment_length": 5,
            "number_of_accounts": 4,
            "region": "urban"
        }
    
    def test_check_shap_availability(self):
        """Test SHAP availability check"""
        # This will depend on whether SHAP is actually installed
        result = self.explainer._check_shap_availability()
        assert isinstance(result, bool)
    
    def test_prepare_features(self):
        """Test feature preparation for SHAP"""
        features_df = self.explainer._prepare_features(self.sample_user_data)
        
        assert isinstance(features_df, pd.DataFrame)
        assert len(features_df) == 1  # Single row
        assert features_df.iloc[0]['age'] == 30
        assert features_df.iloc[0]['income'] == 75000
    
    def test_prepare_features_with_region(self):
        """Test feature preparation with region encoding"""
        self.explainer.feature_names = ['age', 'income', 'region_urban', 'region_rural']
        features_df = self.explainer._prepare_features(self.sample_user_data)
        
        assert features_df.iloc[0]['region_urban'] == 1
        assert features_df.iloc[0]['region_rural'] == 0
    
    def test_humanize_feature_name(self):
        """Test feature name humanization"""
        assert self.explainer._humanize_feature_name('age') == 'Age'
        assert self.explainer._humanize_feature_name('income') == 'Annual Income'
        assert self.explainer._humanize_feature_name('debt_to_income_ratio') == 'Debt-to-Income Ratio'
        assert self.explainer._humanize_feature_name('unknown_feature') == 'Unknown Feature'
    
    def test_get_feature_description(self):
        """Test feature description generation"""
        desc = self.explainer._get_feature_description('income', 75000, 0.5)
        assert 'positively' in desc
        assert '75,000' in desc
        
        desc = self.explainer._get_feature_description('age', 30, -0.3)
        assert 'negatively' in desc
        assert '30' in desc
    
    def test_create_background_data(self):
        """Test background data creation"""
        self.explainer.feature_names = ['age', 'income', 'credit_history_length']
        background = self.explainer._create_background_data(50)
        
        assert isinstance(background, np.ndarray)
        assert background.shape == (50, 3)
        assert np.all(np.isfinite(background))  # No NaN or inf values
    
    def test_explain_fallback(self):
        """Test explanation fallback when SHAP is not available"""
        # Force fallback by setting shap_available to False
        self.explainer.shap_available = False
        
        explanation = self.explainer.explain(self.sample_user_data, 650)
        
        assert isinstance(explanation, dict)
        assert explanation["explanation_type"] == "rule_based"
        assert "top_factors" in explanation

class TestUtilsFunctionsUnit:
    """Unit tests for utility functions"""
    
    def test_validate_user_data_complete(self):
        """Test validation with complete valid data"""
        valid_data = {
            "user_id": "test_001",
            "age": 30,
            "income": 75000,
            "credit_history_length": 8,
            "debt_to_income_ratio": 0.25,
            "employment_length": 5,
            "number_of_accounts": 4
        }
        
        result = validate_user_data(valid_data)
        
        assert result["user_id"] == "test_001"
        assert result["age"] == 30
        assert result["income"] == 75000
        assert result["debt_to_income_ratio"] == 0.25
    
    def test_validate_user_data_minimal(self):
        """Test validation with minimal required data"""
        minimal_data = {
            "user_id": "test_002",
            "age": 25,
            "income": 50000
        }
        
        result = validate_user_data(minimal_data)
        
        assert result["user_id"] == "test_002"
        assert result["age"] == 25
        assert result["income"] == 50000
        # Should have defaults for optional fields
        assert "debt_to_income_ratio" in result
        assert "employment_length" in result
    
    def test_validate_user_data_missing_required(self):
        """Test validation with missing required fields"""
        invalid_data = {"age": 30, "income": 75000}  # Missing user_id
        
        with pytest.raises(ValueError, match="Required field 'user_id' is missing"):
            validate_user_data(invalid_data)
    
    def test_validate_user_data_invalid_age(self):
        """Test validation with invalid age values"""
        # Too young
        with pytest.raises(ValueError, match="Age must be between 18 and 100"):
            validate_user_data({"user_id": "test", "age": 17, "income": 50000})
        
        # Too old
        with pytest.raises(ValueError, match="Age must be between 18 and 100"):
            validate_user_data({"user_id": "test", "age": 101, "income": 50000})
        
        # Non-numeric
        with pytest.raises(ValueError, match="Age must be a valid number"):
            validate_user_data({"user_id": "test", "age": "thirty", "income": 50000})
    
    def test_validate_user_data_invalid_income(self):
        """Test validation with invalid income values"""
        # Negative income
        with pytest.raises(ValueError, match="Income cannot be negative"):
            validate_user_data({"user_id": "test", "age": 30, "income": -1000})
        
        # Unrealistic income
        with pytest.raises(ValueError, match="Income value seems unrealistic"):
            validate_user_data({"user_id": "test", "age": 30, "income": 20000000})
        
        # Non-numeric income
        with pytest.raises(ValueError, match="Income must be a valid number"):
            validate_user_data({"user_id": "test", "age": 30, "income": "fifty thousand"})
    
    def test_validate_user_data_empty_user_id(self):
        """Test validation with empty user_id"""
        with pytest.raises(ValueError, match="User ID cannot be empty"):
            validate_user_data({"user_id": "", "age": 30, "income": 50000})
        
        with pytest.raises(ValueError, match="User ID cannot be empty"):
            validate_user_data({"user_id": "   ", "age": 30, "income": 50000})
    
    def test_validate_user_data_out_of_range_optional(self):
        """Test validation with out-of-range optional fields"""
        data = {
            "user_id": "test",
            "age": 30,
            "income": 50000,
            "debt_to_income_ratio": 1.5,  # Out of range
            "employment_length": -1,  # Out of range
            "number_of_accounts": 100  # Out of range
        }
        
        result = validate_user_data(data)
        
        # Should use defaults for out-of-range values
        assert result["debt_to_income_ratio"] == 0.3  # Default
        assert result["employment_length"] == 2  # Default
        assert result["number_of_accounts"] == 3  # Default
    
    def test_validate_user_data_region(self):
        """Test validation of region field"""
        # Valid region
        data = {"user_id": "test", "age": 30, "income": 50000, "region": "rural"}
        result = validate_user_data(data)
        assert result["region"] == "rural"
        
        # Invalid region (should default to urban)
        data = {"user_id": "test", "age": 30, "income": 50000, "region": "invalid"}
        result = validate_user_data(data)
        assert result["region"] == "urban"
    
    def test_explain_score_with_model(self):
        """Test explain_score with a mock model"""
        mock_model = Mock()
        user_data = {
            "user_id": "test",
            "age": 30,
            "income": 75000,
            "credit_history_length": 8
        }
        
        # This should attempt SHAP but fall back to rule-based
        explanation = explain_score(user_data, 650, model=mock_model)
        
        assert isinstance(explanation, dict)
        assert "explanation_type" in explanation
        assert "top_factors" in explanation
    
    def test_explain_score_without_model(self):
        """Test explain_score without model (rule-based)"""
        user_data = {
            "user_id": "test",
            "age": 30,
            "income": 75000,
            "credit_history_length": 8,
            "debt_to_income_ratio": 0.25
        }
        
        explanation = explain_score(user_data, 650, model=None)
        
        assert explanation["explanation_type"] == "rule_based"
        assert "top_factors" in explanation
        assert "summary" in explanation
        assert isinstance(explanation["top_factors"], list)

class TestIntegrationScenarios:
    """Integration tests for common scoring scenarios"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.scorer = CreditScorer()
    
    def test_excellent_credit_profile(self):
        """Test scoring of excellent credit profile"""
        excellent_user = {
            "user_id": "excellent_001",
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
        
        result = self.scorer.score_user_profile(excellent_user)
        
        assert result["score"] >= 600  # Should be at least fair
        explanation = result["explanation"]
        assert "positive" in str(explanation).lower()
    
    def test_poor_credit_profile(self):
        """Test scoring of poor credit profile"""
        poor_user = {
            "user_id": "poor_001",
            "age": 22,
            "income": 18000,
            "credit_history_length": 0.5,
            "debt_to_income_ratio": 0.8,
            "employment_length": 0.5,
            "number_of_accounts": 1,
            "payment_history_score": 0.3,
            "credit_utilization": 0.95,
            "recent_inquiries": 8
        }
        
        result = self.scorer.score_user_profile(poor_user)
        
        assert result["score"] <= 700  # Should not be excellent
        explanation = result["explanation"]
        assert len(explanation["primary_factors"]) > 0
    
    def test_average_credit_profile(self):
        """Test scoring of average credit profile"""
        average_user = {
            "user_id": "average_001",
            "age": 32,
            "income": 55000,
            "credit_history_length": 6,
            "debt_to_income_ratio": 0.35,
            "employment_length": 4,
            "number_of_accounts": 3,
            "payment_history_score": 0.75,
            "credit_utilization": 0.4,
            "recent_inquiries": 2
        }
        
        result = self.scorer.score_user_profile(average_user)
        
        assert 400 <= result["score"] <= 800  # Should be in middle range
        assert "score" in result
        assert "explanation" in result

