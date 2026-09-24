const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();


// GET /api/goals
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        target_amount,
        current_amount,
        target_date,
        created_at,
        updated_at
      FROM goals
      WHERE user_id = $1
      ORDER BY target_date ASC NULLS LAST, name ASC
      `,
      [req.userId]
    );

    res.json({
      goals: result.rows,
    });
  } catch (error) {
    console.error("GET GOALS ERROR:", error);

    res.status(500).json({
      message: "Failed to load goals",
    });
  }
});

// POST /api/goals
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      targetDate,
    } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Goal name is required",
      });
    }

    // Validate target amount
    const target = Number(targetAmount);

    if (!Number.isFinite(target) || target <= 0) {
      return res.status(400).json({
        message: "Target amount must be greater than zero",
      });
    }

    // Validate current amount
    const current =
      currentAmount === undefined ||
      currentAmount === null ||
      currentAmount === ""
        ? 0
        : Number(currentAmount);

    if (!Number.isFinite(current) || current < 0) {
      return res.status(400).json({
        message: "Current amount must be non-negative",
      });
    }

    if (current > target) {
      return res.status(400).json({
        message: "Current amount cannot exceed target amount",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO goals (
        user_id,
        name,
        target_amount,
        current_amount,
        target_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        name,
        target_amount,
        current_amount,
        target_date,
        created_at,
        updated_at
      `,
      [
        req.userId,
        name.trim(),
        target,
        current,
        targetDate || null,
      ]
    );

    res.status(201).json({
      goal: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE GOAL ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A goal with that name already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create goal",
    });
  }
});

// PUT /api/goals/:id
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      targetAmount,
      currentAmount,
      targetDate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Goal name is required",
      });
    }

    const target = Number(targetAmount);

    if (!Number.isFinite(target) || target <= 0) {
      return res.status(400).json({
        message: "Target amount must be greater than zero",
      });
    }

    const current =
      currentAmount === undefined ||
      currentAmount === null ||
      currentAmount === ""
        ? 0
        : Number(currentAmount);

    if (!Number.isFinite(current) || current < 0) {
      return res.status(400).json({
        message: "Current amount must be non-negative",
      });
    }

    if (current > target) {
      return res.status(400).json({
        message: "Current amount cannot exceed target amount",
      });
    }

    const result = await pool.query(
      `
      UPDATE goals
      SET
        name = $1,
        target_amount = $2,
        current_amount = $3,
        target_date = $4
      WHERE id = $5
        AND user_id = $6
      RETURNING
        id,
        name,
        target_amount,
        current_amount,
        target_date,
        created_at,
        updated_at
      `,
      [
        name.trim(),
        target,
        current,
        targetDate || null,
        id,
        req.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.json({
      goal: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE GOAL ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A goal with that name already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update goal",
    });
  }
});

// DELETE /api/goals/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM goals
      WHERE id = $1
        AND user_id = $2
      RETURNING
        id,
        name,
        target_amount,
        current_amount,
        target_date
      `,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.json({
      message: "Goal deleted successfully",
      goal: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE GOAL ERROR:", error);

    res.status(500).json({
      message: "Failed to delete goal",
    });
  }
});



module.exports = router;