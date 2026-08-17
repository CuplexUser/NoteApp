import { Router } from "express";
import multer from "multer";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
});

async function assertNoteOwnership(noteId: string, userId: string) {
  const result = await pool.query("SELECT id FROM notes WHERE id = $1 AND user_id = $2", [
    noteId,
    userId,
  ]);
  return result.rowCount ? true : false;
}

// POST /api/notes/:noteId/attachments — stores the raw file bytes as bytea
router.post("/notes/:noteId/attachments", upload.single("file"), async (req, res) => {
  if (!(await assertNoteOwnership(req.params.noteId, req.userId!))) {
    return res.status(404).json({ error: "Note not found" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const result = await pool.query(
    `INSERT INTO attachments (note_id, filename, mime_type, size_bytes, data)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, filename, mime_type, size_bytes, created_at`,
    [req.params.noteId, req.file.originalname, req.file.mimetype, req.file.size, req.file.buffer]
  );
  res.status(201).json({ attachment: result.rows[0] });
});

// GET /api/attachments/:id/download — streams the bytea back out
router.get("/attachments/:id/download", async (req, res) => {
  const result = await pool.query(
    `SELECT a.filename, a.mime_type, a.data
     FROM attachments a
     JOIN notes n ON n.id = a.note_id
     WHERE a.id = $1 AND n.user_id = $2`,
    [req.params.id, req.userId]
  );
  const attachment = result.rows[0];
  if (!attachment) {
    return res.status(404).json({ error: "Attachment not found" });
  }
  res.setHeader("Content-Type", attachment.mime_type);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(attachment.filename)}"`
  );
  res.send(attachment.data);
});

// DELETE /api/attachments/:id
router.delete("/attachments/:id", async (req, res) => {
  const result = await pool.query(
    `DELETE FROM attachments a
     USING notes n
     WHERE a.id = $1 AND a.note_id = n.id AND n.user_id = $2`,
    [req.params.id, req.userId]
  );
  if (!result.rowCount) {
    return res.status(404).json({ error: "Attachment not found" });
  }
  res.status(204).send();
});

export default router;
