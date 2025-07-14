// Final Dashboard.jsx update
import { ActivityRing } from './ActivityRing';
import { WeeklyChart } from './WeeklyChart';
import { HolidaySection } from './HolidaySection';
import { CurrentTime } from './CurrentTime';
import './Dashboard.css';

export function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <p className="welcome-text">Welcome back</p>
      </div>

      <div className="dashboard-top-row">
        <div className="hello-section card">
          <h3 className="sidebar-section-title">Hello, Team</h3>
          <p className="subtext">You're doing great!</p>
        </div>

        <HolidaySection />
      </div>

      <div className="dashboard-main">
        <div className="weekly-chart card">
          <WeeklyChart />
        </div>

        <div className="activity-section">
          <div className="time-widget card">
            <CurrentTime />
          </div>

          <div className="activity-ring card">
            <h4 className="sidebar-section-title">Activity Summary</h4>
            <ActivityRing />
            <p className="activity-subtext">You've completed 70% of your weekly goals.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
