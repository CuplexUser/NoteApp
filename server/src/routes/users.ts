import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { updateNameSchema, changePasswordSchema } from "../utils/validation.js";
import { USER_PUBLIC_FIELDS } from "../utils/sql.js";

const router = Router();
router.use(requireAuth);

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB cap
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.put("/me", async (req, res) => {
  const parsed = updateNameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const result = await pool.query(
    `UPDATE users SET name = $1 WHERE id = $2 RETURNING ${USER_PUBLIC_FIELDS}`,
    [parsed.data.name, req.userId]
  );
  res.json({ user: result.rows[0] });
});

router.put("/me/password", async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { currentPassword, newPassword } = parsed.data;

  const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [req.userId]);
  const user = result.rows[0];
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, req.userId]);
  res.status(204).send();
});

router.post("/me/avatar", avatarUpload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const result = await pool.query(
    `UPDATE users SET avatar_data = $1, avatar_mime_type = $2, avatar_updated_at = now()
     WHERE id = $3 RETURNING ${USER_PUBLIC_FIELDS}`,
    [req.file.buffer, req.file.mimetype, req.userId]
  );
  res.json({ user: result.rows[0] });
});

router.delete("/me/avatar", async (req, res) => {
  const result = await pool.query(
    `UPDATE users SET avatar_data = NULL, avatar_mime_type = NULL, avatar_updated_at = now()
     WHERE id = $1 RETURNING ${USER_PUBLIC_FIELDS}`,
    [req.userId]
  );
  res.json({ user: result.rows[0] });
});

router.get("/me/avatar", async (req, res) => {
  const result = await pool.query("SELECT avatar_data, avatar_mime_type FROM users WHERE id = $1", [
    req.userId,
  ]);
  const user = result.rows[0];
  if (!user?.avatar_data) {
    return res.status(404).json({ error: "No avatar set" });
  }
  res.setHeader("Content-Type", user.avatar_mime_type);
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.send(user.avatar_data);
});

export default router;
