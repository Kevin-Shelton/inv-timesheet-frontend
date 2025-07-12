import { useState, useEffect } from 'react'
import { 
  Clock, 
  Calendar, 
  Users, 
  Activity,
  TrendingUp,
  MapPin,
  Settings,
  ExternalLink,
  BarChart3,
  PieChart
} from 'lucide-react'

// Current Time Component
function CurrentTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div className="dashboard-heading" style={{ 
        fontSize: '32px', 
        fontWeight: '700', 
        color: '#111827', 
        marginBottom: '4px' 
      }}>
        {timeString}
      </div>
      <div className="dashboard-subheading" style={{ 
        color: '#6B7280', 
        fontSize: '14px' 
      }}>
        {dateString}
      </div>
      <div className="dashboard-caption" style={{ 
        fontSize: '12px', 
        color: '#9CA3AF', 
        marginTop: '4px' 
      }}>
        No previous entry
      </div>
    </div>
  )
}

// Welcome Header Section
function WelcomeHeader() {
  return (
    <div className="dashboard-card dashboard-welcome-header" style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #E5E7EB',
      padding: '20px',
      marginBottom: '24px',
      gridColumn: '1 / -1'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 className="dashboard-heading" style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '4px'
          }}>
            Hello admin@test.com
          </h1>
          <p className="dashboard-subheading" style={{ 
            fontSize: '14px', 
            color: '#6B7280',
            margin: 0
          }}>
            Here's what's happening at Eps
          </p>
        </div>
        <div style={{
          width: '120px',
          height: '80px',
          background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          👋
        </div>
      </div>
      
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px',
          background: '#dbeafe',
          color: '#1e40af',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          <Activity size={12} />
          A
        </div>
      </div>
    </div>
  )
}

// Upcoming Holidays Section
function UpcomingHolidays() {
  return (
    <div className="dashboard-card dashboard-section" style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #E5E7EB',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        color: '#374151',
        marginBottom: '16px'
      }}>
        UPCOMING HOLIDAYS AND TIME OFF
      </h3>

      <div style={{ 
        background: '#fef3c7', 
        borderRadius: '8px', 
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ fontSize: '24px' }}>🏖️</div>
        <div style={{ flex: 1 }}>
          <div className="dashboard-subheading" style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '4px' 
          }}>
            Add your holiday calendar for reminders and overtime calculations.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '4px 12px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Set up Holidays
            </button>
            <button style={{
              padding: '4px 12px',
              background: 'none',
              color: '#f59e0b',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              No, thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tracked Hours Section
function TrackedHours() {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const weekDates = [7, 8, 9, 10, 11, 12, 13]

  return (
    <div className="dashboard-card dashboard-section" style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #E5E7EB',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#374151' 
        }}>
          TRACKED HOURS
        </h3>
        <a href="#" style={{ 
          color: '#3b82f6', 
          textDecoration: 'none', 
          fontSize: '14px', 
          fontWeight: '500' 
        }}>
          Go to timesheets
        </a>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#10b981' 
          }}></div>
          <span className="dashboard-subheading" style={{ fontSize: '14px', color: '#374151' }}>WORKED HOURS</span>
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>60h</span>
        </div>
        <div className="dashboard-caption" style={{ fontSize: '12px', color: '#6B7280' }}>0h 0m</div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginTop: '8px', 
          marginBottom: '8px' 
        }}>
          <div className="dashboard-bar-color" style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#9CA3AF' 
          }}></div>
          <span className="dashboard-subheading" style={{ fontSize: '14px', color: '#374151' }}>0h 0m</span>
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>60h</span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '16px' 
        }}>
          <div className="dashboard-overtime-color" style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#FBBF24' 
          }}></div>
          <span className="dashboard-subheading" style={{ fontSize: '14px', color: '#374151' }}>OVERTIME HOURS</span>
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>40h</span>
        </div>
        <div className="dashboard-caption" style={{ fontSize: '12px', color: '#6B7280' }}>0h 0m</div>
      </div>

      {/* Week Chart */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '8px',
          marginBottom: '8px'
        }}>
          {weekDays.map((day, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div className="dashboard-caption" style={{ 
                fontSize: '12px', 
                color: '#6B7280', 
                marginBottom: '4px' 
              }}>
                {day}
              </div>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                marginBottom: '8px' 
              }}>
                {weekDates[index]}
              </div>
              <div className="dashboard-break-color" style={{
                height: '60px',
                background: '#D1D5DB',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Sample data bars using spec colors */}
                {index < 5 && (
                  <div className="dashboard-bar-color" style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${Math.random() * 80 + 20}%`,
                    background: '#9CA3AF',
                    borderRadius: '4px 4px 0 0'
                  }}></div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="dashboard-caption" style={{ 
          fontSize: '12px', 
          color: '#9CA3AF', 
          textAlign: 'center' 
        }}>
          Does not include manually entered work hours
        </div>
      </div>
    </div>
  )
}

// Activities Section
function Activities() {
  return (
    <div className="dashboard-card dashboard-section" style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #E5E7EB',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#374151' 
        }}>
          ACTIVITIES
        </h3>
        <a href="#" style={{ 
          color: '#3b82f6', 
          textDecoration: 'none', 
          fontSize: '14px', 
          fontWeight: '500' 
        }}>
          Go to activities
        </a>
      </div>

      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 16px',
          position: 'relative'
        }}>
          {/* Donut Chart */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="20"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="20"
              strokeDasharray="283"
              strokeDashoffset="70"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div className="dashboard-caption" style={{ 
              fontSize: '12px', 
              color: '#9CA3AF' 
            }}>
              clocked
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600' 
            }}>
              0h 0m
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div className="dashboard-subheading" style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '4px' 
          }}>
            Top 10 activities
          </div>
          <div className="dashboard-caption" style={{ 
            fontSize: '12px', 
            color: '#9CA3AF' 
          }}>
            No activities tracked yet
          </div>
        </div>
      </div>
    </div>
  )
}

// Who's In/Out Section
function WhosInOut() {
  return (
    <div className="dashboard-card dashboard-section" style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #E5E7EB',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#374151' 
        }}>
          Who's In/Out
        </h3>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div className="dashboard-heading" style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#111827' 
          }}>
            0
          </div>
          <div className="dashboard-caption" style={{ 
            fontSize: '12px', 
            color: '#9CA3AF', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>
            IN
          </div>
        </div>
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div className="dashboard-heading" style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#111827' 
          }}>
            0
          </div>
          <div className="dashboard-caption" style={{ 
            fontSize: '12px', 
            color: '#9CA3AF', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>
            OUT
          </div>
        </div>
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div className="dashboard-heading" style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#111827' 
          }}>
            1
          </div>
          <div className="dashboard-caption" style={{ 
            fontSize: '12px', 
            color: '#9CA3AF', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>
            BREAK
          </div>
        </div>
      </div>

      <CurrentTimeDisplay />
    </div>
  )
}

// Main Dashboard Component - With CSS Classes for Override Protection
export function Dashboard() {
  return (
    // Outer wrapper with CSS class for override protection
    <div className="dashboard-outer-wrapper" style={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      padding: '24px',
      boxSizing: 'border-box',
      backgroundColor: '#F9FAFB'
    }}>
      {/* Container with CSS class for override protection */}
      <div className="dashboard-inner-container" style={{
        width: '100%',
        maxWidth: '1280px',
        padding: '0 24px',
        boxSizing: 'border-box'
      }}>
        {/* Grid with CSS class for override protection */}
        <div className="dashboard-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {/* Sections in order as specified in JSON */}
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

// Also provide a default export for compatibility
export default Dashboard

