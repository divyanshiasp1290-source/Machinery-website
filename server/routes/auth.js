import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. Customer Registration
router.post('/register', (req, res) => {
  try {
    const { email, password, firstName, lastName, company, phone, address, city, postcode } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check existing email
    const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const userId = 'usr_' + crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, company, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'customer', 1)
    `).run(userId, email.toLowerCase().trim(), passwordHash, firstName.trim(), lastName.trim(), company || '', phone || '');

    // If initial address provided, save it
    if (address && city && postcode) {
      const addrId = 'addr_' + crypto.randomUUID();
      db.prepare(`
        INSERT INTO addresses (id, user_id, type, first_name, last_name, company, address_line1, city, postcode, country, phone, is_default)
        VALUES (?, ?, 'shipping', ?, ?, ?, ?, ?, ?, 'United Kingdom', ?, 1)
      `).run(addrId, userId, firstName, lastName, company || '', address, city, postcode, phone || '');
    }

    const user = {
      id: userId,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company || '',
      phone: phone || '',
      role: 'customer'
    };

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to complete registration.' });
  }
});

// 2. Customer Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase().trim());
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      company: user.company || '',
      phone: user.phone || '',
      role: user.role
    };

    const token = generateToken(userData);

    res.json({
      message: 'Login successful.',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to process login.' });
  }
});

// 3. Get Current Authenticated Profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`SELECT id, email, first_name, last_name, company, phone, role, created_at FROM users WHERE id = ?`).get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const addresses = db.prepare(`SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`).all(req.user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      },
      addresses
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// 4. Update Profile Details
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { firstName, lastName, company, phone } = req.body;

    db.prepare(`
      UPDATE users 
      SET first_name = ?, last_name = ?, company = ?, phone = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(firstName || '', lastName || '', company || '', phone || '', req.user.id);

    const updated = db.prepare(`SELECT id, email, first_name, last_name, company, phone, role FROM users WHERE id = ?`).get(req.user.id);

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.first_name,
        lastName: updated.last_name,
        company: updated.company,
        phone: updated.phone,
        role: updated.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// 5. Change Password
router.put('/password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = db.prepare(`SELECT password_hash FROM users WHERE id = ?`).get(req.user.id);
    const valid = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(newHash, req.user.id);

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// 6. Forgot Password Request
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = db.prepare(`SELECT id, email FROM users WHERE email = ?`).get(email.toLowerCase().trim());
    if (!user) {
      // Return success message to prevent user enumeration
      return res.json({ 
        message: 'If an account exists with this email, password reset instructions have been generated.',
        demoToken: null 
      });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    db.prepare(`
      INSERT INTO password_resets (id, user_id, token, expires_at, used)
      VALUES (?, ?, ?, ?, 0)
    `).run('rst_' + crypto.randomUUID(), user.id, resetToken, expiresAt);

    res.json({
      message: 'Password reset token generated successfully.',
      // Provided for easy interactive testing
      resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

// 7. Reset Password with Token
router.post('/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const resetRecord = db.prepare(`
      SELECT * FROM password_resets 
      WHERE token = ? AND used = 0 AND datetime(expires_at) > datetime('now')
    `).get(token);

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(newHash, resetRecord.user_id);
    db.prepare(`UPDATE password_resets SET used = 1 WHERE id = ?`).run(resetRecord.id);

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// 8. Saved Addresses Endpoints
router.get('/addresses', authenticateToken, (req, res) => {
  try {
    const addresses = db.prepare(`SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`).all(req.user.id);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses.' });
  }
});

router.post('/addresses', authenticateToken, (req, res) => {
  try {
    const { type, firstName, lastName, company, addressLine1, addressLine2, city, postcode, country, phone, isDefault } = req.body;

    if (!addressLine1 || !city || !postcode) {
      return res.status(400).json({ error: 'Address line, city, and postcode are required.' });
    }

    const addrId = 'addr_' + crypto.randomUUID();

    if (isDefault) {
      db.prepare(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`).run(req.user.id);
    }

    db.prepare(`
      INSERT INTO addresses (id, user_id, type, first_name, last_name, company, address_line1, address_line2, city, postcode, country, phone, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      addrId,
      req.user.id,
      type || 'shipping',
      firstName || req.user.first_name,
      lastName || req.user.last_name,
      company || req.user.company,
      addressLine1,
      addressLine2 || '',
      city,
      postcode,
      country || 'United Kingdom',
      phone || req.user.phone,
      isDefault ? 1 : 0
    );

    const addresses = db.prepare(`SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`).all(req.user.id);
    res.status(201).json({ message: 'Address saved successfully.', addresses });
  } catch (error) {
    console.error('Address creation error:', error);
    res.status(500).json({ error: 'Failed to save address.' });
  }
});

router.delete('/addresses/:id', authenticateToken, (req, res) => {
  try {
    db.prepare(`DELETE FROM addresses WHERE id = ? AND user_id = ?`).run(req.params.id, req.user.id);
    const addresses = db.prepare(`SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`).all(req.user.id);
    res.json({ message: 'Address deleted.', addresses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete address.' });
  }
});

router.put('/addresses/:id/default', authenticateToken, (req, res) => {
  try {
    db.prepare(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`).run(req.user.id);
    db.prepare(`UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?`).run(req.params.id, req.user.id);
    const addresses = db.prepare(`SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`).all(req.user.id);
    res.json({ message: 'Default address updated.', addresses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update default address.' });
  }
});

export default router;
