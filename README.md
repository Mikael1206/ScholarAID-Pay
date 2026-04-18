# ScholarAid Pay

A decentralized scholarship disbursement system built on Stellar's Soroban smart contracts.

## Project Structure

```
├── contract/          # Soroban smart contract (Rust)
│   ├── src/
│   │   ├── lib.rs     # Main contract logic
│   │   └── test.rs    # Unit tests
│   ├── Cargo.toml     # Rust dependencies
│   └── README.md      # Contract documentation
├── frontend/          # React web application
│   ├── src/
│   │   ├── App.js     # Main app with wallet connection
│   │   ├── ScholarshipCard.js # Scholarship claim component
│   │   └── ...
│   ├── package.json   # Node dependencies
│   └── ...
├── backend/           # FastAPI backend
│   ├── main.py        # API endpoints
│   └── requirements.txt # Python dependencies
└── README.md          # This file
```

## Overview

ScholarAid Pay enables Local Government Units (LGUs) and NGOs to:
- Register eligible students for scholarships
- Allow verified students to claim funds securely
- Track disbursement status to prevent fraud
- Maintain transparent records via blockchain

## Smart Contract

The core logic is implemented in a Soroban contract written in Rust:

- **Admin Functions**: Initialize contract, register students
- **Student Functions**: Claim scholarships, check status
- **Security**: Authorization checks, double-spend prevention

See `contract/README.md` for detailed API documentation.

## Frontend Application

A React + Tailwind CSS web interface with Philippines-inspired design:

- Stellar Wallets Kit integration (Freighter/Albedo)
- Scholarship claim interface
- Eligibility verification via backend API
- Mobile-first responsive design with PUP colors

## Backend API

FastAPI backend orchestrating the application:

- Student eligibility verification with AI score simulation
- Scholarship metadata management
- CORS-enabled for frontend communication
- RESTful API endpoints

## Getting Started

### Prerequisites

- Rust (with wasm32 target)
- Node.js and npm
- Python 3.8+
- Stellar CLI
- Funded testnet account

### Setup

1. **Smart Contract:**
   ```bash
   cd contract
   cargo build --target wasm32-unknown-unknown --release
   stellar contract deploy --wasm target/wasm32-unknown-unknown/release/scholaraid_pay.wasm --source your-keypair --network testnet
   ```

2. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Configuration

- Update `frontend/src/ScholarshipCard.js` with your contract ID
- Add pre-approved student addresses to `backend/main.py`

## Usage

1. Initialize contract with admin address
2. Admin registers eligible students
3. Students connect wallet and claim scholarships
4. All transactions are recorded on-chain

## Security

- Contract uses persistent storage for state
- Authorization required for sensitive operations
- Event logging for audit trails
- Testnet deployment for development

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## License

[Add your license information]