import FileLogger from './FileLogger';

async function testLogging() {
    try {
        // Test info logging
        await FileLogger.info('Application started', {
            componentType: 'System',
            operationCategory: 'Startup',
            performanceMetrics: {
                startupTime: 1200
            }
        });

        // Test warning logging
        await FileLogger.warn('High memory usage detected', {
            componentType: 'SystemMonitor',
            operationCategory: 'ResourceMonitoring',
            performanceMetrics: {
                threshold: '80%'
            },
            potentialCauses: ['Memory leak', 'Too many concurrent operations']
        });

        // Simulate API error
        try {
            throw new Error('API endpoint /users/authenticate not responding');
        } catch (error) {
            error.name = 'NetworkError';
            error.additionalInfo = {
                endpoint: '/users/authenticate',
                responseTime: 5000,
                httpStatus: 503
            };
            await FileLogger.error('Failed to authenticate user', error, {
                componentType: 'APIClient',
                operationCategory: 'Authentication',
                userId: 'user123',
                sessionId: 'sess_abc123',
                actionSequence: ['FORM_SUBMIT', 'API_CALL', 'TIMEOUT'],
                previousState: { isLoading: true, user: null },
                currentState: { isLoading: false, error: 'Network timeout' },
                impactScope: 'user',
                potentialCauses: ['Server down', 'Network issues', 'Rate limiting'],
                suggestedActions: ['Retry with exponential backoff', 'Check server status']
            });
        }

        // Simulate validation error
        try {
            throw new Error('Invalid email format');
        } catch (error) {
            error.name = 'ValidationError';
            error.additionalInfo = {
                field: 'email',
                value: 'invalid@email',
                constraints: ['email', 'required']
            };
            await FileLogger.error('Form validation failed', error, {
                componentType: 'LoginForm',
                operationCategory: 'UserInput',
                componentStack: ['App', 'Login', 'LoginForm', 'EmailInput'],
                dataFlow: ['UserInput', 'Validation', 'Error'],
                potentialCauses: ['User input error', 'Client-side validation'],
                suggestedActions: ['Show error message', 'Highlight field']
            });
        }

        // Test debug logging
        await FileLogger.debug('Render performance metrics', {
            componentType: 'PerformanceMonitor',
            operationCategory: 'Monitoring',
            performanceMetrics: {
                renderTime: 50,
                componentCount: 15,
                rerenderedComponents: ['UserList', 'SearchBar']
            }
        });

        // Simulate authentication error
        try {
            throw new Error('Invalid credentials');
        } catch (error) {
            error.name = 'AuthenticationError';
            error.additionalInfo = {
                attempts: 3,
                lockoutStatus: 'warning'
            };
            await FileLogger.error('Login failed', error, {
                componentType: 'AuthService',
                operationCategory: 'Authentication',
                userId: 'user456',
                sessionId: 'sess_def456',
                actionSequence: ['LOGIN_ATTEMPT', 'CREDENTIALS_CHECK', 'FAILURE'],
                impactScope: 'user',
                potentialCauses: ['Wrong password', 'Account locked'],
                suggestedActions: ['Reset password', 'Contact support']
            });
        }

        console.log('Test logging completed successfully');
        
        // Export logs to file
        FileLogger.exportLogs();
    } catch (error) {
        console.error('Failed to run test logging:', error);
    }
}

export default testLogging;
