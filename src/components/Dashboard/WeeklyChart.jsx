import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const TrackedHoursChart = () => {
  const { user, canViewAllTimesheets } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTrackedHours();
    }
  }, [user]);

  const fetchTrackedHours = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 TRACKED HOURS: Fetching data...');

      // Get current week dates
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];

      // Generate week dates for display
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDates.push(date);
      }

      console.log('📊 TRACKED HOURS: Date range:', startDate, 'to', endDate);

      // FIXED: Explicitly specify the relationship using the foreign key column name
      // Instead of 'users!inner' which causes ambiguity, use 'user_id!inner'
      let query = supabase
        .from('timesheet_entries')
        .select(`
          date,
          hours_worked,
          break_duration,
          overtime_hours,
          user_id,
          user_id!inner(full_name, role)
        `)
        .gte('date', startDate)
        .lte('date', endDate);

      // If user can't view all timesheets, only show their own
      if (!canViewAllTimesheets()) {
        query = query.eq('user_id', user.id);
      }

      const { data: entries, error: fetchError } = await query;

      if (fetchError) {
        console.error('📊 TRACKED HOURS ERROR:', fetchError);
        throw fetchError;
      }

      console.log('📊 TRACKED HOURS: Fetched entries:', entries?.length || 0);

      // Process data by day
      const processedData = {
        workedHours: { total: 0, daily: new Array(7).fill(0) },
        breaks: { total: 0, daily: new Array(7).fill(0) },
        overtimeHours: { total: 0, daily: new Array(7).fill(0) }
      };

      entries?.forEach(entry => {
        const entryDate = new Date(entry.date);
        const dayIndex = weekDates.findIndex(date => 
          date.toDateString() === entryDate.toDateString()
        );

        if (dayIndex !== -1) {
          const worked = parseFloat(entry.hours_worked) || 0;
          const breakTime = parseFloat(entry.break_duration) || 0;
          const overtime = parseFloat(entry.overtime_hours) || 0;

          processedData.workedHours.daily[dayIndex] += worked;
          processedData.breaks.daily[dayIndex] += breakTime;
          processedData.overtimeHours.daily[dayIndex] += overtime;

          processedData.workedHours.total += worked;
          processedData.breaks.total += breakTime;
          processedData.overtimeHours.total += overtime;
        }
      });

      // Calculate max value for scaling
      const maxDailyHours = Math.max(
        ...processedData.workedHours.daily.map((worked, i) => 
          worked + processedData.breaks.daily[i] + processedData.overtimeHours.daily[i]
        )
      );

      setChartData({
        ...processedData,
        weekDates,
        maxDailyHours: Math.max(maxDailyHours, 8), // Minimum scale of 8 hours
        totalEntries: entries?.length || 0
      });

      console.log('📊 TRACKED HOURS: Data processed successfully');

    } catch (err) {
      console.error('📊 TRACKED HOURS: Error fetching data:', err);
      setError(err.message || 'Failed to load tracked hours data');
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours) => {
    return hours.toFixed(1);
  };

  const getDayLabel = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getBarHeight = (value, maxValue) => {
    if (maxValue === 0) return 0;
    return Math.max((value / maxValue) * 100, 2); // Minimum 2% height for visibility
  };

  const retryFetch = () => {
    fetchTrackedHours();
  };

  if (loading) {
    return (
      <div className="tracked-hours-chart">
        <div className="chart-header">
          <h3>Tracked Hours</h3>
          <a href="/timesheets" className="chart-link">View Details</a>
        </div>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading tracked hours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tracked-hours-chart">
        <div className="chart-header">
          <h3>Tracked Hours</h3>
          <a href="/timesheets" className="chart-link">View Details</a>
        </div>
        <div className="chart-error">
          <p>Error loading tracked hours</p>
          <small>{error}</small>
          <button onClick={retryFetch} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.totalEntries === 0) {
    return (
      <div className="tracked-hours-chart">
        <div className="chart-header">
          <h3>Tracked Hours</h3>
          <a href="/timesheets" className="chart-link">View Details</a>
        </div>
        <div className="chart-empty">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h4>No Time Entries</h4>
            <p>No timesheet entries found for this week. Start tracking your time to see your progress here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tracked-hours-chart">
      <div className="chart-header">
        <h3>Tracked Hours</h3>
        <a href="/timesheets" className="chart-link">View Details</a>
      </div>

      {/* Summary Statistics */}
      <div className="hours-summary">
        <div className="summary-item">
          <div className="summary-label">Worked</div>
          <div className="summary-value">{formatHours(chartData.workedHours.total)}h</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Breaks</div>
          <div className="summary-value">{formatHours(chartData.breaks.total)}h</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Overtime</div>
          <div className="summary-value">{formatHours(chartData.overtimeHours.total)}h</div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        {/* Y-axis */}
        <div className="y-axis">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="y-axis-label">
              {Math.round((chartData.maxDailyHours * (4 - i)) / 4)}h
            </div>
          ))}
        </div>

        {/* Chart Bars */}
        <div className="chart-bars">
          {chartData.weekDates.map((date, dayIndex) => {
            const workedHours = chartData.workedHours.daily[dayIndex];
            const breakHours = chartData.breaks.daily[dayIndex];
            const overtimeHours = chartData.overtimeHours.daily[dayIndex];
            const totalHours = workedHours + breakHours + overtimeHours;

            return (
              <div key={dayIndex} className="day-column">
                <div className="bar-container">
                  <div className="stacked-bar" style={{ height: '100%' }}>
                    {/* Overtime segment (top) */}
                    {overtimeHours > 0 && (
                      <div 
                        className="bar-segment overtime"
                        style={{ 
                          height: `${getBarHeight(overtimeHours, chartData.maxDailyHours)}%`,
                          minHeight: overtimeHours > 0 ? '3px' : '0'
                        }}
                        title={`Overtime: ${formatHours(overtimeHours)}h`}
                      />
                    )}
                    
                    {/* Break segment (middle) */}
                    {breakHours > 0 && (
                      <div 
                        className="bar-segment breaks"
                        style={{ 
                          height: `${getBarHeight(breakHours, chartData.maxDailyHours)}%`,
                          minHeight: breakHours > 0 ? '3px' : '0'
                        }}
                        title={`Breaks: ${formatHours(breakHours)}h`}
                      />
                    )}
                    
                    {/* Worked hours segment (bottom) */}
                    {workedHours > 0 && (
                      <div 
                        className="bar-segment worked"
                        style={{ 
                          height: `${getBarHeight(workedHours, chartData.maxDailyHours)}%`,
                          minHeight: workedHours > 0 ? '3px' : '0'
                        }}
                        title={`Worked: ${formatHours(workedHours)}h`}
                      />
                    )}
                  </div>
                </div>
                
                <div className="day-label">
                  {getDayLabel(date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color worked"></div>
          <span>Worked Hours</span>
        </div>
        <div className="legend-item">
          <div className="legend-color breaks"></div>
          <span>Break Time</span>
        </div>
        <div className="legend-item">
          <div className="legend-color overtime"></div>
          <span>Overtime</span>
        </div>
      </div>

      {/* Chart Footer */}
      <div className="chart-footer">
        <small>
          Showing data for week of {chartData.weekDates[0].toLocaleDateString()} - {chartData.weekDates[6].toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default TrackedHoursChart;

