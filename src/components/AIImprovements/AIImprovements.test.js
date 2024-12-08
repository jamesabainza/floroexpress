import React from 'react';
import { render, screen } from '@testing-library/react';
import AIImprovements from './AIImprovements';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('AIImprovements Component', () => {
  it('shows processing state when isProcessing is true', () => {
    renderWithTheme(<AIImprovements isProcessing={true} />);
    
    expect(screen.getByTestId('ai-processing-indicator')).toBeInTheDocument();
    expect(screen.getByText('Processing your document...')).toBeInTheDocument();
  });

  it('displays no improvements message when empty and not processing', () => {
    renderWithTheme(<AIImprovements improvements={[]} isProcessing={false} />);
    
    expect(screen.getByTestId('no-improvements')).toBeInTheDocument();
    expect(screen.getByText('No improvements needed. Your document looks great!')).toBeInTheDocument();
  });

  it('displays improvements with correct icons', () => {
    const improvements = [
      { type: 'grammar', description: 'Fixed grammatical errors' },
      { type: 'formatting', description: 'Adjusted margins' },
      { type: 'style', description: 'Enhanced writing style' },
      { type: 'other', description: 'Other improvement' }
    ];

    renderWithTheme(<AIImprovements improvements={improvements} />);
    
    const items = screen.getAllByTestId('improvement-item');
    expect(items).toHaveLength(4);

    improvements.forEach(improvement => {
      expect(screen.getByText(improvement.description)).toBeInTheDocument();
    });
  });

  it('handles improvements with details', () => {
    const improvements = [
      {
        type: 'grammar',
        description: 'Fixed grammatical errors',
        details: 'Corrected subject-verb agreement'
      }
    ];

    renderWithTheme(<AIImprovements improvements={improvements} />);
    
    expect(screen.getByText('Fixed grammatical errors')).toBeInTheDocument();
    expect(screen.getByText('Corrected subject-verb agreement')).toBeInTheDocument();
  });

  it('handles string-only improvements', () => {
    const improvements = ['Simple improvement message'];

    renderWithTheme(<AIImprovements improvements={improvements} />);
    
    expect(screen.getByText('Simple improvement message')).toBeInTheDocument();
  });

  it('renders correctly with no props', () => {
    renderWithTheme(<AIImprovements />);
    
    expect(screen.getByTestId('ai-improvements')).toBeInTheDocument();
    expect(screen.getByText('No improvements needed. Your document looks great!')).toBeInTheDocument();
  });

  // Add error and edge case tests
  it('handles null improvements gracefully', () => {
    renderWithTheme(<AIImprovements improvements={null} />);
    
    expect(screen.getByTestId('no-improvements')).toBeInTheDocument();
    expect(screen.getByText('No improvements needed. Your document looks great!')).toBeInTheDocument();
  });

  it('handles undefined improvements gracefully', () => {
    renderWithTheme(<AIImprovements improvements={undefined} />);
    
    expect(screen.getByTestId('no-improvements')).toBeInTheDocument();
    expect(screen.getByText('No improvements needed. Your document looks great!')).toBeInTheDocument();
  });

  it('handles malformed improvement objects', () => {
    const improvements = [
      { type: 'grammar' }, // missing description
      { description: 'No type specified' }, // missing type
      { type: 'invalid_type', description: 'Invalid improvement type' }, // invalid type
      null, // null improvement
      undefined, // undefined improvement
      {} // empty object
    ];

    renderWithTheme(<AIImprovements improvements={improvements} />);
    
    // Should still render valid improvements
    expect(screen.getByText('No type specified')).toBeInTheDocument();
    expect(screen.getByText('Invalid improvement type')).toBeInTheDocument();
    
    // Should use default icon for invalid type
    const items = screen.getAllByTestId('improvement-item');
    expect(items.length).toBe(3); // Only valid improvements should be rendered
  });

  it('handles empty strings in improvements array', () => {
    const improvements = ['Valid improvement', '', '   ', null];

    renderWithTheme(<AIImprovements improvements={improvements} />);
    
    expect(screen.getByText('Valid improvement')).toBeInTheDocument();
    const items = screen.getAllByTestId('improvement-item');
    expect(items.length).toBe(1); // Only non-empty strings should be rendered
  });

  it('handles extremely long improvement text', () => {
    const longText = 'A'.repeat(1000);
    const improvements = [
      { 
        type: 'grammar', 
        description: longText,
        details: 'Long detail text: ' + longText 
      }
    ];

    renderWithTheme(<AIImprovements improvements={improvements} />);
    
    const item = screen.getByTestId('improvement-item');
    expect(item).toBeInTheDocument();
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('handles switching between processing states', () => {
    const { rerender } = renderWithTheme(
      <AIImprovements isProcessing={true} improvements={[]} />
    );

    // Initially showing processing state
    expect(screen.getByTestId('ai-processing-indicator')).toBeInTheDocument();
    expect(screen.getByText('Processing your document...')).toBeInTheDocument();

    // Switch to completed state with improvements
    rerender(
      <ThemeProvider theme={theme}>
        <AIImprovements 
          isProcessing={false} 
          improvements={['Improvement after processing']} 
        />
      </ThemeProvider>
    );

    expect(screen.queryByTestId('ai-processing-indicator')).not.toBeInTheDocument();
    expect(screen.getByText('Improvement after processing')).toBeInTheDocument();
  });

  it('handles rapid processing state changes', () => {
    const { rerender } = renderWithTheme(
      <AIImprovements isProcessing={true} improvements={[]} />
    );

    // Quickly toggle processing state multiple times
    for (let i = 0; i < 5; i++) {
      rerender(
        <ThemeProvider theme={theme}>
          <AIImprovements isProcessing={false} improvements={[]} />
        </ThemeProvider>
      );
      rerender(
        <ThemeProvider theme={theme}>
          <AIImprovements isProcessing={true} improvements={[]} />
        </ThemeProvider>
      );
    }

    // Should end up in a stable state
    expect(screen.getByTestId('ai-processing-indicator')).toBeInTheDocument();
    expect(screen.getByText('Processing your document...')).toBeInTheDocument();
  });
});
