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

      const { data: holidaysData, error: fetchError } = await supabase
        .from('holidays')
        .select('*')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', nextYear.toISOString().split('T')[0])
        .eq('is_active', true)
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
    if (diffDays === 0) {
      timeInfo = 'Today';
    } else if (diffDays === 1) {
      timeInfo = 'Tomorrow';
    } else if (diffDays > 0 && diffDays <= 30) {
      timeInfo = `In ${diffDays} days`;
    } else if (diffDays > 30 && diffDays <= 365) {
      const months = Math.floor(diffDays / 30);
      timeInfo = `In ${months} month${months > 1 ? 's' : ''}`;
    }

    return {
      formatted: `${month} ${day}, ${year}`,
      timeInfo,
      isPast: diffDays < 0,
      isToday: diffDays === 0,
      isSoon: diffDays >= 0 && diffDays <= 7
    };
  };

  const getHolidayTypeColor = (type) => {
    const colors = {
      'national': '#ff6b6b',
      'company': '#4ecdc4',
      'religious': '#45b7d1',
      'cultural': '#96ceb4',
      'personal': '#feca57',
      'other': '#a55eea'
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
            <h3>UPCOMING HOLIDAYS AND TIME OFF</h3>
            <button 
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled
            >
              ⌄
            </button>
          </div>
          <p className="holidays-subtitle">Add your holiday calendar for reminders and overtime calculations</p>
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
            <h3>UPCOMING HOLIDAYS AND TIME OFF</h3>
            <button 
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              ⌄
            </button>
          </div>
          <p className="holidays-subtitle">Add your holiday calendar for reminders and overtime calculations</p>
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
          <h3>UPCOMING HOLIDAYS AND TIME OFF</h3>
          <button 
            className={`expand-button ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            ⌄
          </button>
        </div>
        <p className="holidays-subtitle">Add your holiday calendar for reminders and overtime calculations</p>
      </div>

      {holidays.length === 0 ? (
        <div className="holidays-empty">
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No upcoming holidays found</p>
            {canManageHolidays() && (
              <button className="add-holiday-button">
                Add Holiday
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Next Holiday Preview */}
          {nextHoliday && !isExpanded && (
            <div className="next-holiday-preview">
              <div className="holiday-preview-card">
                <div className="holiday-date-section">
                  <div className="holiday-month-day">
                    {formatDate(nextHoliday.date).formatted.split(',')[0]}
                  </div>
                  <div className="holiday-year">
                    {formatDate(nextHoliday.date).formatted.split(',')[1]}
                  </div>
                  <div className="holiday-time-info">
                    {formatDate(nextHoliday.date).timeInfo}
                  </div>
                </div>
                <div className="holiday-info-section">
                  <div className="holiday-name">{nextHoliday.name}</div>
                  <div className="holiday-meta">
                    <span 
                      className="holiday-type"
                      style={{ 
                        backgroundColor: getHolidayTypeColor(nextHoliday.type),
                        color: 'white'
                      }}
                    >
                      {nextHoliday.type || 'Holiday'}
                    </span>
                    {nextHoliday.is_paid && (
                      <span className="holiday-paid">TIME & HALF</span>
                    )}
                  </div>
                  {nextHoliday.description && (
                    <div className="holiday-description">
                      {nextHoliday.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Full Holidays List */}
          {isExpanded && (
            <div className="holidays-list">
              {holidays.map((holiday, index) => {
                const dateInfo = formatDate(holiday.date);
                return (
                  <div 
                    key={holiday.id || index} 
                    className={`holiday-item ${dateInfo.isToday ? 'today' : ''} ${dateInfo.isSoon ? 'soon' : ''}`}
                  >
                    <div className="holiday-date-column">
                      <div className="holiday-date">
                        {dateInfo.formatted}
                      </div>
                      <div className="holiday-time">
                        {dateInfo.timeInfo}
                      </div>
                    </div>
                    
                    <div className="holiday-details-column">
                      <div className="holiday-name">{holiday.name}</div>
                      <div className="holiday-meta">
                        <span 
                          className="holiday-type"
                          style={{ 
                            backgroundColor: getHolidayTypeColor(holiday.type),
                            color: 'white'
                          }}
                        >
                          {holiday.type || 'Holiday'}
                        </span>
                        {holiday.is_paid && (
                          <span className="holiday-paid">TIME & HALF</span>
                        )}
                      </div>
                      {holiday.description && (
                        <div className="holiday-description">
                          {holiday.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {canManageHolidays() && (
                <div className="holidays-actions">
                  <button className="add-holiday-button">
                    Add New Holiday
                  </button>
                  <button className="manage-holidays-button">
                    Manage All Holidays
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

