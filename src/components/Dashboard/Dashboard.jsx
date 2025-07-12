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

// Time Display Component
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
      <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
        {timeString}
      </div>
      <div style={{ color: '#6b7280', fontSize: '14px' }}>
        {dateString}
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        No previous entry
      </div>
    </div>
  )
}

// Chart Placeholder Component
function ChartPlaceholder({ title, type = 'bar' }) {
  return (
    <div style={{
      width: '100%',
      height: '200px',
      background: '#f9fafb',
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280',
      fontSize: '14px',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {type === 'bar' ? <BarChart3 size={32} /> : <PieChart size={32} />}
      <div>{title}</div>
    </div>
  )
}

// Tracked Hours Component
function TrackedHoursSection() {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const weekDates = [7, 8, 9, 10, 11, 12, 13]

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      height: 'fit-content'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
          TRACKED HOURS
        </h3>
        <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          Go to timesheets
        </a>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#10b981' 
          }}></div>
          <span style={{ fontSize: '14px', color: '#374151' }}>WORKED HOURS</span>
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>60h</span>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>0h 0m</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginBottom: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#6b7280' 
          }}></div>
          <span style={{ fontSize: '14px', color: '#374151' }}>0h 0m</span>
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>60h</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#f59e0b' 
          }}></div>
          <span style={{ fontSize: '14px', color: '#374151' }}>OVERTIME HOURS</span>
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>40h</span>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>0h 0m</div>
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
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{day}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>{weekDates[index]}</div>
              <div style={{
                height: '60px',
                background: '#e5e7eb',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Sample data bars */}
                {index < 5 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${Math.random() * 80 + 20}%`,
                    background: '#94a3b8',
                    borderRadius: '4px 4px 0 0'
                  }}></div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
          Does not include manually entered work hours
        </div>
      </div>
    </div>
  )
}

// Activities Section
function ActivitiesSection() {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      height: 'fit-content'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
          ACTIVITIES
        </h3>
        <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
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
              stroke="#e5e7eb"
              strokeWidth="20"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#6b7280"
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
            <div style={{ fontSize: '12px', color: '#6b7280' }}>clocked</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>0h 0m</div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            Top 10 activities
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            No activities tracked yet
          </div>
        </div>
      </div>
    </div>
  )
}

// Holidays Section
function HolidaysSection() {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      height: 'fit-content'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
          UPCOMING HOLIDAYS AND TIME OFF
        </h3>
      </div>

      <div style={{ 
        background: '#fef3c7', 
        borderRadius: '8px', 
        padding: '16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ fontSize: '24px' }}>🏖️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
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

// Who's In/Out Section
function WhosInOutSection() {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      height: 'fit-content'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
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
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>0</div>
          <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            IN
          </div>
        </div>
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>0</div>
          <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            OUT
          </div>
        </div>
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>1</div>
          <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            BREAK
          </div>
        </div>
      </div>

      <CurrentTimeDisplay />
    </div>
  )
}

// Main Dashboard Component - FULL WIDTH VERSION
export function Dashboard() {
  return (
    <div style={{ 
      width: '100%',
      padding: '0',
      margin: '0'
    }}>
      {/* Welcome Section - Full Width */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
              Hello admin@test.com
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Here's what's happening at Eps
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ marginBottom: '16px' }}>
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
      </div>

      {/* Stats Grid - Full Width with Better Spacing */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        width: '100%'
      }}>
        <TrackedHoursSection />
        <ActivitiesSection />
        <HolidaysSection />
        <WhosInOutSection />
      </div>
    </div>
  )
}

// Also provide a default export for compatibility
export default Dashboard

