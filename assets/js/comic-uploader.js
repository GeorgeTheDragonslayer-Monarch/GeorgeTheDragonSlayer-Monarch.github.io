// Comic Uploader JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('comic-pages-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const dragDropZone = document.getElementById('drag-drop-zone');
    const pagesPreview = document.getElementById('pages-preview');
    const pagesGrid = document.getElementById('pages-grid');
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const titleInput = document.getElementById('content-title');
    const editorTitle = document.getElementById('editor-title');
    
    let uploadedFiles = [];
    let currentComicData = {
        title: '',
        genre: [],
        tags: '',
        rating: '',
        status: 'draft',
        pages: []
    };

    // Update editor title when content title changes
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            const title = this.value || 'Upload Comic';
            editorTitle.textContent = title;
            currentComicData.title = this.value;
        });
    }

    // File selection button click
    selectFilesBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });

    // Drag and drop functionality
    dragDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dragDropZone.classList.add('drag-over');
    });

    dragDropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dragDropZone.classList.remove('drag-over');
    });

    dragDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dragDropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    // Handle file uploads
    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            return file.type === 'image/jpeg' || file.type === 'image/jpg';
        });

        if (validFiles.length === 0) {
            alert('Please select only JPG files.');
            return;
        }

        if (validFiles.length !== files.length) {
            alert('Some files were skipped. Only JPG files are allowed.');
        }

        // Add files to uploaded files array
        validFiles.forEach(file => {
            const fileData = {
                file: file,
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                preview: null
            };
            uploadedFiles.push(fileData);
        });

        // Generate previews
        generatePreviews();
        showPreviewSection();
    }

    // Generate preview thumbnails
    function generatePreviews() {
        pagesGrid.innerHTML = '';

        uploadedFiles.forEach((fileData, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                fileData.preview = e.target.result;
                createPagePreview(fileData, index);
            };
            reader.readAsDataURL(fileData.file);
        });
    }

    // Create individual page preview
    function createPagePreview(fileData, index) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-preview';
        pageDiv.dataset.fileId = fileData.id;
        
        pageDiv.innerHTML = `
            <div class="page-thumbnail">
                <img src="${fileData.preview}" alt="Page ${index + 1}">
                <div class="page-overlay">
                    <span class="page-number">Page ${index + 1}</span>
                    <button class="delete-page-btn" onclick="deletePage('${fileData.id}')">×</button>
                </div>
            </div>
            <div class="page-info">
                <p class="page-name">${fileData.name}</p>
                <p class="page-size">${formatFileSize(fileData.size)}</p>
            </div>
        `;

        pagesGrid.appendChild(pageDiv);
    }

    // Show preview section
    function showPreviewSection() {
        if (uploadedFiles.length > 0) {
            pagesPreview.style.display = 'block';
        } else {
            pagesPreview.style.display = 'none';
        }
    }

    // Delete page function
    window.deletePage = function(fileId) {
        uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
        generatePreviews();
        showPreviewSection();
        updatePageNumbers();
    };

    // Update page numbers after deletion
    function updatePageNumbers() {
        const pageElements = pagesGrid.querySelectorAll('.page-preview');
        pageElements.forEach((element, index) => {
            const pageNumber = element.querySelector('.page-number');
            if (pageNumber) {
                pageNumber.textContent = `Page ${index + 1}`;
            }
        });
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Collect form data
    function collectFormData() {
        const formData = {
            title: document.getElementById('content-title')?.value || '',
            contentType: document.getElementById('content-type')?.value || 'comic',
            status: document.getElementById('content-status')?.value || 'draft',
            genre: Array.from(document.getElementById('content-genre')?.selectedOptions || []).map(option => option.value),
            tags: document.getElementById('content-tags')?.value || '',
            rating: document.getElementById('content-rating')?.value || 'all-ages',
            pages: uploadedFiles
        };
        return formData;
    }

    // Save draft functionality
    document.querySelector('.save-draft-btn')?.addEventListener('click', function() {
        const comicData = collectFormData();
        if (comicData.title && uploadedFiles.length > 0) {
            // Simulate saving
            showProgress('Saving draft...');
            setTimeout(() => {
                hideProgress();
                alert('Draft saved successfully!');
            }, 2000);
        } else {
            alert('Please add a title and upload at least one page.');
        }
    });

    // Publish functionality
    document.querySelector('.publish-btn')?.addEventListener('click', function() {
        const comicData = collectFormData();
        if (comicData.title && uploadedFiles.length > 0) {
            // Simulate publishing
            showProgress('Publishing comic...');
            setTimeout(() => {
                hideProgress();
                alert('Comic published successfully!');
                // Here you would typically redirect to the new comic page
            }, 3000);
        } else {
            alert('Please add a title and upload at least one page before publishing.');
        }
    });

    // Preview functionality
    document.querySelector('.preview-btn')?.addEventListener('click', function() {
        const comicData = collectFormData();
        if (comicData.title && uploadedFiles.length > 0) {
            // Open preview in new window/tab
            alert('Preview functionality would open a preview of your comic.');
        } else {
            alert('Please add a title and upload at least one page to preview.');
        }
    });

    // Show progress
    function showProgress(text) {
        progressText.textContent = text;
        uploadProgress.style.display = 'block';
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressFill.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 200);
    }

    // Hide progress
    function hideProgress() {
        uploadProgress.style.display = 'none';
        progressFill.style.width = '0%';
    }
});

// Add CSS styles for the comic uploader
const style = document.createElement('style');
style.textContent = `
    .drag-drop-zone {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        background-color: #f9f9f9;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .drag-drop-zone:hover,
    .drag-drop-zone.drag-over {
        border-color: #007cba;
        background-color: #f0f8ff;
    }

    .upload-prompt p {
        color: #666;
        font-size: 16px;
    }

    .pages-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .page-preview {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
    }

    .page-preview:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .page-thumbnail {
        position: relative;
        height: 150px;
        overflow: hidden;
    }

    .page-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .page-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .page-preview:hover .page-overlay {
        opacity: 1;
    }

    .page-number {
        color: white;
        font-weight: bold;
        font-size: 14px;
    }

    .delete-page-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
    }

    .delete-page-btn:hover {
        background: #cc0000;
    }

    .page-info {
        padding: 10px;
    }

    .page-name {
        font-size: 12px;
        color: #333;
        margin: 0 0 5px 0;
        word-break: break-word;
    }

    .page-size {
        font-size: 11px;
        color: #666;
        margin: 0;
    }

    .progress-bar {
        width: 100%;
        height: 20px;
        background-color: #f0f0f0;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 10px;
    }

    .progress {
        height: 100%;
        background-color: #007cba;
        transition: width 0.3s ease;
    }

    .progress-text {
        text-align: center;
        color: #666;
        font-size: 14px;
        margin: 0;
    }

    .upload-header h3 {
        color: #333;
        margin-bottom: 10px;
    }

    .upload-header p {
        color: #666;
        margin-bottom: 20px;
    }
`;
document.head.appendChild(style);

