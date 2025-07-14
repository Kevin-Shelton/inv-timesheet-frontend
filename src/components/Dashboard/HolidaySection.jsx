import React from 'react';
import './DashboardNamespaced.css';

export function HolidaySection() {
  return (
    <div className="dashboard-page card holiday-section">
      <h3 className="dashboard-page section-title">Upcoming Holidays and Time Off</h3>

      <div className="dashboard-page holiday-content">
        <div className="dashboard-page holiday-illustration">
          <div className="dashboard-page calendar-icon">📅</div>
        </div>

        <div className="dashboard-page holiday-text">
          <p className="dashboard-page holiday-message">
            Add your holiday calendar for<br />
            reminders and overtime calculations.
          </p>
        </div>

        <div className="dashboard-page holiday-actions">
          <button className="dashboard-page setup-holidays-btn">Set up Holidays</button>
          <button className="dashboard-page no-thanks-btn">No, thanks</button>
        </div>
      </div>
    </div>
  );
}
