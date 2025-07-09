# Dreams Uncharted Platform

A modern web platform for publishing and reading comics and web novels.

## Project Structure

```
website/
├── public/           # Public-facing website
│   ├── index.html    # Homepage
│   ├── series.html   # Series page
│   ├── reader.html   # Reading interface
│   ├── creator.html  # Creator profile page
│   └── assets/       # Static assets
│       ├── css/      # Stylesheets
│       ├── js/       # JavaScript files
│       ├── images/   # Images
│       └── fonts/    # Fonts
│
├── admin/            # Admin dashboard and editor
│   ├── index.html    # Admin dashboard
│   ├── editor.html   # Block editor
│   ├── content.html  # Content management
│   └── assets/       # Admin assets
│       ├── css/      # Admin stylesheets
│       ├── js/       # Admin scripts
│       └── images/   # Admin images
│
└── server/           # Backend server
    ├── app.js        # Main application
    ├── models/       # Database models
    ├── routes/       # API routes
    ├── controllers/  # Request handlers
    ├── middleware/   # Custom middleware
    └── uploads/      # Uploaded files
```

## Features

### Public Website

- Responsive design for all devices
- Browse comics and web novels
- Reading interface with panel-by-panel navigation
- Creator profiles and series pages
- User accounts and favorites

### Admin Dashboard

- Content management system
- Custom block-based editor for comics and novels
- Analytics and statistics
- User management
- Comment moderation

### Block Editor

The block editor allows content creators to build comics and web novels using various content blocks:

- Text blocks for paragraphs
- Heading blocks for titles and subtitles
- Image blocks for illustrations
- Comic panel blocks for sequential art
- Gallery blocks for multiple images
- Quote blocks for highlighted text
- Divider blocks for section breaks
- Dialogue blocks for character speech
- Chapter break blocks for organizing content

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local file system (expandable to cloud storage)

## Getting Started

1. Clone the repository
2. Set up the server:
   ```
   cd website/server
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm run dev
   ```
3. Open the website:
   - Navigate to `website/public/index.html` to view the public site
   - Navigate to `website/admin/index.html` to access the admin dashboard

## Development

The project uses vanilla HTML, CSS, and JavaScript for maximum compatibility and simplicity. The admin block editor is a custom implementation that allows for flexible content creation without requiring complex frameworks.

### Building CSS and JS

For development, CSS and JS files are structured in a modular way but served as standalone files. In a production environment, these files should be minified and bundled.

## Deployment

See `deployment_plan.md` for detailed deployment instructions.

## License

This project is proprietary and confidential.
