/**
 * Content Routes
 * Dreams Uncharted Platform
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const contentController = require('../controllers/contentController');

// Get all content (with pagination and filters)
router.get('/', contentController.getAllContent);

// Get published content (for public viewing)
router.get('/published', contentController.getPublishedContent);

// Get content by ID
router.get('/:id', contentController.getContentById);

// Get content by slug
router.get('/slug/:slug', contentController.getContentBySlug);

// Create new content (requires authentication)
router.post('/', auth, contentController.createContent);

// Update content (requires authentication)
router.put('/:id', auth, contentController.updateContent);

// Delete content (requires authentication)
router.delete('/:id', auth, contentController.deleteContent);

// Update content status (publish, unpublish, etc.)
router.patch('/:id/status', auth, contentController.updateContentStatus);

// Get content by series
router.get('/series/:seriesId', contentController.getContentBySeries);

// Get content by author
router.get('/author/:authorId', contentController.getContentByAuthor);

// Increment view count
router.post('/:id/view', contentController.incrementViewCount);

// Like/unlike content
router.post('/:id/like', auth, contentController.toggleLike);

module.exports = router;
