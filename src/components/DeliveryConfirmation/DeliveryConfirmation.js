import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShieldIcon from '@mui/icons-material/Shield';
import StarIcon from '@mui/icons-material/Star';

const DeliveryConfirmation = ({ deliveryData, onConfirm }) => {
  const [qrScanned, setQrScanned] = useState(false);
  const [pin, setPin] = useState('');
  const [signature, setSignature] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(true);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [deliveryStartTime] = useState(new Date(Date.now() - 45 * 60000)); // 45 minutes ago
  const [rating, setRating] = useState(0);
  const [showTransition, setShowTransition] = useState(false);

  const handleQRScan = () => {
    setShowQRDialog(true);
    setScanning(true);
    // Simulate QR scanning
    setTimeout(() => {
      setScanning(false);
      setQrScanned(true);
      setTimeout(() => {
        setShowQRDialog(false);
        setShowFinalReport(true); // Show final report after QR scan
      }, 2000);
    }, 2000);
  };

  const handleSignatureCapture = () => {
    setShowSignatureDialog(true);
    // Simulate signature capture
    setTimeout(() => {
      setSignature('Digital Signature Captured');
      setTimeout(() => {
        setShowSignatureDialog(false);
        setShowFinalReport(true); // Show final report after signature
      }, 2000);
    }, 2000);
  };

  const handlePINChange = (e) => {
    const value = e.target.value;
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value);
      setError('');
      if (value.length === 6) {
        setShowFinalReport(true); // Show final report when PIN is complete
      }
    }
  };

  const calculateDeliveryMetrics = () => {
    const endTime = new Date();
    const deliveryTime = (endTime - deliveryStartTime) / (1000 * 60);
    const basePrice = 200;
    const distanceCharge = 120;
    const securityCharge = 20;
    const total = basePrice + distanceCharge + securityCharge;

    return {
      deliveryTime: Math.round(deliveryTime),
      pricing: {
        base: basePrice,
        distance: distanceCharge,
        security: securityCharge,
        total: total
      },
      privacyRisk: {
        level: 'Very Low',
        score: '93/100',
        factors: [
          'Immediate printer realignment by certified technician',
          'Privacy sheets maintained during intervention',
          'Continuous document encryption during process',
          'Authorized personnel only access'
        ]
      }
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if at least one verification method is completed
    if (!qrScanned && !signature && pin.length !== 6) {
      setError('Please complete at least one verification method: QR Code, Digital Signature, or PIN');
      return;
    }

    // Get current location for delivery confirmation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setSuccess(true);
          setShowFinalReport(true);
          if (onConfirm) {
            onConfirm({
              qrScanned,
              pin,
              signature,
              location,
              timestamp: new Date().toISOString()
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to confirm your location. Please enable location services.');
        }
      );
    } else {
      setError('Location services are required for delivery confirmation');
    }
  };

  const handleDone = () => {
    setShowTransition(true);
    // Simulate fade to Tiffany blue and show logo
    setTimeout(() => {
      window.location.reload(); // This will restart the application
    }, 10000); // Changed to 10 seconds
  };

  return (
    <Box sx={{ p: 3 }}>
      {showSecurityInfo && (
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
                  Delivery Verification
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  {
                    title: "Live Location",
                    icon: <LocationOnIcon fontSize="small" />,
                    color: "#4caf50"
                  },
                  {
                    title: "Signature Verification",
                    icon: <VerifiedUserIcon fontSize="small" />,
                    color: "#2196f3"
                  },
                  {
                    title: "Timestamped Records",
                    icon: <AccessTimeIcon fontSize="small" />,
                    color: "#ff9800"
                  },
                  {
                    title: "Photo Confirmation",
                    icon: <PhotoCameraIcon fontSize="small" />,
                    color: "#9c27b0"
                  }
                ].map((feature, index) => (
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
              onClick={() => setShowSecurityInfo(false)}
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
            Multiple verification methods ensure secure and documented delivery
          </Alert>
        </Paper>
      )}

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* QR Code Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              QR Code Verification
            </Typography>
            <Button
              variant="contained"
              startIcon={<QrCodeScannerIcon />}
              onClick={handleQRScan}
              disabled={qrScanned}
            >
              {qrScanned ? 'QR Code Verified' : 'Scan QR Code'}
            </Button>
          </Box>

          {/* PIN Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enter PIN
            </Typography>
            <TextField
              type="password"
              value={pin}
              onChange={handlePINChange}
              placeholder="Enter 6-digit PIN"
              fullWidth
              inputProps={{ maxLength: 6 }}
            />
          </Box>

          {/* Digital Signature Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Digital Signature
            </Typography>
            <Button
              variant="contained"
              onClick={handleSignatureCapture}
              disabled={signature !== ''}
            >
              {signature ? 'Signature Captured' : 'Capture Signature'}
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Confirm Delivery
          </Button>
        </form>
      </Paper>

      {/* QR Scanning Dialog */}
      <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)}>
        <DialogTitle>Scanning QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            {scanning ? (
              <CircularProgress />
            ) : (
              <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
            )}
            <Typography sx={{ mt: 2 }}>
              {scanning ? 'Scanning...' : 'QR Code matched with Rider: Arnel Santos'}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Signature Dialog */}
      <Dialog open={showSignatureDialog} onClose={() => setShowSignatureDialog(false)}>
        <DialogTitle>Capturing Digital Signature</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            {!signature ? (
              <CircularProgress />
            ) : (
              <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
            )}
            <Typography sx={{ mt: 2 }}>
              {!signature ? 'Processing signature...' : 'Digital signature captured successfully'}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Final Report Dialog */}
      <Dialog 
        open={showFinalReport} 
        onClose={() => {
          setShowFinalReport(false);
          setShowTransition(true); // Start transition when closing final report
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
            zIndex: 1300 // Ensure this dialog is on top
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          background: 'linear-gradient(to right, #60CCD9, #4FB3BF)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            <Typography variant="h6">FloroExpress Delivery Complete</Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setShowFinalReport(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Delivery Time */}
            <Paper elevation={0} sx={{ p: 3, mb: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                Delivery Summary
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                Total Time: {calculateDeliveryMetrics().deliveryTime} minutes
              </Typography>
            </Paper>

            {/* Pricing Breakdown */}
            <Paper elevation={0} sx={{ p: 3, mb: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                Payment Breakdown
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr auto',
                gap: 2,
                '& > *': { py: 0.5 }
              }}>
                <Typography>Base Fee:</Typography>
                <Typography>₱{calculateDeliveryMetrics().pricing.base}</Typography>
                <Typography>Delivery Fee:</Typography>
                <Typography>₱{calculateDeliveryMetrics().pricing.distance}</Typography>
                <Typography>Security Handling:</Typography>
                <Typography>₱{calculateDeliveryMetrics().pricing.security}</Typography>
                <Typography variant="h6" sx={{ gridColumn: '1/-1', pt: 2, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                  Total: ₱{calculateDeliveryMetrics().pricing.total}
                </Typography>
              </Box>
            </Paper>

            {/* Data Privacy Risk Assessment */}
            <Paper elevation={0} sx={{ p: 3, mb: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                Data Privacy Risk Assessment
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Risk Level: <Chip label={calculateDeliveryMetrics().privacyRisk.level} color="success" size="small" />
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  Security Score: {calculateDeliveryMetrics().privacyRisk.score}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Security Measures During Service Incident:
              </Typography>
              <List dense sx={{ bgcolor: 'white', borderRadius: 1, p: 1 }}>
                {calculateDeliveryMetrics().privacyRisk.factors.map((factor, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ShieldIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={factor}
                      primaryTypographyProps={{
                        sx: { fontSize: '0.9rem' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Feedback Section */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                Rate Your Experience
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center', 
                gap: 1,
                mb: 2 
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    onClick={() => setRating(star)}
                    sx={{
                      color: star <= rating ? 'warning.main' : 'action.disabled',
                      '&:hover': {
                        transform: 'scale(1.2)'
                      },
                      transition: 'transform 0.2s'
                    }}
                  >
                    <StarIcon sx={{ fontSize: '2rem' }} />
                  </IconButton>
                ))}
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button 
            onClick={handleDone} 
            color="primary" 
            variant="contained"
            fullWidth
            sx={{ 
              py: 1.5,
              background: 'linear-gradient(to right, #60CCD9, #4FB3BF)',
              '&:hover': {
                background: 'linear-gradient(to right, #4FB3BF, #3CA0AC)'
              }
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transition Overlay */}
      {showTransition && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: '#60CCD9', // Tiffany blue
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: 0,
            animation: 'fadeIn 3s forwards',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '30%': { opacity: 1 },
              '100%': { opacity: 1 }
            }
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              opacity: 0,
              animation: 'scaleIn 4s forwards 1s',
              '@keyframes scaleIn': {
                '0%': { transform: 'scale(0.5)', opacity: 0 },
                '50%': { transform: 'scale(1.1)', opacity: 1 },
                '100%': { transform: 'scale(1)', opacity: 1 }
              }
            }}
          >
            FloroExpress
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              textAlign: 'center',
              maxWidth: '600px',
              px: 3,
              opacity: 0,
              animation: 'fadeInUp 4s forwards 3s',
              '@keyframes fadeInUp': {
                '0%': { transform: 'translateY(20px)', opacity: 0 },
                '50%': { transform: 'translateY(-5px)', opacity: 0.7 },
                '100%': { transform: 'translateY(0)', opacity: 1 }
              }
            }}
          >
            AI Powered & Secure Private Printing Delivered to your Doorstep
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default DeliveryConfirmation;
