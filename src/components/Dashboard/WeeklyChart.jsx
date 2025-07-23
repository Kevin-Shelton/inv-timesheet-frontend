import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
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

  // Get current week dates with proper validation
  const getCurrentWeekDates = () => {
    try {
      const today = new Date();
      
      // Validate that today is a valid date
      if (isNaN(today.getTime())) {
        console.error('📊 WEEKLY CHART ERROR: Invalid current date');
        // Fallback to a known good date
        const fallbackDate = new Date('2025-01-20');
        return getWeekDatesFromDate(fallbackDate);
      }
      
      return getWeekDatesFromDate(today);
    } catch (error) {
      console.error('📊 WEEKLY CHART ERROR: Error getting current week dates:', error);
      // Return a fallback week
      const fallbackDate = new Date('2025-01-20');
      return getWeekDatesFromDate(fallbackDate);
    }
  };

  const getWeekDatesFromDate = (baseDate) => {
    try {
      const currentDay = baseDate.getDay();
      const monday = new Date(baseDate);
      
      // Calculate Monday of the current week (Sunday = 0, Monday = 1)
      const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      monday.setDate(baseDate.getDate() + daysToMonday);
      
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        
        // Validate each date before adding
        if (isNaN(date.getTime())) {
          console.error(`📊 WEEKLY CHART ERROR: Invalid date for day ${i}`);
          // Create a fallback date
          const fallbackDate = new Date(2025, 0, 20 + i); // January 20-26, 2025
          weekDates.push(fallbackDate);
        } else {
          weekDates.push(date);
        }
      }
      return weekDates;
    } catch (error) {
      console.error('📊 WEEKLY CHART ERROR: Error creating week dates:', error);
      // Return a complete fallback week
      return [
        new Date(2025, 0, 20), // Monday
        new Date(2025, 0, 21), // Tuesday
        new Date(2025, 0, 22), // Wednesday
        new Date(2025, 0, 23), // Thursday
        new Date(2025, 0, 24), // Friday
        new Date(2025, 0, 25), // Saturday
        new Date(2025, 0, 26)  // Sunday
      ];
    }
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

      // Validate weekDates before using toISOString
      const validatedWeekDates = weekDates.map((date, index) => {
        if (isNaN(date.getTime())) {
          console.error(`📊 WEEKLY CHART ERROR: Invalid date at index ${index}:`, date);
          // Return a fallback date
          return new Date(2025, 0, 20 + index);
        }
        return date;
      });

      const startDate = validatedWeekDates[0].toISOString().split('T')[0];
      const endDate = validatedWeekDates[6].toISOString().split('T')[0];

      console.log('📊 ENHANCED TRACKED HOURS: Fetching data for week:', startDate, 'to', endDate);

      // Get employee information for overtime calculation context
      try {
        const empInfo = await OvertimeCalculationEngine.getEmployeeInfo(user.id);
        setEmployeeInfo(empInfo);
      } catch (empError) {
        console.warn('Could not fetch employee info:', empError);
      }

      // FIXED: Fetch timesheet entries with explicit relationship specification
      // Instead of using nested select, we'll fetch data separately to avoid relationship ambiguity
      let query = supabase
        .from('timesheet_entries')
        .select('*') // Just select timesheet data first
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      // If user can't view all timesheets, only show their own
      if (!canViewAllTimesheets()) {
        query = query.eq('user_id', user.id);
      }

      const { data: entries, error: fetchError } = await query;

      if (fetchError) {
        console.error('📊 ENHANCED TRACKED HOURS ERROR:', fetchError);
        throw fetchError;
      }

      console.log('📊 ENHANCED TRACKED HOURS: Fetched entries:', entries?.length || 0);

      // Fetch user data separately to avoid relationship conflicts
      let userData = {};
      if (entries && entries.length > 0) {
        const userIds = [...new Set(entries.map(entry => entry.user_id))];
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, employment_type, hourly_rate')
          .in('id', userIds);

        if (!usersError && users) {
          userData = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
        }
      }

      // Process data with enhanced overtime calculation
      const processedData = await processTimesheetData(entries || [], validatedWeekDates, userData);
      setChartData(processedData.chartData);
      setCalculationDetails(processedData.details);

    } catch (error) {
      console.error('📊 WEEKLY CHART ERROR:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processTimesheetData = async (entries, validatedWeekDates, userData) => {
    const chartData = {
      workedHours: { total: 0, daily: new Array(7).fill(0) },
      breaks: { total: 0, daily: new Array(7).fill(0) },
      overtimeHours: { total: 0, daily: new Array(7).fill(0) }
    };

    const details = [];
    let weeklyRegularTotal = 0;
    let weeklyOvertimeTotal = 0;

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
      const userEmployee = userData[userId]; // Use separately fetched user data
      
      for (const entry of userEntries) {
        try {
          const entryDate = new Date(entry.date);
          
          // Validate entry date
          if (isNaN(entryDate.getTime())) {
            console.error('📊 WEEKLY CHART ERROR: Invalid entry date:', entry.date);
            continue; // Skip this entry
          }

          const dayIndex = validatedWeekDates.findIndex(date => {
            try {
              return date.toDateString() === entryDate.toDateString();
            } catch (error) {
              console.error('📊 WEEKLY CHART ERROR: Error comparing dates:', error);
              return false;
            }
          });

          if (dayIndex !== -1) {
            let regular = 0;
            let overtime = 0;
            let dailyDoubleOvertime = 0;
            let calculationMethod = 'unknown';

            // Use existing calculated values if available and not manual override
            if (entry.regular_hours !== null && entry.overtime_hours !== null && !entry.is_manual_override) {
              regular = parseFloat(entry.regular_hours) || 0;
              overtime = parseFloat(entry.overtime_hours) || 0;
              dailyDoubleOvertime = parseFloat(entry.daily_overtime_hours) || 0;
              calculationMethod = entry.calculation_method || 'existing';
            } else {
              // Recalculate using the overtime engine
              try {
                const calculationResult = await OvertimeCalculationEngine.calculateOvertimeEntry(
                  userId,
                  entry.date,
                  entry.clock_in_time || entry.time_in,
                  entry.clock_out_time || entry.time_out,
                  parseFloat(entry.break_duration) || 0,
                  entry.is_manual_override
                );

                regular = calculationResult.regular;
                overtime = calculationResult.overtime;
                dailyDoubleOvertime = calculationResult.dailyDoubleOvertime;
                calculationMethod = calculationResult.calculationMethod;

                console.log(`🧮 RECALCULATED ${entry.date}:`, calculationResult);
              } catch (calcError) {
                console.error('❌ CALCULATION ERROR:', calcError);
                // Fall back to existing values or total hours
                regular = parseFloat(entry.total_hours || entry.hours_worked) || 0;
                overtime = 0;
                dailyDoubleOvertime = 0;
                calculationMethod = 'fallback';
              }
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

            weeklyRegularTotal += regular;
            weeklyOvertimeTotal += overtime + dailyDoubleOvertime;

            // Store calculation details for debugging/display
            details.push({
              date: entry.date,
              dayIndex,
              userId,
              userName: userEmployee?.full_name || 'Unknown',
              employmentType: userEmployee?.employment_type || 'full_time',
              regular,
              overtime,
              dailyDoubleOvertime,
              totalHours,
              breakTime,
              calculationMethod,
              isManualOverride: entry.is_manual_override || false
            });
          }
        } catch (entryError) {
          console.error('📊 WEEKLY CHART ERROR: Error processing entry:', entryError, entry);
          // Continue processing other entries
        }
      }
    }

    console.log('📊 ENHANCED TRACKED HOURS: Final chart data:', chartData);
    console.log('📊 ENHANCED TRACKED HOURS: Calculation details:', details);

    return { chartData, details };
  };

  if (loading) {
    return (
      <div className="tracked-hours-chart loading">
        <div className="loading-spinner"></div>
        <p>Loading tracked hours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tracked-hours-chart error">
        <div className="error-message">
          <h4>Error Loading Chart</h4>
          <p>{error}</p>
          <button onClick={fetchTimesheetData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    ...chartData.workedHours.daily,
    ...chartData.breaks.daily,
    ...chartData.overtimeHours.daily,
    1 // Minimum value to prevent division by zero
  );

  return (
    <div className="tracked-hours-chart">
      <div className="chart-header">
        <h3>Tracked Hours This Week</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color worked"></span>
            <span>Worked Hours</span>
          </div>
          <div className="legend-item">
            <span className="legend-color breaks"></span>
            <span>Break Time</span>
          </div>
          <div className="legend-item">
            <span className="legend-color overtime"></span>
            <span>Overtime</span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-bars">
          {dayLabels.map((day, index) => {
            const workedHeight = maxValue > 0 ? (chartData.workedHours.daily[index] / maxValue) * 100 : 0;
            const breakHeight = maxValue > 0 ? (chartData.breaks.daily[index] / maxValue) * 100 : 0;
            const overtimeHeight = maxValue > 0 ? (chartData.overtimeHours.daily[index] / maxValue) * 100 : 0;

            // Get calculation details for this day - with proper error handling
            const dayDetails = calculationDetails.filter(d => {
              try {
                return d.dayIndex === index;
              } catch (error) {
                console.error('📊 WEEKLY CHART ERROR: Error filtering day details:', error);
                return false;
              }
            });
            
            const hasOvertime = chartData.overtimeHours.daily[index] > 0;
            const hasManualOverride = dayDetails.some(d => d.isManualOverride);

            return (
              <div key={day} className="day-column">
                <div className="day-label">{day}</div>
                <div className="bar-container">
                  {/* Worked Hours Bar */}
                  <div 
                    className={`bar worked ${hasOvertime ? 'has-overtime' : ''} ${hasManualOverride ? 'manual-override' : ''}`}
                    style={{ height: `${workedHeight}%` }}
                    title={`Worked: ${chartData.workedHours.daily[index].toFixed(1)}h${hasManualOverride ? ' (Manual)' : ''}`}
                  >
                    <span className="bar-value">
                      {chartData.workedHours.daily[index] > 0 ? chartData.workedHours.daily[index].toFixed(1) : ''}
                    </span>
                  </div>
                  
                  {/* Break Time Bar */}
                  {chartData.breaks.daily[index] > 0 && (
                    <div 
                      className="bar breaks"
                      style={{ height: `${breakHeight}%` }}
                      title={`Breaks: ${chartData.breaks.daily[index].toFixed(1)}h`}
                    >
                      <span className="bar-value">
                        {chartData.breaks.daily[index].toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  {/* Overtime Bar */}
                  {hasOvertime && (
                    <div 
                      className="bar overtime"
                      style={{ height: `${overtimeHeight}%` }}
                      title={`Overtime: ${chartData.overtimeHours.daily[index].toFixed(1)}h`}
                    >
                      <span className="bar-value">
                        {chartData.overtimeHours.daily[index].toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Day Details */}
                <div className="day-details">
                  <div className="total-hours">
                    {chartData.workedHours.daily[index].toFixed(1)}h
                  </div>
                  {hasOvertime && (
                    <div className="overtime-indicator">
                      OT: {chartData.overtimeHours.daily[index].toFixed(1)}h
                    </div>
                  )}
                  {hasManualOverride && (
                    <div className="manual-indicator" title="Manual Override">
                      M
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total Worked:</span>
          <span className="summary-value">{chartData.workedHours.total.toFixed(1)}h</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Breaks:</span>
          <span className="summary-value">{chartData.breaks.total.toFixed(1)}h</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Overtime:</span>
          <span className="summary-value overtime">{chartData.overtimeHours.total.toFixed(1)}h</span>
        </div>
      </div>

      {/* Enhanced Debug Information */}
      {process.env.NODE_ENV === 'development' && calculationDetails.length > 0 && (
        <div className="debug-info">
          <details>
            <summary>Debug: Calculation Details ({calculationDetails.length} entries)</summary>
            <div className="debug-content">
              {calculationDetails.map((detail, index) => (
                <div key={index} className="debug-entry">
                  <strong>{detail.date}</strong> - {detail.userName} ({detail.employmentType})
                  <br />
                  Regular: {detail.regular.toFixed(2)}h, 
                  Overtime: {detail.overtime.toFixed(2)}h, 
                  Total: {detail.totalHours.toFixed(2)}h
                  <br />
                  Method: {detail.calculationMethod}
                  {detail.isManualOverride && <span className="manual-tag"> [MANUAL]</span>}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default TrackedHoursChart;

