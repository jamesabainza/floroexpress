import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Button,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Badge,
  CircularProgress
} from '@mui/material';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';
import ShieldIcon from '@mui/icons-material/Shield';
import ChatIcon from '@mui/icons-material/Chat';
import CallIcon from '@mui/icons-material/Call';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import riderPic from '../../assets/rider-pic.jpeg';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: 1.3521,
  lng: 103.8198
};

const libraries = ['places'];

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false
};

const DeliveryLogistics = ({ onDeliveryComplete }) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [deliveryCode, setDeliveryCode] = useState('');
  const [riderAssigned, setRiderAssigned] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showHandoverDialog, setShowHandoverDialog] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [destinationPosition, setDestinationPosition] = useState(defaultCenter);
  const [riderPosition, setRiderPosition] = useState(defaultCenter);
  const [mapBounds, setMapBounds] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Get user's current location
  useEffect(() => {
    let watchId;
    
    if (navigator.geolocation) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setDestinationPosition(userLocation);
          setCurrentPosition(userLocation);
          
          // Start watching position for real-time updates
          watchId = navigator.geolocation.watchPosition(
            (newPosition) => {
              const newLocation = {
                lat: newPosition.coords.latitude,
                lng: newPosition.coords.longitude
              };
              setDestinationPosition(newLocation);
              setCurrentPosition(newLocation);
            },
            (error) => {
              console.error('Error watching location:', error);
              setLocationError('Unable to track your current location.');
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your current location. Using default location.');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }

    // Cleanup function to stop watching location
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Function to animate rider movement
  const animateRiderMovement = useCallback(() => {
    const steps = 100;
    let currentStep = 0;
    const startPosition = currentPosition; // Use current position as start

    const animate = () => {
      if (currentStep < steps) {
        const progress = currentStep / steps;
        const newLat = startPosition.lat + (destinationPosition.lat - startPosition.lat) * progress;
        const newLng = startPosition.lng + (destinationPosition.lng - startPosition.lng) * progress;
        
        setRiderPosition({ lat: newLat, lng: newLng });
        currentStep++;
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [currentPosition, destinationPosition]);

  // Handle map load and set bounds
  const onMapLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(new window.google.maps.LatLng(currentPosition));
    bounds.extend(new window.google.maps.LatLng(destinationPosition));
    bounds.extend(new window.google.maps.LatLng(riderPosition));
    map.fitBounds(bounds);
    setMapBounds(bounds);
  }, [currentPosition, destinationPosition, riderPosition]);

  // Add status history entry with security verification
  const addStatusHistory = useCallback((details, privacyNote, isSecurityUpdate = false) => {
    setStatusHistory(prev => {
      // Check if this status already exists to prevent duplicates
      const exists = prev.some(
        status => status.details === details && status.privacyNote === privacyNote
      );
      if (exists) return prev;
      
      return [{
        time: new Date().toLocaleString(),
        status: 'success',
        details,
        privacyNote,
        isSecurityUpdate
      }, ...prev];
    });
  }, []);

  // Simulated rider data
  const riderData = {
    name: "Arnel Santos",
    id: "R-2023-12345",
    rating: "4.9★",
    vehicleType: "Motorcycle",
    licensePlate: "ABC 123",
    phone: "+63 (917) 123-4567",
    completedDeliveries: "2,543",
    onlineHours: "4,120"
  };

  // Get progress bar color based on current state
  const getProgressColor = (progress) => {
    if (progress < 30) return '#FFA726'; // Orange/Yellow for starting
    if (progress >= 30 && progress < 50) return '#f44336'; // Red for issues
    if (progress >= 50 && progress < 80) return '#42A5F5'; // Blue for progress
    return '#66BB6A'; // Green for near completion
  };

  // Simulate delivery progress
  useEffect(() => {
    const simulateDelivery = () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setDeliveryCode(code);

      // Set initial positions
      setRiderPosition(defaultCenter);

      setTimeout(() => {
        setRiderAssigned(true);
        setCurrentProgress(25);
        setEstimatedTime(new Date(Date.now() + 25 * 60000));
        addStatusHistory(
          'Rider Arnel assigned to your delivery',
          'Rider verified and security-cleared for document handling'
        );

        // Start rider animation
        animateRiderMovement();

        setTimeout(() => {
          setCurrentProgress(50);
          addStatusHistory(
            'Documents picked up from printer',
            'Secure handover verified with QR code scan',
            true
          );

          setTimeout(() => {
            setCurrentProgress(75);
            addStatusHistory(
              'Rider en route to delivery location',
              'Documents secured in privacy-enabled delivery box'
            );

            setTimeout(() => {
              setCurrentProgress(90);
              setShowQRCode(true);
              addStatusHistory(
                'Rider arriving at delivery location',
                'Preparing for secure document handover'
              );
            }, 5000);
          }, 5000);
        }, 5000);
      }, 2000);
    };

    simulateDelivery();
  }, [addStatusHistory, animateRiderMovement]);

  // Handle secure handover
  const handleSecureHandover = () => {
    setShowHandoverDialog(true);
  };

  // Complete delivery
  const completeDelivery = () => {
    setCurrentProgress(100);
    addStatusHistory(
      'Delivery completed successfully',
      'Document handover verified with security code'
    );
    setShowHandoverDialog(false);
    setTimeout(() => {
      onDeliveryComplete();
    }, 1000);
  };

  if (loadError) {
    return <Alert severity="error">Error loading maps</Alert>;
  }

  if (!isLoaded) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Delivery Tracking
      </Typography>

      {/* Progress Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Delivery Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentProgress}%
                {estimatedTime && (
                  <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                    (ETA: {new Date(estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </Typography>
                )}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={currentProgress} 
              sx={{ 
                height: 12,
                borderRadius: 6,
                bgcolor: 'rgba(0, 0, 0, 0.08)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  bgcolor: getProgressColor(currentProgress),
                  transition: 'background-color 0.3s ease'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Map View */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOnIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">Live Location Tracking</Typography>
          </Box>
          {locationError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {locationError}
            </Alert>
          )}
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition}
            zoom={15}
            options={{
              ...mapOptions,
              styles: [
                {
                  featureType: "all",
                  elementType: "geometry",
                  stylers: [{ color: "#242f3e" }]
                },
                {
                  featureType: "all",
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#242f3e" }]
                },
                {
                  featureType: "all",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#746855" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#38414e" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#212a37" }]
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca5b3" }]
                }
              ]
            }}
            onLoad={onMapLoad}
          >
            {/* Origin Marker (Printer Location) */}
            <Marker
              position={defaultCenter}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#FFFFFF",
                scale: 2,
                anchor: new window.google.maps.Point(12, 22),
              }}
            />

            {/* Destination Marker (User's Location) */}
            <Marker
              position={destinationPosition}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: "#DB4437",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#FFFFFF",
                scale: 2,
                anchor: new window.google.maps.Point(12, 22),
              }}
            />

            {/* Rider Marker */}
            <Marker
              position={riderPosition}
              icon={{
                path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z",
                fillColor: "#4CAF50",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#FFFFFF",
                scale: 2,
                anchor: new window.google.maps.Point(12, 12),
              }}
            />

            {/* Draw route line between points */}
            {window.google && window.google.maps && (
              <Polyline
                path={[defaultCenter, riderPosition, destinationPosition]}
                options={{
                  strokeColor: "#4CAF50",
                  strokeOpacity: 0.8,
                  strokeWeight: 3,
                  icons: [{
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: "#4CAF50",
                      fillOpacity: 0.4,
                      strokeWeight: 0
                    },
                    offset: "0",
                    repeat: "20px"
                  }]
                }}
              />
            )}
          </GoogleMap>
        </CardContent>
      </Card>

      {/* Rider Information */}
      {riderAssigned && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ mr: 2 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Avatar sx={{ width: 22, height: 22, bgcolor: 'success.main' }}>
                      <VerifiedUserIcon sx={{ width: 16, height: 16 }} />
                    </Avatar>
                  }
                >
                  <Avatar
                    src={riderPic}
                    alt={riderData.name}
                    sx={{ width: 80, height: 80 }}
                  />
                </Badge>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{riderData.name}</Typography>
                  <Box>
                    <IconButton color="primary" size="small" sx={{ mr: 1 }}>
                      <ChatIcon />
                    </IconButton>
                    <IconButton color="primary" size="small">
                      <CallIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID: {riderData.id} | Rating: {riderData.rating}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {riderData.vehicleType} • {riderData.licensePlate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {riderData.phone}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Chip
                    size="small"
                    icon={<CheckCircleIcon />}
                    label={`${riderData.completedDeliveries} Deliveries`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    icon={<AccessTimeIcon />}
                    label={`${riderData.onlineHours}+ Hours`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                icon={<AccessTimeIcon />}
                label={`ETA: ${new Date(estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<SecurityIcon />}
                label={`Delivery Code: ${deliveryCode}`}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HistoryIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">Delivery Updates</Typography>
          </Box>
          <List>
            {statusHistory.map((status, index) => (
              <ListItem 
                key={index} 
                divider={index !== statusHistory.length - 1}
                sx={{
                  bgcolor: status.isSecurityUpdate ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                  borderRadius: 1,
                  my: 1
                }}
              >
                <ListItemIcon>
                  {status.isSecurityUpdate ? (
                    <SecurityIcon color="success" />
                  ) : (
                    <CheckCircleIcon color="primary" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          fontWeight: status.isSecurityUpdate ? 600 : 400,
                          color: status.isSecurityUpdate ? 'success.main' : 'text.primary'
                        }}
                      >
                        {status.details}
                      </Typography>
                      {status.isSecurityUpdate && (
                        <Chip
                          size="small"
                          label="Security Verified"
                          color="success"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {status.time}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        display="block" 
                        color={status.isSecurityUpdate ? 'success.main' : 'primary.main'}
                      >
                        {status.privacyNote}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Secure Handover Dialog */}
      <Dialog
        open={showHandoverDialog}
        onClose={() => setShowHandoverDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon color="primary" sx={{ mr: 1 }} />
            Secure Document Handover
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Alert severity="info" sx={{ mb: 3 }}>
              For your security, please verify the delivery code with the rider before accepting the documents.
            </Alert>
            <Typography paragraph>
              Your Delivery Code: <strong>{deliveryCode}</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ShieldIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Privacy Protected" 
                  secondary="Documents are sealed in a privacy envelope"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Secure Verification" 
                  secondary="Two-factor authentication using code and ID"
                />
              </ListItem>
            </List>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHandoverDialog(false)}>Cancel</Button>
          <Button onClick={completeDelivery} variant="contained">
            Confirm Receipt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Handover Buttons */}
      {showQRCode && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<QrCodeIcon />}
            onClick={handleSecureHandover}
            size="large"
          >
            Verify & Accept Delivery
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DeliveryLogistics;
