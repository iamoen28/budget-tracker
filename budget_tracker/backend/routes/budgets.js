const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();


// GET /api/budgets
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        b.id,
        b.category_id,
        c.type AS category_type,
        c.name AS category_name,
        b.budget_month,
        b.limit_amount,
        b.created_at,
        b.updated_at
      FROM budgets b
      JOIN categories c
        ON c.id = b.category_id
       AND c.user_id = b.user_id
      WHERE b.user_id = $1
      ORDER BY b.budget_month DESC, c.name ASC
      `,
      [req.userId]
    );

    res.json({
      budgets: result.rows,
    });
  } catch (error) {
    console.error("GET BUDGETS ERROR:", error);

    res.status(500).json({
      message: "Failed to load budgets",
    });
  }
});

// POST /api/budgets
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      categoryId,
      budgetMonth,
      limitAmount,
    } = req.body;

    // Validate category
    if (!categoryId) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    // Validate month
    if (!budgetMonth) {
      return res.status(400).json({
        message: "Budget month is required",
      });
    }

    // Make sure the date is the first day of the month
    const monthDate = new Date(`${budgetMonth}T00:00:00`);

    if (Number.isNaN(monthDate.getTime())) {
      return res.status(400).json({
        message: "Invalid budget month",
      });
    }

    if (monthDate.getDate() !== 1) {
      return res.status(400).json({
        message: "Budget month must be the first day of the month",
      });
    }

    // Validate amount
    const limit = Number(limitAmount);

    if (!Number.isFinite(limit) || limit <= 0) {
      return res.status(400).json({
        message: "Budget limit must be greater than zero",
      });
    }

    // Make sure the category belongs to this user
    // and is an Expense category
    const categoryResult = await pool.query(
      `
      SELECT
        id,
        type,
        name
      FROM categories
      WHERE id = $1
        AND user_id = $2
      `,
      [categoryId, req.userId]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (categoryResult.rows[0].type !== "Expense") {
      return res.status(400).json({
        message: "Budgets can only use Expense categories",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO budgets (
        user_id,
        category_id,
        budget_month,
        limit_amount
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        category_id,
        budget_month,
        limit_amount,
        created_at,
        updated_at
      `,
      [
        req.userId,
        categoryId,
        budgetMonth,
        limit,
      ]
    );

    res.status(201).json({
      budget: {
        ...result.rows[0],
        category_name: categoryResult.rows[0].name,
      },
    });
  } catch (error) {
    console.error("CREATE BUDGET ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A budget already exists for this category and month",
      });
    }

    res.status(500).json({
      message: "Failed to create budget",
    });
  }
});

// PUT /api/budgets/:id
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      budgetMonth,
      limitAmount,
    } = req.body;

    // Validate required fields
    if (!categoryId) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!budgetMonth) {
      return res.status(400).json({
        message: "Budget month is required",
      });
    }

    const monthDate = new Date(`${budgetMonth}T00:00:00`);

    if (Number.isNaN(monthDate.getTime())) {
      return res.status(400).json({
        message: "Invalid budget month",
      });
    }

    if (monthDate.getDate() !== 1) {
      return res.status(400).json({
        message: "Budget month must be the first day of the month",
      });
    }

    const limit = Number(limitAmount);

    if (!Number.isFinite(limit) || limit <= 0) {
      return res.status(400).json({
        message: "Budget limit must be greater than zero",
      });
    }

    // Make sure the category belongs to this user
    const categoryResult = await pool.query(
      `
      SELECT id, type, name
      FROM categories
      WHERE id = $1
        AND user_id = $2
      `,
      [categoryId, req.userId]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (categoryResult.rows[0].type !== "Expense") {
      return res.status(400).json({
        message: "Budgets can only use Expense categories",
      });
    }

    const result = await pool.query(
      `
      UPDATE budgets
      SET
        category_id = $1,
        budget_month = $2,
        limit_amount = $3
      WHERE id = $4
        AND user_id = $5
      RETURNING
        id,
        category_id,
        budget_month,
        limit_amount,
        created_at,
        updated_at
      `,
      [
        categoryId,
        budgetMonth,
        limit,
        id,
        req.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.json({
      budget: {
        ...result.rows[0],
        category_name: categoryResult.rows[0].name,
      },
    });
  } catch (error) {
    console.error("UPDATE BUDGET ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A budget already exists for this category and month",
      });
    }

    res.status(500).json({
      message: "Failed to update budget",
    });
  }
});

// DELETE /api/budgets/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM budgets
      WHERE id = $1
        AND user_id = $2
      RETURNING id, category_id, budget_month, limit_amount
      `,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.json({
      message: "Budget deleted successfully",
      budget: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE BUDGET ERROR:", error);

    res.status(500).json({
      message: "Failed to delete budget",
    });
  }
});

module.exports = router;