import React, { useState, useEffect } from 'react';
import { supabaseApi } from '/src/supabase.js';

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

  // Load timesheet data
  const loadTimesheetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the existing supabaseApi to get timesheet data
      const entries = await supabaseApi.getTimesheets({
        user_id: userId,
        // Add date filtering if needed
      });

      // Filter entries for the selected date
      const dateString = selectedDate || new Date().toISOString().split('T')[0];
      const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entryDate === dateString;
      });

      // Transform data for display
      const transformedData = filteredEntries.map(entry => ({
        id: entry.id,
        employee: entry.user_name || 'Unknown Employee',
        firstIn: entry.time_in || entry.created_at, // Use created_at as fallback
        lastOut: entry.time_out || entry.updated_at, // Use updated_at as fallback
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
    // Add more filter logic here as needed based on your existing system
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
      {/* Header Section */}
      <div className="daily-timesheet-header">
        <div className="header-left">
          <div className="view-selector">
            <select className="view-dropdown" defaultValue="daily">
              <option value="daily">Daily Timesheets</option>
              <option value="weekly">Weekly Timesheets</option>
              <option value="monthly">Monthly Timesheets</option>
            </select>
          </div>
          
          <div className="date-navigation">
            <button 
              className="nav-button"
              onClick={() => navigateDate(-1)}
              aria-label="Previous day"
            >
              ‹
            </button>
            <span className="current-date">
              {formatDisplayDate(selectedDate)}
            </span>
            <button 
              className="nav-button"
              onClick={() => navigateDate(1)}
              aria-label="Next day"
            >
              ›
            </button>
          </div>
        </div>

        <div className="header-right">
          <button className="export-button">
            📊 Export
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="daily-timesheet-filters">
        <div className="filter-controls">
          <select 
            className="filter-dropdown"
            value={filters.payrollHours}
            onChange={(e) => setFilters({...filters, payrollHours: e.target.value})}
          >
            <option value="all">Payroll hours</option>
            <option value="regular">Regular hours</option>
            <option value="overtime">Overtime hours</option>
          </select>

          <select 
            className="filter-dropdown"
            value={filters.groups}
            onChange={(e) => setFilters({...filters, groups: e.target.value})}
          >
            <option value="all">Groups</option>
            <option value="group1">Group 1</option>
            <option value="group2">Group 2</option>
          </select>

          <select 
            className="filter-dropdown"
            value={filters.members}
            onChange={(e) => setFilters({...filters, members: e.target.value})}
          >
            <option value="all">Members</option>
            <option value="active">Active members</option>
            <option value="inactive">Inactive members</option>
          </select>

          <select 
            className="filter-dropdown"
            value={filters.schedules}
            onChange={(e) => setFilters({...filters, schedules: e.target.value})}
          >
            <option value="all">Schedules</option>
            <option value="morning">Morning shift</option>
            <option value="evening">Evening shift</option>
          </select>

          <button className="add-filter-button">
            + Add filter
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="daily-timesheet-search">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="daily-timesheet-table-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading timesheet data...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error loading timesheet data: {error}</p>
            <button onClick={loadTimesheetData} className="retry-button">
              Retry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="daily-timesheet-table">
              <thead>
                <tr>
                  <th className="col-employee">EMPLOYEE</th>
                  <th className="col-time">FIRST IN</th>
                  <th className="col-time">LAST OUT</th>
                  <th className="col-hours">REGULAR</th>
                  <th className="col-hours">OVERTIME</th>
                  <th className="col-hours">DAILY DOUBLE OVERTIME</th>
                  <th className="col-hours">TRACKED</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((entry) => (
                    <tr key={entry.id} className="table-row">
                      <td className="col-employee">
                        <div className="employee-info">
                          <span className="employee-name">{entry.employee}</span>
                        </div>
                      </td>
                      <td className="col-time">{formatTime(entry.firstIn)}</td>
                      <td className="col-time">{formatTime(entry.lastOut)}</td>
                      <td className="col-hours">{formatHours(entry.regular)}</td>
                      <td className="col-hours">{formatHours(entry.overtime)}</td>
                      <td className="col-hours">{formatHours(entry.dailyDoubleOvertime)}</td>
                      <td className="col-hours">{formatHours(entry.tracked)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="empty-row">
                    <td colSpan="7" className="empty-message">
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

