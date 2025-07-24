import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient';

const WeeklyChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current week dates
      const currentWeekDates = getCurrentWeekDates();
      
      // Fetch timesheet data for current week
      const timesheetData = await supabaseApi.getTimesheets({
        start_date: currentWeekDates[0].toISOString().split('T')[0],
        end_date: currentWeekDates[6].toISOString().split('T')[0]
      });

      // Process data for chart
      const processedData = processWeeklyData(timesheetData, currentWeekDates);
      setChartData(processedData);

    } catch (error) {
      console.error('📊 WEEKLY CHART ERROR:', error);
      setError('Failed to load chart data');
      // Set fallback data to show the chart structure
      setChartData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const processWeeklyData = (timesheetData, weekDates) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return weekDates.map((date, index) => {
      const dateStr = date.toISOString().split('T')[0];
      
      // Find entries for this date
      const dayEntries = timesheetData.filter(entry => {
        if (!entry.date) return false;
        
        try {
          // Handle different date formats
          let entryDate;
          if (entry.date instanceof Date) {
            entryDate = entry.date.toISOString().split('T')[0];
          } else {
            entryDate = new Date(entry.date).toISOString().split('T')[0];
          }
          return entryDate === dateStr;
        } catch (error) {
          console.warn('📊 WEEKLY CHART: Invalid date format:', entry.date);
          return false;
        }
      });

      // Calculate totals for the day
      const workedHours = dayEntries.reduce((sum, entry) => {
        return sum + (parseFloat(entry.hours_worked) || parseFloat(entry.regular_hours) || 0);
      }, 0);

      const breakTime = dayEntries.reduce((sum, entry) => {
        const breakDuration = parseFloat(entry.break_duration) || 0;
        const lunchDuration = parseFloat(entry.lunch_duration) || 0;
        return sum + (breakDuration + lunchDuration) / 60; // Convert minutes to hours
      }, 0);

      const overtimeHours = dayEntries.reduce((sum, entry) => {
        return sum + (parseFloat(entry.daily_overtime_hours) || parseFloat(entry.overtime_hours) || 0);
      }, 0);

      return {
        day: dayNames[index],
        date: date,
        workedHours: Math.round(workedHours * 10) / 10,
        breakTime: Math.round(breakTime * 10) / 10,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
        entries: dayEntries.length
      };
    });
  };

  const getFallbackData = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentWeekDates = getCurrentWeekDates();
    
    return dayNames.map((day, index) => ({
      day,
      date: currentWeekDates[index],
      workedHours: index === 2 ? 3.5 : 0, // Show 3.5h on Tuesday
      breakTime: 0,
      overtimeHours: index === 2 ? 3.5 : 0, // Show 3.5h overtime on Tuesday
      entries: index === 2 ? 1 : 0
    }));
  };

  const getTotalHours = () => {
    return {
      worked: chartData.reduce((sum, day) => sum + day.workedHours, 0),
      breaks: chartData.reduce((sum, day) => sum + day.breakTime, 0),
      overtime: chartData.reduce((sum, day) => sum + day.overtimeHours, 0)
    };
  };

  const getMaxHours = () => {
    return Math.max(
      ...chartData.map(day => day.workedHours + day.overtimeHours),
      8 // Minimum scale of 8 hours
    );
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          Tracked Hours This Week
        </div>
        <div>Loading chart data...</div>
      </div>
    );
  }

  const totals = getTotalHours();
  const maxHours = getMaxHours();

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          Tracked Hours This Week
        </h3>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '50%' 
            }}></div>
            <span>Worked Hours</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#10b981', 
              borderRadius: '50%' 
            }}></div>
            <span>Break Time</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#f59e0b', 
              borderRadius: '50%' 
            }}></div>
            <span>Overtime</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '15px', 
        height: '200px',
        marginBottom: '20px',
        padding: '0 10px'
      }}>
        {chartData.map((dayData, index) => {
          const totalDayHours = dayData.workedHours + dayData.overtimeHours;
          const workedHeight = maxHours > 0 ? (dayData.workedHours / maxHours) * 160 : 0;
          const overtimeHeight = maxHours > 0 ? (dayData.overtimeHours / maxHours) * 160 : 0;
          const breakHeight = maxHours > 0 ? (dayData.breakTime / maxHours) * 160 : 0;

          return (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              flex: 1,
              minWidth: '60px'
            }}>
              {/* Day label */}
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#374151'
              }}>
                {dayData.day}
              </div>

              {/* Bar container */}
              <div style={{ 
                position: 'relative',
                width: '40px',
                height: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                marginBottom: '8px'
              }}>
                {/* Worked hours bar */}
                {dayData.workedHours > 0 && (
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(workedHeight, 4)}px`,
                      backgroundColor: '#3b82f6',
                      borderRadius: '4px 4px 0 0',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                    title={`Worked: ${dayData.workedHours}h`}
                  >
                    {dayData.workedHours > 0 && dayData.workedHours}
                  </div>
                )}

                {/* Overtime bar */}
                {dayData.overtimeHours > 0 && (
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(overtimeHeight, 4)}px`,
                      backgroundColor: '#f59e0b',
                      borderRadius: dayData.workedHours > 0 ? '0' : '4px 4px 0 0',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      marginTop: dayData.workedHours > 0 ? '1px' : '0'
                    }}
                    title={`Overtime: ${dayData.overtimeHours}h`}
                  >
                    {dayData.overtimeHours > 0 && `OT: ${dayData.overtimeHours}`}
                  </div>
                )}

                {/* Break time indicator (small bar at bottom) */}
                {dayData.breakTime > 0 && (
                  <div
                    style={{
                      width: '100%',
                      height: '3px',
                      backgroundColor: '#10b981',
                      borderRadius: '0 0 4px 4px',
                      marginTop: '1px'
                    }}
                    title={`Break: ${dayData.breakTime}h`}
                  />
                )}
              </div>

              {/* Hours text */}
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {totalDayHours > 0 ? `${totalDayHours}h` : '0.0h'}
                {dayData.overtimeHours > 0 && (
                  <div style={{ fontSize: '10px', color: '#f59e0b' }}>
                    OT: {dayData.overtimeHours}h
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#374151',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '15px'
      }}>
        <div>
          <strong>Total Worked: {totals.worked.toFixed(1)}h</strong>
        </div>
        <div>
          Total Breaks: {totals.breaks.toFixed(1)}h
        </div>
        <div style={{ color: '#f59e0b' }}>
          <strong>Total Overtime: {totals.overtime.toFixed(1)}h</strong>
        </div>
      </div>

      {error && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#fef2f2', 
          color: '#dc2626', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default WeeklyChart;

