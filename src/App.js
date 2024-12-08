import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login/Login';
import UploadDocument from './components/UploadDocument/UploadDocument';
import AIImprovements from './components/AIImprovements/AIImprovements';
import DeliveryDetails from './components/DeliveryDetails/DeliveryDetails';
import PrinterShopLocator from './components/PrinterShopLocator/PrinterShopLocator';
import StatusTracking from './components/StatusTracking/StatusTracking';
import DeliveryConfirmation from './components/DeliveryConfirmation/DeliveryConfirmation';
import ErrorAlert from './components/ErrorAlert/ErrorAlert';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import socket from './services/socket';
import useErrorLogging from './hooks/useErrorLogging';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import logo from './assets/logo.png';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container, Grid, Card, CardContent, Typography, Button, Box, Stepper, Step, StepLabel } from '@mui/material';
import DeliveryLogistics from './components/DeliveryLogistics/DeliveryLogistics';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0ABAB5',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#f0f0f0',
    },
    text: {
      primary: '#333333',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#0ABAB5',
    },
    h2: {
      fontWeight: 500,
      fontSize: '1.5rem',
      color: '#0ABAB5',
    },
    body1: {
      fontSize: '1rem',
      color: '#333333',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#089c9a',
          },
        },
      },
    },
  },
});

