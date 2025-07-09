/**
 * Series Model
 * Dreams Uncharted Platform
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SeriesSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['comic', 'novel']
    },
    description: {
        type: String,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverImage: {
        type: String
    },
    bannerImage: {
        type: String
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'hiatus', 'cancelled'],
        default: 'ongoing'
    },
    tags: [String],
    genre: [String],
    rating: {
        type: String,
        enum: ['all-ages', 'teen', 'mature'],
        default: 'all-ages'
    },
    stats: {
        views: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        },
        followers: {
            type: Number,
            default: 0
        },
        chaptersCount: {
            type: Number,
            default: 0
        }
    },
    publishingSchedule: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'biweekly', 'monthly', 'irregular'],
            default: 'irregular'
        },
        dayOfWeek: {
            type: Number, // 0 = Sunday, 1 = Monday, etc.
        }
    },
    isPromoted: {
        type: Boolean,
        default: false
    },
    isExclusive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Generate slug from title before saving
SeriesSchema.pre('save', function(next) {
    if (!this.slug || this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
    next();
});

module.exports = mongoose.model('Series', SeriesSchema);
