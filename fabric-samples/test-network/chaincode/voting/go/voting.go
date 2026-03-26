// Voting Chaincode for Blockchain Voting System

package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Smart Contract Structure
type SmartContract struct {
	contractapi.Contract
}

// Vote Structure
type Vote struct {
	CandidateID string `json:"candidateID"`
	VoterID     string `json:"voterID"`
}

// Initialize the ledger with some candidates
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	candidates := []string{"candidate1", "candidate2", "candidate3"}
	for _, candidate := range candidates {
		_ = ctx.GetStub().PutState(candidate, []byte("0"))
	}
	return nil
}

// Vote for a candidate
func (s *SmartContract) Vote(ctx contractapi.TransactionContextInterface, candidateID string, voterID string) error {
	vote := Vote{CandidateID: candidateID, VoterID: voterID}
	voteBytes, err := json.Marshal(vote)
	if err != nil {
		return fmt.Errorf("failed to marshal vote: %v", err)
	}

	if err := ctx.GetStub().PutState(voterID, voteBytes); err != nil {
		return fmt.Errorf("failed to record vote: %v", err)
	}

	countBytes, err := ctx.GetStub().GetState(candidateID)
	if err != nil {
		return fmt.Errorf("failed to get candidate count: %v", err)
	}

	count := 0
	if countBytes != nil {
		count = int(countBytes[0])
	}
	count++
	if err := ctx.GetStub().PutState(candidateID, []byte{byte(count)}); err != nil {
		return fmt.Errorf("failed to update candidate count: %v", err)
	}

	return nil
}

// Query votes for a candidate
func (s *SmartContract) QueryVotes(ctx contractapi.TransactionContextInterface, candidateID string) (int, error) {
	countBytes, err := ctx.GetStub().GetState(candidateID)
	if err != nil {
		return 0, fmt.Errorf("failed to get candidate count: %v", err)
	}

	if countBytes == nil {
		return 0, nil
	}

	return int(countBytes[0]), nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		panic(err)
	}

	if err := chaincode.Start(); err != nil {
		panic(err)
	}
}