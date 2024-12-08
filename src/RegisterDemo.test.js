import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import App from './App';
import PrinterShopLocator from './components/PrinterShopLocator/PrinterShopLocator';
import DeliveryConfirmation from './components/DeliveryConfirmation/DeliveryConfirmation';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return jest.fn(() => mockSocket);
});

describe('User App Demo - Function Register Implementation', () => {
  // Increase Jest timeout for long-running tests
  jest.setTimeout(30000);

  const loginAsUser = async () => {
    const user = userEvent.setup();
    const passwordInput = screen.getByLabelText('Password');
    const roleSelect = screen.getByLabelText('Select Role');
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.type(passwordInput, 'testpassword');
    await user.selectOptions(roleSelect, 'user');
    await user.click(loginButton);
  };

  beforeEach(async () => {
    render(<App />);
    await loginAsUser();
  });

  describe('U001 - Upload Document', () => {
    test('demonstrates privacy-aware document upload', async () => {
      const user = userEvent.setup();

      // Test components from function register
      const fileInput = screen.getByLabelText('Select Document');
      expect(fileInput).toHaveAttribute('accept', '.pdf, .docx, .txt');

      // Upload file with private info
      const sensitiveFile = new File(['content'], 'CONFIDENTIAL_report.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, sensitiveFile);

      // Verify privacy notification
      expect(screen.getByTestId('notif_privacy_reminder')).toBeVisible();
      expect(screen.getByTestId('btn_rename_file')).toBeVisible();
      expect(screen.getByTestId('desc_upload_success')).not.toBeVisible();

      // Test rename functionality
      const renameButton = screen.getByTestId('btn_rename_file');
      await user.click(renameButton);
      
      // Upload safe file
      const safeFile = new File(['content'], 'business_document.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, safeFile);
      
      expect(screen.getByTestId('desc_upload_success')).toBeVisible();
      expect(screen.getByTestId('notif_privacy_reminder')).not.toBeVisible();
    });
  });

  describe('U002 - Automated AI Improvements', () => {
    test('demonstrates AI document enhancement', async () => {
      // Verify progress bar
      const progressBar = screen.getByTestId('progress_ai_improvements');
      expect(progressBar).toBeVisible();
      expect(progressBar).toHaveAttribute('max', '100');

      // Verify improvements display
      const resultsBox = screen.getByTestId('desc_ai_results');
      expect(resultsBox).toBeVisible();
      expect(resultsBox).toHaveTextContent('Corrected 3 spelling errors');
      expect(resultsBox).toHaveTextContent('Adjusted margins for better readability');
      expect(resultsBox).toHaveTextContent('Centered the title on Page 1');
    });
  });

  describe('U003 - Delivery Details', () => {
    test('demonstrates delivery setup process', async () => {
      const user = userEvent.setup();

      // Test address dropdown
      const addressDropdown = screen.getByTestId('dropdown_delivery_address');
      expect(addressDropdown).toBeVisible();
      await user.selectOptions(addressDropdown, 'Blk 25, Barangay Kamuning, Quezon City');

      // Test alternate receiver dropdown
      const receiverDropdown = screen.getByTestId('dropdown_alternate_receiver');
      expect(receiverDropdown).toBeVisible();
      await user.selectOptions(receiverDropdown, 'Maria Clara (maria.clara@example.com)');

      // Verify proceed button enables after address selection
      const proceedButton = screen.getByTestId('btn_proceed_printing');
      expect(proceedButton).toBeEnabled();

      // Verify details display
      await user.click(proceedButton);
      const detailsBox = screen.getByTestId('desc_delivery_details');
      expect(detailsBox).toBeVisible();
      expect(detailsBox).toHaveTextContent('Blk 25, Barangay Kamuning, Quezon City');
      expect(detailsBox).toHaveTextContent('Maria Clara');
    });
  });

  describe('U004 - Printer Shop Locator', () => {
    test('demonstrates shop location features', async () => {
      render(<PrinterShopLocator onLocate={() => {}} />);
      
      // Verify map view
      const mapView = screen.getByTestId('map_printer_shop');
      expect(mapView).toBeVisible();
      
      // Verify shop details
      const shopList = screen.getByTestId('printer_shop_list');
      expect(shopList).toBeVisible();
      
      // Select first shop
      const firstShop = screen.getByTestId('printer_shop_1');
      expect(firstShop).toBeVisible();
    });
  });

  describe('U005 - Status Tracking', () => {
    test('demonstrates real-time tracking features', async () => {
      const user = userEvent.setup();

      // First complete document upload
      const fileInput = screen.getByLabelText('Select Document');
      const safeFile = new File(['content'], 'business_document.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, safeFile);

      // Click upload button and wait for AI step
      const uploadButton = screen.getByTestId('btn_upload_file');
      await user.click(uploadButton);
      
      // Wait for AI step to load
      await screen.findByText(/ai document improvements/i);
      
      // Start AI processing and wait for completion
      const startButton = await screen.findByText(/start ai processing/i);
      await user.click(startButton);
      
      // Wait for progress bar to appear and complete
      await screen.findByTestId('progress_ai_improvements');

      // Wait for AI improvements to appear and proceed button
      const aiResults = await screen.findByTestId('desc_ai_results', {}, { timeout: 6000 });
      expect(aiResults).toBeVisible();
      
      // Click proceed to delivery
      const proceedToDeliveryButton = await screen.findByTestId('btn_proceed_delivery');
      await user.click(proceedToDeliveryButton);

      // Wait for delivery details to appear
      const deliveryDetails = await screen.findByTestId('delivery_details');
      expect(deliveryDetails).toBeVisible();

      // Complete delivery details using native select
      const addressDropdown = await screen.findByTestId('dropdown_delivery_address');
      await user.selectOptions(addressDropdown, 'Blk 25, Barangay Kamuning, Quezon City');
      
      const proceedButton = await screen.findByTestId('btn_proceed_printing');
      await user.click(proceedButton);

      // Complete printer shop selection
      const shopList = await screen.findByTestId('printer_shop_list');
      expect(shopList).toBeVisible();

      // Select first printer shop
      const firstShop = await screen.findByTestId('printer_shop_1');
      await user.click(firstShop);
      
      const proceedToPrintingButton = await screen.findByTestId('btn_proceed_printing_2');
      await user.click(proceedToPrintingButton);
      
      // Now verify status tracking components
      const printerStatus = await screen.findByTestId('status_printer');
      expect(printerStatus).toBeVisible();
      expect(screen.getByTestId('status_delivery')).toBeVisible();
      expect(screen.getByTestId('delivery_time')).toBeVisible();
      
      // Verify status messages
      expect(screen.getByText(/printing in progress/i)).toBeInTheDocument();
      expect(screen.getByText(/estimated delivery time/i)).toBeInTheDocument();
    });
  });

  describe('U006 - Delivery Confirmation', () => {
    test('demonstrates delivery confirmation features', async () => {
      const user = userEvent.setup();
      const mockOnConfirm = jest.fn();

      render(<DeliveryConfirmation onConfirm={mockOnConfirm} />);

      // Verify initial state
      const confirmationComponent = screen.getByTestId('delivery_confirmation');
      expect(confirmationComponent).toBeVisible();

      // Step 1: Scan QR Code
      const scanButton = screen.getByTestId('btn_scan_qr');
      await user.click(scanButton);

      // Wait for QR scanning simulation
      await new Promise(resolve => setTimeout(resolve, 2100));

      // Step 2: Enter PIN
      const pinInput = screen.getByTestId('input_pin');
      await user.type(pinInput, '123456');

      // Step 3: Enter Signature
      const signatureInput = screen.getByTestId('input_signature');
      await user.type(signatureInput, 'John Doe');

      // Submit confirmation
      const confirmButton = screen.getByTestId('btn_confirm_delivery');
      await user.click(confirmButton);

      // Verify success state
      expect(screen.getByText(/delivery confirmed successfully/i)).toBeInTheDocument();
      expect(mockOnConfirm).toHaveBeenCalledWith(expect.objectContaining({
        qrScanned: true,
        pin: '123456',
        signature: 'John Doe'
      }));
    });
  });
});
