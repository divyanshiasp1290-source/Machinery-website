import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import { initDb } from './db/index.js';
import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/adminAuth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import brandRoutes from './routes/brands.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import orderRoutes from './routes/orders.js';
import blogRoutes from './routes/blogs.js';
import reviewRoutes from './routes/reviews.js';
import enquiryRoutes from './routes/enquiries.js';
import couponRoutes from './routes/coupons.js';
import newsletterRoutes from './routes/newsletter.js';
import settingsRoutes from './routes/settings.js';
import adminDashboardRoutes from './routes/adminDashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database and seed initial data
initDb();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
const UPLOAD_DIR = path.resolve(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOAD_DIR));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Forge 3D Additive Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth/customer', authRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`[FORGE 3D API] Server listening on http://localhost:${PORT}`);
});

export default app;
