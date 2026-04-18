# ScholarAID Pay - API Documentation

## Base URL
```
http://localhost:8000
```

## Endpoints

### 1. Health Check

**GET** `/`

Returns API health status.

**Response:**
```json
{
  "message": "ScholarAID Pay Backend API"
}
```

---

### 2. Verify Eligibility

**POST** `/api/verify-eligibility`

Verifies if a student's wallet address is eligible for scholarship disbursement. Includes AI readiness score simulation.

**Request Body:**
```json
{
  "wallet_address": "GABC123XYZ..."
}
```

**Response (Eligible):**
```json
{
  "eligible": true,
  "message": "Eligible! AI Readiness Score: 92%",
  "score": 92
}
```

**Response (Not Eligible):**
```json
{
  "eligible": false,
  "message": "Not eligible. AI Readiness Score: 75% (minimum 80% required)",
  "score": 75
}
```

**Response (Not Found):**
```json
{
  "eligible": false,
  "message": "Wallet address not found in pre-approved list",
  "score": 0
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request (invalid wallet address)
- `404` - Wallet not found

---

### 3. Get Scholarships

**GET** `/api/scholarships`

Returns list of available scholarships with metadata.

**Response:**
```json
{
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
```

**Status Codes:**
- `200` - OK

---

### 4. Get Student Info

**GET** `/api/student/{wallet_address}`

Retrieves information about a specific student by wallet address.

**Path Parameters:**
- `wallet_address` (string): Stellar wallet address

**Response (Success):**
```json
{
  "name": "Juan Dela Cruz",
  "score": 95
}
```

**Response (Not Found):**
```json
{
  "detail": "Student not found"
}
```

**Status Codes:**
- `200` - OK
- `404` - Student not found

---

## Integration Examples

### Example 1: React Component Integration

```javascript
import { useState } from 'react'

function EligibilityChecker({ publicKey }) {
  const [isEligible, setIsEligible] = useState(null)
  const [score, setScore] = useState(0)

  const checkEligibility = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/verify-eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: publicKey }),
      })

      const data = await response.json()
      setIsEligible(data.eligible)
      setScore(data.score)
    } catch (error) {
      console.error('Error checking eligibility:', error)
    }
  }

  return (
    <div>
      <button onClick={checkEligibility}>Check Eligibility</button>
      {isEligible !== null && (
        <div>
          <p>Status: {isEligible ? 'Eligible' : 'Not Eligible'}</p>
          <p>Score: {score}%</p>
        </div>
      )}
    </div>
  )
}
```

### Example 2: Fetch with Error Handling

```javascript
const verifyStudent = async (walletAddress) => {
  try {
    const response = await fetch('http://localhost:8000/api/verify-eligibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallet_address: walletAddress }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to verify student:', error)
    throw error
  }
}
```

### Example 3: Python Backend Usage

```python
import requests

def verify_student_eligibility(wallet_address):
    response = requests.post(
        'http://localhost:8000/api/verify-eligibility',
        json={'wallet_address': wallet_address}
    )
    return response.json()

# Usage
result = verify_student_eligibility('GABC123XYZ...')
print(f"Eligible: {result['eligible']}")
print(f"Score: {result['score']}")
```

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "detail": "Invalid wallet address format"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, add:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## CORS Headers

Frontend must be added to `CORS_ORIGINS` in backend `.env`:

```python
CORS_ORIGINS = ["http://localhost:5173", "https://yourdomain.com"]
```

---

## Authentication

Current implementation uses no authentication (development only).

For production, implement:
- JWT tokens for API access
- API keys for service-to-service communication
- OAuth2 for user authentication

---

## Schema

### EligibilityRequest
```python
{
    "wallet_address": str  # Stellar public key
}
```

### EligibilityResponse
```python
{
    "eligible": bool      # Eligibility status
    "message": str        # Human-readable message
    "score": int          # AI readiness score (0-100)
}
```

### StudentInfo
```python
{
    "name": str           # Student name
    "score": int          # AI readiness score
}
```

### Scholarship
```python
{
    "id": str             # Unique scholarship ID
    "name": str           # Scholarship name
    "ngo": str            # NGO/LGU name
    "amount": str         # Disbursement amount
    "description": str    # Description
    "requirements": str   # Requirements
}
```

---

## Testing

### Using cURL

```bash
# Health check
curl http://localhost:8000

# Verify eligibility
curl -X POST http://localhost:8000/api/verify-eligibility \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"GAEXAMPLEADDRESS1"}'

# Get scholarships
curl http://localhost:8000/api/scholarships

# Get student info
curl http://localhost:8000/api/student/GAEXAMPLEADDRESS1
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:8000/api/verify-eligibility`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "wallet_address": "GAEXAMPLEADDRESS1"
   }
   ```
5. Send

---

## Changelog

### v1.0.0
- Initial API release
- Eligibility verification endpoint
- Scholarship metadata endpoint
- Student info endpoint