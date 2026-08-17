import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { createNoteSchema, updateNoteSchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

// GET /api/notes?search=&tags=a,b&pinned=true
router.get("/", async (req, res) => {
  const { search, tags, pinned } = req.query;
  const conditions: string[] = ["user_id = $1"];
  const params: unknown[] = [req.userId];

  if (search && typeof search === "string" && search.trim()) {
    params.push(search.trim());
    conditions.push(`search_vector @@ plainto_tsquery('english', $${params.length})`);
  }

  if (tags && typeof tags === "string" && tags.trim()) {
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tagList.length) {
      params.push(tagList);
      conditions.push(`tags && $${params.length}::text[]`);
    }
  }

  if (pinned === "true") {
    conditions.push(`metadata->>'pinned' = 'true'`);
  }

  const whereClause = conditions.join(" AND ");
  const orderClause =
    search && typeof search === "string" && search.trim()
      ? `ORDER BY ts_rank(search_vector, plainto_tsquery('english', $2)) DESC, updated_at DESC`
      : `ORDER BY updated_at DESC`;

  const sql = `
    SELECT n.id, n.title, n.content, n.tags, n.metadata, n.created_at, n.updated_at,
      COALESCE(
        (SELECT json_agg(json_build_object('id', a.id, 'filename', a.filename, 'mime_type', a.mime_type, 'size_bytes', a.size_bytes, 'created_at', a.created_at) ORDER BY a.created_at)
         FROM attachments a WHERE a.note_id = n.id), '[]'
      ) AS attachments
    FROM notes n
    WHERE ${whereClause}
    ${orderClause}
  `;

  const result = await pool.query(sql, params);
  res.json({ notes: result.rows });
});

router.get("/tags", async (req, res) => {
  const result = await pool.query(
    `SELECT DISTINCT unnest(tags) AS tag FROM notes WHERE user_id = $1 ORDER BY tag`,
    [req.userId]
  );
  res.json({ tags: result.rows.map((r: { tag: string }) => r.tag) });
});

router.post("/", async (req, res) => {
  const parsed = createNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { title, content, tags, metadata } = parsed.data;

  const result = await pool.query(
    `INSERT INTO notes (user_id, title, content, tags, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, content, tags, metadata, created_at, updated_at`,
    [req.userId, title, content, tags, JSON.stringify(metadata)]
  );
  res.status(201).json({ note: { ...result.rows[0], attachments: [] } });
});

router.put("/:id", async (req, res) => {
  const parsed = updateNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const existing = await pool.query("SELECT id FROM notes WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.userId,
  ]);
  if (!existing.rowCount) {
    return res.status(404).json({ error: "Note not found" });
  }

  const { title, content, tags, metadata } = parsed.data;
  const result = await pool.query(
    `UPDATE notes SET
       title = COALESCE($1, title),
       content = COALESCE($2, content),
       tags = COALESCE($3, tags),
       metadata = COALESCE($4, metadata)
     WHERE id = $5 AND user_id = $6
     RETURNING id, title, content, tags, metadata, created_at, updated_at`,
    [
      title ?? null,
      content ?? null,
      tags ?? null,
      metadata ? JSON.stringify(metadata) : null,
      req.params.id,
      req.userId,
    ]
  );
  res.json({ note: result.rows[0] });
});

router.delete("/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.userId,
  ]);
  if (!result.rowCount) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.status(204).send();
});

export default router;
