#!/usr/bin/env python3
"""
Model Manager for Kifaa Credit Scoring Platform

This module provides comprehensive model versioning, loading, and metadata management.
It ensures retrains save models with proper versioning and maintains model metadata.
"""

import os
import json
import pickle
import shutil
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path
import hashlib
import sqlite3
from dataclasses import dataclass, asdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModelMetadata:
    """Model metadata structure"""
    version: str
    train_date: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc_score: float
    training_samples: int
    feature_count: int
    model_type: str
    hyperparameters: Dict[str, Any]
    training_duration: float
    data_hash: str
    model_hash: str
    validation_score: float
    cross_validation_scores: List[float]
    feature_importance: Dict[str, float]
    created_by: str
    notes: str
    is_active: bool = False
    is_production: bool = False

class ModelManager:
    """Comprehensive model management system"""
    
    def __init__(self, models_dir: str = "models", metadata_db: str = "data/model_metadata.db"):
        """
        Initialize model manager
        
        Args:
            models_dir: Directory to store model files
            metadata_db: Path to SQLite database for metadata
        """
        self.models_dir = Path(models_dir)
        self.metadata_db = metadata_db
        
        # Create directories
        self.models_dir.mkdir(exist_ok=True)
        Path(metadata_db).parent.mkdir(exist_ok=True)
        
        # Initialize database
        self._init_metadata_db()
        
        # Current model cache
        self._current_model = None
        self._current_metadata = None
    
    def _init_metadata_db(self):
        """Initialize metadata database"""
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS model_metadata (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    version TEXT UNIQUE NOT NULL,
                    train_date TEXT NOT NULL,
                    accuracy REAL NOT NULL,
                    precision_score REAL NOT NULL,
                    recall_score REAL NOT NULL,
                    f1_score REAL NOT NULL,
                    auc_score REAL NOT NULL,
                    training_samples INTEGER NOT NULL,
                    feature_count INTEGER NOT NULL,
                    model_type TEXT NOT NULL,
                    hyperparameters TEXT NOT NULL,
                    training_duration REAL NOT NULL,
                    data_hash TEXT NOT NULL,
                    model_hash TEXT NOT NULL,
                    validation_score REAL NOT NULL,
                    cross_validation_scores TEXT NOT NULL,
                    feature_importance TEXT NOT NULL,
                    created_by TEXT NOT NULL,
                    notes TEXT,
                    is_active BOOLEAN DEFAULT FALSE,
                    is_production BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create performance tracking table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS model_performance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_version TEXT NOT NULL,
                    timestamp REAL NOT NULL,
                    metric_name TEXT NOT NULL,
                    metric_value REAL NOT NULL,
                    sample_size INTEGER,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (model_version) REFERENCES model_metadata (version)
                )
            """)
            
            # Create deployment history table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS deployment_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_version TEXT NOT NULL,
                    deployment_type TEXT NOT NULL,
                    environment TEXT NOT NULL,
                    deployed_at REAL NOT NULL,
                    deployed_by TEXT NOT NULL,
                    rollback_version TEXT,
                    status TEXT NOT NULL,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (model_version) REFERENCES model_metadata (version)
                )
            """)
            
            conn.commit()
    
    def generate_version(self) -> str:
        """Generate new model version"""
        # Get current date
        date_str = datetime.now().strftime("%Y%m%d")
        
        # Find existing versions for today
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT version FROM model_metadata 
                WHERE version LIKE ? 
                ORDER BY version DESC
            """, (f"v{date_str}%",))
            
            existing_versions = [row[0] for row in cursor.fetchall()]
        
        # Generate new version number
        if not existing_versions:
            return f"v{date_str}_001"
        else:
            # Extract the highest sequence number
            sequences = []
            for version in existing_versions:
                try:
                    seq = int(version.split('_')[-1])
                    sequences.append(seq)
                except (ValueError, IndexError):
                    continue
            
            next_seq = max(sequences) + 1 if sequences else 1
            return f"v{date_str}_{next_seq:03d}"
    
    def save_model(self, model: Any, metadata: ModelMetadata, 
                   training_data_hash: str = None) -> str:
        """
        Save model with versioning and metadata
        
        Args:
            model: Trained model object
            metadata: Model metadata
            training_data_hash: Hash of training data
            
        Returns:
            Model version string
        """
        # Generate version if not provided
        if not metadata.version:
            metadata.version = self.generate_version()
        
        # Calculate model hash
        model_hash = self._calculate_model_hash(model)
        metadata.model_hash = model_hash
        
        if training_data_hash:
            metadata.data_hash = training_data_hash
        
        # Save model file
        model_path = self.models_dir / f"model_{metadata.version}.pkl"
        
        try:
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
            
            logger.info(f"Model saved to {model_path}")
            
            # Save metadata to database
            self._save_metadata(metadata)
            
            # Update latest model symlink
            self._update_latest_model(metadata.version)
            
            # Log deployment
            self._log_deployment(metadata.version, "save", "development", 
                               metadata.created_by, "Model saved successfully")
            
            return metadata.version
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            # Clean up partial save
            if model_path.exists():
                model_path.unlink()
            raise
    
    def _calculate_model_hash(self, model: Any) -> str:
        """Calculate hash of model for integrity checking"""
        try:
            model_bytes = pickle.dumps(model)
            return hashlib.sha256(model_bytes).hexdigest()
        except Exception as e:
            logger.warning(f"Could not calculate model hash: {e}")
            return "unknown"
    
    def _save_metadata(self, metadata: ModelMetadata):
        """Save metadata to database"""
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO model_metadata (
                    version, train_date, accuracy, precision_score, recall_score,
                    f1_score, auc_score, training_samples, feature_count, model_type,
                    hyperparameters, training_duration, data_hash, model_hash,
                    validation_score, cross_validation_scores, feature_importance,
                    created_by, notes, is_active, is_production
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                metadata.version,
                metadata.train_date,
                metadata.accuracy,
                metadata.precision,
                metadata.recall,
                metadata.f1_score,
                metadata.auc_score,
                metadata.training_samples,
                metadata.feature_count,
                metadata.model_type,
                json.dumps(metadata.hyperparameters),
                metadata.training_duration,
                metadata.data_hash,
                metadata.model_hash,
                metadata.validation_score,
                json.dumps(metadata.cross_validation_scores),
                json.dumps(metadata.feature_importance),
                metadata.created_by,
                metadata.notes,
                metadata.is_active,
                metadata.is_production
            ))
            
            conn.commit()
    
    def _update_latest_model(self, version: str):
        """Update latest_model.pkl symlink"""
        latest_path = self.models_dir / "latest_model.pkl"
        model_path = self.models_dir / f"model_{version}.pkl"
        
        try:
            # Remove existing symlink
            if latest_path.exists() or latest_path.is_symlink():
                latest_path.unlink()
            
            # Create new symlink
            latest_path.symlink_to(model_path.name)
            logger.info(f"Updated latest_model.pkl to point to {version}")
            
        except Exception as e:
            logger.error(f"Error updating latest model symlink: {e}")
            # Fallback: copy file
            try:
                shutil.copy2(model_path, latest_path)
                logger.info(f"Copied {version} to latest_model.pkl as fallback")
            except Exception as e2:
                logger.error(f"Fallback copy also failed: {e2}")
    
    def load_latest_model(self) -> Tuple[Any, ModelMetadata]:
        """
        Load the latest active model
        
        Returns:
            Tuple of (model, metadata)
        """
        # Check cache first
        if self._current_model is not None and self._current_metadata is not None:
            return self._current_model, self._current_metadata
        
        # Get latest active model from database
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM model_metadata 
                WHERE is_active = TRUE 
                ORDER BY created_at DESC 
                LIMIT 1
            """)
            
            row = cursor.fetchone()
            
            if not row:
                # No active model, get the latest model
                cursor.execute("""
                    SELECT * FROM model_metadata 
                    ORDER BY created_at DESC 
                    LIMIT 1
                """)
                row = cursor.fetchone()
        
        if not row:
            raise FileNotFoundError("No models found in database")
        
        # Convert row to metadata
        columns = [description[0] for description in cursor.description]
        metadata_dict = dict(zip(columns, row))
        
        # Parse JSON fields
        metadata_dict['hyperparameters'] = json.loads(metadata_dict['hyperparameters'])
        metadata_dict['cross_validation_scores'] = json.loads(metadata_dict['cross_validation_scores'])
        metadata_dict['feature_importance'] = json.loads(metadata_dict['feature_importance'])
        
        # Map database fields to dataclass fields
        metadata_dict['precision'] = metadata_dict.pop('precision_score')
        metadata_dict['recall'] = metadata_dict.pop('recall_score')
        
        metadata = ModelMetadata(**{k: v for k, v in metadata_dict.items() 
                                  if k in ModelMetadata.__dataclass_fields__})
        
        # Load model file
        model_path = self.models_dir / f"model_{metadata.version}.pkl"
        
        if not model_path.exists():
            # Try latest_model.pkl as fallback
            latest_path = self.models_dir / "latest_model.pkl"
            if latest_path.exists():
                model_path = latest_path
            else:
                raise FileNotFoundError(f"Model file not found: {model_path}")
        
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            
            # Cache the loaded model
            self._current_model = model
            self._current_metadata = metadata
            
            logger.info(f"Loaded model {metadata.version} from {model_path}")
            return model, metadata
            
        except Exception as e:
            logger.error(f"Error loading model from {model_path}: {e}")
            raise
    
    def load_model_by_version(self, version: str) -> Tuple[Any, ModelMetadata]:
        """
        Load a specific model version
        
        Args:
            version: Model version to load
            
        Returns:
            Tuple of (model, metadata)
        """
        # Get metadata from database
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM model_metadata WHERE version = ?
            """, (version,))
            
            row = cursor.fetchone()
            
            if not row:
                raise ValueError(f"Model version {version} not found")
            
            # Convert to metadata object
            columns = [description[0] for description in cursor.description]
            metadata_dict = dict(zip(columns, row))
            
            # Parse JSON fields
            metadata_dict['hyperparameters'] = json.loads(metadata_dict['hyperparameters'])
            metadata_dict['cross_validation_scores'] = json.loads(metadata_dict['cross_validation_scores'])
            metadata_dict['feature_importance'] = json.loads(metadata_dict['feature_importance'])
            
            # Map database fields
            metadata_dict['precision'] = metadata_dict.pop('precision_score')
            metadata_dict['recall'] = metadata_dict.pop('recall_score')
            
            metadata = ModelMetadata(**{k: v for k, v in metadata_dict.items() 
                                      if k in ModelMetadata.__dataclass_fields__})
        
        # Load model file
        model_path = self.models_dir / f"model_{version}.pkl"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        logger.info(f"Loaded model {version}")
        return model, metadata
    
    def set_active_model(self, version: str, deployed_by: str = "system"):
        """
        Set a model version as active
        
        Args:
            version: Model version to activate
            deployed_by: Who is deploying this model
        """
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            
            # Deactivate all models
            cursor.execute("UPDATE model_metadata SET is_active = FALSE")
            
            # Activate specified model
            cursor.execute("""
                UPDATE model_metadata 
                SET is_active = TRUE 
                WHERE version = ?
            """, (version,))
            
            if cursor.rowcount == 0:
                raise ValueError(f"Model version {version} not found")
            
            conn.commit()
        
        # Update latest model symlink
        self._update_latest_model(version)
        
        # Clear cache to force reload
        self._current_model = None
        self._current_metadata = None
        
        # Log deployment
        self._log_deployment(version, "activate", "production", 
                           deployed_by, f"Model {version} set as active")
        
        logger.info(f"Model {version} set as active")
    
    def set_production_model(self, version: str, deployed_by: str = "system"):
        """
        Set a model version as production model
        
        Args:
            version: Model version to set as production
            deployed_by: Who is deploying this model
        """
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            
            # Get current production model for rollback reference
            cursor.execute("""
                SELECT version FROM model_metadata 
                WHERE is_production = TRUE
            """)
            current_prod = cursor.fetchone()
            rollback_version = current_prod[0] if current_prod else None
            
            # Deactivate all production models
            cursor.execute("UPDATE model_metadata SET is_production = FALSE")
            
            # Set new production model
            cursor.execute("""
                UPDATE model_metadata 
                SET is_production = TRUE, is_active = TRUE 
                WHERE version = ?
            """, (version,))
            
            if cursor.rowcount == 0:
                raise ValueError(f"Model version {version} not found")
            
            conn.commit()
        
        # Update latest model symlink
        self._update_latest_model(version)
        
        # Clear cache
        self._current_model = None
        self._current_metadata = None
        
        # Log deployment
        self._log_deployment(version, "production_deploy", "production", 
                           deployed_by, f"Model {version} deployed to production",
                           rollback_version)
        
        logger.info(f"Model {version} deployed to production")
    
    def _log_deployment(self, version: str, deployment_type: str, environment: str,
                       deployed_by: str, notes: str, rollback_version: str = None):
        """Log deployment to history"""
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO deployment_history 
                (model_version, deployment_type, environment, deployed_at, 
                 deployed_by, rollback_version, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                version, deployment_type, environment, 
                datetime.now().timestamp(), deployed_by, 
                rollback_version, "success", notes
            ))
            conn.commit()
    
    def get_model_list(self) -> List[Dict[str, Any]]:
        """Get list of all models with metadata"""
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT version, train_date, accuracy, model_type, 
                       is_active, is_production, created_at
                FROM model_metadata 
                ORDER BY created_at DESC
            """)
            
            models = []
            for row in cursor.fetchall():
                models.append({
                    "version": row[0],
                    "train_date": row[1],
                    "accuracy": row[2],
                    "model_type": row[3],
                    "is_active": bool(row[4]),
                    "is_production": bool(row[5]),
                    "created_at": row[6]
                })
            
            return models
    
    def get_model_metadata(self, version: str) -> ModelMetadata:
        """Get metadata for a specific model version"""
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM model_metadata WHERE version = ?
            """, (version,))
            
            row = cursor.fetchone()
            
            if not row:
                raise ValueError(f"Model version {version} not found")
            
            columns = [description[0] for description in cursor.description]
            metadata_dict = dict(zip(columns, row))
            
            # Parse JSON fields
            metadata_dict['hyperparameters'] = json.loads(metadata_dict['hyperparameters'])
            metadata_dict['cross_validation_scores'] = json.loads(metadata_dict['cross_validation_scores'])
            metadata_dict['feature_importance'] = json.loads(metadata_dict['feature_importance'])
            
            # Map database fields
            metadata_dict['precision'] = metadata_dict.pop('precision_score')
            metadata_dict['recall'] = metadata_dict.pop('recall_score')
            
            return ModelMetadata(**{k: v for k, v in metadata_dict.items() 
                                  if k in ModelMetadata.__dataclass_fields__})
    
    def record_performance_metric(self, version: str, metric_name: str, 
                                metric_value: float, sample_size: int = None,
                                notes: str = None):
        """Record a performance metric for a model"""
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO model_performance 
                (model_version, timestamp, metric_name, metric_value, sample_size, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                version, datetime.now().timestamp(), 
                metric_name, metric_value, sample_size, notes
            ))
            conn.commit()
    
    def get_performance_history(self, version: str) -> List[Dict[str, Any]]:
        """Get performance history for a model"""
        with sqlite3.connect(self.metadata_db) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT timestamp, metric_name, metric_value, sample_size, notes
                FROM model_performance 
                WHERE model_version = ?
                ORDER BY timestamp DESC
            """, (version,))
            
            history = []
            for row in cursor.fetchall():
                history.append({
                    "timestamp": row[0],
                    "metric_name": row[1],
                    "metric_value": row[2],
                    "sample_size": row[3],
                    "notes": row[4],
                    "date": datetime.fromtimestamp(row[0]).isoformat()
                })
            
            return history
    
    def rollback_to_version(self, version: str, deployed_by: str = "system"):
        """Rollback to a previous model version"""
        # Verify the version exists
        try:
            self.get_model_metadata(version)
        except ValueError:
            raise ValueError(f"Cannot rollback to {version}: version not found")
        
        # Get current production model for logging
        current_metadata = None
        try:
            _, current_metadata = self.load_latest_model()
        except:
            pass
        
        # Set as active and production
        self.set_production_model(version, deployed_by)
        
        # Log rollback
        rollback_notes = f"Rolled back to {version}"
        if current_metadata:
            rollback_notes += f" from {current_metadata.version}"
        
        self._log_deployment(version, "rollback", "production", 
                           deployed_by, rollback_notes)
        
        logger.info(f"Rolled back to model {version}")
    
    def cleanup_old_models(self, keep_count: int = 10):
        """Clean up old model files, keeping the most recent ones"""
        models = self.get_model_list()
        
        if len(models) <= keep_count:
            logger.info(f"Only {len(models)} models found, no cleanup needed")
            return
        
        # Keep active, production, and most recent models
        models_to_keep = set()
        
        # Always keep active and production models
        for model in models:
            if model['is_active'] or model['is_production']:
                models_to_keep.add(model['version'])
        
        # Keep most recent models
        recent_models = sorted(models, key=lambda x: x['created_at'], reverse=True)
        for model in recent_models[:keep_count]:
            models_to_keep.add(model['version'])
        
        # Delete old model files
        deleted_count = 0
        for model in models:
            if model['version'] not in models_to_keep:
                model_path = self.models_dir / f"model_{model['version']}.pkl"
                if model_path.exists():
                    try:
                        model_path.unlink()
                        deleted_count += 1
                        logger.info(f"Deleted old model file: {model_path}")
                    except Exception as e:
                        logger.error(f"Error deleting {model_path}: {e}")
        
        logger.info(f"Cleanup completed: {deleted_count} old model files deleted")

# Global model manager instance
_model_manager = None

def get_model_manager() -> ModelManager:
    """Get global model manager instance"""
    global _model_manager
    if _model_manager is None:
        _model_manager = ModelManager()
    return _model_manager

