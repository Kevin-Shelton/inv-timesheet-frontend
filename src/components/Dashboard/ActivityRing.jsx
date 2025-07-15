import React, { useState, useEffect } from 'react';
import './DashboardNamespaced.css';

const dummyActivities = [
  { name: 'Admin', color: '#3b5fc5' },
  { name: 'Support', color: '#56698f' },
  { name: 'Dev', color: '#8b95a5' },
  { name: 'QA', color: '#cfd3db' },
  { name: 'Meetings', color: '#e3e5e9' }
];

export default function ActivityRing() {
  const [tooltip, setTooltip] = useState({ show: false, label: '', x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page activity-summary-section">
      <h3 className="section-title">Activities</h3>

      <div className="activity-content">
        <div className="activity-ring">
          <svg viewBox="0 0 36 36" className="circular-chart">
            <circle className="bg" cx="18" cy="18" r="15.9155" />
            <circle
              className="progress"
              cx="18"
              cy="18"
              r="15.9155"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <text x="18" y="20.35" className="ring-label">clocked</text>
            <text x="18" y="26.35" className="ring-value">0h 0m</text>
          </svg>
        </div>

        <div className="activity-legend">
          <h4>Top 10 activities</h4>
          <div className="legend-columns">
            {[0, 1].map((col) => (
              <div key={col} className="legend-col">
                {dummyActivities.map((act, idx) => (
                  <div
                    key={idx + col * 10}
                    className="legend-item"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        show: true,
                        label: act.name,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10
                      });
                    }}
                    onMouseLeave={() => setTooltip({ show: false })}
                  >
                    <span className="dot" style={{ backgroundColor: act.color }}></span>
                    <div className="legend-line"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltip.show && (
        <div
          className="chart-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: '#000',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            position: 'fixed',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}
