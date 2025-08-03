import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';
import ActivitiesChart from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import { supabase } from '../../supabaseClient';

const Dashboard = ({ user: propUser }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [trackedHours, setTrackedHours] = useState({
    worked: '0h 0m',
    breaks: '0h 0m',
    overtime: '0h 0m'
  });
  const [authenticatedUser, setAuthenticatedUser] = useState(propUser);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadAuthenticatedUserData();
  }, [propUser]);

  useEffect(() => {
    if (authenticatedUser) {
      fetchAdminDashboardData();
    }
  }, [authenticatedUser]);

  const loadAuthenticatedUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setAuthenticatedUser(propUser);
        setLoading(false);
        return;
      }
      setAuthenticatedUser(user);
      setUserProfile(user);
    } catch (err) {
      console.error('Error loading authenticated user data:', err);
      setError('Failed to load user data');
      setAuthenticatedUser(propUser);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminDashboardData = async () => {
    try {
      setAdminData(prev => ({ ...prev, loading: true, error: null }));
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheet_entries')
        .select('id, date, regular_hours, overtime_hours, description, task, project, campaign_id, user_id, users!timesheet_entries_user_id_fkey(full_name, role)')
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0]);

      if (timesheetError) throw timesheetError;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('is_active', true);

      if (userError) throw userError;

      const processedData = processTimesheetData(timesheetData || [], userData || []);
      const totalHours = processedData.weeklyStats.yourHours;
      const formattedHours = formatTime(totalHours);
      setTrackedHours({
        worked: formattedHours,
        breaks: '2h 30m',
        overtime: formatTime(processedData.weeklyStats.overtimeHours || 0)
      });
      setAdminData({ ...processedData, loading: false, error: null });

    } catch (error) {
      console.error('Admin dashboard data fetch failed:', error);
      setAdminData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load admin dashboard data'
      }));
    }
  };

  const processTimesheetData = (timesheetData, userData) => {
    const totalRegularHours = timesheetData.reduce((sum, entry) => sum + (entry.regular_hours || 0), 0);
    const totalOvertimeHours = timesheetData.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);
    const totalHours = totalRegularHours + totalOvertimeHours;
    const activeUsers = userData.length;
    const avgPerUser = activeUsers > 0 ? totalHours / activeUsers : 0;

    const dailyHours = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    timesheetData.forEach(entry => {
      const date = new Date(entry.date);
      const dayName = days[date.getDay()];
      const hours = (entry.regular_hours || 0) + (entry.overtime_hours || 0);
      dailyHours[dayName] = (dailyHours[dayName] || 0) + hours;
    });

    const weeklyChart = days.map(day => ({ day: day.substring(0, 3), hours: dailyHours[day] || 0 }));

    const activityMap = {}, projectMap = {};
    timesheetData.forEach(entry => {
      const activity = entry.description || entry.task || 'General Work';
      activityMap[activity] = (activityMap[activity] || 0) + ((entry.regular_hours || 0) + (entry.overtime_hours || 0));
      const project = entry.project || entry.campaign_id || 'Default Project';
      projectMap[project] = (projectMap[project] || 0) + ((entry.regular_hours || 0) + (entry.overtime_hours || 0));
    });

    const activities = Object.entries(activityMap).map(([name, hours]) => ({ name, hours })).sort((a, b) => b.hours - a.hours).slice(0, 5);
    const projects = Object.entries(projectMap).map(([name, hours]) => ({ name, hours })).sort((a, b) => b.hours - a.hours).slice(0, 5);

    return {
      weeklyStats: { yourHours: totalHours, orgTotal: totalHours, activeUsers, avgPerUser, overtimeHours: totalOvertimeHours },
      weeklyChart,
      activities,
      projects
    };
  };

  const formatTime = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return wholeHours + 'h ' + minutes + 'm';
  };

  const enhancedUser = {
    ...authenticatedUser,
    ...userProfile,
    ...(propUser || {}),
    adminData: adminData
  };

  if (loading && !authenticatedUser && !propUser) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  if (error && !authenticatedUser && !propUser) {
    return (
      <div className="dashboard-error">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader user={enhancedUser} />
      
      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Row 1: Welcome + Holiday */}
          <div className="dashboard-top-row">
            <div className="dashboard-col welcome">
              <WelcomeCard user={enhancedUser} />
            </div>
            <div className="dashboard-col holidays">
              <HolidaySection user={enhancedUser} />
            </div>
          </div>
          
          {/* Row 2: Weekly Chart */}
          <div className="dashboard-row">
            <div className="dashboard-col full-width">
              <WeeklyChart user={enhancedUser} trackedHours={trackedHours} />
            </div>
          </div>
          
          {/* Row 3: Activities and Projects Charts */}
          <div className="dashboard-row">
            <div className="dashboard-col activity">
              <SimpleActivitiesChart user={enhancedUser} />
            </div>
            <div className="dashboard-col activity">
              <SimpleProjectsChart user={enhancedUser} />
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <WhoIsInOutPanel user={enhancedUser} />
          <CurrentTime currentTime={currentTime} user={enhancedUser} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;