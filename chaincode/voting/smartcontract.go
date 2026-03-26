package chaincode

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type Vote struct {
	EncryptedVote string `json:"encryptedVote"`
	Timestamp     string `json:"timestamp"`
}

func (s *SmartContract) CastVote(ctx contractapi.TransactionContextInterface, token string, encryptedVote string) error {
	exists, err := ctx.GetStub().GetState(token)
	if err != nil {
		return err
	}
	if exists != nil && len(exists) > 0 {
		return fmt.Errorf("duplicate vote not allowed")
	}

	vote := Vote{
		EncryptedVote: encryptedVote,
		Timestamp:     time.Now().Format(time.RFC3339),
	}

	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(token, voteJSON)
}

func (s *SmartContract) ReadVote(ctx contractapi.TransactionContextInterface, token string) (*Vote, error) {
	voteJSON, err := ctx.GetStub().GetState(token)
	if err != nil {
		return nil, err
	}
	if voteJSON == nil {
		return nil, fmt.Errorf("vote for token %s not found", token)
	}

	var vote Vote
	err = json.Unmarshal(voteJSON, &vote)
	if err != nil {
		return nil, err
	}

	return &vote, nil
}

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