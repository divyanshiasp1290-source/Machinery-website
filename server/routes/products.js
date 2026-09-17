import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

function formatProduct(p) {
  if (!p) return null;
  return {
    ...p,
    inStock: Boolean(p.in_stock),
    quoteOnly: Boolean(p.quote_only),
    isFeatured: Boolean(p.is_featured),
    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
    shortSpecs: typeof p.short_specs === 'string' ? JSON.parse(p.short_specs) : (p.short_specs || {}),
    keyFeatures: typeof p.key_features === 'string' ? JSON.parse(p.key_features) : (p.key_features || []),
    techSpecs: typeof p.tech_specs === 'string' ? JSON.parse(p.tech_specs) : (p.tech_specs || {}),
    suitableMaterials: typeof p.suitable_materials === 'string' ? JSON.parse(p.suitable_materials) : (p.suitable_materials || []),
    relatedProductIds: typeof p.related_product_ids === 'string' ? JSON.parse(p.related_product_ids) : (p.related_product_ids || []),
    categoryName: p.category_name,
    stockQuantity: p.stock_quantity,
    leadTime: p.lead_time,
    reviewsCount: p.reviews_count,
    metaTitle: p.meta_title,
    metaDescription: p.meta_description
  };
}

// 1. Get Products with Advanced Filtering, Search, Sorting, and Pagination
router.get('/', (req, res) => {
  try {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      inStock,
      featured,
      sort,
      page = 1,
      limit = 50
    } = req.query;

    let conditions = ['1=1'];
    let params = [];

    if (category && category !== 'all' && category !== 'All') {
      conditions.push('category_id = ?');
      params.push(category);
    }

    if (brand && brand !== 'all' && brand !== 'All') {
      conditions.push('LOWER(brand) = LOWER(?)');
      params.push(brand);
    }

    if (search && search.trim()) {
      conditions.push('(LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category_name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(sku) LIKE ?)');
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term, term, term);
    }

    if (minPrice !== undefined && minPrice !== '') {
      conditions.push('price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      conditions.push('price <= ?');
      params.push(parseFloat(maxPrice));
    }

    if (inStock === 'true' || inStock === '1') {
      conditions.push('in_stock = 1');
    }

    if (featured === 'true' || featured === '1') {
      conditions.push('is_featured = 1');
    }

    let orderBy = 'created_at DESC';
    if (sort === 'price-asc') orderBy = 'price ASC';
    else if (sort === 'price-desc') orderBy = 'price DESC';
    else if (sort === 'rating') orderBy = 'rating DESC';
    else if (sort === 'name-asc') orderBy = 'name ASC';
    else if (sort === 'name-desc') orderBy = 'name DESC';

    const whereClause = conditions.join(' AND ');

    // Total Count
    const countSql = `SELECT COUNT(*) as total FROM products WHERE ${whereClause}`;
    const total = db.prepare(countSql).get(...params).total;

    // Items
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sql = `SELECT * FROM products WHERE ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const rows = db.prepare(sql).all(...params, parseInt(limit), offset);

    res.json({
      products: rows.map(formatProduct),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// 2. Get Single Product by ID or Slug
router.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product = db.prepare(`SELECT * FROM products WHERE id = ? OR slug = ?`).get(idOrSlug, idOrSlug);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const formatted = formatProduct(product);

    // Fetch related products (explicit related IDs or fallback category/brand)
    let related = [];
    if (formatted.relatedProductIds && formatted.relatedProductIds.length > 0) {
      const placeholders = formatted.relatedProductIds.map(() => '?').join(',');
      const rows = db.prepare(`SELECT * FROM products WHERE id IN (${placeholders}) LIMIT 4`).all(...formatted.relatedProductIds);
      related = rows.map(formatProduct);
    }

    if (related.length < 4) {
      const fallbackRows = db.prepare(`
        SELECT * FROM products 
        WHERE id != ? AND (category_id = ? OR brand = ?)
        ORDER BY is_featured DESC, rating DESC 
        LIMIT ?
      `).all(formatted.id, formatted.category_id, formatted.brand, 4 - related.length);

      related = [...related, ...fallbackRows.map(formatProduct)];
    }

    // Live reviews stats
    const reviewStats = db.prepare(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating 
      FROM reviews 
      WHERE product_id = ? AND status = 'approved'
    `).get(formatted.id);

    if (reviewStats && reviewStats.count > 0) {
      formatted.reviewsCount = reviewStats.count;
      formatted.rating = parseFloat(reviewStats.avg_rating.toFixed(1));
    }

    res.json({
      product: formatted,
      relatedProducts: related
    });
  } catch (error) {
    console.error('Product detail fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch product details.' });
  }
});

// 3. Admin: Upload Product Images
router.post('/upload-images', authenticateToken, requireAdmin, upload.array('images', 8), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded.' });
    }

    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload images.' });
  }
});

