import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin, requireSuperAdmin, generateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. Separate Admin Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required.' });
    }

    const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase().trim());
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    // Strictly enforce role check: Customers cannot authenticate here!
    const allowedRoles = ['super_admin', 'admin', 'manager', 'editor'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Customer accounts cannot access the administrative portal.' 
      });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const adminUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      company: user.company,
      role: user.role
    };

    const token = generateToken(adminUser, '24h');

    res.json({
      message: 'Admin authentication successful.',
      token,
      admin: adminUser
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Failed to process admin authentication.' });
  }
});

// 2. Current Admin Session Verification
router.get('/me', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    admin: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      company: req.user.company,
      role: req.user.role
    }
  });
});

// 3. List All Admin Staff (Super Admin only)
router.get('/users', authenticateToken, requireSuperAdmin, (req, res) => {
  try {
    const admins = db.prepare(`
      SELECT id, email, first_name, last_name, role, is_active, created_at 
      FROM users 
      WHERE role IN ('super_admin', 'admin', 'manager', 'editor')
      ORDER BY created_at DESC
    `).all();

    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin users.' });
  }
});

// 4. Create New Admin Staff (Super Admin only)
router.post('/users', authenticateToken, requireSuperAdmin, (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const validRoles = ['admin', 'manager', 'editor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid admin role.' });
    }

    const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const adminId = 'adm_' + crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, company, role, is_active)
      VALUES (?, ?, ?, ?, ?, 'Forge 3D Systems UK', ?, 1)
    `).run(adminId, email.toLowerCase().trim(), passwordHash, firstName.trim(), lastName.trim(), role);

    res.status(201).json({
      message: 'Admin user created successfully.',
      admin: {
        id: adminId,
        email: email.toLowerCase().trim(),
        firstName,
        lastName,
        role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin user.' });
  }
});

// 5. Delete Admin User (Super Admin only)
router.delete('/users/:id', authenticateToken, requireSuperAdmin, (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own super admin account.' });
    }

    db.prepare(`DELETE FROM users WHERE id = ? AND role != 'super_admin'`).run(req.params.id);
    res.json({ message: 'Admin user removed.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete admin user.' });
  }
});

export default router;
