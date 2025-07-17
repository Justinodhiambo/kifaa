#!/usr/bin/env python3
"""
Enhanced Model Training Script for Kifaa Credit Scoring Platform

This script trains machine learning models with comprehensive versioning,
metadata tracking, and performance evaluation.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.preprocessing import StandardScaler
import pickle
import json
import time
import hashlib
import argparse
import logging
from datetime import datetime
from pathlib import Path

from model_manager import get_model_manager, ModelMetadata

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def calculate_data_hash(data: pd.DataFrame) -> str:
    """Calculate hash of training data for tracking"""
    data_string = data.to_string()
    return hashlib.sha256(data_string.encode()).hexdigest()

def generate_synthetic_data(n_samples: int = 10000) -> pd.DataFrame:
    """Generate synthetic credit scoring data for training"""
    np.random.seed(42)
    
    data = {
        'age': np.random.randint(18, 80, n_samples),
        'income': np.random.lognormal(10, 1, n_samples),
        'credit_history_length': np.random.exponential(5, n_samples),
        'debt_to_income_ratio': np.random.beta(2, 5, n_samples),
        'employment_length': np.random.exponential(3, n_samples),
        'number_of_accounts': np.random.poisson(3, n_samples),
        'payment_history_score': np.random.beta(8, 2, n_samples),
        'credit_utilization': np.random.beta(2, 3, n_samples),
        'recent_inquiries': np.random.poisson(1, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Generate target variable (credit score) based on features
    score = (
        df['income'] / 1000 * 0.3 +
        df['payment_history_score'] * 200 +
        (1 - df['debt_to_income_ratio']) * 150 +
        df['credit_history_length'] * 10 +
        df['employment_length'] * 5 +
        (1 - df['credit_utilization']) * 100 +
        np.random.normal(0, 50, n_samples)  # Add noise
    )
    
    # Normalize to 300-850 range
    score = np.clip(score, 300, 850)
    df['credit_score'] = score
    
    return df

def prepare_features(df: pd.DataFrame) -> tuple:
    """Prepare features and target for training"""
    feature_columns = [
        'age', 'income', 'credit_history_length', 'debt_to_income_ratio',
        'employment_length', 'number_of_accounts', 'payment_history_score',
        'credit_utilization', 'recent_inquiries'
    ]
    
    X = df[feature_columns]
    y = df['credit_score']
    
    return X, y, feature_columns

def train_model(data_path: str = None, model_type: str = "random_forest", 
               test_size: float = 0.2, created_by: str = "system",
               notes: str = "") -> str:
    """
    Train a credit scoring model with full versioning and metadata
    
    Args:
        data_path: Path to training data CSV file
        model_type: Type of model to train
        test_size: Fraction of data to use for testing
        created_by: Who is training this model
        notes: Additional notes about this training run
        
    Returns:
        Model version string
    """
    start_time = time.time()
    
    # Load or generate data
    if data_path and Path(data_path).exists():
        logger.info(f"Loading training data from {data_path}")
        df = pd.read_csv(data_path)
    else:
        logger.info("Generating synthetic training data")
        df = generate_synthetic_data()
        
        # Save synthetic data for reproducibility
        data_dir = Path("data")
        data_dir.mkdir(exist_ok=True)
        synthetic_path = data_dir / f"synthetic_training_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        df.to_csv(synthetic_path, index=False)
        logger.info(f"Saved synthetic data to {synthetic_path}")
    
    # Calculate data hash
    data_hash = calculate_data_hash(df)
    
    # Prepare features
    X, y, feature_columns = prepare_features(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model based on type
    if model_type == "random_forest":
        hyperparameters = {
            'n_estimators': 100,
            'max_depth': 10,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': 42
        }
        model = RandomForestClassifier(**hyperparameters)
    else:
        raise ValueError(f"Unsupported model type: {model_type}")
    
    # Train the model
    logger.info(f"Training {model_type} model...")
    model.fit(X_train_scaled, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1] if hasattr(model, 'predict_proba') else y_pred
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    
    # For regression-like scoring, we'll convert to classification for some metrics
    y_test_class = (y_test > 650).astype(int)  # Good credit threshold
    y_pred_class = (y_pred > 650).astype(int)
    
    precision = precision_score(y_test_class, y_pred_class, average='weighted')
    recall = recall_score(y_test_class, y_pred_class, average='weighted')
    f1 = f1_score(y_test_class, y_pred_class, average='weighted')
    
    try:
        auc = roc_auc_score(y_test_class, y_pred_proba)
    except:
        auc = 0.5  # Default if AUC can't be calculated
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
    
    # Feature importance
    if hasattr(model, 'feature_importances_'):
        feature_importance = dict(zip(feature_columns, model.feature_importances_.tolist()))
    else:
        feature_importance = {}
    
    # Calculate training duration
    training_duration = time.time() - start_time
    
    # Create metadata
    metadata = ModelMetadata(
        version="",  # Will be generated by model manager
        train_date=datetime.now().isoformat(),
        accuracy=float(accuracy),
        precision=float(precision),
        recall=float(recall),
        f1_score=float(f1),
        auc_score=float(auc),
        training_samples=len(X_train),
        feature_count=len(feature_columns),
        model_type=model_type,
        hyperparameters=hyperparameters,
        training_duration=training_duration,
        data_hash=data_hash,
        model_hash="",  # Will be calculated by model manager
        validation_score=float(np.mean(cv_scores)),
        cross_validation_scores=cv_scores.tolist(),
        feature_importance=feature_importance,
        created_by=created_by,
        notes=notes,
        is_active=False,
        is_production=False
    )
    
    # Save model using model manager
    model_manager = get_model_manager()
    
    # Create a pipeline with scaler and model
    from sklearn.pipeline import Pipeline
    pipeline = Pipeline([
        ('scaler', scaler),
        ('model', model)
    ])
    
    version = model_manager.save_model(pipeline, metadata, data_hash)
    
    # Log training results
    logger.info(f"Model training completed!")
    logger.info(f"Version: {version}")
    logger.info(f"Accuracy: {accuracy:.4f}")
    logger.info(f"Precision: {precision:.4f}")
    logger.info(f"Recall: {recall:.4f}")
    logger.info(f"F1 Score: {f1:.4f}")
    logger.info(f"AUC Score: {auc:.4f}")
    logger.info(f"CV Score: {np.mean(cv_scores):.4f} (+/- {np.std(cv_scores) * 2:.4f})")
    logger.info(f"Training Duration: {training_duration:.2f} seconds")
    
    return version

def retrain_from_log(log_path: str = "data/retrain_log.csv", 
                    created_by: str = "automated_retrain") -> str:
    """
    Retrain model using data from retrain log
    
    Args:
        log_path: Path to retrain log CSV file
        created_by: Who is triggering this retrain
        
    Returns:
        New model version
    """
    if not Path(log_path).exists():
        logger.warning(f"Retrain log not found at {log_path}, using synthetic data")
        return train_model(created_by=created_by, 
                         notes="Automated retrain with synthetic data")
    
    logger.info(f"Retraining model using data from {log_path}")
    
    # Load retrain data
    retrain_data = pd.read_csv(log_path)
    
    # Combine with existing training data if available
    existing_data_path = "data/training_data.csv"
    if Path(existing_data_path).exists():
        existing_data = pd.read_csv(existing_data_path)
        combined_data = pd.concat([existing_data, retrain_data], ignore_index=True)
    else:
        combined_data = retrain_data
    
    # Save combined data
    combined_path = f"data/combined_training_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    combined_data.to_csv(combined_path, index=False)
    
    # Train new model
    notes = f"Automated retrain using {len(retrain_data)} new samples from {log_path}"
    return train_model(data_path=combined_path, created_by=created_by, notes=notes)

def main():
    """Main training function"""
    parser = argparse.ArgumentParser(description='Train Kifaa Credit Scoring Model')
    parser.add_argument('--data-path', type=str, help='Path to training data CSV')
    parser.add_argument('--model-type', type=str, default='random_forest',
                       choices=['random_forest'], help='Type of model to train')
    parser.add_argument('--test-size', type=float, default=0.2,
                       help='Fraction of data for testing')
    parser.add_argument('--created-by', type=str, default='manual_training',
                       help='Who is training this model')
    parser.add_argument('--notes', type=str, default='',
                       help='Additional notes about this training run')
    parser.add_argument('--retrain-from-log', type=str,
                       help='Path to retrain log for automated retraining')
    parser.add_argument('--set-active', action='store_true',
                       help='Set the trained model as active')
    parser.add_argument('--set-production', action='store_true',
                       help='Set the trained model as production')
    
    args = parser.parse_args()
    
    try:
        if args.retrain_from_log:
            version = retrain_from_log(args.retrain_from_log, args.created_by)
        else:
            version = train_model(
                data_path=args.data_path,
                model_type=args.model_type,
                test_size=args.test_size,
                created_by=args.created_by,
                notes=args.notes
            )
        
        # Set model status if requested
        model_manager = get_model_manager()
        
        if args.set_active:
            model_manager.set_active_model(version, args.created_by)
            logger.info(f"Model {version} set as active")
        
        if args.set_production:
            model_manager.set_production_model(version, args.created_by)
            logger.info(f"Model {version} deployed to production")
        
        logger.info(f"Training completed successfully. Model version: {version}")
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise

if __name__ == "__main__":
    main()

