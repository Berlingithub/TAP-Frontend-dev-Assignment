class LazyLoadManager {
    constructor() {
        this.observer = null;
        this.observedElements = new Set();
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if (!window.IntersectionObserver) {
            console.warn('Intersection Observer not supported, falling back to eager loading');
            return;
        }

        // Create observer with options
        const options = {
            root: null, // Use viewport as root
            rootMargin: '50px', // Load images 50px before they come into view
            threshold: 0.1 // Trigger when 10% of element is visible
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                    this.observer.unobserve(entry.target);
                    this.observedElements.delete(entry.target);
                }
            });
        }, options);
    }

    observe(element) {
        if (!this.observer) {
            // Fallback for browsers without Intersection Observer
            this.loadElement(element);
            return;
        }

        this.observer.observe(element);
        this.observedElements.add(element);
    }

    loadElement(element) {
        const photoImg = element.querySelector('.photo-img');
        const placeholder = element.querySelector('.photo-placeholder');
        
        if (photoImg && placeholder) {
            const imageSrc = photoImg.dataset.src;
            
            if (imageSrc) {
                // Create new image to preload
                const img = new Image();
                
                img.onload = () => {
                    // Image loaded successfully
                    photoImg.src = imageSrc;
                    photoImg.style.display = 'block';
                    placeholder.style.display = 'none';
                    
                    // Add loaded class for animation
                    setTimeout(() => {
                        element.classList.add('loaded');
                    }, 100);
                };
                
                img.onerror = () => {
                    // Error loading image
                    placeholder.innerHTML = '❌<br>Failed to load';
                    placeholder.style.color = '#ef4444';
                };
                
                img.src = imageSrc;
            }
        }
    }

    unobserve(element) {
        if (this.observer && this.observedElements.has(element)) {
            this.observer.unobserve(element);
            this.observedElements.delete(element);
        }
    }

    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
            this.observedElements.clear();
        }
    }

    // Utility method to create lazy-loaded photo elements
    createLazyPhotoElement(photoData) {
        const photoElement = document.createElement('div');
        photoElement.className = 'photo-item';
        
        photoElement.innerHTML = `
            <div class="photo-container">
                <div class="photo-placeholder">
                    📷<br>Loading...
                </div>
                <img class="photo-img" data-src="${photoData.url}" alt="${photoData.name}" style="display: none;">
                <div class="photo-overlay">
                    <div class="photo-location">📍 ${photoData.location || 'Unknown'}</div>
                </div>
            </div>
            <div class="photo-info">
                <div class="photo-name">${photoData.name}</div>
                <div class="photo-details">
                    <span>📅 ${photoData.date}</span>
                    <span>📏 ${photoData.size}</span>
                </div>
                <div class="photo-filters">
                    <button class="filter-btn" data-filter="grayscale">B&W</button>
                    <button class="filter-btn" data-filter="sepia">Sepia</button>
                    <button class="filter-btn" data-filter="brightness">Bright</button>
                    <button class="filter-btn" data-filter="contrast">Contrast</button>
                </div>
            </div>
        `;

        // Add filter button listeners
        const filterButtons = photoElement.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.applyFilter(photoElement, btn.dataset.filter);
            });
        });

        return photoElement;
    }

    async applyFilter(photoElement, filterType) {
        const img = photoElement.querySelector('.photo-img');
        const originalSrc = img.dataset.originalSrc || img.src;
        
        // Store original source if not already stored
        if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = originalSrc;
        }
        
        // Show loading state
        const placeholder = photoElement.querySelector('.photo-placeholder');
        placeholder.style.display = 'block';
        placeholder.innerHTML = '⏳<br>Applying filter...';
        img.style.display = 'none';
        
        try {
            // Convert image to blob for processing
            const response = await fetch(originalSrc);
            const blob = await response.blob();
            
            // Apply filter using Canvas API
            const canvasProcessor = new CanvasProcessor();
            const filteredBlob = await canvasProcessor.applyFilter(blob, filterType);
            
            // Update image source
            const filteredUrl = URL.createObjectURL(filteredBlob);
            img.src = filteredUrl;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            
            // Update button states
            const filterButtons = photoElement.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filterType);
            });
            
        } catch (error) {
            console.error('Error applying filter:', error);
            placeholder.innerHTML = '❌<br>Filter error';
            placeholder.style.color = '#ef4444';
        }
    }
}