const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

function randomPhone() {
  return "9" + Math.floor(100000000 + Math.random() * 900000000);
}

function randomAadhaarLast4() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function seed() {
  await client.connect();
  const db = client.db("digilocker_auth");
  const users = db.collection("users");

  await users.deleteMany({});

  const data = [];

  for (let i = 0; i < 100; i++) {
    data.push({
      phone: randomPhone(),
      aadhaarLast4: randomAadhaarLast4(),
      documents: {
        voterId: i < 70,
        pan: Math.random() < 0.6,
        drivingLicense: Math.random() < 0.5
      }
    });
  }

  await users.insertMany(data);
  console.log("✅ Seeded 100 synthetic DigiLocker users");

  // Print one valid user for easy testing
  const sample = await db.collection("users").findOne({ "documents.voterId": true });
  console.log(`\n📋 Sample test user:`);
  console.log(`   Phone:   ${sample.phone}`);
  console.log(`   Aadhaar: ${sample.aadhaarLast4}\n`);

  process.exit();
}

seed();
