import React, { useState, useEffect } from 'react';
import { supabaseApi } from "../../supabaseClient.js";

const DailyTimesheetView = ({ 
  userId,
  selectedDate, 
  onDateChange,
  onCreateEntry, 
  onEditEntry,
  searchQuery = '',
  filters = {}
}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [timesheetData, setTimesheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await supabaseApi.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          console.error('No authenticated user found');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setCurrentUser(null);
      }
    };

    loadUserData();
  }, []);

  // Load timesheet data for the selected date
  useEffect(() => {
    const loadTimesheetData = async () => {
      if (!currentUser || !selectedDate) return;
      
      setLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        console.log('📊 DAILY VIEW: Loading timesheet data for date:', dateStr);

        // Use supabaseApi for consistent data fetching
        const entries = await supabaseApi.getTimesheets({
          userId: currentUser.id,
          startDate: dateStr,
          endDate: dateStr
        });
        
        // Process entries to match the expected format for daily view
        const processedEntries = (entries || []).map(entry => ({
          id: entry.id,
          date: entry.date,
          employee: currentUser.full_name || currentUser.email || 'User',
          firstIn: entry.clock_in_time || entry.created_at,
          lastOut: entry.clock_out_time || entry.updated_at,
          regular: entry.hours_worked || entry.regular_hours || 0,
          overtime: entry.overtime_hours || 0,
          tracked: (entry.hours_worked || entry.regular_hours || 0) + (entry.overtime_hours || 0),
          breakDuration: entry.break_duration || 0,
          isManualOverride: entry.is_manual_override || false,
          overrideReason: entry.override_reason || null
        }));
        
        setTimesheetData(processedEntries);
      } catch (error) {
        console.error('Error loading timesheet data:', error);
        setTimesheetData([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && selectedDate) {
      loadTimesheetData();
    }
  }, [currentUser, selectedDate]);

  // Handle entry edit
  const handleEntryEdit = (entry) => {
    if (onEditEntry) {
      onEditEntry(entry);
    }
  };

  // Handle create entry
  const handleCreateEntry = () => {
    if (onCreateEntry) {
      onCreateEntry({
        date: selectedDate.toISOString().split('T')[0],
        userId: currentUser?.id
      });
    }
  };

  // Format hours for display
  const formatHours = (hours) => {
    if (!hours || hours === 0) return '0.00';
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

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate totals
  const getTotalRegular = () => {
    return timesheetData.reduce((sum, entry) => sum + (entry.regular || 0), 0);
  };

  const getTotalOvertime = () => {
    return timesheetData.reduce((sum, entry) => sum + (entry.overtime || 0), 0);
  };

  const getTotalTracked = () => {
    return timesheetData.reduce((sum, entry) => sum + (entry.tracked || 0), 0);
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
      position: 'relative'
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
              value={searchQuery}
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

        {/* Date Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '16px 24px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            {currentUser && (
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: '0'
              }}>
                {currentUser.full_name || currentUser.email}
              </p>
            )}
          </div>
          
          <button
            onClick={handleCreateEntry}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#FB923C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            + Add Time Entry
          </button>
        </div>

        {/* Timesheet Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '800px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                <th style={{
                  width: '200px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Employee
                </th>
                <th style={{
                  width: '120px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  First In
                </th>
                <th style={{
                  width: '120px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Last Out
                </th>
                <th style={{
                  width: '100px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Regular
                </th>
                <th style={{
                  width: '100px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Overtime
                </th>
                <th style={{
                  width: '100px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Tracked
                </th>
              </tr>
            </thead>
            
            <tbody>
              {timesheetData.length > 0 ? (
                timesheetData.map((entry, index) => (
                  <tr 
                    key={entry.id || index}
                    style={{
                      borderBottom: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleEntryEdit(entry)}
                    onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = '#FFFFFF'}
                  >
                    {/* Employee Cell */}
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
                          {getUserInitials(entry.employee)}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#111827',
                          fontWeight: '500'
                        }}>
                          {entry.employee}
                        </div>
                      </div>
                    </td>
                    
                    {/* First In */}
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#6B7280'
                    }}>
                      {formatTime(entry.firstIn)}
                    </td>
                    
                    {/* Last Out */}
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#6B7280'
                    }}>
                      {formatTime(entry.lastOut)}
                    </td>
                    
                    {/* Regular Hours */}
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#111827',
                      fontWeight: '500'
                    }}>
                      {formatHours(entry.regular)}
                    </td>
                    
                    {/* Overtime Hours */}
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: entry.overtime > 0 ? '#DC2626' : '#6B7280',
                      fontWeight: entry.overtime > 0 ? '500' : '400'
                    }}>
                      {formatHours(entry.overtime)}
                    </td>
                    
                    {/* Tracked Hours */}
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#111827',
                      fontWeight: '600'
                    }}>
                      {formatHours(entry.tracked)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="6" 
                    style={{
                      padding: '48px 24px',
                      textAlign: 'center',
                      color: '#6B7280',
                      fontSize: '14px'
                    }}
                  >
                    No timesheet entries for this date
                  </td>
                </tr>
              )}
              
              {/* Totals Row */}
              {timesheetData.length > 0 && (
                <tr style={{
                  backgroundColor: '#F9FAFB',
                  borderTop: '2px solid #E5E7EB'
                }}>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    TOTALS
                  </td>
                  <td style={{ padding: '16px' }}></td>
                  <td style={{ padding: '16px' }}></td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {formatHours(getTotalRegular())}
                  </td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: getTotalOvertime() > 0 ? '#DC2626' : '#111827'
                  }}>
                    {formatHours(getTotalOvertime())}
                  </td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {formatHours(getTotalTracked())}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Daily Summary */}
        {timesheetData.length > 0 && (
          <div style={{
            backgroundColor: '#FFFFFF',
            margin: '16px 24px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            padding: '16px'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827'
            }}>
              Daily Summary
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                backgroundColor: '#F9FAFB',
                borderRadius: '6px'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {formatHours(getTotalRegular())}h
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Regular
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '12px',
                backgroundColor: '#FEF2F2',
                borderRadius: '6px'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#DC2626',
                  marginBottom: '4px'
                }}>
                  {formatHours(getTotalOvertime())}h
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Overtime
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '12px',
                backgroundColor: '#F3F4F6',
                borderRadius: '6px'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {formatHours(getTotalTracked())}h
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTimesheetView;

