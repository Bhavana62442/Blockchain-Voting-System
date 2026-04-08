package chameleon

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"math/big"
)

// TCHPublicKey is stored on-chain. Anyone can hash with it, only t-of-n
// committee members can compute a collision (correction).
type TCHPublicKey struct {
	N *big.Int // RSA-style modulus (product of two safe primes)
	E *big.Int // public exponent
}

// TCHSecretShare is one committee member's share of the trapdoor.
// Never stored on-chain — kept by each state org's CA.
type TCHSecretShare struct {
	Index int
	Share *big.Int
}

// TCHHash is what gets stored on-chain per voter / per vote.
type TCHHash struct {
	H string // hex-encoded hash value
	R string // hex-encoded randomness (needed for collision later)
}

// --- Key Generation (t-of-n Shamir secret sharing over the trapdoor) ---

// GenerateKeys creates a public key and n secret shares with threshold t.
// In production this runs as a distributed key gen ceremony between state orgs.
func GenerateKeys(t, n int) (*TCHPublicKey, []*TCHSecretShare, error) {
	if t > n {
		return nil, nil, errors.New("threshold t cannot exceed number of shares n")
	}

	// Generate two large safe primes p, q such that N = p*q
	// For test network we use 512-bit; production should use 2048-bit
	p, err := rand.Prime(rand.Reader, 512)
	if err != nil {
		return nil, nil, err
	}
	q, err := rand.Prime(rand.Reader, 512)
	if err != nil {
		return nil, nil, err
	}

	N := new(big.Int).Mul(p, q)

	// Trapdoor = (p-1)*(q-1) — Euler's totient
	p1 := new(big.Int).Sub(p, big.NewInt(1))
	q1 := new(big.Int).Sub(q, big.NewInt(1))
	phi := new(big.Int).Mul(p1, q1)

	// Public exponent e
	e := big.NewInt(65537)

	pub := &TCHPublicKey{N: N, E: e}

	// Shamir secret sharing of phi over Z_N
	shares, err := shamirSplit(phi, t, n, N)
	if err != nil {
		return nil, nil, err
	}

	return pub, shares, nil
}

// --- Hashing (done at vote submission time) ---

// Hash computes the chameleon hash of message m using public key pk.
// Returns the hash and the randomness r used (caller must store r).
func Hash(pk *TCHPublicKey, message string) (*TCHHash, error) {
	// Random r in Z_N
	r, err := rand.Int(rand.Reader, pk.N)
	if err != nil {
		return nil, err
	}

	h := computeHash(pk, message, r)

	return &TCHHash{
		H: hex.EncodeToString(h.Bytes()),
		R: hex.EncodeToString(r.Bytes()),
	}, nil
}

// Verify checks that H = hash(message, r) under public key pk.
func Verify(pk *TCHPublicKey, message string, tch *TCHHash) bool {
	rBytes, err := hex.DecodeString(tch.R)
	if err != nil {
		return false
	}
	r := new(big.Int).SetBytes(rBytes)
	h := computeHash(pk, message, r)
	return hex.EncodeToString(h.Bytes()) == tch.H
}

// --- Collision (correction) — requires t shares ---

// FindCollision computes r2 such that hash(newMessage, r2) == hash(oldMessage, r1).
// This lets a committee correct a vote without changing the stored hash H —
// the chain history stays intact, only the preimage changes.
// Requires t secret shares to reconstruct the trapdoor.
func FindCollision(pk *TCHPublicKey, oldMessage string, oldTCH *TCHHash, newMessage string, shares []*TCHSecretShare, t int) (string, error) {
	if len(shares) < t {
		return "", errors.New("insufficient shares to compute collision")
	}

	// Reconstruct trapdoor (phi) from t shares via Lagrange interpolation
	phi, err := shamirReconstruct(shares[:t], pk.N)
	if err != nil {
		return "", err
	}

	// r1 from stored randomness
	r1Bytes, err := hex.DecodeString(oldTCH.R)
	if err != nil {
		return "", err
	}
	r1 := new(big.Int).SetBytes(r1Bytes)

	// Compute r2: solve hash(newMessage, r2) = hash(oldMessage, r1)
	// H(m,r) = (H_SHA(m) + r^e) mod N
	// So: H_SHA(newMsg) + r2^e ≡ H_SHA(oldMsg) + r1^e (mod N)
	// r2^e ≡ H_SHA(oldMsg) - H_SHA(newMsg) + r1^e (mod N)
	// r2 = (rhs)^(e^-1 mod phi) mod N

	hOld := msgHash(oldMessage, pk.N)
	hNew := msgHash(newMessage, pk.N)

	r1e := new(big.Int).Exp(r1, pk.E, pk.N)
	rhs := new(big.Int).Add(hOld, r1e)
	rhs.Sub(rhs, hNew)
	rhs.Mod(rhs, pk.N)

	// d = e^{-1} mod phi
	d := new(big.Int).ModInverse(pk.E, phi)
	if d == nil {
		return "", errors.New("could not compute modular inverse — e and phi not coprime")
	}

	r2 := new(big.Int).Exp(rhs, d, pk.N)
	return hex.EncodeToString(r2.Bytes()), nil
}

