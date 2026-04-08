// keygen_ceremony.go
// Run ONCE before any testing:
//   go run keygen_ceremony.go
//
// Outputs:
//   tch_public_key.json   — N and E in hex, used for InitLedger + derive_ids
//   tch_shares.json       — all 10 Shamir shares, one per state org
//   tch_shares_6of10.json — first 6 shares only (for CorrectVote testing)
//
// Place this file in:
//   ~/Blockchain-Voting-System/fabric-samples/test-network/chaincode/voting/go/

package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"

	"github.com/hyperledger/fabric-samples/voting/chameleon"
)

type PublicKeyFile struct {
	NHex string `json:"nHex"`
	EHex string `json:"eHex"`
}

type ShareFile struct {
	OrgName string `json:"orgName"`
	Index   int    `json:"index"`
	ShareHex string `json:"shareHex"`
}

var stateOrgs = []string{
	"Maharashtra", "Karnataka", "Kerala", "Telangana", "TamilNadu",
	"UttarPradesh", "Punjab", "Rajasthan", "Gujarat", "WestBengal",
}

func main() {
	t := 6  // threshold
	n := 10 // total shares (one per state org)

	fmt.Println("Generating TCH keys with Shamir secret sharing...")
	fmt.Printf("  Threshold : %d of %d\n", t, n)
	fmt.Println("  Key size  : 512-bit primes (use 2048 for production)")
	fmt.Println("")

	pk, shares, err := chameleon.GenerateKeys(t, n)
	if err != nil {
		fmt.Fprintf(os.Stderr, "GenerateKeys failed: %v\n", err)
		os.Exit(1)
	}

	// ── Save public key ──
	pubFile := PublicKeyFile{
		NHex: hex.EncodeToString(pk.N.Bytes()),
		EHex: hex.EncodeToString(pk.E.Bytes()),
	}
	writePrettyJSON("tch_public_key.json", pubFile)
	fmt.Println("Saved: tch_public_key.json")
	fmt.Printf("  N (hex): %s\n", pubFile.NHex[:32]+"...")
	fmt.Printf("  E (hex): %s\n", pubFile.EHex)

	// ── Save all shares ──
	allShares := make([]ShareFile, n)
	for i, s := range shares {
		allShares[i] = ShareFile{
			OrgName:  stateOrgs[i],
			Index:    s.Index,
			ShareHex: hex.EncodeToString(s.Share.Bytes()),
		}
	}
	writePrettyJSON("tch_shares.json", allShares)
	fmt.Println("\nSaved: tch_shares.json  (all 10 shares)")
	for _, sf := range allShares {
		fmt.Printf("  [%d] %-15s: %s...\n", sf.Index, sf.OrgName, sf.ShareHex[:16])
	}

	// ── Save 6-of-10 subset for CorrectVote testing ──
	writePrettyJSON("tch_shares_6of10.json", allShares[:6])
	fmt.Println("\nSaved: tch_shares_6of10.json  (first 6 shares for CorrectVote test)")

	// ── Print ready-to-use InitLedger args ──
	fmt.Println("\n═══════════════════════════════════════════════════")
	fmt.Println("  COPY THIS → peer chaincode invoke InitLedger")
	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Printf("\npeer chaincode invoke \\\n")
	fmt.Printf("  -o orderer0.eci.election.gov.in:7050 \\\n")
	fmt.Printf("  --channelID nationalvotingchannel \\\n")
	fmt.Printf("  --name voting \\\n")
	fmt.Printf("  --tls --cafile \"$ORDERER_CA\" \\\n")
	fmt.Printf("  -c '{\"function\":\"InitLedger\",\"Args\":[\"%s\",\"%s\"]}'\n\n",
		pubFile.NHex, pubFile.EHex)
}

func writePrettyJSON(filename string, v any) {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		panic(err)
	}
	if err := os.WriteFile(filename, b, 0644); err != nil {
		panic(err)
	}
}