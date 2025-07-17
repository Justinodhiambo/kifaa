import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
import logging
import json

logger = logging.getLogger(__name__)

def explain_score(user_data: Dict[str, Any], score: float, model=None) -> Dict[str, Any]:
    """
    Provide explanation for credit score using improved SHAP or rule-based fallback
    
    Args:
        user_data: User profile data
        score: Calculated credit score
        model: Trained model (optional, for SHAP explanation)
    
    Returns:
        Dictionary containing score explanation
    """
    try:
        # Try improved SHAP explanation if model is available
        if model is not None:
            from shap_explainer import ShapExplainer
            explainer = ShapExplainer()
            return explainer.explain(user_data, score)
        else:
            return _rule_based_explanation(user_data, score)
    except Exception as e:
        logger.warning(f"SHAP explanation failed, falling back to rule-based: {str(e)}")
        return _rule_based_explanation(user_data, score)

def _rule_based_explanation(user_data: Dict[str, Any], score: float) -> Dict[str, Any]:
    """
    Generate rule-based explanation when SHAP is not available
    """
    factors = []
    
    # Income analysis
    income = user_data.get('income', 0)
    if income > 100000:
        factors.append({
            "factor": "High Income",
            "impact": "positive",
            "value": income,
            "description": f"Income of ${income:,.0f} is above average, indicating strong repayment capacity"
        })
    elif income < 30000:
        factors.append({
            "factor": "Low Income",
            "impact": "negative", 
            "value": income,
            "description": f"Income of ${income:,.0f} may limit repayment capacity"
        })
    else:
        factors.append({
            "factor": "Moderate Income",
            "impact": "neutral",
            "value": income,
            "description": f"Income of ${income:,.0f} is within average range"
        })
    
    # Credit history analysis
    credit_length = user_data.get('credit_history_length', 0)
    if credit_length > 10:
        factors.append({
            "factor": "Long Credit History",
            "impact": "positive",
            "value": credit_length,
            "description": f"{credit_length} years of credit history demonstrates experience with credit"
        })
    elif credit_length < 2:
        factors.append({
            "factor": "Limited Credit History",
            "impact": "negative",
            "value": credit_length,
            "description": f"Only {credit_length} years of credit history limits assessment"
        })
    
    # Debt-to-income ratio analysis
    debt_ratio = user_data.get('debt_to_income_ratio', 0)
    if debt_ratio > 0.4:
        factors.append({
            "factor": "High Debt-to-Income Ratio",
            "impact": "negative",
            "value": debt_ratio,
            "description": f"Debt-to-income ratio of {debt_ratio:.1%} indicates high existing debt burden"
        })
    elif debt_ratio < 0.2:
        factors.append({
            "factor": "Low Debt-to-Income Ratio", 
            "impact": "positive",
            "value": debt_ratio,
            "description": f"Debt-to-income ratio of {debt_ratio:.1%} indicates manageable debt levels"
        })
    
    # Age analysis
    age = user_data.get('age', 0)
    if age < 25:
        factors.append({
            "factor": "Young Age",
            "impact": "neutral",
            "value": age,
            "description": f"Age {age} indicates early career stage"
        })
    elif age > 65:
        factors.append({
            "factor": "Retirement Age",
            "impact": "caution",
            "value": age,
            "description": f"Age {age} may indicate retirement or reduced income"
        })
    
    return {
        "explanation_type": "rule_based",
        "score": score,
        "top_factors": factors,
        "score_category": _get_score_category(score),
        "summary": _generate_rule_based_summary(factors, score),
        "recommendations": _get_recommendations(score, factors)
    }

