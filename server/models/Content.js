/**
 * Content Model
 * Dreams Uncharted Platform
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Block Schema
const BlockSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['text', 'image', 'heading', 'comic-panel', 'gallery', 'quote', 'divider', 'dialogue', 'chapter-break']
    },
    content: {
        type: String,
        default: ''
    },
    src: String,
    caption: String,
    level: String,
    fullWidth: Boolean,
    metadata: {
        type: Map,
        of: Schema.Types.Mixed
    }
});

// Content Schema
const ContentSchema = new Schema({
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
        enum: ['comic', 'novel', 'announcement', 'page']
    },
    status: {
        type: String,
        required: true,
        enum: ['draft', 'published', 'scheduled', 'archived'],
        default: 'draft'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seriesId: {
        type: Schema.Types.ObjectId,
        ref: 'Series'
    },
    chapterNumber: {
        type: Number
    },
    scheduledDate: {
        type: Date
    },
    publishedDate: {
        type: Date
    },
    featuredImage: {
        type: String
    },
    blocks: [BlockSchema],
    tags: [String],
    genre: [String],
    rating: {
        type: String,
        enum: ['all-ages', 'teen', 'mature'],
        default: 'all-ages'
    },
    metadata: {
        type: Map,
        of: Schema.Types.Mixed
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
        comments: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Generate slug from title before saving
ContentSchema.pre('save', function(next) {
    if (!this.slug || this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
    
    // If status is changed to 'published' and no publishedDate, set it
    if (this.isModified('status') && this.status === 'published' && !this.publishedDate) {
        this.publishedDate = new Date();
    }
    
    next();
});

module.exports = mongoose.model('Content', ContentSchema);
