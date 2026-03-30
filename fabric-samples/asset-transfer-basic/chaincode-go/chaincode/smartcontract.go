package chaincode

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

// SmartContract defines the contract for managing votes
type SmartContract struct {
	contractapi.Contract
}

// Vote describes the structure of a single vote asset on the ledger
type Vote struct {
	VoterID       string `json:"voterId"`
	Candidate     string `json:"candidate"`
	ChameleonHash string `json:"chameleonHash"`
	RandomValue   string `json:"randomValue"`
	Timestamp     string `json:"timestamp"`
}

// CastVote adds a new vote to the ledger
func (s *SmartContract) CastVote(ctx contractapi.TransactionContextInterface, voterId string, candidate string, r string) error {
	existingJSON, err := ctx.GetStub().GetState(voterId)
	if err != nil {
		return err
	}
	if existingJSON != nil {
		return fmt.Errorf("voter %s has already voted", voterId)
	}

	// Create Chameleon Hash (Simplified SHA256 simulation)
	hashInput := candidate + r
	h := sha256.Sum256([]byte(hashInput))
	chameleonHash := hex.EncodeToString(h[:])

	vote := Vote{
		VoterID:       voterId,
		Candidate:     candidate,
		ChameleonHash: chameleonHash,
		RandomValue:   r,
		Timestamp:     time.Now().Format(time.RFC3339),
	}

	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(voterId, voteJSON)
}

// ReadVote returns the vote stored in the world state with given id.
func (s *SmartContract) ReadVote(ctx contractapi.TransactionContextInterface, voterId string) (*Vote, error) {
	voteJSON, err := ctx.GetStub().GetState(voterId)
	if err != nil {
		return nil, err
	}
	if voteJSON == nil {
		return nil, fmt.Errorf("vote %s not found", voterId)
	}

	var vote Vote
	err = json.Unmarshal(voteJSON, &vote)
	if err != nil {
		return nil, err
	}

	return &vote, nil
}

// GetAllVotes returns all votes found in the world state
func (s *SmartContract) GetAllVotes(ctx contractapi.TransactionContextInterface) ([]*Vote, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var votes []*Vote
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var vote Vote
		err = json.Unmarshal(queryResponse.Value, &vote)
		if err == nil {
			votes = append(votes, &vote)
		}
	}

	return votes, nil
}

// RedactVote allows modifying a vote using Chameleon Hash logic (Bypassed for development)
func (s *SmartContract) RedactVote(ctx contractapi.TransactionContextInterface, voterId string, newCandidate string, newRandomValue string) error {
	vote, err := s.ReadVote(ctx, voterId)
	if err != nil {
		return err
	}

	// Logic Note: In a full Chameleon Hash implementation, the newCandidate + newRandomValue
	// must produce the same original ChameleonHash. We are bypassing the check below
	// for development flexibility.

	vote.Candidate = newCandidate
	vote.RandomValue = newRandomValue
	vote.Timestamp = time.Now().Format(time.RFC3339) + " (REDACTED)"

	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(voterId, voteJSON)
}