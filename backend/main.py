from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import random

app = FastAPI(title="ScholarAID Pay Backend", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database of pre-approved students
# In production, this would be a real database
PRE_APPROVED_STUDENTS = {
    "GAEXAMPLEADDRESS1": {"name": "Juan Dela Cruz", "score": 95},
    "GAEXAMPLEADDRESS2": {"name": "Maria Santos", "score": 88},
    # Add a test wallet address for testing
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF": {"name": "Test Student", "score": 92},
}

class EligibilityRequest(BaseModel):
    wallet_address: str

class EligibilityResponse(BaseModel):
    eligible: bool
    message: str
    score: int = 0

@app.get("/")
async def root():
    return {"message": "ScholarAID Pay Backend API"}

@app.post("/api/verify-eligibility", response_model=EligibilityResponse)
async def verify_eligibility(request: EligibilityRequest):
    """
    Verify if a student's wallet address is eligible for scholarship.
    Simulates AI readiness score check.
    """
    wallet_address = request.wallet_address

    # Check if student is pre-approved
    if wallet_address in PRE_APPROVED_STUDENTS:
        student_data = PRE_APPROVED_STUDENTS[wallet_address]
        # Simulate AI score check (in real implementation, call AI service)
        ai_score = student_data["score"] + random.randint(-5, 5)  # Add some variance

        if ai_score >= 80:  # Eligibility threshold
            return EligibilityResponse(
                eligible=True,
                message=f"Eligible! AI Readiness Score: {ai_score}%",
                score=ai_score
            )
        else:
            return EligibilityResponse(
                eligible=False,
                message=f"Not eligible. AI Readiness Score: {ai_score}% (minimum 80% required)",
                score=ai_score
            )
    else:
        return EligibilityResponse(
            eligible=False,
            message="Wallet address not found in pre-approved list",
            score=0
        )

@app.get("/api/scholarships")
async def get_scholarships():
    """
    Get available scholarships metadata.
    """
    return {
        "scholarships": [
            {
                "id": "pup-scholarship-2024",
                "name": "PUP Merit Scholarship 2024",
                "ngo": "Philippine University Partnership",
                "amount": "10 USDC",
                "description": "Merit-based scholarship for outstanding students",
                "requirements": "Minimum 80% AI readiness score"
            }
        ]
    }

@app.get("/api/student/{wallet_address}")
async def get_student_info(wallet_address: str):
    """
    Get student information by wallet address.
    """
    if wallet_address in PRE_APPROVED_STUDENTS:
        return PRE_APPROVED_STUDENTS[wallet_address]
    else:
        raise HTTPException(status_code=404, detail="Student not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)