// correct_vote_test.go
// Builds and prints the exact peer chaincode invoke command for CorrectVote,
// loading real Shamir shares from tch_shares_6of10.json.
//
// Usage:
//   go run correct_vote_test.go <voteID> <newCandidateID>
//   go run correct_vote_test.go abc123def456 CANDIDATE_INC_KA_02
//
// Place in: ~/Blockchain-Voting-System/fabric-samples/test-network/chaincode/voting/go/

package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"os"
	"strings"

	"github.com/hyperledger/fabric-samples/voting/chameleon"
)

type ShareFile struct {
	OrgName  string `json:"orgName"`
	Index    int    `json:"index"`
	ShareHex string `json:"shareHex"`
}

type PublicKeyFile struct {
	NHex string `json:"nHex"`
	EHex string `json:"eHex"`
}

// Chaincode expects this exact JSON shape in sharesJSON arg
type ChainShareArg struct {
	Index int    `json:"index"`
	Share string `json:"share"` // hex-encoded big.Int
}

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintln(os.Stderr, "Usage: go run correct_vote_test.go <voteID> <newCandidateID>")
		fmt.Fprintln(os.Stderr, "Example: go run correct_vote_test.go abc123 CANDIDATE_INC_KA_02")
		os.Exit(1)
	}

	voteID := os.Args[1]
	newCandidate := os.Args[2]

	// ── Load public key ──
	pkData, err := os.ReadFile("tch_public_key.json")
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR: tch_public_key.json not found. Run keygen_ceremony.go first.")
		os.Exit(1)
	}
	var pkFile PublicKeyFile
	json.Unmarshal(pkData, &pkFile)
	nBytes, _ := hex.DecodeString(pkFile.NHex)
	eBytes, _ := hex.DecodeString(pkFile.EHex)
	pk := &chameleon.TCHPublicKey{
		N: new(big.Int).SetBytes(nBytes),
		E: new(big.Int).SetBytes(eBytes),
	}
	fmt.Printf("Loaded public key — N length: %d bits\n", pk.N.BitLen())

	// ── Load 6-of-10 shares ──
	sharesData, err := os.ReadFile("tch_shares_6of10.json")
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR: tch_shares_6of10.json not found. Run keygen_ceremony.go first.")
		os.Exit(1)
	}
	var shareFiles []ShareFile
	json.Unmarshal(sharesData, &shareFiles)

	fmt.Printf("Loaded %d shares:\n", len(shareFiles))
	for _, sf := range shareFiles {
		fmt.Printf("  [%d] %s\n", sf.Index, sf.OrgName)
	}

	// ── Reconstruct phi to verify shares are valid (dry run) ──
	tshares := make([]*chameleon.TCHSecretShare, len(shareFiles))
	chainArgs := make([]ChainShareArg, len(shareFiles))
	for i, sf := range shareFiles {
		b, _ := hex.DecodeString(sf.ShareHex)
		tshares[i] = &chameleon.TCHSecretShare{
			Index: sf.Index,
			Share: new(big.Int).SetBytes(b),
		}
		chainArgs[i] = ChainShareArg{
			Index: sf.Index,
			Share: sf.ShareHex,
		}
	}

	// ── Test collision locally (verifies shares work before hitting chain) ──
	fmt.Println("\nRunning local collision test...")

	// Simulate what chaincode does: oldMessage = voterHashID+"|"
	// We use a dummy old hash for the dry-run
	oldMsg := "test_voter_hash|"
	newMsg := "test_voter_hash|" + newCandidate

	oldTCH, err := chameleon.Hash(pk, oldMsg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Hash error: %v\n", err)
		os.Exit(1)
	}

	newR, err := chameleon.FindCollision(pk, oldMsg, oldTCH, newMsg, tshares, len(tshares))
	if err != nil {
		fmt.Fprintf(os.Stderr, "FindCollision FAILED: %v\n", err)
		fmt.Fprintln(os.Stderr, "Shares may be from a different key generation run. Re-run keygen_ceremony.go and InitLedger.")
		os.Exit(1)
	}

	// Verify the collision holds
	newTCH := &chameleon.TCHHash{H: oldTCH.H, R: newR}
	collisionOK := chameleon.Verify(pk, newMsg, newTCH)
	fmt.Printf("  Old hash       : %s...\n", oldTCH.H[:16])
	fmt.Printf("  New randomness : %s...\n", newR[:16])
	fmt.Printf("  Collision valid: %v\n", collisionOK)

	if !collisionOK {
		fmt.Fprintln(os.Stderr, "ERROR: local collision verification failed — do NOT proceed")
		os.Exit(1)
	}
	fmt.Println("  Local collision test PASSED — safe to invoke on-chain")

	// ── Build the JSON shares string for chaincode arg ──
	sharesJSON, _ := json.Marshal(chainArgs)

	// Escape for shell single-quote embedding
	sharesEscaped := strings.ReplaceAll(string(sharesJSON), `"`, `\"`)

	reason := "Administrative correction: ballot marking error"
	authorizedBy := strings.Join(func() []string {
		orgs := make([]string, len(shareFiles))
		for i, sf := range shareFiles {
			orgs[i] = sf.OrgName + "MSP"
		}
		return orgs
	}(), ",")

	fmt.Println("\n═══════════════════════════════════════════════════")
	fmt.Println("  STEP 4 — CorrectVote (copy and run this)")
	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Printf(`peer chaincode invoke \
  -o orderer0.eci.election.gov.in:7050 \
  --channelID nationalvotingchannel \
  --name voting \
  --tls --cafile "$ORDERER_CA" \
  -c '{"function":"CorrectVote","Args":["%s","%s","%s","%s","%s"]}'

`, voteID, newCandidate, reason, authorizedBy, sharesEscaped)

	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Println("  STEP 4b — AuditVote after correction")
	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Printf(`peer chaincode query \
  --channelID nationalvotingchannel \
  --name voting \
  -c '{"function":"AuditVote","Args":["%s"]}' | python3 -m json.tool

`, voteID)
}