import React from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';

// Import the modular CSS
import './css/dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <DashboardHeader />
      
      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Side - Main Content */}
        <div className="dashboard-main">
          {/* Top Row - Welcome Card and Holiday Section */}
          <div className="dashboard-row">
            <div className="dashboard-col-2">
              <WelcomeCard />
            </div>
            <div className="dashboard-col-1">
              <HolidaySection />
            </div>
          </div>

          {/* Weekly Chart Row */}
          <div className="dashboard-row">
            <div className="dashboard-col-full">
              <WeeklyChart />
            </div>
          </div>

          {/* Activities Chart Row */}
          <div className="dashboard-row">
            <div className="dashboard-col-full">
              <ActivityRing />
            </div>
          </div>

          {/* Projects Chart Row */}
          <div className="dashboard-row">
            <div className="dashboard-col-full">
              <ProjectsChart />
            </div>
          </div>
        </div>

        {/* Right Side - Sidebar */}
        <div className="dashboard-sidebar">
          <WhoIsInOutPanel />
          <CurrentTime />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

