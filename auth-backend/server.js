console.log("Server file loaded");

const express = require("express");


const otpStore = {};
const { getDB } = require("./db");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.post("/auth/start", async (req, res) => {

  const { phone, aadhaarLast4 } = req.body;

 const db = await getDB();
const user = await db.collection("users").findOne({
  phone,
  aadhaarLast4
});


  if (!user) {
    return res.status(401).json({ error: "INVALID_DETAILS" });
  }

 const otp = Math.floor(100000 + Math.random() * 900000).toString();
const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes

otpStore[phone] = { otp, expiresAt };

console.log(`OTP for ${phone}: ${otp}`);

res.json({ status: "OTP_SENT" });

});
app.post("/auth/verify", async (req, res) => {

  const { phone, otp } = req.body;

  const record = otpStore[phone];

  if (!record) {
    return res.status(400).json({ error: "OTP_NOT_FOUND" });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[phone];
    return res.status(400).json({ error: "OTP_EXPIRED" });
  }

  if (record.otp !== otp) {
    return res.status(401).json({ error: "INVALID_OTP" });
  }

  delete otpStore[phone];

  const db = await getDB();
const user = await db.collection("users").findOne({ phone });


  if (!user.documents || user.documents.voterId !== true){
    return res.json({ allowed: false, reason: "NO_VOTER_ID" });
  }

  res.json({ allowed: true });
});

app.listen(3000, () => {
  console.log("Auth server running on port 3000");
});
