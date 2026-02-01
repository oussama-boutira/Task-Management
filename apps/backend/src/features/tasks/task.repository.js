import { query } from "../../config/database.js";

// Task repository - raw SQL database operations
export const taskRepository = {
  // Find all tasks with user info
  async findAll() {
    const result = await query(
      `SELECT t.id, t.title, t.description, t.status, t.deadline, t.user_id AS "userId",
              t.created_at AS "createdAt", t.updated_at AS "updatedAt",
              u.name AS "assignedUserName", u.email AS "assignedUserEmail"
       FROM tasks t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`,
    );
    return result.rows;
  },

  // Find tasks by user ID
  async findByUserId(userId) {
    const result = await query(
      `SELECT t.id, t.title, t.description, t.status, t.deadline, t.user_id AS "userId",
              t.created_at AS "createdAt", t.updated_at AS "updatedAt",
              u.name AS "assignedUserName", u.email AS "assignedUserEmail"
       FROM tasks t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId],
    );
    return result.rows;
  },

  // Find task by ID
  async findById(id) {
    const result = await query(
      `SELECT t.id, t.title, t.description, t.status, t.deadline, t.user_id AS "userId",
              t.created_at AS "createdAt", t.updated_at AS "updatedAt",
              u.name AS "assignedUserName", u.email AS "assignedUserEmail"
       FROM tasks t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  // Create new task
  async create(data) {
    const result = await query(
      `INSERT INTO tasks (title, description, status, deadline, user_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, title, description, status, deadline, user_id AS "userId", 
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        data.title,
        data.description || null,
        data.status || "pending",
        data.deadline || null,
        data.userId || null,
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
    if (data.userId !== undefined) {
      fields.push(`user_id = $${paramCount++}`);
      values.push(data.userId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${paramCount}
       RETURNING id, title, description, status, deadline, user_id AS "userId", 
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
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

  // Count tasks by user ID
  async countByUserId(userId) {
    const result = await query(
      "SELECT COUNT(*) FROM tasks WHERE user_id = $1",
      [userId],
    );
    return parseInt(result.rows[0].count, 10);
  },
};
