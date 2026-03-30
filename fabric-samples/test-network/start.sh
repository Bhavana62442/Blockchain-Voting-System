#!/usr/bin/env bash
# =============================================================================
# setup-network.sh — Full setup for Blockchain Voting System (3-org, LevelDB)
# Maharashtra | Karnataka | TamilNadu  +  3 Raft orderers (ECI)
#
# Usage:  ./setup-network.sh          — full setup
#         ./setup-network.sh down     — tear everything down
#         ./setup-network.sh channel  — channel + chaincode only (network already up)
# =============================================================================

set -e

# ── Config ────────────────────────────────────────────────────────────────────
CHANNEL_NAME="nationalvotingchannel"
CC_NAME="voting"
CC_VERSION="1.0"
CC_PATH="chaincode/voting/go"
CC_LABEL="${CC_NAME}_${CC_VERSION}"
COMPOSE_FILE="compose/compose-test-net.yaml"
FABRIC_BIN="/home/bhavana/Blockchain-Voting-System/bin"

export PATH=$PATH:$FABRIC_BIN
export FABRIC_CFG_PATH=${PWD}/configtx

export ORDERER_CA=${PWD}/organizations/ordererOrganizations/eci.election.gov.in/tlsca/tlsca.eci.election.gov.in-cert.pem

declare -A ORGS=(
  [Maharashtra]=7051
  [Karnataka]=8051
  [TamilNadu]=9051
)

# ── Helpers ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${YELLOW}[INFO] $*${NC}"; }
success() { echo -e "${GREEN}[OK]   $*${NC}"; }
fatal()   { echo -e "${RED}[ERR]  $*${NC}"; exit 1; }

setGlobals() {
  local ORG=$1
  local LOWER=$(echo $ORG | tr '[:upper:]' '[:lower:]')
  export CORE_PEER_LOCALMSPID="${ORG}MSP"
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/${LOWER}.election.gov.in/tlsca/tlsca.${LOWER}.election.gov.in-cert.pem
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/${LOWER}.election.gov.in/users/Admin@${LOWER}.election.gov.in/msp
  export CORE_PEER_ADDRESS=localhost:${ORGS[$ORG]}
}

# ── Down ──────────────────────────────────────────────────────────────────────
networkDown() {
  info "Tearing down network..."
  docker-compose -f $COMPOSE_FILE down --volumes --remove-orphans 2>/dev/null || true
  docker rm -f $(docker ps -aq --filter "name=dev-peer") 2>/dev/null || true
  docker rmi -f $(docker images | grep "dev-peer" | awk '{print $3}') 2>/dev/null || true
  sudo rm -rf organizations/peerOrganizations organizations/ordererOrganizations
  sudo rm -rf compose/organizations/ordererOrganizations compose/organizations/peerOrganizations
  rm -rf network/channel-artifacts voting.tar.gz
  success "Network down and cleaned."
}

# ── Step 1: Crypto ────────────────────────────────────────────────────────────
generateCrypto() {
  info "Generating crypto material..."
  cryptogen generate --config=./crypto-config.yaml --output="organizations" \
    || fatal "cryptogen failed"
  success "Crypto material generated."
}

# ── Step 2: Symlinks ──────────────────────────────────────────────────────────
fixSymlinks() {
  info "Fixing compose/organizations symlinks..."
  sudo rm -rf compose/organizations/ordererOrganizations compose/organizations/peerOrganizations
  sudo chown $USER:$USER compose/organizations
  ln -sf ../../organizations/ordererOrganizations compose/organizations/ordererOrganizations
  ln -sf ../../organizations/peerOrganizations compose/organizations/peerOrganizations
  success "Symlinks created."
}

# ── Step 3: /etc/hosts ────────────────────────────────────────────────────────
fixHosts() {
  info "Adding hostnames to /etc/hosts..."
  declare -a HOSTS=(
    "orderer0.eci.election.gov.in"
    "orderer1.eci.election.gov.in"
    "orderer2.eci.election.gov.in"
    "peer0.maharashtra.election.gov.in"
    "peer0.karnataka.election.gov.in"
    "peer0.tamilnadu.election.gov.in"
  )
  for h in "${HOSTS[@]}"; do
    grep -q "$h" /etc/hosts || echo "127.0.0.1 $h" | sudo tee -a /etc/hosts > /dev/null
  done
  success "Hostnames set."
}

