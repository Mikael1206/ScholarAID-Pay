# ScholarAID Pay - Full-Stack MVP Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  - Freighter/Albedo Wallet Connection                           │
│  - Scholarship Claim UI (Tailwind CSS)                          │
│  - Soroban Contract Interaction                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────────────┐
│                    Backend (FastAPI)                            │
│  - Student Eligibility Verification                             │
│  - AI Readiness Score Simulation                                │
│  - Scholarship Metadata Management                              │
└────────────────────┬────────────────────────────────────────────┘
                     │ Soroban RPC
┌────────────────────▼────────────────────────────────────────────┐
│              Blockchain (Soroban Testnet)                       │
│  - Smart Contract Deployment                                    │
│  - Fund Disbursement Logic                                      │
│  - On-Chain State Management                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow: Student Claims Scholarship

### 1. Connect Wallet
```
Student → Clicks "Connect Freighter Wallet"
         → window.freighterApi.connectWallet()
         → Returns: Stellar Public Key (GABC...)
```

### 2. Verify Eligibility
```
Frontend → POST /api/verify-eligibility
         → { wallet_address: "GABC..." }
         
Backend  → Checks pre-approved list
         → Simulates AI Readiness Score
         → Returns: { eligible: true, score: 92 }
```

### 3. Claim Scholarship
```
Frontend → Creates Soroban Transaction
         → contract.call('claim_scholarship', publicKey, amount)
         → Prepares transaction for testnet
         
Student  → Signs with Freighter wallet
         → window.freighterApi.signTransaction(XDR)
         
Frontend → Sends signed transaction to Soroban RPC
         → Transaction confirmed on-chain
         
Backend  → (Optional) Logs transaction on database
Contract → Updates student status to "PAID"
         → Emits "PAID" event with disbursement amount
```

## File Structure

```
ScholarAID Pay/
├── frontend/
│   ├── src/
│   │   ├── main.js                 # Vite entry point
│   │   ├── App.js                  # Main component with wallet connection
│   │   ├── ScholarshipCard.js       # Scholarship claim card component
│   │   └── index.css               # Tailwind CSS
│   ├── index.html                  # HTML entry
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── vite.config.ts              # Vite configuration
│   └── package.json                # Frontend dependencies
│
├── backend/
│   ├── main.py                     # FastAPI server with endpoints
│   └── requirements.txt            # Python dependencies
│
└── contract/
    ├── src/
    │   ├── lib.rs                  # Soroban contract logic
    │   └── test.rs                 # Contract tests
    ├── Cargo.toml                  # Rust dependencies
    └── README.md                   # Contract documentation
```

## Component Communication

### Frontend to Backend

**Request: Verify Eligibility**
```javascript
const response = await fetch('http://localhost:8000/api/verify-eligibility', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ wallet_address: publicKey })
})
```

**Response:**
```json
{
  "eligible": true,
  "message": "Eligible! AI Readiness Score: 92%",
  "score": 92
}
```

### Frontend to Blockchain

**Build Transaction:**
```javascript
const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org')
const contract = new Contract(CONTRACT_ID)
const account = await server.getAccount(publicKey)

const tx = new SorobanRpc.TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(contract.call('claim_scholarship', publicKey, 10000000))
  .setTimeout(30)
  .build()
```

**Prepare & Sign:**
```javascript
const preparedTx = await server.prepareTransaction(tx)
const signedXDR = await window.freighterApi.signTransaction(preparedTx.toXDR(), 'TESTNET')
const signedTx = SorobanRpc.TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
```

**Submit:**
```javascript
const response = await server.sendTransaction(signedTx)
```

## Running the MVP

### 1. Start Backend
```bash
cd backend
python main.py
# API running at http://localhost:8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

### 3. Contract is Pre-Deployed
- No need to redeploy; contract is already on testnet
- Replace `CONTRACT_ID` in `frontend/src/ScholarshipCard.js` with your contract address

## Testing Workflow

1. **Open Frontend**: http://localhost:5173
2. **Install Freighter**: If not already installed, add the browser extension
3. **Import Testnet Account**: Create or import a funded testnet account to Freighter
4. **Connect Wallet**: Click "Connect Freighter Wallet" → Authorize
5. **Verify Eligibility**: Click "Verify Eligibility" (backend returns mock score)
6. **Claim Scholarship**: If eligible, click "Claim Scholarship" → Sign with Freighter → Confirm

## Environment Variables

### Frontend (.env.local)
```
VITE_CONTRACT_ID=your_deployed_contract_id
VITE_BACKEND_URL=http://localhost:8000
VITE_SOROBAN_RPC=https://soroban-testnet.stellar.org
```

### Backend (.env)
```
DATABASE_URL=sqlite:///scholaraid.db
STELLAR_NETWORK=TESTNET
ADMIN_KEY=your_admin_secret_key
```

## Pre-Approved Students

Update `backend/main.py` with real student addresses:

```python
PRE_APPROVED_STUDENTS = {
    "GAEXAMPLE1...": {"name": "Student A", "score": 95},
    "GAEXAMPLE2...": {"name": "Student B", "score": 88},
    # Add more...
}
```

## Security Notes

- ✅ Only approved wallets can claim scholarships
- ✅ Double-spend protection via smart contract status tracking
- ✅ Transaction signing happens in user's wallet (private keys never exposed)
- ✅ CORS enabled only for localhost in development
- ⚠️ Set `allow_origins` to production domain in production

## Next Steps

1. Deploy contract to mainnet
2. Update contract ID in frontend
3. Add real database for student records
4. Implement email notifications
5. Add admin dashboard
6. Deploy backend to cloud (AWS/GCP/Azure)
7. Deploy frontend to CDN