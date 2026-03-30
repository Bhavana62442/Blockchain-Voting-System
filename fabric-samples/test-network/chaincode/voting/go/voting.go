package main

import (
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-samples/voting/chameleon"
)

// ============================================================
//  Data models
// ============================================================

type VoterStatus string

const (
	StatusRegistered VoterStatus = "REGISTERED"
	StatusVoted      VoterStatus = "VOTED"
	StatusInvalid    VoterStatus = "INVALID"
)

type Voter struct {
	DocType      string      `json:"docType"`
	VoterHashID  string      `json:"voterHashID"`
	RandomnessR  string      `json:"randomnessR"`
	StateOrg     string      `json:"stateOrg"`
	Status       VoterStatus `json:"status"`
	RegisteredAt string      `json:"registeredAt"`
}

type Vote struct {
	DocType       string           `json:"docType"`
	VoteID        string           `json:"voteID"`
	VoterHashID   string           `json:"voterHashID"`
	CandidateID   string           `json:"candidateID"`
	StateOrg      string           `json:"stateOrg"`
	Timestamp     string           `json:"timestamp"`
	IsValid       bool             `json:"isValid"`
	CorrectionLog []CorrectionEntry `json:"correctionLog,omitempty"`
}

type CorrectionEntry struct {
	OldCandidateID string `json:"oldCandidateID"`
	NewCandidateID string `json:"newCandidateID"`
	Reason         string `json:"reason"`
	CorrectedAt    string `json:"correctedAt"`
	AuthorizedBy   string `json:"authorizedBy"`
}

type TCHPublicKeyRecord struct {
	DocType string `json:"docType"`
	NHex    string `json:"nHex"`
	EHex    string `json:"eHex"`
}

type TallyResult struct {
	TotalVotes   int            `json:"totalVotes"`
	ValidVotes   int            `json:"validVotes"`
	PerCandidate map[string]int `json:"perCandidate"`
	PerState     map[string]int `json:"perState"`
	Timestamp    string         `json:"timestamp"`
}

type AuditRecord struct {
	VoteID        string           `json:"voteID"`
	CandidateID   string           `json:"candidateID"`
	StateOrg      string           `json:"stateOrg"`
	Timestamp     string           `json:"timestamp"`
	IsValid       bool             `json:"isValid"`
	HashVerified  bool             `json:"hashVerified"`
	CorrectionLog []CorrectionEntry `json:"correctionLog"`
}

// ============================================================
//  Contract
// ============================================================

type VotingContract struct {
	contractapi.Contract
}

// ============================================================
//  InitLedger
// ============================================================

func (vc *VotingContract) InitLedger(ctx contractapi.TransactionContextInterface, nHex string, eHex string) error {
	rec := TCHPublicKeyRecord{
		DocType: "tchkey",
		NHex:    nHex,
		EHex:    eHex,
	}
	b, err := json.Marshal(rec)
	if err != nil {
		return fmt.Errorf("InitLedger: marshal key record: %w", err)
	}
	return ctx.GetStub().PutState("TCH_PUBLIC_KEY", b)
}

// ============================================================
//  RegisterVoter
// ============================================================

