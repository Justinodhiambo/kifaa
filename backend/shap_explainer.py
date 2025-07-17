import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
import logging
import pickle
import os

logger = logging.getLogger(__name__)

class ShapExplainer:
    """Enhanced SHAP explainer with fallback mechanisms"""
    
    def __init__(self, model_path: str = "models/model_v1.pkl"):
        self.model_path = model_path
        self.model = None
        self.explainer = None
        self.feature_names = None
        self.shap_available = self._check_shap_availability()
        
        if self.shap_available:
            self._load_model_and_explainer()
    
    def _check_shap_availability(self) -> bool:
        """Check if SHAP library is available"""
        try:
            import shap
            return True
        except ImportError:
            logger.warning("SHAP library not available. Using rule-based explanations.")
            return False
    
    def _load_model_and_explainer(self):
        """Load model and create SHAP explainer"""
        try:
            if not os.path.exists(self.model_path):
                logger.warning(f"Model file not found: {self.model_path}")
                return
            
            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data.get('model')
            self.feature_names = model_data.get('feature_columns', [])
            
            if self.model is None:
                logger.warning("No model found in model file")
                return
            
            # Create SHAP explainer with error handling
            self._create_explainer()
            
        except Exception as e:
            logger.error(f"Failed to load model for SHAP: {str(e)}")
            self.model = None
            self.explainer = None
    
    def _create_explainer(self):
        """Create SHAP explainer with fallback options"""
        try:
            import shap
            
            # Try different explainer types based on model type
            model_type = type(self.model).__name__
            
            if hasattr(self.model, 'predict_proba'):
                # For classifiers, try TreeExplainer first (fastest for tree models)
                if 'Forest' in model_type or 'Tree' in model_type or 'XGB' in model_type:
                    try:
                        self.explainer = shap.TreeExplainer(self.model)
                        logger.info("Created TreeExplainer for SHAP")
                        return
                    except Exception as e:
                        logger.warning(f"TreeExplainer failed: {e}, trying Explainer")
                
                # Fallback to general Explainer
                try:
                    self.explainer = shap.Explainer(self.model)
                    logger.info("Created general Explainer for SHAP")
                    return
                except Exception as e:
                    logger.warning(f"General Explainer failed: {e}, trying KernelExplainer")
                
                # Last resort: KernelExplainer (slower but works with any model)
                try:
                    # Create background dataset for KernelExplainer
                    background_data = self._create_background_data()
                    self.explainer = shap.KernelExplainer(self.model.predict_proba, background_data)
                    logger.info("Created KernelExplainer for SHAP")
                    return
                except Exception as e:
                    logger.error(f"KernelExplainer failed: {e}")
            
            else:
                # For regressors
                try:
                    self.explainer = shap.Explainer(self.model)
                    logger.info("Created Explainer for regression model")
                    return
                except Exception as e:
                    logger.warning(f"Regression Explainer failed: {e}")
            
            # If all explainers fail
            logger.error("All SHAP explainer types failed")
            self.explainer = None
            
        except Exception as e:
            logger.error(f"Failed to create SHAP explainer: {str(e)}")
            self.explainer = None
    
    def _create_background_data(self, n_samples: int = 100) -> np.ndarray:
        """Create background data for KernelExplainer"""
        try:
            # Generate representative background data
            if len(self.feature_names) == 0:
                return np.zeros((n_samples, 6))  # Default feature count
            
            # Create synthetic background data based on typical ranges
            background = []
            for _ in range(n_samples):
                sample = {
                    'age': np.random.normal(35, 12),
                    'income': np.random.lognormal(10.5, 0.8),
                    'credit_history_length': np.random.exponential(5),
                    'debt_to_income_ratio': np.random.beta(2, 5),
                    'employment_length': np.random.exponential(3),
                    'number_of_accounts': np.random.poisson(5),
                    'payment_history_score': np.random.normal(0.8, 0.2),
                    'credit_utilization': np.random.beta(2, 8),
                    'recent_inquiries': np.random.poisson(2)
                }
                
                # Convert to feature vector
                feature_vector = [sample.get(name, 0) for name in self.feature_names]
                background.append(feature_vector)
            
            return np.array(background)
            
        except Exception as e:
            logger.error(f"Failed to create background data: {str(e)}")
            # Return simple default background
            return np.zeros((n_samples, len(self.feature_names) or 6))
    
    def explain(self, user_data: Dict[str, Any], score: float) -> Dict[str, Any]:
        """Generate SHAP explanation with comprehensive fallback"""
        if not self.shap_available or self.explainer is None:
            return self._rule_based_explanation(user_data, score)
        
        try:
            # Prepare features
            features_df = self._prepare_features(user_data)
            
            # Get SHAP values with timeout protection
            shap_values = self._get_shap_values_safe(features_df)
            
            if shap_values is None:
                return self._rule_based_explanation(user_data, score)
            
            # Process SHAP values
            return self._process_shap_values(shap_values, features_df, user_data, score)
            
        except Exception as e:
            logger.warning(f"SHAP explanation failed: {str(e)}, using rule-based fallback")
            return self._rule_based_explanation(user_data, score)
    
    def _get_shap_values_safe(self, features_df: pd.DataFrame, timeout: int = 30) -> Optional[Any]:
        """Get SHAP values with timeout protection"""
        try:
            import signal
            import shap
            
            def timeout_handler(signum, frame):
                raise TimeoutError("SHAP computation timed out")
            
            # Set timeout
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(timeout)
            
            try:
                # Compute SHAP values
                shap_values = self.explainer(features_df)
                signal.alarm(0)  # Cancel timeout
                return shap_values
                
            except TimeoutError:
                logger.warning(f"SHAP computation timed out after {timeout} seconds")
                return None
            finally:
                signal.alarm(0)  # Ensure timeout is cancelled
                
        except Exception as e:
            logger.error(f"SHAP computation failed: {str(e)}")
            return None
    
    def _prepare_features(self, user_data: Dict[str, Any]) -> pd.DataFrame:
        """Prepare features for SHAP analysis"""
        if self.feature_names:
            # Use model's feature names
            features = {}
            for name in self.feature_names:
                if name.startswith('region_'):
                    # Handle one-hot encoded region features
                    region = user_data.get('region', 'urban')
                    features[name] = 1 if name == f'region_{region}' else 0
                else:
                    features[name] = user_data.get(name, 0)
        else:
            # Use default features
            features = {
                'age': user_data.get('age', 30),
                'income': user_data.get('income', 50000),
                'credit_history_length': user_data.get('credit_history_length', 5),
                'debt_to_income_ratio': user_data.get('debt_to_income_ratio', 0.3),
                'employment_length': user_data.get('employment_length', 2),
                'number_of_accounts': user_data.get('number_of_accounts', 3)
            }
        
        return pd.DataFrame([features])
    
    def _process_shap_values(self, shap_values, features_df: pd.DataFrame, 
                           user_data: Dict[str, Any], score: float) -> Dict[str, Any]:
        """Process SHAP values into explanation"""
        try:
            # Extract feature importance
            if hasattr(shap_values, 'values'):
                values = shap_values.values[0]  # First (and only) sample
            else:
                values = shap_values[0]
            
            feature_importance = {}
            for i, feature_name in enumerate(features_df.columns):
                if i < len(values):
                    feature_importance[feature_name] = float(values[i])
            
            # Sort by absolute importance
            sorted_features = sorted(
                feature_importance.items(), 
                key=lambda x: abs(x[1]), 
                reverse=True
            )
            
            # Format top factors
            top_factors = self._format_shap_factors(sorted_features[:5], user_data)
            
            # Generate summary
            summary = self._generate_shap_summary(sorted_features[:3], score)
            
            return {
                "explanation_type": "shap",
                "score": score,
                "top_factors": top_factors,
                "feature_importance": feature_importance,
                "summary": summary,
                "shap_base_value": getattr(shap_values, 'base_values', [0])[0] if hasattr(shap_values, 'base_values') else 0
            }
            
        except Exception as e:
            logger.error(f"Failed to process SHAP values: {str(e)}")
            return self._rule_based_explanation(user_data, score)
    
    def _format_shap_factors(self, sorted_features: List[Tuple[str, float]], 
                           user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Format SHAP feature importance as human-readable factors"""
        factors = []
        
        for feature_name, importance in sorted_features:
            impact = "positive" if importance > 0 else "negative"
            value = user_data.get(feature_name.replace('region_', ''), "N/A")
            
            # Handle one-hot encoded features
            if feature_name.startswith('region_'):
                if importance != 0:  # Only show active region
                    region_name = feature_name.replace('region_', '')
                    value = region_name
                    feature_name = 'region'
                else:
                    continue  # Skip inactive region features
            
            factors.append({
                "factor": self._humanize_feature_name(feature_name),
                "impact": impact,
                "importance": float(importance),
                "value": value,
                "description": self._get_feature_description(feature_name, value, importance)
            })
        
        return factors
    
    def _humanize_feature_name(self, feature_name: str) -> str:
        """Convert feature names to human-readable format"""
        name_mapping = {
            'age': 'Age',
            'income': 'Annual Income',
            'credit_history_length': 'Credit History Length',
            'debt_to_income_ratio': 'Debt-to-Income Ratio',
            'employment_length': 'Employment Length',
            'number_of_accounts': 'Number of Credit Accounts',
            'payment_history_score': 'Payment History',
            'credit_utilization': 'Credit Utilization',
            'recent_inquiries': 'Recent Credit Inquiries',
            'region': 'Geographic Region'
        }
        return name_mapping.get(feature_name, feature_name.replace('_', ' ').title())
    
    def _get_feature_description(self, feature_name: str, value: Any, importance: float) -> str:
        """Generate description for a feature's impact"""
        impact_direction = "positively" if importance > 0 else "negatively"
        
        descriptions = {
            'age': f"Age of {value} impacts score {impact_direction}",
            'income': f"Annual income of ${value:,.0f} impacts score {impact_direction}" if isinstance(value, (int, float)) else f"Income level impacts score {impact_direction}",
            'credit_history_length': f"Credit history of {value} years impacts score {impact_direction}",
            'debt_to_income_ratio': f"Debt-to-income ratio of {value:.1%} impacts score {impact_direction}" if isinstance(value, (int, float)) else f"Debt ratio impacts score {impact_direction}",
            'employment_length': f"Employment length of {value} years impacts score {impact_direction}",
            'number_of_accounts': f"Having {value} credit accounts impacts score {impact_direction}",
            'payment_history_score': f"Payment history score of {value:.1%} impacts score {impact_direction}" if isinstance(value, (int, float)) else f"Payment history impacts score {impact_direction}",
            'credit_utilization': f"Credit utilization of {value:.1%} impacts score {impact_direction}" if isinstance(value, (int, float)) else f"Credit utilization impacts score {impact_direction}",
            'recent_inquiries': f"Having {value} recent inquiries impacts score {impact_direction}",
            'region': f"Being in {value} region impacts score {impact_direction}"
        }
        
        return descriptions.get(feature_name, f"{feature_name} impacts score {impact_direction}")
    
    def _generate_shap_summary(self, top_factors: List[Tuple[str, float]], score: float) -> str:
        """Generate summary based on SHAP analysis"""
        positive_factors = [f for f, imp in top_factors if imp > 0]
        negative_factors = [f for f, imp in top_factors if imp < 0]
        
        summary = f"Credit score of {score:.0f} is primarily influenced by "
        
        if positive_factors and negative_factors:
            summary += f"positive factors ({', '.join(positive_factors[:2])}) and negative factors ({', '.join(negative_factors[:2])})"
        elif positive_factors:
            summary += f"positive factors including {', '.join(positive_factors[:3])}"
        elif negative_factors:
            summary += f"negative factors including {', '.join(negative_factors[:3])}"
        else:
            summary += "balanced factors across the profile"
        
        return summary
    
    def _rule_based_explanation(self, user_data: Dict[str, Any], score: float) -> Dict[str, Any]:
        """Fallback rule-based explanation when SHAP fails"""
        from utils import _rule_based_explanation
        return _rule_based_explanation(user_data, score)
    
    def get_feature_importance_plot_data(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get data for creating feature importance plots"""
        if not self.shap_available or self.explainer is None:
            return None
        
        try:
            features_df = self._prepare_features(user_data)
            shap_values = self._get_shap_values_safe(features_df)
            
            if shap_values is None:
                return None
            
            # Extract values for plotting
            if hasattr(shap_values, 'values'):
                values = shap_values.values[0]
            else:
                values = shap_values[0]
            
            return {
                'feature_names': list(features_df.columns),
                'shap_values': values.tolist(),
                'feature_values': features_df.iloc[0].tolist(),
                'base_value': getattr(shap_values, 'base_values', [0])[0] if hasattr(shap_values, 'base_values') else 0
            }
            
        except Exception as e:
            logger.error(f"Failed to get plot data: {str(e)}")
            return None

