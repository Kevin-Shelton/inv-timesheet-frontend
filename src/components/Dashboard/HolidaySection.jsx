import React, { useEffect, useState } from "react";
import { Calendar, Plus, X } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import "./DashboardNamespaced.css";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HolidayCard({ onNavigateToHolidays }) {
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchUpcomingHolidays = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('holidays')
          .select('*')
          .gte('date', today)
          .eq('is_company_wide', true)
          .order('date', { ascending: true })
          .limit(3);

        if (error) {
          console.error('Error fetching holidays:', error);
          setUpcomingHolidays([]);
        } else {
          setUpcomingHolidays(data || []);
        }
      } catch (err) {
        console.error('Error in fetchUpcomingHolidays:', err);
        setUpcomingHolidays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingHolidays();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const holidayDate = new Date(dateString);
    const diffTime = holidayDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `In ${Math.ceil(diffDays / 30)} months`;
  };

  const handleSetupHolidays = () => {
    if (onNavigateToHolidays) {
      onNavigateToHolidays();
    } else {
      // Fallback navigation
      window.location.href = '/holidays-maintenance';
    }
  };

  const handleDismiss = () => {
    // Hide the card or mark as dismissed
    console.log('Holiday setup dismissed');
  };

  return (
    <div 
      className="holiday-card"
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
      </div>

      <div className="holiday-content">
        {loading ? (
          <div className="holiday-loading">
            <p>Loading holidays...</p>
          </div>
        ) : upcomingHolidays.length > 0 ? (
          <div className="holiday-list">
            {upcomingHolidays.map((holiday) => (
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
                      {holiday.overtime_multiplier}x Pay
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-holidays">
            <Calendar size={48} className="empty-calendar" />
            <p>No upcoming holidays</p>
            <span className="empty-subtext">Set up your holiday calendar to get started</span>
          </div>
        )}
      </div>

      {/* Hover Actions */}
      <div className={`holiday-actions ${isHovered ? 'visible' : ''}`}>
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

