import { v4 as uuidv4 } from 'uuid';
import FileLogger from '../utils/FileLogger';

class LoggingService {
  static logLevels = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
  };

  static instance = null;

  constructor() {
    if (LoggingService.instance) {
      return LoggingService.instance;
    }
    LoggingService.instance = this;
    this.logs = [];
    this.errorCallbacks = [];
  }

  static getInstance() {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  formatError(error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error.code && { code: error.code }),
      ...(error.response && { 
        response: {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        }
      })
    };
  }

  createLogEntry(level, message, error = null, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logId = uuidv4();
    
    const logEntry = {
      id: logId,
      timestamp,
      level,
      message,
      metadata: {
        ...metadata,
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        component: metadata.component || 'Unknown',
        action: metadata.action || 'Unknown',
        userId: metadata.userId || 'Unknown',
        sessionId: metadata.sessionId || 'Unknown'
      }
    };

    if (error) {
      logEntry.error = this.formatError(error);
    }

    return logEntry;
  }

  async persistLog(logEntry) {
    // Store in memory
    this.logs.push(logEntry);

    // Store in localStorage with rotation
    try {
      const storedLogs = JSON.parse(localStorage.getItem('appLogs') || '[]');
      storedLogs.push(logEntry);
      if (storedLogs.length > 1000) {
        storedLogs.shift(); // Remove oldest log
      }
      localStorage.setItem('appLogs', JSON.stringify(storedLogs));
    } catch (e) {
      console.error('Failed to persist log to localStorage:', e);
    }

    // Write to file
    try {
      if (logEntry.level === LoggingService.logLevels.ERROR) {
        await FileLogger.error(logEntry.message, logEntry.error, logEntry.metadata);
      } else if (logEntry.level === LoggingService.logLevels.WARN) {
        await FileLogger.warn(logEntry.message, logEntry.metadata);
      } else if (logEntry.level === LoggingService.logLevels.INFO) {
        await FileLogger.info(logEntry.message, logEntry.metadata);
      } else if (logEntry.level === LoggingService.logLevels.DEBUG) {
        await FileLogger.debug(logEntry.message, logEntry.metadata);
      }
    } catch (e) {
      console.error('Failed to write to log file:', e);
    }

    // If it's an error, notify error callbacks
    if (logEntry.level === LoggingService.logLevels.ERROR) {
      this.notifyErrorCallbacks(logEntry);
    }

    // In production, you might want to send to a logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }
  }

  async sendToLoggingService(logEntry) {
    try {
      // Example: Send to your logging endpoint
      // await fetch('your-logging-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // });
    } catch (e) {
      console.error('Failed to send log to logging service:', e);
    }
  }

  error(message, error = null, metadata = {}) {
    const logEntry = this.createLogEntry(
      LoggingService.logLevels.ERROR,
      message,
      error,
      metadata
    );
    this.persistLog(logEntry);
    return logEntry.id;
  }

  warn(message, metadata = {}) {
    const logEntry = this.createLogEntry(
      LoggingService.logLevels.WARN,
      message,
      null,
      metadata
    );
    this.persistLog(logEntry);
    return logEntry.id;
  }

  info(message, metadata = {}) {
    const logEntry = this.createLogEntry(
      LoggingService.logLevels.INFO,
      message,
      null,
      metadata
    );
    this.persistLog(logEntry);
    return logEntry.id;
  }

  debug(message, metadata = {}) {
    const logEntry = this.createLogEntry(
      LoggingService.logLevels.DEBUG,
      message,
      null,
      metadata
    );
    this.persistLog(logEntry);
    return logEntry.id;
  }

  // Subscribe to error notifications
  onError(callback) {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  notifyErrorCallbacks(logEntry) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(logEntry);
      } catch (e) {
        console.error('Error in error callback:', e);
      }
    });
  }

  // Get logs with filtering
  getLogs({
    level = null,
    startTime = null,
    endTime = null,
    component = null,
    userId = null,
    limit = 100
  } = {}) {
    let filteredLogs = [...this.logs];

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (startTime) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startTime));
    }

    if (endTime) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endTime));
    }

    if (component) {
      filteredLogs = filteredLogs.filter(log => log.metadata.component === component);
    }

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.metadata.userId === userId);
    }

    return filteredLogs.slice(-limit);
  }

  // Clear logs (useful for testing)
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('appLogs');
  }

  // Export logs for debugging
  exportLogs() {
    return {
      logs: this.logs,
      exportTime: new Date().toISOString(),
      totalCount: this.logs.length
    };
  }
}

export default LoggingService;
