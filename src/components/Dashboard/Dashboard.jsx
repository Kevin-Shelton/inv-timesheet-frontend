import React from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard_Fixed';
import HolidaySection from './HolidaySection_DatabaseFixed';
import WeeklyChart from './WeeklyChart_DatabaseFixed';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart_DatabaseFixed';
import WhoIsInOutPanel from './WhoIsInOutPanel_Fixed';
import CurrentTime from './CurrentTime';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header - ONLY ONE HEADER */}
      <DashboardHeader />
      
      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Side - Main Dashboard */}
        <div className="dashboard-main">
          {/* Top Row - Welcome Card + Holiday Section */}
          <div className="dashboard-row">
            <div className="dashboard-col welcome">
              <WelcomeCard />
            </div>
            <div className="dashboard-col holidays">
              <HolidaySection />
            </div>
          </div>

          {/* Middle Row - Weekly Chart (Full Width) */}
          <div className="dashboard-row">
            <div className="dashboard-col wide">
              <WeeklyChart />
            </div>
          </div>

          {/* Bottom Row 1 - Activities Chart (Full Width) */}
          <div className="dashboard-row">
            <div className="dashboard-col wide">
              <ActivityRing />
            </div>
          </div>

          {/* Bottom Row 2 - Projects Chart (Full Width) */}
          <div className="dashboard-row">
            <div className="dashboard-col wide">
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