const steps = [
  'Upload',
  'AI Processing',
  'Delivery Details',
  'Select Printer',
  'Track Status',
  'Logistics',
  'Confirm Delivery'
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload');
  const [userData, setUserData] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [printerShopData, setPrinterShopData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [printJob, setPrintJob] = useState(null);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [improvements, setImprovements] = useState(null);
  const { logError, logInfo } = useErrorLogging('App');

  useEffect(() => {
    const setupSocketListeners = () => {
      socket.on('error_message', (msg) => {
        setError(msg);
        setShowError(true);
        logError(msg, 'SOCKET_ERROR');
        console.error('Socket error:', msg);
      });

      socket.on('ai_process_complete', (data) => {
        console.log('AI improvements:', data.improvements);
        setImprovements(data.improvements);
        setCurrentStep('delivery');
        logInfo('AI improvements completed', 'AI_IMPROVEMENTS_COMPLETE', { documentId: data.documentId });
      });

      socket.on('print_job_update', (data) => {
        console.log('Print job update:', data);
        setPrintJob(prev => ({ ...prev, ...data }));
        setStatusData(prev => ({ ...prev, printStatus: data.status }));
        logInfo('Print job updated', 'PRINT_JOB_UPDATED', { printJobId: data.printJobId });
        
        if (data.status === 'printing_completed') {
          setCurrentStep('status');
          logInfo('Printing completed', 'PRINTING_COMPLETED', { printJobId: data.printJobId });
        }
      });

      socket.on('delivery_update', (data) => {
        console.log('Delivery update:', data);
        setStatusData(prev => ({ ...prev, deliveryStatus: data.status }));
        logInfo('Delivery updated', 'DELIVERY_UPDATED', { deliveryId: data.deliveryId });
      });

      socket.on('rider_assigned', (data) => {
        console.log('Rider assigned:', data);
        setStatusData(prev => ({ 
          ...prev, 
          riderId: data.riderId,
          status: 'Rider assigned'
        }));
        logInfo('Rider assigned', 'RIDER_ASSIGNED', { riderId: data.riderId });
      });
    };

    setupSocketListeners();
    
    return () => {
      socket.disconnect();
    };
  }, [logError, logInfo]);

  const handleLogin = async (loginData) => {
    if (loginData.password === 'demo123') {
      const userId = Math.random().toString(36).substring(7);
      setUserData({ userId, role: loginData.role });
      setIsAuthenticated(true);
      setCurrentStep('upload');
      logInfo('User logged in', 'LOGIN_SUCCESS', { userId });
    } else {
      setError('Incorrect password');
      setShowError(true);
      logError('Incorrect password', 'LOGIN_FAILED');
    }
  };

  const handleUpload = async (file) => {
    try {
      // Store only necessary file information
      setDocumentData({
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          originalFile: file
        }
      });
      // Clear any previous improvements
      setImprovements(null);
      setCurrentStep('ai');
      // Update status data for AI processing
      setStatusData({
        status: 'AI Processing',
        details: 'Analyzing document and configuring optimal settings',
        progress: 0
      });
      logInfo('File uploaded', 'FILE_UPLOADED', { fileName: file.name });
    } catch (error) {
      setError('Error uploading file');
      setShowError(true);
      logError(error, 'UPLOAD_FAILED');
    }
  };

  const handleAIComplete = (aiResults) => {
    try {
      setImprovements(aiResults);
      // Update status after AI processing
      setStatusData({
        status: 'AI Complete',
        details: 'Document optimized and ready for printing',
        progress: 100
      });
      logInfo('AI improvements completed', 'AI_IMPROVEMENTS_COMPLETE', {
        documentId: documentData?.file?.name
      });
    } catch (error) {
      setError('Error processing AI improvements');
      setShowError(true);
      logError(error, 'AI_IMPROVEMENTS_FAILED');
    }
  };

  const handleAIContinue = () => {
    setCurrentStep('delivery');
  };

  const handleDeliverySubmit = (details) => {
    try {
      setDeliveryData(details);
      setCurrentStep('printer');
      logInfo('Delivery details submitted', 'DELIVERY_DETAILS_SUBMITTED', { deliveryId: details.deliveryId });
    } catch (error) {
      logError(error, 'DELIVERY_DETAILS_FAILED');
    }
  };

  const handleSkip = () => {
    setCurrentStep('printer');
  };

  const handlePrinterShopSelect = (shopId) => {
    try {
      setPrinterShopData(prev => ({ ...prev, selectedShopId: shopId }));
      setStatusData({
        status: 'Printing in Progress',
        eta: new Date(Date.now() + 3600000).toISOString(),
        printStatus: 'printing',
        deliveryStatus: 'pending',
        riderLocation: { lat: 14.5995, lng: 120.9842 }
      });
      setCurrentStep('status');
      logInfo('Printer shop selected', 'PRINTER_SHOP_SELECTED', { shopId });
    } catch (error) {
      logError(error, 'PRINTER_SHOP_SELECTION_FAILED');
    }
  };

  const handleStatusCheck = () => {
    try {
      socket.emit('request_print_status', { userId: userData?.userId });
      socket.emit('request_delivery_status', { userId: userData?.userId });
      logInfo('Status checked', 'STATUS_CHECKED');
    } catch (error) {
      logError(error, 'STATUS_CHECK_FAILED');
    }
  };

  const handleDeliveryConfirm = (confirmationData) => {
    try {
      setStatusData(prev => ({
        ...prev,
        status: 'Delivered',
        deliveryStatus: 'completed',
        confirmationData
      }));
      setCurrentStep('complete');
      logInfo('Delivery confirmed', 'DELIVERY_CONFIRMED', { deliveryId: confirmationData.deliveryId });
    } catch (error) {
      logError(error, 'DELIVERY_CONFIRMATION_FAILED');
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const containsPrivateInfo = (filename) => {
    const privateTerms = ['private', 'confidential', 'secret', 'personal'];
    return privateTerms.some(term => filename.toLowerCase().includes(term));
  };

  const getStepIndex = () => {
    const stepMap = {
      'upload': 0,
      'ai': 1,
      'delivery': 2,
      'printer': 3,
      'status': 4,
      'logistics': 5,
      'complete': 6
    };
    return stepMap[currentStep] || 0;
  };

  const handlePrevious = () => {
    switch (currentStep) {
      case 'printer':
        setCurrentStep('delivery');
        break;
      case 'delivery':
        setCurrentStep('ai');
        break;
      case 'ai':
        setCurrentStep('upload');
        break;
      default:
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return <UploadDocument 
          onUpload={handleUpload} 
          onSkip={() => setCurrentStep('delivery')}
          error={error}
        />;
      case 'ai':
        return (
          <AIImprovements 
            file={documentData?.file?.originalFile}
            onComplete={handleAIComplete}
            onContinue={handleAIContinue}
            improvements={improvements}
          />
        );
      case 'delivery':
        return <DeliveryDetails onSubmit={handleDeliverySubmit} onSkip={handleSkip} />;
      case 'printer':
        return (
          <PrinterShopLocator 
            onSelect={handlePrinterShopSelect} 
            onPrevious={handlePrevious}
          />
        );
      case 'status':
        return (
          <StatusTracking 
            printStatus={statusData?.printStatus}
            deliveryStatus={statusData?.deliveryStatus}
            onCheck={handleStatusCheck}
            onDeliveryReady={() => {
              setStatusData(prev => ({
                ...prev,
                status: 'Ready for Delivery',
                deliveryStatus: 'ready'
              }));
              setCurrentStep('logistics');
            }}
          />
        );
      case 'logistics':
        return (
          <DeliveryLogistics 
            onDeliveryComplete={() => {
              setStatusData(prev => ({
                ...prev,
                status: 'Delivered',
                deliveryStatus: 'completed'
              }));
              setCurrentStep('complete');
            }}
          />
        );
      case 'complete':
        return (
          <DeliveryConfirmation 
            deliveryData={deliveryData}
            onConfirm={handleDeliveryConfirm}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header isAuthenticated={isAuthenticated} />
        
        <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
          <ErrorBoundary>
            <ErrorAlert 
              message={error}
              open={showError}
              onClose={handleCloseError}
            />
            {isAuthenticated ? (
              <Box className="app-header" sx={{ textAlign: 'center', mb: 4 }}>
                <img src={logo} className="app-logo" alt="FloroExpress logo" />
                <Typography variant="h5" className="app-title">
                  FloroExpress
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  AI Powered & Secure Private Printing Delivered to your Doorstep
                </Typography>
              </Box>
            ) : null}
            {isAuthenticated ? (
              <Box sx={{ my: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stepper activeStep={getStepIndex()} alternativeLabel>
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Grid>

                  <Grid item xs={12}>
                    {error && (
                      <Box sx={{ mb: 2 }}>
                        <Typography color="error">{error}</Typography>
                      </Box>
                    )}
                    {renderCurrentStep()}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h2">Recent Activity</Typography>
                        <Typography variant="body1">
                          {printJob ? `Current print job: ${printJob.status}` : 'No recent print jobs'}
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => setCurrentStep('upload')}
                          sx={{ mt: 2 }}
                        >
                          Start New Print Job
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h2">Status</Typography>
                        <Typography variant="body1">
                          {statusData ? `Current Status: ${statusData.status}` : 'No active jobs'}
                        </Typography>
                        {statusData && (
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={handleStatusCheck}
                            sx={{ mt: 2 }}
                          >
                            Check Status
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Login onLogin={handleLogin} />
            )}
          </ErrorBoundary>
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
