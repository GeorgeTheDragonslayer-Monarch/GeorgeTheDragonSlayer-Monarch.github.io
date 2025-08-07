// index-page.js
document.addEventListener('DOMContentLoaded', function() {
    loadRecentComics();
    loadFeaturedComics();
});

function loadRecentComics() {
    const recentComics = comicsManager.getRecentComics(4);
    const grid = document.getElementById('recently-updated-grid');
    
    if (!grid) return;
    
    grid.innerHTML = recentComics.map(comic => createComicCard(comic)).join('');
}

function loadFeaturedComics() {
    const featuredComics = comicsManager.getFeaturedComics(4);
    const grid = document.getElementById('featured-comics-grid');
    
    if (!grid) return;
    
    grid.innerHTML = featuredComics.map(comic => createComicCard(comic)).join('');
}

function createComicCard(comic) {
    const genreText = Array.isArray(comic.genre) ? comic.genre.join(', ') : comic.genre;
    const timeAgo = getTimeAgo(comic.updatedAt);
    
    return `
        <div class="content-card" data-comic-id="${comic.id}">
            <div class="card-image">
                <img src="${comic.coverImage}" alt="${comic.title}" loading="lazy">
                <div class="card-overlay">
                    <a href="${comic.seriesUrl}">Read Now</a>
                </div>
            </div>
            <div class="card-info">
                <h3><a href="${comic.seriesUrl}">${comic.title}</a></h3>
                <p class="author">By ${comic.author}</p>
                <p class="genre">${genreText}</p>
                <div class="card-stats">
                    <span class="views">👁 ${formatNumber(comic.views)}</span>
                    <span class="likes">❤ ${formatNumber(comic.likes)}</span>
                    <span class="updated">Updated ${timeAgo}</span>
                </div>
            </div>
        </div>
    `;
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Refresh comics data (call this after new comics are uploaded)
function refreshComicsDisplay() {
    loadRecentComics();
    loadFeaturedComics();
}

// Make it globally available
window.refreshComicsDisplay = refreshComicsDisplay;