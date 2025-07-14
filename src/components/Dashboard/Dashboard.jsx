import React from 'react';
import { ActivityRing } from './ActivityRing';
import { WeeklyChart } from './WeeklyChart';
import { HolidaySection } from './HolidaySection';
import { CurrentTime } from './CurrentTime';

export function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div className="dashboard-controls">
          <div className="toggle-buttons">
            <button className="active">Day</button>
            <button>Week</button>
            <button>Month</button>
          </div>
          <div className="filters">
            <select><option>All Locations</option></select>
            <select><option>All Groups</option></select>
            <select><option>All Schedules</option></select>
          </div>
        </div>

        <div className="filters-secondary">
          <select><option>Campaign</option></select>
          <select><option>Managed by Me</option></select>
          <select><option>Personal</option></select>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="left-column">
          <div className="greeting-card">
            <h2>Hello Kevin</h2>
            <p>Here's what's happening at Egis</p>
          </div>
          <HolidaySection />
          <div className="weekly-chart-card">
            <WeeklyChart />
          </div>
          <div className="activity-ring-card">
            <ActivityRing />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="sidebar">
          <div className="in-out-widget">
            <h4>Who's in/out</h4>
            <ul>
              <li>John Doe <span className="status in">In</span></li>
              <li>Jane Smith <span className="status out">Out</span></li>
            </ul>
          </div>
          <CurrentTime />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
