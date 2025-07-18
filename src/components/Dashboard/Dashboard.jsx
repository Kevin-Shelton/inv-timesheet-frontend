import React from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';

const Dashboard = () => {
  const styles = {
    dashboardWrapper: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    dashboardLayout: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      gap: '24px',
      padding: '24px'
    },
    dashboardLeft: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      overflowY: 'auto'
    },
    dashboardRight: {
      width: '320px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: 'white',
      borderRadius: '12px',
      padding: '0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    topRow: {
      display: 'flex',
      gap: '24px',
      alignItems: 'stretch'
    },
    welcomeSection: {
      flex: 2,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      minHeight: '200px'
    },
    holidaySection: {
      flex: 1,
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      minHeight: '200px'
    },
    chartSection: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      minHeight: '300px'
    }
  };

  return (
    <div style={styles.dashboardWrapper}>
      {/* Header */}
      <DashboardHeader />
      
      {/* Main Content */}
      <div style={styles.dashboardLayout}>
        {/* Left Side - Main Content */}
        <div style={styles.dashboardLeft}>
          {/* Top Row */}
          <div style={styles.topRow}>
            <div style={styles.welcomeSection}>
              <WelcomeCard />
            </div>
            <div style={styles.holidaySection}>
              <HolidaySection />
            </div>
          </div>

          {/* Weekly Chart */}
          <div style={styles.chartSection}>
            <WeeklyChart />
          </div>

          {/* Activities Chart */}
          <div style={styles.chartSection}>
            <ActivityRing />
          </div>

          {/* Projects Chart */}
          <div style={styles.chartSection}>
            <ProjectsChart />
          </div>
        </div>

        {/* Right Side - Sidebar */}
        <div style={styles.dashboardRight}>
          <WhoIsInOutPanel />
          <CurrentTime />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

