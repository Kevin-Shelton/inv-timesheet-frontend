import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js'; // FIXED: Direct import
import { useAuth } from '../../hooks/useAuth';

const WeeklyChart = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekRange, setWeekRange] = useState('');
  const [totals, setTotals] = useState({
    totalWorked: 0,
    totalBreaks: 0,
    totalOvertime: 0,
    activeUsers: 0,
    avgPerUser: 0
  });
  const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'organization'

  useEffect(() => {
    if (user) {
      fetchWeeklyData();
    }
  }, [user, viewMode]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 WEEKLY CHART: Fetching data for', viewMode, 'view');

      // FIXED: Use direct supabase import instead of supabaseApi.supabase
      const { data: recentData, error: fetchError } = await supabase
        .from('timesheet_entries')
        .select(`
      date,
      hours_worked,
      total_hours,
      regular_hours,
      break_duration,
      overtime_hours,
      status,
      user_id,
      activity_id,
      campaign_id,
      users!timesheet_entries_user_id_fkey (
        id,
        full_name,
        role,
        manager_id
      ),
      activities!timesheet_entries_activity_id_fkey (
        id,
        name
      ),
      campaigns!timesheet_entries_campaign_id_fkey (
        id,
        name
      )
    `)
        `)
        .order('date', { ascending: false })
        .limit(300); // Get enough data to find recent weeks

      if (fetchError) {
        throw new Error('Failed to fetch timesheet data: ' + (fetchError && fetchError.message));
      }

      if (!recentData || recentData.length === 0) {
        setChartData([]);
        setWeekRange('No data available');
        

setTotals({
          totalWorked: 0,
          totalBreaks: 0,
          totalOvertime: 0,
          activeUsers: 0,
          avgPerUser: 0
        });
        return;
      }

      // Find the most recent week with data
      const latestDate = new Date(recentData[0].date);
      const weekStart = new Date(latestDate);
      weekStart.setDate(latestDate.getDate() - latestDate.getDay()); // Start of week (Sunday)
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

      // Filter data for the most recent week
      let weekData = recentData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      // FIXED: Filter based on view mode and user permissions
      if (viewMode === 'personal' && user?.role !== 'admin') {
        weekData = weekData.filter(entry => entry.user_id === user.id);
      } else if (viewMode === 'organization' && user?.role === 'admin') {
        // Admin sees all data
      } else if (user?.role === 'campaign_lead' || user?.role === 'manager') {
        // Managers see their direct reports
        weekData = weekData.filter(entry => 
          entry.user_id === user.id || 
          entry.users?.manager_id === user.id
        );
      }

      // FIXED: Use COALESCE logic to get actual hours from any field
      const calculateHours = (entry) => {
        return entry.hours_worked || entry.total_hours || entry.regular_hours || 0;
      };

      // Create daily data structure
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dailyData = [];

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        
        const dayEntries = weekData.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.toDateString() === currentDate.toDateString();
        });

        const dayData = {
          day: days[i],
          date: currentDate.toISOString().split('T')[0],
          shortDay: days[i].substring(0, 3),
          workedHours: 0,
          breakHours: 0,
          overtimeHours: 0,
          userCount: 0,
          entries: dayEntries
        };

        // Calculate totals for the day
        const uniqueUsers = new Set();
        dayEntries.forEach(entry => {
          const hours = calculateHours(entry);
          if (hours > 0) {
            dayData.workedHours += hours;
            dayData.breakHours += (() => {
      if (!entry.break_duration) return 0;
      const [h, m, s] = entry.break_duration.split(':').map(Number);
      return (h || 0) + ((m || 0) / 60) + ((s || 0) / 3600);
    })();
            dayData.overtimeHours += entry.overtime_hours || 0;
            uniqueUsers.add(entry.user_id);
          }
        });

        dayData.userCount = uniqueUsers.size;
        dailyData.push(dayData);
      }

      // Calculate week totals
      const uniqueUsersWeek = new Set();
      let totalWorked = 0;
      let totalBreaks = 0;
      let totalOvertime = 0;

      weekData.forEach(entry => {
        const hours = calculateHours(entry);
        if (hours > 0) {
          totalWorked += hours;
          totalBreaks += (() => {
      if (!entry.break_duration) return 0;
      const [h, m, s] = entry.break_duration.split(':').map(Number);
      return (h || 0) + ((m || 0) / 60) + ((s || 0) / 3600);
    })();
          totalOvertime += entry.overtime_hours || 0;
          uniqueUsersWeek.add(entry.user_id);
        }
      });

      const activeUsers = uniqueUsersWeek.size;
      const avgPerUser = activeUsers > 0 ? totalWorked / activeUsers : 0;

      // Format week range
      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        });
      };

      setChartData(dailyData);
      setWeekRange(`${formatDate(weekStart)} - ${formatDate(weekEnd)}`);
      

setTotals({
        totalWorked: Math.round(totalWorked * 10) / 10,
        totalBreaks: Math.round(totalBreaks * 10) / 10,
        totalOvertime: Math.round(totalOvertime * 10) / 10,
        activeUsers,
        avgPerUser: Math.round(avgPerUser * 10) / 10
      });

      console.log('📊 WEEKLY CHART: Data processed', {
        weekRange: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
        totalEntries: weekData.length,
        totalWorked,
        activeUsers,
        viewMode
      });

    } catch (error) {
      console.error('📊 WEEKLY CHART: Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`;
  };

  const getMaxHours = () => {
    return Math.max(...chartData.map(day => day.workedHours), 8);
  };

  const canToggleView = () => {
    return user?.role === 'admin';
  };

  if (loading) {
    return (
      <div className="weekly-chart-container">
        <div className="chart-header">
          <h3>Tracked Hours This Week</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading weekly data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-chart-container">
        <div className="chart-header">
          <h3>Tracked Hours This Week</h3>
        </div>
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchWeeklyData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxHours = getMaxHours();

  return (
    <div className="weekly-chart-container">
      <div className="chart-header">
        <div>
          <h3>Tracked Hours This Week</h3>
          <p className="week-range">{weekRange}</p>
          {canToggleView() && (
            <div className="view-toggle">
              <button 
                className={viewMode === 'personal' ? 'active' : ''}
                onClick={() => setViewMode('personal')}
              >
                Personal
              </button>
              <button 
                className={viewMode === 'organization' ? 'active' : ''}
                onClick={() => setViewMode('organization')}
              >
                Organization
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="chart-content">
        <div className="chart-bars">
          {chartData.map((day, index) => (
            <div key={index} className="day-column">
              <div className="day-label">{day.shortDay}</div>
              
              <div className="bar-container" style={{ height: '200px' }}>
                {/* Worked Hours Bar */}
                {day.workedHours > 0 && (
                  <div 
                    className="bar worked-bar"
                    style={{ 
                      height: `${(day.workedHours / maxHours) * 180}px`,
                      background: 'linear-gradient(to top, #3b82f6, #60a5fa)'
                    }}
                    title={`${formatHours(day.workedHours)} worked`}
                  >
                    <span className="bar-value">{day.workedHours.toFixed(1)}</span>
                  </div>
                )}

                {/* Break Hours Bar (stacked) */}
                {day.breakHours > 0 && (
                  <div 
                    className="bar break-bar"
                    style={{ 
                      height: `${(day.breakHours / maxHours) * 180}px`,
                      background: 'linear-gradient(to top, #10b981, #34d399)',
                      marginTop: day.workedHours > 0 ? '2px' : '0'
                    }}
                    title={`${formatHours(day.breakHours)} breaks`}
                  >
                    <span className="bar-value">{day.breakHours.toFixed(1)}</span>
                  </div>
                )}

                {/* Overtime Hours Bar (stacked) */}
                {day.overtimeHours > 0 && (
                  <div 
                    className="bar overtime-bar"
                    style={{ 
                      height: `${(day.overtimeHours / maxHours) * 180}px`,
                      background: 'linear-gradient(to top, #f59e0b, #fbbf24)',
                      marginTop: (day.workedHours > 0 || day.breakHours > 0) ? '2px' : '0'
                    }}
                    title={`${formatHours(day.overtimeHours)} overtime`}
                  >
                    <span className="bar-value">{day.overtimeHours.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="day-info">
                <div className="day-hours">{formatHours(day.workedHours)}</div>
                <div className="day-users">{day.userCount} user{day.userCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#3b82f6' }}></span>
            <span>Worked Hours</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#10b981' }}></span>
            <span>Break Time</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#f59e0b' }}></span>
            <span>Overtime</span>
          </div>
        </div>

        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Total Worked:</span>
            <span className="summary-value">{formatHours(totals.totalWorked)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Breaks:</span>
            <span className="summary-value">{formatHours(totals.totalBreaks)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Overtime:</span>
            <span className="summary-value">{formatHours(totals.totalOvertime)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Active Users:</span>
            <span className="summary-value">{totals.activeUsers}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg per User:</span>
            <span className="summary-value">{formatHours(totals.avgPerUser)}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .weekly-chart-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .chart-header h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .week-range {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .view-toggle {
          display: flex;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 2px;
        }

        .view-toggle button {
          padding: 6px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
        }

        .view-toggle button.active {
          background: white;
          color: #1f2937;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .chart-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chart-bars {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 8px;
          padding: 0 8px;
        }

        .day-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .day-label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-align: center;
        }

        .bar-container {
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          position: relative;
        }

        .bar {
          width: 100%;
          max-width: 40px;
          border-radius: 4px 4px 0 0;
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .bar:hover {
          transform: scaleX(1.1);
          z-index: 10;
        }

        .bar-value {
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .day-info {
          text-align: center;
        }

        .day-hours {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .day-users {
          font-size: 11px;
          color: #6b7280;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          padding: 16px 0;
          border-top: 1px solid #e5e7eb;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6b7280;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .chart-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid #e5e7eb;
        }

        .summary-item {
          text-align: center;
        }

        .summary-label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .summary-value {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #f3f4f6;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .retry-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 8px;
        }

        .retry-button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default WeeklyChart;

