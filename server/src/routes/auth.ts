import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { signToken } from "../utils/jwt.js";
import { registerSchema, loginSchema } from "../utils/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { USER_PUBLIC_FIELDS } from "../utils/sql.js";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password, name } = parsed.data;

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING ${USER_PUBLIC_FIELDS}`,
    [email, passwordHash, name]
  );
  const user = result.rows[0];

  const token = signToken({ userId: user.id });
  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({ user });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  const result = await pool.query(
    `SELECT password_hash, ${USER_PUBLIC_FIELDS} FROM users WHERE email = $1`,
    [email]
  );
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { password_hash: _passwordHash, ...publicUser } = user;
  const token = signToken({ userId: user.id });
  res.cookie("token", token, COOKIE_OPTIONS);
  res.json({ user: publicUser });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
  res.status(204).send();
});

router.get("/me", requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT ${USER_PUBLIC_FIELDS} FROM users WHERE id = $1`,
    [req.userId]
  );
  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user });
});

export default router;
