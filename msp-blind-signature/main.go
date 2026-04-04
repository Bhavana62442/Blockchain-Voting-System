package main

import (
	"bufio"
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var collection *mongo.Collection

var eci   = User{ID: "admin1", Org: ECI}
var uidai = User{ID: "uid1",   Org: UIDAI}
var state = User{ID: "state1", Org: STATE1}

// loadTCHKeys reads N_HEX and E_HEX from tch-keys.env
func loadTCHKeys(envPath string) (*TCHPublicKey, error) {
	f, err := os.Open(envPath)
	if err != nil {
		return nil, fmt.Errorf("cannot open %s: %w", envPath, err)
	}
	defer f.Close()

	kv := make(map[string]string)
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			kv[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
		}
	}

	nHex, ok1 := kv["N_HEX"]
	eHex, ok2 := kv["E_HEX"]
	if !ok1 || !ok2 {
		return nil, fmt.Errorf("N_HEX or E_HEX not found in %s", envPath)
	}

	nBytes, err := hex.DecodeString(nHex)
	if err != nil {
		return nil, fmt.Errorf("invalid N_HEX: %w", err)
	}
	eBytes, err := hex.DecodeString(eHex)
	if err != nil {
		return nil, fmt.Errorf("invalid E_HEX: %w", err)
	}

	return &TCHPublicKey{
		N: new(big.Int).SetBytes(nBytes),
		E: new(big.Int).SetBytes(eBytes),
	}, nil
}

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

	registerVoter(eci, req.Phone, STATE1)
	if err := verifyVoter(uidai, req.Phone); err != nil {
		http.Error(w, "voter not verified: "+err.Error(), http.StatusUnauthorized)
		return
	}

	token, signature, err := issueVotingToken(state, req.Phone, req.Blinded)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	fmt.Printf("[MSP] TOKEN ISSUED ✅\n")
	json.NewEncoder(w).Encode(map[string]string{
		"token":     token,     // → voterHashID for chaincode
		"signature": signature, // → randomnessR for chaincode
	})
}

func main() {
	// Load real TCH keys from blockchain network
	tchKeysPath := os.Getenv("TCH_KEYS_PATH")
	if tchKeysPath == "" {
		tchKeysPath = ".env"
	}

	var err error
	tchPK, err = loadTCHKeys(tchKeysPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌ Failed to load TCH keys: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("✅ TCH public key loaded (N=%d bits)\n", tchPK.N.BitLen())

	initDB()

	http.HandleFunc("/verify",      verifyHandler)
	http.HandleFunc("/issue-token", tokenHandler)
	fmt.Println("🔐 MSP server at http://localhost:8080")
	fmt.Println("   ECI (root) → UIDAI (verify) → Karnataka (token)")
	fmt.Println("   Tokens use real chameleon hash — compatible with blockchain")
	http.ListenAndServe(":8080", nil)
}
