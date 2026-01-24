import { query } from "../config/database.js";

async function runMigration() {
  try {
    console.log("🔄 Running migration: Add deadline column...");
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tasks' AND column_name = 'deadline'
        ) THEN
          ALTER TABLE tasks ADD COLUMN deadline TIMESTAMP WITH TIME ZONE;
          RAISE NOTICE 'Added deadline column to tasks table';
        ELSE
          RAISE NOTICE 'Deadline column already exists';
        END IF;
      END $$;
    `);
    console.log("✅ Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
