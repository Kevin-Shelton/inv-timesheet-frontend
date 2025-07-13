import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Plus } from 'lucide-react';
import enhancedSupabaseApi from '../../lib/Enhanced_Supabase_API';

const DailyTimesheetView = ({ userId, selectedDate, onDateChange, onCreateEntry }) => {
  const [dailyData, setDailyData] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load daily data
  useEffect(() => {
    loadDailyData();
  }, [userId, selectedDate]);

  const loadDailyData = async () => {
    setLoading(true);
    try {
      // Get user profile
      const user = await enhancedSupabaseApi.getCurrentUser();
      setUserProfile(user);
      
      // Get daily timesheet data
      const data = await enhancedSupabaseApi.getDailyTimesheet(userId, selectedDate);
      setDailyData(data);
      
      // Get time entries for the day
      const entries = await enhancedSupabaseApi.getTimesheetEntries({
        userId: userId,
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

  // Navigate dates
  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    const time = new Date(timeStr);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'submitted': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
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
        
        {/* Header Section */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          {/* Date Navigation */}
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
                onClick={() => navigateDate('prev')}
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
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  {formatDate(selectedDate)}
                </span>
              </div>
              
              <button
                onClick={() => navigateDate('next')}
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

            <button
              onClick={() => onCreateEntry && onCreateEntry({ date: selectedDate, userId })}
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

          {/* User Info */}
          {userProfile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FB923C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '18px'
              }}>
                {userProfile.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 4px 0'
                }}>
                  {userProfile.full_name || 'User'}
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: '0'
                }}>
                  {userProfile.email}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div style={{
          padding: '24px',
          backgroundColor: '#F9FAFB'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Total Hours Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Clock style={{ width: '16px', height: '16px', color: '#FB923C' }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Hours
                </span>
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                {dailyData?.summary?.total_hours?.toFixed(1) || '0.0'}h
              </div>
            </div>

            {/* Regular Hours Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <User style={{ width: '16px', height: '16px', color: '#10B981' }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Regular Hours
                </span>
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                {dailyData?.summary?.regular_hours?.toFixed(1) || '0.0'}h
              </div>
            </div>

            {/* Overtime Hours Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Clock style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Overtime Hours
                </span>
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                {dailyData?.summary?.overtime_hours?.toFixed(1) || '0.0'}h
              </div>
            </div>

            {/* Break Hours Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Clock style={{ width: '16px', height: '16px', color: '#8B5CF6' }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Break Hours
                </span>
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>
                {dailyData?.summary?.break_hours?.toFixed(1) || '0.0'}h
              </div>
            </div>
          </div>
        </div>

        {/* Time Entries Section */}
        <div style={{
          backgroundColor: '#FFFFFF',
          margin: '0 24px 24px 24px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              margin: '0'
            }}>
              Time Entries
            </h3>
          </div>

          <div style={{ padding: '0' }}>
            {timeEntries.length > 0 ? (
              timeEntries.map((entry, index) => (
                <div 
                  key={entry.id || index}
                  style={{
                    padding: '20px 24px',
                    borderBottom: index < timeEntries.length - 1 ? '1px solid #F3F4F6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(entry.status)
                    }}></div>
                    
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827',
                        marginBottom: '4px'
                      }}>
                        {formatTime(entry.time_in)} - {formatTime(entry.time_out)}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6B7280'
                      }}>
                        {entry.campaign_name || 'No campaign'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827'
                    }}>
                      {((entry.regular_hours || 0) + (entry.overtime_hours || 0)).toFixed(1)}h
                    </div>
                    
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: entry.status === 'approved' ? '#D1FAE5' : 
                                     entry.status === 'submitted' ? '#FEF3C7' : 
                                     entry.status === 'rejected' ? '#FEE2E2' : '#F3F4F6',
                      color: entry.status === 'approved' ? '#065F46' : 
                             entry.status === 'submitted' ? '#92400E' : 
                             entry.status === 'rejected' ? '#991B1B' : '#374151'
                    }}>
                      {entry.status || 'draft'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center'
              }}>
                <Clock style={{
                  width: '48px',
                  height: '48px',
                  color: '#D1D5DB',
                  margin: '0 auto 16px'
                }} />
                <p style={{
                  fontSize: '16px',
                  color: '#6B7280',
                  marginBottom: '16px'
                }}>
                  No time entries for {formatDate(selectedDate)}
                </p>
                <button
                  onClick={() => onCreateEntry && onCreateEntry({ date: selectedDate, userId })}
                  style={{
                    display: 'inline-flex',
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTimesheetView;

