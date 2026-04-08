// blockchain-api/server.js
// Run this with: node server.js  (from blockchain-api/ directory)
// It bridges your React frontend → Hyperledger Fabric chaincode
//
// Prerequisites:
//   npm install express cors mongoose dotenv
//
// Start AFTER ./start.sh and ./init.sh are done

const express  = require("express");
const cors     = require("cors");
const { exec } = require("child_process");
const path     = require("path");
const crypto   = require("crypto");

const app  = express();
const PORT = 4000; // React fetches → localhost:4000

app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── CONFIG ─────────────────────────────────────────────────────────────────
// Adjust these paths to match your machine
const NETWORK_DIR = path.join(
  process.env.HOME,
  "Blockchain-Voting-System/fabric-samples/test-network"
);

const CHANNEL   = "nationalvotingchannel";
const CHAINCODE = "voting";

// Peer env for Karnataka (port 8051) — used for queries/invokes
const peerEnv = {
  ...process.env,
  CORE_PEER_TLS_ENABLED: "true",
  CORE_PEER_LOCALMSPID: "KarnatakaMSP",
  CORE_PEER_MSPCONFIGPATH: `${NETWORK_DIR}/organizations/peerOrganizations/karnataka.election.gov.in/users/Admin@karnataka.election.gov.in/msp`,
  CORE_PEER_ADDRESS: "localhost:8051",
  CORE_PEER_TLS_ROOTCERT_FILE: `${NETWORK_DIR}/organizations/peerOrganizations/karnataka.election.gov.in/peers/peer0.karnataka.election.gov.in/tls/ca.crt`,
  FABRIC_CFG_PATH: `${NETWORK_DIR}/../config`,
  PATH: `${process.env.HOME}/Blockchain-Voting-System/bin:${process.env.PATH}`,
};

const ORDERER_CA  = `${NETWORK_DIR}/organizations/ordererOrganizations/eci.election.gov.in/orderers/orderer0.eci.election.gov.in/msp/tlscacerts/tlsca.eci.election.gov.in-cert.pem`;
const ORDERER_URL = "localhost:7050";

// ─── HELPER: run peer CLI command ────────────────────────────────────────────
function peerQuery(fcn, args) {
  return new Promise((resolve, reject) => {
    const argsJson = JSON.stringify({ function: fcn, Args: args });
    const cmd = `peer chaincode query \
      -C ${CHANNEL} \
      -n ${CHAINCODE} \
      -c '${argsJson}'`;

    exec(cmd, { env: peerEnv, cwd: NETWORK_DIR }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      try { resolve(JSON.parse(stdout.trim())); }
      catch { resolve(stdout.trim()); }
    });
  });
}

function peerInvoke(fcn, args) {
  return new Promise((resolve, reject) => {
    const argsJson = JSON.stringify({ function: fcn, Args: args });
    const cmd = `peer chaincode invoke \
      -o ${ORDERER_URL} \
      --ordererTLSHostnameOverride orderer0.eci.election.gov.in \
      --tls \
      --cafile "${ORDERER_CA}" \
      -C ${CHANNEL} \
      -n ${CHAINCODE} \
      --peerAddresses localhost:7051 \
      --tlsRootCertFiles "${NETWORK_DIR}/organizations/peerOrganizations/maharashtra.election.gov.in/peers/peer0.maharashtra.election.gov.in/tls/ca.crt" \
      --peerAddresses localhost:8051 \
      --tlsRootCertFiles "${NETWORK_DIR}/organizations/peerOrganizations/karnataka.election.gov.in/peers/peer0.karnataka.election.gov.in/tls/ca.crt" \
      --peerAddresses localhost:9051 \
      --tlsRootCertFiles "${NETWORK_DIR}/organizations/peerOrganizations/tamilnadu.election.gov.in/peers/peer0.tamilnadu.election.gov.in/tls/ca.crt" \
      -c '${argsJson}' 2>&1`;

    exec(cmd, { env: peerEnv, cwd: NETWORK_DIR }, (err, stdout) => {
      // peer invoke exits non-zero even on success sometimes; check stdout
      if (stdout.includes("Chaincode invoke successful")) {
        // Extract voteID from event payload if present
        const match = stdout.match(/result: status:200 payload:"([^"]+)"/);
        resolve({ success: true, payload: match ? match[1] : null });
      } else if (err) {
        reject(new Error(stdout || err.message));
      } else {
        resolve({ success: true, payload: null });
      }
    });
  });
}

