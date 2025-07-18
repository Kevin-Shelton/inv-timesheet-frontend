import React from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import './DashboardNamespaced.css'; // Use existing CSS file (update its content with consolidated styles)

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <DashboardHeader />
      </div>

      {/* Main Content Area with Vertical Scrolling */}
      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Top Row: Welcome Card + Holiday Section */}
          <div className="dashboard-row">
            <div className="dashboard-col welcome">
              <WelcomeCard />
            </div>
            <div className="dashboard-col holidays">
              <HolidaySection />
            </div>
          </div>

          {/* Middle Row: Weekly Chart (Full Width) */}
          <div className="dashboard-row">
            <div className="dashboard-col wide">
              <WeeklyChart />
            </div>
          </div>

          {/* Bottom Row: Activity Ring + Projects Chart */}
          <div className="dashboard-row">
            <div className="dashboard-col activity">
              <ActivityRing />
            </div>
            <div className="dashboard-col activity">
              <ProjectsChart />
            </div>
          </div>
        </div>

        {/* Sidebar: Who's In/Out Panel */}
        <div className="dashboard-sidebar">
          <WhoIsInOutPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