func (vc *VotingContract) RegisterVoter(
	ctx contractapi.TransactionContextInterface,
	voterHashID string,
	randomnessR string,
	stateOrg string,
) error {
	pk, err := vc.loadTCHKey(ctx)
	if err != nil {
		return err
	}

	tch := &chameleon.TCHHash{H: voterHashID, R: randomnessR}

	rBytes, err := hex.DecodeString(randomnessR)
	if err != nil {
		return fmt.Errorf("RegisterVoter: invalid randomness encoding: %w", err)
	}
	r := new(big.Int).SetBytes(rBytes)
	if r.Cmp(pk.N) >= 0 {
		return errors.New("RegisterVoter: randomness r must be < N")
	}

	hBytes, err := hex.DecodeString(voterHashID)
	if err != nil {
		return fmt.Errorf("RegisterVoter: invalid hash encoding: %w", err)
	}
	h := new(big.Int).SetBytes(hBytes)
	if h.Cmp(pk.N) >= 0 {
		return errors.New("RegisterVoter: hash H must be < N")
	}
	_ = tch

	existing, err := ctx.GetStub().GetState("VOTER_" + voterHashID)
	if err != nil {
		return fmt.Errorf("RegisterVoter: state read error: %w", err)
	}
	if existing != nil {
		return errors.New("RegisterVoter: voter already registered")
	}

	// FIX: use deterministic tx timestamp instead of time.Now()
	regTs, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return fmt.Errorf("RegisterVoter: get tx timestamp: %w", err)
	}

	voter := Voter{
		DocType:      "voter",
		VoterHashID:  voterHashID,
		RandomnessR:  randomnessR,
		StateOrg:     stateOrg,
		Status:       StatusRegistered,
		RegisteredAt: time.Unix(regTs.Seconds, int64(regTs.Nanos)).UTC().Format(time.RFC3339),
	}

	b, err := json.Marshal(voter)
	if err != nil {
		return fmt.Errorf("RegisterVoter: marshal: %w", err)
	}

	if err := ctx.GetStub().PutState("VOTER_"+voterHashID, b); err != nil {
		return fmt.Errorf("RegisterVoter: put state: %w", err)
	}

	return ctx.GetStub().SetEvent("VoterRegistered", []byte(voterHashID))
}

// ============================================================
//  CastVote
// ============================================================

func (vc *VotingContract) CastVote(
	ctx contractapi.TransactionContextInterface,
	voterHashID string,
	candidateID string,
) error {
	voterBytes, err := ctx.GetStub().GetState("VOTER_" + voterHashID)
	if err != nil {
		return fmt.Errorf("CastVote: state read: %w", err)
	}
	if voterBytes == nil {
		return errors.New("CastVote: voter not registered")
	}

	var voter Voter
	if err := json.Unmarshal(voterBytes, &voter); err != nil {
		return fmt.Errorf("CastVote: unmarshal voter: %w", err)
	}

	if voter.Status == StatusVoted {
		return errors.New("CastVote: voter has already voted")
	}
	if voter.Status == StatusInvalid {
		return errors.New("CastVote: voter registration is invalid")
	}

	// FIX: use deterministic tx timestamp instead of time.Now()
	txTs, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return fmt.Errorf("CastVote: get tx timestamp: %w", err)
	}
	tsStr := time.Unix(txTs.Seconds, int64(txTs.Nanos)).UTC().Format(time.RFC3339Nano)

	voteIDRaw := voterHashID + tsStr
	voteIDHash := chameleon.MsgHashHex(voteIDRaw)

	vote := Vote{
		DocType:     "vote",
		VoteID:      voteIDHash,
		VoterHashID: voterHashID,
		CandidateID: candidateID,
		StateOrg:    voter.StateOrg,
		Timestamp:   tsStr,
		IsValid:     true,
	}

	var voteBytes []byte
	voteBytes, err = json.Marshal(vote)
	if err != nil {
		return fmt.Errorf("CastVote: marshal vote: %w", err)
	}

	if err := ctx.GetStub().PutState("VOTE_"+voteIDHash, voteBytes); err != nil {
		return fmt.Errorf("CastVote: put vote: %w", err)
	}

	voter.Status = StatusVoted
	voterBytes, err = json.Marshal(voter)
	if err != nil {
		return fmt.Errorf("CastVote: marshal updated voter: %w", err)
	}
	if err := ctx.GetStub().PutState("VOTER_"+voterHashID, voterBytes); err != nil {
		return fmt.Errorf("CastVote: update voter status: %w", err)
	}

	payload, _ := json.Marshal(map[string]string{
		"voteID":      voteIDHash,
		"voterHashID": voterHashID,
		"candidateID": candidateID,
	})
	return ctx.GetStub().SetEvent("VoteCast", payload)
}

// ============================================================
//  CorrectVote
// ============================================================

