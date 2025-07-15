// src/components/Dashboard/WeeklyChart.jsx
import { useState } from 'react';
import './DashboardNamespaced.css';

const heights = [30, 60, 50, 80, 20, 40, 70]; // Example data
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyChart() {
  const [tooltip, setTooltip] = useState({ show: false, day: '', value: '', x: 0, y: 0 });

  return (
    <div className="dashboard-page tracked-hours-section">
      <h3 className="section-title">Tracked Hours</h3>

      <div className="weekly-chart">
        <div className="chart-bar-group">
          {heights.map((height, i) => (
            <div
              key={i}
              className="chart-bar animated-bar"
              style={{ height: `${height}%` }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  show: true,
                  day: days[i],
                  value: `${(height / 10).toFixed(1)}h`,
                  x: rect.left + rect.width / 2,
                  y: rect.top - 30
                });
              }}
              onMouseLeave={() => setTooltip({ show: false })}
            />
          ))}
        </div>

        <div className="chart-y-axis">
          {[0, 2, 4, 6, 8, 10].map((hour) => (
            <div key={hour} className="y-label">
              {hour}h
            </div>
          ))}
        </div>

        <div className="chart-x-axis">
          {days.map((day) => (
            <div key={day} className="x-label">
              {day}
            </div>
          ))}
        </div>
      </div>

      {tooltip.show && (
        <div
          className="chart-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: '#fff',
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          {tooltip.day}: {tooltip.value}
        </div>
      )}
    </div>
  );
}
