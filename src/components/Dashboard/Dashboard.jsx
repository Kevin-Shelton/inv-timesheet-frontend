import { useState, useEffect } from 'react'
import { supabase } from '@/supabaseClient'

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
    projects: {
      totalProjects: 0,
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

      // Get recent timesheet data
      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheet_entries')
        .select(`
          date,
          hours_worked,
          total_hours,
          regular_hours,
          status,
          user_id,
          activity,
          project,
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
        projects: processedData.projects,
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
        activities: { totalClocked: 0, breakdown: [] },
        projects: { totalProjects: 0, breakdown: [] }
      }
    }

    // Find the most recent week with data
    const latestDate = new Date(data[0].date)
    const weekStart = new Date(latestDate)
    weekStart.setDate(latestDate.getDate() - latestDate.getDay())
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

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
      const dayUsers = new Set()

      dayEntries.forEach(entry => {
        const hours = calculateHours(entry)
        if (hours > 0) {
          dayHours += hours
          dayUsers.add(entry.user_id)
        }
      })

      weeklyChart.push({
        day: days[i].substring(0, 1),
        date: currentDate.getDate(),
        hours: dayHours,
        userCount: dayUsers.size
      })
    }

    // Process activities
    const activityMap = new Map()
    weekData.forEach(entry => {
      const hours = calculateHours(entry)
      if (hours > 0 && entry.activity) {
        const current = activityMap.get(entry.activity) || 0
        activityMap.set(entry.activity, current + hours)
      }
    })

    const activities = {
      totalClocked: totalHours,
      breakdown: Array.from(activityMap.entries()).map(([name, hours], index) => ({
        name,
        hours,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
      })).sort((a, b) => b.hours - a.hours)
    }

    // Process projects
    const projectMap = new Map()
    weekData.forEach(entry => {
      const hours = calculateHours(entry)
      if (hours > 0 && entry.project) {
        const current = projectMap.get(entry.project) || 0
        projectMap.set(entry.project, current + hours)
      }
    })

    const projects = {
      totalProjects: projectMap.size,
      breakdown: Array.from(projectMap.entries()).map(([name, hours], index) => ({
        name,
        hours,
        color: ['#6366F1', '#EC4899', '#14B8A6', '#F97316', '#84CC16'][index % 5]
      })).sort((a, b) => b.hours - a.hours)
    }

    const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

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
      activities,
      projects
    }
  }

  const formatHours = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`
  }

  // STYLING
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

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    padding: '20px',
    marginBottom: '24px'
  }

  const headingStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0'
  }

  // PURPLE GRADIENT HEADER WITH REAL DATA
  const WelcomeHeader = () => (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '32px',
      color: 'white',
      marginBottom: '24px'
    }}>
      {/* Top Row - Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}>
            <option>📅 Day</option>
          </select>
          <select style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}>
            <option>👥 All campaigns</option>
          </select>
          <select style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}>
            <option>📍 All locations</option>
          </select>
          <select style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}>
            <option>👥 All groups</option>
          </select>
          <select style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}>
            <option>🕐 All schedules</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            backgroundColor: '#F97316',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Day
          </button>
          <button style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'white',
            fontSize: '14px'
          }}>
            Week
          </button>
          <button style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'white',
            fontSize: '14px'
          }}>
            Month
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        color: '#111827'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3B82F6', marginBottom: '4px' }}>
            {formatHours(dashboardData.weeklyStats.totalHours)}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '2px' }}>Your Hours</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981', marginBottom: '4px' }}>
            {formatHours(dashboardData.weeklyStats.activeUsers > 0 ? dashboardData.weeklyStats.totalHours / dashboardData.weeklyStats.activeUsers : 0)}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Avg per User</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981', marginBottom: '4px' }}>
            {formatHours(dashboardData.weeklyStats.approvedHours)}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Org Total</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
            {dashboardData.weeklyStats.activeUsers}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Active Users</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '24px'
      }}>
        <button style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          padding: '12px 20px',
          color: 'white',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 View Timesheet
        </button>
        <button style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          padding: '12px 20px',
          color: 'white',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⏰ Quick Clock In
        </button>
      </div>

      {/* Auth Status */}
      <div style={{
        marginTop: '16px',
        fontSize: '14px',
        opacity: 0.8
      }}>
        💚 Auth Status: authenticated | Client: {dashboardData.user?.role || 'Admin'}
      </div>
    </div>
  )

  // HOLIDAY SCHEDULE (Right side of welcome)
  const HolidaySchedule = () => (
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

  // TRACKED HOURS - FULL WIDTH
  const TrackedHours = () => {
    const maxHours = Math.max(...dashboardData.weeklyChart.map(day => day.hours), 8)
    
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={headingStyle}>Tracked Hours This Week</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              backgroundColor: '#F3F4F6',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              color: '#6B7280'
            }}>
              Personal
            </button>
            <button style={{
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              color: 'white'
            }}>
              Organization
            </button>
          </div>
        </div>
        
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
          Organization-wide view • {dashboardData.weeklyStats.activeUsers} users
        </div>

        {/* Weekly Chart */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            {dashboardData.weeklyChart.map((day, index) => (
              <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                </div>
                <div style={{
                  height: '120px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  margin: '0 4px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  overflow: 'hidden'
                }}>
                  {day.hours > 0 && (
                    <div style={{
                      height: `${Math.max((day.hours / maxHours) * 100, 5)}%`,
                      backgroundColor: '#3B82F6',
                      borderRadius: '8px 8px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {day.hours.toFixed(1)}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                  {formatHours(day.hours)}
                </div>
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                  {day.userCount} user{day.userCount !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid #E5E7EB',
          fontSize: '14px'
        }}>
          <div>
            <span style={{ fontWeight: '600', color: '#111827' }}>Total Worked: </span>
            <span style={{ color: '#111827' }}>{formatHours(dashboardData.weeklyStats.totalHours)}</span>
          </div>
          <div>
            <span style={{ fontWeight: '600', color: '#111827' }}>Total Breaks: </span>
            <span style={{ color: '#111827' }}>{formatHours(dashboardData.weeklyStats.breakHours)}</span>
          </div>
          <div>
            <span style={{ fontWeight: '600', color: '#F59E0B' }}>Total Overtime: </span>
            <span style={{ color: '#F59E0B' }}>{formatHours(dashboardData.weeklyStats.overtimeHours)}</span>
          </div>
          <div>
            <span style={{ fontWeight: '600', color: '#111827' }}>Active Users: </span>
            <span style={{ color: '#111827' }}>{dashboardData.weeklyStats.activeUsers}</span>
          </div>
          <div>
            <span style={{ fontWeight: '600', color: '#111827' }}>Avg per User: </span>
            <span style={{ color: '#111827' }}>
              {formatHours(dashboardData.weeklyStats.activeUsers > 0 ? dashboardData.weeklyStats.totalHours / dashboardData.weeklyStats.activeUsers : 0)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></div>
            <span style={{ color: '#6B7280' }}>Worked Hours</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
            <span style={{ color: '#6B7280' }}>Break Time</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></div>
            <span style={{ color: '#6B7280' }}>Overtime</span>
          </div>
        </div>
      </div>
    )
  }

  // ACTIVITY RING - FULL WIDTH
  const ActivityRing = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={headingStyle}>Activities</h3>
        <a href="#" style={{ color: '#3B82F6', fontSize: '14px', textDecoration: 'none' }}>
          Go to activities
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {/* Donut Chart */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: dashboardData.activities.totalClocked > 0 
            ? 'conic-gradient(#3B82F6 0deg 180deg, #10B981 180deg 270deg, #F59E0B 270deg 360deg)'
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

        {/* Activity List */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            {dashboardData.weeklyStats.activeUsers} active team member{dashboardData.weeklyStats.activeUsers !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
            {formatHours(dashboardData.weeklyStats.totalHours)} total hours this week
          </div>
          
          {dashboardData.activities.breakdown.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dashboardData.activities.breakdown.slice(0, 5).map((activity, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: activity.color
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#6B7280', flex: 1 }}>
                    {activity.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#111827' }}>
                    {formatHours(activity.hours)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
              No activities tracked yet
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // PROJECT CHART - FULL WIDTH
  const ProjectChart = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={headingStyle}>Projects</h3>
        <a href="#" style={{ color: '#3B82F6', fontSize: '14px', textDecoration: 'none' }}>
          Go to projects
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {/* Donut Chart */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: dashboardData.projects.breakdown.length > 0
            ? 'conic-gradient(#6366F1 0deg 120deg, #EC4899 120deg 240deg, #14B8A6 240deg 360deg)'
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
            <div style={{ fontSize: '12px', color: '#6B7280' }}>projects</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              {dashboardData.projects.totalProjects}
            </div>
          </div>
        </div>

        {/* Project List */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Top {Math.min(dashboardData.projects.breakdown.length, 5)} projects
          </div>
          
          {dashboardData.projects.breakdown.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dashboardData.projects.breakdown.slice(0, 5).map((project, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: project.color
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#6B7280', flex: 1 }}>
                    {project.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#111827' }}>
                    {formatHours(project.hours)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
              No projects tracked yet
            </div>
          )}
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
        {/* Top Row: Welcome Header + Holiday Schedule */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <WelcomeHeader />
          <HolidaySchedule />
        </div>

        {/* Full Width Components - Stacked */}
        <TrackedHours />
        <ActivityRing />
        <ProjectChart />
      </div>
    </div>
  )
}

export default Dashboard

