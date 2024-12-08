import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#f8f9fa', pt: 6, pb: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        {/* Trust Indicators */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#0ABAB5', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              10,000+ Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trust us with their printing needs
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 40, color: '#0ABAB5', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Secure Printing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              End-to-end encrypted documents
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <VerifiedUserIcon sx={{ fontSize: 40, color: '#0ABAB5', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Verified Partners
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quality assured printing services
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Footer Links */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Company
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>About Us</Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Blog</Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Careers</Link>
            <Link href="#" color="inherit" display="block">Press</Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Help Center</Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Safety Center</Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Community Guidelines</Link>
            <Link href="#" color="inherit" display="block">Contact Us</Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Privacy Policy</Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Terms of Service</Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Cookie Policy</Link>
            <Link href="#" color="inherit" display="block">Intellectual Property</Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Install App
            </Typography>
            <Box component="img" src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" sx={{ height: 40, mb: 1, cursor: 'pointer' }} />
            <Box component="img" src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" sx={{ height: 40, cursor: 'pointer' }} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; 2024 FloroExpress. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" color="inherit">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" style={{ height: 24 }} />
            </Link>
            <Link href="#" color="inherit">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg" alt="Twitter" style={{ height: 24 }} />
            </Link>
            <Link href="#" color="inherit">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" style={{ height: 24 }} />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
