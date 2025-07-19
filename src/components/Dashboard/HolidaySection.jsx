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

      // First, check what columns exist in the holidays table
      const { data: sampleData, error: sampleError } = await supabase
        .from('holidays')
        .select('*')
        .limit(1);

      let selectColumns = 'id, name, date';
      
      if (sampleData && sampleData.length > 0) {
        const availableColumns = Object.keys(sampleData[0]);
        console.log('🎉 HOLIDAYS: Available columns:', availableColumns);
        
        // Add optional columns if they exist
        if (availableColumns.includes('description')) {
          selectColumns += ', description';
        }
        if (availableColumns.includes('is_paid')) {
          selectColumns += ', is_paid';
        }
        if (availableColumns.includes('holiday_type')) {
          selectColumns += ', holiday_type';
        }
        if (availableColumns.includes('created_at')) {
          selectColumns += ', created_at';
        }
      }

      // Fetch holidays with only available columns
      const { data: holidaysData, error: fetchError } = await supabase
        .from('holidays')
        .select(selectColumns)
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', nextYear.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(10);

      if (fetchError) {
        console.error('🎉 HOLIDAYS ERROR:', fetchError);
        throw new Error(`Failed to fetch holidays: ${fetchError.message}`);
      }

      setHolidays(holidaysData || []);
      console.log('🎉 HOLIDAYS: Fetched holidays:', holidaysData?.length || 0);

    } catch (error) {
      console.error('🎉 HOLIDAYS ERROR:', error);
      setError(error.message || 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilHoliday = (holidayDate) => {
    const today = new Date();
    const holiday = new Date(holidayDate);
    const diffTime = holiday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `In ${Math.ceil(diffDays / 30)} months`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="holiday-section">
        <div className="holiday-header">
          <h3 className="holiday-title">Upcoming Holidays</h3>
        </div>
        <div className="holiday-loading">
          <div className="holiday-loading-spinner"></div>
          Loading holidays...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="holiday-section">
        <div className="holiday-header">
          <h3 className="holiday-title">Upcoming Holidays and Time Off</h3>
        </div>
        <div className="holiday-error">
          <div className="chart-error-icon">⚠️</div>
          <div>Error loading holidays</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            {error.includes('column') 
              ? 'Database schema needs updating. Please contact your administrator.'
              : error
            }
          </div>
          <button 
            onClick={fetchUpcomingHolidays}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (holidays.length === 0) {
    return (
      <div className="holiday-section">
        <div className="holiday-header">
          <h3 className="holiday-title">Upcoming Holidays and Time Off</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
            
          </p>
        </div>
        <div className="holiday-empty">
          <div className="holiday-empty-icon">🎉</div>
          <div>No upcoming holidays</div>
        </div>
      </div>
    );
  }

  const nextHoliday = holidays[0];
  const timeUntil = getTimeUntilHoliday(nextHoliday.date);

  return (
    <div className="holiday-section">
      <div className="holiday-header">
        <h3 className="holiday-title">Upcoming Holidays and Time Off</h3>
        <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
          Holiday calendar for reminders and overtime calculations
        </p>
      </div>

      <div className="holiday-content">
        {/* Next Holiday - Compact View */}
        <div className="holiday-compact">
          <div className="holiday-compact-info">
            <div className="holiday-compact-name">{nextHoliday.name}</div>
            <div className="holiday-compact-date">{formatDate(nextHoliday.date)}</div>
          </div>
          <div className="holiday-compact-countdown">
            <div className="countdown-value">
              {timeUntil === 'Today' ? '0' : 
               timeUntil === 'Tomorrow' ? '1' :
               timeUntil.match(/\d+/) ? timeUntil.match(/\d+/)[0] : '?'}
            </div>
            <div className="countdown-label">
              {timeUntil === 'Today' ? 'Today' :
               timeUntil === 'Tomorrow' ? 'Day' :
               timeUntil.includes('days') ? 'Days' :
               timeUntil.includes('weeks') ? 'Weeks' :
               timeUntil.includes('months') ? 'Months' : 'Time'}
            </div>
          </div>
        </div>

        {/* Additional Holidays */}
        {holidays.length > 1 && (
          <>
            <div className="holiday-toggle" onClick={() => setIsExpanded(!isExpanded)}>
              <span className="holiday-toggle-text">
                {isExpanded ? 'Show less' : `+${holidays.length - 1} more holidays`}
              </span>
              <span className={`holiday-toggle-icon ${isExpanded ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>

            {isExpanded && (
              <div className="holiday-list">
                {holidays.slice(1).map((holiday) => (
                  <div key={holiday.id} className="holiday-item">
                    <div className="holiday-info">
                      <div className="holiday-details">
                        <h4 className="holiday-name">{holiday.name}</h4>
                        <p className="holiday-date">
                          📅 {formatDate(holiday.date)}
                        </p>
                      </div>
                      <div className="holiday-badges">
                        <span className={`time-indicator ${
                          getTimeUntilHoliday(holiday.date) === 'Today' ? 'today' :
                          getTimeUntilHoliday(holiday.date) === 'Tomorrow' ? 'tomorrow' :
                          getTimeUntilHoliday(holiday.date).includes('days') ? 'this-week' : 'upcoming'
                        }`}>
                          {getTimeUntilHoliday(holiday.date)}
                        </span>
                        {holiday.is_paid !== undefined && (
                          <span className={`holiday-badge ${holiday.is_paid ? 'paid' : 'unpaid'}`}>
                            {holiday.is_paid ? 'Paid' : 'Unpaid'}
                          </span>
                        )}
                        {holiday.holiday_type && (
                          <span className={`holiday-badge ${holiday.holiday_type.toLowerCase()}`}>
                            {holiday.holiday_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HolidaysViewer;

