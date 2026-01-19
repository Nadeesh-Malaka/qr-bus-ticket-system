import React from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";

const BusMap = ({ busRoute, busLocations }) => {
  if (!busRoute || busRoute.length === 0) return null;

  return (
    <MapContainer
      center={busRoute[0]} // ✅ ALWAYS valid
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route */}
      <Polyline positions={busRoute} pathOptions={{ color: "red" }} />

      {/* Buses */}
      {busLocations.map(
        (bus) =>
          bus.position && (
            <Marker key={bus.id} position={bus.position}>
              <Popup>
                <strong>{bus.name}</strong>
                <br />
                Live tracking
              </Popup>
            </Marker>
          )
      )}
    </MapContainer>
  );
};

export default BusMap;
