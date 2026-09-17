import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'forge3d-additive-enterprise-secret-key-2026';

export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    // Verify user exists and is active in database
    const user = db.prepare(`SELECT id, email, first_name, last_name, company, phone, role, is_active FROM users WHERE id = ?`).get(decoded.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'User account not found or suspended.' });
    }

    req.user = user;
    next();
  });
}

export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const user = db.prepare(`SELECT id, email, first_name, last_name, company, phone, role, is_active FROM users WHERE id = ?`).get(decoded.id);
      if (user && user.is_active) {
        req.user = user;
      }
    }
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const allowedRoles = ['super_admin', 'admin', 'manager', 'editor'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Access denied. Customers and unauthorized users cannot access admin resources.' 
    });
  }

  next();
}

export function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin privileges required.' });
  }
  next();
}
