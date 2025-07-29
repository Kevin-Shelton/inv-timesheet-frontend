import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

// Dashboard component with REAL DATA from database
export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dashboardData, setDashboardData] = useState({
    user: null,
    weeklyStats: {
      totalHours: 0,
      approvedHours: 0,
      overtimeHours: 0,
      breakHours: 0,
      activeUsers: 0,
      weekRange: ''
    },
    weeklyChart: [],
    activities: {
      totalClocked: 0,
      breakdown: []
    },
    loading: true,
    error: null
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log('📊 DASHBOARD: Fetching real data from database...')
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Get user profile
      let userProfile = null
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!profileError) {
          userProfile = profile
        }
      }

      // Get recent timesheet data - ONLY select columns that exist
      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheet_entries')
        .select(`
          date,
          hours_worked,
          total_hours,
          regular_hours,
          status,
          user_id,
          users!timesheet_entries_user_id_fkey (
            id,
            full_name,
            role
          )
        `)
        .order('date', { ascending: false })
        .limit(200)

      if (timesheetError) {
        console.error('Error fetching timesheet data:', timesheetError)
        throw timesheetError
      }

      console.log('📊 DASHBOARD: Found', timesheetData?.length || 0, 'timesheet entries')

      // Process the data
      const processedData = processTimesheetData(timesheetData || [], userProfile)
      
      setDashboardData({
        user: userProfile || user,
        weeklyStats: processedData.weeklyStats,
        weeklyChart: processedData.weeklyChart,
        activities: processedData.activities,
        loading: false,
        error: null
      })

      console.log('📊 DASHBOARD: Data processed successfully', processedData.weeklyStats)

    } catch (error) {
      console.error('📊 DASHBOARD: Error fetching data:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  const processTimesheetData = (data, user) => {
    if (!data || data.length === 0) {
      return {
        weeklyStats: {
          totalHours: 0,
          approvedHours: 0,
          overtimeHours: 0,
          breakHours: 0,
          activeUsers: 0,
          weekRange: 'No data available'
        },
        weeklyChart: [],
        activities: { totalClocked: 0, breakdown: [] }
      }
    }

    // Find the most recent week with data
    const latestDate = new Date(data[0].date)
    const weekStart = new Date(latestDate)
    weekStart.setDate(latestDate.getDate() - latestDate.getDay()) // Start of week (Sunday)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // End of week (Saturday)

    // Filter data for the most recent week
    const weekData = data.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    // Calculate hours using COALESCE logic
    const calculateHours = (entry) => {
      return entry.hours_worked || entry.total_hours || entry.regular_hours || 0
    }

    // Calculate weekly statistics
    const uniqueUsers = new Set()
    let totalHours = 0
    let approvedHours = 0
    let overtimeHours = 0
    let breakHours = 0

    weekData.forEach(entry => {
      const hours = calculateHours(entry)
      if (hours > 0) {
        totalHours += hours
        uniqueUsers.add(entry.user_id)
        
        if (entry.status === 'approved') {
          approvedHours += hours
        }
        
        // These columns might not exist, so use 0 as fallback
        overtimeHours += entry.overtime_hours || 0
        breakHours += entry.break_hours || 0
      }
    })

    // Create weekly chart data
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const weeklyChart = []

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart)
      currentDate.setDate(weekStart.getDate() + i)
      
      const dayEntries = weekData.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate.toDateString() === currentDate.toDateString()
      })

      let dayHours = 0
      let dayOvertime = 0
      let dayBreaks = 0
      const dayUsers = new Set()

      dayEntries.forEach(entry => {
        const hours = calculateHours(entry)
        if (hours > 0) {
          dayHours += hours
          dayOvertime += entry.overtime_hours || 0
          dayBreaks += entry.break_hours || 0
          dayUsers.add(entry.user_id)
        }
      })

      weeklyChart.push({
        day: days[i].substring(0, 1), // M, T, W, etc.
        date: currentDate.getDate(),
        hours: dayHours,
        overtime: dayOvertime,
        breaks: dayBreaks,
        userCount: dayUsers.size
      })
    }

    // Format week range
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      })
    }

    const weekRange = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`

    return {
      weeklyStats: {
        totalHours: Math.round(totalHours * 10) / 10,
        approvedHours: Math.round(approvedHours * 10) / 10,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
        breakHours: Math.round(breakHours * 10) / 10,
        activeUsers: uniqueUsers.size,
        weekRange
      },
      weeklyChart,
      activities: {
        totalClocked: Math.round(totalHours * 10) / 10,
        breakdown: [
          { name: 'Work', hours: totalHours - overtimeHours, color: '#10B981' },
          { name: 'Overtime', hours: overtimeHours, color: '#FBBF24' }
        ]
      }
    }
  }

  const formatHours = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`
  }

  // FULL WIDTH STYLES - NO CONSTRAINTS
  const outerWrapperStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9FAFB',
    padding: 0,
    margin: 0,
    overflow: 'auto'
  }

  const containerStyle = {
    width: '100%',
    padding: '24px',
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

  // Welcome Header - Full Width with REAL DATA
  const WelcomeHeader = () => (
    <div style={{
      ...cardStyle,
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <div>
        <h1 style={headingStyle}>
          Hello {dashboardData.user?.full_name || dashboardData.user?.email || 'User'}
        </h1>
        <p style={subheadingStyle}>Here's what's happening at your organization</p>
        
        {/* REAL STATISTICS */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
              {formatHours(dashboardData.weeklyStats.totalHours)}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Total Hours</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
              {formatHours(dashboardData.weeklyStats.approvedHours)}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Approved</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
              {dashboardData.weeklyStats.activeUsers}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Active Users</div>
          </div>
        </div>
        
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#6B7280' }}>
          Week of {dashboardData.weeklyStats.weekRange}
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

  // Tracked Hours with REAL DATA
  const TrackedHours = () => {
    const maxHours = Math.max(...dashboardData.weeklyChart.map(day => day.hours), 8)
    
    return (
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
            <span style={{ fontSize: '12px', color: '#111827', marginLeft: 'auto' }}>
              {formatHours(dashboardData.weeklyStats.totalHours)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6B7280' }}></div>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>BREAK TIME</span>
            <span style={{ fontSize: '12px', color: '#111827', marginLeft: 'auto' }}>
              {formatHours(dashboardData.weeklyStats.breakHours)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FBBF24' }}></div>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>OVERTIME HOURS</span>
            <span style={{ fontSize: '12px', color: '#111827', marginLeft: 'auto' }}>
              {formatHours(dashboardData.weeklyStats.overtimeHours)}
            </span>
          </div>
        </div>

        {/* REAL Weekly Chart */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            {dashboardData.weeklyChart.map((day, index) => (
              <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{day.day}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                  {day.date}
                </div>
                <div style={{
                  height: '60px',
                  backgroundColor: day.hours > 0 ? '#10B981' : '#D1D5DB',
                  borderRadius: '4px',
                  margin: '0 2px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}>
                  {day.hours > 0 && (
                    <div style={{
                      height: `${(day.hours / maxHours) * 100}%`,
                      backgroundColor: '#10B981',
                      borderRadius: '4px',
                      minHeight: '4px'
                    }}></div>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>
                  {formatHours(day.hours)}
                </div>
              </div>
            ))}
          </div>
          <p style={captionStyle}>Real timesheet data from database</p>
        </div>
      </div>
    )
  }

  // Activities with REAL DATA
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
          background: dashboardData.activities.totalClocked > 0 
            ? 'conic-gradient(#10B981 0deg 270deg, #E5E7EB 270deg 360deg)'
            : 'conic-gradient(#E5E7EB 0deg 360deg)',
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
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              {formatHours(dashboardData.activities.totalClocked)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
          {dashboardData.weeklyStats.activeUsers} active team member{dashboardData.weeklyStats.activeUsers !== 1 ? 's' : ''}
        </p>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
          {formatHours(dashboardData.weeklyStats.totalHours)} total hours this week
        </p>
      </div>
    </div>
  )

  // Upcoming Holidays (unchanged)
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

  if (dashboardData.loading) {
    return (
      <div style={outerWrapperStyle}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#6B7280' }}>Loading dashboard data...</div>
          </div>
        </div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div style={outerWrapperStyle}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#EF4444', marginBottom: '16px' }}>
              Error loading dashboard: {dashboardData.error}
            </div>
            <button 
              onClick={fetchDashboardData}
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={outerWrapperStyle}>
      <div style={containerStyle}>
        <div style={gridStyle}>
          <WelcomeHeader />
          <TrackedHours />
          <Activities />
          <UpcomingHolidays />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