func (vc *VotingContract) CorrectVote(
	ctx contractapi.TransactionContextInterface,
	voteID string,
	newCandidateID string,
	reason string,
	authorizedBy string,
	sharesJSON string,
) error {
	voteBytes, err := ctx.GetStub().GetState("VOTE_" + voteID)
	if err != nil || voteBytes == nil {
		return fmt.Errorf("CorrectVote: vote %s not found", voteID)
	}

	var vote Vote
	if err := json.Unmarshal(voteBytes, &vote); err != nil {
		return fmt.Errorf("CorrectVote: unmarshal: %w", err)
	}

	voterBytes, err := ctx.GetStub().GetState("VOTER_" + vote.VoterHashID)
	if err != nil || voterBytes == nil {
		return fmt.Errorf("CorrectVote: voter %s not found", vote.VoterHashID)
	}
	var voter Voter
	if err := json.Unmarshal(voterBytes, &voter); err != nil {
		return fmt.Errorf("CorrectVote: unmarshal voter: %w", err)
	}

	var rawShares []struct {
		Index int    `json:"index"`
		Share string `json:"share"`
	}
	if err := json.Unmarshal([]byte(sharesJSON), &rawShares); err != nil {
		return fmt.Errorf("CorrectVote: parse shares: %w", err)
	}

	shares := make([]*chameleon.TCHSecretShare, len(rawShares))
	for i, rs := range rawShares {
		shareBytes, err := hex.DecodeString(rs.Share)
		if err != nil {
			return fmt.Errorf("CorrectVote: decode share %d: %w", i, err)
		}
		shares[i] = &chameleon.TCHSecretShare{
			Index: rs.Index,
			Share: new(big.Int).SetBytes(shareBytes),
		}
	}

	pk, err := vc.loadTCHKey(ctx)
	if err != nil {
		return err
	}

	oldTCH := &chameleon.TCHHash{
		H: voter.VoterHashID,
		R: voter.RandomnessR,
	}

	oldMessage := vote.VoterHashID + "|"
	newMessage := vote.VoterHashID + "|" + newCandidateID

	newR, err := chameleon.FindCollision(pk, oldMessage, oldTCH, newMessage, shares, len(shares))
	if err != nil {
		return fmt.Errorf("CorrectVote: collision failed: %w", err)
	}

	// FIX: use deterministic tx timestamp instead of time.Now()
	corrTs, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return fmt.Errorf("CorrectVote: get tx timestamp: %w", err)
	}

	entry := CorrectionEntry{
		OldCandidateID: vote.CandidateID,
		NewCandidateID: newCandidateID,
		Reason:         reason,
		CorrectedAt:    time.Unix(corrTs.Seconds, int64(corrTs.Nanos)).UTC().Format(time.RFC3339),
		AuthorizedBy:   authorizedBy,
	}

	vote.CandidateID = newCandidateID
	vote.CorrectionLog = append(vote.CorrectionLog, entry)

	voter.RandomnessR = newR
	voterBytes, _ = json.Marshal(voter)
	ctx.GetStub().PutState("VOTER_"+vote.VoterHashID, voterBytes)

	voteBytes, err = json.Marshal(vote)
	if err != nil {
		return fmt.Errorf("CorrectVote: marshal updated vote: %w", err)
	}
	if err := ctx.GetStub().PutState("VOTE_"+voteID, voteBytes); err != nil {
		return fmt.Errorf("CorrectVote: put state: %w", err)
	}

	payload, _ := json.Marshal(map[string]string{
		"voteID":         voteID,
		"oldCandidateID": entry.OldCandidateID,
		"newCandidateID": newCandidateID,
		"authorizedBy":   authorizedBy,
	})
	return ctx.GetStub().SetEvent("VoteCorrected", payload)
}

// ============================================================
//  TallyVotes
// ============================================================