# ── Step 4: Genesis block ─────────────────────────────────────────────────────
generateArtifacts() {
  info "Generating channel artifacts..."
  mkdir -p network/channel-artifacts
  configtxgen \
    -profile NationalVotingChannelWithOrderer \
    -outputBlock network/channel-artifacts/${CHANNEL_NAME}.block \
    -channelID $CHANNEL_NAME \
    || fatal "configtxgen failed"
  success "Genesis block created ($(du -h network/channel-artifacts/${CHANNEL_NAME}.block | cut -f1))."
}

# ── Step 5: Start Docker network ──────────────────────────────────────────────
startNetwork() {
  info "Starting Docker containers..."
  docker-compose -f $COMPOSE_FILE up -d || fatal "docker-compose up failed"
  info "Waiting 10s for containers to stabilise..."
  sleep 10
  local RUNNING=$(docker ps --filter "name=compose_" --filter "status=running" -q | wc -l)
  success "$RUNNING containers running."
}

# ── Step 6: Join orderers ─────────────────────────────────────────────────────
joinOrderers() {
  info "Joining orderers to channel..."
  for i in 0 1 2; do
    local PORT=$((7053 + i*100))
    osnadmin channel join \
      --channelID $CHANNEL_NAME \
      --config-block network/channel-artifacts/${CHANNEL_NAME}.block \
      --orderer-address localhost:${PORT} \
      --ca-file "$ORDERER_CA" \
      --client-cert "${PWD}/organizations/ordererOrganizations/eci.election.gov.in/orderers/orderer${i}.eci.election.gov.in/tls/server.crt" \
      --client-key  "${PWD}/organizations/ordererOrganizations/eci.election.gov.in/orderers/orderer${i}.eci.election.gov.in/tls/server.key" \
      || fatal "orderer${i} join failed"
    success "orderer${i} joined."
  done
}

# ── Step 7: Join peers ────────────────────────────────────────────────────────
joinPeers() {
  info "Joining peers to channel..."
  for ORG in "${!ORGS[@]}"; do
    setGlobals $ORG
    peer channel join \
      -b network/channel-artifacts/${CHANNEL_NAME}.block \
      --tls --cafile "$ORDERER_CA" \
      || fatal "$ORG peer join failed"
    success "$ORG joined."
  done
}

# ── Step 8: Anchor peers ──────────────────────────────────────────────────────
updateAnchors() {
  info "Updating anchor peers..."
  for ORG in "${!ORGS[@]}"; do
    local LOWER=$(echo $ORG | tr '[:upper:]' '[:lower:]')
    local PORT=${ORGS[$ORG]}
    setGlobals $ORG

    peer channel fetch config /tmp/config_block.pb \
      -o orderer0.eci.election.gov.in:7050 -c $CHANNEL_NAME \
      --tls --cafile "$ORDERER_CA" 2>/dev/null

    configtxlator proto_decode --input /tmp/config_block.pb --type common.Block \
      | jq .data.data[0].payload.data.config > /tmp/config.json

    jq --arg org "$ORG" \
       --arg host "peer0.${LOWER}.election.gov.in" \
       --argjson port ${PORT} \
      'del(.channel_group.groups.Application.groups[$org].values.AnchorPeers) |
       .channel_group.groups.Application.groups[$org].values.AnchorPeers = {
         "mod_policy": "Admins",
         "value": {"anchor_peers": [{"host": $host, "port": $port}]},
         "version": "0"
       }' /tmp/config.json > /tmp/modified_config.json

    configtxlator proto_encode --input /tmp/config.json \
      --type common.Config --output /tmp/config.pb
    configtxlator proto_encode --input /tmp/modified_config.json \
      --type common.Config --output /tmp/modified_config.pb
    configtxlator compute_update --channel_id $CHANNEL_NAME \
      --original /tmp/config.pb --updated /tmp/modified_config.pb \
      --output /tmp/anchor_update.pb 2>/dev/null || { info "No anchor change for $ORG"; continue; }

    DECODED=$(configtxlator proto_decode --input /tmp/anchor_update.pb --type common.ConfigUpdate)
    echo "{\"payload\":{\"header\":{\"channel_header\":{\"channel_id\":\"${CHANNEL_NAME}\",\"type\":2}},\"data\":{\"config_update\":${DECODED}}}}" \
      | jq . > /tmp/anchor_envelope.json
    configtxlator proto_encode --input /tmp/anchor_envelope.json \
      --type common.Envelope --output /tmp/anchor_envelope.pb

    peer channel update \
      -o orderer0.eci.election.gov.in:7050 -c $CHANNEL_NAME \
      -f /tmp/anchor_envelope.pb --tls --cafile "$ORDERER_CA" \
      || fatal "$ORG anchor update failed"
    success "$ORG anchor peer set."
  done
}

