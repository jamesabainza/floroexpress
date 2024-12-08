// Browser-compatible logger
class FileLogger {
    constructor() {
        this.logStorageKey = 'app_logs';
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.logStorageKey)) {
            localStorage.setItem(this.logStorageKey, JSON.stringify({
                format_version: "1.0",
                app_name: "user-app",
                logs: []
            }));
        }
    }

    generateId() {
        return 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatAILogEntry(level, message, metadata = {}, error = null) {
        const timestamp = new Date().toISOString();
        
        return {
            log_id: this.generateId(),
            timestamp: timestamp,
            timestamp_epoch: Date.now(),
            level: level,
            message: message,
            error_data: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                type: error.constructor.name,
                additional_info: error.additionalInfo || {}
            } : null,
            context: {
                ...metadata,
                environment: process.env.NODE_ENV || 'development',
                user_agent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                memory_usage: performance.memory ? {
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    usedJSHeapSize: performance.memory.usedJSHeapSize
                } : null,
                component_hierarchy: metadata.componentStack || [],
                user_session: metadata.sessionId || null,
                user_id: metadata.userId || null,
                action_sequence: metadata.actionSequence || [],
                previous_state: metadata.previousState || null,
                current_state: metadata.currentState || null,
                data_flow: metadata.dataFlow || [],
                performance_metrics: metadata.performanceMetrics || null
            },
            categorization: {
                error_type: error?.name || null,
                component_type: metadata.componentType || null,
                operation_category: metadata.operationCategory || null,
                severity: this.calculateSeverity(level, error),
                impact_scope: metadata.impactScope || 'local'
            },
            analysis_hints: {
                requires_immediate_attention: level === 'ERROR',
                potential_root_causes: metadata.potentialCauses || [],
                related_components: metadata.relatedComponents || [],
                suggested_actions: metadata.suggestedActions || [],
                error_pattern: this.identifyErrorPattern(error, metadata)
            }
        };
    }

    calculateSeverity(level, error) {
        if (level === 'ERROR' && error?.name === 'FatalError') return 'critical';
        if (level === 'ERROR') return 'high';
        if (level === 'WARN') return 'medium';
        return 'low';
    }

    identifyErrorPattern(error, metadata) {
        if (!error) return null;
        
        const signature = {
            errorType: error.name,
            componentType: metadata.componentType,
            operationType: metadata.operationType,
            stackTrace: error.stack ? this.normalizeStackTrace(error.stack) : null
        };

        return {
            pattern_signature: JSON.stringify(signature),
            pattern_category: this.categorizeError(error, metadata),
            frequency: 'to_be_calculated',
            known_solutions: metadata.knownSolutions || []
        };
    }

    normalizeStackTrace(stack) {
        return stack
            .split('\n')
            .map(line => line.replace(/\(.*\)/g, '(***)'))
            .join('\n');
    }

    categorizeError(error, metadata) {
        // Handle case where error is undefined or null
        if (!error || !error.name) return 'general_error';
        
        const errorName = error.name.toString();
        if (errorName.includes('Network')) return 'network_error';
        if (errorName.includes('Auth')) return 'authentication_error';
        if (errorName.includes('Validation')) return 'validation_error';
        if (metadata?.componentType?.includes('API')) return 'api_error';
        return 'general_error';
    }

    async appendToStorage(logEntry) {
        try {
            const storedLogs = JSON.parse(localStorage.getItem(this.logStorageKey));
            storedLogs.logs.push(logEntry);
            
            // Keep only last 1000 logs for performance
            if (storedLogs.logs.length > 1000) {
                storedLogs.logs = storedLogs.logs.slice(-1000);
            }
            
            localStorage.setItem(this.logStorageKey, JSON.stringify(storedLogs));

            // Also send to console for development
            if (process.env.NODE_ENV === 'development') {
                console.log(`[${logEntry.level}] ${logEntry.message}`, logEntry);
            }
        } catch (error) {
            console.error('Failed to append to storage:', error);
        }
    }

    async log(level, message, metadata = {}) {
        const logEntry = this.formatAILogEntry(level, message, metadata);
        await this.appendToStorage(logEntry);
    }

    async error(message, error = null, metadata = {}) {
        const logEntry = this.formatAILogEntry('ERROR', message, metadata, error);
        await this.appendToStorage(logEntry);
    }

    async warn(message, metadata = {}) {
        const logEntry = this.formatAILogEntry('WARN', message, metadata);
        await this.appendToStorage(logEntry);
    }

    async info(message, metadata = {}) {
        const logEntry = this.formatAILogEntry('INFO', message, metadata);
        await this.appendToStorage(logEntry);
    }

    async debug(message, metadata = {}) {
        const logEntry = this.formatAILogEntry('DEBUG', message, metadata);
        await this.appendToStorage(logEntry);
    }

    async clearLogs() {
        try {
            const initialJson = {
                format_version: "1.0",
                app_name: "user-app",
                logs: []
            };
            localStorage.setItem(this.logStorageKey, JSON.stringify(initialJson));
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    }

    getLogs() {
        try {
            return JSON.parse(localStorage.getItem(this.logStorageKey));
        } catch (error) {
            console.error('Failed to get logs:', error);
            return null;
        }
    }

    exportLogs() {
        const logs = this.getLogs();
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `app_logs_${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export default new FileLogger();
