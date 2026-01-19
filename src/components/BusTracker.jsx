import React, { useEffect, useState } from "react";
import BusMap from "./BusMap";
import { busRoute, initialBusLocations } from "../data/busData";

const BusTracker = () => {
  const [busLocations, setBusLocations] = useState(initialBusLocations);

  useEffect(() => {
    const interval = setInterval(() => {
      setBusLocations((prevBuses) =>
        prevBuses.map((bus) => {
          const nextStep = (bus.step + 1) % busRoute.length;

          return {
            ...bus,
            step: nextStep,
            position: busRoute[nextStep], // ✅ ALWAYS valid
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{textAlign: "center"}}>Bus Route Tracker</h2>

      {/* SAFETY CHECK */}
      {busRoute.length > 0 && busLocations.length > 0 && (
        <BusMap busRoute={busRoute} busLocations={busLocations} />
      )}
    </div>
  );
};

export default BusTracker;

