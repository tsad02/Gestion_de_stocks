import express from "express";
import pool from "./db.js";

const app = express();
app.use(express.json());

// Healthcheck API + DB
app.get("/api/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok;");
    res.json({ api: "ok", db: r.rows[0].ok === 1 ? "ok" : "unknown" });
  } catch (err) {
    res.status(500).json({ api: "ok", db: "error", message: err.message });
  }
});

export default app;
