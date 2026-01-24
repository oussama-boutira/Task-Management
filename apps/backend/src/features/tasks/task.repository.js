import { query } from "../../config/database.js";

// Task repository - raw SQL database operations
export const taskRepository = {
  // Find all tasks
  async findAll() {
    const result = await query(
      'SELECT id, title, description, status, deadline, created_at AS "createdAt", updated_at AS "updatedAt" FROM tasks ORDER BY created_at DESC',
    );
    return result.rows;
  },

  // Find task by ID
  async findById(id) {
    const result = await query(
      'SELECT id, title, description, status, deadline, created_at AS "createdAt", updated_at AS "updatedAt" FROM tasks WHERE id = $1',
      [id],
    );
    return result.rows[0] || null;
  },

  // Create new task
  async create(data) {
    const result = await query(
      `INSERT INTO tasks (title, description, status, deadline) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, description, status, deadline, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        data.title,
        data.description || null,
        data.status || "pending",
        data.deadline || null,
      ],
    );
    return result.rows[0];
  },

  // Update task
  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.deadline !== undefined) {
      fields.push(`deadline = $${paramCount++}`);
      values.push(data.deadline);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${paramCount}
       RETURNING id, title, description, status, deadline, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values,
    );
    return result.rows[0] || null;
  },

  // Delete task
  async delete(id) {
    const result = await query("DELETE FROM tasks WHERE id = $1 RETURNING id", [
      id,
    ]);
    return result.rows[0] || null;
  },

  // Count all tasks
  async count() {
    const result = await query("SELECT COUNT(*) FROM tasks");
    return parseInt(result.rows[0].count, 10);
  },
};
