import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';
import { supabase } from '../../supabaseClient';

// SIMPLE TEST COMPONENTS - NO EXTERNAL DEPENDENCIES
const TestActivityChart = () => (
  <div style={{ 
    background: 'red', 
    padding: '20px', 
    borderRadius: '8px', 
    color: 'white',
    minHeight: '100px'
  }}>
    <h3>TEST ACTIVITIES CHART</h3>
    <p>If you can see this, the component is rendering</p>
  </div>
);

const TestProjectsChart = () => (
  <div style={{ 
    background: 'blue', 
    padding: '20px', 
    borderRadius: '8px', 
    color: 'white',
    minHeight: '100px'
  }}>
    <h3>TEST PROJECTS CHART</h3>
    <p>If you can see this, the component is rendering</p>
  </div>
);

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
  const [showCharts, setShowCharts] = useState(true); // DEBUG: Toggle charts visibility
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
    return <div>Loading dashboard...</div>;
  }

  if (error && !authenticatedUser && !propUser) {
    return <div>{error}</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <DashboardHeader user={enhancedUser} />
        
        {/* DEBUG CONTROLS */}
        <div style={{ 
          background: 'yellow', 
          padding: '10px', 
          margin: '10px 0',
          borderRadius: '4px'
        }}>
          <h4>DEBUG CONTROLS</h4>
          <button 
            onClick={() => setShowCharts(!showCharts)}
            style={{ padding: '5px 10px', marginRight: '10px' }}
          >
            Toggle Charts: {showCharts ? 'ON' : 'OFF'}
          </button>
          <span>Charts currently: {showCharts ? 'VISIBLE' : 'HIDDEN'}</span>
        </div>
        
        <div className="dashboard-content">
          <div className="dashboard-main">
            {/* Top row with WelcomeCard and HolidaySection side by side */}
            <div className="dashboard-top-row">
              <div className="dashboard-col welcome">
                <WelcomeCard user={enhancedUser} />
              </div>
              <div className="dashboard-col holidays">
                <HolidaySection user={enhancedUser} />
              </div>
            </div>
            
            {/* Full-width WeeklyChart */}
            <div className="dashboard-row">
              <div className="dashboard-col full-width">
                <WeeklyChart user={enhancedUser} trackedHours={trackedHours} />
              </div>
            </div>
            
            {/* DEBUG: Conditionally render charts */}
            {showCharts && (
              <div className="dashboard-row">
                <div className="dashboard-col activity">
                  <TestActivityChart />
                </div>
                <div className="dashboard-col activity">
                  <TestProjectsChart />
                </div>
              </div>
            )}
            
            {/* ALWAYS VISIBLE CHARTS FOR COMPARISON */}
            <div className="dashboard-row">
              <div className="dashboard-col activity">
                <div style={{ 
                  background: 'green', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  color: 'white',
                  minHeight: '100px'
                }}>
                  <h3>ALWAYS VISIBLE CHART 1</h3>
                  <p>This should never disappear</p>
                </div>
              </div>
              <div className="dashboard-col activity">
                <div style={{ 
                  background: 'purple', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  color: 'white',
                  minHeight: '100px'
                }}>
                  <h3>ALWAYS VISIBLE CHART 2</h3>
                  <p>This should never disappear</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-sidebar">
            <WhoIsInOutPanel user={enhancedUser} />
            <CurrentTime currentTime={currentTime} user={enhancedUser} />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }
        
        .dashboard-container {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          background-color: #f9fafb;
          min-height: 100vh;
        }

        .dashboard-content {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
          flex-grow: 1;
        }

        .dashboard-main {
          flex: 3;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-sidebar {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .dashboard-top-row,
        .dashboard-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .dashboard-col {
          flex: 1;
          min-width: 280px;
        }

        .dashboard-col.full-width {
          width: 100%;
          flex: none;
        }

        .dashboard-col.welcome,
        .dashboard-col.holidays {
          flex: 1;
        }

        .dashboard-col.activity {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;