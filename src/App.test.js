import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from './App';
import { mockSocket } from './setupTests';

// Mock console methods
const mockConsole = {
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
  log: jest.spyOn(console, 'log').mockImplementation(() => {})
};

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return jest.fn(() => mockSocket);
});

// Helper to simulate socket events
const simulateSocketEvent = (event, data) => {
  const callbacks = mockSocket.on.mock.calls
    .filter(call => call[0] === event)
    .map(call => call[1]);
  
  callbacks.forEach(callback => callback(data));
};

// Helper to login
const loginHelper = async (user) => {
  const passwordInput = screen.getByLabelText(/Password:/i);
  const roleSelect = screen.getByLabelText(/Select Role:/i);
  const loginButton = screen.getByRole('button', { name: /Login/i });

  await user.type(passwordInput, 'password123');
  await user.selectOptions(roleSelect, 'user');
  await user.click(loginButton);
};

// Helper to upload document
const uploadDocumentHelper = async (user) => {
  const file = new File(['test content'], 'document.txt', { type: 'text/plain' });
  const fileInput = screen.getByRole('button', { name: /Upload File/i }).previousElementSibling;
  await user.upload(fileInput, file);
};

describe('App Component Tests', () => {
  let container;

  beforeEach(() => {
    // Reset DOM
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Reset socket state
    mockSocket.connected = false;
    mockSocket.userId = null;
    mockSocket.role = null;
    mockSocket.removeAllListeners();
    
    // Reset all mocks
    jest.clearAllMocks();
    Object.values(mockConsole).forEach(mock => mock.mockClear());
  });

  afterEach(() => {
    // Cleanup socket
    mockSocket.disconnect();
    mockSocket.removeAllListeners();
    
    // Cleanup DOM
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
  });

  describe('Initial UI Elements', () => {
    test('renders initial UI elements correctly', async () => {
      render(<App />, { container });

      expect(screen.getByRole('heading', { level: 1, name: /EasyPrint/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Select Role:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });
  });

  describe('Login Flow', () => {
    test('renders login form correctly', () => {
      render(<App />, { container });
      
      // Check for form elements
      expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Select Role:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    test('handles successful user login', async () => {
      const user = userEvent.setup();
      render(<App />, { container });

      // Get form elements
      const passwordInput = screen.getByLabelText(/Password:/i);
      const roleSelect = screen.getByLabelText(/Select Role:/i);
      const loginButton = screen.getByRole('button', { name: /Login/i });

      // Perform login actions
      await user.type(passwordInput, 'password123');
      await user.selectOptions(roleSelect, 'user');
      await user.click(loginButton);

      // Verify socket connection
      expect(mockSocket.connect).toHaveBeenCalledWith(expect.any(String), 'user');
      expect(mockSocket.connected).toBe(true);
      expect(mockSocket.role).toBe('user');
    });

    test('handles login errors', async () => {
      const user = userEvent.setup();
      render(<App />, { container });

      // Get form elements
      const passwordInput = screen.getByLabelText(/Password:/i);
      const roleSelect = screen.getByLabelText(/Select Role:/i);
      const loginButton = screen.getByRole('button', { name: /Login/i });

      // Perform login actions
      await user.type(passwordInput, 'wrong_password');
      await user.selectOptions(roleSelect, 'user');
      await user.click(loginButton);

      // Simulate error
      simulateSocketEvent('error_message', 'Invalid credentials');

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
      });
    });
  });

  describe('AI Processing Flow', () => {
    test('handles successful AI processing', async () => {
      render(<App />, { container });

      // Login first
      await loginHelper(userEvent.setup());
      await uploadDocumentHelper(userEvent.setup());

      act(() => {
        simulateSocketEvent('ai_process_complete', {
          improvements: ['Suggestion 1', 'Suggestion 2']
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
      });
    });

    test('handles AI processing error', async () => {
      render(<App />, { container });

      // Login first
      await loginHelper(userEvent.setup());
      await uploadDocumentHelper(userEvent.setup());

      act(() => {
        simulateSocketEvent('ai_process_error', {
          error: 'Processing failed'
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Processing failed');
      });
    });
  });

  describe('Print Job Flow', () => {
    test('handles print job updates', async () => {
      render(<App />, { container });

      // Login as printer
      await loginHelper(userEvent.setup());
      await uploadDocumentHelper(userEvent.setup());

      act(() => {
        simulateSocketEvent('print_job_update', {
          status: 'printing',
          progress: 50
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/50%/i)).toBeInTheDocument();
      });
    });

    test('handles print job completion', async () => {
      render(<App />, { container });

      // Login as printer
      await loginHelper(userEvent.setup());
      await uploadDocumentHelper(userEvent.setup());

      act(() => {
        simulateSocketEvent('print_job_update', {
          status: 'printing_completed',
          jobId: '12345'
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/printing_completed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Delivery Flow', () => {
    test('handles rider assignment', async () => {
      render(<App />, { container });

      // Login as user
      await loginHelper(userEvent.setup());
      await uploadDocumentHelper(userEvent.setup());

      act(() => {
        simulateSocketEvent('rider_assigned', {
          riderId: 'RIDER123',
          status: 'Rider assigned'
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Rider assigned/i)).toBeInTheDocument();
      });
    });

    test('handles delivery confirmation', async () => {
      render(<App />, { container });

      // Login as user
      await loginHelper(userEvent.setup());
      await uploadDocumentHelper(userEvent.setup());

      act(() => {
        simulateSocketEvent('delivery_confirmed', {
          status: 'Delivered'
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles error messages properly', async () => {
      render(<App />, { container });

      // Set initial error
      act(() => {
        simulateSocketEvent('error_message', 'Initial error');
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Start new process
      const startButton = screen.getByRole('button', { name: /Start Processing/i });
      await userEvent.click(startButton);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Simulated Socket Behavior', () => {
    beforeEach(() => {
      mockSocket.connected = true;
      render(<App />);
    });

    test('simulates document processing flow', async () => {
      const user = userEvent.setup();
      await loginHelper(user);
      await uploadDocumentHelper(user);

      // Simulate socket events
      mockSocket.emit('processing_started');
      await waitFor(() => {
        expect(screen.getByTestId('processing-indicator')).toBeInTheDocument();
      });

      mockSocket.emit('spell_check_complete');
      await waitFor(() => {
        expect(screen.getByTestId('spell-check-status')).toHaveTextContent(/complete/i);
      });
    });

    test('handles connection state correctly', async () => {
      expect(mockSocket.connected).toBe(true);
      
      await act(async () => {
        mockSocket.connected = false;
        mockSocket.emit('disconnect');
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/connection lost/i);
      });
    });

    test('handles error_message events correctly', async () => {
      await act(async () => {
        mockSocket.emit('error_message', 'Test error');
      });

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Test error');
      });
    });
  });

  describe('Socket Event Handling', () => {
    test('handles error_message events correctly', async () => {
      render(<App />);
      mockSocket.emit('error_message', 'Connection failed');
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Connection failed');
      });
    });

    test('handles document processing events', async () => {
      render(<App />);
      await loginHelper();
      await uploadDocumentHelper();

      mockSocket.emit('improvements', [
        { type: 'formatting', description: 'Improved formatting' }
      ]);

      await waitFor(() => {
        expect(screen.getByTestId('ai-improvements')).toBeInTheDocument();
        expect(screen.getByText('Improved formatting')).toBeInTheDocument();
      });
    });
  });
});
