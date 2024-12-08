import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const loginHelper = async (user = userEvent.setup()) => {
  // Fill in login form
  const passwordInput = screen.getByLabelText(/password/i);
  const roleSelect = screen.getByLabelText(/role/i);
  await user.type(passwordInput, 'testpass');
  await user.selectOptions(roleSelect, 'user');
  
  // Submit form
  const loginButton = screen.getByRole('button', { name: /login/i });
  await user.click(loginButton);
  
  // Wait for login to complete
  await waitFor(() => {
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });
};

export const uploadDocumentHelper = async (user = userEvent.setup(), filename = 'test.pdf') => {
  const fileInput = screen.getByTestId('document-upload');
  const file = new File(['test content'], filename, { type: 'application/pdf' });
  await user.upload(fileInput, file);
};

export const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
};
