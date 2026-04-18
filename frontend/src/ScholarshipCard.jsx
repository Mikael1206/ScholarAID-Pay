import React, { useState, useEffect } from 'react'
import { Contract, SorobanRpc, Networks } from '@stellar/stellar-sdk'

const CONTRACT_ID = 'your_contract_id_here' // Replace with your deployed contract ID
const BACKEND_URL = 'http://localhost:8000' // FastAPI backend URL

function ScholarshipCard({ scholarshipId, scholarshipType, walletAddress }) {
  const [status, setStatus] = useState('apply') // 'apply', 'claimed', 'incompatible'

  useEffect(() => {
    // Fetch from backend or contract if already claimed
    // Example: Call API to check claim status
    // If claimed, setStatus('claimed')
    // If FullTuition conflict, setStatus('incompatible')
  }, [scholarshipId, walletAddress])

  const buttonText = status === 'claimed' ? 'Claimed' : status === 'incompatible' ? 'Incompatible' : 'Apply'
  const disabled = status !== 'apply'

  const checkEligibility = async () => {
    if (!walletAddress) {
      setMessage('Please connect your Freighter wallet before verifying eligibility.')
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/verify-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: walletAddress }),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }

      const data = await response.json()
      setIsEligible(data.eligible)
      setMessage(data.message)
    } catch (error) {
      setMessage('Error checking eligibility. Make sure the backend is running on port 8000.')
      console.error(error)
    }
  }

  const claimScholarship = async () => {
    setIsClaiming(true)
    setMessage('')

    try {
      // Initialize Soroban RPC server
      const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org')

      // Create contract instance
      const contract = new Contract(CONTRACT_ID)

      // Get account info
      const account = await server.getAccount(walletAddress)

      // Build transaction
      const amount = 10000000 // 10 USDC (assuming 7 decimals)
      const tx = new SorobanRpc.TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call('claim_scholarship', walletAddress, amount))
        .setTimeout(30)
        .build()

      // Prepare transaction
      const preparedTx = await server.prepareTransaction(tx)

      // Sign with Freighter
      if (typeof window !== 'undefined' && window.freighterApi) {
        const signedXDR = await window.freighterApi.signTransaction(preparedTx.toXDR(), 'TESTNET')
        const signedTx = SorobanRpc.TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)

        // Send transaction
        const sendResponse = await server.sendTransaction(signedTx)

        setMessage('Scholarship claimed successfully!')
        setIsEligible(false) // Update status
      } else {
        throw new Error('Freighter wallet not available')
      }
    } catch (error) {
      setMessage(`Error claiming scholarship: ${error.message}`)
      console.error(error)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-pup-gold mb-4">Scholarship Claim</h2>
      <div className="mb-4">
        <p className="text-white mb-2">Amount: 10 USDC</p>
        <p className="text-white mb-4">NGO: Philippine University Partnership</p>
      </div>

      {status === 'apply' ? (
        <button
          onClick={checkEligibility}
          className="w-full bg-pup-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors mb-4"
        >
          Verify Eligibility
        </button>
      ) : (
        <div>
          {status === 'claimed' ? (
            <p className="text-green-400 mb-4">✓ Eligible for scholarship</p>
          ) : (
            <p className="text-red-400">✗ Not eligible for scholarship</p>
          )}
          <button
            onClick={claimScholarship}
            disabled={isClaiming}
            className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isClaiming ? 'Claiming...' : 'Claim Scholarship'}
          </button>
        </div>
      )}

      {message && (
        <p className={`mt-4 text-center ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

export default ScholarshipCard