import React, { useState, useEffect } from 'react';
import { supabase, supabaseApi } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth';

const WelcomeCard = () => {
  const { user, canViewAllTimesheets, isPrivilegedUser } = useAuth();
  const [currentImage, setCurrentImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orgStats, setOrgStats] = useState(null);
  const [personalStats, setPersonalStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    loadRandomImage();
    if (canViewOrgData()) {
      fetchOrganizationStats();
    }
    fetchPersonalStats();
  }, [user]);

  // Determine if user can see organization-wide data
  const canViewOrgData = () => {
    return canViewAllTimesheets() || isPrivilegedUser() || user?.role === 'admin';
  };

  const fetchUserData = async () => {
    try {
      // Get basic auth user data without additional database queries (preserved original logic)
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log('🔐 AUTH: Using fallback user data due to auth error:', error.message);
      } else if (authUser) {
        console.log('🔐 AUTH: Successfully loaded user from auth');
      } else {
        console.log('🔐 AUTH: No authenticated user, using fallback');
      }
    } catch (error) {
      console.error('🔐 AUTH ERROR:', error);
    }
  };

  // NEW: Fetch organization-wide statistics for admin users
  const fetchOrganizationStats = async () => {
    try {
      setStatsLoading(true);
      console.log('📊 WELCOME CARD: Fetching organization stats...');

      // Get current week dates
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = monday.toISOString().split('T')[0];
      const endDate = sunday.toISOString().split('T')[0];

      // Fetch all timesheet entries for the week
      const entries = await supabaseApi.getTimesheets({
        startDate: startDate,
        endDate: endDate
      });

      if (entries && entries.length > 0) {
        // Calculate organization-wide statistics
        const totalHours = entries.reduce((sum, entry) => {
          return sum + (parseFloat(entry.hours_worked) || parseFloat(entry.regular_hours) || 0);
        }, 0);

        const totalOvertime = entries.reduce((sum, entry) => {
          return sum + (parseFloat(entry.daily_overtime_hours) || parseFloat(entry.overtime_hours) || 0);
        }, 0);

        const uniqueUsers = new Set(entries.map(entry => entry.user_id)).size;
        const totalEntries = entries.length;

        setOrgStats({
          totalHours: Math.round(totalHours * 10) / 10,
          totalOvertime: Math.round(totalOvertime * 10) / 10,
          activeUsers: uniqueUsers,
          totalEntries: totalEntries,
          avgHoursPerUser: uniqueUsers > 0 ? Math.round((totalHours / uniqueUsers) * 10) / 10 : 0
        });

        console.log('📊 WELCOME CARD: Organization stats calculated:', {
          totalHours: Math.round(totalHours * 10) / 10,
          activeUsers: uniqueUsers,
          totalEntries: totalEntries
        });
      } else {
        setOrgStats({
          totalHours: 0,
          totalOvertime: 0,
          activeUsers: 0,
          totalEntries: 0,
          avgHoursPerUser: 0
        });
      }
    } catch (error) {
      console.error('📊 WELCOME CARD: Error fetching organization stats:', error);
      setOrgStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  // NEW: Fetch personal statistics
  const fetchPersonalStats = async () => {
    if (!user?.id) return;

    try {
      console.log('📊 WELCOME CARD: Fetching personal stats...');

      // Get current week dates
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = monday.toISOString().split('T')[0];
      const endDate = sunday.toISOString().split('T')[0];

      // Fetch user's personal timesheet entries for the week
      const entries = await supabaseApi.getTimesheets({
        user_id: user.id,
        startDate: startDate,
        endDate: endDate
      });

      if (entries && entries.length > 0) {
        const totalHours = entries.reduce((sum, entry) => {
          return sum + (parseFloat(entry.hours_worked) || parseFloat(entry.regular_hours) || 0);
        }, 0);

        const totalOvertime = entries.reduce((sum, entry) => {
          return sum + (parseFloat(entry.daily_overtime_hours) || parseFloat(entry.overtime_hours) || 0);
        }, 0);

        setPersonalStats({
          totalHours: Math.round(totalHours * 10) / 10,
          totalOvertime: Math.round(totalOvertime * 10) / 10,
          totalEntries: entries.length
        });
      } else {
        setPersonalStats({
          totalHours: 0,
          totalOvertime: 0,
          totalEntries: 0
        });
      }
    } catch (error) {
      console.error('📊 WELCOME CARD: Error fetching personal stats:', error);
      setPersonalStats(null);
    }
  };

  const loadRandomImage = async () => {
    try {
      // Skip database image queries to avoid errors, go straight to assets (preserved original logic)
      const assetImages = [
        'employee-award-1.jpg',
        'employee-award-2.jpg', 
        'employee-award-3.jpg',
        'team-photo-1.jpg',
        'team-photo-2.jpg',
        'team-photo-3.jpg',
        'office-1.jpg',
        'office-2.jpg',
        'office-3.jpg',
        'company-event-1.jpg',
        'company-event-2.jpg',
        'workplace-1.jpg',
        'workplace-2.jpg',
        'award-ceremony-1.jpg',
        'award-ceremony-2.jpg',
        'meeting-1.jpg',
        'meeting-2.jpg',
        'celebration-1.jpg',
        'celebration-2.jpg',
        'group-photo-1.jpg'
      ];

      // Test which images actually exist by trying to load them (preserved original logic)
      const imagePromises = assetImages.map(async (filename) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ 
            image_url: `/src/assets/${filename}`, 
            alt_text: 'Employee Award',
            exists: true 
          });
          img.onerror = () => resolve({ 
            image_url: `/src/assets/${filename}`, 
            alt_text: 'Employee Award',
            exists: false 
          });
          img.src = `/src/assets/${filename}`;
        });
      });

      const imageResults = await Promise.all(imagePromises);
      const availableImages = imageResults.filter(img => img.exists);

      console.log('🖼️ Found', availableImages.length, 'images in assets directory');

      if (availableImages.length > 0) {
        // Select random image
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const selectedImage = availableImages[randomIndex];
        setCurrentImage(selectedImage);
        console.log('🎲 Selected random image:', selectedImage.image_url);
      } else {
        console.log('❌ No images found in assets directory');
        setCurrentImage(null);
      }
    } catch (error) {
      console.error('💥 Error loading images:', error);
      setCurrentImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Preserved original event handlers
  const handleViewTimesheet = () => {
    window.location.href = '/timesheets';
  };

  const handleQuickClockIn = () => {
    console.log('Quick clock in clicked');
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed to load:', e.target.src);
    // Hide the image container if image fails to load
    e.target.parentElement.style.display = 'none';
  };

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully:', e.target.src);
  };

  // NEW: Format hours display
  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="welcome-card">
      <div className="welcome-card-content">
        <div className="welcome-content">
          <div className="welcome-header">
            <h2>Hello, {user?.user_metadata?.full_name || user?.full_name || 'Admin User'}! 👋</h2>
            <p className="welcome-subtitle">Welcome to the Invictus Time Management Portal</p>
          </div>

          <div className="user-info">
            <div className="user-detail">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Email: {user?.email || 'admin@test.com'}</span>
            </div>
            <div className="user-detail">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Role: {user?.user_metadata?.role || user?.role || 'admin'}</span>
            </div>
          </div>

          {/* NEW: Statistics Section */}
          {(personalStats || orgStats) && (
            <div style={{ 
              margin: '20px 0',
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                📊 This Week's Summary
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: canViewOrgData() ? 'repeat(auto-fit, minmax(120px, 1fr))' : 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '12px',
                fontSize: '13px'
              }}>
                {/* Personal Stats */}
                {personalStats && (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '16px' }}>
                        {formatHours(personalStats.totalHours)}
                      </div>
                      <div style={{ color: '#6b7280' }}>Your Hours</div>
                    </div>
                    
                    {personalStats.totalOvertime > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '16px' }}>
                          {formatHours(personalStats.totalOvertime)}
                        </div>
                        <div style={{ color: '#6b7280' }}>Your Overtime</div>
                      </div>
                    )}
                  </>
                )}

                {/* Organization Stats for Admin Users */}
                {canViewOrgData() && orgStats && (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '16px' }}>
                        {formatHours(orgStats.totalHours)}
                      </div>
                      <div style={{ color: '#6b7280' }}>Org Total</div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#8b5cf6', fontSize: '16px' }}>
                        {orgStats.activeUsers}
                      </div>
                      <div style={{ color: '#6b7280' }}>Active Users</div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#06b6d4', fontSize: '16px' }}>
                        {formatHours(orgStats.avgHoursPerUser)}
                      </div>
                      <div style={{ color: '#6b7280' }}>Avg per User</div>
                    </div>

                    {orgStats.totalOvertime > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '16px' }}>
                          {formatHours(orgStats.totalOvertime)}
                        </div>
                        <div style={{ color: '#6b7280' }}>Org Overtime</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {statsLoading && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  fontSize: '12px',
                  marginTop: '8px'
                }}>
                  Loading organization stats...
                </div>
              )}
            </div>
          )}

          {/* Preserved original action buttons */}
          <div className="action-buttons">
            <button className="action-button primary" onClick={handleViewTimesheet}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              📊 View Timesheet
            </button>
            <button className="action-button secondary" onClick={handleQuickClockIn}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              🕐 Quick Clock In
            </button>
          </div>

          {/* Preserved original auth status */}
          <div className="auth-status">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Auth Status: authenticated | Client: {canViewOrgData() ? 'Admin' : 'Standard'}</span>
          </div>
        </div>
      </div>

      {/* Preserved original random image functionality */}
      {!isLoading && currentImage && (
        <div className="rotating-images-container">
          <div className="rotating-image active">
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || 'Employee Award'}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeCard;

