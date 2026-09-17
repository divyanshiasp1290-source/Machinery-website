import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get Aggregated Dashboard Statistics
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    // 1. Sales & Orders
    const salesRow = db.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total ELSE 0 END), 0) as total_revenue,
        SUM(CASE WHEN status IN ('Pending', 'Processing') THEN 1 ELSE 0 END) as pending_orders
      FROM orders
    `).get();

    // 2. Customers
    const customersCount = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`).get().count;

    // 3. Products
    const productsCount = db.prepare(`SELECT COUNT(*) as count FROM products`).get().count;
    const lowStockProducts = db.prepare(`
      SELECT id, name, brand, sku, stock_quantity, in_stock, price 
      FROM products 
      WHERE in_stock = 0 OR stock_quantity <= 3 
      LIMIT 8
    `).all();

    // 4. Pending Reviews
    const pendingReviewsCount = db.prepare(`SELECT COUNT(*) as count FROM reviews WHERE status = 'pending'`).get().count;

    // 5. Recent Orders
    const recentOrders = db.prepare(`
      SELECT id, customer_name, customer_email, total, currency, status, payment_status, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    // 6. Recent Enquiries
    const recentEnquiries = db.prepare(`
      SELECT id, type, name, email, company, product_name, status, created_at 
      FROM enquiries 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    // 7. Customers list for customer management tab
    const customersList = db.prepare(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.company, u.phone, u.created_at,
             COUNT(o.id) as order_count,
             COALESCE(SUM(o.total), 0) as total_spend
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'Cancelled'
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 50
    `).all();

    res.json({
      totalRevenue: salesRow.total_revenue,
      totalOrders: salesRow.total_orders,
      pendingOrders: salesRow.pending_orders,
      totalCustomers: customersCount,
      totalProducts: productsCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      pendingReviewsCount,
      recentOrders,
      recentEnquiries,
      customersList
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
});

export default router;
