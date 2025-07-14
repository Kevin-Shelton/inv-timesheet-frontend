import React from 'react';
import './DashboardNamespaced.css';

export default function WeeklyChart() {
  return (
    <div className="dashboard-page weekly-chart-wrapper">
      <h3 className="dashboard-page section-title">Weekly Hours Chart</h3>
      <div className="dashboard-page weekly-chart">
        {/* Sample bar chart - replace with actual data later */}
        <div className="chart-bar-group">
          <div className="chart-bar" style={{ height: '30%' }} />
          <div className="chart-bar" style={{ height: '60%' }} />
          <div className="chart-bar" style={{ height: '50%' }} />
          <div className="chart-bar" style={{ height: '80%' }} />
          <div className="chart-bar" style={{ height: '20%' }} />
          <div className="chart-bar" style={{ height: '40%' }} />
          <div className="chart-bar" style={{ height: '70%' }} />
        </div>

        {/* Y-axis labels */}
        <div className="chart-y-axis">
          {[0, 2, 4, 6, 8, 10].map((hour) => (
            <div key={hour} className="y-label">
              {hour}h
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="chart-x-axis">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="x-label">
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
