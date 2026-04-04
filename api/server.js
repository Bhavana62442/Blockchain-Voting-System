require('dotenv').config();

'use strict';

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const grpc       = require('@grpc/grpc-js');
const crypto     = require('crypto');
const fs         = require('fs');
const path       = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ── Network config ────────────────────────────────────────────────────────────
const CHANNEL   = 'nationalvotingchannel';
const CHAINCODE = 'voting';
const MSP_ID    = process.env.MSP_ID    || 'KarnatakaMSP';
const STATE     = process.env.STATE     || 'karnataka';
const CRYPTO_BASE = process.env.CRYPTO_BASE ||
  path.resolve(__dirname, '../fabric-samples/test-network/organizations/peerOrganizations/karnataka.election.gov.in');

const PEER_ENDPOINT = process.env.PEER_ENDPOINT || `peer0.${STATE}.election.gov.in:8051`;
const PEER_HOST     = PEER_ENDPOINT.split(':')[0];

const CERT_FILES    = fs.readdirSync(path.join(CRYPTO_BASE, `users/Admin@${STATE}.election.gov.in/msp/signcerts`));
const CERT_PATH     = path.join(CRYPTO_BASE, `users/Admin@${STATE}.election.gov.in/msp/signcerts`, CERT_FILES[0]);
const KEY_DIR       = path.join(CRYPTO_BASE, `users/Admin@${STATE}.election.gov.in/msp/keystore`);
const TLS_CERT_PATH = path.join(CRYPTO_BASE, `peers/peer0.${STATE}.election.gov.in/tls/ca.crt`);

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
    identity: { mspId: MSP_ID, credentials: Buffer.from(certPem) },
    signer:   signers.newPrivateKeySigner(privateKey),
    hash:     hash.sha256,
  });

  network  = gateway.getNetwork(CHANNEL);
  contract = network.getContract(CHAINCODE);
  console.log(`✅  Connected to ${PEER_ENDPOINT} as ${MSP_ID}`);
}

async function invokeCC(fn, ...args) {
  return contract.submitTransaction(fn, ...args);
}
async function queryCC(fn, ...args) {
  return contract.evaluateTransaction(fn, ...args);
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', state: STATE, msp: MSP_ID, peer: PEER_ENDPOINT });
});

/**
 * POST /api/voter/register
 * Body: { voterHashID, randomness, mspID }
 * Chaincode: RegisterVoter(hash, randomness, mspID)
 */
app.post('/api/voter/register', async (req, res) => {
  try {
    const { voterHashID, randomness, mspID } = req.body;
    if (!voterHashID || !randomness || !mspID)
      return res.status(400).json({ error: 'voterHashID, randomness, mspID required' });

    const result = await invokeCC('RegisterVoter', voterHashID, randomness, mspID);
    res.json({ success: true, data: JSON.parse(Buffer.from(result).toString("utf8").trim()) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/voter/:voterHashID/status
 * Chaincode: QueryVoterStatus(hash)
 */
app.get('/api/voter/:voterHashID/status', async (req, res) => {
  try {
    const result = await queryCC('QueryVoterStatus', req.params.voterHashID);
    res.json(JSON.parse(Buffer.from(result).toString("utf8").trim()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/vote/cast
 * Body: { voterHashID, candidateID }
 * Chaincode: CastVote(hash, candidateID)
 */
app.post('/api/vote/cast', async (req, res) => {
  try {
    const { voterHashID, candidateID } = req.body;
    if (!voterHashID || !candidateID)
      return res.status(400).json({ error: 'voterHashID and candidateID required' });

    const result = await invokeCC('CastVote', voterHashID, candidateID);
    const receipt = JSON.parse(Buffer.from(result).toString("utf8").trim());
    res.json({ success: true, voteReceipt: receipt });
  } catch (e) {
    const msg = e.message || '';
    if (msg.includes('already voted'))
      return res.status(409).json({ error: 'You have already cast your vote.' });
    res.status(500).json({ error: msg });
  }
});

/**
 * GET /api/results
 * Chaincode: TallyVotes() — returns { totalVotes, validVotes, perCandidate, perState, timestamp }
 */
app.get('/api/results', async (req, res) => {
  try {
    const result = await queryCC('TallyVotes');
    res.json(JSON.parse(Buffer.from(result).toString("utf8").trim()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Keep old route working too
app.get('/api/results/:constituency', async (req, res) => {
  try {
    const result = await queryCC('TallyVotes');
    res.json(JSON.parse(Buffer.from(result).toString("utf8").trim()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/audit/:voteID
 * Chaincode: AuditVote(voteID)
 */
app.get('/api/audit/:voteID', async (req, res) => {
  try {
    const result = await queryCC('AuditVote', req.params.voteID);
    res.json(JSON.parse(Buffer.from(result).toString("utf8").trim()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/vote/correct
 * Body: { voteID, newCandidateID, reason, authorizedBy, secretShares }
 * Chaincode: CorrectVote(voteID, newCandidateID, reason, authorizedBy, sharesJSON)
 */
app.post('/api/vote/correct', async (req, res) => {
  try {
    const { voteID, newCandidateID, reason, authorizedBy, secretShares } = req.body;
    const result = await invokeCC(
      'CorrectVote',
      voteID,
      newCandidateID,
      reason || '',
      authorizedBy || '',
      JSON.stringify(secretShares)
    );
    res.json({ success: true, result: JSON.parse(Buffer.from(result).toString("utf8").trim()) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
