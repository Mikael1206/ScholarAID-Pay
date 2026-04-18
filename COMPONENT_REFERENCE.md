# Component Code Reference

## App.js - Main Application Component

This component handles Freighter wallet connection and renders the main interface.

```javascript
import { useState } from 'react'
import ScholarshipCard from './ScholarshipCard.js'

function App() {
  const [publicKey, setPublicKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Connect to Freighter wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.freighterApi) {
      try {
        // Freighter automatically handles testnet/mainnet
        const { address } = await window.freighterApi.connectWallet()
        setPublicKey(address)
        setIsConnected(true)
      } catch (error) {
        console.error('Wallet connection failed:', error)
        alert('Please install Freighter wallet extension')
      }
    } else {
      alert('Freighter wallet not detected. Please install it.')
    }
  }

  const disconnectWallet = () => {
    setPublicKey('')
    setIsConnected(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pup-blue to-pup-red">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pup-gold mb-2">ScholarAID Pay</h1>
          <p className="text-white text-lg">Empowering Education Through Blockchain</p>
        </header>

        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="w-full bg-pup-gold text-pup-blue font-semibold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Connect Freighter Wallet
            </button>
          ) : (
            <div className="text-center">
              <p className="text-white mb-4">
                Connected: {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
              </p>
              <button
                onClick={disconnectWallet}
                className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="max-w-2xl mx-auto">
            <ScholarshipCard publicKey={publicKey} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
```

---

## ScholarshipCard.js - Claim Component

This component handles eligibility verification and scholarship claiming.

```javascript
import { useState } from 'react'
import { Contract, SorobanRpc, Networks } from '@stellar/stellar-sdk'

const CONTRACT_ID = 'your_contract_id_here' // REPLACE WITH YOUR CONTRACT ID
const BACKEND_URL = 'http://localhost:8000'
const SOROBAN_RPC = 'https://soroban-testnet.stellar.org'

function ScholarshipCard({ publicKey }) {
  const [isEligible, setIsEligible] = useState(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [message, setMessage] = useState('')
  const [score, setScore] = useState(0)

  // Step 1: Check eligibility with backend
  const checkEligibility = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/verify-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: publicKey }),
      })

      const data = await response.json()
      setIsEligible(data.eligible)
      setScore(data.score)
      setMessage(data.message)
    } catch (error) {
      setMessage('Error checking eligibility')
      console.error(error)
    }
  }

  // Step 2: Claim scholarship via Soroban contract
  const claimScholarship = async () => {
    setIsClaiming(true)
    setMessage('Processing...')

    try {
      // Initialize Soroban RPC server
      const server = new SorobanRpc.Server(SOROBAN_RPC)

      // Get account info
      const account = await server.getAccount(publicKey)

      // Create contract instance
      const contract = new Contract(CONTRACT_ID)

      // Build transaction with contract call
      const amount = 10000000 // 10 USDC (7 decimals)
      const tx = new SorobanRpc.TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call('claim_scholarship', publicKey, amount))
        .setTimeout(30)
        .build()

      // Prepare transaction for Soroban
      const preparedTx = await server.prepareTransaction(tx)

      // Sign with Freighter wallet
      if (typeof window !== 'undefined' && window.freighterApi) {
        const signedXDR = await window.freighterApi.signTransaction(
          preparedTx.toXDR(),
          'TESTNET'
        )
        const signedTx = SorobanRpc.TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)

        // Send to Soroban
        const sendResponse = await server.sendTransaction(signedTx)
        
        // Poll for transaction confirmation
        let attempts = 0
        while (attempts < 30) {
          const status = await server.getTransaction(sendResponse.hash)
          if (status.isSuccess()) {
            setMessage('✅ Scholarship claimed successfully!')
            setIsEligible(false)
            break
          } else if (status.isNotYetSubmitted() || status.isPending()) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            attempts++
          } else {
            throw new Error('Transaction failed')
          }
        }
      } else {
        throw new Error('Freighter wallet not available')
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
      console.error(error)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-pup-gold mb-4">Scholarship Claim</h2>
      
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <p className="text-white mb-2">💰 Amount: <span className="font-bold">10 USDC</span></p>
        <p className="text-white mb-2">🏢 NGO: <span className="font-bold">Philippine University Partnership</span></p>
        <p className="text-white/70 text-sm">📋 Requirement: Minimum 80% AI Readiness Score</p>
      </div>

      {isEligible === null ? (
        <button
          onClick={checkEligibility}
          className="w-full bg-pup-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors mb-4"
        >
          🔍 Verify Eligibility
        </button>
      ) : isEligible ? (
        <div>
          <div className="mb-4 p-3 bg-green-500/20 rounded-lg border border-green-500/50">
            <p className="text-green-300 font-semibold">✅ Eligible for Scholarship</p>
            <p className="text-green-200 text-sm">Score: {score}%</p>
          </div>
          <button
            onClick={claimScholarship}
            disabled={isClaiming}
            className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? '⏳ Claiming...' : '🎉 Claim Scholarship'}
          </button>
        </div>
      ) : (
        <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/50">
          <p className="text-red-300 font-semibold">❌ Not Eligible</p>
          <p className="text-red-200 text-sm">Score: {score}% (minimum 80% required)</p>
        </div>
      )}

      {message && (
        <p className={`mt-4 text-center p-3 rounded-lg ${
          message.includes('Error') || message.includes('❌')
            ? 'text-red-300 bg-red-500/10'
            : 'text-green-300 bg-green-500/10'
        }`}>
          {message}
        </p>
      )}
    </div>
  )
}

export default ScholarshipCard
```

