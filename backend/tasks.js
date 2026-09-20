const express = require("express");
const db = require("./db");
const authenticateToken = require("./middleware");

const router = express.Router();

// Create a task
// Create a task
router.post("/", authenticateToken, (req, res) => {

    const {
        title,
        description,
        due_date
    } = req.body;

    const userId = req.user.id;

    if (!title) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const sql = `
        INSERT INTO tasks
        (user_id, title, description, due_date)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            userId,
            title,
            description || "",
            due_date || null
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "Create task database error:",
                    err
                );

                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.status(201).json({
                message: "Task created successfully",
                taskId: result.insertId
            });
        }
    );
});
// Get all tasks for logged-in user
router.get("/", authenticateToken, (req, res) => {
    const userId = req.user.id;

  const sql = `
    SELECT
        id,
        title,
        description,
        status,
        DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
        created_at
    FROM tasks
    WHERE user_id = ?
    ORDER BY created_at DESC
`;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(results);
    });
});

// Update a task
router.put("/:id", authenticateToken, (req, res) => {
    const { title, description, status } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    if (!title) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const sql = `
        UPDATE tasks
        SET title = ?, description = ?, status = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [title, description || "", status || "pending", taskId, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.json({
                message: "Task updated successfully"
            });
        }
    );
});

// Delete a task
router.delete("/:id", authenticateToken, (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;

    const sql = `
        DELETE FROM tasks
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [taskId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });
    });
});

module.exports = router;