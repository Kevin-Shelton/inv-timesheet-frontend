import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import CurrentTime from './CurrentTime';
import { supabase } from '../../supabaseClient';

// PROPER IMPORTS for the chart components
import ActivitiesChart from './ActivityRing';
import ProjectsChart from './ProjectsChart';

// Error Boundary Component
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#fee2e2',
          border: '2px solid #dc2626',
          padding: '20px',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          <h3>❌ {this.props.chartName} Error</h3>
          <p>Component crashed: {this.state.error?.message}</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Error Details</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simplified chart components that should definitely work
const ForceActivitiesChart = () => {
  console.log('🎯 ForceActivitiesChart rendering...');
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      minHeight: '200px',
      border: '3px solid #f59e0b'
    }}>
      <h3>🎯 ACTIVITIES CHART</h3>
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'conic-gradient(#4F46E5 0deg 144deg, #10B981 144deg 216deg, #F59E0B 216deg 360deg)',
        margin: '20px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        40h
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#4F46E5', borderRadius: '50%' }}></div>
          <span>Development - 25h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#10B981', borderRadius: '50%' }}></div>
          <span>Meetings - 8h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '12px', height: '12px', background: '#F59E0B', borderRadius: '50%' }}></div>
          <span>Testing - 7h</span>
        </div>
      </div>
    </div>
  );
};

const ForceProjectsChart = () => {
  console.log('📊 ForceProjectsChart rendering...');
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      minHeight: '200px',
      border: '3px solid #8b5cf6'
    }}>
      <h3>📊 PROJECTS CHART</h3>
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'conic-gradient(#4F46E5 0deg 160deg, #10B981 160deg 280deg, #F59E0B 280deg 360deg)',
        margin: '20px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        65h
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#4F46E5', borderRadius: '50%' }}></div>
          <span>Website Redesign - 30h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#10B981', borderRadius: '50%' }}></div>
          <span>Mobile App - 20h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '12px', height: '12px', background: '#F59E0B', borderRadius: '50%' }}></div>
          <span>Database - 15h</span>
        </div>
      </div>
    </div>
  );
};

// Try to import the original components, but fallback if they fail
const OriginalActivitiesChart = ActivitiesChart;
const OriginalProjectsChart = ProjectsChart;

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
  const [chartMode, setChartMode] = useState('force'); // 'force', 'original', 'both'
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
        
        {/* Chart Debug Controls */}
        <div style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          padding: '15px',
          margin: '10px 0',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#92400e' }}>🔧 CHART DEBUG CONTROLS</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button 
              onClick={() => setChartMode('force')}
              style={{ 
                padding: '5px 10px', 
                background: chartMode === 'force' ? '#f59e0b' : '#fff',
                color: chartMode === 'force' ? 'white' : '#92400e',
                border: '1px solid #f59e0b',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Force Charts (Should Work)
            </button>
            <button 
              onClick={() => setChartMode('original')}
              style={{ 
                padding: '5px 10px', 
                background: chartMode === 'original' ? '#f59e0b' : '#fff',
                color: chartMode === 'original' ? 'white' : '#92400e',
                border: '1px solid #f59e0b',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Original Charts (May Crash)
            </button>
            <button 
              onClick={() => setChartMode('both')}
              style={{ 
                padding: '5px 10px', 
                background: chartMode === 'both' ? '#f59e0b' : '#fff',
                color: chartMode === 'both' ? 'white' : '#92400e',
                border: '1px solid #f59e0b',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Both (Compare)
            </button>
          </div>
          <div style={{ fontSize: '14px' }}>
            Mode: <strong>{chartMode}</strong> | 
            ActivitiesChart Available: ✅ | 
            ProjectsChart Available: ✅
          </div>
        </div>
        
        <div className="dashboard-content">
          <div className="dashboard-main">
            {/* Top row */}
            <div className="dashboard-top-row">
              <div className="dashboard-col welcome">
                <WelcomeCard user={enhancedUser} />
              </div>
              <div className="dashboard-col holidays">
                <HolidaySection user={enhancedUser} />
              </div>
            </div>
            
            {/* Weekly chart */}
            <div className="dashboard-row">
              <div className="dashboard-col full-width">
                <WeeklyChart user={enhancedUser} trackedHours={trackedHours} />
              </div>
            </div>
            
            {/* Charts based on mode */}
            {chartMode === 'force' && (
              <div className="dashboard-row">
                <div className="dashboard-col activity">
                  <ForceActivitiesChart />
                </div>
                <div className="dashboard-col activity">
                  <ForceProjectsChart />
                </div>
              </div>
            )}
            
            {chartMode === 'original' && (
              <div className="dashboard-row">
                <div className="dashboard-col activity">
                  <ChartErrorBoundary chartName="Activities Chart">
                    <ActivitiesChart user={enhancedUser} />
                  </ChartErrorBoundary>
                </div>
                <div className="dashboard-col activity">
                  <ChartErrorBoundary chartName="Projects Chart">
                    <ProjectsChart user={enhancedUser} />
                  </ChartErrorBoundary>
                </div>
              </div>
            )}
            
            {chartMode === 'both' && (
              <>
                <div className="dashboard-row">
                  <div className="dashboard-col activity">
                    <div style={{ marginBottom: '10px', background: '#f0f9ff', padding: '10px', borderRadius: '4px' }}>
                      <strong>🔧 FORCE ACTIVITIES</strong>
                    </div>
                    <ForceActivitiesChart />
                  </div>
                  <div className="dashboard-col activity">
                    <div style={{ marginBottom: '10px', background: '#f0f9ff', padding: '10px', borderRadius: '4px' }}>
                      <strong>🔧 FORCE PROJECTS</strong>
                    </div>
                    <ForceProjectsChart />
                  </div>
                </div>
                <div className="dashboard-row">
                  <div className="dashboard-col activity">
                    <div style={{ marginBottom: '10px', background: '#fef3c7', padding: '10px', borderRadius: '4px' }}>
                      <strong>📊 ORIGINAL ACTIVITIES</strong>
                    </div>
                    <ChartErrorBoundary chartName="Original Activities Chart">
                      <ActivitiesChart user={enhancedUser} />
                    </ChartErrorBoundary>
                  </div>
                  <div className="dashboard-col activity">
                    <div style={{ marginBottom: '10px', background: '#fef3c7', padding: '10px', borderRadius: '4px' }}>
                      <strong>📊 ORIGINAL PROJECTS</strong>
                    </div>
                    <ChartErrorBoundary chartName="Original Projects Chart">
                      <ProjectsChart user={enhancedUser} />
                    </ChartErrorBoundary>
                  </div>
                </div>
              </>
            )}
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
      `}</style>
    </div>
  );
};

export default Dashboard;