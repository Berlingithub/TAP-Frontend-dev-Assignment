class StationObserver {
    constructor() {
        this.observer = null;
        this.observedStations = new Set();
        this.loadedStations = new Set();
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if (!window.IntersectionObserver) {
            console.warn('Intersection Observer not supported, using fallback loading');
            return;
        }

        // Create observer with options
        const options = {
            root: null, // Use viewport as root
            rootMargin: '100px', // Load stations 100px before they come into view
            threshold: 0.1 // Trigger when 10% of element is visible
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadStation(entry.target);
                    this.observer.unobserve(entry.target);
                    this.observedStations.delete(entry.target);
                }
            });
        }, options);
    }

    observe(stationElement) {
        if (!this.observer) {
            // Fallback for browsers without Intersection Observer
            this.loadStation(stationElement);
            return;
        }

        this.observer.observe(stationElement);
        this.observedStations.add(stationElement);
    }

    loadStation(stationElement) {
        const stationId = stationElement.dataset.stationId;
        
        if (this.loadedStations.has(stationId)) {
            return; // Already loaded
        }

        // Simulate loading delay
        setTimeout(() => {
            // Add loaded class for animation
            stationElement.classList.add('loaded');
            
            // Mark as loaded
            this.loadedStations.add(stationId);
            
            // Update station data if needed
            this.updateStationData(stationElement);
            
        }, Math.random() * 500 + 200); // Random delay between 200-700ms
    }

    updateStationData(stationElement) {
        const stationAQI = stationElement.querySelector('.station-aqi');
        const stationStatus = stationElement.querySelector('.station-status');
        
        if (stationAQI && stationStatus) {
            const aqiValue = parseInt(stationAQI.textContent);
            const dataStorage = new DataStorage();
            const aqiInfo = dataStorage.getAQICategory(aqiValue);
            
            // Apply AQI category styling
            stationAQI.className = `station-aqi ${aqiInfo.class}`;
            stationStatus.textContent = aqiInfo.category;
            
            // Add hover effects
            this.addStationInteractions(stationElement);
        }
    }

    addStationInteractions(stationElement) {
        const stationCard = stationElement;
        
        // Add click handler for detailed view
        stationCard.addEventListener('click', () => {
            this.showStationDetails(stationElement);
        });
        
        // Add hover effects
        stationCard.addEventListener('mouseenter', () => {
            this.highlightStation(stationElement);
        });
        
        stationCard.addEventListener('mouseleave', () => {
            this.unhighlightStation(stationElement);
        });
    }

    showStationDetails(stationElement) {
        const stationName = stationElement.querySelector('.station-name').textContent;
        const stationDistance = stationElement.querySelector('.station-distance').textContent;
        const stationAQI = stationElement.querySelector('.station-aqi').textContent;
        const stationStatus = stationElement.querySelector('.station-status').textContent;
        
        // Create modal or detailed view
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            " onclick="this.remove()">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                " onclick="event.stopPropagation()">
                    <h3 style="margin-bottom: 20px; color: #2d3436;">${stationName}</h3>
                    <div style="margin-bottom: 15px;">
                        <strong>Distance:</strong> ${stationDistance}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Current AQI:</strong> ${stationAQI}
                    </div>
                    <div style="margin-bottom: 20px;">
                        <strong>Status:</strong> ${stationStatus}
                    </div>
                    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong>Last Updated:</strong> ${new Date().toLocaleTimeString()}<br>
                        <strong>Data Quality:</strong> High<br>
                        <strong>Sensor Type:</strong> Environmental Monitor
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: linear-gradient(45deg, #74b9ff, #6c5ce7);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        width: 100%;
                    ">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    highlightStation(stationElement) {
        stationElement.style.transform = 'translateY(-5px) scale(1.02)';
        stationElement.style.boxShadow = '0 8px 25px rgba(116, 185, 255, 0.3)';
        stationElement.style.borderLeft = '4px solid #74b9ff';
    }

    unhighlightStation(stationElement) {
        stationElement.style.transform = 'translateY(0) scale(1)';
        stationElement.style.boxShadow = '';
        stationElement.style.borderLeft = '4px solid #74b9ff';
    }

    createStationElement(stationData) {
        const stationElement = document.createElement('div');
        stationElement.className = 'station-card';
        stationElement.dataset.stationId = stationData.id;
        
        const dataStorage = new DataStorage();
        const aqiInfo = dataStorage.getAQICategory(stationData.aqi);
        
        stationElement.innerHTML = `
            <div class="station-name">${stationData.name}</div>
            <div class="station-distance">📍 ${stationData.distance} km away</div>
            <div class="station-aqi ${aqiInfo.class}">${stationData.aqi}</div>
            <div class="station-status">${stationData.status === 'active' ? aqiInfo.category : 'Under Maintenance'}</div>
        `;

        return stationElement;
    }

    renderStations(stations) {
        const stationsGrid = document.getElementById('stationsGrid');
        stationsGrid.innerHTML = '';

        stations.forEach(station => {
            const stationElement = this.createStationElement(station);
            stationsGrid.appendChild(stationElement);
            
            // Observe for lazy loading
            this.observe(stationElement);
        });
    }

    unobserve(element) {
        if (this.observer && this.observedStations.has(element)) {
            this.observer.unobserve(element);
            this.observedStations.delete(element);
        }
    }

    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
            this.observedStations.clear();
        }
    }

    // Utility method to refresh station data
    refreshStations() {
        this.loadedStations.clear();
        
        // Re-observe all station elements
        const stationElements = document.querySelectorAll('.station-card');
        stationElements.forEach(element => {
            element.classList.remove('loaded');
            this.observe(element);
        });
    }

    getLoadedStationsCount() {
        return this.loadedStations.size;
    }

    getTotalStationsCount() {
        return document.querySelectorAll('.station-card').length;
    }
}