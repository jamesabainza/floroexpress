import { useCallback } from 'react';
import LoggingService from '../services/LoggingService';

const useErrorLogging = (componentName) => {
  const logger = LoggingService.getInstance();

  const logError = useCallback((error, action, additionalMetadata = {}) => {
    return logger.error(
      `Error in ${componentName}: ${error.message}`,
      error,
      {
        component: componentName,
        action,
        ...additionalMetadata
      }
    );
  }, [componentName]);

  const logWarning = useCallback((message, action, additionalMetadata = {}) => {
    return logger.warn(
      message,
      {
        component: componentName,
        action,
        ...additionalMetadata
      }
    );
  }, [componentName]);

  const logInfo = useCallback((message, action, additionalMetadata = {}) => {
    return logger.info(
      message,
      {
        component: componentName,
        action,
        ...additionalMetadata
      }
    );
  }, [componentName]);

  return {
    logError,
    logWarning,
    logInfo,
    logger
  };
};

export default useErrorLogging;
