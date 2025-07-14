class BackgroundMonitor {
    constructor() {
        this.taskQueue = [];
        this.isProcessing = false;
        this.maxConcurrentTasks = 2;
        this.currentTasks = 0;
        this.dataUpdateInterval = null;
        this.updateFrequency = 30000; // 30 seconds default
    }

    addTask(task, priority = 'normal') {
        return new Promise((resolve, reject) => {
            const taskItem = {
                task,
                priority,
                resolve,
                reject,
                id: Date.now() + Math.random(),
                timestamp: Date.now()
            };

            // Insert task based on priority
            if (priority === 'high') {
                this.taskQueue.unshift(taskItem);
            } else {
                this.taskQueue.push(taskItem);
            }

            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.currentTasks >= this.maxConcurrentTasks) {
            return;
        }

        const taskItem = this.taskQueue.shift();
        if (!taskItem) {
            return;
        }

        this.currentTasks++;

        try {
            // Use requestIdleCallback for low priority tasks
            if (taskItem.priority === 'low' && window.requestIdleCallback) {
                await this.runIdleTask(taskItem);
            } else {
                await this.runTask(taskItem);
            }
        } catch (error) {
            console.error('Background task error:', error);
            taskItem.reject(error);
        } finally {
            this.currentTasks--;
            
            // Continue processing queue
            setTimeout(() => this.processQueue(), 10);
        }
    }

    runTask(taskItem) {
        return new Promise((resolve, reject) => {
            try {
                const result = taskItem.task();
                
                if (result && result.then) {
                    // Handle promise
                    result
                        .then(taskItem.resolve)
                        .catch(taskItem.reject)
                        .finally(() => resolve());
                } else {
                    // Handle synchronous result
                    taskItem.resolve(result);
                    resolve();
                }
            } catch (error) {
                taskItem.reject(error);
                reject(error);
            }
        });
    }

    runIdleTask(taskItem) {
        return new Promise((resolve) => {
            const idleCallback = (deadline) => {
                if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
                    try {
                        const result = taskItem.task();
                        
                        if (result && result.then) {
                            result
                                .then(taskItem.resolve)
                                .catch(taskItem.reject)
                                .finally(() => resolve());
                        } else {
                            taskItem.resolve(result);
                            resolve();
                        }
                    } catch (error) {
                        taskItem.reject(error);
                        resolve();
                    }
                } else {
                    // Schedule for next idle time
                    window.requestIdleCallback(idleCallback, { timeout: 5000 });
                }
            };

            window.requestIdleCallback(idleCallback, { timeout: 5000 });
        });
    }

    startDataMonitoring(updateCallback) {
        this.stopDataMonitoring(); // Clear any existing interval
        
        this.dataUpdateInterval = setInterval(() => {
            this.scheduleDataUpdate(updateCallback);
        }, this.updateFrequency);

        console.log(`📊 Background monitoring started (${this.updateFrequency}ms interval)`);
    }

    stopDataMonitoring() {
        if (this.dataUpdateInterval) {
            clearInterval(this.dataUpdateInterval);
            this.dataUpdateInterval = null;
            console.log('📊 Background monitoring stopped');
        }
    }

    updateFrequency(newFrequency) {
        this.updateFrequency = newFrequency;
        
        // Restart monitoring with new frequency
        if (this.dataUpdateInterval && window.aqiDashboard) {
            this.startDataMonitoring(() => {
                window.aqiDashboard.refreshData();
            });
        }
    }

    scheduleDataUpdate(callback) {
        return this.addTask(async () => {
            try {
                // Simulate network delay based on connection quality
                const networkManager = window.networkManager;
                const delay = this.getNetworkDelay(networkManager?.getQuality() || 'high');
                
                await this.sleep(delay);
                
                // Execute callback
                if (callback) {
                    callback();
                }
                
                console.log('📊 Background data update completed');
                return true;
            } catch (error) {
                console.error('Background data update failed:', error);
                throw error;
            }
        }, 'normal');
    }

    scheduleChartUpdate(chartRenderer, data) {
        return this.addTask(() => {
            try {
                if (data.historicalData) {
                    chartRenderer.renderAQIChart(data.historicalData);
                }
                
                if (data.pollutants) {
                    chartRenderer.renderPollutantChart(data.pollutants);
                    chartRenderer.updatePollutantValues(data.pollutants);
                }
                
                return true;
            } catch (error) {
                console.error('Chart update error:', error);
                throw error;
            }
        }, 'low');
    }

    scheduleLocationUpdate(locationManager) {
        return this.addTask(async () => {
            try {
                if (locationManager.isLocationEnabled()) {
                    await locationManager.updateLocationName();
                    locationManager.generateNearbyStations();
                }
                return true;
            } catch (error) {
                console.error('Location update error:', error);
                throw error;
            }
        }, 'low');
    }

    scheduleHealthRecommendations(aqi) {
        return this.addTask(() => {
            try {
                const dataStorage = new DataStorage();
                const recommendations = dataStorage.getHealthRecommendations(aqi);
                
                // Update health recommendations UI
                const healthAdvice = document.getElementById('healthAdvice');
                healthAdvice.innerHTML = recommendations.map(rec => `
                    <div class="advice-item">
                        <span class="advice-icon">${rec.icon}</span>
                        <span class="advice-text">${rec.text}</span>
                    </div>
                `).join('');
                
                return true;
            } catch (error) {
                console.error('Health recommendations update error:', error);
                throw error;
            }
        }, 'low');
    }

    getNetworkDelay(quality) {
        switch (quality) {
            case 'high': return 100;
            case 'medium': return 300;
            case 'low': return 800;
            case 'very-low': return 1500;
            default: return 500;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getQueueStatus() {
        return {
            queueLength: this.taskQueue.length,
            activeTasks: this.currentTasks,
            isProcessing: this.isProcessing,
            updateFrequency: this.updateFrequency
        };
    }

    // Cleanup method
    destroy() {
        this.stopDataMonitoring();
        this.taskQueue = [];
        this.currentTasks = 0;
        this.isProcessing = false;
    }
}