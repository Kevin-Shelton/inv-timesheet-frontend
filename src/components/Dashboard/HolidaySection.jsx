import React, { useEffect, useState } from "react";
import { Calendar, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "./supabaseClient.js";
import "./DashboardNamespaced.css";

export default function HolidayCard({ onNavigateToHolidays }) {
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchUpcomingHolidays = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('holidays')
          .select('*')
          .gte('date', today)
          .eq('is_company_wide', true)
          .order('date', { ascending: true })
          .limit(5); // Get more holidays for expanded view

        if (error) {
          console.error('Error fetching holidays:', error);
          if (mounted) {
            setError('Unable to load holidays');
            setUpcomingHolidays([]);
          }
        } else {
          if (mounted) {
            setUpcomingHolidays(data || []);
          }
        }
      } catch (err) {
        console.error('Exception in fetchUpcomingHolidays:', err);
        if (mounted) {
          setError('Failed to connect to holiday data');
          setUpcomingHolidays([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUpcomingHolidays();

    // Set up real-time subscription for holiday changes
    const subscription = supabase
      .channel('holiday_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'holidays' 
        }, 
        (payload) => {
          console.log('Holiday change detected:', payload);
          // Refetch holidays when changes occur
          if (mounted) {
            fetchUpcomingHolidays();
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      console.warn('Error formatting date:', dateString);
      return dateString;
    }
  };

  const getDaysUntil = (dateString) => {
    try {
      const today = new Date();
      const holidayDate = new Date(dateString);
      const diffTime = holidayDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 7) return `In ${diffDays} days`;
      if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
      return `In ${Math.ceil(diffDays / 30)} months`;
    } catch (err) {
      console.warn('Error calculating days until:', dateString);
      return '';
    }
  };

  const handleSetupHolidays = () => {
    try {
      if (onNavigateToHolidays) {
        onNavigateToHolidays();
      } else {
        // Fallback navigation
        console.log('Navigate to holiday maintenance page');
        // You can implement routing here based on your router setup
        // Example: navigate('/holidays-maintenance');
      }
    } catch (err) {
      console.error('Error navigating to holidays:', err);
    }
  };

  const handleDismiss = () => {
    // Hide the card or mark as dismissed
    console.log('Holiday setup dismissed');
    // You can implement local storage or user preference saving here
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Show only next holiday when collapsed, all when expanded
  const displayHolidays = isExpanded ? upcomingHolidays : upcomingHolidays.slice(0, 1);

  return (
    <div 
      className={`holiday-card ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="holiday-header">
        <div className="holiday-icon">
          <Calendar size={24} />
        </div>
        <div className="holiday-title">
          <h3>UPCOMING HOLIDAYS AND TIME OFF</h3>
          <p>Add your holiday calendar for reminders and overtime calculations.</p>
        </div>
        <button 
          className="expand-toggle"
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className={`holiday-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {loading ? (
          <div className="holiday-loading">
            <p>Loading holidays...</p>
          </div>
        ) : error ? (
          <div className="no-holidays">
            <Calendar size={48} className="empty-calendar" />
            <p>Unable to load holidays</p>
            <span className="empty-subtext">{error}</span>
          </div>
        ) : upcomingHolidays.length > 0 ? (
          <div className="holiday-list">
            {displayHolidays.map((holiday) => (
              <div key={holiday.id} className="holiday-item">
                <div className="holiday-date">
                  <span className="date-text">{formatDate(holiday.date)}</span>
                  <span className="days-until">{getDaysUntil(holiday.date)}</span>
                </div>
                <div className="holiday-details">
                  <h4>{holiday.name}</h4>
                  {holiday.description && (
                    <p className="holiday-description">{holiday.description}</p>
                  )}
                  {holiday.overtime_multiplier > 1 && (
                    <span className="overtime-badge">
                      {holiday.overtime_multiplier === 2.0 ? 'Double Pay' : 
                       holiday.overtime_multiplier === 1.5 ? 'Time & Half' :
                       `${holiday.overtime_multiplier}x Pay`}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {/* Show "and X more" when collapsed */}
            {!isExpanded && upcomingHolidays.length > 1 && (
              <div className="more-holidays-indicator">
                <button 
                  className="show-more-btn"
                  onClick={toggleExpanded}
                >
                  +{upcomingHolidays.length - 1} more holiday{upcomingHolidays.length - 1 !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="no-holidays">
            <Calendar size={isExpanded ? 48 : 32} className="empty-calendar" />
            <p>No upcoming holidays</p>
            {isExpanded && (
              <span className="empty-subtext">Set up your holiday calendar to get started</span>
            )}
          </div>
        )}
      </div>

      {/* Hover Actions - Only show when expanded or when no holidays */}
      <div className={`holiday-actions ${(isHovered && (isExpanded || upcomingHolidays.length === 0)) ? 'visible' : ''}`}>
        <button 
          className="setup-btn primary"
          onClick={handleSetupHolidays}
        >
          <Plus size={16} />
          Set up Holidays
        </button>
        <button 
          className="dismiss-btn secondary"
          onClick={handleDismiss}
        >
          <X size={16} />
          No, thanks
        </button>
      </div>
    </div>
  );
}

