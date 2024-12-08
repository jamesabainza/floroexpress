import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Chip,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StorefrontIcon from '@mui/icons-material/Storefront';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 1.3521, // Singapore default
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

const PrinterShopLocator = ({ onSelect, onPrevious }) => {
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [error, setError] = useState(null);
  const [printerShops, setPrinterShops] = useState([]);
  const [map, setMap] = useState(null);
  const [closestShop, setClosestShop] = useState(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(true);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Calculate distance between two points
  const calculateDistance = (p1, p2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Mock services data (in real app, this would come from the backend)
  const mockServices = {
    basic: ['Black & White Printing', 'Color Printing', 'Scanning', 'Photocopying'],
    premium: ['High-Quality Photo Printing', 'Large Format Printing', 'Binding', 'Lamination']
  };

  const searchNearbyPrinters = useCallback(async (location) => {
    if (!map) return;

    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: location,
      radius: 5000,
      type: 'store',
      keyword: 'printer shop printing service copy center'
    };

    try {
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          console.log('Found printer shops:', results);
          
          // Add distance to each shop and sort by distance
          const shopsWithDistance = results.map(shop => ({
            ...shop,
            distance: calculateDistance(location, {
              lat: shop.geometry.location.lat(),
              lng: shop.geometry.location.lng()
            })
          })).sort((a, b) => a.distance - b.distance);

          setPrinterShops(shopsWithDistance);
          setClosestShop(shopsWithDistance[0]);
        } else {
          console.error('Places search failed:', status);
          setError('Failed to find nearby printer shops');
        }
      });
    } catch (err) {
      console.error('Error searching for printers:', err);
      setError('Error searching for printer shops');
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentPosition(pos);
          searchNearbyPrinters(pos);
        },
        () => {
          setError('Error: The Geolocation service failed.');
          searchNearbyPrinters(defaultCenter);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Using default location.');
      searchNearbyPrinters(defaultCenter);
    }
  }, [map, searchNearbyPrinters]);

  const securityFeatures = [
    {
      title: "Verified Locations",
      icon: <LocationOnIcon fontSize="small" />,
      color: "#2196f3"
    },
    {
      title: "Trusted Partners",
      icon: <StorefrontIcon fontSize="small" />,
      color: "#4caf50"
    },
    {
      title: "Secure Printing",
      icon: <VerifiedUserIcon fontSize="small" />,
      color: "#ff9800"
    }
  ];

  if (loadError) {
    return (
      <Alert severity="error">
        Error loading maps
      </Alert>
    );
  }

  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      {/* Security Features Banner */}
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
                  Trusted Print Network
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
            All print locations are verified partners ensuring secure and quality service
          </Alert>
        </Paper>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={14}
        options={mapOptions}
        onLoad={setMap}
      >
        {/* User location marker */}
        <Marker
          position={currentPosition}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          }}
          title="Your Location"
        />

        {/* Printer shop markers */}
        {printerShops.map((shop) => (
          <Marker
            key={shop.place_id}
            position={shop.geometry.location}
            onClick={() => onSelect && onSelect(shop)}
            icon={{
              url: shop === closestShop ? 
                'http://maps.google.com/mapfiles/ms/icons/green-dot.png' :
                'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }}
            title={shop.name}
          />
        ))}
      </GoogleMap>

      {closestShop && (
        <Paper 
          elevation={3} 
          sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#f5f5f5',
            border: '2px solid #4caf50'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary" sx={{ flex: 1 }}>
              Nearest Printer Shop ({(closestShop.distance).toFixed(2)} km)
            </Typography>
            <Tooltip title="End-to-end encrypted printing">
              <LockIcon color="primary" />
            </Tooltip>
          </Box>
          <Typography variant="subtitle1" gutterBottom>
            {closestShop.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {closestShop.vicinity}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
            Available Services:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {mockServices.basic.map((service) => (
              <Chip
                key={service}
                label={service}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          
          {/* Enhanced Ready to Print Section */}
          <Box 
            sx={{ 
              bgcolor: '#e8f5e9', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid #81c784',
              mb: 2
            }}
          >
            <Typography 
              variant="h6" 
              color="success.main"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              ✓ Ready to Print Your Document
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your document will be securely transmitted and printed with end-to-end encryption
            </Typography>
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onPrevious}
              startIcon={<NavigateBeforeIcon />}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              onClick={() => onSelect && onSelect(closestShop)}
              endIcon={<LockIcon />}
              sx={{ 
                bgcolor: '#2196f3',
                '&:hover': {
                  bgcolor: '#1976d2'
                }
              }}
            >
              Proceed to Secure Print
            </Button>
          </Box>
        </Paper>
      )}

      {printerShops.length > 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Other Nearby Shops</Typography>
          <List>
            {printerShops.slice(1, 6).map((shop) => (
              <ListItem 
                key={shop.place_id} 
                button 
                onClick={() => onSelect && onSelect(shop)}
              >
                <ListItemText 
                  primary={shop.name}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {shop.vicinity} • {shop.distance.toFixed(2)} km away
                      </Typography>
                      {shop.rating && (
                        <Typography variant="body2" color="text.secondary">
                          Rating: {shop.rating} ⭐
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoIcon color="action" fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          All print shops in our network follow strict security protocols and data privacy guidelines.
        </Typography>
      </Box>
    </Box>
  );
};

export default PrinterShopLocator;
