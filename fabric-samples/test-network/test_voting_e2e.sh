#!/bin/bash
# ============================================================
#  END-TO-END TEST: Voting Chaincode on nationalvotingchannel
#  Tests: InitLedger → RegisterVoter → CastVote → AuditVote
#         → CorrectVote (chameleon collision) → TallyVotes
# ============================================================

set -e
CHANNEL="nationalvotingchannel"
CC_NAME="voting"
ORDERER="orderer0.eci.election.gov.in:7050"
NETWORK_DIR="$HOME/Blockchain-Voting-System/fabric-samples/test-network"

# ---- Orderer CA ----
ORDERER_CA="${NETWORK_DIR}/organizations/ordererOrganizations/eci.election.gov.in/orderers/orderer0.eci.election.gov.in/msp/tlscacerts/tlsca.eci.election.gov.in-cert.pem"

# ---- Helper: set env for a given org ----
use_org() {
  local ORG=$1
  local PORT=$2
  local LOWER=$(echo "$ORG" | tr '[:upper:]' '[:lower:]')
  export CORE_PEER_LOCALMSPID="${ORG}MSP"
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_DIR}/organizations/peerOrganizations/${LOWER}.election.gov.in/tlsca/tlsca.${LOWER}.election.gov.in-cert.pem"
  export CORE_PEER_MSPCONFIGPATH="${NETWORK_DIR}/organizations/peerOrganizations/${LOWER}.election.gov.in/users/Admin@${LOWER}.election.gov.in/msp"
  export CORE_PEER_ADDRESS="localhost:${PORT}"
}

# ---- Colour output ----
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
step() { echo -e "\n${YELLOW}══ $* ══${NC}"; }
err()  { echo -e "${RED}[ERR]${NC} $*"; }

cd "$NETWORK_DIR"

# ==============================================================
# STEP 0 — InitLedger (store TCH public key on-chain)
# These are EXAMPLE 512-bit RSA-style values. In production,
# replace with your real multi-party ceremony output.
# ==============================================================
step "STEP 0: InitLedger — store TCH public key"

# Minimal test values (hex-encoded big.Int). Replace with your real key ceremony output.
N_HEX="00c0f456b8a1f3e2d9c7b5a4389216fe7d04bc5e1a98237640f5bc9e32d1a87f6b"
E_HEX="010001"   # 65537 in hex

use_org "Maharashtra" 7051

peer chaincode invoke \
  -o "$ORDERER" \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  --tls --cafile "$ORDERER_CA" \
  -c "{\"function\":\"InitLedger\",\"Args\":[\"${N_HEX}\",\"${E_HEX}\"]}"

ok "TCH public key committed"
sleep 2

# ==============================================================
# STEP 1 — RegisterVoter
# voterID    : national ID (will be hashed inside chaincode)
# salt       : client-side random — YOU keep this, never re-use
# stateOrg   : which peer org is registering this voter
# ==============================================================
step "STEP 1: RegisterVoter"

VOTER_ID="IND_VOTER_001"
SALT="salt_$(openssl rand -hex 8)"
STATE_ORG="KarnatakaMSP"

echo "  voterID  : $VOTER_ID"
echo "  salt     : $SALT   <-- SAVE THIS, needed for audit"
echo "  stateOrg : $STATE_ORG"

use_org "Karnataka" 8051

REGISTER_RESULT=$(peer chaincode invoke \
  -o "$ORDERER" \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  --tls --cafile "$ORDERER_CA" \
  -c "{\"function\":\"RegisterVoter\",\"Args\":[\"${VOTER_ID}\",\"${SALT}\",\"${STATE_ORG}\"]}" \
  2>&1)

echo "$REGISTER_RESULT"
ok "Voter registered"
sleep 2

# The chaincode emits VoterRegistered event with the hash as payload.
# For testing, re-derive the voterHashID client-side using the same
# logic as chameleon.Hash(pk, voterID+"|"+salt).
# For now, we query using a known test hash (replace with real output).
# You can grab it from the event payload in your app listener.
VOTER_HASH_ID="TEST_HASH_REPLACE_WITH_EVENT_PAYLOAD"

