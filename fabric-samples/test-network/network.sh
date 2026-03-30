#!/bin/bash
################################################################################
# network.sh — Bootstrap the National Voting Blockchain Network
# Usage:
#   ./network.sh up          — start network, create channel, deploy chaincode
#   ./network.sh down        — teardown everything
#   ./network.sh restart     — down + up
#   ./network.sh deployCC    — (re)install and approve chaincode only
################################################################################

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
CHANNEL_NAME="nationalvotingchannel"
CC_NAME="voting"
CC_VERSION="1.0"
CC_SEQUENCE="1"
CC_SRC_PATH="../chaincode/voting/go"
DELAY=3
MAX_RETRY=5

export FABRIC_CFG_PATH="${PWD}/configtx"
export PATH="${PWD}/../../bin:$PATH"

# ── Color helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fatal()   { echo -e "${RED}[FATAL]${NC} $*"; exit 1; }

# ── State orgs array ──────────────────────────────────────────────────────────
declare -A ORGS=(
  [Maharashtra]="MaharashtraMSP:peer0.maharashtra.election.gov.in:7051:7055"
  [Karnataka]="KarnatakaMSP:peer0.karnataka.election.gov.in:8051:7056"
  [TamilNadu]="TamilNaduMSP:peer0.tamilnadu.election.gov.in:9051:7057"
  [UttarPradesh]="UttarPradeshMSP:peer0.uttarpradesh.election.gov.in:10051:7058"
  [Gujarat]="GujaratMSP:peer0.gujarat.election.gov.in:11051:7059"
  [Rajasthan]="RajasthanMSP:peer0.rajasthan.election.gov.in:12051:7060"
  [WestBengal]="WestBengalMSP:peer0.westbengal.election.gov.in:13051:7061"
  [Telangana]="TelanganaMSP:peer0.telangana.election.gov.in:14051:7062"
  [Punjab]="PunjabMSP:peer0.punjab.election.gov.in:15051:7063"
  [Kerala]="KeralaMSP:peer0.kerala.election.gov.in:16051:7064"
)

ORG_DOMAINS=(
  "maharashtra" "karnataka" "tamilnadu" "uttarpradesh" "gujarat"
  "rajasthan"   "westbengal" "telangana" "punjab" "kerala"
)

# ── Set peer env for a given org ──────────────────────────────────────────────
setGlobals() {
  local ORG=$1
  local INFO="${ORGS[$ORG]}"
  local MSP=$(echo $INFO | cut -d: -f1)
  local PEER=$(echo $INFO | cut -d: -f2)
  local PORT=$(echo $INFO | cut -d: -f3)
  local DOMAIN=$(echo $PEER | sed 's/peer0\.//')

  export CORE_PEER_LOCALMSPID="$MSP"
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_TLS_ROOTCERT_FILE="${PWD}/network/organizations/peerOrganizations/${DOMAIN}/peers/${PEER}/tls/ca.crt"
  export CORE_PEER_MSPCONFIGPATH="${PWD}/network/organizations/peerOrganizations/${DOMAIN}/users/Admin@${DOMAIN}/msp"
  export CORE_PEER_ADDRESS="${PEER}:${PORT}"
  info "Globals set → $ORG ($MSP @ $PEER:$PORT)"
}

ORDERER_CA="${PWD}/network/organizations/ordererOrganizations/eci.election.gov.in/orderers/orderer0.eci.election.gov.in/tls/ca.crt"
ORDERER_ADMIN_TLS="${PWD}/network/organizations/ordererOrganizations/eci.election.gov.in/orderers/orderer0.eci.election.gov.in/tls/server.crt"

# ── Step 1: Generate crypto material ─────────────────────────────────────────
generateCrypto() {
  info "Generating crypto material (cryptogen)..."
  cryptogen generate \
    --config=network/crypto-config.yaml \
    --output=network/organizations
  success "Crypto material generated."
}