# ── Step 9: Package & install chaincode ───────────────────────────────────────
installChaincode() {
  info "Packaging chaincode..."
  peer lifecycle chaincode package ${CC_NAME}.tar.gz \
    --path $CC_PATH \
    --lang golang \
    --label $CC_LABEL \
    || fatal "chaincode package failed"
  success "Chaincode packaged."

  info "Installing chaincode on all peers..."
  for ORG in "${!ORGS[@]}"; do
    setGlobals $ORG
    peer lifecycle chaincode install ${CC_NAME}.tar.gz \
      || fatal "chaincode install failed on $ORG"
    success "Installed on $ORG."
  done
}

# ── Step 10: Approve & commit chaincode ───────────────────────────────────────
deployChaincode() {
  # Get package ID from last peer that installed
  setGlobals Maharashtra
  local CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled 2>/dev/null \
    | grep $CC_LABEL | awk '{print $3}' | tr -d ',')
  [ -z "$CC_PACKAGE_ID" ] && fatal "Could not find package ID"
  info "Package ID: $CC_PACKAGE_ID"

  info "Approving chaincode for all orgs..."
  for ORG in "${!ORGS[@]}"; do
    setGlobals $ORG
    peer lifecycle chaincode approveformyorg \
      -o orderer0.eci.election.gov.in:7050 \
      --channelID $CHANNEL_NAME \
      --name $CC_NAME --version $CC_VERSION \
      --package-id $CC_PACKAGE_ID \
      --sequence 1 \
      --tls --cafile "$ORDERER_CA" \
      || fatal "approve failed for $ORG"
    success "$ORG approved."
  done

  info "Checking commit readiness..."
  setGlobals Maharashtra
  peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME --version $CC_VERSION --sequence 1 \
    --tls --cafile "$ORDERER_CA" --output json

  info "Committing chaincode..."
  local PEER_ARGS=""
  for ORG in "${!ORGS[@]}"; do
    local LOWER=$(echo $ORG | tr '[:upper:]' '[:lower:]')
    PEER_ARGS+=" --peerAddresses localhost:${ORGS[$ORG]}"
    PEER_ARGS+=" --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/${LOWER}.election.gov.in/tlsca/tlsca.${LOWER}.election.gov.in-cert.pem"
  done

  setGlobals Maharashtra
  peer lifecycle chaincode commit \
    -o orderer0.eci.election.gov.in:7050 \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME --version $CC_VERSION --sequence 1 \
    --tls --cafile "$ORDERER_CA" \
    $PEER_ARGS \
    || fatal "chaincode commit failed"
  success "Chaincode committed successfully!"

  info "Verifying commit..."
  peer lifecycle chaincode querycommitted \
    --channelID $CHANNEL_NAME --name $CC_NAME \
    --tls --cafile "$ORDERER_CA"
}

# ── Main ──────────────────────────────────────────────────────────────────────
MODE=${1:-"all"}

case $MODE in
  down)
    networkDown
    ;;
  channel)
    joinOrderers
    joinPeers
    updateAnchors
    installChaincode
    deployChaincode
    ;;
  all)
    networkDown
    generateCrypto
    fixSymlinks
    fixHosts
    generateArtifacts
    startNetwork
    joinOrderers
    joinPeers
    updateAnchors
    installChaincode
    deployChaincode
    echo ""
    success "============================================"
    success " Network fully up and chaincode deployed!"
    success " Channel : $CHANNEL_NAME"
    success " Orgs    : Maharashtra (7051) Karnataka (8051) TamilNadu (9051)"
    success " Next    : run InitLedger with TCH public key"
    success "============================================"
    ;;
  *)
    echo "Usage: $0 [all|down|channel]"
    exit 1
    ;;
esac