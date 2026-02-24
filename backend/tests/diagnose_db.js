import mongoose from "mongoose";
import "dotenv/config";

async function diagnoseDB() {
  console.log("🔍 Database Diagnostic Tool");
  console.log("================================");

  // Check environment
  console.log("\n1️⃣ Environment Check:");
  console.log("   NODE_ENV:", process.env.NODE_ENV);
  console.log("   MONGO_URI:", process.env.MONGO_URI ? "✓ Set" : "✗ Missing");

  if (!process.env.MONGO_URI) {
    console.error("   ❌ No MONGO_URI in .env");
    process.exit(1);
  }

  // Extract and display connection details
  const matches = process.env.MONGO_URI.match(
    /mongodb\+srv:\/\/([^:]+):(.+)@([^/]+)\/(.*)/,
  );
  if (matches) {
    console.log("   User:", matches[1]);
    console.log("   Host:", matches[3]);
    console.log("   Database:", matches[4] || "(default)");
  }

  // Test DNS resolution
  console.log("\n2️⃣ Network Connectivity Check:");
  const { promisify } = await import("util");
  const dns = await import("dns");
  const resolve = promisify(dns.resolve);

  try {
    if (matches) {
      const host = matches[3];
      console.log(`   Resolving ${host}...`);
      const addresses = await resolve(host);
      console.log(`   ✓ DNS resolved to: ${addresses.join(", ")}`);
    }
  } catch (err) {
    console.error(`   ✗ DNS resolution failed: ${err.message}`);
  }

  // Test MongoDB connection with timeout
  console.log("\n3️⃣ MongoDB Connection Test:");
  const connectTimeout = 8000;
  const queryTimeout = 5000;

  console.log(`   Attempting connection (${connectTimeout}ms timeout)...`);
  const startTime = Date.now();

  try {
    // Set connection timeout
    mongoose.set("socketTimeoutMS", connectTimeout);

    const conn = await Promise.race([
      mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: connectTimeout,
        socketTimeoutMS: queryTimeout,
        family: 4,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Connection timeout")),
          connectTimeout,
        ),
      ),
    ]);

    const connTime = Date.now() - startTime;
    console.log(`   ✓ Connected in ${connTime}ms`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

    // Test a simple query
    console.log(`\n4️⃣ Query Performance Test (${queryTimeout}ms timeout):`);
    const queryStart = Date.now();

    try {
      // Ping the database
      const adminDb = conn.connection.getClient().db("admin");
      await adminDb.command({ ping: 1 });
      const queryTime = Date.now() - queryStart;
      console.log(`   ✓ Ping successful in ${queryTime}ms`);
    } catch (err) {
      console.error(`   ✗ Query failed: ${err.message}`);
    }

    // Test collection access
    console.log(`\n5️⃣ Collection Test:`);
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections().toArray();
      console.log(`   ✓ Found ${collections.length} collections`);
      if (collections.length > 0) {
        console.log(
          `   Collections: ${collections.map((c) => c.name).join(", ")}`,
        );
      }
    } catch (err) {
      console.error(`   ✗ Collection listing failed: ${err.message}`);
    }

    await mongoose.disconnect();
    console.log("\n✅ Diagnostic complete - Database is accessible!");
  } catch (err) {
    console.error(`\n   ✗ Connection failed: ${err.message}`);
    console.error("\n   Possible issues:");
    console.error("   1. MongoDB Atlas cluster is paused or inactive");
    console.error("   2. Invalid credentials (check username/password)");
    console.error("   3. Network timeout (firewall/proxy blocking connection)");
    console.error(
      "   4. IP whitelist - check if your IP is whitelisted in Atlas",
    );
    process.exit(1);
  }
}

diagnoseDB().catch(console.error);