# ── Step 2: Generate genesis block & channel tx ───────────────────────────────
generateArtifacts() {
  info "Generating channel artifacts..."
  mkdir -p network/channel-artifacts

  configtxgen \
    -profile NationalVotingGenesis \
    -channelID nationalvotingchannel \
    -outputBlock network/channel-artifacts/nationalvotingchannel.block

  configtxgen \
    -profile NationalVotingChannel \
    -outputCreateChannelTx network/channel-artifacts/${CHANNEL_NAME}.tx \
    -channelID $CHANNEL_NAME

  for ORG in "${!ORGS[@]}"; do
    configtxgen \
      -profile NationalVotingChannel \
      -outputAnchorPeersUpdate network/channel-artifacts/${ORG}MSPanchors.tx \
      -channelID $CHANNEL_NAME \
      -asOrg "${ORG}MSP" || warn "Anchor peer tx skipped for $ORG (may already exist)"
  done
  success "Channel artifacts ready."
}

# ── Step 3: Start Docker network ──────────────────────────────────────────────
startNetwork() {
  info "Starting Docker containers..."
  docker-compose -f compose/compose-test-net.yaml up -d
  info "Waiting ${DELAY}s for containers to stabilise..."
  sleep $DELAY
  success "Network up."
}

# ── Step 4: Create & join channel ─────────────────────────────────────────────
createChannel() {
  info "Creating channel: $CHANNEL_NAME"
  osnadmin channel join \
    --channelID $CHANNEL_NAME \
    --config-block network/channel-artifacts/nationalvotingchannel.block \
    --orderer-address localhost:7053 \
    --ca-file "${PWD}/network/organizations/ordererOrganizations/eci.election.gov.in/orderers/orderer0.eci.election.gov.in/tls/ca.crt" \
    --client-cert "${PWD}/network/organizations/ordererOrganizations/eci.election.gov.in/orderers/orderer0.eci.election.gov.in/tls/server.crt" \
    --client-key "${PWD}/network/organizations/ordererOrganizations/eci.election.gov.in/orderers/orderer0.eci.election.gov.in/tls/server.key"
  success "Channel created."
}

joinChannel() {
  info "Joining all state peers to channel..."
  for ORG in "${!ORGS[@]}"; do
    setGlobals "$ORG"
    local RETRY=0
    while [ $RETRY -lt $MAX_RETRY ]; do
      peer channel join \
        -b network/channel-artifacts/${CHANNEL_NAME}.block \
        --tls --cafile "$ORDERER_CA" && break
      RETRY=$((RETRY+1))
      warn "$ORG join failed, retry $RETRY/$MAX_RETRY..."
      sleep $DELAY
    done
    [ $RETRY -eq $MAX_RETRY ] && fatal "$ORG failed to join channel after $MAX_RETRY retries."
    success "$ORG joined channel."
  done
}

updateAnchorPeers() {
  info "Updating anchor peers..."
  for ORG in "${!ORGS[@]}"; do
    setGlobals "$ORG"
    peer channel update \
      -o orderer0.eci.election.gov.in:7050 \
      -c $CHANNEL_NAME \
      -f network/channel-artifacts/${ORG}MSPanchors.tx \
      --tls --cafile "$ORDERER_CA"
    success "$ORG anchor peer updated."
  done
}

# ── Step 5: Package & install chaincode ───────────────────────────────────────
packageChaincode() {
  info "Packaging chaincode..."
  peer lifecycle chaincode package ${CC_NAME}.tar.gz \
    --path $CC_SRC_PATH \
    --lang golang \
    --label ${CC_NAME}_${CC_VERSION}
  success "Chaincode packaged: ${CC_NAME}.tar.gz"
}

installChaincode() {
  info "Installing chaincode on all state peers..."
  for ORG in "${!ORGS[@]}"; do
    setGlobals "$ORG"
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    success "Installed on $ORG"
  done
}

