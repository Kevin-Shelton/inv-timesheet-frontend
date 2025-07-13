import React, { useState, useEffect } from 'react';
import enhancedSupabaseApi from '../../lib/Enhanced_Supabase_API';

const DailyTimesheetView = ({ userId, selectedDate, onDateChange, onCreateEntry }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await enhancedSupabaseApi.getCurrentUser();
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

  // Load daily data
  useEffect(() => {
    const loadDailyData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const data = await enhancedSupabaseApi.getDailyTimesheet(currentUser.id, selectedDate);
        setDailyData(data);
      } catch (error) {
        console.error('Error loading daily data:', error);
        setDailyData({
          summary: { total_hours: 0, regular_hours: 0, overtime_hours: 0 },
          entries: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadDailyData();
  }, [currentUser, selectedDate]);

  // Get user initials for avatar
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
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Full Width Container */}
      <div style={{
        width: '100%',
        maxWidth: 'none',
        margin: '0',
        padding: '0',
        overflowX: 'auto'
      }}>
        
        {/* Daily Timesheet Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          width: '100%'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1000px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                {/* Search Column Header */}
                <th style={{
                  width: '300px',
                  padding: '16px',
                  textAlign: 'left',
                  borderBottom: '1px solid #E5E7EB',
                  verticalAlign: 'middle'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%'
                  }}>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#374151',
                        outline: 'none'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9CA3AF',
                      fontSize: '16px'
                    }}>
                      🔍
                    </div>
                  </div>
                </th>
                
                {/* First In Header */}
                <th style={{
                  width: '120px',
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '12px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  FIRST IN
                </th>
                
                {/* Last Out Header */}
                <th style={{
                  width: '120px',
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '12px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  LAST OUT
                </th>
                
                {/* Regular Header */}
                <th style={{
                  width: '100px',
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '12px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  REGULAR
                </th>
                
                {/* Overtime Header */}
                <th style={{
                  width: '100px',
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '12px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  OVERTIME
                </th>
                
                {/* Daily Double Overtime Header */}
                <th style={{
                  width: '140px',
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '12px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  DAILY DOUBLE<br />OVERTIME
                </th>
                
                {/* Tracked Header */}
                <th style={{
                  width: '100px',
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '12px',
                  color: '#6B7280',
                  borderBottom: '1px solid #E5E7EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  TRACKED
                </th>
              </tr>
            </thead>
            
            <tbody>
              <tr style={{
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB'
              }}>
                {/* Employee Name Cell */}
                <td style={{
                  padding: '20px 16px',
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
                      backgroundColor: '#9CA3AF',
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
                  padding: '20px 16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  -
                </td>
                
                {/* Last Out Cell */}
                <td style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  -
                </td>
                
                {/* Regular Hours Cell */}
                <td style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  -
                </td>
                
                {/* Overtime Hours Cell */}
                <td style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  -
                </td>
                
                {/* Daily Double Overtime Cell */}
                <td style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  -
                </td>
                
                {/* Tracked Hours Cell */}
                <td style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '14px',
                  color: '#111827'
                }}>
                  -
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Empty State Message */}
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E5E7EB'
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
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            + Add Time Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyTimesheetView;

