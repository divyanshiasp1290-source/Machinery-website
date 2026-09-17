import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Subscribe to Newsletter (Public)
router.post('/subscribe', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare(`SELECT * FROM newsletter_subscribers WHERE email = ?`).get(cleanEmail);

    if (existing) {
      if (!existing.is_active) {
        db.prepare(`UPDATE newsletter_subscribers SET is_active = 1 WHERE id = ?`).run(existing.id);
        return res.json({ message: 'Welcome back! Your subscription has been reactivated.' });
      }
      return res.json({ message: 'You are already subscribed to our additive manufacturing briefings.' });
    }

    const id = 'sub_' + crypto.randomUUID();
    db.prepare(`INSERT INTO newsletter_subscribers (id, email, is_active) VALUES (?, ?, 1)`).run(id, cleanEmail);

    res.status(201).json({ message: 'Thank you! You are now subscribed to the FORGE 3D engineering briefing.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process newsletter subscription.' });
  }
});

// 2. Unsubscribe (Public)
router.post('/unsubscribe', (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      db.prepare(`UPDATE newsletter_subscribers SET is_active = 0 WHERE email = ?`).run(email.toLowerCase().trim());
    }
    res.json({ message: 'You have been unsubscribed from future mailings.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsubscribe.' });
  }
});

// 3. Admin: List All Subscribers
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC`).all();
    res.json(rows.map(r => ({ ...r, isActive: Boolean(r.is_active) })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

// 4. Admin: Export Subscribers CSV
router.get('/admin/export', authenticateToken, requireAdmin, (req, res) => {
  try {
    const rows = db.prepare(`SELECT email, is_active, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC`).all();
    const headers = ['Email', 'Active', 'Subscribed At'];
    const csvRows = [headers.join(',')];

    for (const r of rows) {
      csvRows.push(`"${r.email}",${r.is_active ? 'Yes' : 'No'},"${r.subscribed_at}"`);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="forge3d-newsletter-subscribers.csv"');
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({ error: 'Failed to export subscribers.' });
  }
});

export default router;
