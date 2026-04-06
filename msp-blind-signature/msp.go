package main

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"math/rand"
	"time"
)

// ── ORGANIZATIONS ─────────────────────────────────────────────
type Organization string

const (
	ECI    Organization = "ECI"
	UIDAI  Organization = "UIDAI"
	STATE1 Organization = "Karnataka"
	STATE2 Organization = "TamilNadu"
	STATE3 Organization = "Maharashtra"
)

var stateAuthority = map[Organization]Organization{
	STATE1: ECI,
	STATE2: ECI,
	STATE3: ECI,
}

// ── TYPES ─────────────────────────────────────────────────────
type User struct {
	ID  string
	Org Organization
}

type Voter struct {
	VoterID    string
	IsVerified bool
	HasVoted   bool
	State      Organization
}

type Token struct {
	Value     string
	Signature string
	Used      bool
}

// ── TCH PUBLIC KEY ────────────────────────────────────────────
// Loaded from tch-keys.env at startup via main.go
// These are the REAL keys stored on-chain — hashes must use them
type TCHPublicKey struct {
	N *big.Int
	E *big.Int
}

var tchPK *TCHPublicKey // set by main.go on startup

// ── STORAGE ───────────────────────────────────────────────────
var voters     = make(map[string]Voter)
var tokenStore = make(map[string]Token)

// ── CHAMELEON HASH ────────────────────────────────────────────
// Computes H = (SHA256(message) mod N + r^e mod N) mod N
// r is random in [0, N) — same math as chaincode's computeHash()
// Returns voterHashID (H hex) and randomnessR (r hex)
func chameleonHash(pk *TCHPublicKey, message string) (string, string, error) {
	if pk == nil {
		return "", "", errors.New("TCH public key not loaded")
	}

	// Random r in [0, N)
	// Use crypto/rand for production; here we use seeded math/rand for simplicity
	// but still produce a value < N
	nBytes := pk.N.Bytes()
	rBytes := make([]byte, len(nBytes))

	src := rand.New(rand.NewSource(time.Now().UnixNano()))
	for {
		for i := range rBytes {
			rBytes[i] = byte(src.Intn(256))
		}
		r := new(big.Int).SetBytes(rBytes)
		if r.Cmp(pk.N) < 0 && r.Sign() > 0 {
			// Compute SHA256(message) mod N
			sum := sha256.Sum256([]byte(message))
			mHash := new(big.Int).SetBytes(sum[:])
			mHash.Mod(mHash, pk.N)

			// Compute r^e mod N
			re := new(big.Int).Exp(r, pk.E, pk.N)

			// H = (mHash + re) mod N
			h := new(big.Int).Add(mHash, re)
			h.Mod(h, pk.N)

			nLen := len(pk.N.Bytes())
			hHex := fmt.Sprintf("%0*x", nLen*2, h)
			rHex := fmt.Sprintf("%0*x", nLen*2, r)
			return hHex, rHex, nil
		}
	}
}

// ── HELPERS ───────────────────────────────────────────────────

func generateVoterMessage(phone string, salt string) string {
	// message format matches what the chaincode will verify
	return phone + "|" + salt
}

func makeSalt(phone string) string {
	sum := sha256.Sum256([]byte(phone + time.Now().String()))
	return hex.EncodeToString(sum[:16])
}

// ── HIERARCHICAL MSP FUNCTIONS ────────────────────────────────

func registerVoter(user User, voterID string, state Organization) error {
	if user.Org != ECI {
		return fmt.Errorf("only ECI can register voters")
	}
	parent, ok := stateAuthority[state]
	if !ok || parent != ECI {
		return fmt.Errorf("state %s not in ECI hierarchy", state)
	}
	if _, exists := voters[voterID]; exists {
		return nil
	}
	voters[voterID] = Voter{
		VoterID:    voterID,
		IsVerified: false,
		HasVoted:   false,
		State:      state,
	}
	fmt.Printf("[MSP ECI] Registered voter %s under %s\n", voterID[:8]+"...", state)
	return nil
}

func verifyVoter(user User, voterID string) error {
	if user.Org != UIDAI {
		return fmt.Errorf("only UIDAI can verify voter identity")
	}
	v, exists := voters[voterID]
	if !exists {
		return fmt.Errorf("voter not found in MSP registry")
	}
	v.IsVerified = true
	voters[voterID] = v
	fmt.Printf("[MSP UIDAI] Verified voter %s\n", voterID[:8]+"...")
	return nil
}

// issueVotingToken — generates a REAL chameleon hash using TCH public key
// Returns:
//   token     → voterHashID  (H from chameleon hash) — used in RegisterVoter + CastVote
//   signature → randomnessR  (r from chameleon hash) — used in RegisterVoter
func issueVotingToken(user User, voterID string, blinded string) (string, string, error) {
	parent, ok := stateAuthority[user.Org]
	if !ok || parent != ECI {
		return "", "", fmt.Errorf("state %s not authorized under ECI hierarchy", user.Org)
	}

	v, exists := voters[voterID]
	if !exists {
		return "", "", fmt.Errorf("voter not registered in MSP")
	}
	if user.Org != v.State {
		return "", "", fmt.Errorf("state mismatch: %s cannot issue for %s voter", user.Org, v.State)
	}
	if !v.IsVerified {
		return "", "", fmt.Errorf("voter identity not verified by UIDAI")
	}
	if v.HasVoted {
		return "", "", fmt.Errorf("voter already voted")
	}

	// Use chameleon hash with real TCH keys — produces values the chaincode accepts
	salt := makeSalt(voterID)
	message := generateVoterMessage(voterID, salt)

	voterHashID, randomnessR, err := chameleonHash(tchPK, message)
	if err != nil {
		return "", "", fmt.Errorf("chameleon hash failed: %w", err)
	}

	tokenStore[voterHashID] = Token{
		Value:     voterHashID,
		Signature: randomnessR,
		Used:      false,
	}

	fmt.Printf("[MSP %s] Issued chameleon token for voter ✅\n", user.Org)
	fmt.Printf("  voterHashID : %s...\n", voterHashID[:16])
	fmt.Printf("  randomnessR : %s...\n", randomnessR[:16])

	return voterHashID, randomnessR, nil
}

func useToken(token string) error {
	t, exists := tokenStore[token]
	if !exists {
		return fmt.Errorf("invalid token")
	}
	if t.Used {
		return fmt.Errorf("token already used")
	}
	t.Used = true
	tokenStore[token] = t
	return nil
}
