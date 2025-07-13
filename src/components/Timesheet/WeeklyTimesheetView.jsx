import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { TimesheetIndicators, StatusBadge, ProjectBadge } from './TimesheetIndicators';
import enhancedSupabaseApi from '../../lib/Enhanced_Supabase_API';

const WeeklyTimesheetView = ({ 
  userId, 
  selectedWeek, 
  onWeekChange, 
  onDayClick, 
  searchQuery = '', 
  filters = {},
  onCreateEntry 
}) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Get the start of the week (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Generate week dates
  const getWeekDates = () => {
    const weekStart = getWeekStart(selectedWeek);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await enhancedSupabaseApi.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
        // Set default user if API fails
        setCurrentUser({ full_name: 'Kevin Shelton' });
      }
    };

    loadUserData();
  }, []);

  // Load weekly timesheet data
  useEffect(() => {
    const loadWeeklyData = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const startDate = weekDates[0];
        const endDate = weekDates[6];
        
        const data = await enhancedSupabaseApi.getTimesheetEntries({
          userId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          includeUserDetails: true,
          includeCampaignDetails: true
        });

        // Group data by date
        const groupedData = {};
        weekDates.forEach(date => {
          const dateStr = date.toISOString().split('T')[0];
          groupedData[dateStr] = data.filter(entry => 
            entry.date === dateStr
          );
        });

        setWeeklyData(groupedData);
      } catch (error) {
        console.error('Error loading weekly data:', error);
        setWeeklyData({});
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyData();
  }, [userId, selectedWeek]);

  // Calculate daily totals
  const getDayTotals = (dateStr) => {
    const entries = weeklyData[dateStr] || [];
    if (entries.length === 0) return { regular: 0, overtime: 0, total: 0 };

    const totals = entries.reduce((acc, entry) => {
      acc.regular += entry.regular_hours || 0;
      acc.overtime += entry.overtime_hours || 0;
      return acc;
    }, { regular: 0, overtime: 0 });

    totals.total = totals.regular + totals.overtime;
    return totals;
  };

  // Calculate weekly totals
  const getWeeklyTotals = () => {
    return weekDates.reduce((acc, date) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayTotals = getDayTotals(dateStr);
      acc.regular += dayTotals.regular;
      acc.overtime += dayTotals.overtime;
      acc.total += dayTotals.total;
      return acc;
    }, { regular: 0, overtime: 0, total: 0 });
  };

  // Handle cell click
  const handleCellClick = (date) => {
    if (onDayClick) {
      onDayClick(date);
    }
  };

  // Handle create entry
  const handleCreateEntry = (date, event) => {
    event.stopPropagation();
    if (onCreateEntry) {
      onCreateEntry(date);
    }
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weeklyTotals = getWeeklyTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Search Bar - Full width spanning the table */}
      <div className="border-b border-gray-200">
        <div className="flex items-center">
          {/* Search section */}
          <div className="flex-1 px-6 py-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                readOnly
              />
            </div>
          </div>
          
          {/* Column headers aligned with table */}
          <div className="flex">
            {weekDates.map((date, index) => (
              <div key={date.toISOString()} className="w-24 text-center py-4 px-2">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium text-gray-500">{dayLabels[index]}</span>
                  <span className={`text-lg font-semibold ${isToday(date) ? 'text-orange-500' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </span>
                </div>
              </div>
            ))}
            <div className="w-24 text-center py-4 px-2">
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Timesheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Data Row */}
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              {/* Employee Name Column */}
              <td className="py-4 px-6 w-64">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'K'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {currentUser?.full_name || 'Kevin Shelton'}
                    </div>
                  </div>
                </div>
              </td>

              {/* Daily Columns */}
              {weekDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayTotals = getDayTotals(dateStr);
                const entries = weeklyData[dateStr] || [];
                const cellKey = `${dateStr}`;
                const hasEntries = entries.length > 0;

                return (
                  <td 
                    key={dateStr}
                    className="py-4 px-2 text-center cursor-pointer relative group w-24"
                    onClick={() => handleCellClick(date)}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {hasEntries ? (
                      <div className="space-y-1">
                        {/* Hours display */}
                        <div className="text-sm">
                          {dayTotals.total > 0 ? (
                            <div className="text-gray-900">
                              {dayTotals.total.toFixed(1)}h
                            </div>
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">-</div>
                    )}

                    {/* Plus Icon on Hover */}
                    {hoveredCell === cellKey && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                        <button
                          onClick={(e) => handleCreateEntry(date, e)}
                          className="p-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>
                );
              })}

              {/* Total Column */}
              <td className="py-4 px-2 text-center w-24">
                <div className="text-sm">
                  {weeklyTotals.total > 0 ? (
                    <div className="text-gray-900 font-medium">
                      {weeklyTotals.total.toFixed(1)}h
                    </div>
                  ) : (
                    <div className="text-gray-400">-</div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyTimesheetView;

