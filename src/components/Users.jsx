import React, { useState } from "react";
import "../assets/styles.css";

export default function Users() {

  const [formData, setFormData] = useState({
    fullname: "",
    gender: "",
    dob: "",
    nic: "",
    address1: "",
    address2: "",
    city: "",
    mobile: "",
    usertype: "",
    gmail: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost/qrsys/api/register_api.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.status) {
        alert("User Registered Successfully");
        setFormData({
          fullname: "",
          gender: "",
          dob: "",
          nic: "",
          address1: "",
          address2: "",
          city: "",
          mobile: "",
          usertype: "",
          gmail: "",
          password: ""
        });
      } else {
        alert(result.message || "Registration Failed");
      }

    } catch (error) {
      alert("Server Error");
      console.error(error);
    }
  };

  return (
    <div className="main-center">
      <div className="form-container">
        <form onSubmit={handleSubmit}>

          <h2 className="form-title">User Registration</h2>

          <label className="form-label">Full Name*</label>
          <input
            type="text"
            name="fullname"
            className="form-input"
            value={formData.fullname}
            onChange={handleChange}
            required
          />

          <label className="form-label">Gender*</label>
          <select
            name="gender"
            className="form-select"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label className="form-label">Date of Birth*</label>
          <input
            type="date"
            name="dob"
            className="form-input"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <label className="form-label">NIC Number*</label>
          <input
            type="text"
            name="nic"
            className="form-input"
            value={formData.nic}
            onChange={handleChange}
            required
          />

          <label className="form-label">Street Address (Line 1)*</label>
          <input
            type="text"
            name="address1"
            className="form-input"
            value={formData.address1}
            onChange={handleChange}
            required
          />

          <label className="form-label">Street Address (Line 2)</label>
          <input
            type="text"
            name="address2"
            className="form-input"
            value={formData.address2}
            onChange={handleChange}
          />

          <label className="form-label">City / Town*</label>
          <input
            type="text"
            name="city"
            className="form-input"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <label className="form-label">Contact Number*</label>
          <input
            type="tel"
            name="mobile"
            className="form-input"
            value={formData.mobile}
            onChange={handleChange}
            required
          />

          <label className="form-label">User Role*</label>
          <select
            name="usertype"
            className="form-select"
            value={formData.usertype}
            onChange={handleChange}
            required
          >
            <option value="">Select User Role</option>
            <option value="admin">Administrator</option>
            <option value="bus_operator">Bus Operator</option>
            <option value="bus_driver">Bus Driver</option>
            <option value="passenger">Passenger</option>
          </select>

          <label className="form-label">Gmail*</label>
          <input
            type="gmail"
            name="gmail"
            className="form-input"
            value={formData.gmail}
            onChange={handleChange}
            required
          />

          <label className="form-label">Password*</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="form-checkbox-row">
            <input type="checkbox" required />
            <span>I confirm these information are accurate.</span>
          </div>

          <button type="submit" className="form-btn">
            Register Now
          </button>

        </form>
      </div>
    </div>
  );
}