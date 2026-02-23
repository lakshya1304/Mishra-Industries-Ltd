import mongoose from "mongoose";

let db = async () => {
  try {
    let connected = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database installed successfully`);
  } catch (err) {
    console.error(`Database connection failed: ${err}`);
    // Do not use process.exit(1) in Vercel/Production as it crashes the serverless function
  }
};

export default db;
