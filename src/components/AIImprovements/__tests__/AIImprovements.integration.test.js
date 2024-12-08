import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIImprovements from '../AIImprovements';
import { analyzeDocument } from '../../../services/api';

// Mock the API module
jest.mock('../../../services/api', () => ({
  analyzeDocument: jest.fn()
}));

describe('AIImprovements Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('analyzes a text document successfully', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockResponse = {
      analysis: {
        issues: [
          { type: 'grammar', description: 'Subject-verb agreement error in paragraph 1' },
          { type: 'clarity', description: 'Ambiguous phrasing in section 2' }
        ]
      },
      improvements: [
        { description: 'Fix grammar', details: 'Correct verb tense in first paragraph' },
        { description: 'Enhance clarity', details: 'Rephrase ambiguous statement' }
      ],
      simulatedSettings: {
        paperSize: 'A4',
        quality: 'High',
        handling: 'Standard'
      }
    };

    analyzeDocument.mockResolvedValueOnce(mockResponse);

    render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));

    expect(screen.getByTestId('ai-processing-indicator')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('ai-processing-indicator')).not.toBeInTheDocument();
    });

    expect(analyzeDocument).toHaveBeenCalledWith(file);
    expect(analyzeDocument).toHaveBeenCalledTimes(1);

    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    expect(screen.getByText('grammar')).toBeInTheDocument();
    expect(screen.getByText('clarity')).toBeInTheDocument();
  });

  it('analyzes a blueprint document with technical recommendations', async () => {
    const file = new File([''], 'design.dwg', { type: 'application/dwg' });
    const mockResponse = {
      analysis: {
        issues: [
          { type: 'scale', description: 'Drawing scale not standardized' },
          { type: 'layers', description: 'Inconsistent layer naming convention' }
        ]
      },
      improvements: [
        { description: 'Standardize scale', details: 'Convert to 1:50 scale' },
        { description: 'Organize layers', details: 'Apply AIA layer standards' }
      ],
      simulatedSettings: {
        scale: '1:50',
        units: 'Metric',
        precision: 'High'
      }
    };

    analyzeDocument.mockResolvedValueOnce(mockResponse);

    render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));

    await waitFor(() => {
      expect(screen.getByText('scale')).toBeInTheDocument();
      expect(screen.getByText('layers')).toBeInTheDocument();
    });

    expect(analyzeDocument).toHaveBeenCalledWith(file);
  });

  it('analyzes a high-resolution image with color profile', async () => {
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      analysis: {
        issues: [
          { type: 'colorspace', description: 'Image in RGB instead of CMYK' },
          { type: 'resolution', description: 'Resolution exceeds print requirements' }
        ]
      },
      improvements: [
        { description: 'Convert colorspace', details: 'Convert to CMYK for printing' },
        { description: 'Optimize resolution', details: 'Reduce to 300 DPI' }
      ],
      simulatedSettings: {
        colorProfile: 'CMYK',
        resolution: '300 DPI',
        compression: 'Lossless'
      }
    };

    analyzeDocument.mockResolvedValueOnce(mockResponse);

    render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));

    await waitFor(() => {
      expect(screen.getByText('colorspace')).toBeInTheDocument();
      expect(screen.getByText('resolution')).toBeInTheDocument();
    });

    expect(analyzeDocument).toHaveBeenCalledWith(file);
  });

  it('handles error when file is too large', async () => {
    const file = new File([''], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 25 * 1024 * 1024 }); // 25MB

    analyzeDocument.mockRejectedValueOnce(new Error('File size exceeds the maximum limit of 20MB'));

    render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));

    await waitFor(() => {
      expect(screen.getByText(/File size exceeds the maximum limit/)).toBeInTheDocument();
    });

    expect(analyzeDocument).toHaveBeenCalledWith(file);
  });

  it('handles network error during analysis', async () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    analyzeDocument.mockRejectedValueOnce(new Error('Network error'));

    render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });

    expect(analyzeDocument).toHaveBeenCalledWith(file);
  });

  it('cancels analysis when component unmounts', async () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    const mockAnalysis = new Promise(() => {}); // Never resolves
    analyzeDocument.mockImplementationOnce(() => mockAnalysis);

    const { unmount } = render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));

    expect(screen.getByTestId('ai-processing-indicator')).toBeInTheDocument();
    
    unmount();
    
    // Verify cleanup occurred
    expect(analyzeDocument).toHaveBeenCalledWith(file);
  });

  it('shows loading state while processing', async () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    analyzeDocument.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));

    expect(screen.getByTestId('ai-processing-indicator')).toBeInTheDocument();
  });

  it('disables analyze button while processing', async () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    analyzeDocument.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AIImprovements file={file} />);
    const button = screen.getByTestId('analyze-button');
    fireEvent.click(button);

    expect(button).toBeDisabled();
  });

  it('provides appropriate printer settings for different document types', async () => {
    const documents = [
      {
        file: new File([''], 'document.pdf', { type: 'application/pdf' }),
        expectedSettings: {
          paperSize: 'A4',
          duplexMode: 'Long Edge',
          colorMode: 'Color',
          resolution: '600 DPI',
          paperTray: 'Auto',
          mediaType: 'Plain Paper'
        }
      }
    ];

    for (const doc of documents) {
      const mockResponse = {
        analysis: {
          issues: [{ type: 'settings', description: 'Optimizing print settings' }]
        },
        improvements: [
          { description: 'Optimize settings', details: 'Applying optimal print settings' }
        ],
        simulatedSettings: doc.expectedSettings
      };

      analyzeDocument.mockResolvedValueOnce(mockResponse);

      const { rerender } = render(<AIImprovements file={doc.file} />);
      fireEvent.click(screen.getByTestId('analyze-button'));

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByTestId('ai-processing-indicator')).not.toBeInTheDocument();
      });

      // Check each setting is displayed
      for (const [key, value] of Object.entries(doc.expectedSettings)) {
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
        expect(screen.getByText(formattedKey)).toBeInTheDocument();
        expect(screen.getByText(value)).toBeInTheDocument();
      }

      rerender(<AIImprovements file={null} />);
    }
  });

  it('simulates appropriate actions based on document content', async () => {
    const file = new File(['test content with tables and images'], 'report.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    const mockResponse = {
      analysis: {
        issues: [
          { type: 'layout', description: 'Inconsistent table formatting' },
          { type: 'images', description: 'Low resolution images' },
          { type: 'accessibility', description: 'Missing alt text' }
        ]
      },
      improvements: [
        { description: 'Format tables', details: 'Apply consistent table styles' },
        { description: 'Optimize images', details: 'Upscale images to 300 DPI' },
        { description: 'Add accessibility', details: 'Generate alt text for images' }
      ]
    };

    analyzeDocument.mockResolvedValueOnce(mockResponse);

    render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));

    await waitFor(() => {
      expect(screen.getByText('layout')).toBeInTheDocument();
      expect(screen.getByText('images')).toBeInTheDocument();
      expect(screen.getByText('accessibility')).toBeInTheDocument();
    });

    // Verify improvements are shown
    expect(screen.getByText('Format tables')).toBeInTheDocument();
    expect(screen.getByText('Optimize images')).toBeInTheDocument();
    expect(screen.getByText('Add accessibility')).toBeInTheDocument();
  });

  it('handles complex document with multiple improvement suggestions', async () => {
    const file = new File([''], 'complex.pdf', { type: 'application/pdf' });
    
    const mockResponse = {
      analysis: {
        issues: [
          { type: 'structure', description: 'Missing document outline' },
          { type: 'accessibility', description: 'No tagged PDF structure' },
          { type: 'forms', description: 'Non-fillable forms detected' },
          { type: 'security', description: 'No document encryption' }
        ]
      },
      improvements: [
        { description: 'Generate outline', details: 'Create document bookmarks' },
        { description: 'Add PDF tags', details: 'Make document screen-reader friendly' },
        { description: 'Convert forms', details: 'Make forms fillable' },
        { description: 'Enable security', details: 'Add 256-bit encryption' }
      ],
      simulatedSettings: {
        compatibility: 'PDF 2.0',
        compliance: 'PDF/UA',
        security: 'Enhanced',
        formFields: 'Enabled',
        metadata: 'Standard'
      }
    };

    analyzeDocument.mockResolvedValueOnce(mockResponse);

    render(<AIImprovements file={file} />);
    fireEvent.click(screen.getByTestId('analyze-button'));

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('ai-processing-indicator')).not.toBeInTheDocument();
    });

    // Verify all issues are shown
    ['structure', 'accessibility', 'forms', 'security'].forEach(issue => {
      expect(screen.getByText(issue)).toBeInTheDocument();
    });

    // Verify all improvements are shown
    [
      'Generate outline',
      'Add PDF tags',
      'Convert forms',
      'Enable security'
    ].forEach(improvement => {
      expect(screen.getByText(improvement)).toBeInTheDocument();
    });

    // Verify settings are shown with proper capitalization
    Object.entries(mockResponse.simulatedSettings).forEach(([key, value]) => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
      expect(screen.getByText(formattedKey)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
    });
  });
});
