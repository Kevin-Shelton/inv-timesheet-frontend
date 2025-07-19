import React, { useState, useEffect } from 'react';
import { supabase } from "../../supabaseClient.js";
import OvertimeCalculationEngine from '../../utils/overtime_calculation_engine.js';

const DailyTimesheetView = ({ 
  selectedDate, 
  onCreateEntry, 
  onEditEntry,
  searchTerm = '',
  filters = {}
}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [timesheetData, setTimesheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [calculationDetails, setCalculationDetails] = useState({});
  const [employeeTypes, setEmployeeTypes] = useState({});

  // Get week dates
  const getWeekDates = (weekStart) => {
    const dates = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedDate);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
        setCurrentUser({ 
          id: 'default-user',
          full_name: 'Kevin Shelton',
          email: 'kevin@example.com'
        });
      }
    };

    loadUserData();
  }, []);

  // Load timesheet data with enhanced overtime calculation
  useEffect(() => {
    const loadTimesheetData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const startDate = weekDates[0];
        const endDate = weekDates[6];
        
        console.log('📊 DAILY VIEW: Loading timesheet data for week:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);

        // Get employee information
        const empInfo = await OvertimeCalculationEngine.getEmployeeInfo(currentUser.id);
        setEmployeeTypes({ [currentUser.id]: empInfo });

        // Fetch timesheet entries with enhanced data
        const { data: entries, error } = await supabase
          .from('timesheet_entries')
          .select(`
            id,
            date,
            time_in,
            time_out,
            break_duration,
            regular_hours,
            overtime_hours,
            daily_double_overtime,
            total_hours,
            calculation_method,
            weekly_hours_at_calculation,
            is_manual_override,
            override_reason,
            user_id,
            users!timesheet_entries_user_id_fkey(full_name, employment_type, is_exempt)
          `)
          .eq('user_id', currentUser.id)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) {
          throw error;
        }

        // Process entries with overtime calculation
        const processedData = await processTimesheetEntries(entries || [], empInfo);
        setTimesheetData(processedData.entries);
        setCalculationDetails(processedData.details);

      } catch (error) {
        console.error('Error loading timesheet data:', error);
        setTimesheetData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimesheetData();
  }, [currentUser, selectedDate]);

  const processTimesheetEntries = async (entries, employeeInfo) => {
    const processedEntries = [];
    const details = {};

    for (const entry of entries) {
      let regular = 0;
      let overtime = 0;
      let dailyDoubleOvertime = 0;
      let calculationMethod = 'unknown';
      let isRecalculated = false;

      // Use existing calculated values if available and not manual override
      if (entry.regular_hours !== null && entry.overtime_hours !== null && !entry.is_manual_override) {
        regular = parseFloat(entry.regular_hours) || 0;
        overtime = parseFloat(entry.overtime_hours) || 0;
        dailyDoubleOvertime = parseFloat(entry.daily_double_overtime) || 0;
        calculationMethod = entry.calculation_method || 'existing';
      } else {
        // Recalculate using the overtime engine
        try {
          const calculationResult = await OvertimeCalculationEngine.calculateOvertimeEntry(
            entry.user_id,
            entry.date,
            entry.time_in,
            entry.time_out,
            parseFloat(entry.break_duration) || 0,
            entry.is_manual_override
          );

          regular = calculationResult.regular;
          overtime = calculationResult.overtime;
          dailyDoubleOvertime = calculationResult.dailyDoubleOvertime;
          calculationMethod = calculationResult.calculationMethod;
          isRecalculated = true;

          console.log(`🧮 RECALCULATED ${entry.date}:`, calculationResult);
        } catch (calcError) {
          console.error('❌ CALCULATION ERROR:', calcError);
          // Fall back to existing values or total hours
          regular = parseFloat(entry.total_hours) || 0;
          overtime = 0;
          dailyDoubleOvertime = 0;
          calculationMethod = 'fallback';
        }
      }

      const totalCalculated = regular + overtime + dailyDoubleOvertime;

      const processedEntry = {
        id: entry.id,
        date: entry.date,
        employee: entry.users?.full_name || 'Unknown Employee',
        employmentType: entry.users?.employment_type || 'full_time',
        isExempt: entry.users?.is_exempt || false,
        firstIn: entry.time_in || entry.created_at,
        lastOut: entry.time_out || entry.updated_at,
        regular: regular,
        overtime: overtime,
        dailyDoubleOvertime: dailyDoubleOvertime,
        tracked: totalCalculated,
        originalTotal: parseFloat(entry.total_hours) || 0,
        breakDuration: parseFloat(entry.break_duration) || 0,
        calculationMethod: calculationMethod,
        isManualOverride: entry.is_manual_override,
        overrideReason: entry.override_reason,
        weeklyHoursAtCalculation: entry.weekly_hours_at_calculation,
        isRecalculated: isRecalculated
      };

      processedEntries.push(processedEntry);

      // Store calculation details
      details[entry.id] = {
        employmentType: employeeInfo.employmentType,
        isExempt: employeeInfo.isExempt,
        calculationMethod: calculationMethod,
        breakdown: {
          regular: regular,
          overtime: overtime,
          dailyDoubleOvertime: dailyDoubleOvertime,
          total: totalCalculated
        },
        isManualOverride: entry.is_manual_override,
        overrideReason: entry.override_reason,
        weeklyContext: entry.weekly_hours_at_calculation
      };
    }

    return { entries: processedEntries, details };
  };

  // Get hours for a specific date
  const getHoursForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = timesheetData.filter(entry => 
      entry.date === dateStr
    );
    
    if (dayEntries.length === 0) return null;
    
    const totalHours = dayEntries.reduce((sum, entry) => {
      return sum + (entry.tracked || 0);
    }, 0);
    
    return totalHours > 0 ? totalHours.toFixed(1) : null;
  };

  // Get overtime hours for a specific date
  const getOvertimeForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = timesheetData.filter(entry => 
      entry.date === dateStr
    );
    
    if (dayEntries.length === 0) return 0;
    
    const overtimeHours = dayEntries.reduce((sum, entry) => {
      return sum + (entry.overtime || 0) + (entry.dailyDoubleOvertime || 0);
    }, 0);
    
    return overtimeHours;
  };

  // Get total hours for the week
  const getWeeklyTotal = () => {
    const total = weekDates.reduce((sum, date) => {
      const hours = getHoursForDate(date);
      return sum + (hours ? parseFloat(hours) : 0);
    }, 0);
    
    return total > 0 ? total.toFixed(1) : '0.0';
  };

  // Get total overtime for the week
  const getWeeklyOvertime = () => {
    const total = weekDates.reduce((sum, date) => {
      const overtime = getOvertimeForDate(date);
      return sum + overtime;
    }, 0);
    
    return total > 0 ? total.toFixed(1) : '0.0';
  };

  // Handle cell click for creating new entry
  const handleCellClick = (date, event) => {
    if (event.target.closest('.plus-icon')) {
      if (onCreateEntry) {
        onCreateEntry({
          date: date.toISOString().split('T')[0],
          userId: currentUser?.id
        });
      }
    }
  };

  // Handle entry edit
  const handleEntryEdit = (entry) => {
    if (onEditEntry) {
      onEditEntry(entry);
    }
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return 'K';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Format hours for display
  const formatHours = (hours) => {
    if (!hours || hours === 0) return '--';
    return parseFloat(hours).toFixed(2);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '--';
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return '--';
    }
  };

  // Get employee type badge
  const getEmployeeTypeBadge = (employmentType, isExempt) => {
    const type = employmentType?.replace('_', ' ').toUpperCase() || 'FULL TIME';
    const exemptText = isExempt ? ' (EXEMPT)' : '';
    return `${type}${exemptText}`;
  };

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#F9FAFB'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #FB923C', 
            borderTop: '4px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading enhanced timesheet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Full Width Container */}
      <div style={{
        width: '100%',
        maxWidth: 'none',
        margin: '0',
        padding: '0'
      }}>
        
        {/* Search Section */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '16px 24px',
          borderBottom: '1px solid #E5E7EB',
          width: '100%'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '400px'
          }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              readOnly
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF',
                color: '#374151'
              }}
            />
          </div>
        </div>

        {/* Employee Info Section */}
        {currentUser && employeeTypes[currentUser.id] && (
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6B7280'
            }}>
              Employee Type:
            </span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: employeeTypes[currentUser.id].isExempt ? '#FEF3C7' : '#DBEAFE',
              color: employeeTypes[currentUser.id].isExempt ? '#92400E' : '#1E40AF',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {getEmployeeTypeBadge(employeeTypes[currentUser.id].employmentType, employeeTypes[currentUser.id].isExempt)}
            </span>
            <span style={{
              fontSize: '12px',
              color: '#6B7280'
            }}>
              OT Calculation: {employeeTypes[currentUser.id].employmentType === 'part_time' ? 'Daily (8+ hours)' : 'Weekly (40+ hours)'}
            </span>
          </div>
        )}

        {/* Timesheet Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1000px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                {/* Empty header cell for name column */}
                <th style={{
                  width: '200px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  {/* Empty for name column */}
                </th>
                
                {/* Day headers */}
                {weekDates.map((date, index) => (
                  <th key={index} style={{
                    width: '100px',
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: '500',
                    fontSize: '13px',
                    color: '#6B7280',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: isToday(date) ? '#FB923C' : '#6B7280',
                        fontWeight: isToday(date) ? '600' : '400'
                      }}>
                        {dayLabels[index]}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isToday(date) ? '#FB923C' : '#111827'
                      }}>
                        {date.getDate()}
                      </div>
                    </div>
                  </th>
                ))}
                
                {/* Total header */}
                <th style={{
                  width: '100px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>TOTAL</div>
                  </div>
                </th>

                {/* Overtime header */}
                <th style={{
                  width: '100px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>OVERTIME</div>
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody>
              <tr style={{
                borderBottom: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF'
              }}>
                {/* User Name Cell */}
                <td style={{
                  padding: '16px',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#FB923C',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                      {getUserInitials(currentUser?.full_name)}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#111827',
                      fontWeight: '500'
                    }}>
                      {currentUser?.full_name || 'Kevin Shelton'}
                    </div>
                  </div>
                </td>
                
                {/* Daily Hours Cells */}
                {weekDates.map((date, index) => {
                  const hours = getHoursForDate(date);
                  const overtime = getOvertimeForDate(date);
                  const cellKey = `${date.toISOString().split('T')[0]}`;
                  const isHovered = hoveredCell === cellKey;
                  
                  return (
                    <td 
                      key={index} 
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        borderBottom: '1px solid #E5E7EB',
                        position: 'relative',
                        cursor: 'pointer',
                        backgroundColor: isHovered ? '#FEF3C7' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredCell(cellKey)}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={(e) => handleCellClick(date, e)}
                    >
                      {hours ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <div style={{
                            fontSize: '14px',
                            color: '#111827',
                            fontWeight: '500'
                          }}>
                            {hours}h
                          </div>
                          {overtime > 0 && (
                            <div style={{
                              fontSize: '10px',
                              color: '#DC2626',
                              fontWeight: '600',
                              backgroundColor: '#FEE2E2',
                              padding: '1px 4px',
                              borderRadius: '2px'
                            }}>
                              OT: {overtime.toFixed(1)}h
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '14px',
                          color: '#9CA3AF'
                        }}>
                          -
                        </div>
                      )}
                      
                      {/* Plus Icon on Hover */}
                      {isHovered && (
                        <div 
                          className="plus-icon"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#FB923C',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          +
                        </div>
                      )}
                    </td>
                  );
                })}
                
                {/* Total Cell */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {getWeeklyTotal()}h
                  </div>
                </td>

                {/* Overtime Total Cell */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontWeight: '600',
                  color: '#DC2626'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {getWeeklyOvertime()}h
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detailed Entries Table */}
        {timesheetData.length > 0 && (
          <div style={{
            backgroundColor: '#FFFFFF',
            margin: '16px 24px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB'
            }}>
              <h4 style={{
                margin: '0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Detailed Timesheet Entries
              </h4>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>DATE</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>TIME IN</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>TIME OUT</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>REGULAR</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>OVERTIME</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>DAILY 2X</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>TOTAL</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>METHOD</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheetData.map((entry) => (
                    <tr 
                      key={entry.id} 
                      style={{ 
                        borderBottom: '1px solid #E5E7EB',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleEntryEdit(entry)}
                      onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                        {formatTime(entry.firstIn)}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                        {formatTime(entry.lastOut)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#111827' }}>
                        {formatHours(entry.regular)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: entry.overtime > 0 ? '#DC2626' : '#6B7280' }}>
                        {formatHours(entry.overtime)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: entry.dailyDoubleOvertime > 0 ? '#DC2626' : '#6B7280' }}>
                        {formatHours(entry.dailyDoubleOvertime)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                        {formatHours(entry.tracked)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                          {entry.isManualOverride ? (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              MANUAL
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              backgroundColor: '#DBEAFE',
                              color: '#1E40AF',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              AUTO
                            </span>
                          )}
                          {entry.isRecalculated && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              backgroundColor: '#D1FAE5',
                              color: '#065F46',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              CALC
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {timesheetData.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: '#FFFFFF'
          }}>
            <p style={{
              color: '#6B7280',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              No timesheet data for this week
            </p>
            <button 
              onClick={() => onCreateEntry && onCreateEntry({
                date: new Date().toISOString().split('T')[0],
                userId: currentUser?.id
              })}
              style={{
                backgroundColor: '#374151',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              + Add Time Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTimesheetView;

