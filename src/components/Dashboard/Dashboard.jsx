import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';
import { supabase } from '../../supabaseClient';

// Import your actual chart components
import ActivitiesChart from './ActivityRing';
import ProjectsChart from './ProjectsChart';

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
  const [debugMode, setDebugMode] = useState(true); // DEBUG: Show step by step
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
    const projects = Object.entries(projectMap).map(([name, hours]) => ({ name, hours })).sort((a, b) => b.hours - a.cores).slice(0, 5);

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
        
        {debugMode && (
          <div style={{
            background: '#f0f9ff',
            border: '2px solid #0ea5e9',
            padding: '15px',
            margin: '10px 0',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>🔍 DEBUG MODE</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
              <div>✅ Dashboard component mounted</div>
              <div>✅ DashboardHeader rendered</div>
              <div>User: {enhancedUser?.email || 'No user'}</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
            </div>
            <button 
              onClick={() => setDebugMode(false)}
              style={{ 
                marginTop: '10px', 
                padding: '5px 10px', 
                background: '#0ea5e9', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px' 
              }}
            >
              Hide Debug Info
            </button>
          </div>
        )}
        
        <div className="dashboard-content">
          <div className="dashboard-main">
            {/* Row 1: Welcome + Holiday */}
            <div className="dashboard-top-row">
              <div className="dashboard-col welcome">
                <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                  ✅ WelcomeCard slot
                </div>
                <WelcomeCard user={enhancedUser} />
              </div>
              <div className="dashboard-col holidays">
                <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                  ✅ HolidaySection slot
                </div>
                <HolidaySection user={enhancedUser} />
              </div>
            </div>
            
            {/* Row 2: Weekly Chart */}
            <div className="dashboard-row">
              <div className="dashboard-col full-width">
                <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                  ✅ WeeklyChart slot
                </div>
                <WeeklyChart user={enhancedUser} trackedHours={trackedHours} />
              </div>
            </div>
            
            {/* Row 3: Charts with detailed debugging */}
            <div className="dashboard-row">
              <div className="dashboard-col activity">
                <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '4px', marginBottom: '10px' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>🎯 ACTIVITIES CHART SLOT</h4>
                  <div style={{ fontSize: '12px' }}>
                    <div>• Component: ActivitiesChart</div>
                    <div>• File: ActivityRing.jsx</div>
                    <div>• Status: About to render...</div>
                  </div>
                </div>
                <div style={{ 
                  border: '3px dashed #f59e0b', 
                  padding: '10px', 
                  borderRadius: '4px',
                  minHeight: '200px'
                }}>
                  <ActivitiesChart user={enhancedUser} />
                </div>
              </div>
              <div className="dashboard-col activity">
                <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '4px', marginBottom: '10px' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>📊 PROJECTS CHART SLOT</h4>
                  <div style={{ fontSize: '12px' }}>
                    <div>• Component: ProjectsChart</div>
                    <div>• File: ProjectsChart.jsx</div>
                    <div>• Status: About to render...</div>
                  </div>
                </div>
                <div style={{ 
                  border: '3px dashed #f59e0b', 
                  padding: '10px', 
                  borderRadius: '4px',
                  minHeight: '200px'
                }}>
                  <ProjectsChart user={enhancedUser} />
                </div>
              </div>
            </div>

            {/* Row 4: Test components that should always work */}
            <div className="dashboard-row">
              <div className="dashboard-col activity">
                <div style={{
                  background: '#ef4444',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minHeight: '100px'
                }}>
                  <h3>🔴 TEST COMPONENT 1</h3>
                  <p>This should NEVER disappear</p>
                  <p>Time: {currentTime.toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="dashboard-col activity">
                <div style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minHeight: '100px'
                }}>
                  <h3>🔵 TEST COMPONENT 2</h3>
                  <p>This should NEVER disappear</p>
                  <p>Loading: {loading ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-sidebar">
            <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
              ✅ Sidebar components
            </div>
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
          max-width: 350px;
          min-width: 300px;
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

        @media (max-width: 1200px) {
          .dashboard-sidebar {
            max-width: 300px;
            min-width: 250px;
          }
        }

        @media (max-width: 968px) {
          .dashboard-content {
            flex-direction: column;
          }
          
          .dashboard-sidebar {
            max-width: none;
            min-width: unset;
            width: 100%;
          }
          
          .dashboard-top-row,
          .dashboard-row {
            flex-direction: column;
          }
          
          .dashboard-col {
            min-width: unset;
            width: 100%;
            flex: none;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 0.5rem;
          }
          
          .dashboard-content {
            gap: 1rem;
          }
          
          .dashboard-main {
            gap: 1rem;
          }
          
          .dashboard-top-row,
          .dashboard-row {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;