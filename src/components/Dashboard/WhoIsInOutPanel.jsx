import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
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
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="whoisinout-panel">
      <div className="whoisinout-header">
        <h2>Who's in/out</h2>
        <p>1 member</p>
      </div>

      <div className="whoisinout-tabs">
        <div className="tab selected">0<br /><span>IN</span></div>
        <div className="tab">0<br /><span>BREAK</span></div>
        <div className="tab">1<br /><span>OUT</span></div>
      </div>

      <div className="whoisinout-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="      Search members..."
          className="search-input"
        />
      </div>

      <div className="whoisinout-time">
        <div className="clock">{timeString}</div>
        <div className="date">{dateString}</div>
        <div className="empty-note">No members clocked in now</div>
      </div>
    </div>
  );
}
