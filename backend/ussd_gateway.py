from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import logging
import json
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

# USSD session storage (in production, use Redis or database)
ussd_sessions = {}

class USSDRequest(BaseModel):
    session_id: str = Field(..., description="USSD session identifier")
    phone_number: str = Field(..., description="User's phone number")
    text: str = Field(..., description="User input text")
    service_code: str = Field(..., description="USSD service code")

class USSDResponse(BaseModel):
    session_id: str
    text: str
    end_session: bool = False

class USSDSession:
    """Manages USSD session state and flow"""
    
    def __init__(self, session_id: str, phone_number: str, service_code: str):
        self.session_id = session_id
        self.phone_number = phone_number
        self.service_code = service_code
        self.step = 0
        self.user_data = {}
        self.created_at = datetime.utcnow()
        self.last_activity = datetime.utcnow()
    
    def update_activity(self):
        """Update last activity timestamp"""
        self.last_activity = datetime.utcnow()
    
    def is_expired(self, timeout_minutes: int = 5) -> bool:
        """Check if session has expired"""
        elapsed = (datetime.utcnow() - self.last_activity).total_seconds() / 60
        return elapsed > timeout_minutes

class USSDGateway:
    """Mock USSD Gateway for Kifaa credit scoring"""
    
    def __init__(self):
        self.menu_flow = {
            0: {
                "text": "Welcome to Kifaa Credit Scoring\n1. Check Credit Score\n2. Apply for Loan\n3. Help\n4. Exit",
                "options": ["1", "2", "3", "4"]
            },
            1: {  # Check Credit Score flow
                "text": "Enter your age:",
                "field": "age",
                "validation": "numeric",
                "min_value": 18,
                "max_value": 100
            },
            2: {
                "text": "Enter your monthly income (in local currency):",
                "field": "income",
                "validation": "numeric",
                "min_value": 0
            },
            3: {
                "text": "How many years of credit history do you have?",
                "field": "credit_history_length",
                "validation": "numeric",
                "min_value": 0,
                "max_value": 50
            },
            4: {
                "text": "What is your employment status?\n1. Employed\n2. Self-employed\n3. Unemployed\n4. Student",
                "field": "employment_status",
                "options": ["1", "2", "3", "4"],
                "mapping": {"1": "employed", "2": "self_employed", "3": "unemployed", "4": "student"}
            },
            5: {
                "text": "What is your region?\n1. Urban\n2. Rural\n3. Suburban",
                "field": "region",
                "options": ["1", "2", "3"],
                "mapping": {"1": "urban", "2": "rural", "3": "suburban"}
            },
            6: {
                "text": "Processing your credit score...",
                "action": "calculate_score"
            }
        }
    
    def process_ussd_request(self, request: USSDRequest) -> USSDResponse:
        """Process incoming USSD request"""
        try:
            # Get or create session
            session = self._get_or_create_session(request)
            
            # Check for session expiry
            if session.is_expired():
                self._cleanup_session(request.session_id)
                return USSDResponse(
                    session_id=request.session_id,
                    text="Session expired. Please try again.",
                    end_session=True
                )
            
            # Update activity
            session.update_activity()
            
            # Process user input
            response = self._process_user_input(session, request.text)
            
            # Update session in storage
            ussd_sessions[request.session_id] = session
            
            return response
            
        except Exception as e:
            logger.error(f"USSD processing error: {str(e)}")
            return USSDResponse(
                session_id=request.session_id,
                text="Service temporarily unavailable. Please try again later.",
                end_session=True
            )
    
    def _get_or_create_session(self, request: USSDRequest) -> USSDSession:
        """Get existing session or create new one"""
        if request.session_id in ussd_sessions:
            return ussd_sessions[request.session_id]
        else:
            return USSDSession(request.session_id, request.phone_number, request.service_code)
    
    def _process_user_input(self, session: USSDSession, user_input: str) -> USSDResponse:
        """Process user input based on current session step"""
        user_input = user_input.strip()
        
        # Handle main menu
        if session.step == 0:
            return self._handle_main_menu(session, user_input)
        
        # Handle credit scoring flow
        elif session.step in [1, 2, 3, 4, 5]:
            return self._handle_data_collection(session, user_input)
        
        # Handle score calculation
        elif session.step == 6:
            return self._handle_score_calculation(session)
        
        else:
            return USSDResponse(
                session_id=session.session_id,
                text="Invalid session state. Please start over.",
                end_session=True
            )
    
    def _handle_main_menu(self, session: USSDSession, user_input: str) -> USSDResponse:
        """Handle main menu selection"""
        if user_input == "1":  # Check Credit Score
            session.step = 1
            return USSDResponse(
                session_id=session.session_id,
                text=self.menu_flow[1]["text"]
            )
        elif user_input == "2":  # Apply for Loan
            return USSDResponse(
                session_id=session.session_id,
                text="Loan application feature coming soon. Thank you for your interest!",
                end_session=True
            )
        elif user_input == "3":  # Help
            return USSDResponse(
                session_id=session.session_id,
                text="Kifaa Credit Scoring helps you check your creditworthiness. For support, call +1-800-KIFAA or visit www.kifaa.com",
                end_session=True
            )
        elif user_input == "4":  # Exit
            return USSDResponse(
                session_id=session.session_id,
                text="Thank you for using Kifaa Credit Scoring!",
                end_session=True
            )
        else:
            return USSDResponse(
                session_id=session.session_id,
                text="Invalid option. Please try again.\n" + self.menu_flow[0]["text"]
            )
    
    def _handle_data_collection(self, session: USSDSession, user_input: str) -> USSDResponse:
        """Handle data collection steps"""
        current_step = self.menu_flow[session.step]
        field_name = current_step.get("field")
        
        # Validate input
        validation_result = self._validate_input(user_input, current_step)
        if not validation_result["valid"]:
            return USSDResponse(
                session_id=session.session_id,
                text=f"Invalid input: {validation_result['error']}\n\n{current_step['text']}"
            )
        
        # Store validated data
        if "mapping" in current_step:
            session.user_data[field_name] = current_step["mapping"][user_input]
        else:
            session.user_data[field_name] = validation_result["value"]
        
        # Move to next step
        session.step += 1
        
        if session.step in self.menu_flow:
            next_step = self.menu_flow[session.step]
            if "action" in next_step:
                return self._handle_score_calculation(session)
            else:
                return USSDResponse(
                    session_id=session.session_id,
                    text=next_step["text"]
                )
        else:
            return USSDResponse(
                session_id=session.session_id,
                text="Data collection complete. Processing...",
                end_session=True
            )
    
    def _validate_input(self, user_input: str, step_config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user input based on step configuration"""
        validation_type = step_config.get("validation")
        
        if "options" in step_config:
            # Validate against allowed options
            if user_input in step_config["options"]:
                return {"valid": True, "value": user_input}
            else:
                return {"valid": False, "error": f"Please select from: {', '.join(step_config['options'])}"}
        
        elif validation_type == "numeric":
            try:
                value = float(user_input)
                min_val = step_config.get("min_value")
                max_val = step_config.get("max_value")
                
                if min_val is not None and value < min_val:
                    return {"valid": False, "error": f"Value must be at least {min_val}"}
                if max_val is not None and value > max_val:
                    return {"valid": False, "error": f"Value must be at most {max_val}"}
                
                return {"valid": True, "value": value}
            except ValueError:
                return {"valid": False, "error": "Please enter a valid number"}
        
        else:
            # Default: accept any non-empty input
            if user_input.strip():
                return {"valid": True, "value": user_input.strip()}
            else:
                return {"valid": False, "error": "Input cannot be empty"}
    
    def _handle_score_calculation(self, session: USSDSession) -> USSDResponse:
        """Handle credit score calculation"""
        try:
            # Convert USSD data to API format
            api_payload = self._convert_to_api_payload(session)
            
            # Call credit scoring API (mock for now)
            score_result = self._call_scoring_api(api_payload)
            
            # Format response
            response_text = self._format_score_response(score_result)
            
            return USSDResponse(
                session_id=session.session_id,
                text=response_text,
                end_session=True
            )
            
        except Exception as e:
            logger.error(f"Score calculation failed: {str(e)}")
            return USSDResponse(
                session_id=session.session_id,
                text="Unable to calculate score at this time. Please try again later.",
                end_session=True
            )
    
    def _convert_to_api_payload(self, session: USSDSession) -> Dict[str, Any]:
        """Convert USSD session data to API payload format"""
        # Generate user ID from phone number
        user_id = f"ussd_{session.phone_number.replace('+', '').replace('-', '')}"
        
        # Map employment status to employment length
        employment_mapping = {
            "employed": 5,
            "self_employed": 3,
            "unemployed": 0,
            "student": 1
        }
        
        payload = {
            "user_id": user_id,
            "age": session.user_data.get("age", 30),
            "income": session.user_data.get("income", 50000) * 12,  # Convert monthly to annual
            "credit_history_length": session.user_data.get("credit_history_length", 5),
            "employment_length": employment_mapping.get(session.user_data.get("employment_status"), 2),
            "region": session.user_data.get("region", "urban"),
            # Set defaults for missing fields
            "debt_to_income_ratio": 0.3,
            "number_of_accounts": 3,
            "payment_history_score": 0.8,
            "credit_utilization": 0.3,
            "recent_inquiries": 1
        }
        
        return payload
    
    def _call_scoring_api(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Call the credit scoring API (mock implementation)"""
        # In production, this would make an HTTP request to the scoring API
        # For now, we'll use the scoring logic directly
        
        from credit_scoring import CreditScorer
        from utils import explain_score
        
        scorer = CreditScorer()
        score_result = scorer.score_user_profile(payload)
        
        # Add explanation
        explanation = explain_score(payload, score_result["score"], model=scorer.model)
        score_result["explanation"] = explanation
        
        return score_result
    
    def _format_score_response(self, score_result: Dict[str, Any]) -> str:
        """Format score result for USSD display"""
        score = score_result.get("score", 0)
        explanation = score_result.get("explanation", {})
        
        # Get score category
        if score >= 800:
            category = "Excellent"
        elif score >= 700:
            category = "Good"
        elif score >= 600:
            category = "Fair"
        elif score >= 500:
            category = "Poor"
        else:
            category = "Very Poor"
        
        response = f"Your Credit Score: {score:.0f}\n"
        response += f"Category: {category}\n\n"
        
        # Add top factors if available
        top_factors = explanation.get("top_factors", [])
        if top_factors:
            response += "Key factors:\n"
            for i, factor in enumerate(top_factors[:2]):  # Limit to 2 for USSD
                impact = "+" if factor.get("impact") == "positive" else "-"
                response += f"{impact} {factor.get('factor', 'Unknown')}\n"
        
        response += "\nThank you for using Kifaa!"
        
        return response
    
    def _cleanup_session(self, session_id: str):
        """Clean up expired session"""
        if session_id in ussd_sessions:
            del ussd_sessions[session_id]
    
    def cleanup_expired_sessions(self):
        """Clean up all expired sessions"""
        expired_sessions = []
        for session_id, session in ussd_sessions.items():
            if session.is_expired():
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            self._cleanup_session(session_id)
        
        logger.info(f"Cleaned up {len(expired_sessions)} expired USSD sessions")

# FastAPI app for USSD gateway
ussd_app = FastAPI(title="Kifaa USSD Gateway", version="1.0.0")
gateway = USSDGateway()

@ussd_app.post("/ussd", response_model=USSDResponse)
async def handle_ussd_request(request: USSDRequest) -> USSDResponse:
    """
    Handle incoming USSD requests
    
    This endpoint receives USSD requests from telecom providers
    and manages the interactive credit scoring flow.
    """
    logger.info(f"USSD request from {request.phone_number}: {request.text}")
    
    response = gateway.process_ussd_request(request)
    
    logger.info(f"USSD response to {request.phone_number}: {response.text[:50]}...")
    
    return response

@ussd_app.get("/ussd/sessions")
async def get_active_sessions() -> Dict[str, Any]:
    """Get information about active USSD sessions"""
    active_sessions = []
    for session_id, session in ussd_sessions.items():
        if not session.is_expired():
            active_sessions.append({
                "session_id": session_id,
                "phone_number": session.phone_number,
                "step": session.step,
                "created_at": session.created_at.isoformat(),
                "last_activity": session.last_activity.isoformat()
            })
    
    return {
        "active_sessions": len(active_sessions),
        "sessions": active_sessions
    }

@ussd_app.delete("/ussd/sessions")
async def cleanup_sessions() -> Dict[str, str]:
    """Manually trigger session cleanup"""
    gateway.cleanup_expired_sessions()
    return {"message": "Session cleanup completed"}

@ussd_app.get("/ussd/health")
async def ussd_health_check():
    """Health check for USSD gateway"""
    return {
        "status": "healthy",
        "active_sessions": len([s for s in ussd_sessions.values() if not s.is_expired()]),
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(ussd_app, host="0.0.0.0", port=8001)

