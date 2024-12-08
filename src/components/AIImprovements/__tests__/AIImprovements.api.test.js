import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import AIImprovements from '../AIImprovements';
import { analyzeDocument } from '../../../services/api';

// Mock the API module
jest.mock('../../../services/api');

describe('AIImprovements Component Tests', () => {
  beforeEach(() => {
    // Clear mock data before each test
    jest.clearAllMocks();
  });

  // Helper function to create test files
  const createTestFile = (content, name, type) => {
    const blob = new Blob([content], { type });
    return new File([blob], name, { type });
  };

  it('analyzes a text document and displays improvements', async () => {
    // Mock response for text document
    const mockResponse = {
      fileType: 'Text Document',
      analysis: 'Detected minor formatting inconsistencies and 2 spelling errors.',
      improvements: 'Standardized document formatting and corrected all spelling errors.',
      settings: {
        paperSize: 'A4',
        quality: 'Standard',
        duplex: 'Enabled',
        colorMode: 'Black & White'
      },
      status: 'Success',
      message: 'Your document has been processed successfully and sent to the printer with the specified settings.'
    };
    analyzeDocument.mockResolvedValueOnce(mockResponse);

    const file = createTestFile('Test content', 'test.txt', 'text/plain');
    render(<AIImprovements file={file} />);
    
    // Click analyze button
    fireEvent.click(screen.getByTestId('analyze-button'));
    
    // Wait for analysis results
    await waitFor(() => {
      expect(screen.getByText(/Text Document processed successfully/)).toBeInTheDocument();
    });

    // Verify analysis is displayed
    expect(screen.getByText(/formatting inconsistencies/)).toBeInTheDocument();
    expect(screen.getByText(/Standardized document formatting/)).toBeInTheDocument();

    // Verify settings are displayed
    expect(screen.getByText(/A4/)).toBeInTheDocument();
    // First find the Quality label, then find its associated value
    const qualityItem = screen.getByText('Quality').closest('li');
    expect(qualityItem).toBeInTheDocument();
    expect(within(qualityItem).getByText('Standard')).toBeInTheDocument();
  });

  it('analyzes an image file and shows image-specific improvements', async () => {
    // Mock response for image file
    const mockResponse = {
      fileType: 'Picture',
      analysis: 'Detected suboptimal color balance and resolution for printing.',
      improvements: 'Enhanced color accuracy and optimized resolution for print quality.',
      settings: {
        paperType: 'Photo Paper',
        quality: 'High',
        colorMode: 'Full Color',
        borderless: true
      },
      status: 'Success',
      message: 'Your document has been processed successfully and sent to the printer with the specified settings.'
    };
    analyzeDocument.mockResolvedValueOnce(mockResponse);

    const file = createTestFile('', 'test.jpg', 'image/jpeg');
    render(<AIImprovements file={file} />);
    
    // Click analyze button
    fireEvent.click(screen.getByTestId('analyze-button'));
    
    // Wait for analysis results
    await waitFor(() => {
      expect(screen.getByText(/Picture processed successfully/)).toBeInTheDocument();
    });

    // Verify analysis is displayed
    expect(screen.getByText(/color balance/)).toBeInTheDocument();
    expect(screen.getByText(/Enhanced color accuracy/)).toBeInTheDocument();

    // Verify settings are displayed
    expect(screen.getByText(/Photo Paper/)).toBeInTheDocument();
    expect(screen.getByText(/Full Color/)).toBeInTheDocument();
  });

  it('handles large files appropriately', async () => {
    // Mock response for large file
    const mockResponse = {
      fileType: 'Text Document',
      analysis: 'Detected large file requiring optimization.',
      improvements: 'Applied compression and optimized for efficient printing.',
      settings: {
        paperSize: 'A4',
        quality: 'Optimized',
        compression: 'Enabled'
      },
      status: 'Success',
      message: 'Your document has been processed successfully and sent to the printer with the specified settings.'
    };
    analyzeDocument.mockResolvedValueOnce(mockResponse);

    const largeContent = 'x'.repeat(1024 * 1024 + 1);
    const file = createTestFile(largeContent, 'large.txt', 'text/plain');
    
    render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));
    
    // Wait for analysis results
    await waitFor(() => {
      expect(screen.getByText(/Text Document processed successfully/)).toBeInTheDocument();
    });

    // Verify optimization message is displayed
    expect(screen.getByText(/requiring optimization/)).toBeInTheDocument();
    expect(screen.getByText(/Applied compression/)).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    // Setup mock to reject
    analyzeDocument.mockRejectedValueOnce(new Error('Analysis failed'));
    
    const file = createTestFile('Test content', 'test.txt', 'text/plain');
    render(<AIImprovements file={file} />);
    
    fireEvent.click(screen.getByTestId('analyze-button'));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Analysis failed')).toBeInTheDocument();
    });

    // Verify the mock was called
    expect(analyzeDocument).toHaveBeenCalledWith(file);
  });
});
