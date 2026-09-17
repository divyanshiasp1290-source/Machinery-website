import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function getWishlistIds(userId) {
  const rows = db.prepare(`SELECT product_id FROM wishlist_items WHERE user_id = ?`).all(userId);
  return rows.map(r => r.product_id);
}

// 1. Get Wishlist Product IDs
router.get('/', authenticateToken, (req, res) => {
  try {
    const productIds = getWishlistIds(req.user.id);
    res.json(productIds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist.' });
  }
});

// 2. Toggle Item in Wishlist
router.post('/toggle', authenticateToken, (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const existing = db.prepare(`SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?`).get(req.user.id, productId);
    if (existing) {
      db.prepare(`DELETE FROM wishlist_items WHERE id = ?`).run(existing.id);
    } else {
      const id = 'wl_' + crypto.randomUUID();
      db.prepare(`INSERT INTO wishlist_items (id, user_id, product_id) VALUES (?, ?, ?)`).run(id, req.user.id, productId);
    }

    const productIds = getWishlistIds(req.user.id);
    res.json(productIds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle wishlist item.' });
  }
});

// 3. Merge Guest Wishlist on Login
router.post('/merge', authenticateToken, (req, res) => {
  try {
    const { guestWishlist } = req.body; // array of product IDs
    if (Array.isArray(guestWishlist)) {
      for (const pId of guestWishlist) {
        if (!pId) continue;
        const exists = db.prepare(`SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?`).get(req.user.id, pId);
        if (!exists) {
          db.prepare(`INSERT INTO wishlist_items (id, user_id, product_id) VALUES (?, ?, ?)`).run('wl_' + crypto.randomUUID(), req.user.id, pId);
        }
      }
    }

    const productIds = getWishlistIds(req.user.id);
    res.json(productIds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to merge wishlist.' });
  }
});

export default router;
