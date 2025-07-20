import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';
import OvertimeCalculationEngine from '../../utils/overtime_calculation_engine.js';

const TrackedHoursChart = () => {
  const { user, canViewAllTimesheets } = useAuth();
  const [chartData, setChartData] = useState({
    workedHours: { total: 0, daily: [] },
    breaks: { total: 0, daily: [] },
    overtimeHours: { total: 0, daily: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [calculationDetails, setCalculationDetails] = useState([]);

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
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Short labels like in the image

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

      // Get employee information for overtime calculation context
      try {
        const empInfo = await OvertimeCalculationEngine.getEmployeeInfo(user.id);
        setEmployeeInfo(empInfo);
        console.log('👤 EMPLOYEE INFO:', empInfo);
      } catch (empError) {
        console.log('👤 EMPLOYEE INFO: Using fallback');
        setEmployeeInfo({ employmentType: 'full_time', isExempt: false });
      }

      // FIXED: Use supabaseApi instead of direct supabase query with correct column names
      let entries;
      if (canViewAllTimesheets()) {
        // Get all timesheet entries for the week
        entries = await supabaseApi.getTimesheets({
          startDate: startDate,
          endDate: endDate
        });
      } else {
        // Get only user's own timesheet entries
        entries = await supabaseApi.getTimesheets({
          user_id: user.id,
          startDate: startDate,
          endDate: endDate
        });
      }

      console.log('📊 TRACKED HOURS: Fetched entries:', entries?.length || 0);

      // Process data with enhanced overtime calculation
      const processedData = await processTimesheetData(entries || []);
      setChartData(processedData.chartData);
      setCalculationDetails(processedData.details);

    } catch (error) {
      console.error('📊 TRACKED HOURS ERROR:', error);
      setError(error.message);
      
      // Set sample data for visualization when there's an error
      setSampleChartData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleChartData = () => {
    const sampleData = {
      workedHours: { 
        total: 40, 
        daily: [0, 8, 8, 8, 8, 8, 0] // Mon-Sun
      },
      breaks: { 
        total: 5, 
        daily: [0, 1, 1, 1, 1, 1, 0] 
      },
      overtimeHours: { 
        total: 5, 
        daily: [0, 1, 1, 1, 1, 1, 0] 
      }
    };
    setChartData(sampleData);
  };

  const processTimesheetData = async (entries) => {
    const chartData = {
      workedHours: { total: 0, daily: new Array(7).fill(0) },
      breaks: { total: 0, daily: new Array(7).fill(0) },
      overtimeHours: { total: 0, daily: new Array(7).fill(0) }
    };

    const details = [];

    // If no entries, set sample data
    if (!entries || entries.length === 0) {
      setSampleChartData();
      return { chartData, details };
    }

    // Group entries by user for proper overtime calculation
    const entriesByUser = entries.reduce((acc, entry) => {
      if (!acc[entry.user_id]) {
        acc[entry.user_id] = [];
      }
      acc[entry.user_id].push(entry);
      return acc;
    }, {});

    // Process each user's entries
    for (const [userId, userEntries] of Object.entries(entriesByUser)) {
      const userEmployee = userEntries[0]?.users;
      
      for (const entry of userEntries) {
        const entryDate = new Date(entry.date);
        const dayIndex = weekDates.findIndex(date => 
          date.toDateString() === entryDate.toDateString()
        );

        if (dayIndex !== -1) {
          let regular = 0;
          let overtime = 0;
          let dailyDoubleOvertime = 0;

          // Use existing calculated values if available
          if (entry.regular_hours !== null && entry.daily_overtime_hours !== null) {
            regular = parseFloat(entry.regular_hours) || 0;
            overtime = parseFloat(entry.daily_overtime_hours) || 0;
            dailyDoubleOvertime = parseFloat(entry.daily_double_overtime) || 0;
          } else {
            // Fall back to total hours
            regular = parseFloat(entry.hours_worked) || parseFloat(entry.total_hours) || 0;
            overtime = 0;
            dailyDoubleOvertime = 0;
          }

          const breakTime = parseFloat(entry.break_duration) || 0;
          const totalHours = regular + overtime + dailyDoubleOvertime;

          // Add to daily totals
          chartData.workedHours.daily[dayIndex] += totalHours;
          chartData.breaks.daily[dayIndex] += breakTime;
          chartData.overtimeHours.daily[dayIndex] += overtime + dailyDoubleOvertime;

          // Add to weekly totals
          chartData.workedHours.total += totalHours;
          chartData.breaks.total += breakTime;
          chartData.overtimeHours.total += overtime + dailyDoubleOvertime;

          // Store calculation details
          details.push({
            date: entry.date,
            dayIndex,
            userId,
            userName: userEmployee?.full_name || 'Unknown',
            regular,
            overtime,
            dailyDoubleOvertime,
            totalHours,
            breakTime
          });
        }
      }
    }

    return { chartData, details };
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
    return Math.ceil(max / 2) * 2 || 8; // Round up to nearest even number, minimum 8
  };

  const maxValue = getMaxValue();

  // Generate Y-axis labels
  const getYAxisLabels = () => {
    const labels = [];
    const step = maxValue / 4;
    for (let i = maxValue; i >= 0; i -= step) {
      labels.push(Math.round(i));
    }
    return labels;
  };

  if (loading) {
    return (
      <div className="weekly-chart-wrapper">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">TRACKED HOURS</h3>
          </div>
          <a href="/timesheets" className="chart-link">Go to timesheets</a>
        </div>
        <div className="chart-loading">
          <div className="chart-loading-spinner"></div>
          Loading timesheet data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-chart-wrapper">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">TRACKED HOURS</h3>
          </div>
          <a href="/timesheets" className="chart-link">Go to timesheets</a>
        </div>
        <div className="chart-error">
          <div className="chart-error-icon">⚠️</div>
          Error loading data: {error}
          <button onClick={fetchTimesheetData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-chart-wrapper">
      {/* Header */}
      <div className="chart-header">
        <div>
          <h3 className="chart-title">TRACKED HOURS</h3>
        </div>
        <a href="/timesheets" className="chart-link">Go to timesheets</a>
      </div>

      {/* Summary Stats - Left Side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#4F46E5' 
          }}></div>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>WORKED HOURS</span>
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
            {formatHours(chartData.workedHours.total)}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#10B981' 
          }}></div>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>BREAKS</span>
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
            {formatHours(chartData.breaks.total)}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#F59E0B' 
          }}></div>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>OVERTIME HOURS</span>
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
            {formatHours(chartData.overtimeHours.total)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="weekly-chart">
        {/* Y-axis labels */}
        <div className="chart-y-axis">
          {getYAxisLabels().map(value => (
            <div key={value}>{value}h</div>
          ))}
        </div>

        {/* Chart bars */}
        <div className="chart-bar-group">
          {dayLabels.map((day, index) => {
            const workedHeight = (chartData.workedHours.daily[index] / maxValue) * 100;
            const breakHeight = (chartData.breaks.daily[index] / maxValue) * 100;
            const overtimeHeight = (chartData.overtimeHours.daily[index] / maxValue) * 100;

            return (
              <div key={day} className="chart-bar-container">
                <div className="stacked-bar" style={{ height: '160px', justifyContent: 'flex-end' }}>
                  {/* Overtime hours bar (top) */}
                  {overtimeHeight > 0 && (
                    <div 
                      className="bar-segment overtime"
                      style={{ 
                        height: `${overtimeHeight}%`,
                        minHeight: overtimeHeight > 0 ? '4px' : '0'
                      }}
                      title={`Overtime: ${formatHours(chartData.overtimeHours.daily[index])}`}
                    />
                  )}
                  
                  {/* Break time bar (middle) */}
                  {breakHeight > 0 && (
                    <div 
                      className="bar-segment break"
                      style={{ 
                        height: `${breakHeight}%`,
                        minHeight: breakHeight > 0 ? '4px' : '0'
                      }}
                      title={`Breaks: ${formatHours(chartData.breaks.daily[index])}`}
                    />
                  )}
                  
                  {/* Worked hours bar (bottom) */}
                  {workedHeight > 0 && (
                    <div 
                      className="bar-segment worked"
                      style={{ 
                        height: `${workedHeight}%`,
                        minHeight: workedHeight > 0 ? '4px' : '0'
                      }}
                      title={`Worked: ${formatHours(chartData.workedHours.daily[index])}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="chart-x-axis">
          {dayLabels.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div style={{ 
        fontSize: '12px', 
        color: '#6B7280', 
        marginTop: '16px',
        fontStyle: 'italic'
      }}>
        Does not include manually entered payroll hours
      </div>
    </div>
  );
};

export default TrackedHoursChart;

