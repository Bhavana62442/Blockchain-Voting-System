const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");
let db;

async function getDB() {
  if (!db) {
    await client.connect();
    db = client.db("digilocker_auth");
  }
  return db;
}

module.exports = { getDB };
