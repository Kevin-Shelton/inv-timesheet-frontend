import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';
import './css/dashboard-layout.css';

const Dashboard = ({ user }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [trackedHours, setTrackedHours] = useState({
    worked: '0h 0m',
    breaks: '0h 0m',
    overtime: '0h 0m'
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} />
      
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-top-row">
            <div className="dashboard-col welcome">
              <WelcomeCard user={user} />
            </div>
            <div className="dashboard-col holidays">
              <HolidaySection user={user} />
            </div>
          </div>
          
          <div className="dashboard-middle-row">
            <div className="dashboard-col wide">
              <WeeklyChart user={user} trackedHours={trackedHours} />
            </div>
          </div>
          
          <div className="dashboard-bottom-row">
            <div className="dashboard-col activity">
              <ActivityRing 
                percentage={30} 
                color="#FB923C"
                label="TODAY"
                time="0h 0m"
                user={user}
                showActivities={true}
              />
            </div>
            <div className="dashboard-col activity">
              <ProjectsChart user={user} />
            </div>
          </div>
        </div>
        
        <div className="dashboard-sidebar">
          <WhoIsInOutPanel user={user} />
          <CurrentTime currentTime={currentTime} user={user} />
        </div>
      </div>
    </div>
  );
};

export { Dashboard };

