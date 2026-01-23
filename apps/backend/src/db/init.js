import { query } from "../config/database.js";

// SQL to create tasks table
const createTasksTable = `
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create index for chronological sorting
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
`;

async function initDatabase() {
  try {
    console.log("🔄 Initializing database...");
    await query(createTasksTable);
    console.log("✅ Tasks table created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
}

initDatabase();