def _prepare_features_for_shap(user_data: Dict[str, Any]) -> pd.DataFrame:
    """Prepare user data as features for SHAP analysis"""
    features = {
        'age': user_data.get('age', 30),
        'income': user_data.get('income', 50000),
        'credit_history_length': user_data.get('credit_history_length', 5),
        'debt_to_income_ratio': user_data.get('debt_to_income_ratio', 0.3),
        'employment_length': user_data.get('employment_length', 2),
        'number_of_accounts': user_data.get('number_of_accounts', 3),
        'payment_history_score': user_data.get('payment_history_score', 0.8),
        'credit_utilization': user_data.get('credit_utilization', 0.3),
        'recent_inquiries': user_data.get('recent_inquiries', 1)
    }
    
    return pd.DataFrame([features])

def _format_shap_factors(sorted_features: List[tuple], user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Format SHAP feature importance as human-readable factors"""
    factors = []
    
    for feature_name, importance in sorted_features:
        impact = "positive" if importance > 0 else "negative"
        value = user_data.get(feature_name, "N/A")
        
        factors.append({
            "factor": _humanize_feature_name(feature_name),
            "impact": impact,
            "importance": float(importance),
            "value": value,
            "description": _get_feature_description(feature_name, value, importance)
        })
    
    return factors

def _humanize_feature_name(feature_name: str) -> str:
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
        'recent_inquiries': 'Recent Credit Inquiries'
    }
    return name_mapping.get(feature_name, feature_name.replace('_', ' ').title())

def _get_feature_description(feature_name: str, value: Any, importance: float) -> str:
    """Generate description for a feature's impact"""
    impact_direction = "positively" if importance > 0 else "negatively"
    
    descriptions = {
        'age': f"Age of {value} impacts score {impact_direction}",
        'income': f"Annual income of ${value:,.0f} impacts score {impact_direction}",
        'credit_history_length': f"Credit history of {value} years impacts score {impact_direction}",
        'debt_to_income_ratio': f"Debt-to-income ratio of {value:.1%} impacts score {impact_direction}",
        'employment_length': f"Employment length of {value} years impacts score {impact_direction}",
        'number_of_accounts': f"Having {value} credit accounts impacts score {impact_direction}",
        'payment_history_score': f"Payment history score of {value:.1%} impacts score {impact_direction}",
        'credit_utilization': f"Credit utilization of {value:.1%} impacts score {impact_direction}",
        'recent_inquiries': f"Having {value} recent inquiries impacts score {impact_direction}"
    }
    
    return descriptions.get(feature_name, f"{feature_name} impacts score {impact_direction}")

def _generate_shap_summary(top_factors: List[tuple], score: float) -> str:
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

def _generate_rule_based_summary(factors: List[Dict[str, Any]], score: float) -> str:
    """Generate summary based on rule-based analysis"""
    positive_count = len([f for f in factors if f['impact'] == 'positive'])
    negative_count = len([f for f in factors if f['impact'] == 'negative'])
    
    if score >= 700:
        return f"Strong credit profile with {positive_count} positive factors contributing to the high score"
    elif score >= 600:
        return f"Moderate credit profile with {positive_count} positive and {negative_count} negative factors"
    elif score >= 500:
        return f"Fair credit profile with {negative_count} areas for improvement identified"
    else:
        return f"Credit profile shows {negative_count} significant risk factors requiring attention"

def _get_score_category(score: float) -> Dict[str, Any]:
    """Get score category and range information"""
    if score >= 800:
        return {"category": "Excellent", "range": "800-1000", "description": "Exceptional credit profile"}
    elif score >= 700:
        return {"category": "Good", "range": "700-799", "description": "Strong credit profile"}
    elif score >= 600:
        return {"category": "Fair", "range": "600-699", "description": "Average credit profile"}
    elif score >= 500:
        return {"category": "Poor", "range": "500-599", "description": "Below average credit profile"}
    else:
        return {"category": "Very Poor", "range": "0-499", "description": "High risk credit profile"}

def _get_recommendations(score: float, factors: List[Dict[str, Any]]) -> List[str]:
    """Generate recommendations based on score and factors"""
    recommendations = []
    
    if score < 600:
        recommendations.append("Focus on improving payment history and reducing debt-to-income ratio")
        
    negative_factors = [f for f in factors if f['impact'] == 'negative']
    for factor in negative_factors:
        if 'debt' in factor['factor'].lower():
            recommendations.append("Consider debt consolidation or payment plan to reduce debt burden")
        elif 'income' in factor['factor'].lower():
            recommendations.append("Explore opportunities to increase income or demonstrate income stability")
        elif 'history' in factor['factor'].lower():
            recommendations.append("Build credit history through responsible use of credit products")
    
    if score >= 700:
        recommendations.append("Maintain current financial habits to preserve excellent credit standing")
    
    return recommendations[:3]  # Limit to top 3 recommendations

def validate_user_data(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and sanitize user input data
    
    Args:
        user_data: Raw user input data
        
    Returns:
        Validated and sanitized user data
        
    Raises:
        ValueError: If required fields are missing or invalid
    """
    required_fields = ['user_id', 'age', 'income']
    
    # Check required fields
    for field in required_fields:
        if field not in user_data:
            raise ValueError(f"Required field '{field}' is missing")
    
    # Validate and sanitize data
    validated_data = {}
    
    # User ID
    validated_data['user_id'] = str(user_data['user_id']).strip()
    if not validated_data['user_id']:
        raise ValueError("User ID cannot be empty")
    
    # Age validation
    try:
        age = float(user_data['age'])
        if not (18 <= age <= 100):
            raise ValueError("Age must be between 18 and 100")
        validated_data['age'] = age
    except (ValueError, TypeError):
        raise ValueError("Age must be a valid number")
    
    # Income validation
    try:
        income = float(user_data['income'])
        if income < 0:
            raise ValueError("Income cannot be negative")
        if income > 10000000:  # 10M cap for sanity
            raise ValueError("Income value seems unrealistic")
        validated_data['income'] = income
    except (ValueError, TypeError):
        raise ValueError("Income must be a valid number")
    
    # Optional fields with defaults and validation
    optional_fields = {
        'credit_history_length': (0, 50, 5),  # (min, max, default)
        'debt_to_income_ratio': (0, 1, 0.3),
        'employment_length': (0, 50, 2),
        'number_of_accounts': (0, 50, 3),
        'payment_history_score': (0, 1, 0.8),
        'credit_utilization': (0, 1, 0.3),
        'recent_inquiries': (0, 20, 1)
    }
    
    for field, (min_val, max_val, default) in optional_fields.items():
        if field in user_data:
            try:
                value = float(user_data[field])
                if not (min_val <= value <= max_val):
                    logger.warning(f"{field} value {value} out of range [{min_val}, {max_val}], using default")
                    value = default
                validated_data[field] = value
            except (ValueError, TypeError):
                logger.warning(f"Invalid {field} value, using default")
                validated_data[field] = default
        else:
            validated_data[field] = default
    
    # Region validation
    valid_regions = ['urban', 'rural', 'suburban']
    region = user_data.get('region', 'urban').lower()
    validated_data['region'] = region if region in valid_regions else 'urban'
    
    return validated_data

def format_api_response(score_result: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """
    Format the final API response
    
    Args:
        score_result: Result from credit scoring
        user_id: User identifier
        
    Returns:
        Formatted API response
    """
    return {
        "user_id": user_id,
        "timestamp": pd.Timestamp.now().isoformat(),
        "credit_score": score_result.get('score', 0),
        "score_category": _get_score_category(score_result.get('score', 0)),
        "explanation": score_result.get('explanation', {}),
        "model_version": score_result.get('model_used', 'unknown'),
        "api_version": "1.0"
    }


import json

def get_eligible_products(score, channel, rules_file='eligibility_rules.json'):
    with open(rules_file, 'r') as f:
        rules = json.load(f)
    eligible = []
    for rule in rules:
        if rule['min_score'] <= score <= rule['max_score'] and channel in rule['channel']:
            eligible.append(rule['product'])
    return eligible
