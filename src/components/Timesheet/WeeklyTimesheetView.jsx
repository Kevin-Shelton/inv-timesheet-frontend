import React, { useState, useEffect } from 'react';
import { supabase } from "../../supabaseClient.js";

const WeeklyTimesheetView = ({ 
  selectedWeek, 
  onCreateEntry, 
  onEditEntry,
  searchTerm = '',
  filters = {}
}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [timesheetData, setTimesheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

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

  const weekDates = getWeekDates(selectedWeek);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

  // Load timesheet data
  useEffect(() => {
    const loadTimesheetData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const startDate = weekDates[0];
        const endDate = weekDates[6];
        
        const entries = await enhancedSupabaseApi.getTimesheetEntries({
          userId: currentUser.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
        
        setTimesheetData(entries || []);
      } catch (error) {
        console.error('Error loading timesheet data:', error);
        setTimesheetData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimesheetData();
  }, [currentUser, selectedWeek]);

  // Get hours for a specific date
  const getHoursForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = timesheetData.filter(entry => 
      entry.date === dateStr
    );
    
    if (dayEntries.length === 0) return null;
    
    const totalHours = dayEntries.reduce((sum, entry) => {
      return sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0);
    }, 0);
    
    return totalHours > 0 ? totalHours.toFixed(1) : null;
  };

  // Get total hours for the week
  const getWeeklyTotal = () => {
    const total = weekDates.reduce((sum, date) => {
      const hours = getHoursForDate(date);
      return sum + (hours ? parseFloat(hours) : 0);
    }, 0);
    
    return total > 0 ? total.toFixed(1) : '0.0';
  };

  // Handle cell click for creating new entry
  const handleCellClick = (date, event) => {
    if (event.target.closest('.plus-icon')) {
      // Plus icon was clicked
      if (onCreateEntry) {
        onCreateEntry({
          date: date.toISOString().split('T')[0],
          userId: currentUser?.id
        });
      }
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
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading timesheet data...</p>
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
                          fontSize: '14px',
                          color: '#111827',
                          fontWeight: '500'
                        }}>
                          {hours}h
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
              </tr>
            </tbody>
          </table>
        </div>

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
              No timesheet data for Sat, Jul 12
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

export default WeeklyTimesheetView;

