import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Stack,
  IconButton,
  Chip
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

// Predefined delivery addresses
const predefinedAddresses = [
  'Unit 1234, SM North EDSA, Quezon City, Metro Manila',
  'Block 5 Lot 12, BGC, Taguig City, Metro Manila',
  'Room 567, Glorietta Mall, Makati City, Metro Manila',
  'Stall 89, Greenhills Shopping Center, San Juan City, Metro Manila',
  'Unit 432, Robinsons Galleria, Ortigas Center, Pasig City',
];

// Predefined alternate recipients (Filipino names)
const predefinedRecipients = [
  { name: 'Maria Santos', phone: '0917-123-4567', relation: 'family' },
  { name: 'Juan dela Cruz', phone: '0918-234-5678', relation: 'friend' },
  { name: 'Rosa Reyes', phone: '0919-345-6789', relation: 'neighbor' },
  { name: 'Pedro Mendoza', phone: '0920-456-7890', relation: 'colleague' },
  { name: 'Ana Gonzales', phone: '0921-567-8901', relation: 'family' },
];

const DeliveryDetails = ({ onSubmit, onSkip }) => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [hasAlternateRecipient, setHasAlternateRecipient] = useState(false);
  const [alternateRecipient, setAlternateRecipient] = useState({
    name: '',
    phone: '',
    relation: ''
  });
  const [showSecurityInfo, setShowSecurityInfo] = useState(true);

  const securityFeatures = [
    {
      title: "QR Verification",
      icon: <QrCodeIcon fontSize="small" />,
      color: "#2196f3"
    },
    {
      title: "PIN Protection",
      icon: <VpnKeyIcon fontSize="small" />,
      color: "#4caf50"
    },
    {
      title: "Secure Handover",
      icon: <VerifiedUserIcon fontSize="small" />,
      color: "#ff9800"
    }
  ];

  const handleAlternateRecipientChange = (field) => (event) => {
    setAlternateRecipient(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePredefinedRecipientSelect = (recipient) => {
    setAlternateRecipient(recipient);
  };

  const handleSubmit = () => {
    const deliveryDetails = {
      address: deliveryAddress,
      alternateRecipient: hasAlternateRecipient ? alternateRecipient : null
    };
    onSubmit(deliveryDetails);
  };

  return (
    <Box sx={{ mt: 2 }}>
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
                  Secure Delivery Protection
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
            Multi-factor authentication ensures secure package handover with QR and PIN verification
          </Alert>
        </Paper>
      )}

      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Delivery Details
        </Typography>

        <Alert 
          severity="warning" 
          icon={<QrCodeIcon />}
          sx={{ mb: 3, fontWeight: 'bold' }}
        >
          Important: For security purposes, please provide the QR code to the receiver for package verification.
        </Alert>

        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Delivery Address</InputLabel>
                <Select
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  label="Delivery Address"
                >
                  {predefinedAddresses.map((address, index) => (
                    <MenuItem key={index} value={address}>
                      {address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={hasAlternateRecipient}
                    onChange={(e) => setHasAlternateRecipient(e.target.checked)}
                  />
                }
                label="Add Alternate Recipient"
              />
            </Grid>

            {hasAlternateRecipient && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Alternate Recipient Details
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Select Recipient</InputLabel>
                    <Select
                      value={alternateRecipient.name}
                      onChange={(e) => {
                        const selected = predefinedRecipients.find(r => r.name === e.target.value);
                        if (selected) {
                          handlePredefinedRecipientSelect(selected);
                        }
                      }}
                      label="Select Recipient"
                    >
                      {predefinedRecipients.map((recipient, index) => (
                        <MenuItem key={index} value={recipient.name}>
                          {recipient.name} - {recipient.phone}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Selected Recipient Details:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body1">
                      Name: {alternateRecipient.name}
                    </Typography>
                    <Typography variant="body1">
                      Phone: {alternateRecipient.phone}
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      Relation: {alternateRecipient.relation}
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                  variant="outlined"
                  startIcon={<SkipNextIcon />}
                  onClick={onSkip}
                >
                  Skip to Print Shop
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!deliveryAddress}
                >
                  Continue
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default DeliveryDetails;
