import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function formatBlog(b) {
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    category: b.category,
    tag: b.tag,
    date: b.date,
    readTime: b.read_time,
    author: b.author,
    authorRole: b.author_role,
    image: b.image,
    summary: b.summary,
    content: b.content,
    status: b.status,
    scheduledAt: b.scheduled_at,
    isFeatured: Boolean(b.is_featured),
    metaTitle: b.meta_title,
    metaDescription: b.meta_description,
    createdAt: b.created_at,
    updatedAt: b.updated_at
  };
}

// 1. Get Published Blogs for Frontend
router.get('/', (req, res) => {
  try {
    const { category, search, tag } = req.query;
    let conditions = ["status = 'published'"];
    let params = [];

    if (category && category !== 'All' && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (tag) {
      conditions.push('tag = ?');
      params.push(tag);
    }

    if (search && search.trim()) {
      conditions.push('(LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(content) LIKE ?)');
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.join(' AND ');
    const rows = db.prepare(`SELECT * FROM blogs WHERE ${whereClause} ORDER BY is_featured DESC, created_at DESC`).all(...params);

    res.json(rows.map(formatBlog));
  } catch (error) {
    console.error('Blogs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs.' });
  }
});

// 2. Get Single Blog by Slug or ID
router.get('/:slugOrId', (req, res) => {
  try {
    const { slugOrId } = req.params;
    const blog = db.prepare(`SELECT * FROM blogs WHERE slug = ? OR id = ?`).get(slugOrId, slugOrId);

    if (!blog) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Related articles
    const related = db.prepare(`
      SELECT * FROM blogs 
      WHERE id != ? AND status = 'published' AND category = ?
      ORDER BY created_at DESC LIMIT 3
    `).all(blog.id, blog.category);

    res.json({
      article: formatBlog(blog),
      relatedArticles: related.map(formatBlog)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article.' });
  }
});

// 3. Admin: Get All Blogs (including drafts)
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM blogs ORDER BY created_at DESC`).all();
    res.json(rows.map(formatBlog));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs.' });
  }
});

// 4. Admin: Create Blog Article
router.post('/admin', authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      tag,
      author,
      authorRole,
      image,
      summary,
      content,
      status = 'published',
      scheduledAt,
      isFeatured,
      metaTitle,
      metaDescription
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const id = 'blog-' + crypto.randomUUID();
    const finalSlug = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const wordCount = (content || '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

    db.prepare(`
      INSERT INTO blogs (
        id, slug, title, category, tag, date, read_time, author, author_role,
        image, summary, content, status, scheduled_at, is_featured, meta_title,
        meta_description, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, datetime('now'), datetime('now')
      )
    `).run(
      id,
      finalSlug,
      title.trim(),
      category || 'Additive Engineering',
      tag || '',
      formattedDate,
      readTime,
      author || req.user.first_name + ' ' + req.user.last_name,
      authorRole || 'Applications Specialist',
      image || '',
      summary || '',
      content,
      status,
      scheduledAt || null,
      isFeatured ? 1 : 0,
      metaTitle || title,
      metaDescription || summary || ''
    );

    const created = db.prepare(`SELECT * FROM blogs WHERE id = ?`).get(id);
    res.status(201).json({ message: 'Blog article created.', article: formatBlog(created) });
  } catch (error) {
    console.error('Blog creation error:', error);
    res.status(500).json({ error: 'Failed to create article: ' + error.message });
  }
});

// 5. Admin: Update Blog Article
router.put('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      category,
      tag,
      author,
      authorRole,
      image,
      summary,
      content,
      status,
      scheduledAt,
      isFeatured,
      metaTitle,
      metaDescription
    } = req.body;

    db.prepare(`
      UPDATE blogs SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        category = COALESCE(?, category),
        tag = COALESCE(?, tag),
        author = COALESCE(?, author),
        author_role = COALESCE(?, author_role),
        image = COALESCE(?, image),
        summary = COALESCE(?, summary),
        content = COALESCE(?, content),
        status = COALESCE(?, status),
        scheduled_at = ?,
        is_featured = COALESCE(?, is_featured),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title ? title.trim() : null,
      slug ? slug.trim() : null,
      category || null,
      tag !== undefined ? tag : null,
      author || null,
      authorRole || null,
      image !== undefined ? image : null,
      summary !== undefined ? summary : null,
      content !== undefined ? content : null,
      status || null,
      scheduledAt || null,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
      metaTitle || null,
      metaDescription || null,
      id
    );

    const updated = db.prepare(`SELECT * FROM blogs WHERE id = ?`).get(id);
    res.json({ message: 'Blog article updated.', article: formatBlog(updated) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article.' });
  }
});

// 6. Admin: Delete Blog Article
router.delete('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare(`DELETE FROM blogs WHERE id = ?`).run(req.params.id);
    res.json({ message: 'Blog article deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});

export default router;
