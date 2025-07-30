import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
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

  // Debug: Check Supabase configuration
  useEffect(() => {
    console.log('🔍 DEBUG: Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('🔍 DEBUG: Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    console.log('🔍 DEBUG: Supabase client:', supabase);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔍 DEBUG: Starting dashboard data fetch...');
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Test basic Supabase connection first
      console.log('🔍 DEBUG: Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('🔍 DEBUG: Supabase connection test failed:', testError);
        throw new Error(`Supabase connection failed: ${testError.message}`);
      }

      console.log('🔍 DEBUG: Supabase connection successful');

      // Get current week date range
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      console.log('🔍 DEBUG: Date range:', {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString()
      });

      // Fetch timesheet entries for this week
      console.log('🔍 DEBUG: Fetching timesheet entries...');
      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name, role)
        `)
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0]);

      if (timesheetError) {
        console.error('🔍 DEBUG: Timesheet query error:', timesheetError);
        throw timesheetError;
      }

      console.log('🔍 DEBUG: Timesheet data received:', timesheetData?.length || 0, 'entries');

      // Fetch all active users for user count
      console.log('🔍 DEBUG: Fetching users...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('is_active', true);

      if (userError) {
        console.error('🔍 DEBUG: Users query error:', userError);
        throw userError;
      }

      console.log('🔍 DEBUG: Users data received:', userData?.length || 0, 'users');

      // Process the data
      const processedData = processTimesheetData(timesheetData || [], userData || []);
      console.log('🔍 DEBUG: Processed data:', processedData);

      setDashboardData({
        ...processedData,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('🔍 DEBUG: Dashboard data fetch failed:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard data'
      }));
    }
  };

  const processTimesheetData = (timesheetData, userData) => {
    console.log('🔍 DEBUG: Processing timesheet data...');
    
    // Calculate weekly stats
    const totalHours = timesheetData.reduce((sum, entry) => {
      const hours = (entry.regular_hours || 0) + (entry.overtime_hours || 0);
      return sum + hours;
    }, 0);

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

    // Group by activities/projects (using description or project field)
    const activityMap = {};
    const projectMap = {};

    timesheetData.forEach(entry => {
      // Activities (could be task descriptions)
      const activity = entry.description || entry.task || 'General Work';
      if (!activityMap[activity]) {
        activityMap[activity] = 0;
      }
      activityMap[activity] += (entry.regular_hours || 0) + (entry.overtime_hours || 0);

      // Projects (could be campaign or project field)
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
        orgTotal: totalHours, // For admin view, show org total
        activeUsers,
        avgPerUser
      },
      weeklyChart,
      activities,
      projects
    };
  };

  const formatTime = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const WelcomeCard = () => {
    const [user, setUser] = useState({
      email: 'admin@test.com',
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin'
      }
    });

    const handleViewTimesheet = () => {
      window.location.href = '/timesheets';
    };

    const handleQuickClockIn = () => {
      console.log('Quick clock in clicked');
    };

    return (
      <div className="welcome-card">
        <div className="welcome-card-content">
          <div className="welcome-content">
            <div className="welcome-header">
              <h2>Hello, {user?.user_metadata?.full_name || 'Admin User'}! 👋</h2>
              <p className="welcome-subtitle">Welcome to the Invictus Time Management Portal</p>
            </div>

            <div className="user-info">
              <div className="user-detail">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>Email: {user?.email || 'admin@test.com'}</span>
              </div>
              <div className="user-detail">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Role: {user?.user_metadata?.role || 'admin'}</span>
              </div>
            </div>

            {/* This Week's Summary */}
            <div className="stats-summary">
              <h3>📊 This Week's Summary</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{formatTime(dashboardData.weeklyStats.yourHours)}</div>
                  <div className="stat-label">Your Hours</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatTime(dashboardData.weeklyStats.orgTotal)}</div>
                  <div className="stat-label">Org Total</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{dashboardData.weeklyStats.activeUsers}</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatTime(dashboardData.weeklyStats.avgPerUser)}</div>
                  <div className="stat-label">Avg per User</div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="action-button primary" onClick={handleViewTimesheet}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                📊 View Timesheet
              </button>
              <button className="action-button secondary" onClick={handleQuickClockIn}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                🕐 Quick Clock In
              </button>
            </div>

            <div className="auth-status">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>🔒 Full Access (Client Admin)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HolidaySection = () => {
    return (
      <div className="holiday-card">
        <div className="holiday-header">
          <h3>Upcoming Holidays and Time Off</h3>
        </div>
        <div className="holiday-list">
          <div className="holiday-item">
            <div className="holiday-name">Labor Day</div>
            <div className="holiday-date">Sep 2nd, 2024</div>
          </div>
        </div>
        <div className="holiday-footer">
          <button className="holiday-more-btn">+ more holidays ▼</button>
        </div>
      </div>
    );
  };

  const WeeklyChart = () => {
    return (
      <div className="weekly-chart-card">
        <div className="chart-header">
          <h3>TRACKED HOURS THIS WEEK</h3>
          <div className="chart-toggles">
            <button className="toggle-btn active">Personal</button>
            <button className="toggle-btn">Organization</button>
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart-bars">
            {dashboardData.weeklyChart.map((day, index) => (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ height: `${Math.max(day.hours * 20, 20)}px` }}
                ></div>
                <div className="bar-value">{day.hours.toFixed(1)}</div>
                <div className="bar-day">{day.day}</div>
                <div className="bar-date">{index + 7}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="chart-summary">
          <span>Total Worked: {formatTime(dashboardData.weeklyStats.yourHours)}</span>
          <span>Time Breaks: 2.5h</span>
          <span>Total Overtime: 4.5h</span>
        </div>
      </div>
    );
  };

  const ActivityRing = () => {
    return (
      <div className="activity-ring-card">
        <div className="activity-header">
          <h3>ACTIVITIES</h3>
          <div className="activity-toggles">
            <button className="toggle-btn active">Personal</button>
            <button className="toggle-btn">Organization</button>
          </div>
        </div>
        
        <div className="activity-content">
          <div className="activity-ring">
            <div className="ring-chart">
              <div className="ring-center">
                <div className="ring-value">{dashboardData.activities.length}</div>
                <div className="ring-label">Activities</div>
              </div>
            </div>
          </div>
          
          <div className="activity-list">
            {dashboardData.activities.slice(0, 3).map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-name">{activity.name}</span>
                <span className="activity-hours">{formatTime(activity.hours)}</span>
              </div>
            ))}
            <button className="activity-more-btn">Go to activities →</button>
          </div>
        </div>
      </div>
    );
  };

  const ProjectsChart = () => {
    return (
      <div className="projects-chart-card">
        <div className="projects-header">
          <h3>PROJECTS</h3>
          <div className="projects-toggles">
            <button className="toggle-btn active">Personal</button>
            <button className="toggle-btn">Organization</button>
          </div>
        </div>
        
        <div className="projects-content">
          <div className="projects-ring">
            <div className="ring-chart">
              <div className="ring-center">
                <div className="ring-value">{dashboardData.projects.length}</div>
                <div className="ring-label">Projects</div>
              </div>
            </div>
          </div>
          
          <div className="projects-list">
            {dashboardData.projects.slice(0, 3).map((project, index) => (
              <div key={index} className="project-item">
                <span className="project-name">{project.name}</span>
                <span className="project-hours">{formatTime(project.hours)}</span>
              </div>
            ))}
            <button className="projects-more-btn">Go to projects →</button>
          </div>
        </div>
      </div>
    );
  };

  if (dashboardData.loading) {
    return (
      <div className="dashboard-page with-sidebar">
        <div className="dashboard-main">
          <div className="loading-container">
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard-page with-sidebar">
        <div className="dashboard-main">
          <div className="error-container">
            <h3>Dashboard Error</h3>
            <p>{dashboardData.error}</p>
            <button onClick={fetchDashboardData}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page with-sidebar">
      <div className="dashboard-main">
        {/* Top row: Welcome and Holiday cards side-by-side, equal width/height */}
        <div className="dashboard-row dashboard-top-row">
          <div className="dashboard-col welcome">
            <WelcomeCard />
          </div>
          <div className="dashboard-col holidays">
            <HolidaySection />
          </div>
        </div>

        {/* Middle row: Weekly Chart */}
        <div className="dashboard-row">
          <div className="dashboard-col wide">
            <WeeklyChart />
          </div>
        </div>

        {/* Bottom row: Activity Ring and Projects */}
        <div className="dashboard-row">
          <div className="dashboard-col activity">
            <ActivityRing />
          </div>
          <div className="dashboard-col activity">
            <ProjectsChart />
          </div>
        </div>
      </div>

      {/* Sidebar: Additional content */}
      <div className="dashboard-sidebar">
        <div className="sidebar-content">
          <h3>Dashboard Info</h3>
          <p>Last updated: {currentTime.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

