// drizzle.config.js
import "dotenv/config";

/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./src/database/schema/schema.js", // path to your Drizzle schema
  out: "./drizzle",                          // folder for generated SQL migrations
  dialect: "mysql",                          
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "transaction_engine",
  },
};
