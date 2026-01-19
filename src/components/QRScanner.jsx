import React, { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../assets/styles.css';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const startScanner = () => {
    setScanning(true);
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText, decodedResult) {
      // Verify ticket
      verifyTicket(decodedText);
      scanner.clear();
      setScanning(false);
    }

    function onScanError(error) {
      console.warn(`QR scan error: ${error}`);
    }
  };

  const verifyTicket = async (qrData) => {
    try {
      const response = await fetch('http://localhost/qrsys/api/verify_ticket.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData })
      });

      const result = await response.json();
      setScanResult(result);
    } catch (error) {
      setScanResult({
        status: false,
        message: 'Server error'
      });
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>QR Code Ticket Scanner</h2>

      {!scanning && !scanResult && (
        <button
          onClick={startScanner}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Start Scanning
        </button>
      )}

      <div id="qr-reader" style={{ marginTop: '20px' }}></div>

      {scanResult && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: scanResult.status ? '#d4edda' : '#f8d7da',
          border: `1px solid ${scanResult.status ? '#c3e6cb' : '#f5c6cb'}`,
          color: scanResult.status ? '#155724' : '#721c24'
        }}>
          <h3>{scanResult.status ? '✅ Valid Ticket' : '❌ Invalid Ticket'}</h3>
          <p>{scanResult.message}</p>
          {scanResult.data && (
            <div style={{ marginTop: '15px', fontSize: '14px' }}>
              <p><strong>Passenger:</strong> {scanResult.data.passenger_name}</p>
              <p><strong>Booking ID:</strong> {scanResult.data.booking_id}</p>
              <p><strong>Seats:</strong> {scanResult.data.seats}</p>
            </div>
          )}
          <button
            onClick={() => {
              setScanResult(null);
              startScanner();
            }}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Scan Next Ticket
          </button>
        </div>
      )}
    </div>
  );
}
