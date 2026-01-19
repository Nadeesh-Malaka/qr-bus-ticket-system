import React, { useState } from "react";
import "../assets/styles.css";

export default function RouteData() {
  const [message, setMessage] = useState("");

  const [route_name, setRouteName] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postal_code, setPostalCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost/qrsys/api/route_api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          route_name,
          city,
          province,
          postal_code,
        }),
      });

      const res = await response.json();

      if (res.status) {
        setMessage("✅ Route added successfully");
        setRouteName("");
        setCity("");
        setProvince("");
        setPostalCode("");
      } else {
        setMessage("❌ " + res.message);
      }
    } catch (error) {
      setMessage("❌ Server error. Check API");
    }
  };

  return (
    <div className="main-center">
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">Add Route</h2>

          <label className="form-label">Route*</label>
          <select
            value={route_name}
            onChange={(e) => setRouteName(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select Bus Route</option>
            <option value="100-Colombo">100_Pettah - Panadura / Moratuwa</option>
						 <option value="101-Colombo">101_Pettah - Moratuwa</option>
						 <option value="102-Colombo">102_Kotahena - Moratuwa(Angulana)</option>
						 <option value="103-Colombo">103_Fort - Narahenpita / Borella</option>
						 <option value="104-Colombo">104_Bambalapitiya - Wattala / Ja Ela</option>
						 <option value="107-Colombo">107_Fort - Elakanda</option>
						 <option value="112-Colombo">112_Kotahena - Maharagama</option>
						 <option value="113-Colombo">113_Fort - Nugegoda / Udahamulla</option>
						 <option value="117-Colombo">117_Rathmalana - Nugegoda</option>
						 <option value="118-Colombo">118_Beddagana - Dehiwala</option>
						 <option value="120-Colombo">120_Pettah - Piliyandala / Kesbewa / Horana</option>
						 <option value="121-Colombo">121_Wijerama Junction / Pirivena Junction</option>
						 <option value="122-Colombo">122_Pettah - Avissawella</option>
						 <option value="122/1-Colombo">122/1_Avissawella - Sri J'pura Hospital</option>
						 <option value="125-Colombo">125_Pettah - Padukka  Ingiriya</option>
						 <option value="130-Colombo">130_Pettah - Mattagoda</option>
						 <option value="133-Colombo">133_Pettah - Mt.Lavinia</option>
						 <option value="134-Colombo">134_Kollupitiya - Mulleriyawa</option>
						 <option value="135-Colombo">135_Kohuwala - Kelaniya</option>
						 <option value="136-Colombo">136_Pettah - Rukmalgama</option>
          </select>

          <label className="form-label">City*</label>
          <input
            type="text"
            className="form-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />

          <label className="form-label">Province*</label>
          <input
            type="text"
            className="form-input"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
          />

          <label className="form-label">Postal Code*</label>
          <input
            type="number"
            className="form-input"
            value={postal_code}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />

          <button type="submit" className="form-btn">
            Add Route
          </button>
        </form>

        <p>{message}</p>
      </div>
    </div>
  );
}