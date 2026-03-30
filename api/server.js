/**
 * api/server.js — Fabric Gateway API for National Voting System
 * Exposes REST endpoints consumed by the React frontend
 * Uses Fabric Gateway SDK (v1.x / fabric-gateway npm package)
 */

'use strict';

const express      = require('express');
const cors         = require('cors');
const bodyParser   = require('body-parser');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const grpc         = require('@grpc/grpc-js');
const crypto       = require('crypto');
const fs           = require('fs');
const path         = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ── Network config ────────────────────────────────────────────────────────────
const CHANNEL   = 'nationalvotingchannel';
const CHAINCODE = 'voting';
const MSP_ID    = process.env.MSP_ID    || 'MaharashtraMSP';
const STATE     = process.env.STATE     || 'maharashtra';

const CRYPTO_BASE = path.resolve(__dirname,
  `../network/organizations/peerOrganizations/${STATE}.election.gov.in`);

const PEER_ENDPOINT  = process.env.PEER_ENDPOINT  || `peer0.${STATE}.election.gov.in:7051`;
const PEER_HOST      = PEER_ENDPOINT.split(':')[0];
const CERT_PATH      = path.join(CRYPTO_BASE, `users/Admin@${STATE}.election.gov.in/msp/signcerts/cert.pem`);
const KEY_DIR        = path.join(CRYPTO_BASE, `users/Admin@${STATE}.election.gov.in/msp/keystore`);
const TLS_CERT_PATH  = path.join(CRYPTO_BASE, `peers/peer0.${STATE}.election.gov.in/tls/ca.crt`);

// ── Fabric Gateway connection ─────────────────────────────────────────────────
let gateway, network, contract;

async function connectGateway() {
  const tlsRootCert  = fs.readFileSync(TLS_CERT_PATH);
  const credentials  = grpc.credentials.createSsl(tlsRootCert);
  const client       = new grpc.Client(PEER_ENDPOINT, credentials, {
    'grpc.ssl_target_name_override': PEER_HOST,
  });

  const certPem      = fs.readFileSync(CERT_PATH).toString();
  const keyFiles     = fs.readdirSync(KEY_DIR);
  const privateKeyPem = fs.readFileSync(path.join(KEY_DIR, keyFiles[0])).toString();
  const privateKey   = crypto.createPrivateKey(privateKeyPem);

  gateway = connect({
    client,
    identity:    { mspId: MSP_ID, credentials: Buffer.from(certPem) },
    signer:      signers.newPrivateKeySigner(privateKey),
    hash:        hash.sha256,
  });

  network  = gateway.getNetwork(CHANNEL);
  contract = network.getContract(CHAINCODE);
  console.log(`✅  Connected to ${PEER_ENDPOINT} as ${MSP_ID}`);
}

// ── Helper: invoke with retry ─────────────────────────────────────────────────
async function invokeCC(fn, ...args) {
  return contract.submitTransaction(fn, ...args);
}
async function queryCC(fn, ...args) {
  return contract.evaluateTransaction(fn, ...args);
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/voter/register
 * Body: { voterID, salt, constituency }
 * Called by state CA-verified citizen portal
 */
app.post('/api/voter/register', async (req, res) => {
  try {
    const { voterID, salt, constituency } = req.body;
    if (!voterID || !salt || !constituency)
      return res.status(400).json({ error: 'voterID, salt, constituency required' });

    const result = await invokeCC('RegisterVoter', voterID, salt, constituency);
    res.json({ success: true, message: 'Voter registered', data: JSON.parse(result.toString()) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/vote/cast
 * Body: { voterHashID, randomnessR, candidateID, constituency }
 */
app.post('/api/vote/cast', async (req, res) => {
  try {
    const { voterHashID, randomnessR, candidateID, constituency } = req.body;
    if (!voterHashID || !randomnessR || !candidateID || !constituency)
      return res.status(400).json({ error: 'All vote fields required' });

    const result = await invokeCC('CastVote', voterHashID, randomnessR, candidateID, constituency);
    res.json({ success: true, voteReceipt: JSON.parse(result.toString()) });
  } catch (e) {
    const errMsg = e.message || '';
    if (errMsg.includes('already voted'))
      return res.status(409).json({ error: 'Voter has already cast a vote' });
    res.status(500).json({ error: errMsg });
  }
});

/**
 * POST /api/vote/correct  (Threshold Chameleon collision — correct invalid vote)
 * Body: { voteID, newCandidateID, secretShares: [...] }
 * Only callable by quorum of state officers holding TCH secret shares
 */
app.post('/api/vote/correct', async (req, res) => {
  try {
    const { voteID, newCandidateID, secretShares } = req.body;
    const result = await invokeCC(
      'CorrectVote',
      voteID,
      newCandidateID,
      JSON.stringify(secretShares)
    );
    res.json({ success: true, result: JSON.parse(result.toString()) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/results/:constituency
 * Returns live tally for a constituency
 */
app.get('/api/results/:constituency', async (req, res) => {
  try {
    const result = await queryCC('GetResults', req.params.constituency);
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/results/national
 * Returns aggregated national tally
 */
app.get('/api/results/national', async (req, res) => {
  try {
    const result = await queryCC('GetNationalResults');
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/voter/:voterHashID/status
 * Returns whether this hash has voted (does NOT reveal identity)
 */
app.get('/api/voter/:voterHashID/status', async (req, res) => {
  try {
    const result = await queryCC('GetVoterStatus', req.params.voterHashID);
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/election/status
 * Returns current election phase (REGISTRATION | VOTING | TALLYING | CLOSED)
 */
app.get('/api/election/status', async (req, res) => {
  try {
    const result = await queryCC('GetElectionStatus');
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/election/phase  (ECI admin only)
 * Body: { phase: "VOTING" }
 */
app.post('/api/election/phase', async (req, res) => {
  try {
    const { phase } = req.body;
    await invokeCC('SetElectionPhase', phase);
    res.json({ success: true, phase });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', state: STATE, msp: MSP_ID, peer: PEER_ENDPOINT });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
connectGateway()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🗳️  Voting API running on http://localhost:${PORT}`));
  })
  .catch(e => {
    console.error('Failed to connect to Fabric gateway:', e);
    process.exit(1);
  });

module.exports = app;