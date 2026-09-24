const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if the email already exists
    const existingUser = await pool.query(
      `
      SELECT id
      FROM app_users
      WHERE email = $1
      `,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the user
    const result = await pool.query(
      `
      INSERT INTO app_users (
        email,
        password_hash,
        display_name
      )
      VALUES ($1, $2, $3)
      RETURNING id, email, display_name, created_at
      `,
      [
        normalizedEmail,
        passwordHash,
        displayName ? displayName.trim() : null,
      ]
    );

    const user = result.rows[0];

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    res.status(500).json({
      message: "Signup failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find the user
    const result = await pool.query(
      `
      SELECT
        id,
        email,
        password_hash,
        display_name
      FROM app_users
      WHERE email = $1
      `,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Compare password with stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Don't send password_hash to the frontend
    res.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
      },
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

module.exports = router;