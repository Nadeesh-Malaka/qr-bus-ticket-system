import React, { useState } from "react";
import "../assets/styles.css";

export default function BusData() {
  const [message, setMessage] = useState("");

  const [bus_no, setBusNo] = useState("");
  const [bus_route, setBusRoute] = useState("");
  const [seat_count, setSeatCount] = useState("");
  const [seat_rows, setSeatRows] = useState("");
  const [seat_columns, setSeatColumns] = useState("");
  const [aisle_after_column, setAisle] = useState(""); 
  const [bus_service_tel, setServiceTel] = useState("");
  const [start_time, setStartTime] = useState("");
  const [reach_time, setReachTime] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost/qrsys/api/bus_api.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            bus_no,
            bus_route,
            seat_count: Number(seat_count),
            seat_rows,
            seat_columns,
            aisle_after_column,
            bus_service_tel,
            start_time,
            reach_time,
            date,
          }),
        }
      );

      const res = await response.json();

      if (res.status) {
        setMessage("✅ " + res.message);
        setBusNo("");
        setBusRoute("");
        setSeatCount("");
        setSeatRows("");
        setSeatColumns("");
        setAisle("");
        setServiceTel("");
        setStartTime("");
        setReachTime("");
        setDate("");
      } else {
        setMessage("❌ " + (res.message || "Operation failed"));
      }
    } catch (error) {
      setMessage("❌ Server error. Check API");
    }
  };

  return (
    <div className="main-center">
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">Add Bus</h2>

          <label className="form-label">Bus No*</label>
          <input className="form-input" value={bus_no} onChange={(e) => setBusNo(e.target.value)} required />

          <label className="form-label">Bus Route*</label>
          <select className="form-select" value={bus_route} onChange={(e) => setBusRoute(e.target.value)} required>
            <option value="">Select Route</option>
             <option value="100-Colombo">100</option>
						 <option value="101-Colombo">101</option>
						 <option value="102-Colombo">102</option>
						 <option value="103-Colombo">103</option>
						 <option value="104-Colombo">104</option>
						 <option value="107-Colombo">107</option>
						 <option value="112-Colombo">112</option>
						 <option value="113-Colombo">113</option>
						 <option value="117-Colombo">117</option>
						 <option value="118-Colombo">118</option>
						 <option value="120-Colombo">120</option>
						 <option value="121-Colombo">121</option>
						 <option value="122-Colombo">122</option>
						 <option value="122/1-Colombo">122/1</option>
						 <option value="125-Colombo">125</option>
						 <option value="130-Colombo">130</option>
						 <option value="133-Colombo">133</option>
						 <option value="134-Colombo">134</option>
						 <option value="135-Colombo">135</option>
						 <option value="136-Colombo">136</option>
          </select>

          <label className="form-label">Seat Count*</label>
          <input
            className="form-input"
            type="number"
            value={seat_count}
            onChange={(e) => setSeatCount(e.target.value)}
            required
          />

          <label className="form-label">No. of Seat Rows*</label>
          <input
            className="form-input"
            type="number"
            value={seat_rows}
            onChange={(e) => setSeatRows(e.target.value)}
            required
          />

           <label className="form-label">No. of Seat Columns*</label>
          <input
            className="form-input"
            type="number"
            value={seat_columns}
            onChange={(e) => setSeatColumns(e.target.value)}
            required
          />

           <label className="form-label">Aisle After Column*</label>
          <input
            className="form-input"
            type="number"
            value={aisle_after_column}
            onChange={(e) => setAisle(e.target.value)}
            required
          />

           <label className="form-label">Service Tel*</label>
          <input
            className="form-input"
            type="text"
            value={bus_service_tel}
            onChange={(e) => setServiceTel(e.target.value)}
            required
          />

          <label className="form-label">Start Time*</label>
          <input
            className="form-input"
            type="time"
            value={start_time}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <label className="form-label">Reach Time*</label>
          <input
            className="form-input"
            type="time"
            value={reach_time}
            onChange={(e) => setReachTime(e.target.value)}
            required
          />

          <label className="form-label">Date*</label>
          <input
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <button type="submit" className="form-btn">Add Bus</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
