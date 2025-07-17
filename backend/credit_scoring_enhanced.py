#!/usr/bin/env python3
"""
Enhanced Credit Scoring Module for Kifaa Platform

This module provides credit scoring functionality with model versioning,
fallback mechanisms, and comprehensive error handling.
"""

import pickle
import numpy as np
import pandas as pd
import logging
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
import time

from model_manager import get_model_manager
from utils import explain_score

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CreditScorer:
    """Enhanced credit scoring with model management"""
    
    def __init__(self):
        """Initialize the credit scorer"""
        self.model_manager = get_model_manager()
        self.current_model = None
        self.current_metadata = None
        self.feature_columns = [
            'age', 'income', 'credit_history_length', 'debt_to_income_ratio',
            'employment_length', 'number_of_accounts', 'payment_history_score',
            'credit_utilization', 'recent_inquiries'
        ]
        
        # Load model on initialization
        self._load_model()
    
    def _load_model(self):
        """Load the latest active model"""
        try:
            self.current_model, self.current_metadata = self.model_manager.load_latest_model()
            logger.info(f"Loaded model {self.current_metadata.version}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.current_model = None
            self.current_metadata = None
    
    def reload_model(self):
        """Reload the model (useful after model updates)"""
        self.current_model = None
        self.current_metadata = None
        self._load_model()
    
    def score_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Score a user profile and return comprehensive results
        
        Args:
            user_data: Dictionary containing user profile data
            
        Returns:
            Dictionary with score, explanation, and metadata
        """
        start_time = time.time()
        
        try:
            # Validate input data
            validation_result = self._validate_user_data(user_data)
            if not validation_result['valid']:
                return {
                    'error': 'Invalid input data',
                    'details': validation_result['errors'],
                    'processing_time': time.time() - start_time
                }
            
            # Ensure model is loaded
            if self.current_model is None:
                self._load_model()
            
            if self.current_model is None:
                return self._fallback_scoring(user_data, start_time)
            
            # Prepare features
            features = self._prepare_features(user_data)
            
            # Make prediction
            score = self.current_model.predict([features])[0]
            
            # Ensure score is in valid range
            score = max(300, min(850, float(score)))
            
            # Generate explanation
            explanation = explain_score(user_data, score, self.current_model)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Record performance metric
            self.model_manager.record_performance_metric(
                self.current_metadata.version,
                "prediction_time",
                processing_time
            )
            
            return {
                'credit_score': score,
                'score_range': self._get_score_range(score),
                'explanation': explanation,
                'model_version': self.current_metadata.version,
                'model_type': self.current_metadata.model_type,
                'confidence': self._calculate_confidence(features),
                'processing_time': processing_time,
                'timestamp': time.time()
            }
            
        except Exception as e:
            logger.error(f"Error in score_user_profile: {e}")
            return self._fallback_scoring(user_data, start_time, str(e))
    
    def _validate_user_data(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user input data"""
        errors = []
        
        # Required fields
        required_fields = ['age', 'income', 'credit_history_length', 'debt_to_income_ratio']
        for field in required_fields:
            if field not in user_data:
                errors.append(f"Missing required field: {field}")
        
        # Validate data types and ranges
        if 'age' in user_data:
            try:
                age = float(user_data['age'])
                if age < 18 or age > 100:
                    errors.append("Age must be between 18 and 100")
            except (ValueError, TypeError):
                errors.append("Age must be a number")
        
        if 'income' in user_data:
            try:
                income = float(user_data['income'])
                if income < 0:
                    errors.append("Income must be non-negative")
            except (ValueError, TypeError):
                errors.append("Income must be a number")
        
        if 'debt_to_income_ratio' in user_data:
            try:
                ratio = float(user_data['debt_to_income_ratio'])
                if ratio < 0 or ratio > 2:
                    errors.append("Debt-to-income ratio must be between 0 and 2")
            except (ValueError, TypeError):
                errors.append("Debt-to-income ratio must be a number")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def _prepare_features(self, user_data: Dict[str, Any]) -> np.ndarray:
        """Prepare features for model prediction"""
        features = []
        
        for column in self.feature_columns:
            if column in user_data:
                features.append(float(user_data[column]))
            else:
                # Use default values for missing features
                default_values = {
                    'age': 35,
                    'income': 50000,
                    'credit_history_length': 5,
                    'debt_to_income_ratio': 0.3,
                    'employment_length': 3,
                    'number_of_accounts': 3,
                    'payment_history_score': 0.8,
                    'credit_utilization': 0.3,
                    'recent_inquiries': 1
                }
                features.append(default_values.get(column, 0))
        
        return np.array(features)
    
    def _get_score_range(self, score: float) -> str:
        """Get score range description"""
        if score < 580:
            return "Poor (300-579)"
        elif score < 670:
            return "Fair (580-669)"
        elif score < 740:
            return "Good (670-739)"
        elif score < 800:
            return "Very Good (740-799)"
        else:
            return "Excellent (800-850)"
    
    def _calculate_confidence(self, features: np.ndarray) -> float:
        """Calculate prediction confidence"""
        try:
            # Simple confidence based on feature completeness and model certainty
            # This is a placeholder - in practice, you'd use model-specific methods
            base_confidence = 0.8
            
            # Adjust based on feature completeness
            non_zero_features = np.count_nonzero(features)
            feature_completeness = non_zero_features / len(features)
            
            confidence = base_confidence * feature_completeness
            return min(1.0, max(0.1, confidence))
            
        except Exception:
            return 0.5  # Default confidence
    
    def _fallback_scoring(self, user_data: Dict[str, Any], start_time: float, 
                         error_msg: str = None) -> Dict[str, Any]:
        """Fallback scoring when main model fails"""
        logger.warning("Using fallback scoring method")
        
        try:
            # Simple rule-based scoring
            score = 500  # Base score
            
            # Age factor
            age = user_data.get('age', 35)
            if 25 <= age <= 65:
                score += 50
            
            # Income factor
            income = user_data.get('income', 50000)
            if income > 75000:
                score += 100
            elif income > 50000:
                score += 50
            elif income < 25000:
                score -= 50
            
            # Debt-to-income ratio
            debt_ratio = user_data.get('debt_to_income_ratio', 0.3)
            if debt_ratio < 0.2:
                score += 75
            elif debt_ratio < 0.4:
                score += 25
            elif debt_ratio > 0.6:
                score -= 75
            
            # Credit history length
            history_length = user_data.get('credit_history_length', 5)
            score += min(100, history_length * 10)
            
            # Payment history
            payment_score = user_data.get('payment_history_score', 0.8)
            score += (payment_score - 0.5) * 200
            
            # Credit utilization
            utilization = user_data.get('credit_utilization', 0.3)
            if utilization < 0.1:
                score += 50
            elif utilization < 0.3:
                score += 25
            elif utilization > 0.7:
                score -= 50
            
            # Ensure score is in valid range
            score = max(300, min(850, score))
            
            processing_time = time.time() - start_time
            
            return {
                'credit_score': float(score),
                'score_range': self._get_score_range(score),
                'explanation': {
                    'method': 'fallback_rules',
                    'primary_factors': ['Basic rule-based calculation'],
                    'recommendation': 'Score calculated using fallback method'
                },
                'model_version': 'fallback_v1',
                'model_type': 'rule_based',
                'confidence': 0.6,
                'processing_time': processing_time,
                'timestamp': time.time(),
                'fallback_used': True,
                'error': error_msg
            }
            
        except Exception as e:
            logger.error(f"Fallback scoring also failed: {e}")
            return {
                'error': 'Scoring system unavailable',
                'details': str(e),
                'processing_time': time.time() - start_time,
                'timestamp': time.time()
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        if self.current_metadata is None:
            return {'error': 'No model loaded'}
        
        return {
            'version': self.current_metadata.version,
            'model_type': self.current_metadata.model_type,
            'train_date': self.current_metadata.train_date,
            'accuracy': self.current_metadata.accuracy,
            'training_samples': self.current_metadata.training_samples,
            'feature_count': self.current_metadata.feature_count,
            'is_active': self.current_metadata.is_active,
            'is_production': self.current_metadata.is_production
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on the scoring system"""
        try:
            # Test with dummy data
            test_data = {
                'age': 30,
                'income': 60000,
                'credit_history_length': 5,
                'debt_to_income_ratio': 0.3,
                'employment_length': 3,
                'number_of_accounts': 3,
                'payment_history_score': 0.8,
                'credit_utilization': 0.3,
                'recent_inquiries': 1
            }
            
            start_time = time.time()
            result = self.score_user_profile(test_data)
            response_time = time.time() - start_time
            
            if 'error' in result:
                return {
                    'status': 'unhealthy',
                    'error': result['error'],
                    'response_time': response_time
                }
            
            return {
                'status': 'healthy',
                'model_loaded': self.current_model is not None,
                'model_version': self.current_metadata.version if self.current_metadata else None,
                'response_time': response_time,
                'test_score': result.get('credit_score')
            }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'model_loaded': False
            }

# Global scorer instance
_scorer_instance = None

def get_scorer() -> CreditScorer:
    """Get global scorer instance"""
    global _scorer_instance
    if _scorer_instance is None:
        _scorer_instance = CreditScorer()
    return _scorer_instance

def score_user_profile(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convenience function for scoring"""
    scorer = get_scorer()
    return scorer.score_user_profile(user_data)

