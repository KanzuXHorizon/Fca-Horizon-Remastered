/* eslint-disable linebreak-style */
const fs = require('fs');
const path = require('path');
const v8 = require('v8');
const EventEmitter = require('events');

class MemoryManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.thresholds = {
      warning: options.warningThreshold || 0.7,
      release: options.releaseThreshold || 0.8,
      max: options.maxThreshold || 0.9,
    };
    this.interval = options.interval || 5000;
    this.logLevel = options.logLevel || 'info';
    this.logFile = options.logFile || path.join(__dirname, 'memory.log');
    this.allowLog = options.allowLog || true;
    this.weakRefs = new WeakMap();
    this.smartReleaseEnabled = options.smartReleaseEnabled || false;
    this.memoryUsageHistory = [];
  }

  start() {
    this.intervalId = setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      this.logMemoryUsage(memoryUsage);

      if (memoryUsage > this.thresholds.warning) {
        this.emit('memoryWarning', memoryUsage);
      }

      if (memoryUsage > this.thresholds.release) {
        this.releaseMemory(memoryUsage);
      }

      if (memoryUsage > this.thresholds.max) {
        this.emit('memoryMax', memoryUsage);
      }

      if (this.smartReleaseEnabled) {
        this.memoryUsageHistory.push(memoryUsage);
        this.smartRelease();
      }
    }, this.interval);
  }

  stop() {
    clearInterval(this.intervalId);
  }

  getMemoryUsage() {
    const heapStats = v8.getHeapStatistics();
    const totalHeapSize = heapStats.total_available_size / 1024 / 1024;
    const usedHeapSize = heapStats.used_heap_size / 1024 / 1024;
    return usedHeapSize / totalHeapSize;
  }

  releaseMemory(memoryUsage) {
    if (global.gc) {
      global.gc();
    } else {
      v8.setFlagsFromString('--expose_gc');
      const vm = require('vm');
      vm.runInNewContext('gc')();
    }
    this.emit('memoryReleased', memoryUsage);
  }

  logMemoryUsage(memoryUsage) {
    const timestamp = new Date().toLocaleString("vi-vn", {timeZone: "Asia/Ho_Chi_Minh"});
    const logMessage = `${timestamp} - Memory usage: ${(memoryUsage * 100).toFixed(2)}%`;

    switch (this.logLevel) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        global.Fca.Require.logger.Info(logMessage);
        break;
      case 'warn':
        global.Fca.Require.logger.Normal(logMessage);
        break;
      case 'error':
        global.Fca.Require.logger.Error(logMessage);
        break;
      default:
        global.Fca.Require.logger.Normal(logMessage);
    }
    if (this.allowLog) {
      fs.appendFile(this.logFile, `${logMessage}\n`, (err) => {
        if (err) throw err;
      });
    }
  }

  onMaxMemory(callback) {
    this.on('memoryMax', callback);
  }

  addMemoryUsageListener(callback) {
    this.on('memoryWarning', callback);
    this.on('memoryReleased', callback);
    this.on('memoryMax', callback);
  }

  removeMemoryUsageListener(callback) {
    this.off('memoryWarning', callback);
    this.off('memoryReleased', callback);
    this.off('memoryMax', callback);
  }

  addThreshold(type, value) {
    if (type === 'warning' || type === 'release' || type === 'max') {
      this.thresholds[type] = value;
    } else {
      throw new Error('Invalid threshold type');
    }
  }

  removeThreshold(type) {
    if (type === 'warning' || type === 'release' || type === 'max') {
      delete this.thresholds[type];
    } else {
      throw new Error('Invalid threshold type');
    }
  }

  smartRelease() {
    const memoryUsageHistory = this.memoryUsageHistory.slice(-100);
    const averageUsage = memoryUsageHistory.reduce((sum, usage) => sum + usage, 0) / memoryUsageHistory.length;
    const maxUsage = Math.max(...memoryUsageHistory);

    if (averageUsage > this.thresholds.release && maxUsage > this.thresholds.max) {
      this.releaseMemory(maxUsage);
    }
  }

  autoStart(interval) { //1h
    this.stopMemoryManager();
    this.startMemoryManager();
    this.autoStartInterval = setInterval(() => {
      this.stopMemoryManager();
      this.startMemoryManager();
    }, interval);
  }

  stopMemoryManager() {
    this.stop();
    clearInterval(this.intervalId);
    clearInterval(this.autoStartInterval);
  }
  
  startMemoryManager() {
    this.start();
  }

}

module.exports = MemoryManager;