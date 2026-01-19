import React from "react";
import { Link } from "react-router-dom";

export default function NavbarOne() {
  return (
    <nav
      style={{
        background: "#363430",
        padding: "10px",
        textAlign: "right",
      }}
    >
      <Link to="/" style={{ marginRight: "20px", color: "#ffffff" }}>
        Home
      </Link>
    </nav>
  );
}