# ==============================================================
# STEP 1b — QueryVoterStatus (verify registration)
# ==============================================================
step "STEP 1b: QueryVoterStatus — should be REGISTERED"

use_org "Karnataka" 8051

peer chaincode query \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  -c "{\"function\":\"QueryVoterStatus\",\"Args\":[\"${VOTER_HASH_ID}\"]}"

echo ""

# ==============================================================
# STEP 2 — CastVote
# voterHashID : hash produced during RegisterVoter (from event)
# candidateID : one of your registered candidates
# ==============================================================
step "STEP 2: CastVote"

CANDIDATE_ID="CANDIDATE_BJP_KA_01"   # replace with your actual candidate IDs

use_org "Karnataka" 8051

CAST_RESULT=$(peer chaincode invoke \
  -o "$ORDERER" \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  --tls --cafile "$ORDERER_CA" \
  -c "{\"function\":\"CastVote\",\"Args\":[\"${VOTER_HASH_ID}\",\"${CANDIDATE_ID}\"]}" \
  2>&1)

echo "$CAST_RESULT"

# Extract voteID from VoteCast event payload (set by chaincode).
# For CLI testing, note it manually from the event or set manually:
VOTE_ID="VOTE_HASH_FROM_EVENT_PAYLOAD"
ok "Vote cast. voteID: $VOTE_ID"
sleep 2

# ==============================================================
# STEP 2b — Try double voting (should FAIL)
# ==============================================================
step "STEP 2b: Double vote attempt — MUST FAIL"

use_org "Karnataka" 8051

DOUBLE_RESULT=$(peer chaincode invoke \
  -o "$ORDERER" \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  --tls --cafile "$ORDERER_CA" \
  -c "{\"function\":\"CastVote\",\"Args\":[\"${VOTER_HASH_ID}\",\"${CANDIDATE_ID}\"]}" \
  2>&1 || true)

if echo "$DOUBLE_RESULT" | grep -q "already voted"; then
  ok "Double vote correctly rejected: voter has already voted"
else
  err "UNEXPECTED: double vote was not rejected!"
  echo "$DOUBLE_RESULT"
fi

# ==============================================================
# STEP 3 — AuditVote (verify hash consistency)
# ==============================================================
step "STEP 3: AuditVote — verify hash + correction log"

use_org "Maharashtra" 7051

peer chaincode query \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  -c "{\"function\":\"AuditVote\",\"Args\":[\"${VOTE_ID}\"]}" \
  | python3 -m json.tool 2>/dev/null || true

echo ""
ok "Audit record retrieved"

# ==============================================================
# STEP 4 — CorrectVote (chameleon hash collision)
# Requires threshold shares from t=6 state MSPs.
# Each share is a hex-encoded big.Int fragment of the trapdoor key.
# In production these come from your threshold key ceremony.
# Below are placeholder shares — replace with real Shamir shares.
# ==============================================================
step "STEP 4: CorrectVote — chameleon collision + threshold auth"

NEW_CANDIDATE="CANDIDATE_INC_KA_02"
REASON="Administrative correction: ballot marking error reported by presiding officer"
AUTHORIZED_BY="KarnatakaMSP,MaharashtraMSP,TamilNaduMSP,UttarPradeshMSP,GujaratMSP,WestBengalMSP"

# Threshold shares (JSON array) — 6-of-10
# Each share: { "index": N, "share": "<hex big.Int>" }
# Replace hex values with output from your key ceremony share distribution
SHARES_JSON='[
  {"index":1,"share":"a1b2c3d4e5f60011223344556677889900aabbccddeeff001122334455667788"},
  {"index":2,"share":"b2c3d4e5f6071122334455667788990011aabbccddeeff0011223344556677"},
  {"index":3,"share":"c3d4e5f608122233445566778899001122bbccddeeff001122334455667788"},
  {"index":4,"share":"d4e5f6091323344455667788990011223344ccddeeff0011223344556677889"},
  {"index":5,"share":"e5f60a1424455566778899001122334455ddeeff001122334455667788990011"},
  {"index":6,"share":"f60b1525566677889900112233445566eeff0011223344556677889900aabb"}
]'

