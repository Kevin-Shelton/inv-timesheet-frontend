import React from 'react';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import CurrentTime from './CurrentTime';
import ActivityRing from './ActivityRing';
import WeeklyChart from './WeeklyChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import './Dashboard.css';
import './DashboardNamespaced.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page with-sidebar">
      <div className="dashboard-main">
        <div className="dashboard-row">
          <div className="dashboard-col welcome">
            <WelcomeCard />
          </div>
          <div className="dashboard-col holidays">
            <HolidaySection />
          </div>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-col wide">
            <WeeklyChart />
          </div>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-col activity">
            <ActivityRing />
          </div>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-col time">
            <CurrentTime />
          </div>
        </div>
      </div>

      <div className="dashboard-sidebar">
        <WhoIsInOutPanel />
      </div>
    </div>
  );
};

export default Dashboard;
