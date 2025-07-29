/**
 * Funding Routes
 * Dreams Uncharted Platform - Donation System
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/requireAuth');
const FundingGoal = require('../models/FundingGoal');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Content = require('../models/Content');
const Series = require('../models/Series');

// Get all active funding goals
router.get('/goals', async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'active', creator } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (creator) query.creator = creator;
        
        const goals = await FundingGoal.find(query)
            .populate('creator', 'name avatar')
            .populate('contentId', 'title slug')
            .populate('seriesId', 'title slug')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await FundingGoal.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                goals,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching funding goals',
            error: error.message
        });
    }
});

// Get funding goal by ID
router.get('/goals/:id', async (req, res) => {
    try {
        const goal = await FundingGoal.findById(req.params.id)
            .populate('creator', 'name avatar bio socialLinks')
            .populate('contentId', 'title slug featuredImage')
            .populate('seriesId', 'title slug coverImage');
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Funding goal not found'
            });
        }
        
        // Get recent donations
        const recentDonations = await Donation.getRecentDonations(goal._id, 10);
        
        // Get donation statistics
        const stats = await Donation.getStatsForFundingGoal(goal._id);
        
        res.json({
            success: true,
            data: {
                goal,
                recentDonations,
                stats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching funding goal',
            error: error.message
        });
    }
});

// Create new funding goal (creators only)
router.post('/goals', requireAuth, async (req, res) => {
    try {
        // Check if user is creator or admin
        if (req.user.role !== 'creator' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Only creators can create funding goals'
            });
        }
        
        const {
            title,
            description,
            targetAmount,
            contentId,
            seriesId,
            fundingType,
            deadline,
            rewardTiers,
            settings
        } = req.body;
        
        // Validate required fields
        if (!title || !description || !targetAmount || !fundingType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Verify content/series ownership if specified
        if (contentId) {
            const content = await Content.findById(contentId);
            if (!content || content.author.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only create funding goals for your own content'
                });
            }
        }
        
        if (seriesId) {
            const series = await Series.findById(seriesId);
            if (!series || series.author.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only create funding goals for your own series'
                });
            }
        }
        
        const goal = new FundingGoal({
            title,
            description,
            targetAmount,
            creator: req.user.id,
            contentId,
            seriesId,
            fundingType,
            deadline: deadline ? new Date(deadline) : null,
            rewardTiers: rewardTiers || [],
            settings: settings || {}
        });
        
        await goal.save();
        
        await goal.populate('creator', 'name avatar');
        
        res.status(201).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating funding goal',
            error: error.message
        });
    }
});

// Update funding goal (creator only)
router.put('/goals/:id', requireAuth, async (req, res) => {
    try {
        const goal = await FundingGoal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Funding goal not found'
            });
        }
        
        // Check ownership
        if (goal.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own funding goals'
            });
        }
        
        // Don't allow changes to completed goals
        if (goal.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify completed funding goals'
            });
        }
        
        const allowedUpdates = [
            'title', 'description', 'deadline', 'rewardTiers', 
            'settings', 'deliveryDate', 'deliveryStatus'
        ];
        
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        
        Object.assign(goal, updates);
        await goal.save();
        
        res.json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating funding goal',
            error: error.message
        });
    }
});

// Delete funding goal (creator only, if no donations)
router.delete('/goals/:id', requireAuth, async (req, res) => {
    try {
        const goal = await FundingGoal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Funding goal not found'
            });
        }
        
        // Check ownership
        if (goal.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own funding goals'
            });
        }
        
        // Check if there are any donations
        const donationCount = await Donation.countDocuments({
            fundingGoal: goal._id,
            status: 'completed'
        });
        
        if (donationCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete funding goal with existing donations'
            });
        }
        
        await FundingGoal.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Funding goal deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting funding goal',
            error: error.message
        });
    }
});

// Get funding goals for a specific creator
router.get('/creator/:creatorId/goals', async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const query = { creator: req.params.creatorId };
        if (status) query.status = status;
        
        const goals = await FundingGoal.find(query)
            .populate('contentId', 'title slug')
            .populate('seriesId', 'title slug')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await FundingGoal.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                goals,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching creator funding goals',
            error: error.message
        });
    }
});

// Get funding goals for a specific series
router.get('/series/:seriesId/goals', async (req, res) => {
    try {
        const goals = await FundingGoal.find({
            seriesId: req.params.seriesId,
            status: { $in: ['active', 'completed'] }
        })
        .populate('creator', 'name avatar')
        .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: goals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching series funding goals',
            error: error.message
        });
    }
});

// Get donations for a funding goal
router.get('/goals/:id/donations', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const goal = await FundingGoal.findById(req.params.id);
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Funding goal not found'
            });
        }
        
        const donations = await Donation.find({
            fundingGoal: req.params.id,
            status: 'completed'
        })
        .populate('donor', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('amount message donor donorName isAnonymous createdAt rewardTier');
        
        const total = await Donation.countDocuments({
            fundingGoal: req.params.id,
            status: 'completed'
        });
        
        res.json({
            success: true,
            data: {
                donations,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donations',
            error: error.message
        });
    }
});

// Admin routes
router.get('/admin/goals', requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, creator } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (creator) query.creator = creator;
        
        const goals = await FundingGoal.find(query)
            .populate('creator', 'name email')
            .populate('contentId', 'title')
            .populate('seriesId', 'title')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await FundingGoal.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                goals,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching funding goals',
            error: error.message
        });
    }
});

router.get('/admin/donations', requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, status, fundingGoal } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (fundingGoal) query.fundingGoal = fundingGoal;
        
        const donations = await Donation.find(query)
            .populate('donor', 'name email')
            .populate('fundingGoal', 'title creator')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Donation.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                donations,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donations',
            error: error.message
        });
    }
});

module.exports = router;

