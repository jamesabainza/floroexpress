import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper
} from '@mui/material';
import logo from '../../assets/logo.png';

const Login = ({ onLogin }) => {
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ role, password });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img 
            src={logo} 
            alt="FloroExpress Logo" 
            style={{ 
              height: '80px', 
              marginBottom: '1rem' 
            }} 
          />
          
          <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: '#0ABAB5' }}>
            FloroExpress
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            AI Powered & Secure Private Printing Delivered to your Doorstep
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="role-select-label">Select Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={role}
                label="Select Role"
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="printer">Printer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#0ABAB5',
                '&:hover': {
                  bgcolor: '#099693'
                }
              }}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
