import "dotenv/config";

// Environment configuration with validation
const requiredEnvVars = ["DATABASE_URL"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  port: process.env.PORT || 3001,
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
