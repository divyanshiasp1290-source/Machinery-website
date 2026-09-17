import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function getFormattedCart(userId) {
  const rows = db.prepare(`
    SELECT c.id as cart_item_id, c.quantity, p.*
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.created_at ASC
  `).all(userId);

  return rows.map(r => ({
    id: r.id,
    cartItemId: r.cart_item_id,
    name: r.name,
    brand: r.brand,
    category: r.category_id,
    categoryName: r.category_name,
    price: r.price,
    salePrice: r.sale_price,
    quoteOnly: Boolean(r.quote_only),
    currency: r.currency,
    inStock: Boolean(r.in_stock),
    images: typeof r.images === 'string' ? JSON.parse(r.images) : [],
    image: (typeof r.images === 'string' ? JSON.parse(r.images)[0] : '') || '',
    shortSpecs: typeof r.short_specs === 'string' ? JSON.parse(r.short_specs) : {},
    sku: r.sku,
    quantity: r.quantity
  }));
}

// 1. Get Cart Items
router.get('/', authenticateToken, (req, res) => {
  try {
    const items = getFormattedCart(req.user.id);
    res.json(items);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cart.' });
  }
});

// 2. Add or Increment Item in Cart
router.post('/', authenticateToken, (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const product = db.prepare(`SELECT id FROM products WHERE id = ?`).get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const existing = db.prepare(`SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?`).get(req.user.id, productId);
    if (existing) {
      db.prepare(`UPDATE cart_items SET quantity = quantity + ?, updated_at = datetime('now') WHERE id = ?`).run(quantity, existing.id);
    } else {
      const id = 'ci_' + crypto.randomUUID();
      db.prepare(`INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)`).run(id, req.user.id, productId, quantity);
    }

    const items = getFormattedCart(req.user.id);
    res.json(items);
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
});

// 3. Update Item Quantity
router.put('/:productId', authenticateToken, (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      db.prepare(`DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`).run(req.user.id, productId);
    } else {
      db.prepare(`UPDATE cart_items SET quantity = ?, updated_at = datetime('now') WHERE user_id = ? AND product_id = ?`).run(quantity, req.user.id, productId);
    }

    const items = getFormattedCart(req.user.id);
    res.json(items);
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ error: 'Failed to update item quantity.' });
  }
});

// 4. Remove Item from Cart
router.delete('/:productId', authenticateToken, (req, res) => {
  try {
    db.prepare(`DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`).run(req.user.id, req.params.productId);
    const items = getFormattedCart(req.user.id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item.' });
  }
});

// 5. Clear Entire Cart
router.delete('/', authenticateToken, (req, res) => {
  try {
    db.prepare(`DELETE FROM cart_items WHERE user_id = ?`).run(req.user.id);
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
});

// 6. Merge Guest Cart on Customer Login
router.post('/merge', authenticateToken, (req, res) => {
  try {
    const { guestItems } = req.body; // array of { id / productId, quantity }
    if (Array.isArray(guestItems)) {
      for (const item of guestItems) {
        const pId = item.id || item.productId;
        const qty = item.quantity || 1;
        if (!pId) continue;

        const product = db.prepare(`SELECT id FROM products WHERE id = ?`).get(pId);
        if (!product) continue;

        const existing = db.prepare(`SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?`).get(req.user.id, pId);
        if (existing) {
          db.prepare(`UPDATE cart_items SET quantity = quantity + ?, updated_at = datetime('now') WHERE id = ?`).run(qty, existing.id);
        } else {
          db.prepare(`INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)`).run('ci_' + crypto.randomUUID(), req.user.id, pId, qty);
        }
      }
    }

    const items = getFormattedCart(req.user.id);
    res.json(items);
  } catch (error) {
    console.error('Cart merge error:', error);
    res.status(500).json({ error: 'Failed to merge cart.' });
  }
});

export default router;
