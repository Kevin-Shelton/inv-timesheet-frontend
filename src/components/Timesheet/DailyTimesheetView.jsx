import React, { useState, useEffect } from 'react';
import enhancedSupabaseApi from '../../lib/Enhanced_Supabase_API';

const DailyTimesheetView = ({ userId, selectedDate, onDateChange, onCreateEntry, searchTerm = '' }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await enhancedSupabaseApi.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
        // Set default user if API fails
        setCurrentUser({ 
          id: 'default-user',
          full_name: 'Kevin Shelton',
          email: 'kevin@example.com'
        });
      }
    };

    loadUserData();
  }, []);

  // Load daily data
  useEffect(() => {
    const loadDailyData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Get daily timesheet data
        const data = await enhancedSupabaseApi.getDailyTimesheet(currentUser.id, selectedDate);
        setDailyData(data);
        
        // Get time entries for the day
        const entries = await enhancedSupabaseApi.getTimesheetEntries({
          userId: currentUser.id,
          startDate: selectedDate,
          endDate: selectedDate
        });
        setTimeEntries(entries || []);
        
      } catch (error) {
        console.error('Error loading daily data:', error);
        setDailyData({
          summary: { total_hours: 0, regular_hours: 0, overtime_hours: 0, break_hours: 0 },
          entries: []
        });
        setTimeEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadDailyData();
  }, [currentUser, selectedDate]);

  // Calculate daily summary from entries
  const calculateDailySummary = () => {
    if (!timeEntries || timeEntries.length === 0) {
      return {
        firstIn: null,
        lastOut: null,
        regularHours: 0,
        overtimeHours: 0,
        dailyDoubleOvertime: 0,
        trackedHours: 0
      };
    }

    const times = timeEntries.map(entry => ({
      timeIn: entry.time_in ? new Date(entry.time_in) : null,
      timeOut: entry.time_out ? new Date(entry.time_out) : null,
      regularHours: entry.regular_hours || 0,
      overtimeHours: entry.overtime_hours || 0
    })).filter(entry => entry.timeIn || entry.timeOut);

    const firstIn = times.reduce((earliest, entry) => {
      if (!entry.timeIn) return earliest;
      if (!earliest) return entry.timeIn;
      return entry.timeIn < earliest ? entry.timeIn : earliest;
    }, null);

    const lastOut = times.reduce((latest, entry) => {
      if (!entry.timeOut) return latest;
      if (!latest) return entry.timeOut;
      return entry.timeOut > latest ? entry.timeOut : latest;
    }, null);

    const regularHours = timeEntries.reduce((sum, entry) => sum + (entry.regular_hours || 0), 0);
    const overtimeHours = timeEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);
    const trackedHours = regularHours + overtimeHours;

    return {
      firstIn,
      lastOut,
      regularHours,
      overtimeHours,
      dailyDoubleOvertime: 0, // Calculate based on your business rules
      trackedHours
    };
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return '-';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Format hours for display
  const formatHours = (hours) => {
    if (!hours || hours === 0) return '-';
    return `${hours.toFixed(1)}h`;
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return 'K';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Handle row click for creating new entry
  const handleRowClick = () => {
    if (onCreateEntry) {
      onCreateEntry({
        date: selectedDate,
        userId: currentUser?.id
      });
    }
  };

  const summary = calculateDailySummary();

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
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading daily timesheet...</p>
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

        {/* Daily Timesheet Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '900px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                {/* Employee header */}
                <th style={{
                  width: '200px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  EMPLOYEE
                </th>
                
                {/* First In header */}
                <th style={{
                  width: '120px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  FIRST IN
                </th>
                
                {/* Last Out header */}
                <th style={{
                  width: '120px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  LAST OUT
                </th>
                
                {/* Regular header */}
                <th style={{
                  width: '100px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  REGULAR
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
                  OVERTIME
                </th>
                
                {/* Daily Double Overtime header */}
                <th style={{
                  width: '140px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  DAILY DOUBLE OVERTIME
                </th>
                
                {/* Tracked header */}
                <th style={{
                  width: '100px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  TRACKED
                </th>
              </tr>
            </thead>
            
            <tbody>
              <tr 
                style={{
                  borderBottom: '1px solid #E5E7EB',
                  backgroundColor: hoveredRow ? '#FEF3C7' : '#FFFFFF',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredRow(true)}
                onMouseLeave={() => setHoveredRow(false)}
                onClick={handleRowClick}
              >
                {/* Employee Name Cell */}
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
                
                {/* First In Cell */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  {formatTime(summary.firstIn)}
                </td>
                
                {/* Last Out Cell */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  {formatTime(summary.lastOut)}
                </td>
                
                {/* Regular Hours Cell */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  {formatHours(summary.regularHours)}
                </td>
                
                {/* Overtime Hours Cell */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  {formatHours(summary.overtimeHours)}
                </td>
                
                {/* Daily Double Overtime Cell */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  {formatHours(summary.dailyDoubleOvertime)}
                </td>
                
                {/* Tracked Hours Cell */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827',
                  fontWeight: '500'
                }}>
                  {formatHours(summary.trackedHours)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {timeEntries.length === 0 && (
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
              No timesheet data for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
            <button 
              onClick={() => onCreateEntry && onCreateEntry({
                date: selectedDate,
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

