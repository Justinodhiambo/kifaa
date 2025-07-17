#!/usr/bin/env python3
"""
Weekly model retraining scheduler for Kifaa credit scoring platform.

This script can be run as a cron job or as a standalone service.
It handles automatic model retraining on a weekly schedule.
"""

import os
import sys
import time
import logging
import schedule
from datetime import datetime, timedelta
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from train_model import ModelTrainer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/retrain_scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RetrainScheduler:
    """Handles scheduled model retraining"""
    
    def __init__(self, data_dir: str = "data", model_dir: str = "models"):
        self.data_dir = data_dir
        self.model_dir = model_dir
        self.trainer = ModelTrainer(data_path=f"{data_dir}/retrain_log.csv", model_dir=model_dir)
        self.last_retrain_file = f"{data_dir}/last_retrain.txt"
        
        # Ensure directories exist
        os.makedirs(data_dir, exist_ok=True)
        os.makedirs(model_dir, exist_ok=True)
        os.makedirs("logs", exist_ok=True)
    
    def should_retrain(self) -> bool:
        """Check if model should be retrained based on schedule and data availability"""
        try:
            # Check if enough time has passed since last retrain
            if os.path.exists(self.last_retrain_file):
                with open(self.last_retrain_file, 'r') as f:
                    last_retrain_str = f.read().strip()
                    last_retrain = datetime.fromisoformat(last_retrain_str)
                    
                    # Check if a week has passed
                    if datetime.now() - last_retrain < timedelta(days=7):
                        logger.info(f"Last retrain was {last_retrain}, skipping (less than 7 days)")
                        return False
            
            # Check if new training data is available
            retrain_data_path = f"{self.data_dir}/retrain_log.csv"
            if not os.path.exists(retrain_data_path):
                logger.info("No retrain data available, generating dummy data")
                return True
            
            # Check data freshness
            data_modified = datetime.fromtimestamp(os.path.getmtime(retrain_data_path))
            if datetime.now() - data_modified > timedelta(days=1):
                logger.info("Training data is fresh, proceeding with retrain")
                return True
            
            logger.info("No new data for retraining")
            return False
            
        except Exception as e:
            logger.error(f"Error checking retrain conditions: {str(e)}")
            return False
    
    def perform_retrain(self) -> bool:
        """Perform model retraining"""
        try:
            logger.info("Starting scheduled model retraining...")
            
            # Backup current model
            self._backup_current_model()
            
            # Train new model
            results = self.trainer.train_model(retrain=True)
            
            # Validate new model
            if self._validate_new_model(results):
                # Update last retrain timestamp
                with open(self.last_retrain_file, 'w') as f:
                    f.write(datetime.now().isoformat())
                
                logger.info(f"Model retraining completed successfully: {results}")
                
                # Send notification (if configured)
                self._send_notification("success", results)
                
                return True
            else:
                logger.error("New model validation failed, keeping old model")
                self._restore_backup_model()
                return False
                
        except Exception as e:
            logger.error(f"Model retraining failed: {str(e)}")
            self._restore_backup_model()
            self._send_notification("failure", {"error": str(e)})
            return False
    
    def _backup_current_model(self):
        """Backup current model before retraining"""
        try:
            current_model = f"{self.model_dir}/model_v1.pkl"
            if os.path.exists(current_model):
                backup_name = f"{self.model_dir}/model_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
                os.rename(current_model, backup_name)
                logger.info(f"Current model backed up to {backup_name}")
        except Exception as e:
            logger.warning(f"Failed to backup current model: {str(e)}")
    
    def _validate_new_model(self, results: dict) -> bool:
        """Validate the newly trained model"""
        try:
            # Basic validation checks
            if results.get('test_score', 0) < 0.5:  # Minimum accuracy threshold
                logger.error(f"New model accuracy too low: {results.get('test_score')}")
                return False
            
            if results.get('feature_count', 0) < 5:  # Minimum feature count
                logger.error(f"New model has too few features: {results.get('feature_count')}")
                return False
            
            # Check if model file exists
            model_path = results.get('model_path')
            if not model_path or not os.path.exists(model_path):
                logger.error("New model file not found")
                return False
            
            logger.info("New model validation passed")
            return True
            
        except Exception as e:
            logger.error(f"Model validation error: {str(e)}")
            return False
    
    def _restore_backup_model(self):
        """Restore backup model if new model fails"""
        try:
            # Find most recent backup
            backup_files = [f for f in os.listdir(self.model_dir) if f.startswith("model_backup_")]
            if backup_files:
                latest_backup = max(backup_files)
                backup_path = f"{self.model_dir}/{latest_backup}"
                current_path = f"{self.model_dir}/model_v1.pkl"
                
                os.rename(backup_path, current_path)
                logger.info(f"Restored backup model from {latest_backup}")
        except Exception as e:
            logger.error(f"Failed to restore backup model: {str(e)}")
    
    def _send_notification(self, status: str, details: dict):
        """Send notification about retrain status"""
        try:
            # This is a placeholder for notification system
            # In production, integrate with email, Slack, or monitoring system
            
            message = f"Kifaa Model Retrain {status.upper()}: {details}"
            logger.info(f"Notification: {message}")
            
            # Example: Send to webhook
            # webhook_url = os.getenv("RETRAIN_WEBHOOK_URL")
            # if webhook_url:
            #     requests.post(webhook_url, json={"message": message})
            
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")
    
    def cleanup_old_models(self, keep_count: int = 5):
        """Clean up old model files to save disk space"""
        try:
            # Get all model files
            model_files = []
            for f in os.listdir(self.model_dir):
                if f.startswith("model_v") and f.endswith(".pkl"):
                    file_path = f"{self.model_dir}/{f}"
                    model_files.append((f, os.path.getmtime(file_path)))
            
            # Sort by modification time (newest first)
            model_files.sort(key=lambda x: x[1], reverse=True)
            
            # Keep only the most recent models
            if len(model_files) > keep_count:
                for filename, _ in model_files[keep_count:]:
                    if filename != "model_v1.pkl":  # Never delete the current model
                        file_path = f"{self.model_dir}/{filename}"
                        os.remove(file_path)
                        logger.info(f"Removed old model file: {filename}")
                        
        except Exception as e:
            logger.error(f"Failed to cleanup old models: {str(e)}")
    
    def run_scheduled_retrain(self):
        """Run the scheduled retrain job"""
        logger.info("Checking if model retrain is needed...")
        
        if self.should_retrain():
            success = self.perform_retrain()
            if success:
                self.cleanup_old_models()
        else:
            logger.info("Retrain not needed at this time")

