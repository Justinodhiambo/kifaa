# Kifaa: AI-Powered Credit Scoring Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-green.svg)](https://fastapi.tiangolo.com/)

Kifaa is a globally scalable, AI-powered asset financing platform designed specifically for the underbanked population. Unlike traditional lenders, Kifaa provides credit scoring services via API, seamlessly integrating with banks, SACCOs (Savings and Credit Cooperative Organizations), and telecommunications companies across emerging markets.

## 🌍 Overview

The platform addresses the critical gap in financial inclusion by leveraging artificial intelligence and machine learning to assess creditworthiness for populations traditionally excluded from formal financial services. Kifaa's multi-channel approach supports USSD, Android applications, and partner portals, making credit scoring accessible across diverse technological landscapes.

### Key Features

- **AI-Powered Credit Scoring**: Advanced machine learning models trained on diverse datasets from LATAM, Asia, and Africa
- **Multi-Channel Access**: USSD gateway, Android SDK, and web-based partner portals
- **Real-Time API**: RESTful API with sub-second response times and 99.9% uptime
- **Explainable AI**: SHAP-based explanations for credit decisions with regulatory compliance
- **Production-Ready**: Comprehensive authentication, rate limiting, monitoring, and deployment tools
- **Global Scale**: Designed for emerging markets with offline capabilities and low-bandwidth optimization

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Docker (optional, for containerized deployment)
- Redis (optional, for production caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/kifaa.git
   cd kifaa
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize the database and model**
   ```bash
   python app/train_model.py
   ```

6. **Start the API server**
   ```bash
   python app/main.py
   ```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for interactive API documentation.

## 📖 API Documentation

### Authentication

Kifaa uses JWT-based authentication with API keys. Include your API key in the Authorization header:

```bash
Authorization: Bearer your_api_key_here
```

### Core Endpoints

#### Score User Credit
```http
POST /score-user
Content-Type: application/json
Authorization: Bearer your_api_key

{
  "user_id": "user_12345",
  "age": 32,
  "income": 75000,
  "credit_history_length": 8,
  "debt_to_income_ratio": 0.25,
  "employment_length": 5,
  "number_of_accounts": 4,
  "region": "urban"
}
```

**Response:**
```json
{
  "credit_score": 742,
  "score_category": {
    "category": "Good",
    "range": "700-799",
    "description": "Good credit with favorable lending terms"
  },
  "explanation": {
    "explanation_type": "shap",
    "top_factors": [
      {
        "factor": "Annual Income",
        "impact": "positive",
        "importance": 0.15,
        "description": "Annual income of $75,000 impacts score positively"
      }
    ]
  },
  "model_version": "v1.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Health Check
```http
GET /health
```

#### API Statistics
```http
GET /stats
Authorization: Bearer your_api_key
```

### USSD Integration

The USSD gateway provides interactive credit scoring through mobile networks:

```http
POST /ussd
Content-Type: application/json

{
  "session_id": "session_12345",
  "phone_number": "+254712345678",
  "text": "1",
  "service_code": "*123#"
}
```

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile Apps   │    │   USSD Gateway  │    │ Partner Portals │
│   (Android)     │    │   (Telcos)      │    │   (Banks/SACCOs)│
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Kifaa API Gateway    │
                    │   (Authentication/Rate    │
                    │      Limiting/Logging)    │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   Credit Scoring Engine   │
                    │  (ML Models/SHAP/Rules)   │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Data & Analytics      │
                    │  (Training/Monitoring/    │
                    │      Retraining)          │
                    └───────────────────────────┘
```

### Technology Stack

- **Backend**: FastAPI (Python) with async/await support
- **Machine Learning**: scikit-learn, XGBoost, SHAP for explainability
- **Authentication**: JWT tokens with API key management
- **Monitoring**: Structured logging with remote aggregation support
- **Deployment**: Docker containers with Kubernetes support
- **Database**: PostgreSQL for production, SQLite for development
- **Caching**: Redis for session management and rate limiting

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Security
JWT_SECRET_KEY=your_secret_key_here
API_RATE_LIMIT=100
RATE_LIMIT_WINDOW=3600

# Database
DATABASE_URL=postgresql://user:password@localhost/kifaa
REDIS_URL=redis://localhost:6379

# ML Model
MODEL_PATH=models/model_v1.pkl
RETRAIN_SCHEDULE=0 2 * * 0  # Weekly on Sunday at 2 AM

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_TO_REMOTE=false
LOGGLY_TOKEN=your_loggly_token

# External Services
USSD_PROVIDER_URL=https://api.ussd-provider.com
SMS_PROVIDER_API_KEY=your_sms_api_key
```

### Model Configuration

The ML model can be configured through `app/model_config.py`:

```python
MODEL_CONFIG = {
    'algorithm': 'xgboost',
    'hyperparameters': {
        'n_estimators': 100,
        'max_depth': 6,
        'learning_rate': 0.1
    },
    'features': [
        'age', 'income', 'credit_history_length',
        'debt_to_income_ratio', 'employment_length',
        'number_of_accounts'
    ],
    'target_variable': 'credit_score',
    'validation_split': 0.2
}
```

## 🤖 Machine Learning Pipeline

### Model Training

Train a new model with the latest data:

```bash
python app/train_model.py --data-path data/training_data.csv --output models/model_v2.pkl
```

### Automated Retraining

Set up automated weekly retraining:

```bash
# Add to crontab
0 2 * * 0 /path/to/kifaa/scripts/retrain_scheduler.py
```

### Model Evaluation

Evaluate model performance:

```bash
python scripts/evaluate_model.py --model models/model_v1.pkl --test-data data/test_data.csv
```

### Explainability

Generate SHAP explanations for model decisions:

```python
from app.shap_explainer import ShapExplainer

explainer = ShapExplainer('models/model_v1.pkl')
explanation = explainer.explain(user_data, score)
```

## 🔐 Security

### Authentication & Authorization

Kifaa implements multi-layered security:

1. **API Key Authentication**: Each partner receives unique API keys
2. **JWT Tokens**: Short-lived tokens for enhanced security
3. **Role-Based Access**: Different permission levels (score_user, admin, logs)
4. **Rate Limiting**: Configurable limits per API key and IP address

### Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### Data Protection

- All sensitive data encrypted at rest and in transit
- PII (Personally Identifiable Information) hashing
- GDPR and data protection compliance
- Audit logging for all data access

## 📊 Monitoring & Analytics

### Logging

Comprehensive logging system with multiple outputs:

```python
# Configure logging
from app.logging_config import setup_flask_logging

config = {
    'max_file_size': 10 * 1024 * 1024,  # 10MB
    'backup_count': 5,
    'json_logs': True,
    'remote_logging': {
        'loggly': {'enabled': True, 'token': 'your_token'},
        's3': {'enabled': True, 'bucket': 'your_bucket'}
    }
}

setup_flask_logging(app, config)
```

### Performance Monitoring

Monitor API performance with built-in metrics:

```bash
# Get API statistics
curl -H "Authorization: Bearer your_api_key" http://localhost:8000/stats
```

### Stress Testing

Run comprehensive stress tests:

```bash
python tests/stress_test.py --users 100 --duration 300 --output-dir results/
```

## 🌐 Deployment

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t kifaa:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Production Deployment

#### Using Render.com

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy using the included `Procfile`

#### Using Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly deploy
```

#### Using Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy Kifaa
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: ./scripts/deploy.sh
```

## 🧪 Testing

### Unit Tests

Run the complete test suite:

```bash
# Run all tests
pytest tests/ -v

# Run specific test categories
pytest tests/test_credit_scoring_unit.py -v
pytest tests/test_api_validation.py -v
pytest tests/test_error_handling.py -v
```

### Integration Tests

Test the complete API workflow:

```bash
python tests/integration_test.py --base-url http://localhost:8000
```

### Load Testing

Simulate production load:

```bash
# Async stress test
python tests/stress_test.py --test-type async --users 50 --duration 120

# Locust-based test
locust -f tests/locust_test.py --host http://localhost:8000
```

## 📱 Client Integration

### Android SDK

Integrate Kifaa into Android applications:

```java
// Initialize Kifaa client
KifaaClient client = new KifaaClient("your_api_key", "https://api.kifaa.com");

// Score user
UserProfile profile = new UserProfile()
    .setAge(32)
    .setIncome(75000)
    .setCreditHistoryLength(8);

client.scoreUser(profile, new KifaaCallback<CreditScore>() {
    @Override
    public void onSuccess(CreditScore score) {
        // Handle successful scoring
    }
    
    @Override
    public void onError(KifaaError error) {
        // Handle error
    }
});
```

### USSD Integration

Integrate with telecom USSD gateways:

```python
# USSD session handling
from app.ussd_gateway import USSDGateway

gateway = USSDGateway()
response = gateway.process_ussd_request({
    'session_id': 'session_123',
    'phone_number': '+254712345678',
    'text': '1',
    'service_code': '*123#'
})
```

### Web Dashboard

Access the admin dashboard at `http://localhost:8000/dashboard.html` for:
- Real-time API monitoring
- Credit scoring testing
- Log management
- API key administration
- Model performance metrics

## 📈 Data Schema

### User Profile Schema

```json
{
  "user_id": "string (required)",
  "age": "integer (18-100, required)",
  "income": "number (>= 0, required)",
  "credit_history_length": "number (>= 0, optional)",
  "debt_to_income_ratio": "number (0-1, optional)",
  "employment_length": "number (>= 0, optional)",
  "number_of_accounts": "integer (>= 0, optional)",
  "payment_history_score": "number (0-1, optional)",
  "credit_utilization": "number (0-1, optional)",
  "recent_inquiries": "integer (>= 0, optional)",
  "region": "string (urban/rural/suburban, optional)",
  "country": "string (optional)",
  "currency": "string (optional)"
}
```

### Credit Score Response Schema

```json
{
  "credit_score": "number (0-1000)",
  "score_category": {
    "category": "string",
    "range": "string",
    "description": "string"
  },
  "explanation": {
    "explanation_type": "string",
    "top_factors": [
      {
        "factor": "string",
        "impact": "string (positive/negative)",
        "importance": "number",
        "description": "string"
      }
    ],
    "summary": "string"
  },
  "model_version": "string",
  "timestamp": "string (ISO 8601)",
  "processing_time_ms": "number"
}
```

## 🌍 Regional Adaptations

### LATAM Markets

- **Countries**: Mexico, Brazil, Colombia, Argentina, Chile, Peru, Ecuador
- **Currencies**: MXN, BRL, COP, ARS, CLP, PEN, USD
- **Adaptations**: Informal economy modeling, remittance income, family size factors

### Asian Markets

- **Countries**: India, Indonesia, Philippines, Vietnam, Thailand, Bangladesh, Malaysia
- **Currencies**: INR, IDR, PHP, VND, THB, BDT, MYR
- **Adaptations**: Agricultural income cycles, joint family structures, mobile money integration

### African Markets

- **Countries**: Nigeria, Kenya, South Africa, Ghana, Uganda, Tanzania, Rwanda
- **Currencies**: NGN, KES, ZAR, GHS, UGX, TZS, RWF
- **Adaptations**: Seasonal income patterns, community lending, livestock assets

## 🤝 Contributing

We welcome contributions to Kifaa! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Write tests** for new functionality
3. **Follow code style** guidelines (PEP 8 for Python)
4. **Update documentation** for any API changes
5. **Submit a pull request** with detailed description

### Development Setup

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install

# Run code formatting
black app/ tests/
isort app/ tests/

# Run linting
flake8 app/ tests/
mypy app/
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://docs.kifaa.com](https://docs.kifaa.com)
- **API Reference**: [https://api.kifaa.com/docs](https://api.kifaa.com/docs)
- **Community Forum**: [https://community.kifaa.com](https://community.kifaa.com)
- **Email Support**: support@kifaa.com
- **Emergency Contact**: +1-800-KIFAA-911

## 🙏 Acknowledgments

- **Open Source Libraries**: scikit-learn, FastAPI, SHAP, pandas, numpy
- **Research Partners**: Financial inclusion research institutions
- **Beta Testers**: Partner banks and SACCOs across emerging markets
- **Community Contributors**: Developers, data scientists, and domain experts

---

**Built with ❤️ by the Kifaa Team for financial inclusion worldwide**

