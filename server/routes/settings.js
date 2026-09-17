import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Public Site Settings
router.get('/', (req, res) => {
  try {
    const row = db.prepare(`SELECT value FROM site_settings WHERE key = 'homepage'`).get();
    if (row && row.value) {
      return res.json(JSON.parse(row.value));
    }
    res.json({});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// 2. Admin: Update Site Settings
router.put('/admin', authenticateToken, requireAdmin, (req, res) => {
  try {
    const settings = req.body;
    const exists = db.prepare(`SELECT key FROM site_settings WHERE key = 'homepage'`).get();

    if (exists) {
      db.prepare(`UPDATE site_settings SET value = ?, updated_at = datetime('now') WHERE key = 'homepage'`).run(JSON.stringify(settings));
    } else {
      db.prepare(`INSERT INTO site_settings (key, value) VALUES ('homepage', ?)`).run(JSON.stringify(settings));
    }

    res.json({ message: 'Website settings saved successfully.', settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings.' });
  }
});

export default router;
