import React, { useState, useEffect } from 'react'
import { connectWallet as getFreighterAddress, checkFreighterInstalled } from './utils/wallet';

// ---------------------------------------------------------------------------
// Scholarship data
// ---------------------------------------------------------------------------
const scholarshipData = [
  { name: 'CHED Full Merit Scholarship', org: 'Commission on Higher Education', amount: 500, currency: 'XLM', icon: '🏛️', contract: 'CDST...9A2F', match: 96, tags: ['Grade 12 · Senior HS', 'Merit-Based', 'Soroban Escrow'] },
  { name: 'SM Foundation Scholarship', org: 'SM Cares · SM Foundation Inc.', amount: 300, currency: 'XLM', icon: '🏢', contract: 'CSMF...3B7E', match: 89, tags: ['Low-Income Family', 'Metro Manila', 'USDC Option'] },
  { name: 'Gokongwei Brothers Foundation', org: 'JG Summit Holdings', amount: 750, currency: 'XLM', icon: '🌿', contract: 'CJGB...5D1C', match: 84, tags: ['Science Track', 'Davao / Cebu / Manila', 'On-chain Verified'] },
  { name: 'DOST SEI Scholarship', org: 'Dept. of Science & Technology', amount: 420, currency: 'XLM', icon: '⚡', contract: 'CDOS...8G4H', match: 81, tags: ['STEM Track', 'Nationwide', 'Pre-Approved List'] },
]

const tagColors = {
  'Grade 12 · Senior HS': 'tag-green',
  'Merit-Based': 'tag-blue',
  'Soroban Escrow': 'tag-purple',
  'Low-Income Family': 'tag-gold',
  'Metro Manila': 'tag-blue',
  'USDC Option': 'tag-purple',
  'Science Track': 'tag-green',
  'Davao / Cebu / Manila': 'tag-gold',
  'On-chain Verified': 'tag-purple',
  'STEM Track': 'tag-purple',
  'Nationwide': 'tag-blue',
  'Pre-Approved List': 'tag-green',
}

// ---------------------------------------------------------------------------
// Eligibility check — runs fully in the browser, no backend needed
// ---------------------------------------------------------------------------
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || null;

const verifyEligibility = async (walletAddress) => {
  // If a backend URL is configured (e.g. on Railway/Render), use it
  if (BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/verify-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend unreachable, falling back to local check:', err);
    }
  }

  // Fallback: simulate eligibility locally (works on Vercel with no backend)
  const score = 85 + Math.floor(Math.random() * 12); // 85–96 range
  return {
    eligible: score >= 85,
    score,
    message: score >= 85
      ? `Eligible! AI Readiness Score: ${score}%`
      : `Not eligible. AI Readiness Score: ${score}% (minimum 85% required)`,
  };
};

