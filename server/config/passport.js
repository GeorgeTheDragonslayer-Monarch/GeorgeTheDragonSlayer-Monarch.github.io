const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user is in admin emails list
        const adminEmails = process.env.ADMIN_EMAILS.split(',');
        const userEmail = profile.emails[0].value;
        
        if (!adminEmails.includes(userEmail)) {
            return done(null, false, { message: 'Unauthorized access' });
        }

        // Find or create user
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        } else {
            user = await User.create({
                googleId: profile.id,
                email: userEmail,
                name: profile.displayName,
                role: 'admin',
                avatar: profile.photos[0].value
            });
            return done(null, user);
        }
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});