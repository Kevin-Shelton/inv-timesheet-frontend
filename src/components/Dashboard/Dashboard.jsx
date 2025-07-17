import React from 'react';
import DashboardHeader from './DashboardHeader';
import WeeklyChart from './WeeklyChart';
import HolidaySection from './HolidaySection';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import WelcomeCard from './WelcomeCard';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header with horizontal dropdowns - no duplicate title */}
      <DashboardHeader />
      
      {/* Main dashboard content with scrolling */}
      <div className="dashboard-content">
        {/* Left side - main content with vertical scroll */}
        <div className="dashboard-main">
          <div className="dashboard-main-content">
            {/* Welcome Card */}
            <div className="dashboard-section">
              <WelcomeCard />
            </div>

            {/* Charts Section */}
            <div className="dashboard-charts">
              {/* Tracked Hours Chart */}
              <div className="chart-section">
                <WeeklyChart />
              </div>

              {/* Activity Ring Chart */}
              <div className="chart-section">
                <ActivityRing />
              </div>

              {/* Projects Chart */}
              <div className="chart-section">
                <ProjectsChart />
              </div>
            </div>
          </div>
        </div>

        {/* Right side - sidebar with independent scroll */}
        <div className="dashboard-sidebar">
          {/* Holiday Section */}
          <div className="sidebar-section">
            <HolidaySection />
          </div>

          {/* Who's In/Out Panel */}
          <div className="sidebar-section">
            <WhoIsInOutPanel />
          </div>

          {/* Current Time */}
          <div className="sidebar-section">
            <CurrentTime />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

