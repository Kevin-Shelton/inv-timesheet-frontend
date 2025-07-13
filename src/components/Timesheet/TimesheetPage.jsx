import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Search, Filter, Plus, Users, Clock, BarChart3 } from 'lucide-react';

// Import components with error handling
let DailyTimesheetView, Enhanced_DailyTimesheetView, WeeklyTimesheetView, MonthlyTimesheetView, TimesheetEntryModal, TimesheetIndicators, StatusBadge, enhancedSupabaseApi;

try {
  DailyTimesheetView = require('./DailyTimesheetView').default;
} catch (e) {
  console.warn('DailyTimesheetView not found:', e);
}

try {
  Enhanced_DailyTimesheetView = require('./Enhanced_DailyTimesheetView').default;
} catch (e) {
  console.warn('Enhanced_DailyTimesheetView not found:', e);
}

try {
  WeeklyTimesheetView = require('./WeeklyTimesheetView').default;
} catch (e) {
  console.warn('WeeklyTimesheetView not found:', e);
}

try {
  MonthlyTimesheetView = require('./MonthlyTimesheetView').default;
} catch (e) {
  console.warn('MonthlyTimesheetView not found:', e);
}

try {
  TimesheetEntryModal = require('./TimesheetEntryModal').default;
} catch (e) {
  console.warn('TimesheetEntryModal not found:', e);
}

try {
  const indicators = require('./TimesheetIndicators');
  TimesheetIndicators = indicators.TimesheetIndicators;
  StatusBadge = indicators.StatusBadge;
} catch (e) {
  console.warn('TimesheetIndicators not found:', e);
}

try {
  enhancedSupabaseApi = require('../../lib/Enhanced_Supabase_API').default;
} catch (e) {
  console.warn('Enhanced_Supabase_API not found:', e);
}

const ComprehensiveTimesheetPage = () => {
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

  // Debug: Log current view changes
  useEffect(() => {
    console.log('Current view changed to:', currentView);
  }, [currentView]);

  // Initialize user data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (enhancedSupabaseApi) {
          const user = await enhancedSupabaseApi.getCurrentUser();
          setCurrentUser(user);
        } else {
          // Fallback user for testing
          setCurrentUser({ id: 1, full_name: 'Kevin Shelton' });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error initializing user:', error);
        // Fallback user for testing
        setCurrentUser({ id: 1, full_name: 'Kevin Shelton' });
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
    try {
      console.log('Exporting timesheet data...');
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Filter change handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle view change with debug logging
  const handleViewChange = (newView) => {
    console.log('Changing view from', currentView, 'to', newView);
    setCurrentView(newView);
  };

  // Simple fallback component for missing views
  const FallbackView = ({ viewName }) => (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {viewName} View
      </h2>
      <p className="text-gray-600 mb-4">
        Current view: <strong>{currentView}</strong>
      </p>
      <p className="text-gray-600">
        Component not loaded or has errors. Check console for details.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-6 py-2">
        <div className="text-sm text-yellow-800">
          <strong>Debug:</strong> Current View = {currentView} | User = {currentUser?.full_name || 'Loading...'}
        </div>
      </div>

      {/* Main Header with Tabs and Selectors */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Tabs */}
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('timesheets')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'timesheets'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Timesheets
              </button>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approvals'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Approvals
              </button>
            </div>

            {/* Right side - Selectors */}
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

      {/* Secondary Header with View Selector and Date Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - View Selector */}
            <div className="flex items-center space-x-4">
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

            {/* Right side - Export Button */}
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

      {/* Main Content Area */}
      <div className="flex-1">
        {currentView === 'daily' && (
          Enhanced_DailyTimesheetView ? (
            <Enhanced_DailyTimesheetView
              userId={currentUser?.id}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              searchQuery={searchQuery}
              filters={filters}
            />
          ) : (
            <FallbackView viewName="Daily" />
          )
        )}

        {currentView === 'weekly' && (
          WeeklyTimesheetView ? (
            <WeeklyTimesheetView
              userId={currentUser?.id}
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
              onDayClick={handleDayClick}
              searchQuery={searchQuery}
              filters={filters}
              onCreateEntry={(date) => {
                setSelectedDate(date);
                setShowEntryModal(true);
              }}
            />
          ) : (
            <FallbackView viewName="Weekly" />
          )
        )}

        {currentView === 'monthly' && (
          MonthlyTimesheetView ? (
            <MonthlyTimesheetView
              userId={currentUser?.id}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onDayClick={handleDayClick}
              searchQuery={searchQuery}
              filters={filters}
            />
          ) : (
            <FallbackView viewName="Monthly" />
          )
        )}
      </div>

      {/* Add Entry Modal */}
      {showEntryModal && TimesheetEntryModal && (
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
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ComprehensiveTimesheetPage;

// Also export as TimesheetsPage for compatibility with existing imports
export { ComprehensiveTimesheetPage as TimesheetsPage };

