import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadDocument from './UploadDocument';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

describe('UploadDocument Component', () => {
  const mockOnUpload = jest.fn();
  
  const renderWithTheme = (component) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload component correctly', () => {
    renderWithTheme(<UploadDocument onUpload={mockOnUpload} />);
    
    expect(screen.getByRole('heading', { level: 2, name: /Upload Your Document/i })).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop your file here or click to browse/i)).toBeInTheDocument();
    expect(screen.getByTestId('document-upload')).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UploadDocument onUpload={mockOnUpload} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('document-upload');

    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByTestId('file-name')).toHaveTextContent('test.pdf');
      expect(screen.getByTestId('file-size')).toHaveTextContent('0.00 MB');
    });
  });

  it('shows error for invalid file type', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UploadDocument onUpload={mockOnUpload} />);
    
    // Create a file with an invalid MIME type
    const invalidFile = new File(['test content'], 'test.exe', {
      type: 'application/x-msdownload',
      lastModified: new Date(),
    });
    
    const input = screen.getByTestId('document-upload');
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Create a change event that matches the component's expected structure
    fireEvent.change(input, {
      target: {
        files: [invalidFile]
      }
    });
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Invalid file type. Please upload a PDF, Word document, text file, or image.');
    });
    
    alertMock.mockRestore();
  });

  it('shows error for large files', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UploadDocument onUpload={mockOnUpload} />);
    
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('document-upload');

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    await user.upload(input, largeFile);

    expect(alertMock).toHaveBeenCalledWith('File size exceeds 10MB limit.');
    alertMock.mockRestore();
  });

  it('handles file upload successfully', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UploadDocument onUpload={mockOnUpload} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('document-upload');

    await user.upload(input, file);
    await waitFor(() => {
      expect(screen.getByTestId('file-name')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload Document');
    await user.click(uploadButton);

    expect(mockOnUpload).toHaveBeenCalledWith(file);
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Test error message';
    renderWithTheme(<UploadDocument onUpload={mockOnUpload} error={errorMessage} />);
    
    expect(screen.getByTestId('upload-error')).toHaveTextContent(errorMessage);
  });

  it('allows file removal', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UploadDocument onUpload={mockOnUpload} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('document-upload');

    await user.upload(input, file);
    await waitFor(() => {
      expect(screen.getByTestId('file-name')).toBeInTheDocument();
    });

    const removeButton = screen.getByTestId('delete-button');
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('file-name')).not.toBeInTheDocument();
    });
  });

  it('handles drag and drop', async () => {
    renderWithTheme(<UploadDocument onUpload={mockOnUpload} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByTestId('document-upload-button');

    fireEvent.dragEnter(dropZone, {
      dataTransfer: {
        files: [file],
        types: ['Files']
      }
    });

    expect(dropZone).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('handles sensitive filename warning', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UploadDocument onUpload={mockOnUpload} />);
    
    const file = new File(['test content'], 'confidential_document.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('document-upload');

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    await user.upload(input, file);

    expect(alertMock).toHaveBeenCalledWith('Warning: The file name may contain private information. Please rename your document.');
    alertMock.mockRestore();
  });
});
