import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  it('renders login form with all elements', () => {
    render(<Login onLogin={mockOnLogin} />);
    
    expect(screen.getByTestId('login-title')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('role-select')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
  });

  it('shows error when submitting without password', async () => {
    render(<Login onLogin={mockOnLogin} />);
    
    fireEvent.click(screen.getByTestId('login-submit'));
    
    expect(await screen.findByTestId('login-error')).toHaveTextContent('Please enter your password');
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows error when submitting without role', async () => {
    render(<Login onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByTestId('password-input').querySelector('input');
    fireEvent.change(passwordInput, { target: { value: 'demo123' } });
    
    fireEvent.click(screen.getByTestId('login-submit'));
    
    expect(await screen.findByTestId('login-error')).toHaveTextContent('Please select your role');
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows error for incorrect password', async () => {
    render(<Login onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByTestId('password-input').querySelector('input');
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    const roleSelect = screen.getByTestId('role-select');
    fireEvent.mouseDown(roleSelect);
    
    // Wait for the select options to be available in the portal
    const userOption = await screen.findByRole('option', { name: /user/i });
    fireEvent.click(userOption);
    
    fireEvent.click(screen.getByTestId('login-submit'));
    
    expect(await screen.findByTestId('login-error')).toHaveTextContent('Incorrect password');
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin with correct credentials', async () => {
    render(<Login onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByTestId('password-input').querySelector('input');
    fireEvent.change(passwordInput, { target: { value: 'demo123' } });
    
    const roleSelect = screen.getByTestId('role-select');
    fireEvent.mouseDown(roleSelect);
    
    // Wait for the select options to be available in the portal
    const userOption = await screen.findByRole('option', { name: /User/i });
    fireEvent.click(userOption);
    
    fireEvent.click(screen.getByTestId('login-submit'));
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        password: 'demo123',
        role: 'user'
      });
    });
    
    expect(screen.queryByTestId('login-error')).not.toBeInTheDocument();
  });
});
