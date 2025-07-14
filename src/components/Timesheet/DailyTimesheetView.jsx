import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const DailyTimesheetView = ({ selectedDate, userId, onDateChange }) => {
  const [timesheetData, setTimesheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    payrollHours: 'all',
    groups: 'all',
    members: 'all',
    schedules: 'all'
  });

  // Initialize Supabase client directly in component
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );

  // Format date for display
  const formatDisplayDate = (date) => {
    if (!date) return 'Today';
    const dateObj = new Date(date);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '--';
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return '--';
    }
  };

  // Format hours for display
  const formatHours = (hours) => {
    if (!hours || hours === 0) return '--';
    return parseFloat(hours).toFixed(2);
  };

  // Load timesheet data using Supabase client directly
  const loadTimesheetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the selected date or use today
      const dateString = selectedDate || new Date().toISOString().split('T')[0];

      // Query timesheet_entries table directly
      let query = supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name),
          campaigns!timesheet_entries_campaign_id_fkey(name)
        `)
        .eq('date', dateString)
        .order('created_at', { ascending: false });

      // Add user filter if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: entries, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Transform data for display
      const transformedData = (entries || []).map(entry => ({
        id: entry.id,
        employee: entry.users?.full_name || 'Unknown Employee',
        firstIn: entry.time_in || entry.created_at,
        lastOut: entry.time_out || entry.updated_at,
        regular: entry.regular_hours || 0,
        overtime: entry.overtime_hours || 0,
        dailyDoubleOvertime: entry.daily_double_overtime || 0,
        tracked: (entry.regular_hours || 0) + (entry.overtime_hours || 0) + (entry.daily_double_overtime || 0)
      }));

      setTimesheetData(transformedData);
    } catch (err) {
      console.error('Error loading timesheet data:', err);
      setError(err.message);
      setTimesheetData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or dependencies change
  useEffect(() => {
    loadTimesheetData();
  }, [selectedDate, userId]);

  // Filter data based on search and filters
  const filteredData = timesheetData.filter(entry => {
    const matchesSearch = entry.employee.toLowerCase().includes(searchTerm.toLowerCase());
    // Add more filter logic here as needed
    return matchesSearch;
  });

  // Navigate to previous/next day
  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate || new Date());
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    
    // Trigger parent component date change if callback provided
    if (typeof onDateChange === 'function') {
      onDateChange(newDate.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="daily-timesheet-container">
      {/* Main Header Section */}
      <div className="timesheet-main-header">
        <div className="header-top-row">
          <div className="header-left-section">
            <div className="view-selector-container">
              <select className="timesheet-view-dropdown" defaultValue="daily">
                <option value="daily">Daily Timesheets</option>
                <option value="weekly">Weekly Timesheets</option>
                <option value="monthly">Monthly Timesheets</option>
              </select>
            </div>
            
            <div className="date-navigation-container">
              <button 
                className="date-nav-button"
                onClick={() => navigateDate(-1)}
                aria-label="Previous day"
              >
                ‹
              </button>
              <span className="current-date-display">
                {formatDisplayDate(selectedDate)}
              </span>
              <button 
                className="date-nav-button"
                onClick={() => navigateDate(1)}
                aria-label="Next day"
              >
                ›
              </button>
            </div>
          </div>

          <div className="header-right-section">
            <div className="search-and-export">
              <div className="search-container-main">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="main-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="search-icon-container">
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
              </div>
              
              <button className="export-button-main">
                <svg className="export-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="filters-row">
          <div className="filter-controls-container">
            <select 
              className="timesheet-filter-dropdown"
              value={filters.payrollHours}
              onChange={(e) => setFilters({...filters, payrollHours: e.target.value})}
            >
              <option value="all">Payroll hours</option>
              <option value="regular">Regular hours</option>
              <option value="overtime">Overtime hours</option>
            </select>

            <select 
              className="timesheet-filter-dropdown"
              value={filters.groups}
              onChange={(e) => setFilters({...filters, groups: e.target.value})}
            >
              <option value="all">Groups</option>
              <option value="group1">Group 1</option>
              <option value="group2">Group 2</option>
            </select>

            <select 
              className="timesheet-filter-dropdown"
              value={filters.members}
              onChange={(e) => setFilters({...filters, members: e.target.value})}
            >
              <option value="all">Members</option>
              <option value="active">Active members</option>
              <option value="inactive">Inactive members</option>
            </select>

            <select 
              className="timesheet-filter-dropdown"
              value={filters.schedules}
              onChange={(e) => setFilters({...filters, schedules: e.target.value})}
            >
              <option value="all">Schedules</option>
              <option value="morning">Morning shift</option>
              <option value="evening">Evening shift</option>
            </select>

            <button className="add-filter-button-main">
              <svg className="plus-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add filter
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="timesheet-table-section">
        {loading ? (
          <div className="loading-state-container">
            <div className="loading-spinner-main"></div>
            <p className="loading-text">Loading timesheet data...</p>
          </div>
        ) : error ? (
          <div className="error-state-container">
            <p className="error-text">Error loading timesheet data: {error}</p>
            <button onClick={loadTimesheetData} className="retry-button-main">
              Retry
            </button>
          </div>
        ) : (
          <div className="table-container-main">
            <table className="timesheet-table-main">
              <thead>
                <tr className="table-header-row">
                  <th className="table-header employee-col">EMPLOYEE</th>
                  <th className="table-header time-col">FIRST IN</th>
                  <th className="table-header time-col">LAST OUT</th>
                  <th className="table-header hours-col">REGULAR</th>
                  <th className="table-header hours-col">OVERTIME</th>
                  <th className="table-header hours-col">DAILY DOUBLE OVERTIME</th>
                  <th className="table-header hours-col">TRACKED</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((entry) => (
                    <tr key={entry.id} className="table-data-row">
                      <td className="table-cell employee-col">
                        <div className="employee-info-container">
                          <span className="employee-name-text">{entry.employee}</span>
                        </div>
                      </td>
                      <td className="table-cell time-col">{formatTime(entry.firstIn)}</td>
                      <td className="table-cell time-col">{formatTime(entry.lastOut)}</td>
                      <td className="table-cell hours-col">{formatHours(entry.regular)}</td>
                      <td className="table-cell hours-col">{formatHours(entry.overtime)}</td>
                      <td className="table-cell hours-col">{formatHours(entry.dailyDoubleOvertime)}</td>
                      <td className="table-cell hours-col">{formatHours(entry.tracked)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="empty-data-row">
                    <td colSpan="7" className="empty-message-cell">
                      No timesheet data for {formatDisplayDate(selectedDate)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTimesheetView;

