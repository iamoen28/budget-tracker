const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();


// GET /api/categories
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        type,
        name,
        created_at
      FROM categories
      WHERE user_id = $1
      ORDER BY type ASC, name ASC
      `,
      [req.userId]
    );

    res.json({
      categories: result.rows,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    res.status(500).json({
      message: "Failed to load categories",
    });
  }
});

// POST /api/categories
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { type, name } = req.body;

    if (type !== "Income" && type !== "Expense") {
      return res.status(400).json({
        message: "Category type must be Income or Expense",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO categories (
        user_id,
        type,
        name
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        type,
        name,
        created_at
      `,
      [
        req.userId,
        type,
        name.trim(),
      ]
    );

    res.status(201).json({
      category: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "This category already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create category",
    });
  }
});


module.exports = router;