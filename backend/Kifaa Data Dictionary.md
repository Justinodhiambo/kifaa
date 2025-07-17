# Kifaa Data Dictionary

## Overview

This document provides a comprehensive data dictionary for the Kifaa AI-powered credit scoring platform. It defines all data fields, their types, constraints, and business meanings used across the system.

## Table of Contents

1. [User Profile Schema](#user-profile-schema)
2. [Credit Score Response Schema](#credit-score-response-schema)
3. [USSD Session Schema](#ussd-session-schema)
4. [API Authentication Schema](#api-authentication-schema)
5. [Logging and Monitoring Schema](#logging-and-monitoring-schema)
6. [Regional Data Variations](#regional-data-variations)
7. [Data Validation Rules](#data-validation-rules)
8. [Data Privacy and Compliance](#data-privacy-and-compliance)

---

## User Profile Schema

The user profile represents the input data required for credit scoring. This schema is designed to accommodate diverse user populations across LATAM, Asia, and Africa.

### Core Fields

| Field Name | Type | Required | Constraints | Description | Example |
|------------|------|----------|-------------|-------------|---------|
| `user_id` | string | Yes | 1-100 chars, alphanumeric + underscore | Unique identifier for the user | `"user_12345"` |
| `age` | integer | Yes | 18-100 | User's age in years | `32` |
| `income` | number | Yes | >= 0 | Annual income in local currency | `75000` |

### Financial History Fields

| Field Name | Type | Required | Constraints | Description | Example |
|------------|------|----------|-------------|-------------|---------|
| `credit_history_length` | number | No | >= 0, <= 50 | Length of credit history in years | `8.5` |
| `debt_to_income_ratio` | number | No | 0-1 | Ratio of total debt to annual income | `0.25` |
| `employment_length` | number | No | >= 0, <= 50 | Years in current employment | `5.2` |
| `number_of_accounts` | integer | No | >= 0, <= 50 | Number of credit accounts | `4` |
| `payment_history_score` | number | No | 0-1 | Historical payment performance score | `0.85` |
| `credit_utilization` | number | No | 0-1 | Credit utilization ratio | `0.30` |
| `recent_inquiries` | integer | No | >= 0, <= 100 | Number of recent credit inquiries | `2` |

### Demographic Fields

| Field Name | Type | Required | Constraints | Description | Example |
|------------|------|----------|-------------|-------------|---------|
| `region` | string | No | urban, rural, suburban | Geographic region type | `"urban"` |
| `country` | string | No | ISO 3166-1 alpha-2 | Country code | `"KE"` |
| `currency` | string | No | ISO 4217 | Currency code | `"KES"` |
| `gender` | string | No | male, female, other | User's gender | `"female"` |
| `education` | string | No | primary, secondary, technical, university, postgraduate | Education level | `"university"` |
| `family_size` | integer | No | 1-20 | Number of family members | `4` |

### Employment Fields

| Field Name | Type | Required | Constraints | Description | Example |
|------------|------|----------|-------------|-------------|---------|
| `employment_type` | string | No | formal, informal, self_employed, agricultural, unemployed | Type of employment | `"formal"` |
| `employment_stability` | number | No | 0-1 | Employment stability score | `0.8` |
| `monthly_expenses` | number | No | >= 0 | Monthly living expenses | `2500` |
| `savings_rate` | number | No | 0-1 | Percentage of income saved | `0.15` |

### Asset Fields

| Field Name | Type | Required | Constraints | Description | Example |
|------------|------|----------|-------------|-------------|---------|
| `has_collateral` | boolean | No | true/false | Whether user has collateral | `true` |
| `collateral_value` | number | No | >= 0 | Estimated value of collateral | `50000` |
| `property_ownership` | string | No | owned, rented, family, other | Housing situation | `"owned"` |

### Technology Access Fields

| Field Name | Type | Required | Constraints | Description | Example |
|------------|------|----------|-------------|-------------|---------|
| `has_smartphone` | boolean | No | true/false | Smartphone ownership | `true` |
| `has_internet` | boolean | No | true/false | Internet access | `true` |
| `uses_mobile_money` | boolean | No | true/false | Mobile money usage | `true` |
| `bank_account_type` | string | No | none, basic, savings, current | Type of bank account | `"savings"` |

---

## Credit Score Response Schema

The credit score response provides the scoring result along with explanations and metadata.

### Core Response Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `credit_score` | number | Credit score (0-1000) | `742` |
| `processing_time_ms` | number | Processing time in milliseconds | `150` |
| `model_version` | string | Version of the ML model used | `"v1.2.3"` |
| `timestamp` | string | ISO 8601 timestamp | `"2024-01-15T10:30:00Z"` |

### Score Category Object

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `category` | string | Score category name | `"Good"` |
| `range` | string | Score range | `"700-799"` |
| `description` | string | Category description | `"Good credit with favorable terms"` |
| `recommendation` | string | Lending recommendation | `"Approve with standard terms"` |

### Explanation Object

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `explanation_type` | string | Type of explanation (shap, rule_based) | `"shap"` |
| `summary` | string | Brief explanation summary | `"Score driven by stable income and low debt ratio"` |
| `confidence` | number | Model confidence (0-1) | `0.87` |

### Top Factors Array

Each factor object contains:

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `factor` | string | Human-readable factor name | `"Annual Income"` |
| `impact` | string | Impact direction (positive, negative) | `"positive"` |
| `importance` | number | Relative importance score | `0.15` |
| `value` | any | Actual value for this factor | `75000` |
| `description` | string | Detailed explanation | `"Annual income of $75,000 impacts score positively"` |

---

## USSD Session Schema

USSD sessions track interactive credit scoring flows through mobile networks.

### Session Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `session_id` | string | Unique session identifier | `"ussd_session_12345"` |
| `phone_number` | string | User's phone number | `"+254712345678"` |
| `service_code` | string | USSD service code | `"*123#"` |
| `step` | integer | Current step in the flow | `3` |
| `created_at` | string | Session creation timestamp | `"2024-01-15T10:30:00Z"` |
| `last_activity` | string | Last activity timestamp | `"2024-01-15T10:32:15Z"` |
| `user_data` | object | Collected user data | `{"age": 30, "income": 50000}` |
| `completed` | boolean | Whether session is completed | `false` |

### USSD Request Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `session_id` | string | Yes | Session identifier | `"session_12345"` |
| `phone_number` | string | Yes | User's phone number | `"+254712345678"` |
| `text` | string | Yes | User input text | `"1"` |
| `service_code` | string | Yes | USSD service code | `"*123#"` |

### USSD Response Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `session_id` | string | Session identifier | `"session_12345"` |
| `text` | string | Response text to display | `"Enter your age:"` |
| `end_session` | boolean | Whether to end the session | `false` |

---

## API Authentication Schema

Authentication and authorization data structures.

### API Key Object

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `api_key` | string | The API key | `"kifaa_partner_001"` |
| `name` | string | Partner name | `"Bank ABC"` |
| `permissions` | array | List of permissions | `["score_user", "logs"]` |
| `created_at` | string | Creation timestamp | `"2024-01-01T00:00:00Z"` |
| `last_used` | string | Last usage timestamp | `"2024-01-15T10:30:00Z"` |
| `usage_count` | integer | Total usage count | `1250` |
| `rate_limit` | integer | Requests per hour limit | `1000` |

### JWT Token Payload

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `api_key` | string | Associated API key | `"kifaa_partner_001"` |
| `name` | string | Partner name | `"Bank ABC"` |
| `permissions` | array | Granted permissions | `["score_user"]` |
| `iat` | number | Issued at timestamp | `1642248600` |
| `exp` | number | Expiration timestamp | `1642335000` |
| `iss` | string | Token issuer | `"kifaa-api"` |
| `sub` | string | Subject (API key) | `"kifaa_partner_001"` |

---

## Logging and Monitoring Schema

Structured logging and monitoring data formats.

### Log Entry Object

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `timestamp` | string | ISO 8601 timestamp | `"2024-01-15T10:30:00Z"` |
| `level` | string | Log level | `"INFO"` |
| `logger` | string | Logger name | `"kifaa.api"` |
| `message` | string | Log message | `"Credit score calculated"` |
| `module` | string | Python module | `"credit_scoring"` |
| `function` | string | Function name | `"score_user_profile"` |
| `line` | integer | Line number | `142` |
| `user_id` | string | Associated user ID | `"user_12345"` |
| `api_key` | string | Associated API key | `"kifaa_partner_001"` |
| `processing_time` | number | Processing time in ms | `150` |

### API Request Log

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `method` | string | HTTP method | `"POST"` |
| `url` | string | Request URL | `"/score-user"` |
| `remote_addr` | string | Client IP address | `"192.168.1.100"` |
| `user_agent` | string | User agent string | `"KifaaAndroid/1.0.0"` |
| `content_length` | integer | Request content length | `256` |
| `status_code` | integer | Response status code | `200` |
| `response_time` | number | Response time in ms | `150` |

### Security Event Log

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `event_type` | string | Type of security event | `"authentication_failure"` |
| `severity` | string | Event severity | `"medium"` |
| `source_ip` | string | Source IP address | `"192.168.1.100"` |
| `api_key` | string | Associated API key | `"kifaa_partner_001"` |
| `details` | object | Additional event details | `{"reason": "invalid_token"}` |

---

## Regional Data Variations

Different regions may have specific data requirements and variations.

### LATAM Specific Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `remittance_income` | number | Monthly remittance income | `500` |
| `informal_income_ratio` | number | Ratio of informal to total income | `0.3` |
| `family_support_network` | boolean | Has family financial support | `true` |

### Asia Specific Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `joint_family_income` | number | Combined family income | `120000` |
| `agricultural_season_income` | boolean | Income varies by season | `true` |
| `mobile_wallet_usage` | string | Mobile wallet usage level | `"high"` |

### Africa Specific Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `livestock_assets` | number | Value of livestock owned | `25000` |
| `community_group_member` | boolean | Member of savings group | `true` |
| `seasonal_income_pattern` | string | Income seasonality pattern | `"agricultural"` |

---

## Data Validation Rules

### Input Validation

1. **Required Fields**: `user_id`, `age`, `income` must be present
2. **Data Types**: All fields must match specified types
3. **Range Validation**: Numeric fields must be within specified ranges
4. **Format Validation**: Strings must match specified patterns
5. **Business Logic**: Cross-field validation (e.g., employment_length <= age - 16)

### Data Sanitization

1. **String Trimming**: Remove leading/trailing whitespace
2. **Case Normalization**: Convert enum values to lowercase
3. **Number Formatting**: Round to appropriate decimal places
4. **Special Characters**: Remove or escape special characters

### Error Handling

| Error Type | HTTP Status | Error Code | Description |
|------------|-------------|------------|-------------|
| Missing Required Field | 400 | `MISSING_FIELD` | Required field not provided |
| Invalid Data Type | 400 | `INVALID_TYPE` | Field has wrong data type |
| Out of Range | 400 | `OUT_OF_RANGE` | Numeric value outside valid range |
| Invalid Format | 400 | `INVALID_FORMAT` | String doesn't match required format |
| Business Logic Error | 400 | `BUSINESS_LOGIC_ERROR` | Cross-field validation failed |

---

## Data Privacy and Compliance

### PII (Personally Identifiable Information)

Fields containing PII that require special handling:

- `user_id` (if contains personal information)
- `phone_number` (in USSD sessions)
- Any custom fields containing names, addresses, etc.

### Data Retention

| Data Type | Retention Period | Anonymization |
|-----------|------------------|---------------|
| User Profiles | 7 years | After 2 years |
| Credit Scores | 7 years | After 2 years |
| USSD Sessions | 30 days | Immediate |
| API Logs | 1 year | After 90 days |
| Security Logs | 3 years | After 1 year |

### Compliance Standards

- **GDPR**: Right to be forgotten, data portability, consent management
- **PCI DSS**: Secure handling of payment-related data
- **SOX**: Financial data integrity and audit trails
- **Local Regulations**: Country-specific data protection laws

### Data Encryption

| Data State | Encryption Method | Key Management |
|------------|-------------------|----------------|
| At Rest | AES-256 | AWS KMS / Azure Key Vault |
| In Transit | TLS 1.3 | Certificate-based |
| In Processing | Application-level | Environment variables |

---

## Schema Versioning

### Version History

| Version | Date | Changes | Backward Compatible |
|---------|------|---------|-------------------|
| 1.0.0 | 2024-01-01 | Initial schema | N/A |
| 1.1.0 | 2024-02-01 | Added regional fields | Yes |
| 1.2.0 | 2024-03-01 | Enhanced explanations | Yes |

### Migration Guidelines

1. **Additive Changes**: New optional fields are backward compatible
2. **Breaking Changes**: Require version bump and migration plan
3. **Deprecation**: 6-month notice before removing fields
4. **Documentation**: All changes must be documented

---

## API Examples

### Complete User Profile Example

```json
{
  "user_id": "latam_mx_user_001",
  "age": 34,
  "income": 85000,
  "credit_history_length": 6.5,
  "debt_to_income_ratio": 0.28,
  "employment_length": 8.2,
  "number_of_accounts": 5,
  "payment_history_score": 0.89,
  "credit_utilization": 0.35,
  "recent_inquiries": 1,
  "region": "urban",
  "country": "MX",
  "currency": "MXN",
  "gender": "female",
  "education": "university",
  "family_size": 3,
  "employment_type": "formal",
  "employment_stability": 0.85,
  "monthly_expenses": 6500,
  "savings_rate": 0.18,
  "has_collateral": true,
  "collateral_value": 120000,
  "property_ownership": "owned",
  "has_smartphone": true,
  "has_internet": true,
  "uses_mobile_money": false,
  "bank_account_type": "savings",
  "remittance_income": 200
}
```

### Complete Credit Score Response Example

```json
{
  "credit_score": 758,
  "processing_time_ms": 142,
  "model_version": "v1.2.3",
  "timestamp": "2024-01-15T10:30:00Z",
  "score_category": {
    "category": "Good",
    "range": "700-799",
    "description": "Good credit with favorable lending terms",
    "recommendation": "Approve with standard terms"
  },
  "explanation": {
    "explanation_type": "shap",
    "summary": "Score primarily driven by stable formal employment, good payment history, and moderate debt levels",
    "confidence": 0.87,
    "top_factors": [
      {
        "factor": "Payment History",
        "impact": "positive",
        "importance": 0.22,
        "value": 0.89,
        "description": "Excellent payment history of 89% positively impacts credit score"
      },
      {
        "factor": "Employment Stability",
        "impact": "positive",
        "importance": 0.18,
        "value": 0.85,
        "description": "High employment stability score of 85% indicates reliable income"
      },
      {
        "factor": "Debt-to-Income Ratio",
        "impact": "positive",
        "importance": 0.15,
        "value": 0.28,
        "description": "Low debt-to-income ratio of 28% shows good financial management"
      },
      {
        "factor": "Credit Utilization",
        "impact": "negative",
        "importance": -0.08,
        "value": 0.35,
        "description": "Credit utilization of 35% is slightly high, consider reducing"
      },
      {
        "factor": "Credit History Length",
        "impact": "positive",
        "importance": 0.12,
        "value": 6.5,
        "description": "Credit history of 6.5 years demonstrates experience with credit"
      }
    ]
  },
  "risk_assessment": {
    "risk_level": "low",
    "probability_of_default": 0.08,
    "recommended_credit_limit": 45000,
    "recommended_interest_rate": 0.12
  },
  "metadata": {
    "request_id": "req_12345",
    "model_features_used": 15,
    "data_completeness": 0.92,
    "regional_adjustments_applied": true
  }
}
```

---

This data dictionary serves as the authoritative reference for all data structures used in the Kifaa platform. It should be updated whenever schema changes are made and reviewed regularly to ensure accuracy and completeness.

