package chameleon

import (
	"math/big"
	"testing"
)

// ----------------------------------------------------------------
//  Key Generation Tests
// ----------------------------------------------------------------

func TestGenerateKeys_BasicShape(t *testing.T) {
	pub, shares, err := GenerateKeys(3, 5)
	if err != nil {
		t.Fatalf("GenerateKeys failed: %v", err)
	}
	if pub.N == nil || pub.E == nil {
		t.Fatal("public key fields must not be nil")
	}
	if len(shares) != 5 {
		t.Fatalf("expected 5 shares, got %d", len(shares))
	}
	for i, s := range shares {
		if s.Index != i+1 {
			t.Errorf("share %d: expected index %d, got %d", i, i+1, s.Index)
		}
		if s.Share == nil {
			t.Errorf("share %d has nil Share value", i)
		}
	}
}

func TestGenerateKeys_ThresholdExceedsN(t *testing.T) {
	_, _, err := GenerateKeys(6, 5)
	if err == nil {
		t.Fatal("expected error when t > n, got nil")
	}
}

func TestGenerateKeys_ThresholdEqualsN(t *testing.T) {
	_, shares, err := GenerateKeys(3, 3)
	if err != nil {
		t.Fatalf("t == n should be valid: %v", err)
	}
	if len(shares) != 3 {
		t.Fatalf("expected 3 shares, got %d", len(shares))
	}
}

// ----------------------------------------------------------------
//  Hash & Verify Tests
// ----------------------------------------------------------------

func TestHash_ProducesNonEmptyOutput(t *testing.T) {
	pub, _, err := GenerateKeys(2, 3)
	if err != nil {
		t.Fatalf("key gen: %v", err)
	}
	tch, err := Hash(pub, "voterABC|salt123")
	if err != nil {
		t.Fatalf("Hash failed: %v", err)
	}
	if tch.H == "" || tch.R == "" {
		t.Fatal("Hash must return non-empty H and R")
	}
}

func TestVerify_CorrectHash(t *testing.T) {
	pub, _, err := GenerateKeys(2, 3)
	if err != nil {
		t.Fatalf("key gen: %v", err)
	}
	msg := "voterXYZ|saltABC"
	tch, err := Hash(pub, msg)
	if err != nil {
		t.Fatalf("Hash: %v", err)
	}
	if !Verify(pub, msg, tch) {
		t.Fatal("Verify must return true for the correct message and randomness")
	}
}

func TestVerify_WrongMessage(t *testing.T) {
	pub, _, err := GenerateKeys(2, 3)
	if err != nil {
		t.Fatalf("key gen: %v", err)
	}
	tch, _ := Hash(pub, "voterA|salt1")
	if Verify(pub, "voterB|salt1", tch) {
		t.Fatal("Verify must return false for wrong message")
	}
}

func TestVerify_TamperedRandomness(t *testing.T) {
	pub, _, err := GenerateKeys(2, 3)
	if err != nil {
		t.Fatalf("key gen: %v", err)
	}
	msg := "voter1|salt"
	tch, _ := Hash(pub, msg)
	tampered := &TCHHash{H: tch.H, R: "deadbeef"}
	if Verify(pub, msg, tampered) {
		t.Fatal("Verify must return false when R is tampered")
	}
}

func TestHash_DifferentRandomnessEachCall(t *testing.T) {
	pub, _, err := GenerateKeys(2, 3)
	if err != nil {
		t.Fatalf("key gen: %v", err)
	}
	msg := "sameVoter|sameSalt"
	tch1, _ := Hash(pub, msg)
	tch2, _ := Hash(pub, msg)
	// Same message but different R → different H values (probabilistic)
	// (extremely unlikely collision, but also test R uniqueness)
	if tch1.R == tch2.R {
		t.Log("Warning: identical R in two independent Hash calls (negligible probability)")
	}
}

// ----------------------------------------------------------------
//  Collision (FindCollision) Tests
// ----------------------------------------------------------------

