/**
 * Content Controller
 * Dreams Uncharted Platform
 */

const Content = require('../models/Content');
const Series = require('../models/Series');
const User = require('../models/User');

/**
 * Get all content with pagination and filters
 */
exports.getAllContent = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            type, 
            status,
            genre,
            author,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        // Build query
        const query = {};
        
        if (type) query.type = type;
        if (status) query.status = status;
        if (genre) query.genre = { $in: [genre] };
        if (author) query.author = author;
        
        // Search in title
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Execute query
        const content = await Content.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('author', 'username displayName avatar')
            .populate('seriesId', 'title slug');
        
        // Get total count
        const totalContent = await Content.countDocuments(query);
        
        res.json({
            success: true,
            data: content,
            pagination: {
                total: totalContent,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalContent / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get published content for public viewing
 */
exports.getPublishedContent = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            type, 
            genre,
            author,
            search,
            sortBy = 'publishedDate',
            sortOrder = 'desc'
        } = req.query;
        
        // Build query (only published content)
        const query = { 
            status: 'published',
            publishedDate: { $lte: new Date() }
        };
        
        if (type) query.type = type;
        if (genre) query.genre = { $in: [genre] };
        if (author) query.author = author;
        
        // Search in title
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Execute query
        const content = await Content.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('author', 'username displayName avatar')
            .populate('seriesId', 'title slug');
        
        // Get total count
        const totalContent = await Content.countDocuments(query);
        
        res.json({
            success: true,
            data: content,
            pagination: {
                total: totalContent,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalContent / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching published content:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get content by ID
 */
exports.getContentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const content = await Content.findById(id)
            .populate('author', 'username displayName avatar bio')
            .populate('seriesId', 'title slug coverImage');
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Error fetching content by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get content by slug
 */
exports.getContentBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const content = await Content.findOne({ slug })
            .populate('author', 'username displayName avatar bio')
            .populate('seriesId', 'title slug coverImage');
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Error fetching content by slug:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Create new content
 */
exports.createContent = async (req, res) => {
    try {
        const { title, type, seriesId, chapterNumber, blocks, tags, genre, rating, featuredImage, status } = req.body;
        
        // Create new content
        const newContent = new Content({
            title,
            type,
            author: req.user.id,
            seriesId,
            chapterNumber,
            blocks,
            tags,
            genre,
            rating,
            featuredImage,
            status: status || 'draft'
        });
        
        // If status is scheduled, set scheduledDate
        if (status === 'scheduled' && req.body.scheduledDate) {
            newContent.scheduledDate = new Date(req.body.scheduledDate);
        }
        
        // Save content
        await newContent.save();
        
        // If content is part of a series, update series stats
        if (seriesId) {
            await Series.findByIdAndUpdate(seriesId, {
                $inc: { 'stats.chaptersCount': 1 }
            });
        }
        
        // Update user content count
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.contentCount': 1 }
        });
        
        res.status(201).json({
            success: true,
            data: newContent,
            message: 'Content created successfully'
        });
    } catch (error) {
        console.error('Error creating content:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Update content
 */
exports.updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, blocks, tags, genre, rating, featuredImage, status } = req.body;
        
        // Find content
        const content = await Content.findById(id);
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        // Check if user is the author or an admin
        if (content.author.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You can only update your own content.'
            });
        }
        
        // Update fields
        if (title) content.title = title;
        if (blocks) content.blocks = blocks;
        if (tags) content.tags = tags;
        if (genre) content.genre = genre;
        if (rating) content.rating = rating;
        if (featuredImage) content.featuredImage = featuredImage;
        
        // Update status and related dates
        if (status) {
            content.status = status;
            
            if (status === 'published' && !content.publishedDate) {
                content.publishedDate = new Date();
            }
            
            if (status === 'scheduled' && req.body.scheduledDate) {
                content.scheduledDate = new Date(req.body.scheduledDate);
            }
        }
        
        // Save content
        await content.save();
        
        res.json({
            success: true,
            data: content,
            message: 'Content updated successfully'
        });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Delete content
 */
exports.deleteContent = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find content
        const content = await Content.findById(id);
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        // Check if user is the author or an admin
        if (content.author.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You can only delete your own content.'
            });
        }
        
        // If content is part of a series, update series stats
        if (content.seriesId) {
            await Series.findByIdAndUpdate(content.seriesId, {
                $inc: { 'stats.chaptersCount': -1 }
            });
        }
        
        // Update user content count
        await User.findByIdAndUpdate(content.author, {
            $inc: { 'stats.contentCount': -1 }
        });
        
        // Delete content
        await content.remove();
        
        res.json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Update content status
 */
exports.updateContentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, scheduledDate } = req.body;
        
        // Find content
        const content = await Content.findById(id);
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        // Check if user is the author or an admin
        if (content.author.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You can only update your own content.'
            });
        }
        
        // Update status
        content.status = status;
        
        // Set dates based on status
        if (status === 'published' && !content.publishedDate) {
            content.publishedDate = new Date();
        }
        
        if (status === 'scheduled' && scheduledDate) {
            content.scheduledDate = new Date(scheduledDate);
        }
        
        // Save content
        await content.save();
        
        res.json({
            success: true,
            data: content,
            message: `Content ${status === 'published' ? 'published' : status} successfully`
        });
    } catch (error) {
        console.error('Error updating content status:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get content by series
 */
exports.getContentBySeries = async (req, res) => {
    try {
        const { seriesId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        // Check if series exists
        const series = await Series.findById(seriesId);
        
        if (!series) {
            return res.status(404).json({
                success: false,
                message: 'Series not found'
            });
        }
        
        // Build query
        const query = { 
            seriesId,
            status: 'published',
            publishedDate: { $lte: new Date() }
        };
        
        // Execute query
        const content = await Content.find(query)
            .sort({ chapterNumber: 1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        // Get total count
        const totalContent = await Content.countDocuments(query);
        
        res.json({
            success: true,
            data: content,
            series,
            pagination: {
                total: totalContent,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalContent / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching content by series:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get content by author
 */
exports.getContentByAuthor = async (req, res) => {
    try {
        const { authorId } = req.params;
        const { page = 1, limit = 10, type, status } = req.query;
        
        // Check if author exists
        const author = await User.findById(authorId);
        
        if (!author) {
            return res.status(404).json({
                success: false,
                message: 'Author not found'
            });
        }
        
        // Build query
        const query = { author: authorId };
        
        // If not the author viewing, only show published content
        if (req.user && req.user.id !== authorId) {
            query.status = 'published';
            query.publishedDate = { $lte: new Date() };
        } else if (status) {
            query.status = status;
        }
        
        if (type) {
            query.type = type;
        }
        
        // Execute query
        const content = await Content.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('seriesId', 'title slug');
        
        // Get total count
        const totalContent = await Content.countDocuments(query);
        
        res.json({
            success: true,
            data: content,
            author: {
                id: author._id,
                username: author.username,
                displayName: author.displayName,
                avatar: author.avatar
            },
            pagination: {
                total: totalContent,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalContent / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching content by author:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Increment view count
 */
exports.incrementViewCount = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and update content
        const content = await Content.findByIdAndUpdate(
            id,
            { $inc: { 'stats.views': 1 } },
            { new: true }
        );
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        // Update series view count if content is part of a series
        if (content.seriesId) {
            await Series.findByIdAndUpdate(
                content.seriesId,
                { $inc: { 'stats.views': 1 } }
            );
        }
        
        res.json({
            success: true,
            data: {
                views: content.stats.views
            }
        });
    } catch (error) {
        console.error('Error incrementing view count:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Toggle like/unlike content
 */
exports.toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Implementation would require a likes collection/model
        // This is a simplified version
        
        // Find content
        const content = await Content.findById(id);
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        
        // For now, just increment likes
        content.stats.likes += 1;
        await content.save();
        
        // Update series likes if content is part of a series
        if (content.seriesId) {
            await Series.findByIdAndUpdate(
                content.seriesId,
                { $inc: { 'stats.likes': 1 } }
            );
        }
        
        res.json({
            success: true,
            data: {
                likes: content.stats.likes
            },
            message: 'Content liked successfully'
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
