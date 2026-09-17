import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function updateProductReviewAggregates(productId) {
  const stats = db.prepare(`
    SELECT COUNT(*) as count, AVG(rating) as avg_rating 
    FROM reviews 
    WHERE product_id = ? AND status = 'approved'
  `).get(productId);

  const count = stats?.count || 0;
  const rating = stats?.avg_rating ? parseFloat(stats.avg_rating.toFixed(1)) : 5.0;

  db.prepare(`UPDATE products SET reviews_count = ?, rating = ? WHERE id = ?`).run(count, rating, productId);
}

// 1. Get Approved Reviews for a Product
router.get('/', (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const rows = db.prepare(`
      SELECT id, product_id, user_name, user_company, rating, title, comment, created_at
      FROM reviews
      WHERE product_id = ? AND status = 'approved'
      ORDER BY created_at DESC
    `).all(productId);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// 2. Submit Review (Authenticated Customer Only)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating (1-5), and written comment are required.' });
    }

    const numRating = parseInt(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const id = 'rev_' + crypto.randomUUID();
    const userName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Verified Customer';

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, user_name, user_company, rating, title, comment, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(id, productId, req.user.id, userName, req.user.company || '', numRating, title || '', comment);

    res.status(201).json({
      message: 'Review submitted successfully. It will appear on the product page once verified by our moderation team.',
      reviewId: id
    });
  } catch (error) {
    console.error('Review submit error:', error);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// 3. Admin: Get All Reviews with Filters
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT r.*, p.name as product_name, p.brand as product_brand
      FROM reviews r
      JOIN products p ON r.product_id = p.id
    `;
    let params = [];

    if (status && status !== 'all') {
      sql += ` WHERE r.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY r.created_at DESC`;
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// 4. Admin: Moderate Review (Approve / Reject / Edit)
router.put('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, comment, rating } = req.body;

    const existing = db.prepare(`SELECT * FROM reviews WHERE id = ?`).get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    db.prepare(`
      UPDATE reviews SET
        status = COALESCE(?, status),
        title = COALESCE(?, title),
        comment = COALESCE(?, comment),
        rating = COALESCE(?, rating)
      WHERE id = ?
    `).run(status || null, title || null, comment || null, rating || null, id);

    updateProductReviewAggregates(existing.product_id);

    const updated = db.prepare(`SELECT * FROM reviews WHERE id = ?`).get(id);
    res.json({ message: 'Review moderated successfully.', review: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to moderate review.' });
  }
});

// 5. Admin: Delete Review
router.delete('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const review = db.prepare(`SELECT product_id FROM reviews WHERE id = ?`).get(req.params.id);
    if (review) {
      db.prepare(`DELETE FROM reviews WHERE id = ?`).run(req.params.id);
      updateProductReviewAggregates(review.product_id);
    }
    res.json({ message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review.' });
  }
});

export default router;
