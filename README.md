# Blockchain Voting System (BVS)

A decentralized, secure voting application built on Hyperledger Fabric v2.5.
This system uses a Go-based Smart Contract (Chaincode) for immutable vote storage and a Node.js (Express) backend for the web interface.

---

## 1. Project Architecture

- Blockchain Infrastructure: Hyperledger Fabric Test Network (2 Organizations, 1 Orderer)
- Network Channel: votingchannel
- Smart Contract (Chaincode): basic (Go)
- Application Layer: Node.js (Fabric Gateway SDK)
- User Interface: HTML / CSS / JavaScript (Bootstrap)

---

## 2. Nuclear Wipe Script (clean.sh)

Hyperledger Fabric persists ledger data inside Docker volumes.
If the network breaks, identities go out of sync, or you want to reset all votes, use this script to completely wipe and rebuild the network.

File Location:
fabric-samples/test-network/clean.sh
Run this to deploy the channel and the chaincode on it 

## 3. Deployment Steps

### Step A: Reset and Initialize the Network

    cd ~/BVS/Blockchain-Voting-System/fabric-samples/test-network
    chmod +x clean.sh
    ./clean.sh

### Step B: Sync Application Identities

The clean.sh script regenerates certificates.
You must refresh the Node.js wallet to avoid discovery service or malformed identity errors.

    cd ~/BVS/Blockchain-Voting-System/Voting-UI
    rm -rf wallet/
    node enrollAdmin.js
    node registerUser.js

### Step C: Launch the Voting Application

    node server.js

Access the application at:

    http://localhost:3000

---

## Notes

- Always delete the wallet after recreating the Fabric network.
- Channel name and chaincode name must match across Fabric and Node.js configuration files.
- Docker must be running before executing any Fabric scripts.
