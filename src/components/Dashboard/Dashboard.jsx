import { useState, useEffect } from 'react'

// Dashboard component with FULL WIDTH usage - no constraints
export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // FULL WIDTH STYLES - NO CONSTRAINTS
  const outerWrapperStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9FAFB',
    padding: 0, // NO padding
    margin: 0,  // NO margin
    overflow: 'auto'
  }

  const containerStyle = {
    width: '100%',
    padding: '24px', // Only internal padding
    boxSizing: 'border-box',
    minHeight: '100%'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    width: '100%'
  }

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    padding: '20px',
    marginBottom: '24px'
  }

  const headingStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0'
  }

  const subheadingStyle = {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 16px 0'
  }

  const captionStyle = {
    fontSize: '12px',
    color: '#9CA3AF'
  }

  // Welcome Header - Full Width
  const WelcomeHeader = () => (
    <div style={{
      ...cardStyle,
      gridColumn: '1 / -1', // Full width
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <div>
        <h1 style={headingStyle}>Hello admin@test.com</h1>
        <p style={subheadingStyle}>Here's what's happening at Eps</p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#3B82F6'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#10B981'
          }}></div>
        </div>
      </div>
      <div style={{
        width: '120px',
        height: '80px',
        backgroundColor: '#FEF3C7',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px'
      }}>
        👋
      </div>
    </div>
  )

  // Upcoming Holidays
  const UpcomingHolidays = () => (
    <div style={cardStyle}>
      <h3 style={headingStyle}>UPCOMING HOLIDAYS AND TIME OFF</h3>
      <div style={{
        backgroundColor: '#FEF3C7',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ fontSize: '24px' }}>🏖️</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#92400E' }}>
            Add your holiday calendar for reminders and overtime calculations.
          </p>
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              Set up Holidays
            </button>
            <button style={{
              backgroundColor: 'transparent',
              color: '#F59E0B',
              border: '1px solid #F59E0B',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              No, thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Tracked Hours
  const TrackedHours = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={headingStyle}>TRACKED HOURS</h3>
        <a href="#" style={{ color: '#3B82F6', fontSize: '14px', textDecoration: 'none' }}>
          Go to timesheets
        </a>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>WORKED HOURS</span>
          <span style={{ fontSize: '12px', color: '#111827', marginLeft: 'auto' }}>60h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6B7280' }}></div>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>0h 0m</span>
          <span style={{ fontSize: '12px', color: '#111827', marginLeft: 'auto' }}>60h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FBBF24' }}></div>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>OVERTIME HOURS</span>
          <span style={{ fontSize: '12px', color: '#111827', marginLeft: 'auto' }}>40h</span>
        </div>
      </div>

      {/* Weekly Chart */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <div key={day} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{day}</div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                {7 + index}
              </div>
              <div style={{
                height: '60px',
                backgroundColor: index < 5 ? '#9CA3AF' : '#D1D5DB',
                borderRadius: '4px',
                margin: '0 2px'
              }}></div>
            </div>
          ))}
        </div>
        <p style={captionStyle}>Does not include manually entered work hours</p>
      </div>
    </div>
  )

  // Activities
  const Activities = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={headingStyle}>ACTIVITIES</h3>
        <a href="#" style={{ color: '#3B82F6', fontSize: '14px', textDecoration: 'none' }}>
          Go to activities
        </a>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'conic-gradient(#9CA3AF 0deg 270deg, #E5E7EB 270deg 360deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>clocked</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>0h 0m</div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
          Top 10 activities
        </p>
        <p style={captionStyle}>No activities tracked yet</p>
      </div>
    </div>
  )

  // Who's In/Out
  const WhosInOut = () => (
    <div style={cardStyle}>
      <h3 style={headingStyle}>Who's In/Out</h3>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>0</div>
          <div style={captionStyle}>IN</div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>0</div>
          <div style={captionStyle}>OUT</div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>1</div>
          <div style={captionStyle}>BREAK</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={captionStyle}>
          {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
        <div style={captionStyle}>No previous entry</div>
      </div>
    </div>
  )

  return (
    <div style={outerWrapperStyle}>
      <div style={containerStyle}>
        <div style={gridStyle}>
          <WelcomeHeader />
          <UpcomingHolidays />
          <TrackedHours />
          <Activities />
          <WhosInOut />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

