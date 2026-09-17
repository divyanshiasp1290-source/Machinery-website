import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function formatEnquiry(e) {
  return {
    id: e.id,
    type: e.type,
    name: e.name,
    email: e.email,
    phone: e.phone,
    company: e.company,
    productId: e.product_id,
    productName: e.product_name,
    message: e.message,
    details: typeof e.details === 'string' ? JSON.parse(e.details) : (e.details || {}),
    status: e.status,
    internalNotes: e.internal_notes,
    createdAt: e.created_at
  };
}

// 1. Submit Enquiry (Public)
router.post('/', (req, res) => {
  try {
    const {
      type = 'general',
      name,
      email,
      phone,
      company,
      productId,
      productName,
      message,
      details
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const id = 'ENQ-' + Math.floor(100000 + Math.random() * 900000);

    db.prepare(`
      INSERT INTO enquiries (id, type, name, email, phone, company, product_id, product_name, message, details, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', datetime('now'))
    `).run(
      id,
      type,
      name.trim(),
      email.toLowerCase().trim(),
      phone || '',
      company || '',
      productId || null,
      productName || null,
      message || '',
      JSON.stringify(details || {})
    );

    res.status(201).json({
      message: 'Thank you. Your inquiry has been logged. An application engineer will contact you shortly.',
      enquiryId: id
    });
  } catch (error) {
    console.error('Enquiry submission error:', error);
    res.status(500).json({ error: 'Failed to submit enquiry.' });
  }
});

// 2. Admin: Get All Enquiries
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, type } = req.query;
    let conditions = ['1=1'];
    let params = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (type && type !== 'all') {
      conditions.push('type = ?');
      params.push(type);
    }

    const whereClause = conditions.join(' AND ');
    const rows = db.prepare(`SELECT * FROM enquiries WHERE ${whereClause} ORDER BY created_at DESC`).all(...params);

    res.json(rows.map(formatEnquiry));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enquiries.' });
  }
});

// 3. Admin: Update Status & Internal Notes
router.put('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNotes } = req.body;

    db.prepare(`
      UPDATE enquiries SET
        status = COALESCE(?, status),
        internal_notes = COALESCE(?, internal_notes)
      WHERE id = ?
    `).run(status || null, internalNotes !== undefined ? internalNotes : null, id);

    const updated = db.prepare(`SELECT * FROM enquiries WHERE id = ?`).get(id);
    res.json({ message: 'Enquiry updated.', enquiry: formatEnquiry(updated) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update enquiry.' });
  }
});

// 4. Admin: Export Enquiries as CSV
router.get('/admin/export', authenticateToken, requireAdmin, (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM enquiries ORDER BY created_at DESC`).all();
    const headers = ['ID', 'Type', 'Name', 'Email', 'Phone', 'Company', 'Product', 'Status', 'Date', 'Message'];
    const csvRows = [headers.join(',')];

    for (const r of rows) {
      const line = [
        `"${r.id}"`,
        `"${r.type}"`,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${r.email}"`,
        `"${r.phone || ''}"`,
        `"${(r.company || '').replace(/"/g, '""')}"`,
        `"${(r.product_name || '').replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${r.created_at}"`,
        `"${(r.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ];
      csvRows.push(line.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="forge3d-enquiries.csv"');
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({ error: 'Failed to export enquiries.' });
  }
});

export default router;