// --- Internal helpers ---

func computeHash(pk *TCHPublicKey, message string, r *big.Int) *big.Int {
	mHash := msgHash(message, pk.N)
	re := new(big.Int).Exp(r, pk.E, pk.N)
	h := new(big.Int).Add(mHash, re)
	h.Mod(h, pk.N)
	return h
}

// MsgHashHex returns sha256(message) as a hex string — used externally to derive vote IDs.
func MsgHashHex(message string) string {
	sum := sha256.Sum256([]byte(message))
	return hex.EncodeToString(sum[:])
}

func msgHash(message string, N *big.Int) *big.Int {
	sum := sha256.Sum256([]byte(message))
	h := new(big.Int).SetBytes(sum[:])
	h.Mod(h, N)
	return h
}

// shamirSplit splits secret s into n shares with threshold t over Z_p
func shamirSplit(secret *big.Int, t, n int, prime *big.Int) ([]*TCHSecretShare, error) {
	// Random polynomial f(x) = secret + a1*x + a2*x^2 + ... + a_{t-1}*x^{t-1}
	coeffs := make([]*big.Int, t)
	coeffs[0] = new(big.Int).Set(secret)
	for i := 1; i < t; i++ {
		c, err := rand.Int(rand.Reader, prime)
		if err != nil {
			return nil, err
		}
		coeffs[i] = c
	}

	shares := make([]*TCHSecretShare, n)
	for i := 0; i < n; i++ {
		x := big.NewInt(int64(i + 1))
		y := evalPoly(coeffs, x, prime)
		shares[i] = &TCHSecretShare{Index: i + 1, Share: y}
	}
	return shares, nil
}

// shamirReconstruct recovers the secret from t shares via Lagrange interpolation
func shamirReconstruct(shares []*TCHSecretShare, prime *big.Int) (*big.Int, error) {
	secret := big.NewInt(0)
	for i, si := range shares {
		num := big.NewInt(1)
		den := big.NewInt(1)
		xi := big.NewInt(int64(si.Index))
		for j, sj := range shares {
			if i == j {
				continue
			}
			xj := big.NewInt(int64(sj.Index))
			// num *= xj
			num.Mul(num, xj)
			num.Mod(num, prime)
			// den *= (xj - xi)
			diff := new(big.Int).Sub(xj, xi)
			diff.Mod(diff, prime)
			den.Mul(den, diff)
			den.Mod(den, prime)
		}
		denInv := new(big.Int).ModInverse(den, prime)
		if denInv == nil {
			return nil, errors.New("shamir reconstruct: singular matrix — duplicate share indices")
		}
		li := new(big.Int).Mul(num, denInv)
		li.Mod(li, prime)
		term := new(big.Int).Mul(si.Share, li)
		term.Mod(term, prime)
		secret.Add(secret, term)
		secret.Mod(secret, prime)
	}
	return secret, nil
}

func evalPoly(coeffs []*big.Int, x, prime *big.Int) *big.Int {
	result := big.NewInt(0)
	xPow := big.NewInt(1)
	for _, c := range coeffs {
		term := new(big.Int).Mul(c, xPow)
		result.Add(result, term)
		result.Mod(result, prime)
		xPow.Mul(xPow, x)
		xPow.Mod(xPow, prime)
	}
	return result
}