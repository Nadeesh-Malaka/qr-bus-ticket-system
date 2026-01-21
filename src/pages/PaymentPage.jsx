import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PaymentPage() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const bookingData = location.state || {};
  const { bus, busId, busNo, travelDate, selectedSeats, totalAmount, passengerCount, bookingId, fromPendingBooking } = bookingData;

  useEffect(() => {
    if (!user || !busId || !selectedSeats || selectedSeats.length === 0) {
      navigate('/');
    }
  }, [user, busId, selectedSeats]);

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g);
    return formatted ? formatted.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const validateForm = () => {
    if (cardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return false;
    }
    if (!cardName.trim()) {
      alert('Please enter cardholder name');
      return false;
    }
    if (expiryDate.length !== 5) {
      alert('Please enter expiry date (MM/YY)');
      return false;
    }
    if (cvv.length !== 3) {
      alert('Please enter 3-digit CVV');
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      let finalBookingId = bookingId;
      
      // Step 1: Save booking with pending status (only if not from pending booking)
      if (!fromPendingBooking) {
        const bookingPayload = {
          user_id: user.user_id,
          bus_no: busNo,
          bus_id: busId,
          passenger_name: user.full_name,
          travel_date: travelDate,
          selected_seats: selectedSeats,
          passenger_count: passengerCount,
          total_amount: totalAmount,
          booking_status: 'pending'
        };

        console.log('Booking Payload:', bookingPayload);
        console.log('User Object:', user);

        const bookingResponse = await fetch('http://localhost/qrsys/api/save_booking_v2.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingPayload)
        });

        const bookingResult = await bookingResponse.json();

        if (!bookingResult.success) {
          throw new Error(bookingResult.message || 'Failed to save booking');
        }

        finalBookingId = bookingResult.booking_id;
      }

      // Step 2: Simulate payment processing (wait 2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Process payment
      const paymentPayload = {
        booking_id: finalBookingId,
        user_id: user.user_id,
        amount: totalAmount,
        card_last_four: cardNumber.slice(-4),
        payment_method: 'CARD'
      };

      const paymentResponse = await fetch('http://localhost/qrsys/api/process_payment.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPayload)
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // Navigate to ticket page
        navigate('/ticket', {
          state: {
            ticketData: paymentResult.ticket,
            bookingId: bookingId,
            transactionId: paymentResult.transaction_id
          }
        });
      } else {
        throw new Error(paymentResult.message || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="row">
              {/* Payment Form */}
              <div className="col-md-7">
                <div className="card shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="icon-credit-card"></i> Payment Details
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    {/* <div className="alert alert-info mb-4">
                      <i className="icon-info-circle"></i> This is a simulated payment. No real transaction will occur.
                    </div> */}

                    <form onSubmit={handlePayment}>
                      {/* Card Number */}
                      <div className="mb-4">
                        <label className="form-label">Card Number <span className="text-danger">*</span></label>
                        <input 
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="1234 5678 9012 3456"
                          value={formatCardNumber(cardNumber)}
                          onChange={handleCardNumberChange}
                          maxLength="19"
                          required
                          style={{ 
                            letterSpacing: '2px',
                            fontFamily: 'monospace',
                            fontSize: '18px'
                          }}
                        />
                      </div>

                      {/* Card Name */}
                      <div className="mb-4">
                        <label className="form-label">Cardholder Name <span className="text-danger">*</span></label>
                        <input 
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="JOHN DOE"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          required
                          style={{ textTransform: 'uppercase' }}
                        />
                      </div>

                      {/* Expiry and CVV */}
                      <div className="row">
                        <div className="col-md-6 mb-4">
                          <label className="form-label">Expiry Date <span className="text-danger">*</span></label>
                          <input 
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={handleExpiryChange}
                            maxLength="5"
                            required
                            style={{ 
                              fontFamily: 'monospace',
                              fontSize: '18px'
                            }}
                          />
                        </div>
                        <div className="col-md-6 mb-4">
                          <label className="form-label">CVV <span className="text-danger">*</span></label>
                          <input 
                            type="password"
                            className="form-control form-control-lg"
                            placeholder="123"
                            value={cvv}
                            onChange={handleCvvChange}
                            maxLength="3"
                            required
                            style={{ 
                              fontFamily: 'monospace',
                              fontSize: '18px'
                            }}
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button 
                        type="submit" 
                        className="btn btn-success btn-lg w-100 mt-3"
                        disabled={processing}
                        style={{
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '18px',
                          padding: '15px'
                        }}
                      >
                        {processing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <i className="icon-lock"></i> Pay Rs. {totalAmount?.toFixed(2)}
                          </>
                        )}
                      </button>

                      <button 
                        type="button"
                        className="btn btn-outline-secondary w-100 mt-2"
                        onClick={() => navigate(-1)}
                        disabled={processing}
                      >
                        Cancel
                      </button>
                    </form>

                    {/* Security Info */}
                    <div className="mt-4 text-center">
                      <small className="text-muted">
                        <i className="icon-shield"></i> Your payment is secure and encrypted
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="col-md-5">
                <div className="card shadow-sm">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Booking Summary</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Bus:</strong> {busNo}
                    </div>
                    <div className="mb-3">
                      <strong>Route:</strong> {bus?.bus_route}
                    </div>
                    <div className="mb-3">
                      <strong>Travel Date:</strong><br />
                      <span className="text-primary">
                        {new Date(travelDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="mb-3">
                      <strong>Passenger:</strong> {user?.full_name}
                    </div>
                    <div className="mb-3">
                      <strong>Selected Seats:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {selectedSeats?.map(seat => (
                          <span key={seat} className="badge bg-success" style={{ fontSize: '14px', padding: '8px 12px' }}>
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <hr />
                    
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Fare per seat:</span>
                        <span>Rs. {bus?.base_fare || 100}</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Number of seats:</span>
                        <span>× {selectedSeats?.length}</span>
                      </div>
                    </div>
                    
                    <div className="alert alert-success">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong>Total Amount:</strong>
                        <h3 className="mb-0 text-success">Rs. {totalAmount?.toFixed(2)}</h3>
                      </div>
                    </div>

                    <div className="alert alert-warning">
                      <small>
                        <i className="icon-info-circle"></i> Please review your booking details before payment
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
