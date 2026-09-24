const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();


// GET /api/transactions
// Get transactions belonging to the logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        type,
        account_id,
        from_account_id,
        to_account_id,
        category_id,
        amount,
        fee_amount,
        description,
        transaction_date,
        transaction_time,
        linked_transfer_id,
        created_at,
        updated_at
      FROM transactions
      WHERE user_id = $1
      ORDER BY transaction_date DESC, created_at DESC
      `,
      [req.userId]
    );

    res.json({
      transactions: result.rows,
    });
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);

    res.status(500).json({
      message: "Failed to load transactions",
    });
  }
});

// POST /api/transactions
// Create an Income or Expense transaction
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      type,
      accountId,
      categoryId,
      amount,
      feeAmount,
      description,
      transactionDate,
      transactionTime,
    } = req.body;

    // Validate transaction type
    if (type !== "Income" && type !== "Expense") {
      return res.status(400).json({
        message: "Transaction type must be Income or Expense",
      });
    }

    // Validate account
    if (!accountId) {
      return res.status(400).json({
        message: "Account is required",
      });
    }

    // Validate amount
    const transactionAmount = Number(amount);

    if (
      !Number.isFinite(transactionAmount) ||
      transactionAmount <= 0
    ) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    // Validate fee
    const transactionFee =
      feeAmount === undefined ||
      feeAmount === null ||
      feeAmount === ""
        ? 0
        : Number(feeAmount);

    if (
      !Number.isFinite(transactionFee) ||
      transactionFee < 0
    ) {
      return res.status(400).json({
        message: "Fee must be a non-negative number",
      });
    }

    // Check that the account belongs to this user
    const accountResult = await pool.query(
      `
      SELECT id
      FROM accounts
      WHERE id = $1
        AND user_id = $2
      `,
      [accountId, req.userId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // If a category was supplied, make sure it belongs to this user
    if (categoryId) {
      const categoryResult = await pool.query(
        `
        SELECT id
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
    }

    // Validate date
    if (!transactionDate) {
      return res.status(400).json({
        message: "Transaction date is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO transactions (
        user_id,
        type,
        account_id,
        category_id,
        amount,
        fee_amount,
        description,
        transaction_date,
        transaction_time
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING
        id,
        type,
        account_id,
        category_id,
        amount,
        fee_amount,
        description,
        transaction_date,
        transaction_time,
        created_at,
        updated_at
      `,
      [
        req.userId,
        type,
        accountId,
        categoryId || null,
        transactionAmount,
        transactionFee,
        description || null,
        transactionDate,
        transactionTime || null,
      ]
    );

    res.status(201).json({
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE TRANSACTION ERROR:", error);

    res.status(500).json({
      message: "Failed to create transaction",
    });
  }
});

// POST /api/transactions/transfer
// Create a transfer between two accounts
router.post("/transfer", authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      fromAccountId,
      toAccountId,
      amount,
      description,
      transactionDate,
      transactionTime,
    } = req.body;

    // Validate accounts
    if (!fromAccountId || !toAccountId) {
      return res.status(400).json({
        message: "Both source and destination accounts are required",
      });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({
        message: "Source and destination accounts must be different",
      });
    }

    // Validate amount
    const transferAmount = Number(amount);

    if (
      !Number.isFinite(transferAmount) ||
      transferAmount <= 0
    ) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    // Validate date
    if (!transactionDate) {
      return res.status(400).json({
        message: "Transaction date is required",
      });
    }

    // Make sure both accounts belong to this user
    const accountsResult = await client.query(
      `
      SELECT id
      FROM accounts
      WHERE id = ANY($1::uuid[])
        AND user_id = $2
      `,
      [
        [fromAccountId, toAccountId],
        req.userId,
      ]
    );

    if (accountsResult.rows.length !== 2) {
      return res.status(404).json({
        message: "One or both accounts were not found",
      });
    }

    await client.query("BEGIN");

    // Create the transfer transaction
    const result = await client.query(
      `
      INSERT INTO transactions (
        user_id,
        type,
        from_account_id,
        to_account_id,
        amount,
        fee_amount,
        description,
        transaction_date,
        transaction_time
      )
      VALUES (
        $1,
        'Transfer',
        $2,
        $3,
        $4,
        0,
        $5,
        $6,
        $7
      )
      RETURNING
        id,
        type,
        from_account_id,
        to_account_id,
        amount,
        fee_amount,
        description,
        transaction_date,
        transaction_time,
        created_at,
        updated_at
      `,
      [
        req.userId,
        fromAccountId,
        toAccountId,
        transferAmount,
        description || null,
        transactionDate,
        transactionTime || null,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      transaction: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("CREATE TRANSFER ERROR:", error);

    res.status(500).json({
      message: "Failed to create transfer",
    });
  } finally {
    client.release();
  }
});


module.exports = router;