---

## Key Integration Points

### 1. Wallet Connection (Freighter API)
```javascript
// Access Freighter through window object
window.freighterApi.connectWallet()
window.freighterApi.signTransaction(xdr, network)
```

### 2. Backend Communication (Fetch API)
```javascript
// Call FastAPI endpoint for eligibility
fetch('http://localhost:8000/api/verify-eligibility', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ wallet_address: publicKey })
})
```

### 3. Soroban Contract Interaction (stellar-sdk)
```javascript
// Build and send contract calls
const contract = new Contract(CONTRACT_ID)
const operation = contract.call('claim_scholarship', publicKey, amount)
const tx = new SorobanRpc.TransactionBuilder(account, {...})
  .addOperation(operation)
  .build()
```

---

## Tailwind CSS Classes Used

```css
/* Layout */
.min-h-screen        /* Full viewport height */
.container           /* Responsive max-width */
.mx-auto             /* Center horizontally */
.px-4 py-8           /* Padding */

/* Colors (Philippines-inspired) */
.bg-pup-blue         /* PUP Blue: #003366 */
.bg-pup-red          /* PUP Red: #8B0000 */
.text-pup-gold       /* PUP Gold: #FFD700 */
.bg-gradient-to-br   /* Gradient background */

/* Components */
.rounded-lg          /* Rounded corners */
.shadow-lg           /* Box shadow */
.backdrop-blur-sm    /* Glass morphism */
.transition-colors   /* Smooth color transitions */
.disabled:opacity-50 /* Disabled state */

/* Responsive */
.max-w-md            /* Mobile-first width */
.max-w-2xl           /* Tablet width */
```

---

## Error Handling Pattern

```javascript
try {
  // Attempt operation
  const response = await fetch(...)
  const data = await response.json()
  
  // Update state
  setResult(data)
  setMessage('Success')
} catch (error) {
  // Handle error
  console.error(error)
  setMessage(`Error: ${error.message}`)
} finally {
  // Cleanup
  setIsLoading(false)
}
```

---

## Transaction Flow Diagram

```
┌─ User clicks "Claim"
│
├─ Get account info from Soroban RPC
├─ Build transaction with contract.call()
├─ Prepare transaction for Soroban
├─ Sign with Freighter wallet
│   └─ User approves in wallet
├─ Send signed transaction to Soroban RPC
├─ Poll for confirmation
│   └─ Check status every 1 second
└─ Display result

Success: "✅ Scholarship claimed successfully!"
Failure: "❌ Error: [error message]"
```

---

## Environment Variables

```javascript
// In frontend components, use:
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const SOROBAN_RPC = import.meta.env.VITE_SOROBAN_RPC
```

Create `.env.local`:
```
VITE_CONTRACT_ID=CABC123...
VITE_BACKEND_URL=http://localhost:8000
VITE_SOROBAN_RPC=https://soroban-testnet.stellar.org
```

---

## Testing Components

### Mock Wallet (Development)
```javascript
// Simulate Freighter for testing
window.freighterApi = {
  connectWallet: async () => ({ address: 'GABC123...' }),
  signTransaction: async (xdr) => xdr
}
```

### Mock Backend (Testing)
```python
# Return hardcoded eligibility for testing
@app.post('/api/verify-eligibility')
async def verify_eligibility(request):
    return {
        'eligible': True,
        'score': 92,
        'message': 'Test: Eligible'
    }
```