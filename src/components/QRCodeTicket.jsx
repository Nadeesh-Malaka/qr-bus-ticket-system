import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeTicket({ booking }) {
  return (
    <div className="qr-ticket">
      <h4>Bus Ticket</h4>
      <p>Name: {booking.passenger_name}</p>
      <p>Bus: {booking.bus_no}</p>
      <p>Seat: {booking.seat_no}</p>

      <QRCodeCanvas
        value={JSON.stringify(booking)}
        size={150}
      />
    </div>
  );
}