# ── Step 6: Approve chaincode per org ─────────────────────────────────────────
approveChaincode() {
  info "Querying installed chaincode package ID..."
  setGlobals "Maharashtra"
  CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled \
    --output json | jq -r ".installed_chaincodes[] | select(.label==\"${CC_NAME}_${CC_VERSION}\") | .package_id")
  info "Package ID: $CC_PACKAGE_ID"

  info "Approving chaincode for all state orgs..."
  for ORG in "${!ORGS[@]}"; do
    setGlobals "$ORG"
    peer lifecycle chaincode approveformyorg \
      -o orderer0.eci.election.gov.in:7050 \
      --channelID $CHANNEL_NAME \
      --name $CC_NAME \
      --version $CC_VERSION \
      --package-id $CC_PACKAGE_ID \
      --sequence $CC_SEQUENCE \
      --tls --cafile "$ORDERER_CA"
    success "$ORG approved chaincode."
  done
}

# ── Step 7: Check commit readiness & commit ───────────────────────────────────
commitChaincode() {
  info "Checking commit readiness..."
  setGlobals "Maharashtra"
  peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls --cafile "$ORDERER_CA" \
    --output json

  info "Committing chaincode to channel..."

  # Build --peerAddresses and --tlsRootCertFiles flags for all orgs
  PEER_FLAGS=""
  for ORG in "${!ORGS[@]}"; do
    local INFO="${ORGS[$ORG]}"
    local PEER=$(echo $INFO | cut -d: -f2)
    local PORT=$(echo $INFO | cut -d: -f3)
    local DOMAIN=$(echo $PEER | sed 's/peer0\.//')
    PEER_FLAGS+=" --peerAddresses ${PEER}:${PORT}"
    PEER_FLAGS+=" --tlsRootCertFiles ${PWD}/network/organizations/peerOrganizations/${DOMAIN}/peers/${PEER}/tls/ca.crt"
  done

  setGlobals "Maharashtra"
  peer lifecycle chaincode commit \
    -o orderer0.eci.election.gov.in:7050 \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    $PEER_FLAGS \
    --tls --cafile "$ORDERER_CA"

  success "Chaincode committed."
}

# ── Step 8: Init chaincode (set TCH key) ─────────────────────────────────────
initChaincode() {
  info "Initialising chaincode — storing TCH public key..."
  setGlobals "Maharashtra"

  # TCH key values should match what you generated in your chameleon keygen utility
  # Replace these with your actual generated key components
  peer chaincode invoke \
    -o orderer0.eci.election.gov.in:7050 \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    -c '{"function":"InitTCHKey","Args":["<TCH_P>","<TCH_Q>","<TCH_G>","<TCH_Y>"]}' \
    --tls --cafile "$ORDERER_CA"

  sleep 3
  success "Chaincode initialised."
}

# ── Teardown ──────────────────────────────────────────────────────────────────
networkDown() {
  warn "Tearing down network..."
  docker-compose -f compose/compose-test-net.yaml down --volumes --remove-orphans
  docker rm -f $(docker ps -aq --filter "name=dev-peer") 2>/dev/null || true
  rm -rf network/organizations network/channel-artifacts *.tar.gz
  success "Network torn down."
}

# ── Main entrypoint ───────────────────────────────────────────────────────────
MODE=${1:-"up"}
case $MODE in
  up)
    generateCrypto
    generateArtifacts
    startNetwork
    createChannel
    joinChannel
    updateAnchorPeers
    packageChaincode
    installChaincode
    approveChaincode
    commitChaincode
    initChaincode
    echo ""
    success "═══════════════════════════════════════════════"
    success "  National Voting Blockchain Network is LIVE   "
    success "  Channel : $CHANNEL_NAME"
    success "  Chaincode: $CC_NAME v$CC_VERSION"
    success "═══════════════════════════════════════════════"
    ;;
  down)
    networkDown ;;
  restart)
    networkDown
    sleep 2
    $0 up ;;
  deployCC)
    packageChaincode
    installChaincode
    approveChaincode
    commitChaincode
    ;;
  *)
    echo "Usage: $0 [up|down|restart|deployCC]"
    exit 1 ;;
esac