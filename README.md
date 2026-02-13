# CivicLens x402 🔍🏙️

> **Cronos x402 Paytech Hackathon Submission**
>
> **Tracks:**
> *   **Main Track (x402 Applications):** Consumer app with "Embedded x402 Flows" for instant bounty payouts.
> *   **Crypto.com X Cronos Ecosystem Integrations:** Integrates with **Crypto.com DeFi Wallet** for user authentication and bounty receipt.

**CivicLens x402** is a decentralized platform where citizens can report civic incidents (potholes, flooding, infrastructure damage) and receive **automatic bounty payments** upon AI verification—powered by Cronos x402 payment rails.

[![Cronos](https://img.shields.io/badge/Cronos-EVM-blue)](https://cronos.org)
[![x402](https://img.shields.io/badge/x402-Payments-green)](https://docs.cronos.org/cronos-x402-facilitator/introduction)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🎯 Overview

CivicLens x402 is a decentralized platform where citizens can report civic incidents (potholes, flooding, infrastructure damage) and receive **automatic bounty payments** upon AI verification—powered by Cronos x402 payment rails.

### Key Innovation
- **AI-Verified Reports**: AWS Rekognition + Bedrock validates incident authenticity
- **x402 Bounty Payments**: Automatic rewards for verified reports via programmable payments
- **On-Chain Transparency**: All reports and payments recorded on Cronos EVM
- **Crypto.com Wallet Integration**: Seamless payouts to reporter wallets

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      CIVICLENS x402                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   📸 Incident Photo  →  🤖 AI Verification  →  ✅ Confirmed      │
│        Upload              (AWS Bedrock)         Report          │
│                                                     │            │
│                                                     ▼            │
│                               ┌─────────────────────────┐        │
│                               │    x402 Facilitator     │        │
│                               │    (Bounty Payment)     │        │
│                               └────────────┬────────────┘        │
│                                            │                     │
│                                            ▼                     │
│   ┌────────────────────────────────────────────────────────┐    │
│   │              Cronos EVM Smart Contract                  │    │
│   │   • Report stored on-chain                              │    │
│   │   • Bounty distributed to reporter                      │    │
│   │   • Upvote rewards                                      │    │
│   └────────────────────────────────────────────────────────┘    │
│                                            │                     │
│                                            ▼                     │
│                            💰 Reporter's Wallet                  │
│                           (Crypto.com Integration)               │
└──────────────────────────────────────────────────────────────────┘
```

## ✨ Features

### 📸 AI-Powered Verification
- AWS Rekognition for image analysis
- AWS Bedrock (Claude) for description matching
- Severity scoring (1-10 scale)
- Fake/duplicate detection

### 💰 x402 Bounty System
- Automatic payouts on verification
- Tiered rewards based on severity:
  - Low (1-3): 1 USDC
  - Medium (4-6): 3 USDC
  - High (7-8): 5 USDC
  - Critical (9-10): 10 USDC
- Upvote bonuses for popular reports

### 🔗 Cronos EVM Integration
- Reports stored on-chain (IPFS hash + metadata)
- Immutable verification records
- Transparent payment history
- Gas-optimized transactions

### 👛 Crypto.com Wallet Support
- Connect with Crypto.com DeFi Wallet
- MetaMask supported
- View earnings dashboard
- Track report history

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+ (for AI backend)
- Cronos Testnet TCRO
- AWS Account (for AI services)

### 1. Clone & Install

```bash
cd CivicLens-x402

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure Environment

Create `.env` files in both backend and frontend:

**Backend (.env)**:
```env
# Cronos EVM
CRONOS_RPC_URL=https://evm-t3.cronos.org
PRIVATE_KEY=your_bounty_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract

# AWS (for AI verification)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1

# Bounty Configuration
DEFAULT_BOUNTY_USDC=2
MAX_BOUNTY_USDC=10
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:3001
VITE_CRONOS_RPC=https://evm-t3.cronos.org
VITE_CONTRACT_ADDRESS=your_deployed_contract
```

### 3. Deploy Smart Contract

```bash
cd contracts
npx hardhat run scripts/deploy.js --network cronos_testnet
```

### 4. Get Testnet Tokens

- TCRO Faucet: https://cronos.org/faucet
- devUSDC.e Faucet: https://faucet.cronos.org

### 5. Run

```bash
# Start backend
cd backend
npm start

# Start frontend (new terminal)
cd frontend
npm run dev
```

### 6. Access

- Frontend: http://localhost:5173
- API: http://localhost:3001

## 📁 Project Structure

```
CivicLens-x402/
├── backend/
│   ├── server.js               # Express server
│   ├── aws_ai_service.js       # AI verification (Rekognition + Bedrock)
│   ├── x402_bounty.js          # x402 bounty payment logic
│   ├── cronos_wallet.js        # Wallet management
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main application
│   │   ├── components/
│   │   │   ├── IncidentFeed.jsx
│   │   │   ├── ReportForm.jsx
│   │   │   ├── WalletConnect.jsx
│   │   │   └── BountyDashboard.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── contracts/
│   ├── CivicLensBounty.sol     # Main contract
│   ├── hardhat.config.js
│   └── scripts/
│       └── deploy.js
├── README.md
└── .gitignore
```

## 🎯 Hackathon Tracks

This project is submitted to:

### 1. Main Track - x402 Applications
- ✅ Agent-triggered payments (AI verifies, x402 pays)
- ✅ Consumer app with embedded x402 flows
- ✅ Automated settlement logic

### 2. Crypto.com Ecosystem Integration
- ✅ Crypto.com wallet integration
- ✅ On-chain settlement on Cronos EVM
- ✅ Market Data MCP for bounty pricing

## 📊 Demo Flow

1. **Report Incident**: User captures photo and description
2. **AI Analysis**: AWS Bedrock verifies image matches description
3. **Severity Score**: AI assigns 1-10 severity rating
4. **On-Chain Publish**: Report stored on Cronos EVM
5. **x402 Payment**: Bounty automatically sent to reporter
6. **Community Verification**: Other users upvote (bonus rewards)

## 🔐 Smart Contract

### CivicLensBounty.sol

```solidity
// Key functions:
function submitReport(string ipfsHash, string description, uint8 severity)
function verifyAndPayBounty(uint256 reportId, uint256 bountyAmount)
function upvoteReport(uint256 reportId)
function claimUpvoteRewards(uint256 reportId)
```

### Bounty Calculation

```javascript
const calculateBounty = (severity) => {
  if (severity >= 9) return 10; // Critical - 10 USDC
  if (severity >= 7) return 5;  // High - 5 USDC
  if (severity >= 4) return 3;  // Medium - 3 USDC
  return 1;                     // Low - 1 USDC
};
```

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, ethers.js
- **Backend**: Node.js, Express
- **AI**: AWS Rekognition, AWS Bedrock (Claude)
- **Blockchain**: Cronos EVM, Solidity, Hardhat
- **Payments**: x402 Facilitator SDK
- **Wallet**: Crypto.com DeFi Wallet, MetaMask

## 📞 Resources

- [Cronos x402 Facilitator SDK](https://www.npmjs.com/package/@crypto.com/facilitator-client)
- [Crypto.com AI Agent SDK](https://ai-agent-sdk-docs.crypto.com/)
- [Cronos EVM Docs](https://docs.cronos.org)
- [Wallet Integration Guide](https://docs.cronos.org/for-dapp-developers/chain-integration/web-extension-integration)

## 📄 License

MIT License

---

Built with ❤️ for the Cronos x402 Paytech Hackathon
