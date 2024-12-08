import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Alert,
  Chip,
  LinearProgress,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import GppGoodIcon from '@mui/icons-material/GppGood';
import GroupIcon from '@mui/icons-material/Group';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import WarningIcon from '@mui/icons-material/Warning';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import CloseIcon from '@mui/icons-material/Close';

const StatusTracking = ({ error, onErrorClear, statusData, printJob, onCheck, onDeliveryReady }) => {
  const [currentStatus, setCurrentStatus] = useState(statusData?.status || 'processing');
  const [statusHistory, setStatusHistory] = useState([
    { 
      time: new Date().toLocaleString(),
      status: 'success',
      details: 'Document Received',
      privacyNote: 'Document encrypted and protected'
    }
  ]);
  const [showSecurityInfo, setShowSecurityInfo] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [showInterventionDialog, setShowInterventionDialog] = useState(false);
  const [interventionDetails, setInterventionDetails] = useState(null);
  const [skipDemo, setSkipDemo] = useState(false);
  const [showCompletionReport, setShowCompletionReport] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [printingComplete, setPrintingComplete] = useState(false);

  // Constants for timing (in milliseconds)
  const TOTAL_PRINT_TIME = 90000; // 1.5 minutes
  const PROGRESS_INTERVAL = 100; // Update every 100ms for smoother animation
  const INTERVENTION_TIME = 45000; // 45 seconds for intervention
  const COMPLETION_TIME = 30000; // 30 seconds for completion

  // Calculate progress increments
  const NORMAL_INCREMENT = (PROGRESS_INTERVAL / TOTAL_PRINT_TIME) * 100;
  const INTERVENTION_INCREMENT = (PROGRESS_INTERVAL / INTERVENTION_TIME) * 20; // 20% progress during intervention
  const COMPLETION_INCREMENT = (PROGRESS_INTERVAL / COMPLETION_TIME) * 30; // 30% progress during completion

  // Privacy message
  const PRIVACY_MESSAGE = "Documents are automatically covered by privacy sheets after printing";

  const securityFeatures = [
    {
      icon: <ShieldIcon />,
      label: 'No Local Storage',
      description: 'Documents are never stored locally'
    },
    {
      icon: <SecurityIcon />,
      label: 'Document Protection',
      description: 'Documents are automatically covered by privacy sheets after printing'
    },
    {
      icon: <GroupIcon />,
      label: 'Trained Staff',
      description: 'Staff certified under Republic Act 10173 (Data Privacy Act)'
    }
  ];

  // Get progress bar color based on current state
  const getProgressColor = (progress) => {
    if (progress < 30) return '#FFA726'; // Orange/Yellow for starting
    if (progress >= 30 && progress < 50) return '#f44336'; // Red for issues
    if (progress >= 50 && progress < 80) return '#42A5F5'; // Blue for progress
    return '#66BB6A'; // Green for near completion
  };

  // Start simulation when component mounts
  useEffect(() => {
    setCurrentProgress(0);
    setIsSimulationRunning(true);
    setStatusHistory([{
      time: new Date().toLocaleString(),
      status: 'success',
      details: 'Print job started',
      privacyNote: 'Document received securely'
    }]);
  }, []); // Run once when component mounts

  useEffect(() => {
    if (statusData?.status === 'AI Processing') {
      setCurrentStatus('AI Processing');
      setStatusHistory(prev => [{
        time: new Date().toLocaleString(),
        status: 'processing',
        details: statusData.details || 'AI is analyzing your document',
        privacyNote: 'Document encrypted and protected during AI processing'
      }, ...prev]);
      
      // Start progress simulation for AI processing
      const interval = setInterval(() => {
        setCurrentProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 1;
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (statusData?.status === 'AI Complete') {
      setCurrentStatus('AI Complete');
      setCurrentProgress(100);
      setStatusHistory(prev => [{
        time: new Date().toLocaleString(),
        status: 'success',
        details: statusData.details || 'AI processing complete',
        privacyNote: 'Document ready for secure printing'
      }, ...prev]);
    }
  }, [statusData]);

  // Simulated print progress
  useEffect(() => {
    let intervalId;
    
    if (isSimulationRunning && !skipDemo) {
      console.log('Starting progress simulation');
      const startProgress = () => {
        let isInIntervention = false;
        let interventionStarted = false;
        let interventionResolved = false;

        intervalId = setInterval(() => {
          setCurrentProgress(prev => {
            let increment = NORMAL_INCREMENT;
            let newProgress = prev;

            // Initial printing (0-30%)
            if (prev < 30) {
              newProgress = prev + increment;
            }
            // Intervention phase (30-50%)
            else if (prev >= 30 && prev < 50) {
              if (!interventionStarted) {
                handlePrinterIssue();
                interventionStarted = true;
                isInIntervention = true;
              }
              increment = INTERVENTION_INCREMENT;
              newProgress = prev + increment;
            }
            // Resolution and completion (50-100%)
            else if (prev >= 50) {
              if (isInIntervention && !interventionResolved) {
                handleInterventionResolution();
                interventionResolved = true;
              }
              increment = COMPLETION_INCREMENT;
              newProgress = prev + increment;
            }

            // Handle completion
            if (newProgress >= 100) {
              clearInterval(intervalId);
              handleCompletion();
              setIsSimulationRunning(false);
              return 100;
            }

            return newProgress;
          });
        }, PROGRESS_INTERVAL);
      };

      startProgress();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSimulationRunning, skipDemo]);

  const handlePrinterIssue = () => {
    const issue = {
      type: 'alignment',
      pageNumber: 2,
      timestamp: new Date().toLocaleString(),
      operator: 'OP-123',
      description: 'Margin misalignment detected on page 2'
    };
    
    setInterventionDetails(issue);
    setShowInterventionDialog(true);
    
    setStatusHistory(prev => [...prev, {
      time: issue.timestamp,
      status: 'warning',
      details: 'Manual intervention required: Margin realignment',
      privacyNote: 'Document protected during intervention'
    }]);
  };

  const handleInterventionResolution = () => {
    setStatusHistory(prev => [...prev, {
      time: new Date().toLocaleString(),
      status: 'success',
      details: 'Alignment issue resolved',
      privacyNote: 'Document remained protected during intervention'
    }]);
  };

  const handleCompletion = () => {
    setStatusHistory(prev => [...prev, {
      time: new Date().toLocaleString(),
      status: 'success',
      details: 'Print job completed',
      privacyNote: 'All temporary data cleared'
    }]);
    setPrintingComplete(true);
    setShowCompletionReport(true);
    
    // After a short delay, trigger the delivery confirmation
    setTimeout(() => {
      handleDeliveryConfirmation();
    }, 1000);
  };

  const handleSkip = () => {
    setSkipDemo(true);
    setCurrentProgress(100);
    handleCompletion();
  };

  const handleDeliveryConfirmation = () => {
    // Trigger the callback to move to the next step
    if (onDeliveryReady) {
      onDeliveryReady({
        status: 'ready_for_delivery',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Reset simulation
  const resetSimulation = () => {
    setIsSimulationRunning(true);
    setCurrentProgress(0);
    setSkipDemo(false);
    setStatusHistory([{
      time: new Date().toLocaleString(),
      status: 'success',
      details: 'Print job started',
      privacyNote: 'Document received securely'
    }]);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="div" sx={{ color: '#65B7B7', mb: 2 }}>
          Print Progress
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentProgress.toFixed(1)}% {currentStatus === 'AI Processing' && '(Processing...)'}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={currentProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getProgressColor(currentProgress),
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SecurityIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {PRIVACY_MESSAGE}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Print History
          </Typography>
          {!printingComplete && (
            <Button
              size="small"
              onClick={handleSkip}
              sx={{ textTransform: 'none' }}
            >
              Skip Demo
            </Button>
          )}
        </Box>

        <List sx={{ width: '100%' }}>
          {statusHistory.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                py: 1,
                px: 0,
                borderBottom: index !== statusHistory.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.status === 'success' ? (
                  <CheckCircleIcon color="success" />
                ) : item.status === 'warning' ? (
                  <WarningIcon color="warning" />
                ) : (
                  <TrackChangesIcon color="info" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.details}
                secondary={
                  <React.Fragment>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.time}
                    </Typography>
                    <Typography variant="caption" color="success.main" display="block">
                      {item.privacyNote}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {securityFeatures.map((feature, index) => (
          <Chip
            key={index}
            icon={feature.icon}
            label={feature.label}
            size="small"
            variant="outlined"
            sx={{ mb: 1 }}
          />
        ))}
      </Stack>

      {/* Confirm Delivery Button */}
      {printingComplete && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleDeliveryConfirmation}
            startIcon={<CheckCircleIcon />}
            sx={{
              minWidth: 200,
              py: 1.5,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            Confirm Delivery
          </Button>
        </Box>
      )}

      {/* Manual Intervention Dialog */}
      <Dialog
        open={showInterventionDialog}
        onClose={() => setShowInterventionDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Manual Intervention Required
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography paragraph>
              A printer alignment issue has been detected and requires manual intervention.
            </Typography>
            <Typography paragraph color="primary">
              Privacy Protection Measures:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ShieldIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Document remains covered during intervention" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Only trained staff will handle the alignment" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="All interventions are logged and reported" />
              </ListItem>
            </List>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInterventionDialog(false)}>
            Acknowledge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completion Report Dialog */}
      <Dialog
        open={showCompletionReport}
        onClose={() => setShowCompletionReport(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Print Job Completion Report
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography paragraph sx={{ mb: 3 }}>
              Your document has been successfully printed with the following notes:
            </Typography>
            
            <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
              Manual Intervention Required
            </Typography>
            <Typography paragraph sx={{ mb: 3 }}>
              During printing, a margin alignment issue was detected on page 2. This required manual intervention by our trained staff. Please note that this is an uncommon occurrence as our printing process is typically fully automated. The document remained protected throughout the intervention process.
            </Typography>

            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
              Privacy Measures Maintained
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ShieldIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Document Protection" 
                  secondary="Privacy sheets applied after printing for physical document security"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Certified Staff" 
                  secondary="Personnel trained and certified under RA 10173 (Data Privacy Act of 2012)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Privacy Compliance" 
                  secondary="All processes follow Philippine Data Privacy Act guidelines"
                />
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              Our printing system and staff are fully compliant with the Data Privacy Act of 2012 (RA 10173). Manual interventions are rare and handled only by certified personnel following strict privacy protocols.
            </Alert>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompletionReport(false)} color="primary">
            Close Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StatusTracking;
