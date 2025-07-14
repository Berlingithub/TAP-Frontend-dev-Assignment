class BackgroundTaskManager {
    constructor() {
        this.taskQueue = [];
        this.isProcessing = false;
        this.maxConcurrentTasks = 3;
        this.currentTasks = 0;
    }

    addTask(task, priority = 'normal') {
        return new Promise((resolve, reject) => {
            const taskItem = {
                task,
                priority,
                resolve,
                reject,
                id: Date.now() + Math.random()
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
        this.updateProcessingStatus();

        try {
            // Use requestIdleCallback for non-urgent tasks
            if (taskItem.priority === 'low' && window.requestIdleCallback) {
                await this.runIdleTask(taskItem);
            } else {
                await this.runTask(taskItem);
            }
        } catch (error) {
            console.error('Background task error:', error);
        } finally {
            this.currentTasks--;
            this.updateProcessingStatus();
            
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
                    result.then(taskItem.resolve).catch(taskItem.reject);
                } else {
                    // Handle synchronous result
                    taskItem.resolve(result);
                }
                
                resolve();
            } catch (error) {
                taskItem.reject(error);
                reject(error);
            }
        });
    }

    runIdleTask(taskItem) {
        return new Promise((resolve) => {
            const idleCallback = (deadline) => {
                if (deadline.timeRemaining() > 0) {
                    try {
                        const result = taskItem.task();
                        
                        if (result && result.then) {
                            result.then(taskItem.resolve).catch(taskItem.reject);
                        } else {
                            taskItem.resolve(result);
                        }
                    } catch (error) {
                        taskItem.reject(error);
                    }
                    resolve();
                } else {
                    // Schedule for next idle time
                    window.requestIdleCallback(idleCallback);
                }
            };

            window.requestIdleCallback(idleCallback);
        });
    }

    updateProcessingStatus() {
        const statusElement = document.getElementById('processingStatus');
        
        if (this.currentTasks > 0) {
            statusElement.textContent = `⏳ Processing (${this.currentTasks} active)`;
        } else if (this.taskQueue.length > 0) {
            statusElement.textContent = `⏳ Queued (${this.taskQueue.length} pending)`;
        } else {
            statusElement.textContent = '✅ Ready';
        }
    }

    scheduleImageProcessing(file, options, onComplete) {
        return this.addTask(async () => {
            const canvasProcessor = new CanvasProcessor();
            const result = await canvasProcessor.processImage(file, options);
            onComplete(result);
            return result;
        }, 'normal');
    }

    scheduleLocationLookup(latitude, longitude, onComplete) {
        return this.addTask(async () => {
            const locationManager = new LocationManager();
            const locationName = await locationManager.getLocationName(latitude, longitude);
            onComplete(locationName);
            return locationName;
        }, 'low');
    }

    getQueueStatus() {
        return {
            queueLength: this.taskQueue.length,
            activeTasks: this.currentTasks,
            isProcessing: this.isProcessing
        };
    }
}