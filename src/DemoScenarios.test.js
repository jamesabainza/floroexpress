import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from './App';
import { loginHelper, uploadDocumentHelper, mockSocket } from './tests/helpers/testHelpers';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return jest.fn(() => mockSocket);
});

describe('EasyPrint Demo Scenarios', () => {
  beforeEach(async () => {
    render(<App />);
    await loginHelper();
  });

  describe('1. Smart Document Handling', () => {
    test('Privacy Protection Demo', async () => {
      const user = userEvent.setup();

      // Demo: Upload sensitive document
      await uploadDocumentHelper(user, 'CONFIDENTIAL_tax_returns.pdf');

      // Verify privacy features
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/privacy warning/i);
        expect(screen.getByText(/please rename your document/i)).toBeInTheDocument();
      });
    });
  });

  describe('2. AI Document Enhancement', () => {
    test('Smart Improvement Demo', async () => {
      const user = userEvent.setup();

      // Demo: Upload document for improvement
      await uploadDocumentHelper(user, 'business_proposal.pdf');

      // Verify AI features
      await waitFor(() => {
        expect(screen.getByTestId('ai-improvements')).toBeInTheDocument();
        expect(screen.getByText(/grammar improvements/i)).toBeInTheDocument();
      });
    });
  });

  describe('3. Intelligent Delivery', () => {
    test('Smart Pricing Demo', async () => {
      const user = userEvent.setup();

      // Demo: Select delivery options
      const addressSelect = screen.getByTestId('delivery-address');
      await user.selectOptions(addressSelect, 'Makati City');

      // Verify pricing features
      await waitFor(() => {
        expect(screen.getByText(/₱150 - standard delivery/i)).toBeInTheDocument();
        expect(screen.getByText(/₱250 - express delivery/i)).toBeInTheDocument();
      });
    });
  });

  describe('4. Print Shop Features', () => {
    test('Shop Selection Demo', async () => {
      const user = userEvent.setup();

      // Demo: View print shops
      const shopButton = screen.getByTestId('view-shops-button');
      await user.click(shopButton);

      // Verify shop features
      await waitFor(() => {
        expect(screen.getByText(/nearest print shops/i)).toBeInTheDocument();
        expect(screen.getByText(/⭐ 4.8\/5/i)).toBeInTheDocument();
      });
    });
  });
});