// 4. Admin: Add New Product
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      name,
      brand,
      categoryId,
      categoryName,
      technology,
      price,
      salePrice,
      quoteOnly,
      currency = '£',
      availability,
      inStock,
      stockQuantity = 10,
      leadTime,
      sku,
      images,
      shortSpecs,
      description,
      keyFeatures,
      techSpecs,
      suitableMaterials,
      warranty,
      isFeatured,
      badge,
      metaTitle,
      metaDescription,
      relatedProductIds
    } = req.body;

    if (!name || !brand || !categoryId) {
      return res.status(400).json({ error: 'Product name, brand, and category are required.' });
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    const finalSku = sku || 'F3D-' + Math.floor(10000 + Math.random() * 90000);

    db.prepare(`
      INSERT INTO products (
        id, name, slug, brand, category_id, category_name, technology, price, sale_price,
        quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
        rating, reviews_count, images, short_specs, description, key_features, tech_specs,
        suitable_materials, warranty, is_featured, badge, meta_title, meta_description,
        related_product_ids, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        5.0, 0, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, datetime('now'), datetime('now')
      )
    `).run(
      id,
      name.trim(),
      id,
      brand.trim(),
      categoryId,
      categoryName || categoryId,
      technology || '',
      parseFloat(price) || 0,
      salePrice ? parseFloat(salePrice) : null,
      quoteOnly ? 1 : 0,
      currency,
      availability || 'In Stock',
      inStock !== false ? 1 : 0,
      parseInt(stockQuantity) || 0,
      leadTime || '1-3 Business Days',
      finalSku,
      JSON.stringify(images || []),
      JSON.stringify(shortSpecs || {}),
      description || '',
      JSON.stringify(keyFeatures || []),
      JSON.stringify(techSpecs || {}),
      JSON.stringify(suitableMaterials || []),
      warranty || '12 Months Manufacturer Warranty',
      isFeatured ? 1 : 0,
      badge || '',
      metaTitle || name,
      metaDescription || description?.slice(0, 160) || '',
      JSON.stringify(relatedProductIds || [])
    );

    const created = db.prepare(`SELECT * FROM products WHERE id = ?`).get(id);
    res.status(201).json({
      message: 'Product created successfully.',
      product: formatProduct(created)
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Failed to create product: ' + error.message });
  }
});

// 5. Admin: Update Product
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare(`SELECT * FROM products WHERE id = ?`).get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const {
      name,
      brand,
      categoryId,
      categoryName,
      technology,
      price,
      salePrice,
      quoteOnly,
      currency,
      availability,
      inStock,
      stockQuantity,
      leadTime,
      sku,
      images,
      shortSpecs,
      description,
      keyFeatures,
      techSpecs,
      suitableMaterials,
      warranty,
      isFeatured,
      badge,
      metaTitle,
      metaDescription,
      relatedProductIds
    } = req.body;

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        brand = COALESCE(?, brand),
        category_id = COALESCE(?, category_id),
        category_name = COALESCE(?, category_name),
        technology = COALESCE(?, technology),
        price = COALESCE(?, price),
        sale_price = ?,
        quote_only = COALESCE(?, quote_only),
        currency = COALESCE(?, currency),
        availability = COALESCE(?, availability),
        in_stock = COALESCE(?, in_stock),
        stock_quantity = COALESCE(?, stock_quantity),
        lead_time = COALESCE(?, lead_time),
        sku = COALESCE(?, sku),
        images = COALESCE(?, images),
        short_specs = COALESCE(?, short_specs),
        description = COALESCE(?, description),
        key_features = COALESCE(?, key_features),
        tech_specs = COALESCE(?, tech_specs),
        suitable_materials = COALESCE(?, suitable_materials),
        warranty = COALESCE(?, warranty),
        is_featured = COALESCE(?, is_featured),
        badge = COALESCE(?, badge),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        related_product_ids = COALESCE(?, related_product_ids),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name !== undefined ? name.trim() : null,
      brand !== undefined ? brand.trim() : null,
      categoryId || null,
      categoryName || null,
      technology !== undefined ? technology : null,
      price !== undefined ? parseFloat(price) : null,
      salePrice !== undefined ? (salePrice ? parseFloat(salePrice) : null) : existing.sale_price,
      quoteOnly !== undefined ? (quoteOnly ? 1 : 0) : null,
      currency || null,
      availability || null,
      inStock !== undefined ? (inStock ? 1 : 0) : null,
      stockQuantity !== undefined ? parseInt(stockQuantity) : null,
      leadTime || null,
      sku || null,
      images !== undefined ? JSON.stringify(images) : null,
      shortSpecs !== undefined ? JSON.stringify(shortSpecs) : null,
      description !== undefined ? description : null,
      keyFeatures !== undefined ? JSON.stringify(keyFeatures) : null,
      techSpecs !== undefined ? JSON.stringify(techSpecs) : null,
      suitableMaterials !== undefined ? JSON.stringify(suitableMaterials) : null,
      warranty || null,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
      badge !== undefined ? badge : null,
      metaTitle !== undefined ? metaTitle : null,
      metaDescription !== undefined ? metaDescription : null,
      relatedProductIds !== undefined ? JSON.stringify(relatedProductIds) : null,
      id
    );

    const updated = db.prepare(`SELECT * FROM products WHERE id = ?`).get(id);
    res.json({
      message: 'Product updated successfully.',
      product: formatProduct(updated)
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ error: 'Failed to update product: ' + error.message });
  }
});

// 6. Admin: Delete Product
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Product delete error:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

export default router;
