class LocationManager {
    constructor() {
        this.currentLocation = null;
        this.isEnabled = false;
        this.watchId = null;
        this.dataStorage = new DataStorage();
        this.init();
    }

    init() {
        // Check if we have saved location
        const savedLocation = this.dataStorage.getLocation();
        if (savedLocation) {
            this.currentLocation = savedLocation;
            this.isEnabled = true;
            this.updateLocationDisplay();
        }
    }

    async enableLocation() {
        if (!navigator.geolocation) {
            this.showLocationError('Geolocation is not supported by this browser');
            return false;
        }

        try {
            const position = await this.getCurrentPosition();
            this.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
            };
            
            this.isEnabled = true;
            this.dataStorage.saveLocation(this.currentLocation);
            this.updateLocationDisplay();
            
            // Get location name
            await this.updateLocationName();
            
            // Generate monitoring stations for this location
            this.generateNearbyStations();
            
            // Start watching position changes
            this.startWatching();
            
            return true;
        } catch (error) {
            console.error('Error getting location:', error);
            this.showLocationError('Unable to get location. Please check your browser permissions.');
            return false;
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve, 
                reject, 
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    startWatching() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.updateLocation(position),
            (error) => console.warn('Location watch error:', error),
            { 
                enableHighAccuracy: false, // Less battery intensive
                timeout: 30000, 
                maximumAge: 600000 // 10 minutes
            }
        );
    }

    updateLocation(position) {
        const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
        };

        // Only update if location changed significantly (more than 100m)
        if (this.hasLocationChanged(newLocation)) {
            this.currentLocation = newLocation;
            this.dataStorage.saveLocation(newLocation);
            this.updateLocationName();
            this.generateNearbyStations();
        }
    }

    hasLocationChanged(newLocation) {
        if (!this.currentLocation) return true;
        
        const distance = this.calculateDistance(
            this.currentLocation.latitude,
            this.currentLocation.longitude,
            newLocation.latitude,
            newLocation.longitude
        );
        
        return distance > 0.1; // 100 meters
    }

    async updateLocationName() {
        if (!this.currentLocation) return;

        try {
            const locationName = await this.getLocationName(
                this.currentLocation.latitude,
                this.currentLocation.longitude
            );
            
            this.currentLocation.name = locationName;
            this.dataStorage.saveLocation(this.currentLocation);
            this.updateLocationDisplay();
            
        } catch (error) {
            console.error('Error getting location name:', error);
            this.currentLocation.name = `${this.currentLocation.latitude.toFixed(4)}, ${this.currentLocation.longitude.toFixed(4)}`;
            this.updateLocationDisplay();
        }
    }

    async getLocationName(latitude, longitude) {
        try {
            // Using a free reverse geocoding service
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (!response.ok) {
                throw new Error('Geocoding service unavailable');
            }
            
            const data = await response.json();
            
            // Build location string
            const parts = [];
            if (data.locality) parts.push(data.locality);
            if (data.city && data.city !== data.locality) parts.push(data.city);
            if (data.principalSubdivision) parts.push(data.principalSubdivision);
            if (data.countryName) parts.push(data.countryName);
            
            return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
            
        } catch (error) {
            console.error('Geocoding error:', error);
            return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    }

    updateLocationDisplay() {
        const locationElement = document.getElementById('currentLocation');
        const coordinatesElement = document.getElementById('coordinates');
        const locationBtn = document.getElementById('locationBtn');
        
        if (this.isEnabled && this.currentLocation) {
            locationElement.textContent = this.currentLocation.name || 'Getting location name...';
            coordinatesElement.textContent = `${this.currentLocation.latitude.toFixed(4)}, ${this.currentLocation.longitude.toFixed(4)}`;
            locationBtn.textContent = '✅ Location Enabled';
            locationBtn.disabled = true;
        } else {
            locationElement.textContent = 'Enable location to see data';
            coordinatesElement.textContent = '--';
            locationBtn.textContent = '📍 Enable Location';
            locationBtn.disabled = false;
        }
    }

    generateNearbyStations() {
        if (!this.currentLocation) return;
        
        const stations = this.dataStorage.generateMonitoringStations(
            this.currentLocation.latitude,
            this.currentLocation.longitude
        );
        
        // Notify dashboard to update stations display
        if (window.aqiDashboard) {
            window.aqiDashboard.updateMonitoringStations(stations);
        }
    }

    showLocationError(message) {
        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(45deg, #d63031, #e84393);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                font-weight: 600;
                max-width: 400px;
                text-align: center;
            ">
                ⚠️ ${message}
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    getCurrentLocation() {
        return this.currentLocation;
    }

    isLocationEnabled() {
        return this.isEnabled;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    stopWatching() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    getLocationAccuracy() {
        return this.currentLocation ? this.currentLocation.accuracy : null;
    }

    getLastLocationUpdate() {
        return this.currentLocation ? this.currentLocation.timestamp : null;
    }
}