import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { supabaseApi } from "../../supabaseClient.js";

const MonthlyTimesheetView = ({ 
  userId, 
  selectedMonth, 
  onMonthChange, 
  onDayClick, 
  onCreateEntry,
  searchQuery = '',
  filters = {}
}) => {
  const [monthlyData, setMonthlyData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

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

  // Load monthly data
  useEffect(() => {
    const loadMonthlyData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        console.log('📊 MONTHLY VIEW: Loading timesheet data for month:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);

        // Use supabaseApi for consistent data fetching
        const entries = await supabaseApi.getTimesheets({
          userId: currentUser.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
        
        // Group entries by date
        const groupedData = {};
        (entries || []).forEach(entry => {
          const date = entry.date;
          if (!groupedData[date]) {
            groupedData[date] = {
              total_hours: 0,
              regular_hours: 0,
              overtime_hours: 0,
              entries: []
            };
          }
          // Use correct column names
          const regularHours = entry.hours_worked || entry.regular_hours || 0;
          const overtimeHours = entry.overtime_hours || 0;
          
          groupedData[date].total_hours += regularHours + overtimeHours;
          groupedData[date].regular_hours += regularHours;
          groupedData[date].overtime_hours += overtimeHours;
          groupedData[date].entries.push(entry);
        });
        
        setMonthlyData(groupedData);
      } catch (error) {
        console.error('Error loading monthly data:', error);
        setMonthlyData({});
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && selectedMonth) {
      loadMonthlyData();
    }
  }, [currentUser, selectedMonth]);

  // Navigate months
  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(selectedMonth.getMonth() + (direction === 'next' ? 1 : -1));
    onMonthChange(newMonth);
  };

  // Get calendar days for the month
  const getCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 6 weeks (42 days) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === selectedMonth.getMonth() && 
           date.getFullYear() === selectedMonth.getFullYear();
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get hours for a specific date
  const getHoursForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return monthlyData[dateStr]?.total_hours || 0;
  };

  // Handle day click
  const handleDayClick = (date) => {
    if (isCurrentMonth(date)) {
      if (onDayClick) {
        onDayClick(date);
      }
    }
  };

  // Handle create entry for specific day
  const handleCreateEntry = (date, event) => {
    event.stopPropagation();
    if (onCreateEntry) {
      onCreateEntry({
        date: date.toISOString().split('T')[0],
        userId: currentUser?.id
      });
    }
  };

  // Format month/year for display
  const formatMonthYear = () => {
    return selectedMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Get total hours for the month
  const getMonthlyTotal = () => {
    return Object.values(monthlyData).reduce((sum, day) => sum + day.total_hours, 0).toFixed(1);
  };

  // Get working days count
  const getWorkingDaysCount = () => {
    return Object.keys(monthlyData).length;
  };

  // Get average hours per working day
  const getAverageHoursPerDay = () => {
    const workingDays = getWorkingDaysCount();
    if (workingDays === 0) return '0.0';
    return (parseFloat(getMonthlyTotal()) / workingDays).toFixed(1);
  };

  const calendarDays = getCalendarDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading monthly timesheet...</p>
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
        
        {/* Header Section */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          {/* Month Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <button
                onClick={() => navigateMonth('prev')}
                style={{
                  padding: '8px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px', color: '#6B7280' }} />
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#F3F4F6',
                borderRadius: '6px'
              }}>
                <Calendar style={{ width: '16px', height: '16px', color: '#6B7280' }} />
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {formatMonthYear()}
                </span>
              </div>
              
              <button
                onClick={() => navigateMonth('next')}
                style={{
                  padding: '8px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight style={{ width: '16px', height: '16px', color: '#6B7280' }} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#6B7280'
              }}>
                Total: <span style={{ fontWeight: '600', color: '#111827' }}>{getMonthlyTotal()}h</span>
              </div>
              
              <button
                onClick={() => onCreateEntry && onCreateEntry({ 
                  date: new Date().toISOString().split('T')[0], 
                  userId: currentUser?.id 
                })}
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
                <Plus style={{ width: '16px', height: '16px' }} />
                Add Time Entry
              </button>
            </div>
          </div>

          {/* User Info */}
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FB923C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {currentUser.full_name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 2px 0'
                }}>
                  {currentUser.full_name || currentUser.email || 'User'}
                </h2>
                <p style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  margin: '0'
                }}>
                  Monthly Timesheet
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        <div style={{
          backgroundColor: '#FFFFFF',
          margin: '24px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          {/* Day Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            backgroundColor: '#F3F4F6',
            borderBottom: '1px solid #E5E7EB'
          }}>
            {dayNames.map(day => (
              <div 
                key={day}
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)'
          }}>
            {calendarDays.map((date, index) => {
              const hours = getHoursForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDay = isToday(date);
              const dayKey = date.toISOString().split('T')[0];
              const isHovered = hoveredDay === dayKey;
              
              return (
                <div
                  key={index}
                  style={{
                    minHeight: '80px',
                    padding: '8px',
                    border: '1px solid #F3F4F6',
                    backgroundColor: isHovered ? '#FEF3C7' : 
                                   isTodayDay ? '#FFF7ED' : 
                                   isCurrentMonthDay ? '#FFFFFF' : '#F9FAFB',
                    cursor: isCurrentMonthDay ? 'pointer' : 'default',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={() => isCurrentMonthDay && setHoveredDay(dayKey)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => handleDayClick(date)}
                >
                  {/* Date Number */}
                  <div style={{
                    fontSize: '14px',
                    fontWeight: isTodayDay ? '600' : '500',
                    color: isTodayDay ? '#FB923C' : 
                           isCurrentMonthDay ? '#111827' : '#9CA3AF',
                    textAlign: 'right'
                  }}>
                    {date.getDate()}
                  </div>

                  {/* Hours Display */}
                  {isCurrentMonthDay && hours > 0 && (
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#FB923C',
                      textAlign: 'center',
                      backgroundColor: '#FFF7ED',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      alignSelf: 'center'
                    }}>
                      {hours.toFixed(1)}h
                    </div>
                  )}

                  {/* Plus Icon on Hover */}
                  {isCurrentMonthDay && isHovered && (
                    <div 
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
                      onClick={(e) => handleCreateEntry(date, e)}
                    >
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Summary */}
        <div style={{
          backgroundColor: '#FFFFFF',
          margin: '0 24px 24px 24px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          padding: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 16px 0'
          }}>
            Monthly Summary
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '4px'
              }}>
                {getMonthlyTotal()}h
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total Hours
              </div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '4px'
              }}>
                {getWorkingDaysCount()}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Days Worked
              </div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '4px'
              }}>
                {getAverageHoursPerDay()}h
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Avg Per Day
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTimesheetView;