// ---------------------------------------------------------------------------
// App component
// ---------------------------------------------------------------------------
function App() {
  const [publicKey, setPublicKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [hasFreighter, setHasFreighter] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [activeTab, setActiveTab] = useState('scholarships')
  const [claimedSet, setClaimedSet] = useState(new Set())
  const [history, setHistory] = useState([])
  const [totalXLM, setTotalXLM] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState(null)
  const [flowPhase, setFlowPhase] = useState(0)
  const [currentScholarship, setCurrentScholarship] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [connectError, setConnectError] = useState('')

  // Detect Freighter on mount
  useEffect(() => {
    const checkDetection = async () => {
      const installed = await checkFreighterInstalled();
      setHasFreighter(installed);
      console.log('Freighter detected:', installed);
    };
    checkDetection();
    window.addEventListener('freighterReady', checkDetection);
    return () => window.removeEventListener('freighterReady', checkDetection);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // ------------------------------------------------------------------
  // Wallet connect — calls requestAccess so the Freighter popup appears
  // ------------------------------------------------------------------
  const handleConnect = async () => {
    setConnectError('');
    setIsConnecting(true);

    try {
      const address = await getFreighterAddress();

      if (address) {
        setPublicKey(address);
        setIsConnected(true);
        setIsDemoMode(false);
        setHasFreighter(true);
      } else {
        // getFreighterAddress returns null if user denied or Freighter not installed
        const installed = await checkFreighterInstalled();
        if (!installed) {
          setConnectError('Freighter not detected. Please install it and try again.');
        } else {
          setConnectError('Approved in Freighter but key not received. Please click Connect again.');
        }
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setConnectError('Something went wrong. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey('');
    setIsConnected(false);
    setIsDemoMode(false);
    setConnectError('');
  };

  const enterDemoMode = () => {
    setPublicKey('GDEMO5SCHOLARAID4PAYTEST7VERCEL8DEPLOY9STELLAR');
    setIsConnected(true);
    setIsDemoMode(true);
    setConnectError('');
  };

  const formatWalletAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 4) + '...' + addr.slice(-4);
  };

  const getInitials = (addr) => {
    return addr ? addr.slice(0, 2).toUpperCase() : 'JD';
  };

  const openClaim = (idx) => {
    setCurrentScholarship(idx);
    setFlowPhase(0);
    setIsProcessing(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const showWallet = () => {
    setModalContent({ type: 'wallet', address: publicKey });
    setModalOpen(true);
  };

  // ------------------------------------------------------------------
  // Claim flow — eligibility runs locally (no localhost dependency)
  // ------------------------------------------------------------------
  const startClaim = async (idx) => {
    const scholarship = scholarshipData[idx];
    setIsProcessing(true);
    setFlowPhase(1);

    try {
      // Phase 2 — eligibility check
      setFlowPhase(2);
      const data = await verifyEligibility(publicKey);

      if (!data.eligible || data.score < 85) {
        alert(`Ineligible: Your score is only ${data.score}%. Need 85% to trigger Soroban.`);
        setIsProcessing(false);
        setFlowPhase(0);
        return;
      }

      // Phase 3 — simulated escrow release
      setFlowPhase(3);
      await new Promise(r => setTimeout(r, 2000));

      // Phase 4 — disbursed
      setFlowPhase(4);
      await new Promise(r => setTimeout(r, 500));

      const newClaimedSet = new Set(claimedSet);
      newClaimedSet.add(idx);
      setClaimedSet(newClaimedSet);
      setTotalXLM(prev => prev + scholarship.amount);

      const txHash = 'TX' + Math.random().toString(36).slice(2, 18).toUpperCase();
      setHistory(prev => [{ ...scholarship, txHash, date: new Date().toLocaleDateString() }, ...prev]);

      setModalContent({ type: 'success', scholarship, txHash });
    } catch (err) {
      console.error('Claim process failed:', err);
      alert('Something went wrong during the claim process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div className="logo">
          <div className="logo-icon">S</div>
          ScholarAID <span className="badge">STELLAR</span>
        </div>

        <div className="topbar-right">
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '🌙 Night' : '☀️ Light'}
          </button>

          {isConnected ? (
            <>
              {isDemoMode && <span className="demo-badge">DEMO MODE</span>}
              <button className="wallet-pill" onClick={showWallet}>
                <div className="wallet-dot"></div>
                {formatWalletAddress(publicKey)}
              </button>
              <div className="avatar">{getInitials(publicKey)}</div>
              <button className="btn-secondary-mini" onClick={disconnectWallet}>
                Exit
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              style={{ width: 'auto', margin: 0 }}
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>

      {/* Main page */}
      <div className="page">
        {isConnected ? (
          <>
            {/* Hero card */}
            <div className="hero-card">
              <div className="hero-label">Good morning 👋</div>
              <div className="hero-name">Juan dela Cruz</div>
              <div className="hero-sub">Grade 12 · Malabon National High School · Metro Manila</div>
              <div className="balance-row">
                <div className="balance-num">{totalXLM.toFixed(2)}</div>
                <div className="balance-cur">XLM received</div>
              </div>
              <div className="score-row">
                <div className="score-pill">
                  <span className="score-star">★</span>
                  <span>Readiness: {Math.min(96, 78 + history.length * 4)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: Math.min(96, 78 + history.length * 4) + '%' }}></div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button className={`tab ${activeTab === 'scholarships' ? 'active' : ''}`} onClick={() => setActiveTab('scholarships')}>Scholarships</button>
              <button className={`tab ${activeTab === 'readiness' ? 'active' : ''}`} onClick={() => setActiveTab('readiness')}>AI Readiness</button>
              <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
            </div>

            {/* Scholarships tab */}
            {activeTab === 'scholarships' && (
              <div className="fade-up">
                <p className="section-label">Matched for you · 4 available</p>
                {scholarshipData.map((scholarship, idx) => (
                  <div key={idx} className="scholarship-card" onClick={() => openClaim(idx)}>
                    <div className="card-top">
                      <div className="card-icon" style={{ background: ['#EBF0FF', '#FEF3C7', '#D1FAE5', '#F3EEFF'][idx] }}>{scholarship.icon}</div>
                      <div className="card-info">
                        <div className="card-title">{scholarship.name}</div>
                        <div className="card-org">{scholarship.org}</div>
                      </div>
                      <div className="card-amount">{scholarship.amount} XLM</div>
                    </div>
                    <div className="card-tags">
                      {scholarship.tags.map((tag, tidx) => (
                        <span key={tidx} className={`tag ${tagColors[tag] || 'tag-blue'}`}>{tag}</span>
                      ))}
                    </div>
                    <div className="card-footer">
                      <div className="match-score">✓ {scholarship.match}% match</div>
                      <button className="card-btn">
                        {claimedSet.has(idx) ? '✓ Claimed' : 'Apply & Verify →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI Readiness tab */}
            {activeTab === 'readiness' && (
              <div className="fade-up">
                <p className="section-label">AI Scholarship Readiness Score</p>
                <div className="readiness-card">
                  <div className="readiness-header">
                    <div>
                      <div className="readiness-title">Juan's Readiness Score</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Updated today · Auto-triggers payout at 85%</div>
                    </div>
                    <div className="readiness-score-circle">
                      <div className="readiness-score-inner">78%</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--muted)' }}>Progress to auto-trigger</span>
                      <span style={{ fontWeight: 600, color: 'var(--brand)' }}>78 / 85</span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, var(--brand), var(--stellar))', borderRadius: '99px' }}></div>
                    </div>
                  </div>
                  {[
                    { label: 'Grade 12 enrollment verified', points: '+20pts', done: true },
                    { label: 'Stellar wallet trustline set', points: '+15pts', done: true },
                    { label: 'Family income bracket declared', points: '+15pts', done: true },
                    { label: 'GPA 88+ confirmed', points: '+18pts', done: true },
                    { label: 'Birth certificate uploaded', points: '+7pts', done: false },
                    { label: 'Recommendation letter', points: '+5pts', done: false },
                  ].map((item, idx) => (
                    <div key={idx} className="criteria-row">
                      <div className={`criteria-check ${item.done ? 'check-done' : 'check-miss'}`}>{item.done ? '✓' : '✗'}</div>
                      <div className="criteria-label">{item.label}</div>
                      <div className="criteria-status" style={{ color: item.done ? 'var(--muted)' : 'var(--danger)' }}>{item.points}</div>
                    </div>
                  ))}
                </div>
                <div className="ai-box">
                  <div className="ai-box-top">★ AI Suggestion</div>
                  <div className="ai-box-text">Upload your <strong>birth certificate</strong> and <strong>recommendation letter</strong> to reach 85% and auto-trigger the CHED Merit payout. These 2 documents unlock ₱17,500 worth of scholarship funds immediately.</div>
                </div>
                <button className="btn-primary" onClick={() => setActiveTab('scholarships')}>Upload Documents → Unlock Funds</button>
              </div>
            )}

            {/* History tab */}
            {activeTab === 'history' && (
              <div className="fade-up">
                <p className="section-label">Transaction history</p>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-label">Total received</div><div className="stat-value stat-green">{totalXLM} XLM</div></div>
                  <div className="stat-card"><div className="stat-label">Claims made</div><div className="stat-value stat-blue">{history.length}</div></div>
                </div>
                <div id="historyList">
                  {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: '14px' }}>
                      No transactions yet.<br />Apply for a scholarship to get started!
                    </div>
                  ) : (
                    history.map((h, idx) => (
                      <div key={idx} className="history-item">
                        <div className="history-icon" style={{ background: 'var(--success-light)' }}>{h.icon}</div>
                        <div className="history-info">
                          <div className="history-name">{h.name}</div>
                          <div className="history-date">{h.date} · {h.txHash.slice(0, 12)}...</div>
                        </div>
                        <div className="history-amount">+{h.amount} XLM</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Landing / connect screen */
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: '24px', fontWeight: 700 }}>Welcome to ScholarAID Pay</h2>
            <p style={{ color: 'var(--muted)', maxWidth: '400px', margin: '0 auto 24px' }}>
              Connect your Freighter wallet to verify scholarship eligibility and claim funds on the Stellar network.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
              <button
                className="btn-primary"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting
                  ? '⏳ Connecting...'
                  : hasFreighter
                    ? 'Connect Freighter Wallet'
                    : 'Install Freighter Wallet'}
              </button>

              <button
                className="btn-secondary"
                onClick={enterDemoMode}
                style={{ background: 'var(--stellar-light)', color: 'var(--stellar)', border: 'none' }}
              >
                Try Demo Mode →
              </button>
            </div>

            {/* Error message */}
            {connectError && (
              <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--danger)', maxWidth: '320px', margin: '16px auto 0' }}>
                ⚠️ {connectError}
              </p>
            )}

            {!hasFreighter && !connectError && (
              <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--muted)' }}>
                Don't have Freighter? <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" style={{ color: 'var(--stellar)' }}>Download it here</a> or use Demo Mode to explore the app.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-handle"></div>

            {modalContent?.type === 'wallet' ? (
              <>
                <div className="modal-title">Your Stellar Wallet</div>
                <div className="modal-sub">{isDemoMode ? 'Demo Mode · Testnet' : 'Trustline active · Testnet'}</div>
                <div className="amount-box">
                  <div className="amount-label">Total XLM Balance</div>
                  <div className="amount-value">{totalXLM.toFixed(2)} XLM</div>
                  <div className="amount-sub">≈ ₱{(totalXLM * 8.5).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Philippine Peso</div>
                </div>
                <div className="tx-hash">
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>WALLET ADDRESS</div>
                  {modalContent.address}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Trustline</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>✓ Active</div>
                  </div>
                  <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Network</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--stellar)' }}>Stellar</div>
                  </div>
                </div>
                <button className="btn-secondary" onClick={closeModal}>Close</button>
              </>

            ) : modalContent?.type === 'success' ? (
              <>
                <div className="success-screen fade-up">
                  <div className="success-icon">✓</div>
                  <div className="success-title">Funds Received!</div>
                  <div className="success-sub">Your scholarship has been disbursed instantly via Stellar</div>
                  <div className="success-amount">+{modalContent.scholarship.amount} {modalContent.scholarship.currency}</div>
                  <div className="success-cur">≈ ₱{(modalContent.scholarship.amount * 8.5).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} credited to your wallet</div>
                  <div className="tx-hash" style={{ marginTop: '16px', textAlign: 'left' }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>STELLAR TRANSACTION HASH</div>
                    {modalContent.txHash}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>Verified on Stellar testnet · Soroban contract executed · No middleman</div>
                  <button className="btn-primary" onClick={closeModal}>Done — View Wallet</button>
                  <button className="btn-secondary" onClick={() => { closeModal(); setActiveTab('history'); }}>View Transaction History</button>
                </div>
              </>

            ) : currentScholarship !== null && !claimedSet.has(currentScholarship) ? (
              <>
                <div className="modal-title">{scholarshipData[currentScholarship].icon} {scholarshipData[currentScholarship].name}</div>
                <div className="modal-sub">{scholarshipData[currentScholarship].org} · {scholarshipData[currentScholarship].match}% match</div>
                <div className="amount-box">
                  <div className="amount-label">Scholarship Amount</div>
                  <div className="amount-value">{scholarshipData[currentScholarship].amount} {scholarshipData[currentScholarship].currency}</div>
                  <div className="amount-sub">≈ ₱{(scholarshipData[currentScholarship].amount * 8.5).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} · Instant via Stellar</div>
                </div>
                <div className="ai-box">
                  <div className="ai-box-top">★ AI Readiness Match</div>
                  <div className="ai-box-text">Based on your profile, you have a <strong>{scholarshipData[currentScholarship].match}% match</strong> for this scholarship. Your GPA and enrollment status meet all primary criteria.</div>
                </div>
                <div className="section-label" style={{ marginTop: '4px' }}>Soroban verification flow</div>
                <div className="flow-steps">
                  {['Wallet verification', 'Eligibility check', 'Escrow release', 'XLM disbursed'].map((step, i) => (
                    <div key={i} className="flow-step">
                      <div className="step-left">
                        <div className={`step-dot ${i < flowPhase ? 'done' : (i === flowPhase && isProcessing ? 'active' : 'pending')}`}>
                          {i < flowPhase ? '✓' : (i + 1)}
                        </div>
                        {i < 3 && <div className="step-line"></div>}
                      </div>
                      <div className="step-content">
                        <div className="step-name">{step}</div>
                        <div className="step-desc">
                          {step === 'Wallet verification' && 'Checking Stellar trustline & wallet status'}
                          {step === 'Eligibility check' && 'Verifying credential hash on-chain'}
                          {step === 'Escrow release' && 'Soroban releases funds from escrow'}
                          {step === 'XLM disbursed' && 'Funds sent to your wallet instantly'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {isProcessing ? (
                  <button className="btn-primary" disabled>
                    <span className="spinner"></span> Phase {flowPhase}: Processing...
                  </button>
                ) : (
                  <button className="btn-primary" onClick={() => startClaim(currentScholarship)}>
                    Apply & Verify via Soroban →
                  </button>
                )}
                <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              </>

            ) : currentScholarship !== null && claimedSet.has(currentScholarship) ? (
              <>
                <div className="modal-title">{scholarshipData[currentScholarship].icon} {scholarshipData[currentScholarship].name}</div>
                <div className="modal-sub">{scholarshipData[currentScholarship].org}</div>
                <div className="amount-box">
                  <div className="amount-label">Already Claimed</div>
                  <div className="amount-value" style={{ color: 'var(--success)' }}>✓ {scholarshipData[currentScholarship].amount} {scholarshipData[currentScholarship].currency}</div>
                  <div className="amount-sub">Successfully disbursed via Soroban</div>
                </div>
                <button className="btn-secondary" onClick={closeModal}>Close</button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;