import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function formatBrand(b) {
  return {
    id: b.id,
    name: b.name,
    category: b.category,
    origin: b.origin,
    status: b.status,
    tagline: b.tagline,
    logoText: b.logo_text,
    badgeColor: b.badge_color,
    description: b.description,
    features: typeof b.features === 'string' ? JSON.parse(b.features) : (b.features || []),
    website: b.website,
    logoImage: b.logo_image
  };
}

// 1. Get All Brands
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM brands ORDER BY name ASC`).all();
    res.json(rows.map(formatBrand));
  } catch (error) {
    console.error('Brands fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch brands.' });
  }
});

// 2. Admin: Add Brand
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, category, origin, status, tagline, logoText, badgeColor, description, features, website, logoImage } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Brand name is required.' });
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    db.prepare(`
      INSERT INTO brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      category || '',
      origin || '',
      status || '',
      tagline || '',
      logoText || name,
      badgeColor || 'border-brand-500 text-brand-600',
      description || '',
      JSON.stringify(features || []),
      website || '',
      logoImage || ''
    );

    const created = db.prepare(`SELECT * FROM brands WHERE id = ?`).get(id);
    res.status(201).json({ message: 'Brand created.', brand: formatBrand(created) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create brand: ' + error.message });
  }
});

// 3. Admin: Update Brand
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, origin, status, tagline, logoText, badgeColor, description, features, website, logoImage } = req.body;

    db.prepare(`
      UPDATE brands SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        origin = COALESCE(?, origin),
        status = COALESCE(?, status),
        tagline = COALESCE(?, tagline),
        logo_text = COALESCE(?, logo_text),
        badge_color = COALESCE(?, badge_color),
        description = COALESCE(?, description),
        features = COALESCE(?, features),
        website = COALESCE(?, website),
        logo_image = COALESCE(?, logo_image)
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      category !== undefined ? category : null,
      origin !== undefined ? origin : null,
      status !== undefined ? status : null,
      tagline !== undefined ? tagline : null,
      logoText !== undefined ? logoText : null,
      badgeColor !== undefined ? badgeColor : null,
      description !== undefined ? description : null,
      features ? JSON.stringify(features) : null,
      website !== undefined ? website : null,
      logoImage !== undefined ? logoImage : null,
      id
    );

    const updated = db.prepare(`SELECT * FROM brands WHERE id = ?`).get(id);
    res.json({ message: 'Brand updated.', brand: formatBrand(updated) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand.' });
  }
});

// 4. Admin: Delete Brand
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare(`DELETE FROM brands WHERE id = ?`).run(req.params.id);
    res.json({ message: 'Brand deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand.' });
  }
});

export default router;
