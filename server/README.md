# Dreams Uncharted Server

Backend server for the Dreams Uncharted comic and web novel platform.

## Features

- RESTful API for content management
- User authentication and authorization
- File uploads for images and assets
- Content organization with series and chapters
- Block-based content storage for flexible layouts

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens for authentication
- Express File Upload for handling file uploads

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- MongoDB 4.x or higher

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd website/server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration values
6. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user info

### Content

- `GET /api/content` - Get all content (with pagination and filters)
- `GET /api/content/published` - Get published content
- `GET /api/content/:id` - Get content by ID
- `GET /api/content/slug/:slug` - Get content by slug
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `PATCH /api/content/:id/status` - Update content status
- `GET /api/content/series/:seriesId` - Get content by series
- `GET /api/content/author/:authorId` - Get content by author
- `POST /api/content/:id/view` - Increment view count
- `POST /api/content/:id/like` - Like/unlike content

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/username/:username` - Get user by username
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Series

- `GET /api/series` - Get all series
- `GET /api/series/:id` - Get series by ID
- `GET /api/series/slug/:slug` - Get series by slug
- `POST /api/series` - Create new series
- `PUT /api/series/:id` - Update series
- `DELETE /api/series/:id` - Delete series

### Uploads

- `POST /api/uploads/image` - Upload image
- `POST /api/uploads/avatar` - Upload avatar
- `POST /api/uploads/cover` - Upload cover image

## License

This project is proprietary and confidential.
