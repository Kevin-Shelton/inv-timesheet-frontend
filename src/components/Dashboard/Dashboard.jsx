import React from 'react';
import DashboardHeader from "./DashboardHeader";
import TrackedHoursChart from './TrackedHoursChart';
import HolidaysViewer from './HolidaysViewer';
import ActivitiesChart from './ActivitiesChart';
import ProjectsChart from './ProjectsChart';
import WelcomeCard from './WelcomeCard';
import WhosInOutPanel from './WhosInOutPanel'; // Assuming you have this component

const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      {/* Header with Dropdowns */}
      <DashboardHeader />
      
      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Main Content with Vertical Scrolling (RED RECTANGLE AREA) */}
        <div className="dashboard-main">
          {/* First Row - Welcome Card and Holidays */}
          <div className="dashboard-row">
            <div className="dashboard-col welcome">
              <WelcomeCard />
            </div>
            <div className="dashboard-col holidays">
              <HolidaysViewer />
            </div>
          </div>

          {/* Second Row - Tracked Hours Chart */}
          <div className="dashboard-row">
            <div className="dashboard-col wide">
              <TrackedHoursChart />
            </div>
          </div>

          {/* Third Row - Activities and Projects Charts */}
          <div className="dashboard-row">
            <div className="dashboard-col">
              <ActivitiesChart />
            </div>
            <div className="dashboard-col">
              <ProjectsChart />
            </div>
          </div>

          {/* Add more rows as needed for additional charts */}
          {/* Fourth Row - Example for more charts */}
          <div className="dashboard-row">
            <div className="dashboard-col">
              <div className="chart-placeholder">
                <h3>Additional Chart 1</h3>
                <p>This area can contain more charts or widgets</p>
              </div>
            </div>
            <div className="dashboard-col">
              <div className="chart-placeholder">
                <h3>Additional Chart 2</h3>
                <p>This area can contain more charts or widgets</p>
              </div>
            </div>
          </div>

          {/* Fifth Row - Example for wide chart */}
          <div className="dashboard-row">
            <div className="dashboard-col wide">
              <div className="chart-placeholder">
                <h3>Wide Chart Example</h3>
                <p>This demonstrates how the vertical scrolling works with multiple rows of content</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Who's In/Out Panel */}
        <div className="dashboard-sidebar">
          <WhosInOutPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

