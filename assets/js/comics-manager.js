// comics-manager.js
if (!window.comicsManager) {
    class ComicsManager {
        constructor() {
            this.comics = this.loadComics();
        }
        
        loadComics() {
            const stored = localStorage.getItem('comics');
            if (stored) {
                return JSON.parse(stored);
            }
            return this.getSampleComics();
        }
        
        getSampleComics() {
            return [
                {
                    id: "comic_001",
                    title: "Mystic Chronicles",
                    author: "Alex Johnson",
                    description: "A magical adventure in a world of ancient mysteries",
                    genre: ["Fantasy", "Action"],
                    tags: ["magic", "adventure", "heroes"],
                    rating: "Teen",
                    status: "Published",
                    coverImage: "assets/images/placeholder-1.jpg",
                    pages: ["assets/images/page1.jpg", "assets/images/page2.jpg"],
                    createdAt: "2025-08-01T10:00:00Z",
                    updatedAt: "2025-08-02T15:30:00Z",
                    publishedAt: "2025-08-01T10:00:00Z",
                    views: 1250,
                    likes: 89,
                    chapters: 3,
                    seriesUrl: "series-mystic-chronicles.html"
                },
                {
                    id: "comic_002",
                    title: "Space Explorers",
                    author: "Maria Santos",
                    description: "Journey through the cosmos with brave explorers",
                    genre: ["Sci-Fi", "Adventure"],
                    tags: ["space", "exploration", "future"],
                    rating: "All Ages",
                    status: "Published",
                    coverImage: "assets/images/placeholder-2.jpg",
                    pages: ["assets/images/page1.jpg"],
                    createdAt: "2025-07-28T14:00:00Z",
                    updatedAt: "2025-08-01T09:15:00Z",
                    publishedAt: "2025-07-28T14:00:00Z",
                    views: 890,
                    likes: 67,
                    chapters: 5,
                    seriesUrl: "series-space-explorers.html"
                }
            ];
        }
        
        saveComics() {
            localStorage.setItem('comics', JSON.stringify(this.comics));
        }
        
        addComic(comicData) {
            comicData.id = 'comic_' + Date.now();
            comicData.createdAt = new Date().toISOString();
            comicData.updatedAt = new Date().toISOString();
            if (comicData.status === 'Published') {
                comicData.publishedAt = new Date().toISOString();
            }
            
            this.comics.push(comicData);
            this.saveComics();
            return comicData;
        }
        
        getRecentComics(limit = 4) {
            return this.comics
                .filter(comic => comic.status === 'Published')
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .slice(0, limit);
        }
        
        getFeaturedComics(limit = 4) {
            return this.comics
                .filter(comic => comic.status === 'Published')
                .sort((a, b) => b.views - a.views)
                .slice(0, limit);
        }
        
        getComicById(id) {
            return this.comics.find(comic => comic.id === id);
        }
    }

    // Create the global instance
    window.comicsManager = new ComicsManager();
}