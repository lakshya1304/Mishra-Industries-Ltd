import mongoose from "mongoose";

let retryCount = 0;
const MAX_RETRIES = 5;

// Returns a promise that resolves when connected or rejects after max retries
const db = () => {
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      try {
        const mongoUri = process.env.MONGO_URI || "";

        // Connection options - allow tuning via environment variables.
        const options = {
          maxPoolSize: 10,
          minPoolSize: 2,
          serverSelectionTimeoutMS:
            Number(process.env.DB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
          connectTimeoutMS: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10000,
          socketTimeoutMS: Number(process.env.DB_SOCKET_TIMEOUT_MS) || 60000,
          family: 4,
          retryWrites: true,
        };

        const connected = await mongoose.connect(mongoUri, options);
        console.log(
          `✓ Database connected to: ${connected.connection.host}/${connected.connection.name}`,
        );
        retryCount = 0;
        return resolve(connected);
      } catch (err) {
        retryCount++;
        console.error(
          `✗ Database connection failed (attempt ${retryCount}): ${err.message}`,
        );

        if (retryCount < MAX_RETRIES) {
          const delay = 1000; // 1s between attempts
          console.log(`⟳ Retrying in ${delay}ms (${retryCount}/${MAX_RETRIES})...`);
          setTimeout(attempt, delay);
        } else {
          const message =
            "❌ Max retries reached. Check your MongoDB Atlas credentials and network.";
          console.error(message);
          return reject(new Error(message));
        }
      }
    };

    attempt();
  });
};

export default db;
