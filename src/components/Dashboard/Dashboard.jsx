import React from 'react';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';
import CurrentTime from './CurrentTime';

export default function Dashboard() {
  return (
    <div className="dashboard-page p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
        <WelcomeCard />
        <HolidaySection />
      </div>

      <div className="mb-6">
        <CurrentTime />
      </div>

      <div className="mb-6">
        <WeeklyChart />
      </div>

      <div>
        <ActivityRing />
      </div>
    </div>
  );
}

