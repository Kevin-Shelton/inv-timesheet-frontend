import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';
import { supabase } from '../../supabaseClient';
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
  const [debugCss, setDebugCss] = useState(true);
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      ...(debugCss && {
        border: '3px solid red',
        background: 'rgba(255,0,0,0.1)'
      })
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        ...(debugCss && {
          border: '3px solid blue',
          background: 'rgba(0,0,255,0.1)'
        })
      }}>
        <DashboardHeader user={enhancedUser} />
        
        {/* CSS Debug Controls */}
        <div style={{
          background: '#dc2626',
          color: 'white',
          padding: '15px',
          margin: '10px 0',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>🎨 CSS LAYOUT DEBUG</h3>
          <button 
            onClick={() => setDebugCss(!debugCss)}
            style={{ 
              padding: '5px 10px', 
              background: 'white',
              color: '#dc2626',
              border: 'none',
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Toggle Debug Borders: {debugCss ? 'ON' : 'OFF'}
          </button>
          <span>Red borders show containers, Blue shows main layout</span>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginTop: '1rem',
          flexGrow: 1,
          ...(debugCss && {
            border: '3px solid green',
            background: 'rgba(0,255,0,0.1)'
          })
        }}>
          <div style={{
            flex: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            ...(debugCss && {
              border: '3px solid purple',
              background: 'rgba(128,0,128,0.1)'
            })
          }}>
            {/* Row 1: Welcome + Holiday */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              ...(debugCss && {
                border: '2px solid orange',
                background: 'rgba(255,165,0,0.1)',
                padding: '10px'
              })
            }}>
              <div style={{
                flex: 1,
                minWidth: '280px',
                ...(debugCss && {
                  border: '2px solid yellow',
                  background: 'rgba(255,255,0,0.1)'
                })
              }}>
                {debugCss && <div style={{ background: 'yellow', padding: '5px', marginBottom: '5px' }}>WELCOME SLOT</div>}
                <WelcomeCard user={enhancedUser} />
              </div>
              <div style={{
                flex: 1,
                minWidth: '280px',
                ...(debugCss && {
                  border: '2px solid cyan',
                  background: 'rgba(0,255,255,0.1)'
                })
              }}>
                {debugCss && <div style={{ background: 'cyan', padding: '5px', marginBottom: '5px' }}>HOLIDAY SLOT</div>}
                <HolidaySection user={enhancedUser} />
              </div>
            </div>
            
            {/* Row 2: Weekly Chart */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              ...(debugCss && {
                border: '2px solid orange',
                background: 'rgba(255,165,0,0.1)',
                padding: '10px'
              })
            }}>
              <div style={{
                width: '100%',
                flex: 'none',
                ...(debugCss && {
                  border: '2px solid lime',
                  background: 'rgba(0,255,0,0.2)'
                })
              }}>
                {debugCss && <div style={{ background: 'lime', padding: '5px', marginBottom: '5px' }}>WEEKLY CHART SLOT</div>}
                <WeeklyChart user={enhancedUser} trackedHours={trackedHours} />
              </div>
            </div>
            
            {/* Row 3: Activities and Projects Charts - CRITICAL SECTION */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              // FORCE VISIBILITY
              position: 'relative',
              zIndex: 1000,
              minHeight: '300px',
              ...(debugCss && {
                border: '5px solid red',
                background: 'rgba(255,0,0,0.2)',
                padding: '10px'
              })
            }}>
              <div style={{
                flex: 1,
                minWidth: '280px',
                // FORCE VISIBILITY
                position: 'relative',
                zIndex: 1001,
                minHeight: '250px',
                ...(debugCss && {
                  border: '3px solid magenta',
                  background: 'rgba(255,0,255,0.2)'
                })
              }}>
                {debugCss && (
                  <div style={{ 
                    background: 'magenta', 
                    color: 'white',
                    padding: '5px', 
                    marginBottom: '5px',
                    zIndex: 1002,
                    position: 'relative'
                  }}>
                    ACTIVITIES CHART SLOT - Z-INDEX: 1001
                  </div>
                )}
                <div style={{
                  // MAXIMUM VISIBILITY FORCE
                  position: 'relative',
                  zIndex: 1002,
                  minHeight: '200px',
                  ...(debugCss && {
                    border: '2px dashed black',
                    background: 'white'
                  })
                }}>
                  <ActivitiesChart user={enhancedUser} />
                </div>
              </div>
              
              <div style={{
                flex: 1,
                minWidth: '280px',
                // FORCE VISIBILITY
                position: 'relative',
                zIndex: 1001,
                minHeight: '250px',
                ...(debugCss && {
                  border: '3px solid teal',
                  background: 'rgba(0,128,128,0.2)'
                })
              }}>
                {debugCss && (
                  <div style={{ 
                    background: 'teal', 
                    color: 'white',
                    padding: '5px', 
                    marginBottom: '5px',
                    zIndex: 1002,
                    position: 'relative'
                  }}>
                    PROJECTS CHART SLOT - Z-INDEX: 1001
                  </div>
                )}
                <div style={{
                  // MAXIMUM VISIBILITY FORCE
                  position: 'relative',
                  zIndex: 1002,
                  minHeight: '200px',
                  ...(debugCss && {
                    border: '2px dashed black',
                    background: 'white'
                  })
                }}>
                  <ProjectsChart user={enhancedUser} />
                </div>
              </div>
            </div>

            {/* Row 4: Always Visible Test */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 2000,
              ...(debugCss && {
                border: '2px solid orange',
                background: 'rgba(255,165,0,0.1)',
                padding: '10px'
              })
            }}>
              <div style={{
                flex: 1,
                minWidth: '280px',
                position: 'relative',
                zIndex: 2001
              }}>
                <div style={{
                  background: '#ef4444',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minHeight: '100px',
                  position: 'relative',
                  zIndex: 2002
                }}>
                  <h3>🔴 ALWAYS VISIBLE TEST 1</h3>
                  <p>Z-INDEX: 2002</p>
                  <p>If you can see this, layout works</p>
                </div>
              </div>
              <div style={{
                flex: 1,
                minWidth: '280px',
                position: 'relative',
                zIndex: 2001
              }}>
                <div style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minHeight: '100px',
                  position: 'relative',
                  zIndex: 2002
                }}>
                  <h3>🔵 ALWAYS VISIBLE TEST 2</h3>
                  <p>Z-INDEX: 2002</p>
                  <p>Time: {currentTime.toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '350px',
            minWidth: '300px',
            ...(debugCss && {
              border: '3px solid brown',
              background: 'rgba(165,42,42,0.1)'
            })
          }}>
            {debugCss && <div style={{ background: 'brown', color: 'white', padding: '5px' }}>SIDEBAR</div>}
            <WhoIsInOutPanel user={enhancedUser} />
            <CurrentTime currentTime={currentTime} user={enhancedUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;