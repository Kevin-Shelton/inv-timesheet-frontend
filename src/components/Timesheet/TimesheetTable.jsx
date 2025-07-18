export function TimesheetTable({ timesheets, users, currentWeek, searchTerm }) {
  const getWeekDays = (date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekDays = getWeekDays(currentWeek)
  
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getUserHoursForDay = (userId, date) => {
    const dateStr = date.toISOString().split('T')[0]
    const userEntries = timesheets.filter(
      entry => entry.user_id === userId && entry.date === dateStr
    )
    return userEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)
  }

  const getUserWeekTotal = (userId) => {
    return weekDays.reduce((total, day) => {
      return total + getUserHoursForDay(userId, day)
    }, 0)
  }

  return (
    <div className="timesheet-table-container">
      <table className="timesheet-table">
        <thead>
          <tr>
            <th className="user-column">
              <div className="column-header">
                <span>Name</span>
              </div>
            </th>
            <th className="day-column">
              <div className="column-header">
                <span>M</span>
                <span className="day-number">{weekDays[0]?.getDate()}</span>
              </div>
            </th>
            <th className="day-column">
              <div className="column-header">
                <span>T</span>
                <span className="day-number">{weekDays[1]?.getDate()}</span>
              </div>
            </th>
            <th className="day-column">
              <div className="column-header">
                <span>W</span>
                <span className="day-number">{weekDays[2]?.getDate()}</span>
              </div>
            </th>
            <th className="day-column">
              <div className="column-header">
                <span>T</span>
                <span className="day-number">{weekDays[3]?.getDate()}</span>
              </div>
            </th>
            <th className="day-column">
              <div className="column-header">
                <span>F</span>
                <span className="day-number">{weekDays[4]?.getDate()}</span>
              </div>
            </th>
            <th className="day-column">
              <div className="column-header">
                <span>S</span>
                <span className="day-number">{weekDays[5]?.getDate()}</span>
              </div>
            </th>
            <th className="day-column">
              <div className="column-header">
                <span>S</span>
                <span className="day-number">{weekDays[6]?.getDate()}</span>
              </div>
            </th>
            <th className="total-column">Total</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => {
            const weekTotal = getUserWeekTotal(user.id)
            
            return (
              <tr key={user.id} className="user-row">
                <td className="user-cell">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="user-name">{user.full_name}</span>
                  </div>
                </td>
                {weekDays.map((day, index) => {
                  const hours = getUserHoursForDay(user.id, day)
                  return (
                    <td key={index} className="hours-cell">
                      {hours > 0 ? (
                        <div className="hours-display">
                          {hours}h
                        </div>
                      ) : (
                        <div className="empty-hours">-</div>
                      )}
                    </td>
                  )
                })}
                <td className="total-cell">
                  <div className="total-hours">
                    {weekTotal > 0 ? `${weekTotal}h` : '-'}
                  </div>
                </td>
              </tr>
            )
          })}
          
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan="9" className="empty-state">
                <div className="empty-message">
                  <p>No users found matching your search.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {filteredUsers.length > 0 && (
        <div className="table-footer">
          <button className="create-entry-btn">
            Create a new entry
          </button>
        </div>
      )}
    </div>
  )
}

