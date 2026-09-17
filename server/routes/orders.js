import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken, optionalAuthenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function formatOrder(o) {
  return {
    id: o.id,
    userId: o.user_id,
    customerEmail: o.customer_email,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    company: o.company,
    shippingAddress: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
    billingAddress: typeof o.billing_address === 'string' ? JSON.parse(o.billing_address) : o.billing_address,
    items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
    subtotal: o.subtotal,
    discountAmount: o.discount_amount,
    couponCode: o.coupon_code,
    shippingFee: o.shipping_fee,
    taxAmount: o.tax_amount,
    total: o.total,
    currency: o.currency,
    status: o.status,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    notes: o.notes,
    createdAt: o.created_at,
    updatedAt: o.updated_at
  };
}

// 1. Create New Order (Server-Side Price Calculation)
router.post('/', optionalAuthenticate, (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      customerPhone,
      company,
      shippingAddress,
      billingAddress,
      cartItems,
      couponCode,
      paymentMethod = 'card',
      poNumber,
      notes
    } = req.body;

    if (!customerEmail || !customerName || !shippingAddress || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Customer details, shipping address, and cart items are required.' });
    }

    // Verify products and calculate prices strictly on the server
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of cartItems) {
      const pId = item.id || item.productId;
      const qty = parseInt(item.quantity) || 1;

      const product = db.prepare(`SELECT * FROM products WHERE id = ?`).get(pId);
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${pId} is no longer available.` });
      }

      const itemPrice = product.sale_price !== null ? product.sale_price : product.price;
      const itemSubtotal = itemPrice * qty;
      subtotal += itemSubtotal;

      const images = typeof product.images === 'string' ? JSON.parse(product.images) : [];
      verifiedItems.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        sku: product.sku,
        price: itemPrice,
        currency: product.currency || '£',
        quantity: qty,
        image: images[0] || product.image || '',
        quoteOnly: Boolean(product.quote_only),
        specs: product.short_specs ? Object.values(typeof product.short_specs === 'string' ? JSON.parse(product.short_specs) : product.short_specs).slice(0, 2).join(' • ') : 'Standard Spec'
      });
    }

    // Coupon discount verification
    let discountAmount = 0;
    let validatedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const code = couponCode.trim().toUpperCase();
      const coupon = db.prepare(`
        SELECT * FROM coupons 
        WHERE code = ? AND is_active = 1
        AND (valid_until IS NULL OR datetime(valid_until) >= datetime('now'))
      `).get(code);

      if (coupon) {
        if (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) {
          if (!coupon.max_uses || coupon.uses_count < coupon.max_uses) {
            if (coupon.discount_type === 'percentage') {
              discountAmount = (subtotal * coupon.discount_value) / 100;
            } else {
              discountAmount = Math.min(coupon.discount_value, subtotal);
            }
            validatedCoupon = coupon;
          }
        }
      }
    }

    const shippingFee = 0; // Free UK freight on enterprise machinery
    const total = Math.max(0, subtotal - discountAmount + shippingFee);

    // Generate unique order reference
    const orderId = 'F3D-ORD-' + Math.floor(100000 + Math.random() * 900000);
    const userId = req.user ? req.user.id : null;

    const initialStatus = paymentMethod === 'invoice' || poNumber ? 'Processing' : 'Confirmed';
    const paymentStatus = paymentMethod === 'invoice' ? 'Pending' : 'Authorized';

    db.prepare(`
      INSERT INTO orders (
        id, user_id, customer_email, customer_name, customer_phone, company,
        shipping_address, billing_address, items, subtotal, discount_amount,
        coupon_code, shipping_fee, tax_amount, total, currency, status,
        payment_method, payment_status, notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, '£', ?,
        ?, ?, ?, datetime('now'), datetime('now')
      )
    `).run(
      orderId,
      userId,
      customerEmail.trim(),
      customerName.trim(),
      customerPhone || '',
      company || '',
      JSON.stringify(shippingAddress),
      JSON.stringify(billingAddress || shippingAddress),
      JSON.stringify(verifiedItems),
      subtotal,
      discountAmount,
      validatedCoupon ? validatedCoupon.code : '',
      shippingFee,
      0,
      total,
      initialStatus,
      paymentMethod,
      paymentStatus,
      poNumber ? `PO Number: ${poNumber}. ${notes || ''}` : (notes || '')
    );

    // Increment coupon usage count if used
    if (validatedCoupon) {
      db.prepare(`UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ?`).run(validatedCoupon.id);
    }

    // Clear customer cart in database if authenticated
    if (userId) {
      db.prepare(`DELETE FROM cart_items WHERE user_id = ?`).run(userId);
    }

    const createdOrder = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId);
    res.status(201).json({
      message: 'Order created successfully.',
      order: formatOrder(createdOrder)
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to place order: ' + error.message });
  }
});

// 2. Get Authenticated Customer's Order History
router.get('/', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? OR customer_email = ?
      ORDER BY created_at DESC
    `).all(req.user.id, req.user.email);

    res.json(rows.map(formatOrder));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer orders.' });
  }
});

// 3. Get Single Order Details by ID (Customer)
router.get('/:id', optionalAuthenticate, (req, res) => {
  try {
    const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Allow if matches user or matches email query
    if (req.user && order.user_id && order.user_id !== req.user.id && req.user.role === 'customer') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(formatOrder(order));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

// 4. Admin: Get All Orders with Filter and Search
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, search, limit = 100, page = 1 } = req.query;

    let conditions = ['1=1'];
    let params = [];

    if (status && status !== 'all' && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      conditions.push('(LOWER(id) LIKE ? OR LOWER(customer_email) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(company) LIKE ?)');
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term, term);
    }

    const whereClause = conditions.join(' AND ');
    const countSql = `SELECT COUNT(*) as total FROM orders WHERE ${whereClause}`;
    const total = db.prepare(countSql).get(...params).total;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sql = `SELECT * FROM orders WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const rows = db.prepare(sql).all(...params, parseInt(limit), offset);

    res.json({
      orders: rows.map(formatOrder),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// 5. Admin: Update Order Status & Notes
router.put('/admin/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const existing = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    db.prepare(`
      UPDATE orders SET
        status = COALESCE(?, status),
        payment_status = COALESCE(?, payment_status),
        notes = COALESCE(?, notes),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(status || null, paymentStatus || null, notes !== undefined ? notes : null, id);

    const updated = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
    res.json({ message: 'Order status updated.', order: formatOrder(updated) });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

export default router;
