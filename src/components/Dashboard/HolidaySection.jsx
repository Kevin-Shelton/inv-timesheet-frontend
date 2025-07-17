import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const HolidaysViewer = () => {
  const { user, canManageHolidays } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchUpcomingHolidays();
  }, []);

  const fetchUpcomingHolidays = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎉 HOLIDAYS: Fetching upcoming holidays...');

      const today = new Date();
      const nextYear = new Date(today);
      nextYear.setFullYear(today.getFullYear() + 1);

      // FIXED: Removed .eq('is_active', true) since the column doesn't exist
      const { data: holidaysData, error: fetchError } = await supabase
        .from('holidays')
        .select('*')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', nextYear.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(10);

      if (fetchError) {
        console.error('🎉 HOLIDAYS ERROR:', fetchError);
        throw fetchError;
      }

      setHolidays(holidaysData || []);
      console.log('🎉 HOLIDAYS: Fetched holidays:', holidaysData?.length || 0);

    } catch (error) {
      console.error('🎉 HOLIDAYS ERROR:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    let timeInfo = '';
    let urgency = 'normal';

    if (diffDays === 0) {
      timeInfo = 'Today';
      urgency = 'today';
    } else if (diffDays === 1) {
      timeInfo = 'Tomorrow';
      urgency = 'soon';
    } else if (diffDays > 0 && diffDays <= 7) {
      timeInfo = `In ${diffDays} days`;
      urgency = 'soon';
    } else if (diffDays > 7 && diffDays <= 30) {
      timeInfo = `In ${diffDays} days`;
      urgency = 'upcoming';
    } else if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      timeInfo = `In ${months} month${months > 1 ? 's' : ''}`;
      urgency = 'future';
    }

    return {
      formatted: `${month} ${day}, ${year}`,
      shortDate: `${month} ${day}`,
      timeInfo,
      urgency,
      isPast: diffDays < 0,
      isToday: diffDays === 0,
      isSoon: diffDays >= 0 && diffDays <= 7,
      diffDays
    };
  };

  const getHolidayTypeColor = (type) => {
    const colors = {
      'national': '#e53e3e',
      'company': '#38b2ac',
      'religious': '#4299e1',
      'cultural': '#48bb78',
      'personal': '#ed8936',
      'other': '#9f7aea'
    };
    return colors[type?.toLowerCase()] || colors.other;
  };

  const nextHoliday = holidays.find(holiday => {
    const date = new Date(holiday.date);
    const today = new Date();
    return date >= today;
  });

  if (loading) {
    return (
      <div className="holidays-viewer">
        <div className="holidays-header">
          <div className="holidays-title">
            <h3>UPCOMING HOLIDAYS</h3>
            <button 
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4H4z"/>
              </svg>
            </button>
          </div>
          <p className="holidays-subtitle">Holiday calendar for reminders and overtime calculations</p>
        </div>
        <div className="holidays-loading">
          <div className="loading-spinner"></div>
          <p>Loading holidays...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="holidays-viewer">
        <div className="holidays-header">
          <div className="holidays-title">
            <h3>UPCOMING HOLIDAYS</h3>
            <button 
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4H4z"/>
              </svg>
            </button>
          </div>
          <p className="holidays-subtitle">Holiday calendar for reminders and overtime calculations</p>
        </div>
        <div className="holidays-error">
          <p>Error loading holidays: {error}</p>
          <button onClick={fetchUpcomingHolidays} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`holidays-viewer ${isExpanded ? 'expanded' : ''}`}>
      <div className="holidays-header">
        <div className="holidays-title">
          <h3>UPCOMING HOLIDAYS</h3>
          <button 
            className={`expand-button ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4H4z"/>
            </svg>
          </button>
        </div>
        <p className="holidays-subtitle">Holiday calendar for reminders and overtime calculations</p>
      </div>

      {holidays.length === 0 ? (
        <div className="holidays-empty">
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h4>No upcoming holidays</h4>
            <p>No holidays scheduled for the next 12 months</p>
            {canManageHolidays() && (
              <button className="add-holiday-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
                </svg>
                Add Holiday
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Compact View - Next Holiday */}
          {!isExpanded && nextHoliday && (
            <div className="next-holiday-compact">
              <div className={`holiday-card compact ${formatDate(nextHoliday.date).urgency}`}>
                <div className="holiday-date-badge">
                  <div className="date-month-day">{formatDate(nextHoliday.date).shortDate}</div>
                  <div className="date-time-info">{formatDate(nextHoliday.date).timeInfo}</div>
                </div>
                
                <div className="holiday-info">
                  <div className="holiday-name">{nextHoliday.name}</div>
                  <div className="holiday-meta">
                    <span 
                      className="holiday-type-badge"
                      style={{ backgroundColor: getHolidayTypeColor(nextHoliday.type) }}
                    >
                      {nextHoliday.type || 'Holiday'}
                    </span>
                    {/* FIXED: Check if is_paid exists before using it */}
                    {nextHoliday.is_paid && (
                      <span className="holiday-paid-badge">TIME & HALF</span>
                    )}
                  </div>
                  {nextHoliday.description && (
                    <div className="holiday-description">{nextHoliday.description}</div>
                  )}
                </div>
              </div>
              
              {holidays.length > 1 && (
                <div className="more-holidays-indicator">
                  <span>+{holidays.length - 1} more holidays</span>
                </div>
              )}
            </div>
          )}

          {/* Expanded View - All Holidays */}
          {isExpanded && (
            <div className="holidays-expanded">
              <div className="holidays-grid">
                {holidays.map((holiday, index) => {
                  const dateInfo = formatDate(holiday.date);
                  return (
                    <div 
                      key={holiday.id || index} 
                      className={`holiday-card expanded ${dateInfo.urgency}`}
                    >
                      <div className="holiday-date-section">
                        <div className="date-display">
                          <div className="date-month-day">{dateInfo.shortDate}</div>
                          <div className="date-year">{new Date(holiday.date).getFullYear()}</div>
                        </div>
                        <div className={`date-countdown ${dateInfo.urgency}`}>
                          {dateInfo.timeInfo}
                        </div>
                      </div>
                      
                      <div className="holiday-content">
                        <div className="holiday-name">{holiday.name}</div>
                        <div className="holiday-meta">
                          <span 
                            className="holiday-type-badge"
                            style={{ backgroundColor: getHolidayTypeColor(holiday.type) }}
                          >
                            {holiday.type || 'Holiday'}
                          </span>
                          {/* FIXED: Check if is_paid exists before using it */}
                          {holiday.is_paid && (
                            <span className="holiday-paid-badge">TIME & HALF</span>
                          )}
                        </div>
                        {holiday.description && (
                          <div className="holiday-description">{holiday.description}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {canManageHolidays() && (
                <div className="holidays-actions">
                  <button className="add-holiday-button">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
                    </svg>
                    Add Holiday
                  </button>
                  <button className="manage-holidays-button">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    </svg>
                    Manage All
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HolidaysViewer;

