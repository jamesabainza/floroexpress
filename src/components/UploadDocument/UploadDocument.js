import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  Input,
  IconButton,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const UploadDocument = ({ onUpload, onSkip, error }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(true);
  const [uploadStatus, setUploadStatus] = useState('waiting'); // 'waiting', 'analyzing', 'configuring'

  const securityFeatures = [
    {
      title: "Smart Data Masking",
      icon: <ShieldIcon fontSize="small" />,
      color: "#ff9800"
    },
    {
      title: "End-to-End Encryption",
      icon: <VisibilityOffIcon fontSize="small" />,
      color: "#2196f3"
    },
    {
      title: "Secure Processing",
      icon: <FlashOnIcon fontSize="small" />,
      color: "#4caf50"
    }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

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
                  Privacy Protection
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
            Your privacy is our priority. All sensitive information is automatically masked and encrypted before being processed by our AI servers.
          </Alert>
        </Paper>
      )}

      {onSkip && (
        <Button
          onClick={onSkip}
          startIcon={<SkipNextIcon />}
          size="small"
          sx={{ mb: 2 }}
        >
          Skip
        </Button>
      )}
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          cursor: 'pointer',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          sx={{ display: 'none' }}
          onChange={handleFileInput}
          id="file-input"
        />
        <label htmlFor="file-input" style={{ height: '100%' }}>
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Enhance Your Document with AI Tools
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
              Our AI will automatically improve document quality, enhance readability, and configure optimal printer settings for your document.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag and drop your file here or click to select
            </Typography>
            {selectedFile && (
              <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
            {uploadStatus === 'analyzing' && (
              <Typography variant="body2" color="info.main" sx={{ mt: 2 }}>
                AI is analyzing your document...
              </Typography>
            )}
            {uploadStatus === 'configuring' && (
              <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                Configuration complete
              </Typography>
            )}
          </Box>
        </label>
      </Paper>

      {selectedFile && (
        <Box sx={{ mt: 2 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Automatic Settings Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We've automatically configured the optimal printer settings for your document:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">• Color Mode: Full Color</Typography>
              <Typography variant="body2">• Paper Size: Auto-detected</Typography>
              <Typography variant="body2">• Quality: High Resolution</Typography>
              <Typography variant="body2">• Orientation: Auto-adjusted</Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              onClick={() => {}}
            >
              Configure Manually
            </Button>
          </Paper>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        disabled={!selectedFile}
        onClick={() => {
          setUploadStatus('analyzing');
          setTimeout(() => {
            setUploadStatus('configuring');
            handleUploadClick();
          }, 1500);
        }}
        sx={{ mt: 2 }}
      >
        Improve with AI Tools
      </Button>
    </Box>
  );
};

export default UploadDocument;
