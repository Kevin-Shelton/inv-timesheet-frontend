// src/components/Dashboard/WhosInOutPanel.jsx
import React from 'react';
import './DashboardNamespaced.css';

export default function WhosInOutPanel() {
  return (
    <div className="dashboard-page whos-inout">
      <div className="header">Who's in/out</div>
      <div className="subtext">1 member</div>

      <div className="tabs">
        <div className="tab active">0<br /><span>IN</span></div>
        <div className="tab">0<br /><span>BREAK</span></div>
        <div className="tab">1<br /><span>OUT</span></div>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search members..."
        disabled
      />

      <div className="clock">2:23 pm</div>
      <div className="date">Tue, Jul 15</div>
      <div className="status-msg">No members clocked in now</div>
    </div>
  );
}
