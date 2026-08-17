import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = req.userId;

  const [totals, pinned, recent, tagCounts, attachmentStats, activity] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS total FROM notes WHERE user_id = $1", [userId]),
    pool.query(
      "SELECT COUNT(*)::int AS total FROM notes WHERE user_id = $1 AND metadata->>'pinned' = 'true'",
      [userId]
    ),
    pool.query(
      "SELECT COUNT(*)::int AS total FROM notes WHERE user_id = $1 AND created_at >= now() - interval '7 days'",
      [userId]
    ),
    pool.query(
      `SELECT tag, COUNT(*)::int AS count
       FROM notes, unnest(tags) AS tag
       WHERE user_id = $1
       GROUP BY tag
       ORDER BY count DESC, tag ASC
       LIMIT 10`,
      [userId]
    ),
    pool.query(
      `SELECT COUNT(a.*)::int AS count, COALESCE(SUM(a.size_bytes), 0)::bigint AS total_bytes
       FROM attachments a
       JOIN notes n ON n.id = a.note_id
       WHERE n.user_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS count
       FROM notes
       WHERE user_id = $1 AND created_at >= now() - interval '14 days'
       GROUP BY day
       ORDER BY day ASC`,
      [userId]
    ),
  ]);

  res.json({
    totalNotes: totals.rows[0].total,
    pinnedNotes: pinned.rows[0].total,
    notesLast7Days: recent.rows[0].total,
    tagCounts: tagCounts.rows,
    attachments: {
      count: attachmentStats.rows[0].count,
      totalBytes: Number(attachmentStats.rows[0].total_bytes),
    },
    activityByDay: activity.rows,
  });
});

export default router;
