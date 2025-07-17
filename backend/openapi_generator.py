import json
from fastapi.openapi.utils import get_openapi
from main_updated import app

def generate_openapi_schema():
    """Generate OpenAPI schema for the Kifaa API"""
    
    openapi_schema = get_openapi(
        title="Kifaa Credit Scoring API",
        version="1.0.0",
        description="""
        # Kifaa Credit Scoring API
        
        AI-powered asset financing platform for the underbanked.
        
        ## Authentication
        
        This API uses Bearer token authentication. You can authenticate using either:
        
        1. **JWT Tokens**: Obtained from the `/auth/token` endpoint
        2. **API Keys**: Obtained from the `/auth/api-key` endpoint
        
        Include the token in the Authorization header:
        ```
        Authorization: Bearer your-token-here
        ```
        
        ## Rate Limiting
        
        The API implements rate limiting based on user tiers:
        
        - **Default**: 100 requests per hour
        - **Premium**: 1,000 requests per hour  
        - **Admin**: 10,000 requests per hour
        
        Rate limit information is included in response headers:
        - `X-RateLimit-Limit`: Request limit per window
        - `X-RateLimit-Remaining`: Remaining requests in current window
        - `X-RateLimit-Reset`: Unix timestamp when the window resets
        
        ## Error Handling
        
        The API returns standard HTTP status codes:
        
        - `200`: Success
        - `400`: Bad Request (validation error)
        - `401`: Unauthorized (invalid/missing token)
        - `403`: Forbidden (insufficient permissions)
        - `429`: Too Many Requests (rate limit exceeded)
        - `500`: Internal Server Error
        
        Error responses include details in this format:
        ```json
        {
            "error": "Error description",
            "status_code": 400
        }
        ```
        
        ## Permissions
        
        Different endpoints require different permissions:
        
        - `score_user`: Required for credit scoring endpoints
        - `logs`: Required for log management (admin only)
        - `retrain`: Required for model retraining (admin only)
        
        ## Data Privacy
        
        - All user data is processed securely
        - Personal information is not stored permanently
        - Audit logs are maintained for compliance
        - Data encryption in transit and at rest
        """,
        routes=app.routes,
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token or API key"
        }
    }
    
    # Add security to all endpoints
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            if method != "get" or path not in ["/health", "/docs", "/redoc", "/openapi.json"]:
                openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
    
    # Add examples
    openapi_schema["components"]["examples"] = {
        "UserProfileExample": {
            "summary": "Example user profile",
            "value": {
                "user_id": "user_12345",
                "age": 35,
                "income": 75000,
                "credit_history_length": 8,
                "debt_to_income_ratio": 0.25,
                "employment_length": 5,
                "number_of_accounts": 4,
                "payment_history_score": 0.85,
                "credit_utilization": 0.3,
                "recent_inquiries": 1,
                "region": "urban"
            }
        },
        "ScoreResponseExample": {
            "summary": "Example score response",
            "value": {
                "user_id": "user_12345",
                "timestamp": "2024-01-15T10:30:00Z",
                "credit_score": 725.5,
                "score_category": {
                    "category": "Good",
                    "range": "700-799",
                    "description": "Strong credit profile"
                },
                "explanation": {
                    "explanation_type": "rule_based",
                    "top_factors": [
                        {
                            "factor": "High Income",
                            "impact": "positive",
                            "value": 75000,
                            "description": "Income of $75,000 is above average"
                        }
                    ],
                    "summary": "Strong credit profile with positive factors",
                    "recommendations": ["Maintain current financial habits"]
                },
                "model_version": "fallback",
                "api_version": "1.0"
            }
        }
    }
    
    return openapi_schema

def save_openapi_schema():
    """Save OpenAPI schema to file"""
    schema = generate_openapi_schema()
    
    # Save as JSON
    with open("docs/openapi.json", "w") as f:
        json.dump(schema, f, indent=2)
    
    # Save as YAML (if PyYAML is available)
    try:
        import yaml
        with open("docs/openapi.yaml", "w") as f:
            yaml.dump(schema, f, default_flow_style=False)
    except ImportError:
        print("PyYAML not available, skipping YAML export")
    
    print("OpenAPI schema saved to docs/openapi.json")

def generate_postman_collection():
    """Generate Postman collection from OpenAPI schema"""
    schema = generate_openapi_schema()
    
    collection = {
        "info": {
            "name": "Kifaa Credit Scoring API",
            "description": schema["info"]["description"],
            "version": schema["info"]["version"],
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "auth": {
            "type": "bearer",
            "bearer": [
                {
                    "key": "token",
                    "value": "{{bearer_token}}",
                    "type": "string"
                }
            ]
        },
        "variable": [
            {
                "key": "base_url",
                "value": "http://localhost:8000",
                "type": "string"
            },
            {
                "key": "bearer_token",
                "value": "your-token-here",
                "type": "string"
            }
        ],
        "item": []
    }
    
    # Convert OpenAPI paths to Postman requests
    for path, methods in schema["paths"].items():
        folder = {
            "name": path.replace("/", "_").strip("_") or "root",
            "item": []
        }
        
        for method, details in methods.items():
            if method.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                request = {
                    "name": details.get("summary", f"{method.upper()} {path}"),
                    "request": {
                        "method": method.upper(),
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json",
                                "type": "text"
                            }
                        ],
                        "url": {
                            "raw": "{{base_url}}" + path,
                            "host": ["{{base_url}}"],
                            "path": path.strip("/").split("/") if path != "/" else []
                        },
                        "description": details.get("description", "")
                    }
                }
                
                # Add request body for POST/PUT requests
                if method.upper() in ["POST", "PUT", "PATCH"]:
                    if "requestBody" in details:
                        content = details["requestBody"].get("content", {})
                        if "application/json" in content:
                            schema_ref = content["application/json"].get("schema", {})
                            if "$ref" in schema_ref:
                                # Add example body
                                request["request"]["body"] = {
                                    "mode": "raw",
                                    "raw": json.dumps({
                                        "user_id": "example_user",
                                        "age": 30,
                                        "income": 50000,
                                        "credit_history_length": 5
                                    }, indent=2),
                                    "options": {
                                        "raw": {
                                            "language": "json"
                                        }
                                    }
                                }
                
                folder["item"].append(request)
        
        if folder["item"]:
            collection["item"].append(folder)
    
    # Save Postman collection
    with open("docs/kifaa_api.postman_collection.json", "w") as f:
        json.dump(collection, f, indent=2)
    
    print("Postman collection saved to docs/kifaa_api.postman_collection.json")

if __name__ == "__main__":
    import os
    
    # Create docs directory
    os.makedirs("docs", exist_ok=True)
    
    # Generate documentation
    save_openapi_schema()
    generate_postman_collection()
    
    print("API documentation generated successfully!")

