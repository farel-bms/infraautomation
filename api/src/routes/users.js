const express = require("express");
const db      = require("../db");
const sqs     = require("../sqs");

const router = express.Router();

// ── GET /api/users ────────────────────────────────────────
router.get("/", async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, email, institution, position, phone, created_at
       FROM users ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/users/:id ────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, email, institution, position, phone, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── POST /api/users ───────────────────────────────────────
router.post("/", async (req, res, next) => {
  const { name, email, institution, position, phone } = req.body;
  if (!name?.trim() || !email?.trim())
    return res.status(400).json({ error: "name and email are required" });

  try {
    const { rows } = await db.query(
      `INSERT INTO users (name, email, institution, position, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, institution, position, phone, created_at`,
      [name.trim(), email.trim(), institution || null, position || null, phone || null]
    );
    sqs.publishEvent("user.created", { userId: rows[0].id, email: rows[0].email })
       .catch((e) => console.error("SQS publish failed:", e.message));
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "Email already exists" });
    next(err);
  }
});

// ── PUT /api/users/:id ────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  const { name, email, institution, position, phone } = req.body;
  if (!name?.trim() || !email?.trim())
    return res.status(400).json({ error: "name and email are required" });

  try {
    const { rows } = await db.query(
      `UPDATE users
       SET name=$1, email=$2, institution=$3, position=$4, phone=$5, updated_at=NOW()
       WHERE id=$6
       RETURNING id, name, email, institution, position, phone, updated_at`,
      [name.trim(), email.trim(), institution || null, position || null, phone || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    sqs.publishEvent("user.updated", { userId: rows[0].id })
       .catch((e) => console.error("SQS publish failed:", e.message));
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "Email already exists" });
    next(err);
  }
});

// ── DELETE /api/users/:id ─────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM users WHERE id = $1",
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "User not found" });
    sqs.publishEvent("user.deleted", { userId: req.params.id })
       .catch((e) => console.error("SQS publish failed:", e.message));
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
