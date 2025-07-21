import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Search, Filter, Plus, Users, Clock, BarChart3 } from 'lucide-react';
import DailyTimesheetView from './DailyTimesheetView';
import WeeklyTimesheetView from './WeeklyTimesheetView';
import MonthlyTimesheetView from './MonthlyTimesheetView';
import TimesheetEntryModal from './TimesheetEntryModal';
import { supabaseApi } from "../../supabaseClient.js";

// Import the timesheet CSS
import './timesheet-page.css';

const TimesheetApprovalsView = ({ userId, searchQuery, filters }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApprovals = async () => {
      setLoading(true);
      try {
        // Load pending timesheet approvals
        const pendingApprovals = await supabaseApi.getPendingApprovals(userId);
        setApprovals(pendingApprovals || []);
      } catch (error) {
        console.error('Error loading approvals:', error);
        setApprovals([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadApprovals();
    }
  }, [userId]);

  const handleApprove = async (entryId) => {
    try {
      await supabaseApi.approveTimesheet(entryId);
      // Refresh approvals list
      const pendingApprovals = await supabaseApi.getPendingApprovals(userId);
      setApprovals(pendingApprovals || []);
    } catch (error) {
      console.error('Error approving timesheet:', error);
    }
  };

  const handleReject = async (entryId, reason) => {
    try {
      await supabaseApi.rejectTimesheet(entryId, reason);
      // Refresh approvals list
      const pendingApprovals = await supabaseApi.getPendingApprovals(userId);
      setApprovals(pendingApprovals || []);
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
    }
  };

  if (loading) {
    return (
      <div className="timesheet-loading">
        <div className="timesheet-loading-spinner"></div>
        <p>Loading approvals...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
        Pending Approvals
      </h3>
      
      {approvals.length === 0 ? (
        <div className="timesheet-empty-state">
          <p className="timesheet-empty-message">No pending approvals</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <table className="timesheet-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => (
                <tr key={approval.id}>
                  <td>
                    <div className="timesheet-user-cell">
                      <div className="timesheet-user-avatar">
                        {approval.employee_name?.charAt(0) || 'U'}
                      </div>
                      <div className="timesheet-user-name">
                        {approval.employee_name || 'Unknown User'}
                      </div>
                    </div>
                  </td>
                  <td>{approval.date}</td>
                  <td>{approval.hours_worked || 0}h</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: '#FEF3C7',
                      color: '#92400E'
                    }}>
                      Pending
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(approval.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval.id, 'Rejected by manager')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TimesheetPage = () => {
  // State management
  const [currentView, setCurrentView] = useState('weekly'); // daily, weekly, monthly
  const [activeTab, setActiveTab] = useState('timesheets'); // timesheets, approvals
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    campaign: 'all',
    managedBy: 'me',
    payrollHours: 'all',
    groups: 'all',
    members: 'all',
    schedules: 'all'
  });
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize user data and campaigns
  useEffect(() => {
    const initializeData = async () => {
      console.log('🔍 TIMESHEET: Initializing user authentication and campaigns...');
      
      try {
        // Use supabaseApi for consistent authentication
        const user = await supabaseApi.getCurrentUser();
        
        if (!user) {
          console.log('❌ TIMESHEET: No authenticated user found');
          setAuthError('No authenticated user found');
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        console.log('✅ TIMESHEET: Authenticated user found:', user.email);
        setCurrentUser(user);

        // Load campaigns from database
        try {
          const campaignData = await supabaseApi.getCampaigns();
          console.log('✅ CAMPAIGNS: Loaded campaigns:', campaignData);
          setCampaigns(campaignData || []);
        } catch (campaignError) {
          console.warn('⚠️ CAMPAIGNS: Error loading campaigns:', campaignError);
          setCampaigns([]);
        }

        setAuthError(null);
        setLoading(false);

      } catch (error) {
        console.error('❌ TIMESHEET: Initialization error:', error);
        setAuthError('Failed to initialize user: ' + error.message);
        setCurrentUser(null);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Date navigation functions
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (currentView === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      setSelectedDate(newDate);
    } else if (currentView === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      setSelectedWeek(newDate);
    } else if (currentView === 'monthly') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      setSelectedMonth(newDate);
    }
  };

  // Format date display based on current view
  const formatDateDisplay = () => {
    const date = currentView === 'weekly' ? selectedWeek : 
                 currentView === 'monthly' ? selectedMonth : selectedDate;
    
    if (currentView === 'daily') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } else if (currentView === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  // Handle day click from weekly/monthly views
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setCurrentView('daily');
  };

  // Export functionality
  const handleExport = async () => {
    if (!currentUser) {
      console.error('❌ EXPORT: No user available for export');
      return;
    }

    try {
      console.log('📊 EXPORT: Exporting timesheet data for user:', currentUser.id);
      // Implement your export logic here
      // Example: Generate CSV, PDF, or call export API
    } catch (error) {
      console.error('❌ EXPORT: Export error:', error);
    }
  };

  // Filter change handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle view change
  const handleViewChange = (newView) => {
    console.log('🔄 TIMESHEET: Changing view from', currentView, 'to', newView);
    setCurrentView(newView);
    
    // Sync dates when switching views
    const currentDate = new Date();
    if (newView === 'daily') {
      setSelectedDate(currentDate);
    } else if (newView === 'weekly') {
      setSelectedWeek(currentDate);
    } else if (newView === 'monthly') {
      setSelectedMonth(currentDate);
    }
  };

  // Handle create entry
  const handleCreateEntry = (entryData) => {
    console.log('📝 TIMESHEET: Creating entry:', entryData);
    setShowEntryModal(true);
    if (entryData?.date) {
      setSelectedDate(new Date(entryData.date));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="timesheet-page">
        <div className="timesheet-loading">
          <div className="timesheet-loading-spinner"></div>
          <p>Loading timesheet...</p>
        </div>
      </div>
    );
  }

  // Authentication error state
  if (authError || !currentUser) {
    return (
      <div className="timesheet-page">
        <div className="timesheet-empty-state">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Authentication Required</h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            {authError || 'You need to be logged in to access the timesheet.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="timesheet-add-entry-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="timesheet-page">
      {/* Main Header with Title and Export */}
      <div className="timesheet-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1>Timesheets</h1>
          <button onClick={handleExport} className="timesheet-export-btn">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tabs Section */}
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

      {/* Show different content based on active tab */}
      {activeTab === 'timesheets' ? (
        <>
          {/* Controls Section */}
          <div className="timesheet-controls">
            <div className="timesheet-controls-row">
              {/* Left side - Welcome, View Selector, Date Navigation */}
              <div className="timesheet-controls-left">
                <div className="timesheet-welcome">
                  Welcome, <span className="timesheet-welcome-name">{currentUser.full_name || currentUser.email}</span>
                </div>

                <select
                  value={currentView}
                  onChange={(e) => handleViewChange(e.target.value)}
                  className="timesheet-view-selector"
                >
                  <option value="daily">Daily Timesheets</option>
                  <option value="weekly">Weekly Timesheets</option>
                  <option value="monthly">Monthly Timesheets</option>
                </select>

                {/* Date Navigation */}
                <div className="timesheet-date-nav">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="timesheet-date-btn"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="timesheet-date-display">
                    <Calendar size={16} />
                    <span>{formatDateDisplay()}</span>
                  </div>
                  
                  <button
                    onClick={() => navigateDate('next')}
                    className="timesheet-date-btn"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Right side - Campaign and Management Selectors */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <select
                  value={filters.campaign}
                  onChange={(e) => handleFilterChange('campaign', e.target.value)}
                  className="timesheet-filter-select"
                >
                  <option value="all">All Campaigns</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.managedBy}
                  onChange={(e) => handleFilterChange('managedBy', e.target.value)}
                  className="timesheet-filter-select"
                >
                  <option value="me">Managed by me</option>
                  <option value="all">All managers</option>
                  <option value="team">Team leads</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="timesheet-filters">
            <div className="timesheet-filters-row">
              {/* Left side - Filter Dropdowns */}
              <div className="timesheet-filters-left">
                <select
                  value={filters.payrollHours}
                  onChange={(e) => handleFilterChange('payrollHours', e.target.value)}
                  className="timesheet-filter-select"
                >
                  <option value="all">Payroll hours</option>
                  <option value="regular">Regular hours</option>
                  <option value="overtime">Overtime</option>
                  <option value="vacation">Vacation</option>
                </select>

                <select
                  value={filters.groups}
                  onChange={(e) => handleFilterChange('groups', e.target.value)}
                  className="timesheet-filter-select"
                >
                  <option value="all">Groups</option>
                  <option value="development">Development</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                </select>

                <select
                  value={filters.members}
                  onChange={(e) => handleFilterChange('members', e.target.value)}
                  className="timesheet-filter-select"
                >
                  <option value="all">Members</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={filters.schedules}
                  onChange={(e) => handleFilterChange('schedules', e.target.value)}
                  className="timesheet-filter-select"
                >
                  <option value="all">Schedules</option>
                  <option value="standard">Standard</option>
                  <option value="flexible">Flexible</option>
                </select>

                <button className="timesheet-add-filter">
                  <Plus size={16} />
                  <span>Add filter</span>
                </button>
              </div>

              {/* Right side - Search */}
              <div className="timesheet-search-container">
                <Search className="timesheet-search-icon" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="timesheet-search"
                />
              </div>
            </div>
          </div>

          {/* Main Content Area - Render Based on Current View */}
          <div style={{ flex: 1 }}>
            {currentView === 'daily' && (
              <DailyTimesheetView
                userId={currentUser?.id}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                searchQuery={searchQuery}
                filters={filters}
                onCreateEntry={handleCreateEntry}
              />
            )}

            {currentView === 'weekly' && (
              <WeeklyTimesheetView
                userId={currentUser?.id}
                selectedWeek={selectedWeek}
                onWeekChange={setSelectedWeek}
                onDayClick={handleDayClick}
                searchQuery={searchQuery}
                filters={filters}
                onCreateEntry={handleCreateEntry}
              />
            )}

            {currentView === 'monthly' && (
              <MonthlyTimesheetView
                userId={currentUser?.id}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                onDayClick={handleDayClick}
                searchQuery={searchQuery}
                filters={filters}
                onCreateEntry={handleCreateEntry}
              />
            )}
          </div>
        </>
      ) : (
        /* Approvals Tab Content */
        <TimesheetApprovalsView
          userId={currentUser?.id}
          searchQuery={searchQuery}
          filters={filters}
        />
      )}

      {/* Add Entry Modal */}
      {showEntryModal && (
        <TimesheetEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          userId={currentUser?.id}
          selectedDate={selectedDate}
          onSave={() => {
            setShowEntryModal(false);
            // Refresh current view data
          }}
        />
      )}

      {/* Floating Action Button for Adding Entries - Only show on timesheets tab */}
      {activeTab === 'timesheets' && (
        <button
          onClick={() => setShowEntryModal(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#ea580c',
            color: 'white',
            padding: '16px',
            borderRadius: '50%',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            zIndex: 50,
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ea580c'}
          title="Add new timesheet entry"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
};

export default TimesheetPage;

// Also export as TimesheetsPage for compatibility with existing imports
export { TimesheetPage as TimesheetsPage };

