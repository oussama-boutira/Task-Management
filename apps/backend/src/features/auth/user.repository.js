import { query } from "../../config/database.js";

// User repository - raw SQL database operations
export const userRepository = {
  // Find user by email
  async findByEmail(email) {
    const result = await query(
      `SELECT id, email, password_hash AS "passwordHash", name, role, 
              created_at AS "createdAt", updated_at AS "updatedAt" 
       FROM users WHERE email = $1`,
      [email],
    );
    return result.rows[0] || null;
  },

  // Find user by ID
  async findById(id) {
    const result = await query(
      `SELECT id, email, name, role, 
              created_at AS "createdAt", updated_at AS "updatedAt" 
       FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  // Create new user
  async create(data) {
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [data.name, data.email, data.passwordHash, data.role || "user"],
    );
    return result.rows[0];
  },

  // Get all users (for admin dropdown)
  async findAll() {
    const result = await query(
      `SELECT id, email, name, role, created_at AS "createdAt" 
       FROM users ORDER BY name ASC`,
    );
    return result.rows;
  },

  // Update user
  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.passwordHash !== undefined) {
      fields.push(`password_hash = $${paramCount++}`);
      values.push(data.passwordHash);
    }
    if (data.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(data.role);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramCount}
       RETURNING id, email, name, role, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values,
    );
    return result.rows[0] || null;
  },
};
