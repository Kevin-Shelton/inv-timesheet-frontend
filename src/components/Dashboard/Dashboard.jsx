import React from 'react';
import WelcomeCard from './WelcomeCard';
import ActivityRing from './ActivityRing';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import CurrentTime from './CurrentTime';
import WhosInOutPanel from './WhosInOutPanel';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-left">
          <div className="dashboard-top-row">
            <WelcomeCard />
            <HolidaySection />
          </div>

          <div className="dashboard-middle-row">
            <div className="tracked-hours-section">
              <WeeklyChart />
            </div>
            <div className="activity-summary-section">
              <ActivityRing />
            </div>
          </div>

          <div className="dashboard-bottom-row">
            {/* Future components */}
          </div>
        </div>

        <div className="dashboard-right">
          <CurrentTime />
          <WhosInOutPanel />
        </div>
      </div>
    </div>
  );
}
