package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var collection *mongo.Collection

// MSP authority users — hierarchy: ECI → UIDAI → Karnataka
var eci   = User{ID: "admin1", Org: ECI}
var uidai = User{ID: "uid1",   Org: UIDAI}
var state = User{ID: "state1", Org: STATE1}

func initDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		panic(err)
	}
	collection = client.Database("digilocker_auth").Collection("users")
	fmt.Println("✅ Connected to MongoDB")
}

func setCORS(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return true
	}
	return false
}

// POST /verify
// Checks MongoDB DigiLocker + runs hierarchical MSP registration+verification
// Called indirectly after auth-backend OTP flow
func verifyHandler(w http.ResponseWriter, r *http.Request) {
	if setCORS(w, r) {
		return
	}
	var req struct {
		Mobile  string `json:"mobile"`
		Aadhaar string `json:"aadhaar"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	fmt.Printf("[MSP] VERIFY → phone: %s\n", req.Mobile)

	filter := map[string]interface{}{
		"phone":             req.Mobile,
		"aadhaarLast4":      req.Aadhaar,
		"documents.voterId": true,
	}
	var result map[string]interface{}
	if err := collection.FindOne(context.TODO(), filter).Decode(&result); err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{"allowed": false, "reason": "INVALID_USER"})
		return
	}

	registerVoter(eci, req.Mobile, STATE1)
	verifyVoter(uidai, req.Mobile)

	json.NewEncoder(w).Encode(map[string]interface{}{"allowed": true})
}

// POST /issue-token
// Issues blind-signed voting token (Karnataka state authority)
//
// Request:  { phone, blinded }
// Response: { token, signature }
//
// token     → used as voterHashID  when calling POST /api/voter/register on her API (port 3001)
// signature → used as randomnessR  when calling POST /api/voter/register on her API (port 3001)
// Both are then passed to POST /api/vote/cast on her API
func tokenHandler(w http.ResponseWriter, r *http.Request) {
	if setCORS(w, r) {
		return
	}
	var req struct {
		Phone   string `json:"phone"`
		Blinded string `json:"blinded"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.Phone == "" || req.Blinded == "" {
		http.Error(w, "missing phone or blinded", http.StatusBadRequest)
		return
	}

	fmt.Printf("[MSP] TOKEN REQUEST → phone: %s\n", req.Phone)

	// Idempotent: ensure voter is in MSP registry
	registerVoter(eci, req.Phone, STATE1)
	if err := verifyVoter(uidai, req.Phone); err != nil {
		http.Error(w, "voter not verified: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// Karnataka issues blind-signed token
	token, signature, err := issueVotingToken(state, req.Phone, req.Blinded)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	fmt.Printf("[MSP] TOKEN ISSUED ✅\n")
	json.NewEncoder(w).Encode(map[string]string{
		"token":     token,     // → voterHashID for her chaincode
		"signature": signature, // → randomnessR for her chaincode
	})
}

func main() {
	initDB()
	http.HandleFunc("/verify",      verifyHandler)
	http.HandleFunc("/issue-token", tokenHandler)
	fmt.Println("🔐 MSP server at http://localhost:8080")
	fmt.Println("   ECI (root) → UIDAI (verify) → Karnataka (token)")
	http.ListenAndServe(":8080", nil)
}
