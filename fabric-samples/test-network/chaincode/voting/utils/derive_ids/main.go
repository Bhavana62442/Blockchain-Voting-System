// derive_ids.go — UPDATED: reads tch_public_key.json from keygen_ceremony.go
// Run: go run derive_ids.go
//
// This derives the exact same voterHashID that RegisterVoter stores on-chain,
// and the voteID that CastVote stores — so you can plug them into the CLI
// test script without waiting for event listeners.
//
// Put this file in:
//   $HOME/Blockchain-Voting-System/fabric-samples/voting/
// then run:
//   go run derive_ids.go

package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"time"

	// Same package your chaincode imports
	"github.com/hyperledger/fabric-samples/voting/chameleon"
	"math/big"
)

func main() {
	// ── INPUTS — match exactly what you pass to RegisterVoter ──
	voterID  := "IND_VOTER_001"
	salt     := "salt_YOUR_SALT_HERE"   // the one you used in RegisterVoter
	stateOrg := "KarnatakaMSP"

	// ── TCH public key — same values you passed to InitLedger ──
	nHex := "00c0f456b8a1f3e2d9c7b5a4389216fe7d04bc5e1a98237640f5bc9e32d1a87f6b"
	eHex := "010001"

	nBytes, _ := hex.DecodeString(nHex)
	eBytes, _ := hex.DecodeString(eHex)
	pk := &chameleon.TCHPublicKey{
		N: new(big.Int).SetBytes(nBytes),
		E: new(big.Int).SetBytes(eBytes),
	}

	// ── Derive voterHashID ──
	message := voterID + "|" + salt
	tch, err := chameleon.Hash(pk, message)
	if err != nil {
		fmt.Fprintf(os.Stderr, "chameleon.Hash error: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("═══════════════════════════════════════════")
	fmt.Println("  VOTER IDENTITY DERIVATION")
	fmt.Println("═══════════════════════════════════════════")
	fmt.Printf("  voterID        : %s\n", voterID)
	fmt.Printf("  salt           : %s\n", salt)
	fmt.Printf("  stateOrg       : %s\n", stateOrg)
	fmt.Printf("  message hashed : %s\n", message)
	fmt.Println("───────────────────────────────────────────")
	fmt.Printf("  voterHashID (H): %s\n", tch.H)
	fmt.Printf("  randomness (R) : %s\n", tch.R)
	fmt.Println("")
	fmt.Println("  → Use voterHashID as the 1st arg to CastVote")
	fmt.Println("  → Use voterHashID for QueryVoterStatus")

	// ── Simulate voteID derivation (matches CastVote logic) ──
	// CastVote does: voteIDRaw = voterHashID + ts
	// We use a fixed timestamp here just to show the pattern.
	// In practice, the real voteID comes from the VoteCast event.
	ts := time.Now().UTC().Format(time.RFC3339Nano)
	raw := tch.H + ts
	h := sha256.Sum256([]byte(raw))
	voteID := hex.EncodeToString(h[:])

	fmt.Println("")
	fmt.Println("═══════════════════════════════════════════")
	fmt.Println("  VOTE ID (approximate — exact from event)")
	fmt.Println("═══════════════════════════════════════════")
	fmt.Printf("  timestamp used : %s\n", ts)
	fmt.Printf("  voteID (sha256): %s\n", voteID)
	fmt.Println("")
	fmt.Println("  NOTE: voteID depends on the exact nanosecond")
	fmt.Println("  timestamp the peer uses during CastVote.")
	fmt.Println("  Get the real voteID from the VoteCast event.")
	fmt.Println("")

	// ── Verify hash round-trip ──
	verified := chameleon.Verify(pk, message, tch)
	fmt.Printf("  Hash round-trip verify: %v\n", verified)

	// ── Print ready-to-paste CLI commands ──
	fmt.Println("")
	fmt.Println("═══════════════════════════════════════════")
	fmt.Println("  READY-TO-PASTE CLI COMMANDS")
	fmt.Println("═══════════════════════════════════════════")
	fmt.Printf(`
# QueryVoterStatus
peer chaincode query \
  --channelID nationalvotingchannel \
  --name voting \
  -c '{"function":"QueryVoterStatus","Args":["%s"]}'

# CastVote
peer chaincode invoke \
  -o orderer0.eci.election.gov.in:7050 \
  --channelID nationalvotingchannel \
  --name voting \
  --tls --cafile "$ORDERER_CA" \
  -c '{"function":"CastVote","Args":["%s","CANDIDATE_BJP_KA_01"]}'

`, tch.H, tch.H)
}