
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI()

class UserProfile(BaseModel):
    user_id: str
    age: int
    income: float
    credit_history_length: int
    # Add more relevant fields as per the actual model

@app.post("/score-user")
async def score_user(profile: UserProfile) -> Dict[str, Any]:
    # Placeholder for actual scoring logic
    # This will be replaced by a call to credit_scoring.py
    try:
        score = profile.income / 1000 + profile.credit_history_length * 10 - profile.age # Dummy scoring logic
        explanation = {"reason": "Dummy explanation based on income, credit history, and age"}
        return {"user_id": profile.user_id, "score": score, "explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")



