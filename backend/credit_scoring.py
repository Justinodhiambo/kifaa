import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
import logging
import os

logger = logging.getLogger(__name__)

class CreditScorer:
    def __init__(self, model_path: str = "models/model_v1.pkl"):
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained model from disk"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info(f"Model loaded from {self.model_path}")
            else:
                logger.warning(f"Model file not found at {self.model_path}")
                self.model = None
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            self.model = None
    
    def score_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Score a user profile and return score with explanation
        
        Args:
            user_data: Dictionary containing user profile data
            
        Returns:
            Dictionary with score and explanation
        """
        try:
            # Extract features from user data
            features = self._extract_features(user_data)
            
            # Calculate score
            if self.model is not None:
                score = self._predict_with_model(features)
            else:
                score = self._fallback_scoring(features)
            
            # Generate explanation
            explanation = self._generate_explanation(features, score)
            
            return {
                "score": float(score),
                "explanation": explanation,
                "model_used": "ml_model" if self.model is not None else "fallback"
            }
            
        except Exception as e:
            logger.error(f"Scoring failed for user {user_data.get('user_id', 'unknown')}: {str(e)}")
            raise
    
    def _extract_features(self, user_data: Dict[str, Any]) -> np.ndarray:
        """Extract and normalize features from user data"""
        # Basic feature extraction - this should be expanded based on actual model requirements
        features = [
            user_data.get('age', 30),
            user_data.get('income', 50000),
            user_data.get('credit_history_length', 5),
            user_data.get('debt_to_income_ratio', 0.3),
            user_data.get('employment_length', 2),
            user_data.get('number_of_accounts', 3)
        ]
        return np.array(features).reshape(1, -1)
    
    def _predict_with_model(self, features: np.ndarray) -> float:
        """Use the trained ML model to predict score"""
        try:
            prediction = self.model.predict(features)[0]
            # Normalize to 0-1000 scale
            return max(0, min(1000, prediction * 1000))
        except Exception as e:
            logger.error(f"Model prediction failed: {str(e)}")
            return self._fallback_scoring(features)
    
    def _fallback_scoring(self, features: np.ndarray) -> float:
        """Fallback rule-based scoring when ML model is unavailable"""
        age, income, credit_length, debt_ratio, employment_length, num_accounts = features[0]
        
        # Simple rule-based scoring
        score = 500  # Base score
        
        # Age factor (25-65 is optimal)
        if 25 <= age <= 65:
            score += 50
        else:
            score -= 30
        
        # Income factor
        if income > 100000:
            score += 100
        elif income > 50000:
            score += 50
        elif income < 20000:
            score -= 100
        
        # Credit history length
        score += min(credit_length * 20, 200)
        
        # Debt to income ratio
        if debt_ratio < 0.2:
            score += 100
        elif debt_ratio > 0.5:
            score -= 150
        
        # Employment length
        score += min(employment_length * 10, 100)
        
        # Number of accounts (diversity is good, but not too many)
        if 3 <= num_accounts <= 8:
            score += 50
        elif num_accounts > 15:
            score -= 100
        
        return max(0, min(1000, score))
    
    def _generate_explanation(self, features: np.ndarray, score: float) -> Dict[str, Any]:
        """Generate human-readable explanation for the score"""
        age, income, credit_length, debt_ratio, employment_length, num_accounts = features[0]
        
        factors = []
        
        if score > 700:
            factors.append("Strong overall financial profile")
        elif score > 500:
            factors.append("Moderate credit risk")
        else:
            factors.append("Higher credit risk profile")
        
        if income > 75000:
            factors.append("High income level")
        elif income < 30000:
            factors.append("Low income level")
        
        if credit_length > 10:
            factors.append("Long credit history")
        elif credit_length < 2:
            factors.append("Limited credit history")
        
        if debt_ratio > 0.4:
            factors.append("High debt-to-income ratio")
        elif debt_ratio < 0.2:
            factors.append("Low debt-to-income ratio")
        
        return {
            "primary_factors": factors,
            "score_range": self._get_score_range(score),
            "recommendation": self._get_recommendation(score)
        }
    
    def _get_score_range(self, score: float) -> str:
        """Get score range description"""
        if score >= 800:
            return "Excellent (800-1000)"
        elif score >= 700:
            return "Good (700-799)"
        elif score >= 600:
            return "Fair (600-699)"
        elif score >= 500:
            return "Poor (500-599)"
        else:
            return "Very Poor (0-499)"
    
    def _get_recommendation(self, score: float) -> str:
        """Get lending recommendation based on score"""
        if score >= 700:
            return "Approve with standard terms"
        elif score >= 600:
            return "Approve with higher interest rate"
        elif score >= 500:
            return "Approve with collateral or co-signer"
        else:
            return "Decline or require significant collateral"

