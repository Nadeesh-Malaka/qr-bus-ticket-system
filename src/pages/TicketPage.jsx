import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

export default function TicketPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [ticketData, setTicketData] = useState(location.state?.ticketData || null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!ticketData) {
      navigate('/');
    }
  }, [ticketData]);

  const handleDownloadTicket = () => {
    setDownloading(true);
    
    // Create a printable version
    const printContent = document.getElementById('ticket-content');
    const printWindow = window.open('', '', 'height=600,width=800');
    
    printWindow.document.write('<html><head><title>Bus Ticket</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      .ticket-container { max-width: 600px; margin: 0 auto; border: 2px solid #007bff; border-radius: 10px; padding: 30px; }
      .ticket-header { text-align: center; border-bottom: 2px dashed #007bff; padding-bottom: 20px; margin-bottom: 20px; }
      .ticket-info { margin: 15px 0; }
      .ticket-info strong { display: inline-block; width: 150px; }
      .qr-section { text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
      .seats-display { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
      .seat-badge { background: #28a745; color: white; padding: 8px 15px; border-radius: 5px; font-weight: bold; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setDownloading(false);
    }, 250);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `ticket-${ticketData.ticket_number}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!ticketData) {
    return null;
  }

  return (
    <>
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {/* Success Message */}
            <div className="alert alert-success text-center mb-4" role="alert">
              <h4 className="alert-heading">
                <i className="icon-check-circle"></i> Payment Successful!
              </h4>
              <p className="mb-0">Your booking has been confirmed. Ticket details below.</p>
            </div>

            {/* Ticket Display */}
            <div className="card shadow-lg" id="ticket-content">
              <div className="card-header bg-primary text-white text-center py-4">
                <h3 className="mb-2">
                  <i className="icon-bus"></i> ExpressBook E-Ticket
                </h3>
                <p className="mb-0">Your Journey, Simplified</p>
              </div>
              
              <div className="card-body p-5">
                {/* Ticket Number */}
                <div className="text-center mb-4 pb-4 border-bottom">
                  <h5 className="text-muted mb-2">Ticket Number</h5>
                  <h2 className="text-primary mb-0" style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>
                    {ticketData.ticket_number}
                  </h2>
                  <small className="text-muted">Booking Ref: {ticketData.booking_ref}</small>
                </div>

                {/* Journey Details */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <div className="p-3 bg-light rounded">
                      <strong className="d-block text-muted mb-2">
                        <i className="icon-bus"></i> Bus Number
                      </strong>
                      <h5 className="mb-0 text-primary">{ticketData.bus_no}</h5>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="p-3 bg-light rounded">
                      <strong className="d-block text-muted mb-2">
                        <i className="icon-route"></i> Route
                      </strong>
                      <h6 className="mb-0">{ticketData.bus_route}</h6>
                    </div>
                  </div>
                </div>

                {/* Passenger & Date */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <strong className="d-block text-muted mb-2">
                      <i className="icon-user"></i> Passenger Name
                    </strong>
                    <p className="mb-0 h6">{ticketData.passenger_name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong className="d-block text-muted mb-2">
                      <i className="icon-calendar"></i> Travel Date
                    </strong>
                    <p className="mb-0 h6">
                      {new Date(ticketData.travel_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Seats */}
                <div className="mb-4">
                  <strong className="d-block text-muted mb-2">
                    <i className="icon-grid"></i> Seat Numbers
                  </strong>
                  <div className="d-flex flex-wrap gap-2">
                    {ticketData.seats?.map((seat, index) => (
                      <span 
                        key={index} 
                        className="badge bg-success"
                        style={{ fontSize: '16px', padding: '10px 15px' }}
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <div className="alert alert-info d-flex justify-content-between align-items-center">
                    <strong>Total Amount Paid:</strong>
                    <h4 className="mb-0 text-success">Rs. {ticketData.total_amount?.toFixed(2)}</h4>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center p-4 bg-light rounded">
                  <h5 className="mb-3">Scan QR Code for Verification</h5>
                  <div className="d-inline-block p-3 bg-white rounded shadow-sm">
                    <QRCodeSVG 
                      id="qr-code-svg"
                      value={ticketData.qr_code_data}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-muted mt-3 mb-0">
                    <small>Show this QR code to the bus conductor for verification</small>
                  </p>
                </div>

                {/* Important Notes */}
                <div className="alert alert-warning mt-4">
                  <h6><i className="icon-info-circle"></i> Important Notes:</h6>
                  <ul className="mb-0" style={{ fontSize: '14px' }}>
                    <li>Please arrive at the boarding point 15 minutes before departure</li>
                    <li>Carry a valid ID proof along with this ticket</li>
                    <li>This ticket is non-transferable</li>
                    <li>Take a screenshot or download this ticket for offline access</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="card-footer bg-light text-center">
                <small className="text-muted">
                  Powered by ExpressBook | For support: +94 118 1234 23
                </small>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="row mt-4 mb-5">
              <div className="col-md-4 mb-2">
                <button 
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleDownloadTicket}
                  disabled={downloading}
                >
                  <i className="icon-printer"></i> Print Ticket
                </button>
              </div>
              <div className="col-md-4 mb-2">
                <button 
                  className="btn btn-success btn-lg w-100"
                  onClick={handleDownloadQR}
                >
                  <i className="icon-download"></i> Download QR
                </button>
              </div>
              <div className="col-md-4 mb-2">
                <button 
                  className="btn btn-outline-secondary btn-lg w-100"
                  onClick={() => navigate('/')}
                >
                  <i className="icon-home"></i> Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
