import { query } from "../config/database.js";

// SQL to create users table
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

// SQL to create tasks table
const createTasksTable = `
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  deadline TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create index for chronological sorting
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Create index for user filtering
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
`;

// Migration: Add user_id to existing tasks table if it doesn't exist
const migrateTasksTable = `
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'user_id'
  ) THEN 
    ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
  END IF;
END $$;
`;

// Migration: Add time tracking columns to tasks table
const migrateTimeTracking = `
DO $$ 
BEGIN 
  -- Add started_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'started_at'
  ) THEN 
    ALTER TABLE tasks ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add completed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'completed_at'
  ) THEN 
    ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add time_spent column (in minutes)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'time_spent'
  ) THEN 
    ALTER TABLE tasks ADD COLUMN time_spent INTEGER;
  END IF;
END $$;
`;

async function initDatabase() {
  try {
    console.log("🔄 Initializing database...");

    // Create users table first (tasks depends on it)
    console.log("📦 Creating users table...");
    await query(createUsersTable);
    console.log("✅ Users table created successfully");

    // Create or update tasks table
    console.log("📦 Creating tasks table...");
    await query(createTasksTable);
    console.log("✅ Tasks table created successfully");

    // Run migration for existing tasks table
    console.log("🔄 Running migrations...");
    await query(migrateTasksTable);
    await query(migrateTimeTracking);
    console.log("✅ Migrations completed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
}

initDatabase();
