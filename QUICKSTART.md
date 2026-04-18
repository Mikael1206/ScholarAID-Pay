# ScholarAID Pay - Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js & npm
- Python 3.8+
- Freighter wallet installed (browser extension)
- Git

### Step 1: Clone & Navigate
```bash
cd c:\Users\User\Desktop\Stellar
```

### Step 2: Start Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at: `http://localhost:8000`

### Step 3: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Step 4: Configure Contract ID

Edit `frontend/src/ScholarshipCard.js`:

```javascript
const CONTRACT_ID = 'your_contract_id_from_deployment'
```

Find your contract ID from deployment output:
```bash
stellar contract deploy --wasm contract/target/wasm32-unknown-unknown/release/scholaraid_pay.wasm --source my-key --network testnet
```

### Step 5: Add Test Students

Edit `backend/main.py` to add pre-approved addresses:

```python
PRE_APPROVED_STUDENTS = {
    "GABC123...": {"name": "Test Student 1", "score": 95},
    "GXYZ456...": {"name": "Test Student 2", "score": 88},
}
```

### Step 6: Test the Flow

1. Open http://localhost:5173 in browser
2. Click "Connect Freighter Wallet"
3. Authorize connection in Freighter
4. Click "Verify Eligibility" (should show eligible if in pre-approved list)
5. Click "Claim Scholarship"
6. Sign transaction in Freighter
7. Wait for confirmation

---

## Troubleshooting

### Error: Backend Not Running
```
Error: Connection refused
```
**Solution:** Make sure backend is running on port 8000
```bash
cd backend && python main.py
```

### Error: Freighter Not Detected
```
Error: Freighter wallet not detected
```
**Solution:** Install Freighter extension or use Albedo wallet

### Error: Contract ID Not Found
```
Error: claiming scholarship: Contract not found
```
**Solution:** Update `CONTRACT_ID` in `frontend/src/ScholarshipCard.js`

### Error: CORS Blocked
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Backend CORS already configured, check if on `http://localhost:5173`

---

## File Structure Reference

```
Stellar/
├── frontend/               # React app
│   ├── src/
│   │   ├── App.js         # Main wallet connection
│   │   ├── ScholarshipCard.js  # Claim component
│   │   └── ...
│   └── package.json
├── backend/               # FastAPI server
│   ├── main.py           # API endpoints
│   └── requirements.txt
├── contract/             # Soroban contract
│   ├── src/
│   │   └── lib.rs        # Smart contract
│   └── ...
└── README.md
```

---

## Development Commands

### Frontend
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend
```bash
cd backend
python main.py     # Start server
# Add to requirements.txt and run: pip install -r requirements.txt
```

### Contract
```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/scholaraid_pay.wasm --source my-key --network testnet
```

---

## Configuration Files

### Frontend `.env.local`
```
VITE_CONTRACT_ID=your_contract_id
VITE_BACKEND_URL=http://localhost:8000
```

### Backend `.env`
```
STELLAR_NETWORK=TESTNET
CORS_ORIGINS=["http://localhost:5173"]
```

---

## API Endpoints

### Verify Eligibility
```bash
curl -X POST http://localhost:8000/api/verify-eligibility \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"GABC123..."}'
```

### Get Scholarships
```bash
curl http://localhost:8000/api/scholarships
```

### Get Student Info
```bash
curl http://localhost:8000/api/student/GABC123...
```

---

## Next Steps

1. ✅ Backend running
2. ✅ Frontend running
3. ✅ Wallet connected
4. ✅ Student eligible
5. ✅ Scholarship claimed
6. ⏭️ Deploy to production
7. ⏭️ Add real database
8. ⏭️ Implement admin dashboard

---

## Production Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy 'dist' folder to Vercel
```

### Backend (Heroku/Railway)
```bash
cd backend
# Push to cloud platform with Procfile
```

### Contract (Mainnet)
```bash
stellar contract deploy \
  --wasm contract/target/wasm32-unknown-unknown/release/scholaraid_pay.wasm \
  --source my-key \
  --network public  # Change to mainnet
```

---

## Support

- Docs: See `README.md`, `INTEGRATION_GUIDE.md`, `API_DOCUMENTATION.md`
- Contract: See `contract/README.md`
- Issues: Check troubleshooting section above