import db from "./config/db.js";
import app from "./config/server.js";
<<<<<<< HEAD
import "dotenv/config";
// Immediately Invoked Async Function Expression
(async () => {
  try {
    // Block startup until DB is connected (rejects after retries).
    await db();
  } catch (err) {
    console.error("FATAL: Database connection failed:", err.message || err);
    process.exit(1);
  }

=======
import "dotenv/config"
// Immediately Invoked Async Function Expression
(async () => {
  await db();
>>>>>>> d6af449afae658f3056276f162bee9b4028035ad
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
