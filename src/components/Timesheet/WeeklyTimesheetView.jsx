import React, { useState, useEffect } from 'react';
import enhancedSupabaseApi from '../../lib/Enhanced_Supabase_API';

const WeeklyTimesheetView = ({ 
  selectedWeek, 
  onCreateEntry, 
  onEditEntry,
  searchTerm = '',
  filters = {}
}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [timesheetData, setTimesheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Get week dates
  const getWeekDates = (weekStart) => {
    const dates = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);
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
        setCurrentUser({ 
          id: 'default-user',
          full_name: 'Kevin Shelton',
          email: 'kevin@example.com'
        });
      }
    };

    loadUserData();
  }, []);

  // Load timesheet data
  useEffect(() => {
    const loadTimesheetData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const startDate = weekDates[0];
        const endDate = weekDates[6];
        
        const entries = await enhancedSupabaseApi.getTimesheetEntries({
          userId: currentUser.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
        
        setTimesheetData(entries || []);
      } catch (error) {
        console.error('Error loading timesheet data:', error);
        setTimesheetData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimesheetData();
  }, [currentUser, selectedWeek]);

  // Get hours for a specific date
  const getHoursForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = timesheetData.filter(entry => 
      entry.date === dateStr
    );
    
    if (dayEntries.length === 0) return null;
    
    const totalHours = dayEntries.reduce((sum, entry) => {
      return sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0);
    }, 0);
    
    return totalHours > 0 ? totalHours.toFixed(1) : null;
  };

  // Get total hours for the week
  const getWeeklyTotal = () => {
    const total = weekDates.reduce((sum, date) => {
      const hours = getHoursForDate(date);
      return sum + (hours ? parseFloat(hours) : 0);
    }, 0);
    
    return total > 0 ? total.toFixed(1) : '0.0';
  };

  // Handle cell click for creating new entry
  const handleCellClick = (date, event) => {
    if (event.target.closest('.plus-icon')) {
      // Plus icon was clicked
      if (onCreateEntry) {
        onCreateEntry({
          date: date.toISOString().split('T')[0],
          userId: currentUser?.id
        });
      }
    }
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return 'K';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading timesheet data...</p>
      </div>
    );
  }

  return (
    <div className="jibble-timesheet">
      {/* Search Container */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={searchTerm}
          readOnly
        />
      </div>

      {/* Timesheet Table */}
      <div className="timesheet-table-container">
        <table className="timesheet-table">
          <thead>
            <tr>
              <th className="name-column"></th>
              {weekDates.map((date, index) => (
                <th key={index} className="day-column">
                  <div className="day-header">
                    <div className={`day-name ${isToday(date) ? 'text-orange-500' : ''}`}>
                      {dayLabels[index]}
                    </div>
                    <div className={`day-number ${isToday(date) ? 'text-orange-500 font-bold' : ''}`}>
                      {date.getDate()}
                    </div>
                  </div>
                </th>
              ))}
              <th className="total-column">
                <div className="day-header">
                  <div className="day-name">TOTAL</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="user-row">
              {/* User Name Cell */}
              <td className="name-cell">
                <div className="user-info">
                  <div className="user-avatar">
                    {getUserInitials(currentUser?.full_name)}
                  </div>
                  <div className="user-name">
                    {currentUser?.full_name || 'Kevin Shelton'}
                  </div>
                </div>
              </td>
              
              {/* Daily Hours Cells */}
              {weekDates.map((date, index) => {
                const hours = getHoursForDate(date);
                const cellKey = `${date.toISOString().split('T')[0]}`;
                const isHovered = hoveredCell === cellKey;
                
                return (
                  <td 
                    key={index} 
                    className="day-cell"
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={(e) => handleCellClick(date, e)}
                  >
                    {hours ? (
                      <div className="hours-display">{hours}h</div>
                    ) : (
                      <div className="empty-cell">-</div>
                    )}
                    
                    {/* Plus Icon on Hover */}
                    {isHovered && (
                      <div 
                        className="plus-icon"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '24px',
                          height: '24px',
                          backgroundColor: '#FB923C',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          zIndex: 10,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        +
                      </div>
                    )}
                  </td>
                );
              })}
              
              {/* Total Cell */}
              <td className="total-cell">
                <div className="hours-display">{getWeeklyTotal()}h</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {timesheetData.length === 0 && (
        <div className="empty-state">
          <p>No timesheet data for Sat, Jul 12</p>
          <button 
            className="create-entry-btn"
            onClick={() => onCreateEntry && onCreateEntry({
              date: new Date().toISOString().split('T')[0],
              userId: currentUser?.id
            })}
          >
            + Add Time Entry
          </button>
        </div>
      )}
    </div>
  );
};

export default WeeklyTimesheetView;

