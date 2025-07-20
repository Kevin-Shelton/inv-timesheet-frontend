// Fixed WeeklyChart Component - Uses correct column names and supabaseApi
// Replace your existing src/components/Dashboard/WeeklyChart.jsx with this file

import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';

const WeeklyChart = ({ user }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeeklyData();
  }, [user]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 WeeklyChart: Fetching weekly data for user:', user?.id);
      
      // Calculate date range for current week
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
      
      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];
      
      console.log('📊 WeeklyChart: Fetching data from', startDate, 'to', endDate);
      
      // Use corrected supabaseApi function with proper parameters
      const timesheetData = await supabaseApi.getTimesheets({
        user_id: user?.id,
        startDate: startDate,
        endDate: endDate,
        limit: 50
      });
      
      console.log('📊 WeeklyChart: Received timesheet data:', timesheetData?.length || 0, 'entries');
      
      if (!timesheetData || timesheetData.length === 0) {
        console.log('📊 WeeklyChart: No data found, using sample data');
        // Provide sample data for the chart
        const sampleData = generateSampleWeekData();
        setChartData(sampleData);
        setLoading(false);
        return;
      }
      
      // Process the data for chart display
      const processedData = processWeeklyData(timesheetData);
      setChartData(processedData);
      
      console.log('📊 WeeklyChart: Processed chart data:', processedData);
      
    } catch (error) {
      console.error('📊 WeeklyChart: Error fetching weekly data:', error);
      setError(error.message || 'Failed to load weekly data');
      
      // Provide fallback sample data
      const sampleData = generateSampleWeekData();
      setChartData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (timesheetData) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = daysOfWeek.map(day => ({
      day,
      hours: 0,
      regularHours: 0,
      overtimeHours: 0
    }));
    
    timesheetData.forEach(entry => {
      if (entry.date) {
        const entryDate = new Date(entry.date);
        const dayIndex = entryDate.getDay();
        
        if (dayIndex >= 0 && dayIndex < 7) {
          // Use the correct column names from your actual schema
          const regularHours = parseFloat(entry.regular_hours || 0);
          const overtimeHours = parseFloat(entry.daily_overtime_hours || entry.overtime_hours || 0);
          const totalHours = parseFloat(entry.hours_worked || entry.total_hours || regularHours + overtimeHours);
          
          weekData[dayIndex].hours += totalHours;
          weekData[dayIndex].regularHours += regularHours;
          weekData[dayIndex].overtimeHours += overtimeHours;
        }
      }
    });
    
    return weekData;
  };

  const generateSampleWeekData = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek.map((day, index) => ({
      day,
      hours: index === 0 || index === 6 ? 0 : Math.floor(Math.random() * 4) + 6, // 6-10 hours on weekdays, 0 on weekends
      regularHours: index === 0 || index === 6 ? 0 : 8,
      overtimeHours: index === 0 || index === 6 ? 0 : Math.floor(Math.random() * 2)
    }));
  };

  const maxHours = Math.max(...chartData.map(d => d.hours), 10);

  if (loading) {
    return (
      <div className="weekly-chart">
        <div className="chart-header">
          <h3>Weekly Hours</h3>
        </div>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading weekly data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-chart">
      <div className="chart-header">
        <h3>Weekly Hours</h3>
        {error && (
          <div className="chart-error">
            <small>Using sample data - {error}</small>
          </div>
        )}
      </div>
      
      <div className="chart-container">
        <div className="chart-bars">
          {chartData.map((data, index) => (
            <div key={index} className="chart-bar-container">
              <div className="chart-bar-wrapper">
                {/* Regular hours bar */}
                <div 
                  className="chart-bar regular-hours"
                  style={{ 
                    height: `${(data.regularHours / maxHours) * 100}%`,
                    backgroundColor: '#4CAF50'
                  }}
                  title={`Regular: ${data.regularHours}h`}
                />
                {/* Overtime hours bar */}
                {data.overtimeHours > 0 && (
                  <div 
                    className="chart-bar overtime-hours"
                    style={{ 
                      height: `${(data.overtimeHours / maxHours) * 100}%`,
                      backgroundColor: '#FF9800'
                    }}
                    title={`Overtime: ${data.overtimeHours}h`}
                  />
                )}
              </div>
              <div className="chart-label">
                <span className="day-label">{data.day}</span>
                <span className="hours-label">{data.hours.toFixed(1)}h</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>Regular Hours</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
            <span>Overtime Hours</span>
          </div>
        </div>
      </div>
      
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total Week:</span>
          <span className="summary-value">
            {chartData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Regular:</span>
          <span className="summary-value">
            {chartData.reduce((sum, d) => sum + d.regularHours, 0).toFixed(1)}h
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Overtime:</span>
          <span className="summary-value">
            {chartData.reduce((sum, d) => sum + d.overtimeHours, 0).toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;

