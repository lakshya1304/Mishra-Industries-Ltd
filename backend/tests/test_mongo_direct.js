import { MongoClient } from "mongodb";

async function testMongo() {
  console.log("Testing MongoDB connection directly...");
  const url = "mongodb://127.0.0.1:27017/mishra_industries";
  const client = new MongoClient(url, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  try {
    console.log("Connecting...");
    await client.connect();
    console.log("✓ Connected to MongoDB");

    // Test ping
    const adminDb = client.db("admin");
    const pingResult = await adminDb.command({ ping: 1 });
    console.log("✓ Ping successful:", pingResult);

    // List databases
    const databases = await client.db("admin").admin().listDatabases();
    console.log(
      "✓ Available databases:",
      databases.databases.map((d) => d.name),
    );

    // List collections in mishra_industries
    const db = client.db("mishra_industries");
    const collections = await db.listCollections().toArray();
    console.log(
      "✓ Collections:",
      collections.map((c) => c.name),
    );

    console.log("\n✅ SUCCESS - MongoDB is working!");
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("\nTroubleshooting:");
    console.error("1. Check if MongoDB service is running: net start mongodb");
    console.error("2. Verify MongoDB port 27017 is accessible");
    console.error("3. Check MongoDB logs for errors");
  } finally {
    await client.close();
  }
}

testMongo().catch(console.error);
