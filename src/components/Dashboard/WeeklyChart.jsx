import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const TrackedHoursChart = () => {
  const { user, canViewAllTimesheets } = useAuth();
  const [chartData, setChartData] = useState({
    workedHours: { total: 0, daily: [] },
    breaks: { total: 0, daily: [] },
    overtimeHours: { total: 0, daily: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current week dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates();
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    fetchTimesheetData();
  }, [user]);

  const fetchTimesheetData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];

      console.log('📊 TRACKED HOURS: Fetching data for week:', startDate, 'to', endDate);

      // FIXED: Build query based on user permissions with corrected schema
      let query = supabase
        .from('timesheet_entries')
        .select(`
          date,
          hours_worked,
          break_duration,
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

      // Process data by day - FIXED: Removed overtime_hours references
      const processedData = {
        workedHours: { total: 0, daily: new Array(7).fill(0) },
        breaks: { total: 0, daily: new Array(7).fill(0) },
        overtimeHours: { total: 0, daily: new Array(7).fill(0) } // Keep structure but set to 0
      };

      entries?.forEach(entry => {
        const entryDate = new Date(entry.date);
        const dayIndex = weekDates.findIndex(date => 
          date.toDateString() === entryDate.toDateString()
        );

        if (dayIndex !== -1) {
          const worked = parseFloat(entry.hours_worked) || 0;
          const breakTime = parseFloat(entry.break_duration) || 0;
          // FIXED: Don't try to access overtime_hours since it doesn't exist
          // const overtime = parseFloat(entry.overtime_hours) || 0;

          processedData.workedHours.daily[dayIndex] += worked;
          processedData.breaks.daily[dayIndex] += breakTime;
          // processedData.overtimeHours.daily[dayIndex] += overtime; // Keep as 0

          processedData.workedHours.total += worked;
          processedData.breaks.total += breakTime;
          // processedData.overtimeHours.total += overtime; // Keep as 0
        }
      });

      setChartData(processedData);
      console.log('📊 TRACKED HOURS: Processed data:', processedData);

    } catch (error) {
      console.error('📊 TRACKED HOURS ERROR:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getMaxValue = () => {
    const allValues = [
      ...chartData.workedHours.daily,
      ...chartData.breaks.daily,
      ...chartData.overtimeHours.daily
    ];
    const max = Math.max(...allValues);
    return Math.ceil(max / 2) * 2; // Round up to nearest even number
  };

  const maxValue = getMaxValue() || 8;

  if (loading) {
    return (
      <div className="tracked-hours-chart">
        <div className="chart-header">
          <h3>TRACKED HOURS</h3>
          <a href="/timesheets" className="chart-link">Go to timesheets</a>
        </div>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading timesheet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tracked-hours-chart">
        <div className="chart-header">
          <h3>TRACKED HOURS</h3>
          <a href="/timesheets" className="chart-link">Go to timesheets</a>
        </div>
        <div className="chart-error">
          <p>Error loading data: {error}</p>
          <button onClick={fetchTimesheetData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tracked-hours-chart">
      <div className="chart-header">
        <h3>TRACKED HOURS</h3>
        <a href="/timesheets" className="chart-link">Go to timesheets</a>
      </div>

      {/* Summary Stats */}
      <div className="hours-summary">
        <div className="summary-item">
          <span className="summary-label">WORKED HOURS</span>
          <span className="summary-value">{formatHours(chartData.workedHours.total)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">BREAKS</span>
          <span className="summary-value">{formatHours(chartData.breaks.total)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">OVERTIME HOURS</span>
          <span className="summary-value">{formatHours(chartData.overtimeHours.total)}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        {/* Y-axis labels */}
        <div className="y-axis">
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map(value => (
            <div key={value} className="y-axis-label">
              {Math.round(value)}h
            </div>
          ))}
        </div>

        {/* Chart bars */}
        <div className="chart-bars">
          {dayLabels.map((day, index) => {
            const workedHeight = (chartData.workedHours.daily[index] / maxValue) * 100;
            const breakHeight = (chartData.breaks.daily[index] / maxValue) * 100;
            const overtimeHeight = (chartData.overtimeHours.daily[index] / maxValue) * 100;

            return (
              <div key={day} className="day-column">
                <div className="bar-container">
                  {/* Stacked bars - bottom to top: worked, breaks, overtime */}
                  <div className="stacked-bar">
                    {/* Worked hours bar (bottom) */}
                    {workedHeight > 0 && (
                      <div 
                        className="bar-segment worked"
                        style={{ height: `${workedHeight}%` }}
                        title={`Worked: ${formatHours(chartData.workedHours.daily[index])}`}
                      />
                    )}
                    
                    {/* Break time bar (middle) */}
                    {breakHeight > 0 && (
                      <div 
                        className="bar-segment breaks"
                        style={{ height: `${breakHeight}%` }}
                        title={`Breaks: ${formatHours(chartData.breaks.daily[index])}`}
                      />
                    )}
                    
                    {/* Overtime hours bar (top) - will be 0 but keeping for UI consistency */}
                    {overtimeHeight > 0 && (
                      <div 
                        className="bar-segment overtime"
                        style={{ height: `${overtimeHeight}%` }}
                        title={`Overtime: ${formatHours(chartData.overtimeHours.daily[index])}`}
                      />
                    )}
                  </div>
                </div>
                <div className="day-label">{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color worked"></div>
          <span>Worked Hours</span>
        </div>
        <div className="legend-item">
          <div className="legend-color breaks"></div>
          <span>Breaks</span>
        </div>
        <div className="legend-item">
          <div className="legend-color overtime"></div>
          <span>Overtime</span>
        </div>
      </div>

      {/* Footer note */}
      <div className="chart-footer">
        <small>Does not include manually entered payroll hours</small>
      </div>
    </div>
  );
};

export default TrackedHoursChart;

