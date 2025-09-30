import express from "express";
import pool from "../config/db.js";
import redisClient from "../config/redisClient.js";

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    // Check if users are cached
    const cachedUsers = await redisClient.get("users");
    if (cachedUsers) {
      // Optionally, count a cache hit here
      console.log("Serving from Redis cache");
      return res.json({ data: JSON.parse(cachedUsers), cached: true });
    }

    // If not cached, fetch from DB
    console.log("Fetching users from database...");
    const result = await pool.query("SELECT * FROM users ORDER BY id");
    const users = result.rows;

    // Cache the result in Redis
    await redisClient.set("users", JSON.stringify(users));
    // Optionally, set an expiration: redisClient.setEx('users', 600, JSON.stringify(users));

    res.json({ data: users, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add a new user
router.post("/", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  // SQL to create the users table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL
    );
  `;

  try {
    // Ensure table exists before insert
    await pool.query(createTableQuery);

    // Now insert the user
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Flush Redis cache
router.post("/flush-cache", async (req, res) => {
  try {
    await redisClient.flushAll();
    res.json({ message: "Redis cache flushed successfully" });
  } catch (error) {
    console.error("Error flushing Redis:", error);
    res.status(500).json({ error: "Failed to flush Redis cache" });
  }
});

export default router;
