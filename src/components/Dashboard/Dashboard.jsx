import React from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';
import './DashboardSimple.css';

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <DashboardHeader />
      
      {/* Main Content */}
      <div className="dashboard-layout">
        {/* Left Side - Main Content */}
        <div className="dashboard-left">
          {/* Top Row */}
          <div className="dashboard-top-row">
            <div className="welcome-section">
              <WelcomeCard />
            </div>
            <div className="holiday-section">
              <HolidaySection />
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="chart-section">
            <WeeklyChart />
          </div>

          {/* Activities Chart */}
          <div className="chart-section">
            <ActivityRing />
          </div>

          {/* Projects Chart */}
          <div className="chart-section">
            <ProjectsChart />
          </div>
        </div>

        {/* Right Side - Sidebar */}
        <div className="dashboard-right">
          <WhoIsInOutPanel />
          <CurrentTime />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

