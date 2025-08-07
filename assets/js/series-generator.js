// series-generator.js
class SeriesGenerator {
    constructor() {
        this.templateCache = null;
    }
    
    async loadTemplate() {
        if (this.templateCache) return this.templateCache;
        
        try {
            const response = await fetch('series-template.html');
            this.templateCache = await response.text();
            return this.templateCache;
        } catch (error) {
            console.error('Failed to load series template:', error);
            return this.getDefaultTemplate();
        }
    }
    
    generateSeriesPage(comic) {
        const template = this.getSeriesTemplate();
        
        // Replace all placeholders with comic data
        let html = template
            .replace(/\{\{COMIC_TITLE\}\}/g, comic.title)
            .replace(/\{\{COMIC_AUTHOR\}\}/g, comic.author)
            .replace(/\{\{COMIC_DESCRIPTION\}\}/g, comic.description || 'No description available')
            .replace(/\{\{COMIC_GENRE\}\}/g, Array.isArray(comic.genre) ? comic.genre.join(', ') : comic.genre)
            .replace(/\{\{COMIC_RATING\}\}/g, comic.rating)
            .replace(/\{\{COMIC_STATUS\}\}/g, comic.status)
            .replace(/\{\{COMIC_VIEWS\}\}/g, this.formatNumber(comic.views))
            .replace(/\{\{COMIC_LIKES\}\}/g, this.formatNumber(comic.likes))
            .replace(/\{\{COMIC_CHAPTERS\}\}/g, comic.chapters || 1)
            .replace(/\{\{COMIC_COVER\}\}/g, comic.coverImage)
            .replace(/\{\{COMIC_ID\}\}/g, comic.id)
            .replace(/\{\{COMIC_TAGS\}\}/g, this.generateTagsHTML(comic.tags))
            .replace(/\{\{COMIC_PAGES\}\}/g, this.generatePagesHTML(comic.pages))
            .replace(/\{\{COMIC_READER_URL\}\}/g, `reader.html?comic=${comic.id}`)
            .replace(/\{\{COMIC_CREATED_DATE\}\}/g, new Date(comic.createdAt).toLocaleDateString())
            .replace(/\{\{COMIC_UPDATED_DATE\}\}/g, new Date(comic.updatedAt).toLocaleDateString());
        
        return html;
    }
    
    generateTagsHTML(tags) {
        if (!tags || !Array.isArray(tags)) return '';
        
        return tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }
    
    generatePagesHTML(pages) {
        if (!pages || !Array.isArray(pages)) return '';
        
        return pages.map((page, index) => `
            <div class="page-thumbnail" data-page="${index + 1}">
                <img src="${page}" alt="Page ${index + 1}" loading="lazy">
                <div class="page-number">${index + 1}</div>
            </div>
        `).join('');
    }
    
    async saveSeriesPage(comic) {
        const html = this.generateSeriesPage(comic);
        const filename = this.generateFilename(comic.title);
        
        // In a real application, this would save to the server
        // For demo purposes, we'll create a downloadable file
        this.downloadHTML(html, filename);
        
        return filename;
    }
    
    generateFilename(title) {
        return `series-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    }
    
    downloadHTML(html, filename) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
    
    getSeriesTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{COMIC_TITLE}} - Dreams Uncharted</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/series.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">
                <a href="index.html">
                    <img src="assets/Images/dreams.png" alt="Dreams Uncharted" class="logo">
                </a>
            </div>
            <div class="nav-menu">
                <a href="index.html">Home</a>
                <a href="browse.html">Browse</a>
                <a href="creator.html">Creator</a>
                <a href="about.html">About</a>
            </div>
        </div>
    </nav>

    <!-- Series Header -->
    <section class="series-header">
        <div class="container">
            <div class="series-info">
                <div class="series-cover">
                    <img src="{{COMIC_COVER}}" alt="{{COMIC_TITLE}}" id="comic-cover">
                </div>
                <div class="series-details">
                    <h1 id="comic-title">{{COMIC_TITLE}}</h1>
                    <p class="author" id="comic-author">By {{COMIC_AUTHOR}}</p>
                    <div class="series-meta">
                        <span class="genre">{{COMIC_GENRE}}</span>
                        <span class="rating">{{COMIC_RATING}}</span>
                        <span class="status">{{COMIC_STATUS}}</span>
                    </div>
                    <div class="series-stats">
                        <span class="views">👁 {{COMIC_VIEWS}} views</span>
                        <span class="likes">❤ {{COMIC_LIKES}} likes</span>
                        <span class="chapters">📚 {{COMIC_CHAPTERS}} chapters</span>
                    </div>
                    <div class="series-description">
                        <p>{{COMIC_DESCRIPTION}}</p>
                    </div>
                    <div class="series-tags">
                        {{COMIC_TAGS}}
                    </div>
                    <div class="series-actions">
                        <a href="{{COMIC_READER_URL}}" class="btn btn-primary btn-read">Start Reading</a>
                        <button class="btn btn-secondary btn-like" onclick="likeComic('{{COMIC_ID}}')">❤ Like</button>
                        <button class="btn btn-secondary btn-bookmark" onclick="bookmarkComic('{{COMIC_ID}}')">🔖 Bookmark</button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Chapters/Pages Section -->
    <section class="series-content">
        <div class="container">
            <h2>Pages Preview</h2>
            <div class="pages-grid" id="pages-grid">
                {{COMIC_PAGES}}
            </div>
        </div>
    </section>

    <!-- Related Comics -->
    <section class="related-comics">
        <div class="container">
            <h2>More from {{COMIC_AUTHOR}}</h2>
            <div class="content-grid" id="related-comics-grid">
                <!-- Will be populated by JavaScript -->
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 Dreams Uncharted. All rights reserved.</p>
        </div>
    </footer>

    <script src="assets/js/comics-manager.js"></script>
    <script src="assets/js/series-page.js"></script>
</body>
</html>`;
    }
}

// Global instance
const seriesGenerator = new SeriesGenerator();