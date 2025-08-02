// Dashboard Component with Actual Fixes Applied
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

// FIXED: Import from your actual supabaseClient.js location
import { supabase } from '../../supabaseClient';

const Dashboard = ({ user: propUser }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [trackedHours, setTrackedHours] = useState({
    worked: '0h 0m',
    breaks: '0h 0m',
    overtime: '0h 0m'
  });
  
  // Enhanced user state
  const [authenticatedUser, setAuthenticatedUser] = useState(propUser);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Admin dashboard data
  const [adminData, setAdminData] = useState({
    weeklyStats: {
      yourHours: 0,
      orgTotal: 0,
      activeUsers: 0,
      avgPerUser: 0
    },
    weeklyChart: [],
    activities: [],
    projects: [],
    loading: true,
    error: null
  });

  // Update time every minute (keep existing behavior)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
    <div className="dashboard-wrapper">
  }, []);

  // Load authenticated user data
  useEffect(() => {
    loadAuthenticatedUserData();
  }, [propUser]);

  // Load admin dashboard data
  useEffect(() => {
    if (authenticatedUser) {
      fetchAdminDashboardData();
    }
  }, [authenticatedUser]);

  const loadAuthenticatedUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated using supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // If not authenticated, use prop user (fallback)
        setAuthenticatedUser(propUser);
        setLoading(false);
        return;
      }

      // Use the authenticated user data
      setAuthenticatedUser(user);
      setUserProfile(user);

    } catch (err) {
      console.error('Error loading authenticated user data:', err);
      setError('Failed to load user data');
      // Fallback to prop user
      setAuthenticatedUser(propUser);
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin dashboard data
  const fetchAdminDashboardData = async () => {
    try {
      console.log('🔍 DEBUG: Starting admin dashboard data fetch...');
      setAdminData(prev => ({ ...prev, loading: true, error: null }));

      // Get current week date range
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Fetch timesheet entries for this week
      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheet_entries')
        .select(`
          id,
          date,
          regular_hours,
          overtime_hours,
          description,
          task,
          project,
          campaign_id,
          user_id,
          users!timesheet_entries_user_id_fkey(full_name, role)
        `)
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0]);

      if (timesheetError) {
        console.error('🔍 DEBUG: Timesheet query error:', timesheetError);
        throw timesheetError;
      }

      // Fetch all active users for user count
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('is_active', true);

      if (userError) {
        console.error('🔍 DEBUG: Users query error:', userError);
        throw userError;
      }

      // Process the data
      const processedData = processTimesheetData(timesheetData || [], userData || []);
      
      // Update tracked hours for existing components
      const totalHours = processedData.weeklyStats.yourHours;
      const formattedHours = formatTime(totalHours);
      setTrackedHours({
        worked: formattedHours,
        breaks: '2h 30m',
        overtime: formatTime(processedData.weeklyStats.overtimeHours || 0)
      });

      setAdminData({
        ...processedData,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('🔍 DEBUG: Admin dashboard data fetch failed:', error);
      setAdminData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load admin dashboard data'
      }));
    }
  };

  // Process timesheet data for admin view
  const processTimesheetData = (timesheetData, userData) => {
    const totalRegularHours = timesheetData.reduce((sum, entry) => sum + (entry.regular_hours || 0), 0);
    const totalOvertimeHours = timesheetData.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);
    const totalHours = totalRegularHours + totalOvertimeHours;

    const activeUsers = userData.length;
    const avgPerUser = activeUsers > 0 ? totalHours / activeUsers : 0;

    // Create daily breakdown for chart
    const dailyHours = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    timesheetData.forEach(entry => {
      const date = new Date(entry.date);
      const dayName = days[date.getDay()];
      const hours = (entry.regular_hours || 0) + (entry.overtime_hours || 0);
      
      if (!dailyHours[dayName]) {
        dailyHours[dayName] = 0;
      }
      dailyHours[dayName] += hours;
    });

    const weeklyChart = days.map(day => ({
      day: day.substring(0, 3),
      hours: dailyHours[day] || 0
    }));

    // Group by activities/projects
    const activityMap = {};
    const projectMap = {};

    timesheetData.forEach(entry => {
      const activity = entry.description || entry.task || 'General Work';
      if (!activityMap[activity]) {
        activityMap[activity] = 0;
      }
      activityMap[activity] += (entry.regular_hours || 0) + (entry.overtime_hours || 0);

      const project = entry.project || entry.campaign_id || 'Default Project';
      if (!projectMap[project]) {
        projectMap[project] = 0;
      }
      projectMap[project] += (entry.regular_hours || 0) + (entry.overtime_hours || 0);
    });

    const activities = Object.entries(activityMap)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    const projects = Object.entries(projectMap)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    return {
      weeklyStats: {
        yourHours: totalHours,
        orgTotal: totalHours,
        activeUsers,
        avgPerUser,
        overtimeHours: totalOvertimeHours
      },
      weeklyChart,
      activities,
      projects
    };
  };

  // Format hours helper
  const formatTime = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // Create enhanced user object for child components
  const enhancedUser = {
    ...authenticatedUser,
    ...userProfile,
    // Preserve any existing user properties
    ...(propUser || {}),
    // Add admin data for components that need it
    adminData: adminData
  };

  // Show loading state only if we don't have any user data
  if (loading && !authenticatedUser && !propUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
      <div className="chart-wrapper">
        <ActivityRing />
      </div>
      <div className="chart-wrapper">
        <ProjectsChart />
      </div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Show error state with fallback
  if (error && !authenticatedUser && !propUser) {
    return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-error">
      <div className="chart-wrapper">
        <ActivityRing />
      </div>
      <div className="chart-wrapper">
        <ProjectsChart />
      </div>
          <div>{error}</div>
          <button onClick={loadAuthenticatedUserData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
    <div className="dashboard-container">
      <DashboardHeader user={enhancedUser} />
      
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-top-row">
            <div className="dashboard-col welcome">
              <WelcomeCard user={enhancedUser} />
      <div className="chart-wrapper">
        <ActivityRing />
      </div>
      <div className="chart-wrapper">
        <ProjectsChart />
      </div>
            </div>
            <div className="dashboard-col holidays">
              <HolidaySection user={enhancedUser} />
            </div>
          </div>
          
          <div className="dashboard-row">
            <div className="dashboard-col wide">
              <WeeklyChart user={enhancedUser} trackedHours={trackedHours} />
            </div>
          </div>
          
          <div className="dashboard-row">
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

export default Dashboard;



<style jsx>{`
  .dashboard-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }

  .chart-wrapper {
    width: 100%;
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`}</style>
