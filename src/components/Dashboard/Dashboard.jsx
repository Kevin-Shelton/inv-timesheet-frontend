import React from 'react';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import ActivityRing from './ActivityRing';
import WeeklyChart from './WeeklyChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import './Dashboard.css';
import './DashboardNamespaced.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page with-sidebar">
      <div className="dashboard-main">
        {/* Top row: Welcome and Holiday cards side-by-side, equal width/height */}
        <div className="dashboard-row dashboard-top-row">
          <div className="dashboard-col welcome">
            <WelcomeCard />
          </div>
          <div className="dashboard-col holidays">
            <HolidaySection />
          </div>
        </div>

        {/* Middle row: Weekly Chart */}
        <div className="dashboard-row">
          <div className="dashboard-col wide">
            <WeeklyChart />
          </div>
        </div>

        {/* Bottom row: Activity Ring */}
        <div className="dashboard-row">
          <div className="dashboard-col activity">
            <ActivityRing />
          </div>
        </div>
      </div>

      {/* Sidebar: Who's In/Out Panel */}
      <div className="dashboard-sidebar">
        <WhoIsInOutPanel />
      </div>
    </div>
  );
};

export default Dashboard;
