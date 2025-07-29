/**
 * Donation Model
 * Dreams Uncharted Platform - Donation System
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DonationSchema = new Schema({
    // Donor information
    donor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    donorName: {
        type: String,
        trim: true
    },
    donorEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    
    // Funding goal this donation is for
    fundingGoal: {
        type: Schema.Types.ObjectId,
        ref: 'FundingGoal',
        required: true
    },
    
    // Payment details
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    
    // Payment processing
    paymentMethod: {
        type: String,
        required: true,
        enum: ['stripe', 'paypal', 'crypto']
    },
    paymentIntentId: {
        type: String // Stripe Payment Intent ID
    },
    paymentId: {
        type: String // PayPal Payment ID or other processor ID
    },
    transactionId: {
        type: String // Final transaction ID from payment processor
    },
    
    // Payment status
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    
    // Reward tier selected
    rewardTier: {
        amount: Number,
        title: String,
        description: String
    },
    
    // Optional message from donor
    message: {
        type: String,
        trim: true,
        maxlength: 500
    },
    
    // Processing details
    processedAt: {
        type: Date
    },
    failureReason: {
        type: String
    },
    refundedAt: {
        type: Date
    },
    refundReason: {
        type: String
    },
    
    // Metadata from payment processor
    paymentMetadata: {
        type: Map,
        of: Schema.Types.Mixed
    },
    
    // Fee information
    processingFee: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number // Amount after fees
    }
}, {
    timestamps: true
});

// Calculate net amount before saving
DonationSchema.pre('save', function(next) {
    if (this.isModified('amount') || this.isModified('processingFee')) {
        this.netAmount = this.amount - (this.processingFee || 0);
    }
    
    // Set processed date when status changes to completed
    if (this.isModified('status') && this.status === 'completed' && !this.processedAt) {
        this.processedAt = new Date();
    }
    
    next();
});

// Static method to get donation statistics for a funding goal
DonationSchema.statics.getStatsForFundingGoal = async function(fundingGoalId) {
    const stats = await this.aggregate([
        {
            $match: {
                fundingGoal: mongoose.Types.ObjectId(fundingGoalId),
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalDonations: { $sum: 1 },
                averageDonation: { $avg: '$amount' },
                uniqueDonors: { $addToSet: '$donor' }
            }
        },
        {
            $project: {
                totalAmount: 1,
                totalDonations: 1,
                averageDonation: 1,
                uniqueDonors: { $size: '$uniqueDonors' }
            }
        }
    ]);
    
    return stats[0] || {
        totalAmount: 0,
        totalDonations: 0,
        averageDonation: 0,
        uniqueDonors: 0
    };
};

// Static method to get recent donations for a funding goal
DonationSchema.statics.getRecentDonations = async function(fundingGoalId, limit = 10) {
    return this.find({
        fundingGoal: fundingGoalId,
        status: 'completed',
        isAnonymous: false
    })
    .populate('donor', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('amount message donor donorName createdAt');
};

// Instance method to get display name
DonationSchema.methods.getDisplayName = function() {
    if (this.isAnonymous) {
        return 'Anonymous';
    }
    
    if (this.donor && this.donor.name) {
        return this.donor.name;
    }
    
    return this.donorName || 'Anonymous';
};

// Instance method to format amount
DonationSchema.methods.getFormattedAmount = function() {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.currency || 'USD'
    });
    
    return formatter.format(this.amount);
};

module.exports = mongoose.model('Donation', DonationSchema);

