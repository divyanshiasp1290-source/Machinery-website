import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function formatCategory(c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    badge: c.badge,
    image: c.image,
    count: c.product_count !== undefined ? c.product_count : (c.count || 0),
    popularBrands: typeof c.popular_brands === 'string' ? JSON.parse(c.popular_brands) : (c.popular_brands || []),
    parentId: c.parent_id,
    displayOrder: c.display_order
  };
}

// 1. Get All Categories with dynamic product count
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `).all();

    res.json(rows.map(formatCategory));
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// 2. Admin: Add Category
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, slug, description, badge, image, popularBrands, displayOrder } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const id = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    db.prepare(`
      INSERT INTO categories (id, name, slug, description, badge, image, popular_brands, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      slug || id,
      description || '',
      badge || '',
      image || '',
      JSON.stringify(popularBrands || []),
      parseInt(displayOrder) || 0
    );

    const created = db.prepare(`SELECT * FROM categories WHERE id = ?`).get(id);
    res.status(201).json({ message: 'Category created.', category: formatCategory(created) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category: ' + error.message });
  }
});

// 3. Admin: Update Category
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, badge, image, popularBrands, displayOrder } = req.body;

    db.prepare(`
      UPDATE categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        badge = COALESCE(?, badge),
        image = COALESCE(?, image),
        popular_brands = COALESCE(?, popular_brands),
        display_order = COALESCE(?, display_order)
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      slug ? slug.trim() : null,
      description !== undefined ? description : null,
      badge !== undefined ? badge : null,
      image !== undefined ? image : null,
      popularBrands ? JSON.stringify(popularBrands) : null,
      displayOrder !== undefined ? parseInt(displayOrder) : null,
      id
    );

    const updated = db.prepare(`SELECT * FROM categories WHERE id = ?`).get(id);
    res.json({ message: 'Category updated.', category: formatCategory(updated) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

// 4. Admin: Delete Category
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare(`DELETE FROM categories WHERE id = ?`).run(req.params.id);
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

export default router;
