class PhotoGallery {
    constructor() {
        this.photos = [];
        this.networkManager = new NetworkManager();
        this.locationManager = new LocationManager();
        this.backgroundTaskManager = new BackgroundTaskManager();
        this.lazyLoadManager = new LazyLoadManager();
        this.locations = new Set();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        // Upload button
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));

        // Drag and drop
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Location button
        const locationBtn = document.getElementById('locationBtn');
        locationBtn.addEventListener('click', () => this.enableLocation());

        // Location filter
        const filterLocation = document.getElementById('filterLocation');
        filterLocation.addEventListener('change', (e) => this.filterByLocation(e.target.value));
    }

    async enableLocation() {
        const success = await this.locationManager.enableLocation();
        if (success) {
            document.getElementById('locationBtn').textContent = '✅ Location Enabled';
        }
    }

    async handleFileUpload(files) {
        if (files.length === 0) return;

        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.classList.add('show');

        try {
            const fileArray = Array.from(files);
            const validFiles = fileArray.filter(file => file.type.startsWith('image/'));

            if (validFiles.length === 0) {
                alert('Please select valid image files');
                return;
            }

            // Process files in background
            const processPromises = validFiles.map(file => this.processFile(file));
            await Promise.all(processPromises);

            this.updateStats();
            this.updateLocationFilter();
            
        } catch (error) {
            console.error('Error processing files:', error);
            alert('Error processing some files. Please try again.');
        } finally {
            loadingIndicator.classList.remove('show');
        }
    }

    async processFile(file) {
        // Get network-appropriate dimensions and quality
        const dimensions = this.networkManager.getImageDimensions();
        const quality = this.networkManager.getCompressionLevel();

        // Schedule image processing in background
        return this.backgroundTaskManager.scheduleImageProcessing(
            file,
            {
                maxWidth: dimensions.width,
                maxHeight: dimensions.height,
                quality: quality
            },
            (processedImage) => {
                this.createPhotoEntry(file, processedImage);
            }
        );
    }

    async createPhotoEntry(originalFile, processedImage) {
        const photoData = {
            id: Date.now() + Math.random(),
            name: originalFile.name,
            size: this.formatFileSize(processedImage.size),
            date: new Date().toLocaleDateString(),
            url: URL.createObjectURL(processedImage.blob),
            originalSize: originalFile.size,
            processedSize: processedImage.size,
            dimensions: `${processedImage.width}x${processedImage.height}`,
            location: null,
            latitude: null,
            longitude: null
        };

        // Get location if enabled
        if (this.locationManager.isLocationEnabled()) {
            const location = this.locationManager.getCurrentLocation();
            if (location) {
                photoData.latitude = location.latitude;
                photoData.longitude = location.longitude;
                
                // Get location name in background
                this.backgroundTaskManager.scheduleLocationLookup(
                    location.latitude,
                    location.longitude,
                    (locationName) => {
                        photoData.location = locationName;
                        this.locations.add(locationName);
                        this.updateLocationFilter();
                        this.updatePhotoLocation(photoData.id, locationName);
                    }
                );
            }
        }

        this.photos.push(photoData);
        this.renderPhoto(photoData);
    }

    renderPhoto(photoData) {
        const gallery = document.getElementById('gallery');
        const photoElement = this.lazyLoadManager.createLazyPhotoElement(photoData);
        
        gallery.appendChild(photoElement);
        
        // Observe element for lazy loading
        this.lazyLoadManager.observe(photoElement);
    }

    updatePhotoLocation(photoId, locationName) {
        const photo = this.photos.find(p => p.id === photoId);
        if (photo) {
            photo.location = locationName;
            
            // Update the UI
            const photoElements = document.querySelectorAll('.photo-item');
            photoElements.forEach(element => {
                const nameElement = element.querySelector('.photo-name');
                if (nameElement && nameElement.textContent === photo.name) {
                    const locationElement = element.querySelector('.photo-location');
                    if (locationElement) {
                        locationElement.textContent = `📍 ${locationName}`;
                    }
                }
            });
        }
    }

    filterByLocation(location) {
        const photoElements = document.querySelectorAll('.photo-item');
        
        photoElements.forEach(element => {
            const locationElement = element.querySelector('.photo-location');
            const photoLocation = locationElement ? locationElement.textContent.replace('📍 ', '') : '';
            
            if (location === '' || photoLocation === location) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }

    updateLocationFilter() {
        const filterSelect = document.getElementById('filterLocation');
        const currentValue = filterSelect.value;
        
        // Clear existing options except "All Locations"
        filterSelect.innerHTML = '<option value="">All Locations</option>';
        
        // Add location options
        this.locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            filterSelect.appendChild(option);
        });
        
        // Restore previous selection if it still exists
        if (currentValue && this.locations.has(currentValue)) {
            filterSelect.value = currentValue;
        }
    }

    updateStats() {
        const totalPhotos = document.getElementById('totalPhotos');
        totalPhotos.textContent = this.photos.length;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Utility methods for photo management
    getPhotos() {
        return this.photos;
    }

    getPhotosByLocation(location) {
        return this.photos.filter(photo => photo.location === location);
    }

    deletePhoto(photoId) {
        const index = this.photos.findIndex(photo => photo.id === photoId);
        if (index > -1) {
            // Revoke object URL to free memory
            URL.revokeObjectURL(this.photos[index].url);
            this.photos.splice(index, 1);
            this.updateStats();
        }
    }

    clearAllPhotos() {
        // Revoke all object URLs
        this.photos.forEach(photo => {
            URL.revokeObjectURL(photo.url);
        });
        
        this.photos = [];
        this.locations.clear();
        
        // Clear gallery
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';
        
        // Update UI
        this.updateStats();
        this.updateLocationFilter();
    }
}