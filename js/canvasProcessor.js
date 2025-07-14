class CanvasProcessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async processImage(file, options = {}) {
        const {
            maxWidth = 800,
            maxHeight = 600,
            quality = 0.9,
            format = 'image/jpeg'
        } = options;

        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    // Calculate new dimensions
                    const { width, height } = this.calculateDimensions(
                        img.width, 
                        img.height, 
                        maxWidth, 
                        maxHeight
                    );

                    // Set canvas size
                    this.canvas.width = width;
                    this.canvas.height = height;

                    // Clear canvas
                    this.ctx.clearRect(0, 0, width, height);

                    // Draw image
                    this.ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    this.canvas.toBlob((blob) => {
                        if (blob) {
                            resolve({
                                blob,
                                width,
                                height,
                                originalWidth: img.width,
                                originalHeight: img.height,
                                size: blob.size
                            });
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    }, format, quality);
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth;
        let height = originalHeight;

        // Calculate aspect ratio
        const aspectRatio = originalWidth / originalHeight;

        // Resize based on max dimensions
        if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
        }

        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    async createThumbnail(file, size = 200) {
        return this.processImage(file, {
            maxWidth: size,
            maxHeight: size,
            quality: 0.8
        });
    }

    async applyFilter(imageData, filterType) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        
        const img = new Image();
        
        return new Promise((resolve) => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                switch (filterType) {
                    case 'grayscale':
                        this.applyGrayscale(data);
                        break;
                    case 'sepia':
                        this.applySepia(data);
                        break;
                    case 'brightness':
                        this.applyBrightness(data, 1.2);
                        break;
                    case 'contrast':
                        this.applyContrast(data, 1.5);
                        break;
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.9);
            };
            
            img.src = URL.createObjectURL(imageData);
        });
    }

    applyGrayscale(data) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }

    applySepia(data) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
    }

    applyBrightness(data, factor) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);
            data[i + 1] = Math.min(255, data[i + 1] * factor);
            data[i + 2] = Math.min(255, data[i + 2] * factor);
        }
    }

    applyContrast(data, factor) {
        const intercept = 128 * (1 - factor);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, data[i] * factor + intercept));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor + intercept));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor + intercept));
        }
    }
}