// ─── ROUTES ─────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", port: PORT }));

// ── POST /api/vote/cast ──────────────────────────────────────────────────────
// Body: { voterHashID: string, candidateID: string }
// Called by Vote.jsx after MSP issues a token
app.post("/api/vote/cast", async (req, res) => {
  const { voterHashID, candidateID } = req.body;

  if (!voterHashID || !candidateID) {
    return res.status(400).json({ error: "voterHashID and candidateID are required" });
  }

  const validCandidates = ["CANDIDATE_A", "CANDIDATE_B", "CANDIDATE_C"];
  if (!validCandidates.includes(candidateID)) {
    return res.status(400).json({ error: "Invalid candidateID" });
  }

  try {
    // CastVote(voterHashID, candidateID, state)
    // State is derived from the token; default Karnataka for demo
    const result = await peerInvoke("CastVote", [voterHashID, candidateID]);

    // Generate a deterministic voteID from the hash so the receipt is stable
    const voteID = "0x" + crypto
      .createHash("sha256")
      .update(voterHashID + candidateID + Date.now())
      .digest("hex");

    return res.json({
      success: true,
      voteReceipt: { voteID, candidateID, voterHashID }
    });

  } catch (err) {
    console.error("[CastVote] Error:", err.message);

    if (err.message.includes("already voted") || err.message.includes("VOTED")) {
      return res.status(409).json({ error: "Your vote has already been recorded." });
    }
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/results/:state ──────────────────────────────────────────────────
// Called by PublicLedger.jsx to fetch tally
app.get("/api/results/:state", async (req, res) => {
  try {
    const tally = await peerQuery("TallyVotes", []);
    return res.json(tally); // { totalVotes, validVotes, perCandidate, perState, timestamp }
  } catch (err) {
    console.error("[TallyVotes] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/votes/all ───────────────────────────────────────────────────────
// Optional: fetch all vote records for ledger display
app.get("/api/votes/all", async (req, res) => {
  try {
    const records = await peerQuery("GetAllVotes", []);
    return res.json(Array.isArray(records) ? records : []);
  } catch (err) {
    // GetAllVotes may not exist in your chaincode — that's fine
    console.warn("[GetAllVotes] Not available:", err.message);
    return res.json([]);
  }
});

// ── POST /api/voter/register ─────────────────────────────────────────────────
// Called by ConsentPage.jsx — forwards token from MSP server
// Body: { voterHashID, state }
app.post("/api/voter/register", async (req, res) => {
  const { voterHashID, randomness, mspID = "KarnatakaMSP" } = req.body;
  
  console.log("[Register] voterHashID:", voterHashID?.slice(0,16));
  console.log("[Register] randomness:", randomness?.slice(0,16));
  console.log("[Register] mspID:", mspID);

  if (!voterHashID || !randomness) {
    return res.status(400).json({ error: "voterHashID and randomness are required" });
  }

  try {
    await peerInvoke("RegisterVoter", [voterHashID, randomness, mspID]);
    return res.json({ success: true, voterHashID });
  } catch (err) {
    console.error("[RegisterVoter] Error:", err.message);
    if (err.message.includes("already registered")) {
      return res.json({ success: true, voterHashID, alreadyRegistered: true });
    }
    return res.status(500).json({ error: err.message });
  }
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🗳️  Blockchain API bridge running on http://localhost:${PORT}`);
  console.log(`   POST /api/vote/cast`);
  console.log(`   POST /api/voter/register`);
  console.log(`   GET  /api/results/:state`);
  console.log(`   GET  /api/votes/all`);
  console.log(`\n   Network dir: ${NETWORK_DIR}`);
  console.log(`   Channel    : ${CHANNEL}`);
  console.log(`   Chaincode  : ${CHAINCODE}\n`);
});
