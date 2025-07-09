const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs"); // Remove if only using Google OAuth
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows null values, useful if some users don't use Google OAuth
    },
    // Remove 'username' if you want to use Google's display name as the primary identifier
    // If you want to keep it, ensure it's handled during user creation/update
    // username: {
    //     type: String,
    //     unique: true,
    //     trim: true,
    //     minlength: 3,
    //     maxlength: 30
    // },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    // Remove 'password' field if you are only using Google OAuth for authentication
    // password: {
    //     type: String,
    //     minlength: 6
    // },
    name: { // Renamed from displayName to 'name' to match Google profile
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    avatar: { // This will now store the Google profile picture URL
        type: String
    },
    coverImage: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "creator", "admin", "superadmin"], // Keep your existing roles
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    socialLinks: {
        website: String,
        twitter: String,
        instagram: String,
        facebook: String,
        patreon: String,
        kofi: String
    },
    stats: {
        followers: {
            type: Number,
            default: 0
        },
        following: {
            type: Number,
            default: 0
        },
        contentCount: {
            type: Number,
            default: 0
        }
    },
    preferences: {
        theme: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system"
        },
        emailNotifications: {
            type: Boolean,
            default: true
        }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

// Remove these pre-save hooks and methods if you are only using Google OAuth
// If you plan to support both password-based and Google OAuth users, 
// you'll need to modify these to only apply when a password is set.

// UserSchema.pre("save", async function(next) {
//     if (!this.isModified("password")) {
//         return next();
//     }
    
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// UserSchema.pre("save", function(next) {
//     if (!this.displayName) {
//         this.displayName = this.username;
//     }
//     next();
// });

// UserSchema.methods.comparePassword = async function(candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

module.exports = mongoose.model("User", UserSchema);
