import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const WeeklyChart = () => {
  const { user, canViewAllTimesheets } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    fetchWeeklyData();
  }, [user]);

  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📊 WEEKLY: Fetching weekly timesheet data...');

      // Get current week dates
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + 1);

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date.toISOString().split('T')[0]);
      }

      // First, check what columns exist in the timesheet_entries table
      const { data: sampleData, error: sampleError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .limit(1);

      let selectColumns = 'date, hours_worked';
      
      if (sampleData && sampleData.length > 0) {
        const availableColumns = Object.keys(sampleData[0]);
        console.log('📊 WEEKLY: Available columns:', availableColumns);
        
        // Add optional columns if they exist
        if (availableColumns.includes('break_hours')) {
          selectColumns += ', break_hours';
        }
        if (availableColumns.includes('overtime_hours')) {
          selectColumns += ', overtime_hours';
        }
        if (availableColumns.includes('user_id')) {
          selectColumns += ', user_id';
        }
      }

      // Build query based on user permissions
      let query = supabase
        .from('timesheet_entries')
        .select(selectColumns)
        .in('date', weekDates);

      // Add user filter if not admin
      if (!canViewAllTimesheets && sampleData && sampleData.length > 0 && 
          Object.keys(sampleData[0]).includes('user_id')) {
        query = query.eq('user_id', user.id);
      }

      const { data: entriesData, error: fetchError } = await query;

      if (fetchError) {
        console.error('📊 WEEKLY ERROR:', fetchError);
        throw new Error(`Failed to fetch timesheet data: ${fetchError.message}`);
      }

      console.log('📊 WEEKLY: Raw data:', entriesData);

      // Process data for each day of the week
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const processedData = weekDates.map((date, index) => {
        const dayEntries = entriesData?.filter(entry => entry.date === date) || [];
        
        const worked = dayEntries.reduce((sum, entry) => 
          sum + (parseFloat(entry.hours_worked) || 0), 0);
        
        const breaks = dayEntries.reduce((sum, entry) => 
          sum + (parseFloat(entry.break_hours) || 0), 0);
        
        const overtime = dayEntries.reduce((sum, entry) => 
          sum + (parseFloat(entry.overtime_hours) || 0), 0);

        return {
          day: dayNames[index],
          date: date,
          worked: worked,
          break: breaks,
          overtime: overtime,
          total: worked + breaks + overtime
        };
      });

      const weekTotal = processedData.reduce((sum, day) => sum + day.total, 0);

      setChartData(processedData);
      setTotalHours(weekTotal);
      console.log('📊 WEEKLY: Processed data:', processedData);

    } catch (error) {
      console.error('📊 WEEKLY ERROR:', error);
      setError(error.message || 'Failed to load weekly data');
    } finally {
      setLoading(false);
    }
  };

  const maxHours = Math.max(...chartData.map(day => day.total), 8);
  const yAxisLabels = Array.from({ length: 5 }, (_, i) => Math.round((maxHours / 4) * i));

  if (loading) {
    return (
      <div className="weekly-chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">Tracked Hours</h3>
          <p className="chart-subtitle">Loading...</p>
        </div>
        <div className="chart-loading">
          <div className="chart-loading-spinner"></div>
          Loading tracked hours data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">Tracked Hours</h3>
          <p className="chart-subtitle">Error loading data</p>
        </div>
        <div className="chart-error">
          <div className="chart-error-icon">⚠️</div>
          <div>Error loading tracked hours</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            {error.includes('column') 
              ? 'Database schema needs updating. Please contact your administrator.'
              : error
            }
          </div>
          <button 
            onClick={fetchWeeklyData}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (chartData.length === 0 || totalHours === 0) {
    return (
      <div className="weekly-chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">Tracked Hours</h3>
          <p className="chart-subtitle">This week's time tracking</p>
        </div>
        <div className="chart-empty">
          <div className="chart-empty-icon">📊</div>
          <div>No tracked hours data</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Start tracking time to see your weekly hours here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-chart-wrapper">
      <div className="chart-header">
        <h3 className="chart-title">Tracked Hours</h3>
        <p className="chart-subtitle">
          {totalHours.toFixed(1)} hours tracked this week
        </p>
      </div>

      <div className="weekly-chart">
        {/* Y-Axis */}
        <div className="chart-y-axis">
          {yAxisLabels.reverse().map((label, index) => (
            <div key={index}>{label}h</div>
          ))}
        </div>

        {/* Bars */}
        <div className="chart-bar-group">
          {chartData.map((day, index) => (
            <div key={day.day} className="chart-bar-container">
              <div className="stacked-bar">
                {day.worked > 0 && (
                  <div
                    className="bar-segment worked"
                    style={{
                      height: `${(day.worked / maxHours) * 100}%`
                    }}
                    title={`Worked: ${day.worked.toFixed(1)}h`}
                  />
                )}
                {day.break > 0 && (
                  <div
                    className="bar-segment break"
                    style={{
                      height: `${(day.break / maxHours) * 100}%`
                    }}
                    title={`Break: ${day.break.toFixed(1)}h`}
                  />
                )}
                {day.overtime > 0 && (
                  <div
                    className="bar-segment overtime"
                    style={{
                      height: `${(day.overtime / maxHours) * 100}%`
                    }}
                    title={`Overtime: ${day.overtime.toFixed(1)}h`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* X-Axis */}
        <div className="chart-x-axis">
          {chartData.map(day => (
            <div key={day.day}>{day.day}</div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color worked"></div>
          <span>Worked Hours</span>
        </div>
        <div className="legend-item">
          <div className="legend-color break"></div>
          <span>Break Hours</span>
        </div>
        <div className="legend-item">
          <div className="legend-color overtime"></div>
          <span>Overtime Hours</span>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '12px' }}>
        Chart will automatically refresh when new timesheet entries are added
      </div>
    </div>
  );
};

export default WeeklyChart;

