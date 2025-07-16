import React, { useEffect, useState } from "react";
import "./DashboardNamespaced.css";

export default function WhoIsInOutPanel() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="whoisinoutpanel-container">
      <h2 className="panel-title">Who's In/Out</h2>
      <div className="whoisinoutpanel-content">
        <p>No data available.</p>
      </div>
      <div className="whoisinoutpanel-time">
        <p className="time">{timeString}</p>
        <p className="date">{dateString}</p>
      </div>
    </div>
  );
}
