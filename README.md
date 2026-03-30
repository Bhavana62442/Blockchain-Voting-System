# Blockchain Voting System

A permissioned blockchain-based voting system built on Hyperledger Fabric with a 3-organisation consortium and Chameleon hashing for ballot privacy.

## Prerequisites

Make sure you have the following installed:
- Node.js (v18+) and npm
- Go (v1.21+)
- Docker and Docker Compose
- Hyperledger Fabric binaries and Docker images

To install Fabric binaries:
```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s
```

## Repository Structure
```
.
├── chaincode-go/        # Go smart contracts (chaincode)
├── test-network/        # Fabric test network config and scripts
├── backend/             # Node.js backend (Express + Fabric Gateway SDK)
└── frontend/            # (if applicable)
```

## Setup

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd <repo-name>
```

### 2. Environment variables

The `.env` file is not tracked. Create one in the `backend/` folder:
```bash
cp backend/.env.example backend/.env
```

Then fill in your values:
```env
PORT=3000
CHANNEL_NAME=votingchannel
CHAINCODE_NAME=voting
MSP_ID=Org1MSP
```

### 3. Crypto materials and channel artifacts

These are not tracked in the repo (they contain private keys). Generate them by bringing up the test network:
```bash
cd test-network
./network.sh up createChannel -c votingchannel -ca
```

This generates:
- `organizations/peerOrganizations/` — peer certs and keys
- `organizations/ordererOrganizations/` — orderer certs and keys  
- `channel-artifacts/` — genesis block and channel tx files

### 4. Deploy the chaincode
```bash
./network.sh deployCC -c votingchannel -ccn voting -ccp ../chaincode-go -ccl go
```

### 5. Install backend dependencies
```bash
cd backend
npm install
```

> `node_modules/` and `package-lock.json` are not tracked — always run `npm install` fresh.

### 6. Set up the wallet

The `wallet/` folder holds your Fabric identity credentials and is not tracked for security. 
A `.gitkeep` placeholder is included so the folder exists — populate it by enrolling an admin:
```bash
node backend/enrollAdmin.js
node backend/registerUser.js
```

### 7. Start the backend
```bash
npm start
```

## Running Tests / Benchmarks

Performance benchmarks use Hyperledger Caliper:
```bash
cd caliper-workspace
npx caliper launch manager \
  --caliper-workspace . \
  --caliper-networkconfig networks/fabric-network.yaml \
  --caliper-benchconfig benchmarks/voting.yaml
```

## What is NOT in this repo

| Ignored path | Why | How to get it |
|---|---|---|
| `wallet/` | Contains private keys | Run `enrollAdmin.js` |
| `**/organizations/` | Generated crypto material | Run `network.sh up` |
| `channel-artifacts/` | Generated channel config | Run `network.sh up` |
| `.env` | Secrets and config | Copy from `.env.example` |
| `node_modules/` | Dependencies | Run `npm install` |
| `**/chaincode-go/vendor/` | Go dependencies | Run `go mod vendor` |

## Network Overview

- 3 organisations: Org1, Org2, Org3
- Endorsement policy: majority (2 of 3)
- Hashing: Chameleon hashing for ballot privacy
- Consensus: Raft ordering service

## Troubleshooting

**Peer connection errors** — make sure the network is up (`docker ps` should show peer and orderer containers running).

**Wallet errors** — delete the `wallet/` folder contents and re-run the enroll scripts.

**Chaincode errors** — check `docker logs <peer-container-name>` for detailed chaincode logs.