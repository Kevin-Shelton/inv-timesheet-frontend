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

      console.log('📊 ENHANCED TRACKED HOURS: Fetching data for week:', startDate, 'to', endDate);

      // Get employee information for overtime calculation context
      const empInfo = await OvertimeCalculationEngine.getEmployeeInfo(user.id);
      setEmployeeInfo(empInfo);
      console.log('👤 EMPLOYEE INFO:', empInfo);

      // Use corrected supabaseApi function instead of direct supabase query
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

      console.log('📊 ENHANCED TRACKED HOURS: Fetched entries:', entries?.length || 0);

      // Process data with enhanced overtime calculation
      const processedData = await processTimesheetData(entries || []);
      setChartData(processedData.chartData);
      setCalculationDetails(processedData.details);

    } catch (error) {
      console.error('📊 ENHANCED TRACKED HOURS ERROR:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processTimesheetData = async (entries) => {
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
          let calculationMethod = 'unknown';

          // Use existing calculated values if available and not manual override
          if (entry.regular_hours !== null && entry.daily_overtime_hours !== null && !entry.is_manual_override) {
            regular = parseFloat(entry.regular_hours) || 0;
            overtime = parseFloat(entry.daily_overtime_hours) || 0;
            dailyDoubleOvertime = parseFloat(entry.daily_double_overtime) || 0;
            calculationMethod = entry.calculation_method || 'existing';
          } else {
            // Recalculate using the overtime engine
            try {
              const calculationResult = await OvertimeCalculationEngine.calculateOvertimeEntry(
                userId,
                entry.date,
                entry.clock_in_time, // FIXED: Use correct column name
                entry.clock_out_time, // FIXED: Use correct column name
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
              regular = parseFloat(entry.hours_worked) || parseFloat(entry.total_hours) || 0;
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

          // Store calculation details for debugging/display_
          details.push({
            date: entry.date,
            dayIndex,
            userId,
            userName: userEmployee?.full_name || 'Unknown',
            employmentType: userEmployee?.employment_type || 'full_time',
            isExempt: userEmployee?.is_exempt || false,
            regular,
            overtime,
            dailyDoubleOvertime,
            totalHours,
            breakTime,
            calculationMethod,
            isManualOverride: entry.is_manual_override,
            weeklyHoursAtCalculation: entry.weekly_hours_at_calculation
          });
        }
      }
    }

    console.log('📊 PROCESSED DATA:', {
      weeklyRegular: weeklyRegularTotal,
      weeklyOvertime: weeklyOvertimeTotal,
      totalEntries: details.length
    });

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
    return Math.ceil(max / 2) * 2; // Round up to nearest even number
  };

  const maxValue = getMaxValue() || 8;

  // Get overtime calculation summary for display
  const getOvertimeSummary = () => {
    if (!employeeInfo) return null;

    const summary = {
      employmentType: employeeInfo.employmentType,
      isExempt: employeeInfo.isExempt,
      calculationMethod: employeeInfo.employmentType === 'part_time' ? 'Daily (8+ hours)' : 'Weekly (40+ hours)',
      weeklyTotal: chartData.workedHours.total,
      overtimeTotal: chartData.overtimeHours.total
    };

    return summary;
  };

  const overtimeSummary = getOvertimeSummary();

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

      {/* Employee Info & Overtime Calculation Summary */}
      {overtimeSummary && (
        <div className="overtime-summary">
          <div className="summary-header">
            <span className="employee-type-badge" data-type={overtimeSummary.employmentType}>
              {overtimeSummary.employmentType.replace('_', ' ').toUpperCase()}
              {overtimeSummary.isExempt && ' (EXEMPT)'}
            </span>
            <span className="calculation-method">
              OT: {overtimeSummary.calculationMethod}
            </span>
          </div>
        </div>
      )}

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
          <span className="summary-value overtime-highlight">{formatHours(chartData.overtimeHours.total)}</span>
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

            // Get calculation details for this day
            const dayDetails = calculationDetails.filter(d => d.dayIndex === index);
            const hasOvertime = chartData.overtimeHours.daily[index] > 0;
            const hasManualOverride = dayDetails.some(d => d.isManualOverride);

            return (
              <div key={day} className="day-column">
                <div className="bar-container">
                  {/* Stacked bars - bottom to top: worked, breaks, overtime */}
                  <div className="stacked-bar">
                    {/* Worked hours bar (bottom) */}
                    {workedHeight > 0 && (
                      <div 
                        className={`bar-segment worked ${hasOvertime ? 'has-overtime' : ''}`}
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
                    
                    {/* Overtime hours bar (top) */}
                    {overtimeHeight > 0 && (
                      <div 
                        className={`bar-segment overtime ${hasManualOverride ? 'manual-override' : 'calculated'}`}
                        style={{ height: `${overtimeHeight}%` }}
                        title={`Overtime: ${formatHours(chartData.overtimeHours.daily[index])}${hasManualOverride ? ' (Manual)' : ' (Auto)'}`}
                      />
                    )}
                  </div>

                  {/* Overtime indicator */}
                  {hasOvertime && (
                    <div className="overtime-indicator">
                      {hasManualOverride ? '⚠️' : '🧮'}
                    </div>
                  )}
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
          <span>Regular Hours</span>
        </div>
        <div className="legend-item">
          <div className="legend-color breaks"></div>
          <span>Breaks</span>
        </div>
        <div className="legend-item">
          <div className="legend-color overtime"></div>
          <span>Overtime</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator">🧮</div>
          <span>Auto-calculated</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator">⚠️</div>
          <span>Manual override</span>
        </div>
      </div>

      {/* Calculation Details (for debugging - - can be hidden in production) */}
      {process.env.NODE_ENV === 'development' && calculationDetails.length > 0 && (
        <div className="calculation-debug">
          <details>
            <summary>Calculation Details (Debug)</summary>
            <div className="debug-table">
              {calculationDetails.map((detail, index) => (
                <div key={index} className="debug-row">
                  <span>{detail.date}</span>
                  <span>{detail.userName}</span>
                  <span>{detail.employmentType}</span>
                  <span>R: {detail.regular}h</span>
                  <span>OT: {detail.overtime}h</span>
                  <span>{detail.calculationMethod}</span>
                  {detail.isManualOverride && <span className="manual-badge">MANUAL</span>}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Footer note */}
      <div className="chart-footer">
        <small>
          Overtime calculated based on employee type: 
          {overtimeSummary?.employmentType === 'part_time' ? ' Daily threshold (8+ hours)' : ' Weekly cumulative (40+ hours)'}
          {overtimeSummary?.isExempt && ' • Exempt employee (no overtime)'}
        </small>
      </div>
    </div>
  );
};

export default TrackedHoursChart;

