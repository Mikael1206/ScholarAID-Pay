import React, { useState, useEffect } from 'react'
import ScholarshipCard from './ScholarshipCard.jsx'

function App() {
  const [publicKey, setPublicKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [hasFreighter, setHasFreighter] = useState(false)

  useEffect(() => {
    const checkFreighter = () => {
      if (typeof window !== 'undefined') {
        const hasFreighter =
          window.freighterApi ||
          window.freighter ||
          (window.chrome && window.chrome.runtime && window.chrome.runtime.connect) ||
          false

        setHasFreighter(!!hasFreighter)
      }
    }

    checkFreighter()

    // Check again after a short delay in case extension loads slowly
    const timeout = setTimeout(checkFreighter, 2000)

    return () => clearTimeout(timeout)
  }, [])

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window.freighterApi || window.freighter)) {
      try {
        let connection

        if (window.freighterApi && window.freighterApi.connect) {
          connection = await window.freighterApi.connect()
        } else if (window.freighterApi && window.freighterApi.connectWallet) {
          connection = await window.freighterApi.connectWallet()
        } else if (window.freighter && window.freighter.connect) {
          connection = await window.freighter.connect()
        }

        let address

        if (connection?.publicKey) {
          address = connection.publicKey
        } else if (connection?.address) {
          address = connection.address
        } else if (window.freighterApi && window.freighterApi.getPublicKey) {
          address = await window.freighterApi.getPublicKey()
        } else if (window.freighter && window.freighter.getPublicKey) {
          address = await window.freighter.getPublicKey()
        }

        if (!address) {
          throw new Error('Unable to retrieve public key from Freighter')
        }

        setPublicKey(address)
        setIsConnected(true)
      } catch (error) {
        console.error('Wallet connection failed:', error)
        alert('Please install the Freighter wallet extension and allow access.')
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
    <div className="min-h-screen bg-gradient-to-br from-pup-blue via-[#002244] to-pup-red text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:px-8 lg:px-12">
        <header className="text-center mb-10">
          <p className="text-sm uppercase tracking-[0.35em] text-pup-gold opacity-80 mb-4">Scholarship portal</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            ScholarAID Pay
          </h1>
          <p className="mt-4 text-base sm:text-xl max-w-3xl mx-auto text-slate-100/90 leading-relaxed">
            Connect your Freighter wallet, verify scholarship eligibility, and claim funds on the Stellar
            testnet.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] items-start">
          <div className="rounded-[32px] bg-slate-950/70 border border-white/10 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-semibold text-pup-gold">Welcome to ScholarAID Pay</h2>
                <p className="text-slate-200/90 leading-relaxed">
                  This portal lets you safely connect your Freighter wallet and claim scholarship support from the
                  university partner program.
                </p>
                <div className="rounded-2xl bg-blue-600/10 border border-blue-500/20 p-4 mt-4">
                  <p className="text-blue-100 text-sm leading-relaxed">
                    <strong>Testing:</strong> Create a test wallet in Freighter or use the test address
                    <code className="bg-slate-800 px-2 py-1 rounded text-xs ml-2">GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF</code>
                    for eligibility testing.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 border border-white/10 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-300 mb-2">Network</p>
                  <p className="text-lg font-semibold">Stellar Testnet</p>
                </div>
                <div className="rounded-3xl bg-white/10 border border-white/10 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-300 mb-2">Token</p>
                  <p className="text-lg font-semibold">USDC</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6">
                {!hasFreighter ? (
                  <div className="rounded-3xl bg-red-600/10 border border-red-500/20 p-5 text-red-100">
                    <p className="font-semibold mb-2">Freighter wallet not detected</p>
                    <p className="text-sm leading-relaxed mb-4">
                      Install the Freighter browser extension, then refresh this page and click Connect again.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center justify-center rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Refresh Page
                    </button>
                  </div>
                ) : !isConnected ? (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="w-full inline-flex items-center justify-center rounded-full bg-pup-gold px-6 py-4 text-sm font-semibold text-pup-blue shadow-lg shadow-pup-blue/20 transition hover:bg-yellow-400"
                  >
                    Connect Freighter Wallet
                  </button>
                ) : (
                  <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-5">
                    <p className="text-slate-300 mb-3">Connected wallet</p>
                    <p className="font-semibold break-words text-white">{publicKey}</p>
                    <button
                      type="button"
                      onClick={disconnectWallet}
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-white/10 border border-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <ScholarshipCard publicKey={publicKey} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App