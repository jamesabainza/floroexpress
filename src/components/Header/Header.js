import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from '../../assets/logo.png';

const Header = ({ isAuthenticated }) => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={logo} alt="FloroExpress Logo" style={{ height: 40, marginRight: 8 }} />
            <Box>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  color: '#0ABAB5',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                FloroExpress
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                AI Powered & Secure Private Printing Delivered to your Doorstep
              </Typography>
            </Box>
          </Box>

          {/* Navigation Items */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit">Home</Button>
            <Button color="inherit">Services</Button>
            <Button color="inherit">Pricing</Button>
            <Button color="inherit">Track Order</Button>
          </Box>

          {/* Right Side Items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Help Center">
                  <IconButton color="inherit">
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Notifications">
                  <IconButton color="inherit">
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Account">
                  <IconButton color="inherit">
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Button color="inherit">Login</Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#0ABAB5',
                    '&:hover': { bgcolor: '#099693' }
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
