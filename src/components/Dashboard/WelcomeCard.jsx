import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const WelcomeCard = () => {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [weeklyStats, setWeeklyStats] = useState({
    userHours: 0,
    orgTotal: 0,
    activeUsers: 0,
    avgPerUser: 0,
    weekRange: ''
  });
  const [loading, setLoading] = useState(true);

  // Image rotation logic (preserved from original)
  useEffect(() => {
    const images = [
      '/assets/Team Work Tries to Get The Top position.png',
      '/assets/Woman works with computer.png'
    ];
    
    const sessionKey = 'welcomeCardImage';
    let savedImage = sessionStorage.getItem(sessionKey);
    
    if (!savedImage) {
      savedImage = images[Math.floor(Math.random() * images.length)];
      sessionStorage.setItem(sessionKey, savedImage);
    }
    
    setCurrentImage(savedImage);
  }, []);

  useEffect(() => {
    if (user) {
      fetchWeeklyStats();
    }
  }, [user]);

  const fetchWeeklyStats = async () => {
    try {
      setLoading(true);

      // FIXED: Get data from the most recent week with timesheet entries
      // instead of forcing current week
      const { data: recentData, error: recentError } = await supabaseApi.supabase
        .from('timesheet_entries')
        .select(`
          date,
          hours_worked,
          total_hours,
          regular_hours,
          status,
          user_id,
          users!timesheet_entries_user_id_fkey (
            id,
            full_name,
            role
          )
        `)
        .order('date', { ascending: false })
        .limit(200); // Get recent entries to find the latest week with data

      if (recentError) {
        console.error('Error fetching recent timesheet data:', recentError);
        return;
      }

      if (!recentData || recentData.length === 0) {
        setWeeklyStats({
          userHours: 0,
          orgTotal: 0,
          activeUsers: 0,
          avgPerUser: 0,
          weekRange: 'No data available'
        });
        return;
      }

      // Find the most recent week with data
      const latestDate = new Date(recentData[0].date);
      const weekStart = new Date(latestDate);
      weekStart.setDate(latestDate.getDate() - latestDate.getDay()); // Start of week (Sunday)
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

      // Filter data for the most recent week with entries
      const weekData = recentData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      // FIXED: Use COALESCE logic to get actual hours from any field
      const calculateHours = (entry) => {
        return entry.hours_worked || entry.total_hours || entry.regular_hours || 0;
      };

      // Calculate statistics
      const uniqueUsers = new Set();
      let totalOrgHours = 0;
      let approvedOrgHours = 0;
      let userPersonalHours = 0;

      weekData.forEach(entry => {
        const hours = calculateHours(entry);
        
        // Track unique users
        if (hours > 0) {
          uniqueUsers.add(entry.user_id);
        }

        // Total org hours (all statuses for admin view)
        totalOrgHours += hours;

        // Approved hours only
        if (entry.status === 'approved') {
          approvedOrgHours += hours;
        }

        // User's personal hours (if not admin viewing org-wide)
        if (entry.user_id === user?.id) {
          userPersonalHours += hours;
        }
      });

      const activeUsers = uniqueUsers.size;
      
      // FIXED: Admin sees org-wide totals, regular users see personal hours
      const displayUserHours = user?.role === 'admin' ? totalOrgHours : userPersonalHours;
      const avgPerUser = activeUsers > 0 ? totalOrgHours / activeUsers : 0;

      // Format week range
      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        });
      };

      const weekRange = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;

      setWeeklyStats({
        userHours: Math.round(displayUserHours * 10) / 10, // Round to 1 decimal
        orgTotal: Math.round(approvedOrgHours * 10) / 10,
        activeUsers,
        avgPerUser: Math.round(avgPerUser * 10) / 10,
        weekRange
      });

      console.log('📊 WELCOME CARD: Stats calculated', {
        weekRange,
        totalEntries: weekData.length,
        totalOrgHours,
        approvedOrgHours,
        activeUsers,
        displayUserHours,
        userRole: user?.role
      });

    } catch (error) {
      console.error('Error fetching weekly stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`;
  };

  if (!user) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Background Image */}
      {!imageError && currentImage && (
        <img
          src={currentImage}
          alt="Welcome background"
          onError={handleImageError}
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            width: '120px',
            height: '120px',
            objectFit: 'contain',
            opacity: 0.3,
            zIndex: 1
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '24px', 
            fontWeight: '600' 
          }}>
            Welcome back, {user.full_name || user.email}!
          </h2>
          
          {/* Weekly Statistics Summary */}
          {loading ? (
            <p style={{ margin: 0, opacity: 0.9 }}>Loading weekly statistics...</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                opacity: 0.9 
              }}>
                Week of {weeklyStats.weekRange}
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                marginTop: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    lineHeight: 1 
                  }}>
                    {formatHours(weeklyStats.userHours)}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    opacity: 0.8, 
                    marginTop: '4px' 
                  }}>
                    {user?.role === 'admin' ? 'Org Total' : 'Your Hours'}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    lineHeight: 1 
                  }}>
                    {formatHours(weeklyStats.orgTotal)}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    opacity: 0.8, 
                    marginTop: '4px' 
                  }}>
                    Approved
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    lineHeight: 1 
                  }}>
                    {weeklyStats.activeUsers}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    opacity: 0.8, 
                    marginTop: '4px' 
                  }}>
                    Active Users
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    lineHeight: 1 
                  }}>
                    {formatHours(weeklyStats.avgPerUser)}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    opacity: 0.8, 
                    marginTop: '4px' 
                  }}>
                    Avg per User
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onClick={() => {
              // Navigate to timesheet view
              console.log('Navigate to timesheet');
            }}
          >
            📊 View Timesheet
          </button>

          <button
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onClick={() => {
              // Quick clock in functionality
              console.log('Quick clock in');
            }}
          >
            ⏰ Quick Clock In
          </button>
        </div>

        {/* Auth Status */}
        <div style={{
          marginTop: '16px',
          fontSize: '12px',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#4ade80',
            display: 'inline-block'
          }}></span>
          Auth Status: authenticated | Client: {user.role || 'User'}
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;

