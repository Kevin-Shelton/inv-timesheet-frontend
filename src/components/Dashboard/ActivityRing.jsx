import React from 'react';
import './DashboardNamespaced.css';

export default function ActivityRing() {
  return (
    <div className="dashboard-page activity-ring-section">
      <h3 className="dashboard-page section-title">Activity Summary</h3>

      <div className="dashboard-page ring-container">
        <svg viewBox="0 0 36 36" className="dashboard-page ring">
          <path
            className="dashboard-page ring-bg"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="dashboard-page ring-progress"
            strokeDasharray="70, 100"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <text x="18" y="20.35" className="dashboard-page ring-text">70%</text>
        </svg>
      </div>

      <p className="dashboard-page ring-description">
        You've completed 70% of your weekly goals.
      </p>
    </div>
  );
}
