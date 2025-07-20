// Corrected Dashboard Component - Preserves existing structure, adds RLS functionality
// Replace src/components/Dashboard/Dashboard.jsx with this file

import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';

// Centralized CSS import for the dashboard
import './css/dashboard.css';

// Import RLS client functions
import { 
  getCurrentUser, 
  getUserProfile, 
  isAuthenticated 
} from '../../utils/supabase';

const Dashboard = ({ user: propUser }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [trackedHours, setTrackedHours] = useState({
    worked: '0h 0m',
    breaks: '0h 0m',
    overtime: '0h 0m'
  });
  
  // RLS-enhanced user state
  const [authenticatedUser, setAuthenticatedUser] = useState(propUser);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update time every minute (keep existing behavior)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load authenticated user data with RLS
  useEffect(() => {
    loadAuthenticatedUserData();
  }, [propUser]);

  const loadAuthenticatedUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        // If not authenticated, use prop user (fallback)
        setAuthenticatedUser(propUser);
        setLoading(false);
        return;
      }

      // Get current authenticated user
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setAuthenticatedUser(currentUser);
        
        // Get enhanced user profile
        const profile = await getUserProfile(currentUser.id);
        setUserProfile(profile);
      } else {
        // Fallback to prop user
        setAuthenticatedUser(propUser);
      }

    } catch (err) {
      console.error('Error loading authenticated user data:', err);
      setError('Failed to load user data');
      // Fallback to prop user
      setAuthenticatedUser(propUser);
    } finally {
      setLoading(false);
    }
  };

  // Create enhanced user object for child components
  const enhancedUser = {
    ...authenticatedUser,
    ...userProfile,
    // Preserve any existing user properties
    ...(propUser || {})
  };

  // Show loading state only if we don't have any user data
  if (loading && !authenticatedUser && !propUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Show error state with fallback
  if (error && !authenticatedUser && !propUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <div>{error}</div>
          <button onClick={loadAuthenticatedUserData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader user={enhancedUser} />
      
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-top-row">
            <div className="dashboard-col welcome">
              <WelcomeCard user={enhancedUser} />
            </div>
            <div className="dashboard-col holidays">
              <HolidaySection user={enhancedUser} />
            </div>
          </div>
          
          <div className="dashboard-middle-row">
            <div className="dashboard-col wide">
              <WeeklyChart user={enhancedUser} trackedHours={trackedHours} />
            </div>
          </div>
          
          <div className="dashboard-bottom-row">
            <div className="dashboard-col activity">
              <ActivityRing 
                percentage={30} 
                color="#FB923C"
                label="TODAY"
                time="0h 0m"
                user={enhancedUser}
                showActivities={true}
              />
            </div>
            <div className="dashboard-col activity">
              <ProjectsChart user={enhancedUser} />
            </div>
          </div>
        </div>
        
        <div className="dashboard-sidebar">
          <WhoIsInOutPanel user={enhancedUser} />
          <CurrentTime currentTime={currentTime} user={enhancedUser} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard

