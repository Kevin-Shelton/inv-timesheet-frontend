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

  // Get first in and last out times for a day
  const getDayTimes = (dateStr) => {
    const entries = weeklyData[dateStr] || [];
    if (entries.length === 0) return { firstIn: null, lastOut: null };

    const times = entries.reduce((acc, entry) => {
      if (entry.time_in) {
        const timeIn = new Date(`${entry.date}T${entry.time_in}`);
        if (!acc.firstIn || timeIn < acc.firstIn) {
          acc.firstIn = timeIn;
        }
      }
      if (entry.time_out) {
        const timeOut = new Date(`${entry.date}T${entry.time_out}`);
        if (!acc.lastOut || timeOut > acc.lastOut) {
          acc.lastOut = timeOut;
        }
      }
      return acc;
    }, { firstIn: null, lastOut: null });

    return {
      firstIn: times.firstIn ? times.firstIn.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }) : null,
      lastOut: times.lastOut ? times.lastOut.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }) : null
    };
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

  // Check if date is weekend
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
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
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            readOnly
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Weekly Timesheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-6 font-medium text-gray-500 w-48">
                {/* Empty header for name column */}
              </th>
              {weekDates.map((date, index) => (
                <th key={date.toISOString()} className="text-center py-3 px-4 font-medium text-gray-500 min-w-[120px]">
                  <div className="flex flex-col items-center">
                    <span className="text-sm">{dayLabels[index]}</span>
                    <span className={`text-lg font-semibold ${isToday(date) ? 'text-orange-500' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </span>
                  </div>
                </th>
              ))}
              <th className="text-center py-3 px-4 font-medium text-gray-500 min-w-[100px]">
                Total
              </th>
            </tr>
          </thead>

          {/* Data Row */}
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              {/* Employee Name Column */}
              <td className="py-4 px-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
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
                const dayTimes = getDayTimes(dateStr);
                const entries = weeklyData[dateStr] || [];
                const cellKey = `${dateStr}`;
                const hasEntries = entries.length > 0;

                return (
                  <td 
                    key={dateStr}
                    className={`py-4 px-4 text-center cursor-pointer relative group ${
                      isWeekend(date) ? 'bg-gray-50' : ''
                    } ${isToday(date) ? 'bg-orange-50' : ''}`}
                    onClick={() => handleCellClick(date)}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {hasEntries ? (
                      <div className="space-y-1">
                        {/* First In / Last Out */}
                        {(dayTimes.firstIn || dayTimes.lastOut) && (
                          <div className="text-xs text-gray-600">
                            {dayTimes.firstIn && (
                              <div>In: {dayTimes.firstIn}</div>
                            )}
                            {dayTimes.lastOut && (
                              <div>Out: {dayTimes.lastOut}</div>
                            )}
                          </div>
                        )}
                        
                        {/* Hours */}
                        <div className="text-sm">
                          {dayTotals.regular > 0 && (
                            <div className="text-gray-900">
                              {dayTotals.regular.toFixed(1)}h
                            </div>
                          )}
                          {dayTotals.overtime > 0 && (
                            <div className="text-orange-600">
                              +{dayTotals.overtime.toFixed(1)}h OT
                            </div>
                          )}
                        </div>

                        {/* Status Indicators */}
                        {entries.length > 0 && (
                          <div className="flex justify-center">
                            <StatusBadge status={entries[0].status} size="sm" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">-</div>
                    )}

                    {/* Plus Icon on Hover */}
                    {hoveredCell === cellKey && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                        <button
                          onClick={(e) => handleCreateEntry(date, e)}
                          className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                );
              })}

              {/* Total Column */}
              <td className="py-4 px-4 text-center bg-gray-50">
                <div className="space-y-1">
                  {weeklyTotals.regular > 0 && (
                    <div className="text-sm font-medium text-gray-900">
                      {weeklyTotals.regular.toFixed(1)}h
                    </div>
                  )}
                  {weeklyTotals.overtime > 0 && (
                    <div className="text-sm font-medium text-orange-600">
                      +{weeklyTotals.overtime.toFixed(1)}h OT
                    </div>
                  )}
                  {weeklyTotals.total > 0 && (
                    <div className="text-xs text-gray-500 border-t pt-1">
                      Total: {weeklyTotals.total.toFixed(1)}h
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Weekly Summary */}
      {weeklyTotals.total > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Week Total:</span>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {weeklyTotals.total.toFixed(1)} hours
              </div>
              {weeklyTotals.overtime > 0 && (
                <div className="text-sm text-orange-600">
                  Including {weeklyTotals.overtime.toFixed(1)}h overtime
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyTimesheetView;