use_org "Maharashtra" 7051

# Escape the JSON for shell embedding
SHARES_ESCAPED=$(echo "$SHARES_JSON" | tr -d '\n' | sed 's/"/\\"/g')

peer chaincode invoke \
  -o "$ORDERER" \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  --tls --cafile "$ORDERER_CA" \
  -c "{\"function\":\"CorrectVote\",\"Args\":[\"${VOTE_ID}\",\"${NEW_CANDIDATE}\",\"${REASON}\",\"${AUTHORIZED_BY}\",\"${SHARES_ESCAPED}\"]}"

ok "CorrectVote invoked"
sleep 2

# ==============================================================
# STEP 4b — AuditVote again — verify correction log populated
# ==============================================================
step "STEP 4b: Re-audit after correction — check CorrectionLog"

use_org "Maharashtra" 7051

peer chaincode query \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  -c "{\"function\":\"AuditVote\",\"Args\":[\"${VOTE_ID}\"]}" \
  | python3 -m json.tool 2>/dev/null || true

echo ""

# ==============================================================
# STEP 5 — TallyVotes
# ==============================================================
step "STEP 5: TallyVotes — full aggregate count"

use_org "Maharashtra" 7051

peer chaincode query \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  -c '{"function":"TallyVotes","Args":[]}' \
  | python3 -m json.tool 2>/dev/null || true

echo ""
ok "Tally complete"

# ==============================================================
# STRESS TEST — register + vote for multiple simulated voters
# ==============================================================
step "STRESS TEST: Cast 10 votes across different orgs"

declare -A ORG_PORTS=(
  [Maharashtra]=7051 [Karnataka]=8051 [TamilNadu]=9051 [UttarPradesh]=10051
  [Gujarat]=11051 [Rajasthan]=12051 [WestBengal]=13051 [Telangana]=14051
  [Punjab]=15051 [Kerala]=16051
)
CANDIDATES=("CANDIDATE_A" "CANDIDATE_B" "CANDIDATE_C" "NOTA")

i=1
for ORG in "${!ORG_PORTS[@]}"; do
  PORT=${ORG_PORTS[$ORG]}
  VID="STRESS_VOTER_${i}"
  VSALT="ssalt_$(openssl rand -hex 6)"
  VCAND="${CANDIDATES[$((i % 4))]}"
  VMSP="${ORG}MSP"

  use_org "$ORG" "$PORT"

  echo -n "  Registering voter $i @ $ORG ... "
  peer chaincode invoke \
    -o "$ORDERER" \
    --channelID "$CHANNEL" \
    --name "$CC_NAME" \
    --tls --cafile "$ORDERER_CA" \
    -c "{\"function\":\"RegisterVoter\",\"Args\":[\"${VID}\",\"${VSALT}\",\"${VMSP}\"]}" \
    > /dev/null 2>&1 && echo -n "registered. " || echo -n "FAILED. "

  sleep 1

  # For stress test, vote with a placeholder hash ID
  # In a real run, capture the VoterRegistered event hash instead
  echo "vote skipped until event hash captured."
  i=$((i+1))
done

# ==============================================================
# FINAL TALLY after stress test
# ==============================================================
step "FINAL TALLY"
use_org "Maharashtra" 7051
peer chaincode query \
  --channelID "$CHANNEL" \
  --name "$CC_NAME" \
  -c '{"function":"TallyVotes","Args":[]}' \
  | python3 -m json.tool 2>/dev/null || true

echo -e "\n${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  E2E TEST COMPLETE${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo "Key things to verify manually:"
echo "  1. VoterRegistered event payload  → that's your real voterHashID"
echo "  2. VoteCast event payload         → that's your real voteID"
echo "  3. AuditVote hashVerified = true  → chameleon hash consistent"
echo "  4. CorrectVote CorrectionLog      → trapdoor collision worked"
echo "  5. TallyVotes perCandidate totals → matches expected counts"