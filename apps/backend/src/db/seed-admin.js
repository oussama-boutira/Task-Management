import bcrypt from "bcryptjs";
import { query } from "../config/database.js";

// Admin user to seed
const adminUser = {
  name: "SuperAdmin",
  email: "admin@gmail.com",
  password: "admin123",
  role: "admin",
};

async function seedAdmin() {
  try {
    console.log("🔄 Seeding admin user...");

    // Check if admin already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      adminUser.email,
    ]);

    if (existingUser.rows.length > 0) {
      console.log("⚠️ Admin user already exists, skipping...");
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminUser.password, salt);

    // Insert admin user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [adminUser.name, adminUser.email, passwordHash, adminUser.role],
    );

    console.log("✅ Admin user created successfully:");
    console.log(`   Name: ${result.rows[0].name}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Role: ${result.rows[0].role}`);
    console.log(`   Password: ${adminUser.password}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