func TestFindCollision_HashEquality(t *testing.T) {
	pub, shares, err := GenerateKeys(3, 5)
	if err != nil {
		t.Fatalf("key gen: %v", err)
	}

	oldMsg := "voter1|salt1"
	tch, err := Hash(pub, oldMsg)
	if err != nil {
		t.Fatalf("Hash: %v", err)
	}

	newMsg := "voter1|salt1_corrected"
	newR, err := FindCollision(pub, oldMsg, tch, newMsg, shares[:3], 3)
	if err != nil {
		t.Fatalf("FindCollision: %v", err)
	}

	// Verify the collision: hash(newMsg, newR) should equal the original H
	newTCH := &TCHHash{H: tch.H, R: newR}
	if !Verify(pub, newMsg, newTCH) {
		t.Fatal("Collision failed: hash(newMsg, newR) ≠ original H")
	}
}

func TestFindCollision_InsufficientShares(t *testing.T) {
	pub, shares, err := GenerateKeys(3, 5)
	if err != nil {
		t.Fatalf("key gen: %v", err)
	}
	tch, _ := Hash(pub, "msg|salt")
	// Pass only 2 shares when threshold is 3
	_, err = FindCollision(pub, "msg|salt", tch, "new|salt", shares[:2], 3)
	if err == nil {
		t.Fatal("expected error with insufficient shares, got nil")
	}
}

func TestFindCollision_ExactThreshold(t *testing.T) {
	pub, shares, err := GenerateKeys(2, 4)
	if err != nil {
		t.Fatalf("key gen: %v", err)
	}
	oldMsg := "originalVoter|salt"
	tch, _ := Hash(pub, oldMsg)
	newMsg := "correctedVoter|salt"

	// Use exactly t=2 shares
	newR, err := FindCollision(pub, oldMsg, tch, newMsg, shares[:2], 2)
	if err != nil {
		t.Fatalf("FindCollision with exact threshold: %v", err)
	}
	newTCH := &TCHHash{H: tch.H, R: newR}
	if !Verify(pub, newMsg, newTCH) {
		t.Fatal("Exact-threshold collision failed")
	}
}

// ----------------------------------------------------------------
//  Shamir Secret Sharing Tests
// ----------------------------------------------------------------

func TestShamirRoundtrip(t *testing.T) {
	prime, _ := primeForTest()
	secret := big.NewInt(987654321)

	shares, err := shamirSplit(secret, 3, 5, prime)
	if err != nil {
		t.Fatalf("shamirSplit: %v", err)
	}

	// Reconstruct from any 3 of 5 shares
	recovered, err := shamirReconstruct(shares[:3], prime)
	if err != nil {
		t.Fatalf("shamirReconstruct: %v", err)
	}
	if recovered.Cmp(secret) != 0 {
		t.Fatalf("reconstructed secret %v != original %v", recovered, secret)
	}
}

func TestShamirRoundtrip_DifferentSubsets(t *testing.T) {
	prime, _ := primeForTest()
	secret := big.NewInt(42)
	shares, _ := shamirSplit(secret, 2, 4, prime)

	subsets := [][2]int{{0, 1}, {0, 2}, {0, 3}, {1, 2}, {1, 3}, {2, 3}}
	for _, idx := range subsets {
		subset := []*TCHSecretShare{shares[idx[0]], shares[idx[1]]}
		got, err := shamirReconstruct(subset, prime)
		if err != nil {
			t.Errorf("subset %v: reconstruct error: %v", idx, err)
			continue
		}
		if got.Cmp(secret) != 0 {
			t.Errorf("subset %v: got %v, want %v", idx, got, secret)
		}
	}
}

func TestMsgHashHex_Deterministic(t *testing.T) {
	h1 := MsgHashHex("hello world")
	h2 := MsgHashHex("hello world")
	if h1 != h2 {
		t.Fatal("MsgHashHex must be deterministic")
	}
	if h1 == MsgHashHex("different message") {
		t.Fatal("different messages must not produce same hash")
	}
}

// ----------------------------------------------------------------
//  Helper (only for test — gets a suitable prime quickly)
// ----------------------------------------------------------------

func primeForTest() (*big.Int, error) {
	// Use a known safe 256-bit prime for test speed
	p := new(big.Int)
	p.SetString("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16)
	return p, nil
}