func (vc *VotingContract) TallyVotes(ctx contractapi.TransactionContextInterface) (*TallyResult, error) {
	iter, err := ctx.GetStub().GetStateByRange("VOTE_", "VOTE_~")
	if err != nil {
		return nil, fmt.Errorf("TallyVotes: range query: %w", err)
	}
	defer iter.Close()

	// FIX: use deterministic tx timestamp instead of time.Now()
	tallyTs, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return nil, fmt.Errorf("TallyVotes: get tx timestamp: %w", err)
	}

	result := &TallyResult{
		PerCandidate: make(map[string]int),
		PerState:     make(map[string]int),
		Timestamp:    time.Unix(tallyTs.Seconds, int64(tallyTs.Nanos)).UTC().Format(time.RFC3339),
	}

	for iter.HasNext() {
		kv, err := iter.Next()
		if err != nil {
			return nil, fmt.Errorf("TallyVotes: iterator: %w", err)
		}

		var vote Vote
		if err := json.Unmarshal(kv.Value, &vote); err != nil {
			continue
		}
		if vote.DocType != "vote" {
			continue
		}

		result.TotalVotes++
		if vote.IsValid {
			result.ValidVotes++
			result.PerCandidate[vote.CandidateID]++
			result.PerState[vote.StateOrg]++
		}
	}

	return result, nil
}

// ============================================================
//  AuditVote
// ============================================================

func (vc *VotingContract) AuditVote(ctx contractapi.TransactionContextInterface, voteID string) (*AuditRecord, error) {
	voteBytes, err := ctx.GetStub().GetState("VOTE_" + voteID)
	if err != nil || voteBytes == nil {
		return nil, fmt.Errorf("AuditVote: vote %s not found", voteID)
	}

	var vote Vote
	if err := json.Unmarshal(voteBytes, &vote); err != nil {
		return nil, fmt.Errorf("AuditVote: unmarshal: %w", err)
	}

	voterBytes, _ := ctx.GetStub().GetState("VOTER_" + vote.VoterHashID)
	hashVerified := false
	if voterBytes != nil {
		var voter Voter
		if json.Unmarshal(voterBytes, &voter) == nil {
			pk, err := vc.loadTCHKey(ctx)
			if err == nil {
				tch := &chameleon.TCHHash{H: voter.VoterHashID, R: voter.RandomnessR}
				hashVerified = chameleon.Verify(pk, vote.VoterHashID+"|", tch)
			}
		}
	}

	return &AuditRecord{
		VoteID:        vote.VoteID,
		CandidateID:   vote.CandidateID,
		StateOrg:      vote.StateOrg,
		Timestamp:     vote.Timestamp,
		IsValid:       vote.IsValid,
		HashVerified:  hashVerified,
		CorrectionLog: vote.CorrectionLog,
	}, nil
}

// ============================================================
//  QueryVoterStatus
// ============================================================

func (vc *VotingContract) QueryVoterStatus(ctx contractapi.TransactionContextInterface, voterHashID string) (string, error) {
	b, err := ctx.GetStub().GetState("VOTER_" + voterHashID)
	if err != nil || b == nil {
		return "", fmt.Errorf("voter %s not found", voterHashID)
	}
	var voter Voter
	if err := json.Unmarshal(b, &voter); err != nil {
		return "", err
	}
	return string(voter.Status), nil
}

// ============================================================
//  Internal helpers
// ============================================================

func (vc *VotingContract) loadTCHKey(ctx contractapi.TransactionContextInterface) (*chameleon.TCHPublicKey, error) {
	b, err := ctx.GetStub().GetState("TCH_PUBLIC_KEY")
	if err != nil || b == nil {
		return nil, errors.New("TCH public key not initialised — call InitLedger first")
	}
	var rec TCHPublicKeyRecord
	if err := json.Unmarshal(b, &rec); err != nil {
		return nil, fmt.Errorf("loadTCHKey: unmarshal: %w", err)
	}

	nBytes, err := hex.DecodeString(rec.NHex)
	if err != nil {
		return nil, fmt.Errorf("loadTCHKey: decode N: %w", err)
	}
	eBytes, err := hex.DecodeString(rec.EHex)
	if err != nil {
		return nil, fmt.Errorf("loadTCHKey: decode E: %w", err)
	}

	return &chameleon.TCHPublicKey{
		N: new(big.Int).SetBytes(nBytes),
		E: new(big.Int).SetBytes(eBytes),
	}, nil
}

func main() {
	cc, err := contractapi.NewChaincode(&VotingContract{})
	if err != nil {
		panic(fmt.Sprintf("Error creating voting chaincode: %v", err))
	}
	if err := cc.Start(); err != nil {
		panic(fmt.Sprintf("Error starting voting chaincode: %v", err))
	}
}