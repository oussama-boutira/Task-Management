import pg from "pg";
import { config } from "./env.js";

const { Pool } = pg;

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

// Test connection
pool.on("connect", () => {
  console.log("📦 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

// Helper function for queries
export const query = (text, params) => pool.query(text, params);
