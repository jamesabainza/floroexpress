import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import UploadDocument from '../UploadDocument/UploadDocument';
import AIImprovements from '../AIImprovements/AIImprovements';
import DeliveryDetails from '../DeliveryDetails/DeliveryDetails';
import PrinterShopLocator from '../PrinterShopLocator/PrinterShopLocator';
import StatusTracking from '../StatusTracking/StatusTracking';
import DeliveryConfirmation from '../DeliveryConfirmation/DeliveryConfirmation';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return jest.fn(() => mockSocket);
});

describe('Function Register Implementation Tests', () => {
  describe('U001 - Upload Document Component', () => {
    test('should have all required elements with correct data-testid attributes', async () => {
      const user = userEvent.setup();
      render(<UploadDocument />);
      
      // Test file input
      const fileInput = screen.getByTestId('input_file');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png');
      
      // Test upload button
      const uploadButton = screen.getByTestId('btn_upload_file');
      expect(uploadButton).toBeInTheDocument();
      expect(uploadButton).toBeDisabled(); // Should be disabled when no file is selected
      
      // Upload a file with private information
      const file = new File(['test'], 'confidential_document.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, file);
      
      // Test privacy warning (should appear after uploading a file with private info)
      const privacyWarning = await screen.findByTestId('notif_privacy_reminder');
      expect(privacyWarning).toBeInTheDocument();
      expect(privacyWarning).toBeVisible();
      
      // Test rename button
      const renameButton = screen.getByTestId('btn_rename_file');
      expect(renameButton).toBeInTheDocument();
      expect(renameButton).toBeVisible();
      
      // Upload a safe file to test success message
      const safeFile = new File(['test'], 'safe_document.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, safeFile);
      
      // Click the upload button to trigger success message
      await user.click(uploadButton);
      
      // Test success message (should be visible after successful upload)
      const successMessage = await screen.findByTestId('desc_upload_success');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toBeVisible();
    });
  });

  describe('U002 - AI Improvements Component', () => {
    test('should have progress bar and results display with correct attributes', () => {
      const mockImprovements = [
        'Corrected 3 spelling errors',
        'Adjusted margins for better readability',
        'Centered the title on Page 1'
      ];
      
      render(<AIImprovements improvements={mockImprovements} />);
      
      // Test progress bar
      const progressBar = screen.getByTestId('progress_ai_improvements');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar.querySelector('progress')).toHaveAttribute('max', '100');
      
      // Test improvements display
      const resultsDisplay = screen.getByTestId('desc_ai_results');
      expect(resultsDisplay).toBeInTheDocument();
      mockImprovements.forEach(improvement => {
        expect(resultsDisplay).toHaveTextContent(improvement);
      });
    });
  });

  describe('U003 - Delivery Details Component', () => {
    test('should have all delivery form elements with correct attributes', () => {
      const mockAddresses = ['Address 1', 'Address 2'];
      const mockReceivers = ['Receiver 1', 'Receiver 2'];
      
      render(
        <DeliveryDetails 
          savedAddresses={mockAddresses}
          alternateReceivers={mockReceivers}
        />
      );
      
      // Test address dropdown
      const addressDropdown = screen.getByTestId('dropdown_delivery_address');
      expect(addressDropdown).toBeInTheDocument();
      expect(addressDropdown).toHaveAttribute('aria-label', 'Select Delivery Address');
      
      // Test alternate receiver dropdown
      const receiverDropdown = screen.getByTestId('dropdown_alternate_receiver');
      expect(receiverDropdown).toBeInTheDocument();
      expect(receiverDropdown).toHaveAttribute('aria-label', 'Select Alternate Receiver');
      
      // Test proceed button
      const proceedButton = screen.getByTestId('btn_proceed_printing');
      expect(proceedButton).toBeInTheDocument();
      expect(proceedButton).toBeDisabled(); // Should be disabled initially
      
      // Test details display
      fireEvent.change(addressDropdown, { target: { value: mockAddresses[0] } });
      fireEvent.click(proceedButton);
      
      const detailsDisplay = screen.getByTestId('desc_delivery_details');
      expect(detailsDisplay).toBeInTheDocument();
      expect(detailsDisplay).toBeVisible();
    });
  });

  describe('U004 - Printer Shop Locator Component', () => {
    test('should have map and shop details with correct attributes', () => {
      const mockPrinterShop = {
        name: 'Test Shop',
        address: 'Test Address',
        distance: '2.5'
      };
      
      render(<PrinterShopLocator printerShop={mockPrinterShop} />);
      
      // Test map container
      const mapContainer = screen.getByTestId('map_printer_shop');
      expect(mapContainer).toBeInTheDocument();
      
      // Test shop details
      const shopDetails = screen.getByTestId('desc_printer_shop');
      expect(shopDetails).toBeInTheDocument();
      expect(shopDetails).toHaveTextContent(mockPrinterShop.name);
      expect(shopDetails).toHaveTextContent(mockPrinterShop.address);
      expect(shopDetails).toHaveTextContent(mockPrinterShop.distance);
      
      // Test proceed button
      const proceedButton = screen.getByTestId('btn_proceed_printing_2');
      expect(proceedButton).toBeInTheDocument();
    });
  });

  describe('U005 - Status Tracking Component', () => {
    test('demonstrates real-time tracking features', async () => {
      const mockStatusData = {
        status: 'Printing in Progress',
        eta: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      };

      const mockPrintJob = {
        status: 'Processing',
        timestamp: new Date().toLocaleString()
      };
      
      render(
        <StatusTracking 
          statusData={mockStatusData}
          printJob={mockPrintJob}
          onCheck={() => {}}
        />
      );
      
      // Verify status components
      expect(screen.getByTestId('status_printer')).toBeVisible();
      expect(screen.getByTestId('status_delivery')).toBeVisible();
      expect(screen.getByTestId('delivery_time')).toBeVisible();
    });
  });

  describe('U006 - Delivery Confirmation Component', () => {
    test('should have all confirmation elements with correct attributes', async () => {
      const user = userEvent.setup();
      render(<DeliveryConfirmation />);
      
      // Test QR scan button
      const qrButton = screen.getByTestId('btn_scan_qr');
      expect(qrButton).toBeInTheDocument();
      expect(qrButton).toHaveTextContent('Scan QR Code');
      
      // Test PIN entry button
      const pinButton = screen.getByTestId('btn_enter_pin');
      expect(pinButton).toBeInTheDocument();
      expect(pinButton).toHaveTextContent('Enter PIN');
      
      // Test confirmation success message (should be hidden initially)
      const confirmationMessage = screen.getByTestId('desc_delivery_confirmation');
      expect(confirmationMessage).toBeInTheDocument();
      expect(confirmationMessage).not.toBeVisible();
      
      // Simulate successful QR scan
      await user.click(qrButton);
      const successMessage = await screen.findByTestId('desc_delivery_confirmation');
      expect(successMessage).toBeVisible();
      expect(successMessage).toHaveTextContent('Delivery confirmed successfully');
      expect(successMessage).toHaveTextContent('Document received by:');
      expect(successMessage).toHaveTextContent('Time:');
    });
  });
});
