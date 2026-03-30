package main

import (
	"crypto/sha256"
	"fmt"
	"time"
)

// ── ORGANIZATIONS ─────────────────────────────────────────────
type Organization string

const (
	ECI    Organization = "ECI"
	UIDAI  Organization = "UIDAI"
	STATE1 Organization = "Karnataka"  // matches her KarnatakaMSP
	STATE2 Organization = "TamilNadu"
	STATE3 Organization = "Maharashtra"
)

// Hierarchy map — only states under ECI can issue tokens
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

// ── STORAGE ───────────────────────────────────────────────────
var voters     = make(map[string]Voter)
var tokenStore = make(map[string]Token)

// ── HELPERS ───────────────────────────────────────────────────

func generateToken(voterID string) string {
	data := voterID + time.Now().String()
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("%x", hash)
}

// signBlinded signs the BLINDED value — MSP never sees the actual vote
// This is the blind signature concept: voter blinds their data,
// MSP signs it, voter unblinds → MSP signature on original data
// The signed token becomes voterHashID in her chaincode
func signBlinded(blinded string) string {
	hash := sha256.Sum256([]byte(blinded + "MSP_KARNATAKA_SECRET"))
	return fmt.Sprintf("%x", hash)
}

// ── HIERARCHICAL MSP FUNCTIONS ────────────────────────────────

// registerVoter — ONLY ECI root authority can register
// Validates state is under ECI hierarchy
// Idempotent — safe to call multiple times
func registerVoter(user User, voterID string, state Organization) error {
	if user.Org != ECI {
		return fmt.Errorf("only ECI can register voters")
	}
	parent, ok := stateAuthority[state]
	if !ok || parent != ECI {
		return fmt.Errorf("state %s not in ECI hierarchy", state)
	}
	if _, exists := voters[voterID]; exists {
		return nil // already registered, skip
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

// verifyVoter — ONLY UIDAI can verify voter identity
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

// issueVotingToken — ONLY authorized state under ECI can issue
// Uses blind signature: signs blinded hash, not actual vote
// Returns:
//   token     → becomes voterHashID in her RegisterVoter + CastVote chaincode calls
//   signature → becomes randomnessR in her RegisterVoter chaincode call
func issueVotingToken(user User, voterID string, blinded string) (string, string, error) {
	// Enforce hierarchy
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

	// token = voterHashID (unique anonymous identity for her chaincode)
	token := generateToken(voterID)
	// signature = randomnessR (used in her chameleon hash verification)
	signature := signBlinded(blinded)

	tokenStore[token] = Token{Value: token, Signature: signature, Used: false}
	fmt.Printf("[MSP %s] Issued token (voterHashID) for voter\n", user.Org)
	return token, signature, nil
}

// useToken — marks token used (frontend duplicate guard)
// Real duplicate prevention happens in her chaincode via voter status (REGISTERED→VOTED)
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
