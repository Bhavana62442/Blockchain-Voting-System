// src/api.js  — import this everywhere instead of hardcoding URLs
//
// Your running services (all in WSL):
//   Auth server  → localhost:3000   (node server.js in auth-backend/)
//   MSP server   → localhost:8080   (go run . in msp-blind-signature/)
//   Blockchain   → localhost:4000   (node server.js in blockchain-api/)
//   React dev    → localhost:3001   ← this is the FRONTEND, not an API!

export const AUTH_API      = "http://localhost:3000";   // OTP / DigiLocker
export const MSP_API       = "http://localhost:8080";   // blind-sig / token
export const BLOCKCHAIN_API = "http://localhost:4000";  // vote cast / results
