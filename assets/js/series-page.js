// series-page.js
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const comicId = urlParams.get('comic') || getComicIdFromURL();
    
    if (comicId) {
        loadSeriesData(comicId);
    } else {
        // If no comic ID, try to load from page content or show error
        console.error('No comic ID found');
    }
    
    setupPageInteractions();
});

function getComicIdFromURL() {
    // Extract comic ID from filename (e.g., series-mystic-chronicles.html)
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    const match = filename.match(/series-(.+)\.html/);
    
    if (match) {
        const slug = match[1];
        // Find comic by matching slug to title
        const comics = comicsManager.getAllComics();
        const comic = comics.find(c => 
            c.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug
        );
        return comic ? comic.id : null;
    }
    
    return null;
}

function loadSeriesData(comicId) {
    const comic = comicsManager.getComicById(comicId);
    
    if (!comic) {
        showComicNotFound();
        return;
    }
    
    // Update page content with comic data
    updatePageContent(comic);
    
    // Load related comics
    loadRelatedComics(comic);
    
    // Update page title
    document.title = `${comic.title} - Dreams Uncharted`;
    
    // Track view
    trackComicView(comicId);
}

function updatePageContent(comic) {
    // Update basic info
    const titleElement = document.getElementById('comic-title');
    const authorElement = document.getElementById('comic-author');
    const coverElement = document.getElementById('comic-cover');
    
    if (titleElement) titleElement.textContent = comic.title;
    if (authorElement) authorElement.textContent = `By ${comic.author}`;
    if (coverElement) {
        coverElement.src = comic.coverImage;
        coverElement.alt = comic.title;
    }
    
    // Update meta information
    updateMetaInfo(comic);
    
    // Update pages grid
    updatePagesGrid(comic.pages);
}

function updateMetaInfo(comic) {
    const genreElements = document.querySelectorAll('.genre');
    const ratingElements = document.querySelectorAll('.rating');
    const statusElements = document.querySelectorAll('.status');
    
    genreElements.forEach(el => {
        el.textContent = Array.isArray(comic.genre) ? comic.genre.join(', ') : comic.genre;
    });
    
    ratingElements.forEach(el => {
        el.textContent = comic.rating;
    });
    
    statusElements.forEach(el => {
        el.textContent = comic.status;
    });
    
    // Update stats
    const viewsElements = document.querySelectorAll('.views');
    const likesElements = document.querySelectorAll('.likes');
    const chaptersElements = document.querySelectorAll('.chapters');
    
    viewsElements.forEach(el => {
        el.innerHTML = `👁 ${formatNumber(comic.views)} views`;
    });
    
    likesElements.forEach(el => {
        el.innerHTML = `❤ ${formatNumber(comic.likes)} likes`;
    });
    
    chaptersElements.forEach(el => {
        el.innerHTML = `📚 ${comic.chapters || 1} chapters`;
    });
    
    // Update description
    const descriptionElements = document.querySelectorAll('.series-description p');
    descriptionElements.forEach(el => {
        el.textContent = comic.description || 'No description available';
    });
    
    // Update tags
    updateTags(comic.tags);
}

function updateTags(tags) {
    const tagsContainer = document.querySelector('.series-tags');
    if (!tagsContainer || !tags || !Array.isArray(tags)) return;
    
    tagsContainer.innerHTML = tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
}

function updatePagesGrid(pages) {
    const pagesGrid = document.getElementById('pages-grid');
    if (!pagesGrid || !pages || !Array.isArray(pages)) return;
    
    pagesGrid.innerHTML = pages.map((page, index) => `
        <div class="page-thumbnail" data-page="${index + 1}" onclick="openPageReader(${index})">
            <img src="${page}" alt="Page ${index + 1}" loading="lazy">
            <div class="page-number">${index + 1}</div>
            <div class="page-overlay">
                <span>Read Page</span>
            </div>
        </div>
    `).join('');
}

