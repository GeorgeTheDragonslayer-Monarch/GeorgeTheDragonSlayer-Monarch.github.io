/**
 * Authentication Middleware
 * Dreams Uncharted Platform
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and add user to request
 */
module.exports = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }
        
        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
};
/**
 * This middleware verifies the JWT token provided in the request header.
 * If valid, it retrieves the user from the database and attaches it to the request object.
 * If the token is invalid or expired, it returns a 401 Unauthorized response.
 * If any other error occurs, it returns a 500 Internal Server Error response.
 *
 * Usage:
 * app.use('/api/protected-route', authMiddleware, (req, res) => {
 *     res.json({ message: 'Protected data', user: req.user });
 * });
 */
// This code is a middleware for Express.js that verifies JWT tokens for authentication.
// It checks if the token is present in the request header, verifies it using a secret key,
// and retrieves the user from the database based on the token's payload.
// If the token is valid, it adds the user to the request object and calls the next middleware.
// If the token is invalid or expired, it returns a 401 Unauthorized response.
// If any other error occurs, it returns a 500 Internal Server Error response.
// This middleware can be used to protect routes that require authentication in a web application.
// It can be applied to specific routes or globally to all routes that require authentication.
// Example usage:
// const express = require('express');
// const authMiddleware = require('./middleware/auth');
// const app = express();
//
// app.use('/api/protected', authMiddleware, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });
// // In this example, the `authMiddleware` is applied to the `/api/protected` route.
// // If a valid JWT token is provided in the request header, the user will be authenticated
// and the request will proceed to the route handler.
// // If the token is invalid or expired, a 401 Unauthorized response will be sent.
// // If any other error occurs, a 500 Internal Server Error response will be sent.
//// This middleware is useful for securing API endpoints and ensuring that only authenticated users can access certain resources.
// It can be extended to include additional checks, such as user roles or permissions, based on the application's requirements.
// This code is a middleware for Express.js that verifies JWT tokens for authentication.
// It checks if the token is present in the request header, verifies it using a secret key
// and retrieves the user from the database based on the token's payload.
// If the token is valid, it adds the user to the request object and calls the next middleware.
// If the token is invalid or expired, it returns a 401 Unauthorized response.
// If any other error occurs, it returns a 500 Internal Server Error response.
// This middleware can be used to protect routes that require authentication in a web application.
// It can be applied to specific routes or globally to all routes that require authentication.
// Example usage:
// const express = require('express');
// const authMiddleware = require('./middleware/auth');
// const app = express();
//// app.use('/api/protected', authMiddleware, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });
// });
// In this example, the `authMiddleware` is applied to the `/api/protected` route.
// If a valid JWT token is provided in the request header, the user will be authenticated
// and the request will proceed to the route handler.
// If the token is invalid or expired, a 401 Unauthorized response will be sent.
// If any other error occurs, a 500 Internal Server Error response will be sent.
// This middleware is useful for securing API endpoints and ensuring that only authenticated users can access certain resources.
// It can be extended to include additional checks, such as user roles or permissions, based on the application's requirements.
// This code is a middleware for Express.js that verifies JWT tokens for authentication.
// It checks if the token is present in the request header, verifies it using a secret key,
// and retrieves the user from the database based on the token's payload.
// If the token is valid, it adds the user to the request object and calls the next middleware.
// If the token is invalid or expired, it returns a 401 Unauthorized response.
// If any other error occurs, it returns a 500 Internal Server Error response.
// This middleware can be used to protect routes that require authentication in a web application.
// It can be applied to specific routes or globally to all routes that require authentication.
// Example usage:
// const express = require('express');
// const authMiddleware = require('./middleware/auth');
// const app = express();
//
// app.use('/api/protected', authMiddleware, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });
// });
// In this example, the `authMiddleware` is applied to the `/api/protected`
// route.
// If a valid JWT token is provided in the request header, the user will be authenticated
// and the request will proceed to the route handler.
// If the token is invalid or expired, a 401 Unauthorized response will be sent.
// If any other error occurs, a 500 Internal Server Error response will be sent.
// This middleware is useful for securing API endpoints and ensuring that only authenticated users can access certain resources.
// It can be extended to include additional checks, such as user roles or permissions, based on the application's requirements.
// This code is a middleware for Express.js that verifies JWT tokens for authentication.
// It checks if the token is present in the request header, verifies it using a secret key
// and retrieves the user from the database based on the token's payload.
// If the token is valid, it adds the user to the request object and calls the next middleware.
// If the token is invalid or expired, it returns a 401 Unauthorized response.
// If any other error occurs, it returns a 500 Internal Server Error response.
// This middleware can be used to protect routes that require authentication in a web application.
// It can be applied to specific routes or globally to all routes that require authentication.
// Example usage:
// const express = require('express');
// const authMiddleware = require('./middleware/auth');
// const app = express();
//
// app.use('/api/protected', authMiddleware, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });
// });
// In this example, the `authMiddleware` is applied to the `/api/protected`
// route.
// If a valid JWT token is provided in the request header, the user will be authenticated
// and the request will proceed to the route handler.
// If the token is invalid or expired, a 401 Unauthorized response will be sent.
// If any other error occurs, a 500 Internal Server Error response will be sent.
// This middleware is useful for securing API endpoints and ensuring that only authenticated users can access certain resources
// It can be extended to include additional checks, such as user roles or permissions, based on the application's requirements.
// This code is a middleware for Express.js that verifies JWT tokens for authentication.
// It checks if the token is present in the request header, verifies it using a secret key,
// and retrieves the user from the database based on the token's payload.
// If the token is valid, it adds the user to the request object and calls the next middleware.
// If the token is invalid or expired, it returns a 401 Unauthorized response.
// If any other error occurs, it returns a 500 Internal Server Error response.
// This middleware can be used to protect routes that require authentication in a web application.
// It can be applied to specific routes or globally to all routes that require authentication.
// Example usage:
// const express = require('express');
// const authMiddleware = require('./middleware/auth');
// const app = express();
//
// app.use('/api/protected', authMiddleware, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });
// });
// In this example, the `authMiddleware` is applied to the `/api/protected`
// route.
// If a valid JWT token is provided in the request header, the user will be authenticated
// and the request will proceed to the route handler.
// If the token is invalid or expired, a 401 Unauthorized response will be sent.
// If any other error occurs, a 500 Internal Server Error response will be sent.
// This middleware is useful for securing API endpoints and ensuring that only authenticated users can access certain resources
// It can be extended to include additional checks, such as user roles or permissions, based on the application's requirements.
// This code is a middleware for Express.js that verifies JWT tokens for authentication.
// It checks if the token is present in the request header, verifies it using a secret key,
// and retrieves the user from the database based on the token's payload.
// If the token is valid, it adds the user to the request object and calls the next middleware.
// If the token is invalid or expired, it returns a 401 Unauthorized response.
// If any other error occurs, it returns a 500 Internal Server Error response.
// This middleware can be used to protect routes that require authentication in a web application.
// It can be applied to specific routes or globally to all routes that require authentication.
// Example usage:
// const express = require('express');
// const authMiddleware = require('./middleware/auth');
// const app = express();
//
// app.use('/api/protected', authMiddleware, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });
// });
// In this example, the `authMiddleware` is applied to the `/api/protected`
// route.
// If a valid JWT token is provided in the request header, the user will be authenticated
// and the request will proceed to the route handler.
// If the token is invalid or expired, a 401 Unauthorized response will be sent.
// If any other error occurs, a 500 Internal Server Error response will be sent.
// This middleware is useful for securing API endpoints and ensuring that only authenticated users can access certain resources
// It can be extended to include additional checks, such as user roles or permissions, based on the application's requirements.
// This code is a middleware for Express.js that verifies JWT tokens for authentication.
// It checks if the token is present in the request header, verifies it using a secret key
// and retrieves the user from the database based on the token's payload.
// If the token is valid, it adds the user to the request object and calls the next
// middleware.
// If the token is invalid or expired, it returns a 401 Unauthorized response.
// If any other error occurs, it returns a 500 Internal Server Error response.
// This middleware can be used to protect routes that require authentication in a web application.
// It can be applied to specific routes or globally to all routes that require authentication.
// Example usage:
// const express = require('express');
// const authMiddleware = require('./middleware/auth');
// const app = express();
//
// app.use('/api/protected', authMiddleware, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });
// });
// });// In this example, the `authMiddleware` is applied to the `/api/protected`
// route.
// If a valid JWT token is provided in the request header, the user will be authenticated
// and the request will proceed to the route handler.
// If the token is invalid or expired, a 401 Unauthorized response will be sent.
// If any other error occurs, a 500 Internal Server Error response will be sent.
// This middleware is useful for securing API endpoints and ensuring that only authenticated users can access certain resources.
// It can be extended to include additional checks, such as user roles or permissions, based on the application's requirements.