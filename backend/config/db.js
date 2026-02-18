let mongo = require("mongoose");

let db = async () => {
  mongo
    .connect(process.env.MONGO_URI)
    .then(() => console.log(`Database installed successfully`))
    .catch((err) => {
      console.error(`Database connection failed: ${err}`);
      // Do not use process.exit(1) in Vercel/Production as it crashes the serverless function
    });
};

module.exports = db;
