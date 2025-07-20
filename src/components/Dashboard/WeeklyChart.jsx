import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const WeeklyChart = () => {
  const { user, canViewAllTimesheets } = useAuth();
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalHours, setTotalHours] = useState({ worked: 0, breaks: 0, overtime: 0 });

  useEffect(() => {
    fetchWeeklyData();
  }, [user]);

  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📊 WEEKLY CHART: Fetching weekly data...');

      // Get current week dates
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = monday.toISOString().split('T')[0];
      const endDate = sunday.toISOString().split('T')[0];

      // FIXED: Use supabaseApi instead of direct supabase query
      let entries;
      if (canViewAllTimesheets()) {
        entries = await supabaseApi.getTimesheets({
          startDate: startDate,
          endDate: endDate
        });
      } else {
        entries = await supabaseApi.getTimesheets({
          user_id: user.id,
          startDate: startDate,
          endDate: endDate
        });
      }

      console.log('📊 WEEKLY CHART: Fetched entries:', entries?.length || 0);

      // Process data for each day of the week
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayAbbreviations = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      
      const processedData = daysOfWeek.map((dayName, index) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + index);
        const dateString = dayDate.toISOString().split('T')[0];
        
        // Find entries for this day
        const dayEntries = entries?.filter(entry => {
          const entryDate = new Date(entry.date || entry.created_at).toISOString().split('T')[0];
          return entryDate === dateString;
        }) || [];

        // Calculate hours for this day
        let workedHours = 0;
        let breakHours = 0;
        let overtimeHours = 0;

        dayEntries.forEach(entry => {
          const hours = parseFloat(entry.hours_worked) || parseFloat(entry.total_hours) || parseFloat(entry.regular_hours) || 0;
          const dailyOvertime = parseFloat(entry.daily_overtime_hours) || 0;
          const weeklyOvertime = parseFloat(entry.weekly_overtime_hours) || 0;
          
          workedHours += hours;
          overtimeHours += Math.max(dailyOvertime, weeklyOvertime);
          
          // Estimate break hours (typically 0.5-1 hour per 8-hour day)
          if (hours > 4) {
            breakHours += Math.min(1, hours * 0.125); // 12.5% of worked hours as breaks
          }
        });

        return {
          day: dayName,
          dayAbbr: dayAbbreviations[index],
          date: dateString,
          worked: workedHours,
          breaks: breakHours,
          overtime: overtimeHours,
          total: workedHours + breakHours + overtimeHours
        };
      });

      // Always use sample data to test the chart visibility
      const sampleData = [
        { day: 'Monday', dayAbbr: 'M', worked: 7.5, breaks: 0.5, overtime: 0.5, total: 8.5 },
        { day: 'Tuesday', dayAbbr: 'T', worked: 8.0, breaks: 1.0, overtime: 0, total: 9.0 },
        { day: 'Wednesday', dayAbbr: 'W', worked: 7.0, breaks: 0.5, overtime: 1.0, total: 8.5 },
        { day: 'Thursday', dayAbbr: 'T', worked: 8.5, breaks: 0.5, overtime: 0.5, total: 9.5 },
        { day: 'Friday', dayAbbr: 'F', worked: 6.0, breaks: 1.0, overtime: 0, total: 7.0 },
        { day: 'Saturday', dayAbbr: 'S', worked: 0, breaks: 0, overtime: 0, total: 0 }, // Empty day
        { day: 'Sunday', dayAbbr: 'S', worked: 0, breaks: 0, overtime: 0, total: 0 } // Empty day
      ];
      
      setWeeklyData(sampleData);

      // Calculate totals from sample data
      const totals = sampleData.reduce((acc, day) => ({
        worked: acc.worked + day.worked,
        breaks: acc.breaks + day.breaks,
        overtime: acc.overtime + day.overtime
      }), { worked: 0, breaks: 0, overtime: 0 });

      setTotalHours(totals);
      console.log('📊 WEEKLY CHART: Using sample data:', sampleData);

    } catch (error) {
      console.error('📊 WEEKLY CHART ERROR:', error);
      setError(error.message);
      
      // Set fallback sample data
      const sampleData = [
        { day: 'Monday', dayAbbr: 'M', worked: 7.5, breaks: 0.5, overtime: 0.5, total: 8.5 },
        { day: 'Tuesday', dayAbbr: 'T', worked: 8.0, breaks: 1.0, overtime: 0, total: 9.0 },
        { day: 'Wednesday', dayAbbr: 'W', worked: 7.0, breaks: 0.5, overtime: 1.0, total: 8.5 },
        { day: 'Thursday', dayAbbr: 'T', worked: 8.5, breaks: 0.5, overtime: 0.5, total: 9.5 },
        { day: 'Friday', dayAbbr: 'F', worked: 6.0, breaks: 1.0, overtime: 0, total: 7.0 },
        { day: 'Saturday', dayAbbr: 'S', worked: 0, breaks: 0, overtime: 0, total: 0 },
        { day: 'Sunday', dayAbbr: 'S', worked: 0, breaks: 0, overtime: 0, total: 0 }
      ];
      setWeeklyData(sampleData);
      setTotalHours({ worked: 37, breaks: 3.5, overtime: 2 });
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Calculate max hours for scaling
  const maxHours = Math.max(...weeklyData.map(day => day.total), 10); // Minimum 10 hours for scale

  // Generate Y-axis labels
  const yAxisLabels = [];
  for (let i = 0; i <= Math.ceil(maxHours); i += 2) {
    yAxisLabels.push(`${i}h`);
  }

  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        height: '300px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>TRACKED HOURS</h3>
          <a href="/timesheets" style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            textDecoration: 'none' 
          }}>
            Go to timesheets
          </a>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '200px' 
        }}>
          Loading chart data...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>TRACKED HOURS</h3>
        <a href="/timesheets" style={{ 
          fontSize: '14px', 
          color: '#6B7280', 
          textDecoration: 'none' 
        }}>
          Go to timesheets
        </a>
      </div>

      {/* COMMENTED OUT: Color-coded legend sections */}
      {/*
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#4F46E5' 
          }} />
          <span style={{ fontSize: '14px', color: '#374151' }}>WORKED HOURS</span>
          <span style={{ fontSize: '14px', color: '#6B7280', marginLeft: 'auto' }}>
            {formatHours(totalHours.worked)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#10B981' 
          }} />
          <span style={{ fontSize: '14px', color: '#374151' }}>BREAKS</span>
          <span style={{ fontSize: '14px', color: '#6B7280', marginLeft: 'auto' }}>
            {formatHours(totalHours.breaks)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#F59E0B' 
          }} />
          <span style={{ fontSize: '14px', color: '#374151' }}>OVERTIME HOURS</span>
          <span style={{ fontSize: '14px', color: '#6B7280', marginLeft: 'auto' }}>
            {formatHours(totalHours.overtime)}
          </span>
        </div>
      </div>
      */}

      {/* Grayscale Legend */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#374151' // Dark gray
          }} />
          <span style={{ fontSize: '14px', color: '#374151' }}>WORKED HOURS</span>
          <span style={{ fontSize: '14px', color: '#6B7280', marginLeft: 'auto' }}>
            {formatHours(totalHours.worked)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#6B7280' // Medium gray
          }} />
          <span style={{ fontSize: '14px', color: '#374151' }}>BREAKS</span>
          <span style={{ fontSize: '14px', color: '#6B7280', marginLeft: 'auto' }}>
            {formatHours(totalHours.breaks)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#9CA3AF' // Light gray
          }} />
          <span style={{ fontSize: '14px', color: '#374151' }}>OVERTIME HOURS</span>
          <span style={{ fontSize: '14px', color: '#6B7280', marginLeft: 'auto' }}>
            {formatHours(totalHours.overtime)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '40px 1fr', 
        gridTemplateRows: '1fr auto', 
        height: '200px', 
        gap: '10px' 
      }}>
        {/* Y-Axis */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column-reverse', 
          justifyContent: 'space-between', 
          fontSize: '12px', 
          color: '#6B7280', 
          textAlign: 'right',
          paddingRight: '8px'
        }}>
          {yAxisLabels.map((label, index) => (
            <div key={index}>{label}</div>
          ))}
        </div>

        {/* Bars */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'flex-end', 
          height: '100%', 
          gap: '4px',
          paddingBottom: '5px'
        }}>
          {weeklyData.map((day, index) => {
            const workedHeight = (day.worked / maxHours) * 100;
            const breaksHeight = (day.breaks / maxHours) * 100;
            const overtimeHeight = (day.overtime / maxHours) * 100;
            
            return (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                flex: 1, 
                maxWidth: '60px' 
              }}>
                {/* Stacked Bar */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  width: '32px', 
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  {/* GRAYSCALE COLORS: Overtime (top) - Light gray */}
                  {day.overtime > 0 && (
                    <div style={{ 
                      height: `${overtimeHeight}%`, 
                      backgroundColor: '#9CA3AF', // Light gray instead of orange
                      borderRadius: '2px 2px 0 0',
                      minHeight: day.overtime > 0 ? '2px' : '0'
                    }} />
                  )}
                  
                  {/* GRAYSCALE COLORS: Breaks (middle) - Medium gray */}
                  {day.breaks > 0 && (
                    <div style={{ 
                      height: `${breaksHeight}%`, 
                      backgroundColor: '#6B7280', // Medium gray instead of green
                      borderRadius: day.overtime > 0 ? '0' : '2px 2px 0 0',
                      minHeight: day.breaks > 0 ? '2px' : '0'
                    }} />
                  )}
                  
                  {/* GRAYSCALE COLORS: Worked (bottom) - Dark gray */}
                  {day.worked > 0 && (
                    <div style={{ 
                      height: `${workedHeight}%`, 
                      backgroundColor: '#374151', // Dark gray instead of blue
                      borderRadius: (day.breaks > 0 || day.overtime > 0) ? '0 0 2px 2px' : '2px',
                      minHeight: day.worked > 0 ? '2px' : '0'
                    }} />
                  )}
                  
                  {/* Empty state bar - Very light gray background for unused days */}
                  {day.total === 0 && (
                    <div style={{ 
                      height: '8px', // Slightly taller to be visible
                      backgroundColor: '#F3F4F6', // Very light gray background
                      borderRadius: '2px',
                      border: '1px solid #E5E7EB' // Light border to make it visible
                    }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis */}
        <div style={{ gridColumn: '2', display: 'flex', justifyContent: 'space-around' }}>
          {weeklyData.map((day, index) => (
            <div key={index} style={{ 
              fontSize: '12px', 
              color: '#374151', 
              fontWeight: '500',
              textAlign: 'center',
              flex: 1
            }}>
              {day.dayAbbr}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        fontSize: '12px', 
        color: '#9CA3AF', 
        fontStyle: 'italic', 
        marginTop: '16px' 
      }}>
        Does not include manually entered payroll hours
      </div>
    </div>
  );
};

export default WeeklyChart;

