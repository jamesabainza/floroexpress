import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { mockSocket } from '../setupTests';
import App from '../App';

describe('AI Document Processing Tests', () => {
  const loginToApp = async () => {
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await act(async () => {
      userEvent.type(passwordInput, '54321');
      userEvent.click(loginButton);
    });
  };

  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
    render(<App />);
  });

  describe('Document Type Detection', () => {
    test('should detect and process text documents', async () => {
      await loginToApp();
      
      // Create a mock Word document
      const wordFile = new File(['test content'], 'document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      // Find the file input by its test ID since it's within a conditional render
      const fileInput = screen.getByTestId('input_file');
      await act(async () => {
        userEvent.upload(fileInput, wordFile);
      });

      // Verify document type detection
      expect(mockSocket.emit).toHaveBeenCalledWith('document_uploaded', 
        expect.objectContaining({
          fileName: 'document.docx'
        })
      );
    });

    test('should detect and process images', async () => {
      await loginToApp();
      
      // Create a mock image file
      const imageFile = new File(['image data'], 'photo.jpg', {
        type: 'image/jpeg'
      });

      const fileInput = screen.getByTestId('input_file');
      await act(async () => {
        userEvent.upload(fileInput, imageFile);
      });

      // Verify image type detection
      expect(mockSocket.emit).toHaveBeenCalledWith('document_uploaded', 
        expect.objectContaining({
          fileName: 'photo.jpg'
        })
      );
    });
  });

  describe('AI Analysis and Improvements', () => {
    test('should process text document and show grammar improvements', async () => {
      await loginToApp();

      // Upload a text document
      const docFile = new File(['content'], 'essay.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const fileInput = screen.getByTestId('input_file');
      await act(async () => {
        userEvent.upload(fileInput, docFile);
      });

      // Simulate AI processing completion with grammar improvements
      await act(async () => {
        mockSocket.on.mock.calls
          .find(call => call[0] === 'ai_process_complete')[1]({
            improvements: [
              'Corrected 3 spelling errors',
              'Fixed 2 grammar mistakes',
              'Improved sentence structure'
            ],
            status: 'success'
          });
      });

      // Verify improvements are displayed
      await waitFor(() => {
        expect(screen.getByText(/corrected 3 spelling errors/i)).toBeInTheDocument();
        expect(screen.getByText(/fixed 2 grammar mistakes/i)).toBeInTheDocument();
      });
    });

    test('should process image and show quality improvements', async () => {
      await loginToApp();

      // Upload an image
      const imageFile = new File(['image data'], 'scan.jpg', {
        type: 'image/jpeg'
      });

      const fileInput = screen.getByTestId('input_file');
      await act(async () => {
        userEvent.upload(fileInput, imageFile);
      });

      // Simulate AI processing completion with image improvements
      await act(async () => {
        mockSocket.on.mock.calls
          .find(call => call[0] === 'ai_process_complete')[1]({
            improvements: [
              'Enhanced image clarity',
              'Adjusted brightness and contrast',
              'Sharpened text in image'
            ],
            status: 'success'
          });
      });

      // Verify improvements are displayed
      await waitFor(() => {
        expect(screen.getByText(/enhanced image clarity/i)).toBeInTheDocument();
        expect(screen.getByText(/adjusted brightness/i)).toBeInTheDocument();
      });
    });
  });

  describe('Automatic Printing Process', () => {
    test('should automatically send to printer after AI improvements', async () => {
      await loginToApp();

      // Upload a document
      const file = new File(['content'], 'document.pdf', {
        type: 'application/pdf'
      });

      const fileInput = screen.getByTestId('input_file');
      await act(async () => {
        userEvent.upload(fileInput, file);
      });

      // Simulate AI processing completion
      await act(async () => {
        mockSocket.on.mock.calls
          .find(call => call[0] === 'ai_process_complete')[1]({
            improvements: ['Enhanced document quality'],
            status: 'success'
          });
      });

      // Verify document is sent to printer
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'send_to_printer',
          expect.objectContaining({
            fileName: 'document.pdf',
            status: 'ready_to_print'
          })
        );
      });

      // Verify print job status update
      await act(async () => {
        mockSocket.on.mock.calls
          .find(call => call[0] === 'print_status')[1]({
            status: 'printing',
            jobId: 'test-123',
            progress: '0%'
          });
      });

      await waitFor(() => {
        expect(screen.getByText(/printing in progress/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle AI processing errors gracefully', async () => {
      await loginToApp();

      // Upload a document
      const file = new File(['content'], 'document.pdf', {
        type: 'application/pdf'
      });

      const fileInput = screen.getByTestId('input_file');
      await act(async () => {
        userEvent.upload(fileInput, file);
      });

      // Simulate AI processing error
      await act(async () => {
        mockSocket.on.mock.calls
          .find(call => call[0] === 'ai_process_error')[1]({
            error: 'Unable to process document',
            code: 'AI_PROCESSING_ERROR'
          });
      });

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/unable to process document/i)).toBeInTheDocument();
        expect(screen.getByText(/please try again/i)).toBeInTheDocument();
      });
    });
  });
});
