import React from 'react';
import LoggingService from '../../services/LoggingService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
    this.logger = LoggingService.getInstance();
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log the error with detailed information
    this.logger.error(
      'Uncaught error in component',
      error,
      {
        component: this.props.componentName || 'Unknown',
        reactErrorInfo: errorInfo,
        action: 'Component Render',
        additionalInfo: {
          componentStack: errorInfo.componentStack,
          props: JSON.stringify(this.props)
        }
      }
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>We've logged the error and our team will look into it.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
