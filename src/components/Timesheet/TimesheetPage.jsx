import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Search, Filter, Plus, Users, Clock, BarChart3 } from 'lucide-react';
import DailyTimesheetView from './DailyTimesheetView';
import WeeklyTimesheetView from './WeeklyTimesheetView';
import MonthlyTimesheetView from './MonthlyTimesheetView';
import TimesheetEntryModal from './TimesheetEntryModal';
import { supabaseApi } from "../../supabaseClient.js";

const TimesheetPage = () => {
  // State management
  const [currentView, setCurrentView] = useState('weekly'); // daily, weekly, monthly
  const [activeTab, setActiveTab] = useState('timesheets'); // timesheets, approvals
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
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

  // Initialize user data
  useEffect(() => {
    const initializeUser = async () => {
      console.log('🔍 TIMESHEET: Initializing user authentication...');
      
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
        setAuthError(null);
        setLoading(false);

      } catch (error) {
        console.error('❌ TIMESHEET: Initialization error:', error);
        setAuthError('Failed to initialize user: ' + error.message);
        setCurrentUser(null);
        setLoading(false);
      }
    };

    initializeUser();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timesheet...</p>
        </div>
      </div>
    );
  }

  // Authentication error state
  if (authError || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            {authError || 'You need to be logged in to access the timesheet.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('timesheets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timesheets'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Timesheets
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approvals'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Approvals
            </button>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Welcome, View Selector, Date Navigation */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{currentUser.full_name || currentUser.email}</span>
              </div>

              <select
                value={currentView}
                onChange={(e) => handleViewChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="daily">Daily Timesheets</option>
                <option value="weekly">Weekly Timesheets</option>
                <option value="monthly">Monthly Timesheets</option>
              </select>

              {/* Date Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-md">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{formatDateDisplay()}</span>
                </div>
                
                <button
                  onClick={() => navigateDate('next')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right side - Campaign and Management Selectors */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.campaign}
                onChange={(e) => handleFilterChange('campaign', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Campaigns</option>
                <option value="potions">Potions</option>
                <option value="divination">Divination Readings</option>
                <option value="herbology">Herbology</option>
              </select>

              <select
                value={filters.managedBy}
                onChange={(e) => handleFilterChange('managedBy', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="me">Managed by me</option>
                <option value="all">All managers</option>
                <option value="team">Team leads</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Filter Dropdowns */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.payrollHours}
                onChange={(e) => handleFilterChange('payrollHours', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Payroll hours</option>
                <option value="regular">Regular hours</option>
                <option value="overtime">Overtime</option>
                <option value="vacation">Vacation</option>
              </select>

              <select
                value={filters.groups}
                onChange={(e) => handleFilterChange('groups', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Groups</option>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
              </select>

              <select
                value={filters.members}
                onChange={(e) => handleFilterChange('members', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Members</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filters.schedules}
                onChange={(e) => handleFilterChange('schedules', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Schedules</option>
                <option value="standard">Standard</option>
                <option value="flexible">Flexible</option>
              </select>

              <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add filter</span>
              </button>
            </div>

            {/* Right side - Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Render Based on Current View */}
      <div className="flex-1">
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

      {/* Floating Action Button for Adding Entries */}
      <button
        onClick={() => setShowEntryModal(true)}
        className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-50"
        title="Add new timesheet entry"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default TimesheetPage;

// Also export as TimesheetsPage for compatibility with existing imports
export { TimesheetPage as TimesheetsPage };

