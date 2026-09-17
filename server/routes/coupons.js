import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function formatCoupon(c) {
  return {
    id: c.id,
    code: c.code,
    discountType: c.discount_type,
    discountValue: c.discount_value,
    minOrderAmount: c.min_order_amount,
    maxUses: c.max_uses,
    usesCount: c.uses_count,
    validFrom: c.valid_from,
    validUntil: c.valid_until,
    isActive: Boolean(c.is_active),
    createdAt: c.created_at
  };
}

// 1. Validate Coupon Code (Public Checkout Flow)
router.post('/validate', (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Coupon code is required.' });
    }

    const coupon = db.prepare(`
      SELECT * FROM coupons 
      WHERE UPPER(code) = ? AND is_active = 1
    `).get(code.trim().toUpperCase());

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or inactive promotional code.' });
    }

    // Expiry check
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({ error: 'This promotional code has expired.' });
    }

    // Usage limit check
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return res.status(400).json({ error: 'This promotional code has reached its maximum usage limit.' });
    }

    // Min order amount check
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return res.status(400).json({ 
        error: `A minimum order value of £${coupon.min_order_amount.toLocaleString()} is required to apply code ${coupon.code}.` 
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
    } else {
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount,
      message: `Coupon ${coupon.code} applied! Saving £${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate coupon.' });
  }
});

// 2. Admin: List All Coupons
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM coupons ORDER BY created_at DESC`).all();
    res.json(rows.map(formatCoupon));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
});

// 3. Admin: Create Coupon
router.post('/admin', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, validUntil, isActive } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Code, discount type, and discount value are required.' });
    }

    const id = 'cpn_' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_uses, valid_until, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      code.trim().toUpperCase(),
      discountType,
      parseFloat(discountValue),
      minOrderAmount ? parseFloat(minOrderAmount) : 0,
      maxUses ? parseInt(maxUses) : null,
      validUntil || null,
      isActive !== false ? 1 : 0
    );

    const created = db.prepare(`SELECT * FROM coupons WHERE id = ?`).get(id);
    res.status(201).json({ message: 'Coupon created.', coupon: formatCoupon(created) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coupon: ' + error.message });
  }
});

// 4. Admin: Update Coupon
router.put('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, minOrderAmount, maxUses, validUntil, isActive } = req.body;

    db.prepare(`
      UPDATE coupons SET
        code = COALESCE(?, code),
        discount_type = COALESCE(?, discount_type),
        discount_value = COALESCE(?, discount_value),
        min_order_amount = COALESCE(?, min_order_amount),
        max_uses = ?,
        valid_until = ?,
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      code ? code.trim().toUpperCase() : null,
      discountType || null,
      discountValue !== undefined ? parseFloat(discountValue) : null,
      minOrderAmount !== undefined ? parseFloat(minOrderAmount) : null,
      maxUses !== undefined ? (maxUses ? parseInt(maxUses) : null) : null,
      validUntil !== undefined ? (validUntil || null) : null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      id
    );

    const updated = db.prepare(`SELECT * FROM coupons WHERE id = ?`).get(id);
    res.json({ message: 'Coupon updated.', coupon: formatCoupon(updated) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coupon.' });
  }
});

// 5. Admin: Delete Coupon
router.delete('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare(`DELETE FROM coupons WHERE id = ?`).run(req.params.id);
    res.json({ message: 'Coupon deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon.' });
  }
});

export default router;