function loadRelatedComics(currentComic) {
    const relatedComics = comicsManager.comics
        .filter(comic => 
            comic.id !== currentComic.id && 
            comic.author === currentComic.author &&
            comic.status === 'Published'
        )
        .slice(0, 4);
    
    const relatedGrid = document.getElementById('related-comics-grid');
    if (!relatedGrid) return;
    
    if (relatedComics.length === 0) {
        relatedGrid.innerHTML = '<p>No other comics by this author yet.</p>';
        return;
    }
    
    relatedGrid.innerHTML = relatedComics.map(comic => createComicCard(comic)).join('');
}

function setupPageInteractions() {
    // Setup like button
    const likeBtn = document.querySelector('.btn-like');
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            const comicId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            likeComic(comicId);
        });
    }
    
    // Setup bookmark button
    const bookmarkBtn = document.querySelector('.btn-bookmark');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', function() {
            const comicId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            bookmarkComic(comicId);
        });
    }
}

function likeComic(comicId) {
    const comic = comicsManager.getComicById(comicId);
    if (!comic) return;
    
    // Check if already liked (in real app, this would be user-specific)
    const likedComics = JSON.parse(localStorage.getItem('likedComics') || '[]');
    
    if (likedComics.includes(comicId)) {
        alert('You have already liked this comic!');
        return;
    }
    
    // Add like
    comic.likes = (comic.likes || 0) + 1;
    likedComics.push(comicId);
    
    // Save changes
    comicsManager.saveComics();
    localStorage.setItem('likedComics', JSON.stringify(likedComics));
    
    // Update display
    updateMetaInfo(comic);
    
    // Visual feedback
    const likeBtn = document.querySelector('.btn-like');
    if (likeBtn) {
        likeBtn.textContent = '❤ Liked!';
        likeBtn.disabled = true;
    }
}

function bookmarkComic(comicId) {
    const bookmarkedComics = JSON.parse(localStorage.getItem('bookmarkedComics') || '[]');
    
    if (bookmarkedComics.includes(comicId)) {
        // Remove bookmark
        const index = bookmarkedComics.indexOf(comicId);
        bookmarkedComics.splice(index, 1);
        alert('Bookmark removed!');
    } else {
        // Add bookmark
        bookmarkedComics.push(comicId);
        alert('Comic bookmarked!');
    }
    
    localStorage.setItem('bookmarkedComics', JSON.stringify(bookmarkedComics));
    
    // Update button text
    const bookmarkBtn = document.querySelector('.btn-bookmark');
    if (bookmarkBtn) {
        bookmarkBtn.textContent = bookmarkedComics.includes(comicId) ? '🔖 Bookmarked' : '🔖 Bookmark';
    }
}

function trackComicView(comicId) {
    const comic = comicsManager.getComicById(comicId);
    if (!comic) return;
    
    // Increment view count
    comic.views = (comic.views || 0) + 1;
    comic.updatedAt = new Date().toISOString();
    
    // Save changes
    comicsManager.saveComics();
}

function openPageReader(pageIndex) {
    const urlParams = new URLSearchParams(window.location.search);
    const comicId = urlParams.get('comic') || getComicIdFromURL();
    
    if (comicId) {
        window.location.href = `reader.html?comic=${comicId}&page=${pageIndex + 1}`;
    }
}

function showComicNotFound() {
    document.body.innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
            <h1>Comic Not Found</h1>
            <p>The comic you're looking for doesn't exist or has been removed.</p>
            <a href="index.html" class="btn btn-primary">Go Home</a>
        </div>
    `;
}

// Utility functions
function createComicCard(comic) {
    const genreText = Array.isArray(comic.genre) ? comic.genre.join(', ') : comic.genre;
    
    return `
        <div class="content-card">
            <div class="card-image">
                <img src="${comic.coverImage}" alt="${comic.title}" loading="lazy">
                <div class="card-overlay">
                    <a href="${comic.seriesUrl}" class="btn btn-read">Read Now</a>
                </div>
            </div>
            <div class="card-info">
                <h3><a href="${comic.seriesUrl}">${comic.title}</a></h3>
                <p class="author">By ${comic.author}</p>
                <p class="genre">${genreText}</p>
            </div>
        </div>
    `;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Make functions globally available
window.likeComic = likeComic;
window.bookmarkComic = bookmarkComic;
window.openPageReader = openPageReader;