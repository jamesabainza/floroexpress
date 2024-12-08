import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Alert,
  Paper,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { analyzeDocument } from '../../services/api';

const AIImprovements = ({ file, onComplete, onContinue, improvements }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(true);

  const securityFeatures = [
    {
      title: "AI Data Masking",
      icon: <VisibilityOffIcon fontSize="small" />,
      color: "#2196f3"
    },
    {
      title: "Real-time Processing",
      icon: <DataUsageIcon fontSize="small" />,
      color: "#4caf50"
    },
    {
      title: "Activity Logging",
      icon: <AssignmentIcon fontSize="small" />,
      color: "#ff9800"
    }
  ];

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeDocument(file);
      onComplete(result);
    } catch (err) {
      setError(err.message || 'Error analyzing document');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (file && !improvements) {
      handleAnalyze();
    }
  }, [file]);

  if (!file) {
    return <Typography>No file selected</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      {showPrivacyInfo && (
        <Paper 
          elevation={2}
          sx={{ 
            mb: 3,
            overflow: 'hidden',
            bgcolor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 2
          }}
        >
          <Box 
            sx={{ 
              px: 2.5,
              py: 2,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <SecurityIcon 
                  sx={{ 
                    mr: 1,
                    color: 'primary.main',
                    fontSize: 20
                  }} 
                />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  AI Privacy Protection
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {securityFeatures.map((feature, index) => (
                  <Chip
                    key={index}
                    icon={React.cloneElement(feature.icon, {
                      sx: { color: feature.color }
                    })}
                    label={feature.title}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                      '& .MuiChip-label': {
                        color: 'text.secondary',
                        fontSize: '0.8125rem'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setShowPrivacyInfo(false)}
              sx={{ 
                mt: -0.5,
                mr: -1,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Alert 
            severity="info"
            sx={{ 
              px: 2.5,
              py: 1.5,
              bgcolor: 'rgba(33, 150, 243, 0.08)',
              border: 0,
              borderTop: '1px solid rgba(33, 150, 243, 0.16)',
              borderRadius: 0,
              '& .MuiAlert-icon': {
                color: '#2196f3'
              }
            }}
          >
            Our AI system automatically detects and masks sensitive information during processing
          </Alert>
        </Paper>
      )}

      {loading && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }} data-testid="ai-processing-indicator">
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Processing document...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {improvements && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            {improvements.fileType} processed successfully
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Analysis Results</Typography>
            <Typography variant="body1" color="text.secondary">
              {improvements.analysis}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Improvements Made</Typography>
            <List>
              {improvements.improvements.map((improvement, index) => (
                <ListItem key={index}>
                  <ListItemText primary={improvement} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Printer Settings</Typography>
            <List dense>
              {Object.entries(improvements.settings).map(([key, value], index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    secondary={value}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onContinue}
            sx={{ mt: 2 }}
          >
            Continue to Delivery Details
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default AIImprovements;
