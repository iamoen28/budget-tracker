const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();


// GET /api/accounts
// Get accounts belonging to the logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        opening_balance,
        created_at,
        updated_at
      FROM accounts
      WHERE user_id = $1
      ORDER BY name ASC
      `,
      [req.userId]
    );

    res.json({
      accounts: result.rows,
    });
  } catch (error) {
    console.error("GET ACCOUNTS ERROR:", error);

    res.status(500).json({
      message: "Failed to load accounts",
    });
  }
});


// POST /api/accounts
// Create an account for the logged-in user
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, openingBalance } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Account name is required",
      });
    }

    // Use 0 when opening balance isn't provided
    const balance =
      openingBalance === undefined ||
      openingBalance === null ||
      openingBalance === ""
        ? 0
        : Number(openingBalance);

    // Validate balance
    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({
        message: "Opening balance must be a non-negative number",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO accounts (
        user_id,
        name,
        opening_balance
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        opening_balance,
        created_at,
        updated_at
      `,
      [
        req.userId,
        name.trim(),
        balance,
      ]
    );

    res.status(201).json({
      account: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE ACCOUNT ERROR:", error);

    // Handle duplicate account name
    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account with that name already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create account",
    });
  }
});

// PUT /api/accounts/:id
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, openingBalance } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Account name is required",
      });
    }

    const balance = Number(openingBalance);

    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({
        message: "Opening balance must be a non-negative number",
      });
    }

    const result = await pool.query(
      `
      UPDATE accounts
      SET
        name = $1,
        opening_balance = $2
      WHERE id = $3
        AND user_id = $4
      RETURNING
        id,
        name,
        opening_balance,
        created_at,
        updated_at
      `,
      [
        name.trim(),
        balance,
        id,
        req.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    res.json({
      account: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE ACCOUNT ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account with that name already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update account",
    });
  }
});// PUT /api/accounts/:id
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, openingBalance } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Account name is required",
      });
    }

    const balance = Number(openingBalance);

    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({
        message: "Opening balance must be a non-negative number",
      });
    }

    const result = await pool.query(
      `
      UPDATE accounts
      SET
        name = $1,
        opening_balance = $2
      WHERE id = $3
        AND user_id = $4
      RETURNING
        id,
        name,
        opening_balance,
        created_at,
        updated_at
      `,
      [
        name.trim(),
        balance,
        id,
        req.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    res.json({
      account: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE ACCOUNT ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account with that name already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update account",
    });
  }
});

// DELETE /api/accounts/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM accounts
      WHERE id = $1
        AND user_id = $2
      RETURNING id, name
      `,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    res.json({
      message: "Account deleted successfully",
      account: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);

    // Account cannot be deleted if transactions reference it
    if (error.code === "23503") {
      return res.status(409).json({
        message: "Cannot delete this account because it has transactions",
      });
    }

    res.status(500).json({
      message: "Failed to delete account",
    });
  }
});

module.exports = router;