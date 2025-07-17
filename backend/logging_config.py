import logging
import logging.handlers
import os
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
import requests
from pathlib import Path

class KifaaFormatter(logging.Formatter):
    """Custom formatter for Kifaa logs with JSON output option"""
    
    def __init__(self, json_format: bool = False):
        self.json_format = json_format
        if json_format:
            super().__init__()
        else:
            super().__init__(
                fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
    
    def format(self, record):
        if self.json_format:
            log_entry = {
                'timestamp': datetime.fromtimestamp(record.created).isoformat(),
                'level': record.levelname,
                'logger': record.name,
                'message': record.getMessage(),
                'module': record.module,
                'function': record.funcName,
                'line': record.lineno
            }
            
            # Add exception info if present
            if record.exc_info:
                log_entry['exception'] = self.formatException(record.exc_info)
            
            # Add extra fields
            for key, value in record.__dict__.items():
                if key not in ['name', 'msg', 'args', 'levelname', 'levelno', 'pathname', 
                              'filename', 'module', 'lineno', 'funcName', 'created', 
                              'msecs', 'relativeCreated', 'thread', 'threadName', 
                              'processName', 'process', 'getMessage', 'exc_info', 'exc_text', 'stack_info']:
                    log_entry[key] = value
            
            return json.dumps(log_entry)
        else:
            return super().format(record)

class RemoteLogHandler(logging.Handler):
    """Custom handler to send logs to remote services (Loggly, S3, etc.)"""
    
    def __init__(self, service_type: str, config: Dict[str, Any]):
        super().__init__()
        self.service_type = service_type
        self.config = config
        self.session = requests.Session()
        
        # Set timeout for remote requests
        self.timeout = config.get('timeout', 10)
        
        # Buffer for batch sending
        self.buffer = []
        self.buffer_size = config.get('buffer_size', 10)
    
    def emit(self, record):
        """Emit log record to remote service"""
        try:
            log_entry = self.format(record)
            
            if self.service_type == 'loggly':
                self._send_to_loggly(log_entry)
            elif self.service_type == 's3':
                self._buffer_for_s3(log_entry)
            elif self.service_type == 'webhook':
                self._send_to_webhook(log_entry)
            
        except Exception as e:
            # Don't let logging errors crash the application
            print(f"Failed to send log to remote service: {e}", file=sys.stderr)
    
    def _send_to_loggly(self, log_entry: str):
        """Send log to Loggly"""
        token = self.config.get('token')
        if not token:
            return
        
        url = f"https://logs-01.loggly.com/inputs/{token}/tag/kifaa-api/"
        
        try:
            response = self.session.post(
                url,
                data=log_entry,
                headers={'Content-Type': 'application/json'},
                timeout=self.timeout
            )
            response.raise_for_status()
        except Exception as e:
            print(f"Failed to send to Loggly: {e}", file=sys.stderr)
    
    def _buffer_for_s3(self, log_entry: str):
        """Buffer logs for batch upload to S3"""
        self.buffer.append(log_entry)
        
        if len(self.buffer) >= self.buffer_size:
            self._flush_to_s3()
    
    def _flush_to_s3(self):
        """Flush buffered logs to S3"""
        if not self.buffer:
            return
        
        try:
            import boto3
            
            s3_client = boto3.client(
                's3',
                aws_access_key_id=self.config.get('access_key'),
                aws_secret_access_key=self.config.get('secret_key'),
                region_name=self.config.get('region', 'us-east-1')
            )
            
            # Create log file content
            log_content = '\n'.join(self.buffer)
            timestamp = datetime.utcnow().strftime('%Y/%m/%d/%H')
            key = f"kifaa-logs/{timestamp}/logs-{datetime.utcnow().isoformat()}.json"
            
            s3_client.put_object(
                Bucket=self.config['bucket'],
                Key=key,
                Body=log_content,
                ContentType='application/json'
            )
            
            self.buffer.clear()
            
        except Exception as e:
            print(f"Failed to upload to S3: {e}", file=sys.stderr)
    
    def _send_to_webhook(self, log_entry: str):
        """Send log to webhook URL"""
        webhook_url = self.config.get('url')
        if not webhook_url:
            return
        
        try:
            response = self.session.post(
                webhook_url,
                data=log_entry,
                headers={'Content-Type': 'application/json'},
                timeout=self.timeout
            )
            response.raise_for_status()
        except Exception as e:
            print(f"Failed to send to webhook: {e}", file=sys.stderr)
    
    def close(self):
        """Close handler and flush any remaining logs"""
        if self.service_type == 's3':
            self._flush_to_s3()
        super().close()

class LoggingManager:
    """Centralized logging management for Kifaa"""
    
    def __init__(self, log_dir: str = "logs", app_name: str = "kifaa"):
        self.log_dir = Path(log_dir)
        self.app_name = app_name
        self.log_dir.mkdir(exist_ok=True)
        
        # Create log files
        self.log_files = {
            'main': self.log_dir / f"{app_name}.log",
            'error': self.log_dir / f"{app_name}_error.log",
            'access': self.log_dir / f"{app_name}_access.log",
            'security': self.log_dir / f"{app_name}_security.log"
        }
        
        self.configured = False
    
    def setup_logging(self, config: Dict[str, Any] = None):
        """Setup comprehensive logging configuration"""
        if self.configured:
            return
        
        config = config or {}
        
        # Root logger configuration
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.INFO)
        
        # Clear existing handlers
        root_logger.handlers.clear()
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(KifaaFormatter(json_format=False))
        root_logger.addHandler(console_handler)
        
        # File handlers
        self._setup_file_handlers(config)
        
        # Remote handlers
        self._setup_remote_handlers(config)
        
        # Application-specific loggers
        self._setup_app_loggers()
        
        self.configured = True
        logging.info("Logging system initialized")
    
    def _setup_file_handlers(self, config: Dict[str, Any]):
        """Setup file-based log handlers"""
        # Main application log (rotating)
        main_handler = logging.handlers.RotatingFileHandler(
            self.log_files['main'],
            maxBytes=config.get('max_file_size', 10 * 1024 * 1024),  # 10MB
            backupCount=config.get('backup_count', 5)
        )
        main_handler.setLevel(logging.INFO)
        main_handler.setFormatter(KifaaFormatter(json_format=config.get('json_logs', False)))
        
        # Error log (rotating)
        error_handler = logging.handlers.RotatingFileHandler(
            self.log_files['error'],
            maxBytes=config.get('max_file_size', 10 * 1024 * 1024),
            backupCount=config.get('backup_count', 5)
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(KifaaFormatter(json_format=config.get('json_logs', False)))
        
        # Add to root logger
        logging.getLogger().addHandler(main_handler)
        logging.getLogger().addHandler(error_handler)
        
        # Time-based rotating handler for daily logs
        if config.get('daily_logs', True):
            daily_handler = logging.handlers.TimedRotatingFileHandler(
                self.log_dir / f"{self.app_name}_daily.log",
                when='midnight',
                interval=1,
                backupCount=config.get('daily_backup_count', 30)
            )
            daily_handler.setLevel(logging.INFO)
            daily_handler.setFormatter(KifaaFormatter(json_format=config.get('json_logs', False)))
            logging.getLogger().addHandler(daily_handler)
    
    def _setup_remote_handlers(self, config: Dict[str, Any]):
        """Setup remote log handlers"""
        remote_config = config.get('remote_logging', {})
        
        # Loggly integration
        if remote_config.get('loggly', {}).get('enabled', False):
            loggly_handler = RemoteLogHandler('loggly', remote_config['loggly'])
            loggly_handler.setLevel(logging.WARNING)  # Only send warnings and errors
            loggly_handler.setFormatter(KifaaFormatter(json_format=True))
            logging.getLogger().addHandler(loggly_handler)
        
        # S3 integration
        if remote_config.get('s3', {}).get('enabled', False):
            s3_handler = RemoteLogHandler('s3', remote_config['s3'])
            s3_handler.setLevel(logging.INFO)
            s3_handler.setFormatter(KifaaFormatter(json_format=True))
            logging.getLogger().addHandler(s3_handler)
        
        # Webhook integration
        if remote_config.get('webhook', {}).get('enabled', False):
            webhook_handler = RemoteLogHandler('webhook', remote_config['webhook'])
            webhook_handler.setLevel(logging.ERROR)  # Only send errors
            webhook_handler.setFormatter(KifaaFormatter(json_format=True))
            logging.getLogger().addHandler(webhook_handler)
    
    def _setup_app_loggers(self):
        """Setup application-specific loggers"""
        # Access logger for API requests
        access_logger = logging.getLogger('kifaa.access')
        access_handler = logging.handlers.RotatingFileHandler(
            self.log_files['access'],
            maxBytes=10 * 1024 * 1024,
            backupCount=5
        )
        access_handler.setFormatter(KifaaFormatter(json_format=True))
        access_logger.addHandler(access_handler)
        access_logger.setLevel(logging.INFO)
        access_logger.propagate = False
        
        # Security logger for authentication events
        security_logger = logging.getLogger('kifaa.security')
        security_handler = logging.handlers.RotatingFileHandler(
            self.log_files['security'],
            maxBytes=10 * 1024 * 1024,
            backupCount=10
        )
        security_handler.setFormatter(KifaaFormatter(json_format=True))
        security_logger.addHandler(security_handler)
        security_logger.setLevel(logging.INFO)
        security_logger.propagate = False
    
    def get_logs(self, log_type: str = 'main', lines: int = 100, level: str = None) -> list:
        """Get recent log entries"""
        log_file = self.log_files.get(log_type)
        if not log_file or not log_file.exists():
            return []
        
        try:
            with open(log_file, 'r') as f:
                all_lines = f.readlines()
            
            # Get last N lines
            recent_lines = all_lines[-lines:] if lines > 0 else all_lines
            
            # Filter by level if specified
            if level:
                filtered_lines = []
                for line in recent_lines:
                    if level.upper() in line:
                        filtered_lines.append(line.strip())
                return filtered_lines
            
            return [line.strip() for line in recent_lines]
            
        except Exception as e:
            logging.error(f"Failed to read log file {log_file}: {e}")
            return []
    
    def clear_logs(self, log_type: str = None):
        """Clear log files"""
        if log_type:
            log_file = self.log_files.get(log_type)
            if log_file and log_file.exists():
                log_file.unlink()
                logging.info(f"Cleared {log_type} log file")
        else:
            # Clear all log files
            for log_type, log_file in self.log_files.items():
                if log_file.exists():
                    log_file.unlink()
            logging.info("Cleared all log files")
    
    def log_api_request(self, request_data: Dict[str, Any]):
        """Log API request details"""
        access_logger = logging.getLogger('kifaa.access')
        access_logger.info("API request", extra=request_data)
    
    def log_security_event(self, event_type: str, details: Dict[str, Any]):
        """Log security-related events"""
        security_logger = logging.getLogger('kifaa.security')
        security_logger.info(f"Security event: {event_type}", extra=details)

# Global logging manager instance
logging_manager = LoggingManager()

def setup_flask_logging(app, config: Dict[str, Any] = None):
    """Setup logging for Flask application"""
    logging_manager.setup_logging(config)
    
    # Add request logging middleware
    @app.before_request
    def log_request():
        """Log incoming requests"""
        from flask import request
        
        request_data = {
            'method': request.method,
            'url': request.url,
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            'content_length': request.content_length,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add user info if available
        if hasattr(request, 'user_info') and request.user_info:
            request_data['user'] = request.user_info.get('name', 'unknown')
            request_data['api_key'] = request.user_info.get('api_key', 'unknown')
        
        logging_manager.log_api_request(request_data)
    
    @app.after_request
    def log_response(response):
        """Log response details"""
        access_logger = logging.getLogger('kifaa.access')
        access_logger.info("API response", extra={
            'status_code': response.status_code,
            'content_length': response.content_length,
            'timestamp': datetime.utcnow().isoformat()
        })
        return response

def get_logging_config():
    """Get default logging configuration"""
    return {
        'max_file_size': 10 * 1024 * 1024,  # 10MB
        'backup_count': 5,
        'daily_logs': True,
        'daily_backup_count': 30,
        'json_logs': True,
        'remote_logging': {
            'loggly': {
                'enabled': False,
                'token': os.getenv('LOGGLY_TOKEN'),
                'timeout': 10
            },
            's3': {
                'enabled': False,
                'bucket': os.getenv('LOG_S3_BUCKET'),
                'access_key': os.getenv('AWS_ACCESS_KEY_ID'),
                'secret_key': os.getenv('AWS_SECRET_ACCESS_KEY'),
                'region': os.getenv('AWS_REGION', 'us-east-1'),
                'buffer_size': 50
            },
            'webhook': {
                'enabled': False,
                'url': os.getenv('LOG_WEBHOOK_URL'),
                'timeout': 10
            }
        }
    }

