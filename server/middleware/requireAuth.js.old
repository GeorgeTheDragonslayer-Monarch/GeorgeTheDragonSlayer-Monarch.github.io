const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    
    // If it's an API request, return JSON
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
    
    // Otherwise redirect to login
    res.redirect('/admin/login');
};

const requireAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    
    if (req.path.startsWith('/api/')) {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required' 
        });
    }
    
    res.redirect('/admin/login');
};

module.exports = { requireAuth, requireAdmin };

// This middleware checks if the user is authenticated and has admin privileges.
// If not, it either redirects to the login page or returns a JSON error response for API requests.
// It can be used in routes to protect access to certain pages or API endpoints.
// Usage example in an Express route:
// const { requireAuth, requireAdmin } = require('../middleware/requireAuth');
// 
// router.get('/admin/dashboard', requireAuth, requireAdmin, (req, res) => {
//     res.render('admin/dashboard', { user: req.user });
// });
// This ensures that only authenticated admin users can access the dashboard page.
// If the user is not authenticated, they will be redirected to the login page.
// If the user is authenticated but not an admin, they will receive a 403 Forbidden response for API requests.
// For non-API requests, they will be redirected to the login page as well.
// This middleware can be extended or modified to include additional roles or permissions as needed.
// It can also be used in conjunction with other middleware for logging, error handling, etc.
// This code is a middleware for Express.js that checks if a user is authenticated and has admin privileges.
// It can be used to protect routes in a web application, ensuring that only authorized users can access certain pages or API endpoints.
// The middleware checks if the user is authenticated using `req.isAuthenticated()`.
// If the user is authenticated, it allows the request to proceed to the next middleware or route handler.
// If the user is not authenticated, it checks if the request is an API request (by checking if the path starts with `/api/`).
// If it is an API request, it returns a JSON response with a 401 status code and an error message.
// If it is not an API request, it redirects the user to the login page (`/admin/login`).
// Additionally, there is a `requireAdmin` middleware that checks if the authenticated user has an admin role.
// If the user is authenticated and has the admin role, it allows the request to proceed.
// If the user is authenticated but does not have the admin role, it returns a 403 Forbidden response for API requests.
// For non-API requests, it redirects the user to the login page as well.
// This middleware can be used in an Express.js application to protect routes and ensure that only authorized users can access certain parts of the application.
// It can be easily integrated into existing routes by importing the middleware and using it in route definitions.
// For example, you can use it in your route definitions like this:
// const { requireAuth, requireAdmin } = require('../middleware/requireAuth');
//
// router.get('/admin/dashboard', requireAuth, requireAdmin, (req, res) => {
//     res.render('admin/dashboard', { user: req.user });
// });
// This ensures that only authenticated admin users can access the dashboard page.
// If the user is not authenticated, they will be redirected to the login page.
// If the user is authenticated but not an admin, they will receive a 403 Forbidden response for API requests, or be redirected to the login page for non-API requests.
// This middleware can be extended or modified to include additional roles or permissions as needed.
// It can also be used in conjunction with other middleware for logging, error handling, etc.
// This code is a middleware for Express.js that checks if a user is authenticated and has admin privledges
// It can be used to protect routes in a web application, ensuring that only authorized users can access certain pages or API endpoints.
// The middleware checks if the user is authenticated using `req.isAuthenticated()`.



