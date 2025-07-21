import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Search, Filter, Plus, Users, Clock, BarChart3 } from 'lucide-react';
import { supabaseApi } from "../../supabaseClient.js";
import { useAuth } from '../../hooks/useAuth';

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
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access timesheets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Timesheets</h1>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Welcome and View Selector */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user.full_name || user.email}</span>
              </div>
              
              <select
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="weekly">Weekly Timesheets</option>
                <option value="daily">Daily Timesheets</option>
                <option value="monthly">Monthly Timesheets</option>
              </select>

              {/* Date Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-md">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{formatWeekDisplay()}</span>
                </div>
                
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right side - Export */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Filter Dropdowns */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.payrollHours}
                onChange={(e) => setFilters(prev => ({ ...prev, payrollHours: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Payroll hours</option>
                <option value="regular">Regular hours</option>
                <option value="overtime">Overtime</option>
              </select>

              <select
                value={filters.groups}
                onChange={(e) => setFilters(prev => ({ ...prev, groups: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Groups</option>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
              </select>

              <select
                value={filters.members}
                onChange={(e) => setFilters(prev => ({ ...prev, members: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Members</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filters.schedules}
                onChange={(e) => setFilters(prev => ({ ...prev, schedules: e.target.value }))}
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white">
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-gray-600">Loading timesheets...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      {/* Empty header for user names */}
                    </th>
                    {weekDates.map((date, index) => (
                      <th key={index} className="text-center py-3 px-4 font-medium text-gray-900 min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <div className="text-xs text-gray-500 uppercase">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                          </div>
                          <div className="text-sm">
                            {date.getDate()}
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-medium text-gray-900 min-w-[80px]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-500">
                        {searchQuery ? 'No users found matching your search.' : 'No timesheet data for this week.'}
                        <div className="mt-4">
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Time Entry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((userData, userIndex) => (
                      <tr key={userData.id || userIndex} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {(userData.full_name || userData.email || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {userData.full_name || userData.email || 'Unknown User'}
                              </div>
                            </div>
                          </div>
                        </td>
                        {weekDates.map((date, dateIndex) => (
                          <td key={dateIndex} className="text-center py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {getHoursForUserAndDate(userData.id, date)}
                            </div>
                          </td>
                        ))}
                        <td className="text-center py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getWeeklyTotalForUser(userData.id)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimesheetPage;

// Export both names for compatibility
export { TimesheetPage as TimesheetsPage };

