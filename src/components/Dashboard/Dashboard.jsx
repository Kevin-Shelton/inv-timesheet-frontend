import React from 'react';
import './DashboardNamespaced.css';
import CurrentTime from './CurrentTime';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';

function Dashboard() {
  return (
    <div className="dashboard-page dashboard-reference-layout">
      <div className="dashboard-page dashboard-header-section">
        <div>
          <h2 className="dashboard-page hello-main-title">Dashboard</h2>
          <p className="dashboard-page hello-company-subtitle">Welcome back</p>
        </div>
        <div className="dashboard-page jibble-logo-orange">
          <span className="dashboard-page jibble-sigma">&#x3A3;</span>
        </div>
      </div>

      <div className="dashboard-page filter-bar">
        <div className="dashboard-page filter-group">
          <button>Day</button>
          <button>Week</button>
          <button>Month</button>
        </div>
        <div className="dashboard-page filter-group">
          <select><option>All Locations</option></select>
          <select><option>All Groups</option></select>
          <select><option>All Schedules</option></select>
        </div>
        <div className="dashboard-page filter-group">
          <select><option>Campaign</option></select>
          <select><option>Managed by Me</option></select>
          <select><option>Personal</option></select>
        </div>
      </div>

      <div className="dashboard-page dashboard-main-content">
        <div className="dashboard-page dashboard-left-content">
          <div className="dashboard-page card">
            <h3 className="dashboard-page holidays-title">Hello, Team</h3>
            <p className="dashboard-page no-holidays-text">You're doing great!</p>
          </div>

          <div className="dashboard-page card">
            <HolidaySection />
          </div>

          <div className="dashboard-page card">
            <WeeklyChart />
          </div>
        </div>

        <div className="dashboard-page dashboard-right-sidebar-wide">
          <div className="dashboard-page whos-inout-section-expanded">
            <h3 className="dashboard-page section-title">Who's In/Out</h3>
            <div className="dashboard-page members-list-scrollable">
              <div className="dashboard-page member-item">
                John Doe <span className="dashboard-page member-status in">In</span>
              </div>
              <div className="dashboard-page member-item">
                Jane Smith <span className="dashboard-page member-status out">Out</span>
              </div>
            </div>
          </div>

          <div className="dashboard-page current-time-section-compact">
            <CurrentTime />
          </div>

          <div className="dashboard-page card">
            <ActivityRing />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
