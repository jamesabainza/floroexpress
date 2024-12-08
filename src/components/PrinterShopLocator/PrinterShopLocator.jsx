import React, { useState, useEffect } from 'react';
import socket from '../../services/socket';

function PrinterShopLocator({ onComplete }) {
  const [shopDetails, setShopDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);

  // Simulated shop data
  const nearestShop = {
    name: "EasyPrint Manila Branch",
    address: "123 P. Burgos St., Malate, Manila",
    distance: "1.5",
    coordinates: {
      lat: 14.5995,
      lng: 120.9842
    }
  };

  useEffect(() => {
    // Listen for printer shop updates
    socket.on('printer_shop_found', (data) => {
      setShopDetails(data);
      setIsLoading(false);
    });

    // Listen for QR code generation
    socket.on('qr_code_generated', (data) => {
      setQrCode(data.qrCode);
    });

    // Emit event to find nearest printer shop
    socket.emit('find_printer_shop', {
      location: {
        lat: 14.5995,
        lng: 120.9842
      }
    });

    return () => {
      socket.off('printer_shop_found');
      socket.off('qr_code_generated');
    };
  }, []);

  const handleProceed = () => {
    socket.emit('confirm_printer_shop', {
      shopId: shopDetails.id
    });
    if (onComplete) {
      onComplete(shopDetails);
    }
  };

  return (
    <div className="printer-shop-locator">
      <h2>Nearest Printer Shop</h2>
      
      {isLoading ? (
        <div className="loading">Finding nearest printer shop...</div>
      ) : (
        <>
          <div className="map-container">
            <div className="map-placeholder">
              Map View
              <small>Shows route to printer shop</small>
            </div>
          </div>

          <div className="shop-details">
            <h3>Shop Details</h3>
            <ul>
              <li><strong>Name:</strong> {shopDetails?.name || nearestShop.name}</li>
              <li><strong>Address:</strong> {shopDetails?.address || nearestShop.address}</li>
              <li><strong>Distance:</strong> {shopDetails?.distance || nearestShop.distance} km</li>
            </ul>
          </div>

          {qrCode && (
            <div className="qr-code">
              <h3>Your Print Job QR Code</h3>
              <div className="qr-placeholder">
                {qrCode}
              </div>
              <small>Show this to the printer shop staff</small>
            </div>
          )}

          <button 
            className="proceed-button"
            onClick={handleProceed}
          >
            Proceed to Printing
          </button>
        </>
      )}
    </div>
  );
}

export default PrinterShopLocator;
