import db from "./config/db.js";
import app from "./config/server.js";

// Immediately Invoked Async Function Expression
(async () => {
  await db();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
