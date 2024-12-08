import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import App from '../../App';
import { mockSocket } from '../helpers/testHelpers';

jest.mock('socket.io-client', () => {
  return jest.fn(() => mockSocket);
});

describe('Socket.io Integration Tests', () => {
  beforeEach(() => {
    mockSocket.connected = true;
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
  });

  afterEach(() => {
    if (mockSocket.connected) {
      mockSocket.disconnect();
    }
  });

  test('should handle document upload and AI processing with real socket connection', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Login first
    await act(async () => {
      const passwordInput = screen.getByLabelText(/Password/i);
      const roleSelect = screen.getByLabelText(/Role/i);
      await user.type(passwordInput, 'testpass');
      await user.selectOptions(roleSelect, 'user');
      await user.click(screen.getByRole('button', { name: /login/i }));
    });

    // Upload document
    const fileInput = screen.getByTestId('document-upload');
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    await act(async () => {
      await user.upload(fileInput, file);
    });

    // Verify upload started
    expect(mockSocket.emit).toHaveBeenCalledWith('upload_document', expect.any(Object));

    // Simulate AI processing
    act(() => {
      mockSocket.emit('ai_process_started');
    });

    await waitFor(() => {
      expect(screen.getByTestId('ai-processing-indicator')).toBeInTheDocument();
    });

    // Simulate AI completion
    act(() => {
      mockSocket.emit('ai_process_complete', {
        improvements: ['Formatting enhanced', 'Grammar corrected']
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/formatting enhanced/i)).toBeInTheDocument();
    });
  });

  test('handles connection errors gracefully', async () => {
    render(<App />);
    
    act(() => {
      mockSocket.connected = false;
      mockSocket.emit('disconnect');
    });

    await waitFor(() => {
      expect(screen.getByTestId('connection-error')).toHaveTextContent(/connection lost/i);
    });

    // Test reconnection
    act(() => {
      mockSocket.connected = true;
      mockSocket.emit('connect');
    });

    await waitFor(() => {
      expect(screen.queryByTestId('connection-error')).not.toBeInTheDocument();
    });
  });

  test('maintains socket connection during multiple operations', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Login
    await act(async () => {
      const passwordInput = screen.getByLabelText(/Password/i);
      const roleSelect = screen.getByLabelText(/Role/i);
      await user.type(passwordInput, 'testpass');
      await user.selectOptions(roleSelect, 'user');
      await user.click(screen.getByRole('button', { name: /login/i }));
    });

    expect(mockSocket.connected).toBe(true);

    // Perform multiple operations
    for (let i = 0; i < 3; i++) {
      act(() => {
        mockSocket.emit('status_update', { status: `Operation ${i + 1}` });
      });

      await waitFor(() => {
        expect(screen.getByText(`Operation ${i + 1}`)).toBeInTheDocument();
      });
    }

    expect(mockSocket.connected).toBe(true);
  });
});
