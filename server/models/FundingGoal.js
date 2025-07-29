/**
 * FundingGoal Model
 * Dreams Uncharted Platform - Donation System
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FundingGoalSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 1
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Link to content this funding is for
    contentId: {
        type: Schema.Types.ObjectId,
        ref: 'Content'
    },
    // Link to series this funding is for
    seriesId: {
        type: Schema.Types.ObjectId,
        ref: 'Series'
    },
    // What type of content this funding will create
    fundingType: {
        type: String,
        required: true,
        enum: ['chapter', 'episode', 'page', 'artwork', 'bonus-content', 'series-continuation']
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled', 'paused'],
        default: 'active'
    },
    deadline: {
        type: Date
    },
    // Reward tiers for different donation amounts
    rewardTiers: [{
        amount: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        maxBackers: {
            type: Number // null = unlimited
        },
        currentBackers: {
            type: Number,
            default: 0
        }
    }],
    // Goal completion details
    completedAt: {
        type: Date
    },
    deliveryDate: {
        type: Date
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'delayed'],
        default: 'pending'
    },
    // Statistics
    stats: {
        totalDonations: {
            type: Number,
            default: 0
        },
        uniqueDonors: {
            type: Number,
            default: 0
        },
        averageDonation: {
            type: Number,
            default: 0
        },
        completionPercentage: {
            type: Number,
            default: 0
        }
    },
    // Settings
    settings: {
        allowAnonymousDonations: {
            type: Boolean,
            default: true
        },
        showDonorList: {
            type: Boolean,
            default: true
        },
        sendUpdates: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Calculate completion percentage before saving
FundingGoalSchema.pre('save', function(next) {
    this.stats.completionPercentage = Math.min(
        (this.currentAmount / this.targetAmount) * 100,
        100
    );
    
    // Mark as completed if target reached
    if (this.currentAmount >= this.targetAmount && this.status === 'active') {
        this.status = 'completed';
        this.completedAt = new Date();
    }
    
    next();
});

// Calculate average donation
FundingGoalSchema.methods.calculateAverageDonation = function() {
    if (this.stats.totalDonations > 0) {
        this.stats.averageDonation = this.currentAmount / this.stats.totalDonations;
    }
    return this.stats.averageDonation;
};

// Check if goal is reached
FundingGoalSchema.methods.isGoalReached = function() {
    return this.currentAmount >= this.targetAmount;
};

// Get time remaining
FundingGoalSchema.methods.getTimeRemaining = function() {
    if (!this.deadline) return null;
    
    const now = new Date();
    const timeLeft = this.deadline - now;
    
    if (timeLeft <= 0) return { expired: true };
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
};

module.exports = mongoose.model('FundingGoal', FundingGoalSchema);