def run_scheduler():
    """Run the scheduler as a service"""
    scheduler = RetrainScheduler()
    
    # Schedule weekly retraining (every Sunday at 2 AM)
    schedule.every().sunday.at("02:00").do(scheduler.run_scheduled_retrain)
    
    # Also schedule daily cleanup (every day at 3 AM)
    schedule.every().day.at("03:00").do(scheduler.cleanup_old_models)
    
    logger.info("Retrain scheduler started. Waiting for scheduled jobs...")
    
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user")
            break
        except Exception as e:
            logger.error(f"Scheduler error: {str(e)}")
            time.sleep(300)  # Wait 5 minutes before retrying

def run_manual_retrain():
    """Run manual retrain (for testing or immediate needs)"""
    scheduler = RetrainScheduler()
    logger.info("Running manual model retrain...")
    
    success = scheduler.perform_retrain()
    if success:
        scheduler.cleanup_old_models()
        logger.info("Manual retrain completed successfully")
    else:
        logger.error("Manual retrain failed")
    
    return success

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Kifaa Model Retrain Scheduler")
    parser.add_argument("--mode", choices=["scheduler", "manual"], default="scheduler",
                       help="Run mode: scheduler (continuous) or manual (one-time)")
    parser.add_argument("--data-dir", default="data", help="Data directory path")
    parser.add_argument("--model-dir", default="models", help="Model directory path")
    
    args = parser.parse_args()
    
    if args.mode == "scheduler":
        run_scheduler()
    elif args.mode == "manual":
        success = run_manual_retrain()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

