// src/components/Dashboard/ActivityRing.jsx
import React from 'react';
import './DashboardNamespaced.css';

const dummyActivities = [
  { name: 'Admin', color: '#3b5fc5' },
  { name: 'Support', color: '#56698f' },
  { name: 'Dev', color: '#8b95a5' },
  { name: 'QA', color: '#cfd3db' },
  { name: 'Meetings', color: '#e3e5e9' }
];

export default function ActivityRing() {
  return (
    <div className="dashboard-page activity-summary-section">
      <h3 className="section-title">Activities</h3>

      <div className="activity-content">
        <div className="activity-ring">
          <svg viewBox="0 0 36 36" className="circular-chart">
            <circle className="bg" cx="18" cy="18" r="15.9155" />
            <circle className="progress" cx="18" cy="18" r="15.9155" />
            <text x="18" y="20.35" className="ring-label">clocked</text>
            <text x="18" y="26.35" className="ring-value">0h 0m</text>
          </svg>
        </div>

        <div className="activity-legend">
          <h4>Top 10 activities</h4>
          <div className="legend-columns">
            <div className="legend-col">
              {dummyActivities.map((act, idx) => (
                <div key={idx} className="legend-item">
                  <span className="dot" style={{ backgroundColor: act.color }}></span>
                  <div className="legend-line"></div>
                </div>
              ))}
            </div>
            <div className="legend-col">
              {dummyActivities.map((act, idx) => (
                <div key={`r-${idx}`} className="legend-item">
                  <span className="dot" style={{ backgroundColor: act.color }}></span>
                  <div className="legend-line"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
