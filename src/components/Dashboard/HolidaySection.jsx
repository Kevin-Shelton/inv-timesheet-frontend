export function HolidaySection() {
  return (
    <div className="dashboard-page"><div className="holiday-section">
      <h3 className="sidebar-section-title">UPCOMING HOLIDAYS AND TIME OFF</h3>
      
      <div className="holiday-content">
        <div className="holiday-illustration">
          <div className="calendar-icon">
            📅
          </div>
        </div>
        
        <div className="holiday-text">
          <p className="holiday-message">
            Add your holiday calendar for<br />
            reminders and overtime calculations.
          </p>
        </div>
        
        <div className="holiday-actions">
          <button className="setup-holidays-btn">
            Set up Holidays
          </button>
          <button className="no-thanks-btn">
            No, thanks
          </button>
        </div>
      </div>
    </div>
  )
}

