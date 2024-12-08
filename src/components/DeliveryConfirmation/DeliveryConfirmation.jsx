import React, { useState } from 'react';
import socket from '../../services/socket';

function DeliveryConfirmation({ deliveryData, onComplete }) {
  const [confirmationMethod, setConfirmationMethod] = useState('qr');
  const [code, setCode] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (confirmationMethod === 'code' && !code) {
      setError('Please enter the confirmation code');
      return;
    }

    socket.emit('confirm_delivery', {
      method: confirmationMethod,
      code: code || null,
      deliveryId: deliveryData.id
    });

    // Listen for confirmation response
    socket.once('delivery_confirmation_response', (response) => {
      if (response.success) {
        setIsConfirmed(true);
        if (onComplete) {
          onComplete();
        }
      } else {
        setError(response.message || 'Confirmation failed. Please try again.');
      }
    });
  };

  return (
    <div className="delivery-confirmation">
      <h2>Delivery Confirmation</h2>

      {!isConfirmed ? (
        <>
          <div className="confirmation-method">
            <h3>Choose Confirmation Method</h3>
            <div className="method-options">
              <label>
                <input
                  type="radio"
                  value="qr"
                  checked={confirmationMethod === 'qr'}
                  onChange={(e) => setConfirmationMethod(e.target.value)}
                />
                Scan QR Code
              </label>
              <label>
                <input
                  type="radio"
                  value="code"
                  checked={confirmationMethod === 'code'}
                  onChange={(e) => setConfirmationMethod(e.target.value)}
                />
                Enter Code
              </label>
            </div>
          </div>

          {confirmationMethod === 'qr' ? (
            <div className="qr-scanner">
              <div className="qr-placeholder">
                QR Scanner
                <small>Point your camera at the delivery QR code</small>
              </div>
            </div>
          ) : (
            <div className="code-input">
              <label htmlFor="confirmation-code">Enter Confirmation Code:</label>
              <input
                type="text"
                id="confirmation-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the 6-digit code"
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            className="confirm-button"
            onClick={handleConfirm}
          >
            Confirm Delivery
          </button>
        </>
      ) : (
        <div className="success-message">
          <h3>Delivery Confirmed!</h3>
          <p>Thank you for using EasyPrint. Your delivery has been confirmed.</p>
          <div className="delivery-details">
            <strong>Delivery Details:</strong>
            <ul>
              <li>Address: {deliveryData?.address}</li>
              <li>Receiver: {deliveryData?.receiver || 'Self'}</li>
              <li>Time: {new Date().toLocaleString()}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryConfirmation;
