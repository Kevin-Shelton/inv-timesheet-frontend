export function CurrentTime({ currentTime }) {
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="current-time-section">
      <div className="time-display">
        <div className="current-time">
          {formatTime(currentTime)}
        </div>
        <div className="current-date">
          {formatDate(currentTime)}
        </div>
        <div className="timezone">
          GMT+4
        </div>
      </div>
      
      <div className="time-note">
        No previous entry
      </div>
    </div>
  )
}

