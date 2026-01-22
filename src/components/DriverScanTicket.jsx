import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import jsQR from 'jsqr';

export default function DriverScanTicket() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Camera stream handling
  useEffect(() => {
    if (scanning && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      
      video.onloadedmetadata = () => {
        video.play().catch(e => console.error("Play error:", e));
        scanIntervalRef.current = setInterval(scanFrame, 300);
      };
    }
  }, [scanning]);

  const startScanning = async () => {
    try {
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      setScanning(true);
    } catch (error) {
      console.error('Camera error:', error);
      alert('Unable to access camera. Please allow permissions.');
      setManualEntry(true);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setScanning(false);
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    try {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth' 
      });
      
      if (code && code.data) {
        // Visual feedback (Green Box)
        context.beginPath();
        context.lineWidth = 4;
        context.strokeStyle = "#00FF00";
        context.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
        context.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
        context.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
        context.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
        context.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
        context.stroke();

        stopScanning(); 
        verifyTicket(code.data); 
      }
    } catch (error) {
      console.error('Error scanning frame:', error);
    }
  };

  const verifyTicket = async (qrData) => {
    setLoading(true);
    try {
      let ticketData;
      try {
        ticketData = JSON.parse(qrData);
      } catch {
        ticketData = { ticket_number: qrData };
      }

      if (!ticketData.ticket_number) {
         throw new Error("Invalid QR Code format");
      }

      const response = await fetch(`${API_BASE_URL}/verify_ticket.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_number: ticketData.ticket_number,
          driver_id: user.user_id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          ticket: data.ticket,
          message: data.message
        });
      } else {
        setResult({
          success: false,
          message: data.message || 'Ticket verification failed'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setResult({
        success: false,
        message: 'Error verifying ticket. Invalid Data.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = () => {
    if (!ticketNumber.trim()) {
      alert('Please enter a ticket number');
      return;
    }
    verifyTicket(ticketNumber);
  };

// ✅ FIXED: Handles Transparent PNGs & Inverted Colors
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // 👇 CRITICAL FIX: Fill background with WHITE first
            // This fixes issues with Transparent PNGs
            ctx.fillStyle = "#FFFFFF"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Then draw the image on top
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Attempt scan with inversion allowed
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth'
            });
            
            if (code && code.data) {
                verifyTicket(code.data);
                setUploadMode(false);
            } else {
                setLoading(false);
                alert('No QR code found. If the image is valid, try taking a screenshot of it and uploading.');
            }
        } catch (err) {
            console.error("Image process error", err);
            setLoading(false);
            alert("Error processing image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const resetScanner = () => {
    setResult(null);
    setManualEntry(false);
    setTicketNumber('');
    setUploadMode(false);
  };

  return (
    <div className="driver-scanner-container">
      <h2 style={{ marginTop: 0, color: '#2d3748' }}>📷 Scan Ticket</h2>

      {!result && !scanning && !manualEntry && !uploadMode && (
        <div className="scanner-controls">
          <button className="driver-btn driver-btn-primary" onClick={startScanning}>
            <span>📷</span> Start Camera Scan
          </button>
          {/* <button className="driver-btn driver-btn-secondary" onClick={() => setUploadMode(true)}>
            <span>🖼️</span> Upload QR Image
          </button> */}
          <button className="driver-btn driver-btn-secondary" onClick={() => setManualEntry(true)}>
            <span>⌨️</span> Manual Entry
          </button>
        </div>
      )}

      {scanning && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '3px solid #667eea',
            background: 'black'
          }}>
            <video
              ref={videoRef}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              playsInline
              muted
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              border: '2px solid rgba(255, 255, 255, 0.7)',
              borderRadius: '10px',
              boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.5)'
            }}></div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button 
            className="driver-btn driver-btn-danger" 
            onClick={stopScanning}
            style={{ marginTop: '20px' }}
          >
            Stop Scanning
          </button>
        </div>
      )}

      {uploadMode && !result && (
        <div style={{ textAlign: 'center' }}>
          <div className="qr-upload-area" onClick={() => document.getElementById('qr-upload').click()}>
            <input
              id="qr-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📤</div>
            <p>Click to Upload QR Image</p>
          </div>
          <br />
          <button className="driver-btn driver-btn-secondary" onClick={resetScanner}>Back</button>
        </div>
      )}

      {manualEntry && !result && (
        <div className="manual-entry-form">
          <input
            type="text"
            className="driver-input"
            placeholder="Enter Ticket Number"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
          />
          <button className="driver-btn driver-btn-success" onClick={handleManualVerify}>Verify</button>
          <button className="driver-btn driver-btn-secondary" onClick={resetScanner}>Back</button>
        </div>
      )}

      {result && (
        <div className={`ticket-result ${result.success ? 'success' : 'error'}`}>
          <div className="ticket-result-icon">{result.success ? '✅' : '❌'}</div>
          <h3>{result.success ? 'Valid Ticket' : 'Invalid Ticket'}</h3>
          <p>{result.message}</p>
          
          {result.success && result.ticket && (
            <div className="ticket-result-details">
              <p><strong>Ticket:</strong> {result.ticket.ticket_number}</p>
              <p><strong>Passenger:</strong> {result.ticket.passenger_name}</p>
              <p><strong>Seats:</strong> {result.ticket.seat_numbers}</p>
              <p><strong>Date:</strong> {result.ticket.travel_date}</p>
            </div>
          )}
          
          <button className="driver-btn driver-btn-primary" onClick={resetScanner}>
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
}