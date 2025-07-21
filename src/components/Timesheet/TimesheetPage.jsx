import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Search, Filter, Plus, Users, Clock, BarChart3 } from 'lucide-react';
import { supabaseApi } from "../../supabaseClient.js";
import { useAuth } from '../../hooks/useAuth';
import './timesheet-page.css';

const TimesheetPage = () => {
  // State management
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('weekly');
  const [activeTab, setActiveTab] = useState('timesheets');
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    payrollHours: 'all',
    groups: 'all',
    members: 'all',
    schedules: 'all'
  });
  const [timesheetData, setTimesheetData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Get week dates
  const getWeekDates = (weekStart) => {
    const dates = [];
    const start = new Date(weekStart);
    // Get Monday of the week
    const monday = new Date(start);
    monday.setDate(start.getDate() - start.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);

  // Load data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTimesheetData();
      loadUsers();
    }
  }, [user, isAuthenticated, selectedWeek]);

  const loadTimesheetData = async () => {
    try {
      setLoading(true);
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];

      const entries = await supabaseApi.getTimesheets({
        startDate: startDate,
        endDate: endDate
      });

      setTimesheetData(entries || []);
    } catch (error) {
      console.error('Error loading timesheet data:', error);
      setTimesheetData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await supabaseApi.getUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  // Date navigation
  const navigateWeek = (direction) => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newWeek);
  };

  // Format week display
  const formatWeekDisplay = () => {
    const startOfWeek = weekDates[0];
    const endOfWeek = weekDates[6];
    
    return `Jul ${startOfWeek.getDate()} - Jul ${endOfWeek.getDate()}`;
  };

  // Get hours for a specific user and date
  const getHoursForUserAndDate = (userId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = timesheetData.filter(entry => 
      entry.user_id === userId && entry.date === dateStr
    );
    
    if (dayEntries.length === 0) return '-';
    
    const totalHours = dayEntries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.hours_worked) || parseFloat(entry.total_hours) || parseFloat(entry.regular_hours) || 0);
    }, 0);
    
    return totalHours > 0 ? totalHours.toFixed(1) : '-';
  };

  // Get total hours for a user for the week
  const getWeeklyTotalForUser = (userId) => {
    const total = weekDates.reduce((sum, date) => {
      const hours = getHoursForUserAndDate(userId, date);
      return sum + (hours !== '-' ? parseFloat(hours) : 0);
    }, 0);
    
    return total > 0 ? total.toFixed(1) : '-';
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="timesheet-page">
        <div className="timesheet-empty-state">
          <p>Please log in to access timesheets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timesheet-page">
      {/* Header */}
      <div className="timesheet-header">
        <div className="timesheet-header-content">
          <h1>Timesheets</h1>
          <button className="timesheet-export-btn">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="timesheet-tabs">
        <div className="timesheet-tabs-list">
          <button
            onClick={() => setActiveTab('timesheets')}
            className={`timesheet-tab ${activeTab === 'timesheets' ? 'active' : ''}`}
          >
            Timesheets
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`timesheet-tab ${activeTab === 'approvals' ? 'active' : ''}`}
          >
            Approvals
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="timesheet-controls">
        <div className="timesheet-controls-row">
          <div className="timesheet-controls-left">
            <select
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value)}
              className="timesheet-view-selector"
            >
              <option value="weekly">Weekly Timesheets</option>
              <option value="daily">Daily Timesheets</option>
              <option value="monthly">Monthly Timesheets</option>
            </select>

            <div className="timesheet-date-nav">
              <button
                onClick={() => navigateWeek('prev')}
                className="timesheet-date-btn"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="timesheet-date-display">
                <Calendar size={16} />
                <span>{formatWeekDisplay()}</span>
              </div>
              
              <button
                onClick={() => navigateWeek('next')}
                className="timesheet-date-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="timesheet-filters">
        <div className="timesheet-filters-row">
          <div className="timesheet-filters-left">
            <select
              value={filters.payrollHours}
              onChange={(e) => setFilters(prev => ({ ...prev, payrollHours: e.target.value }))}
              className="timesheet-filter-select"
            >
              <option value="all">Payroll hours</option>
              <option value="regular">Regular hours</option>
              <option value="overtime">Overtime</option>
            </select>

            <select
              value={filters.groups}
              onChange={(e) => setFilters(prev => ({ ...prev, groups: e.target.value }))}
              className="timesheet-filter-select"
            >
              <option value="all">Groups</option>
              <option value="development">Development</option>
              <option value="marketing">Marketing</option>
            </select>

            <select
              value={filters.members}
              onChange={(e) => setFilters(prev => ({ ...prev, members: e.target.value }))}
              className="timesheet-filter-select"
            >
              <option value="all">Members</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.schedules}
              onChange={(e) => setFilters(prev => ({ ...prev, schedules: e.target.value }))}
              className="timesheet-filter-select"
            >
              <option value="all">Schedules</option>
              <option value="standard">Standard</option>
              <option value="flexible">Flexible</option>
            </select>

            <button className="timesheet-add-filter">
              <Plus size={16} />
              Add filter
            </button>
          </div>

          <div className="timesheet-search-container">
            <Search className="timesheet-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="timesheet-search"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="timesheet-table-container">
        {loading ? (
          <div className="timesheet-loading">
            <div className="timesheet-loading-spinner"></div>
            <span>Loading timesheets...</span>
          </div>
        ) : (
          <table className="timesheet-table">
            <thead>
              <tr>
                <th></th>
                {weekDates.map((date, index) => (
                  <th key={index}>
                    <div className="timesheet-table-day-header">
                      <div className="timesheet-table-day-letter">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                      </div>
                      <div className="timesheet-table-day-number">
                        {date.getDate()}
                      </div>
                    </div>
                  </th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="timesheet-empty-state">
                      <div className="timesheet-empty-message">
                        {searchQuery ? 'No users found matching your search.' : 'No timesheet data for this week.'}
                      </div>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="timesheet-add-entry-btn"
                      >
                        <Plus size={16} />
                        Add Time Entry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userData, userIndex) => (
                  <tr key={userData.id || userIndex}>
                    <td>
                      <div className="timesheet-user-cell">
                        <div className="timesheet-user-avatar">
                          {(userData.full_name || userData.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="timesheet-user-name">
                          {userData.full_name || userData.email || 'Unknown User'}
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date, dateIndex) => (
                      <td key={dateIndex}>
                        <div className="timesheet-hours-cell">
                          {getHoursForUserAndDate(userData.id, date)}
                        </div>
                      </td>
                    ))}
                    <td>
                      <div className="timesheet-total-cell">
                        {getWeeklyTotalForUser(userData.id)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Export both names for compatibility
export { TimesheetPage as TimesheetsPage };
export default TimesheetPage;

