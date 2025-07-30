import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dashboardData, setDashboardData] = useState({
    weeklyStats: {
      yourHours: 0,
      orgTotal: 0,
      activeUsers: 0,
      avgPerUser: 0
    },
    weeklyChart: [],
    activities: [],
    projects: [],
    loading: true,
    error: null
  })

  // Debug: Check Supabase configuration
  useEffect(() => {
    console.log('🔍 DEBUG: Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('🔍 DEBUG: Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
    console.log('🔍 DEBUG: Supabase client:', supabase)
  }, [])

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
      console.log('🔍 DEBUG: Starting dashboard data fetch...')
      setDashboardData(prev => ({ ...prev, loading: true, error: null }))

      // Test basic Supabase connection first
      console.log('🔍 DEBUG: Testing Supabase connection...')
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('🔍 DEBUG: Supabase connection test failed:', testError)
        throw new Error(`Supabase connection failed: ${testError.message}`)
      }

      console.log('🔍 DEBUG: Supabase connection successful')

      // Get current week date range
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      console.log('🔍 DEBUG: Date range:', {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString()
      })

      // Fetch timesheet entries for this week
      console.log('🔍 DEBUG: Fetching timesheet entries...')
      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name, role)
        `)
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0])

      if (timesheetError) {
        console.error('🔍 DEBUG: Timesheet query error:', timesheetError)
        throw timesheetError
      }

      console.log('🔍 DEBUG: Timesheet data received:', timesheetData?.length || 0, 'entries')

      // Fetch all active users for user count
      console.log('🔍 DEBUG: Fetching users...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('is_active', true)

      if (userError) {
        console.error('🔍 DEBUG: Users query error:', userError)
        throw userError
      }

      console.log('🔍 DEBUG: Users data received:', userData?.length || 0, 'users')

      // Process the data
      const processedData = processTimesheetData(timesheetData || [], userData || [])
      console.log('🔍 DEBUG: Processed data:', processedData)

      setDashboardData({
        ...processedData,
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('🔍 DEBUG: Dashboard data fetch failed:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard data'
      }))
    }
  }

  const processTimesheetData = (timesheetData, userData) => {
    console.log('🔍 DEBUG: Processing timesheet data...')
    
    // Calculate weekly stats
    const totalHours = timesheetData.reduce((sum, entry) => {
      const hours = (entry.regular_hours || 0) + (entry.overtime_hours || 0)
      return sum + hours
    }, 0)

    const activeUsers = userData.length
    const avgPerUser = activeUsers > 0 ? totalHours / activeUsers : 0

    // Create daily breakdown for chart
    const dailyHours = {}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    timesheetData.forEach(entry => {
      const date = new Date(entry.date)
      const dayName = days[date.getDay()]
      const hours = (entry.regular_hours || 0) + (entry.overtime_hours || 0)
      
      if (!dailyHours[dayName]) {
        dailyHours[dayName] = 0
      }
      dailyHours[dayName] += hours
    })

    const weeklyChart = days.map(day => ({
      day: day.substring(0, 3),
      hours: dailyHours[day] || 0
    }))

    // Group by activities/projects (using description or project field)
    const activityMap = {}
    const projectMap = {}

    timesheetData.forEach(entry => {
      // Activities (could be task descriptions)
      const activity = entry.description || entry.task || 'General Work'
      if (!activityMap[activity]) {
        activityMap[activity] = 0
      }
      activityMap[activity] += (entry.regular_hours || 0) + (entry.overtime_hours || 0)

      // Projects (could be campaign or project field)
      const project = entry.project || entry.campaign_id || 'Default Project'
      if (!projectMap[project]) {
        projectMap[project] = 0
      }
      projectMap[project] += (entry.regular_hours || 0) + (entry.overtime_hours || 0)
    })

    const activities = Object.entries(activityMap)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)

    const projects = Object.entries(projectMap)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)

    return {
      weeklyStats: {
        yourHours: totalHours,
        orgTotal: totalHours, // For admin view, show org total
        activeUsers,
        avgPerUser
      },
      weeklyChart,
      activities,
      projects
    }
  }

  const formatTime = (hours) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  if (dashboardData.loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-layout">
          <div className="dashboard-left">
            <div className="chart-section">
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-layout">
          <div className="dashboard-left">
            <div className="chart-section">
              <h3>Dashboard Error</h3>
              <p>{dashboardData.error}</p>
              <button onClick={fetchDashboardData}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-layout">
        <div className="dashboard-left">
          
          {/* Top Row: Welcome Card + Holiday Section */}
          <div className="top-row">
            {/* Welcome Card */}
            <div className="welcome-section">
              <h2>Hello, Admin User! 👋</h2>
              <p>Welcome to the Invictus Time Management Portal</p>
              <div>
                <span>📧 admin@test.com</span>
                <span>👤 Role: admin</span>
              </div>

              {/* This Week's Summary */}
              <div>
                <h3>📊 This Week's Summary</h3>
                <div>
                  <div>
                    <div>{formatTime(dashboardData.weeklyStats.yourHours)}</div>
                    <div>Your Hours</div>
                  </div>
                  <div>
                    <div>{formatTime(dashboardData.weeklyStats.orgTotal)}</div>
                    <div>Org Total</div>
                  </div>
                  <div>
                    <div>{dashboardData.weeklyStats.activeUsers}</div>
                    <div>Active Users</div>
                  </div>
                  <div>
                    <div>{formatTime(dashboardData.weeklyStats.avgPerUser)}</div>
                    <div>Avg per User</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <button>📊 View Timesheet</button>
                <button>⏰ Quick Clock In</button>
              </div>

              <div>🔒 Full Access (Client Admin)</div>
            </div>

            {/* Holiday Section */}
            <div className="holiday-section">
              <h3>Upcoming Holidays and Time Off</h3>
              <div>
                <div>
                  <div>Labor Day</div>
                  <div>Sep 2nd, 2024</div>
                </div>
              </div>
              <div>
                <button>+ more holidays ▼</button>
              </div>
            </div>
          </div>

          {/* Tracked Hours Chart */}
          <div className="chart-section">
            <div>
              <h3>TRACKED HOURS THIS WEEK</h3>
              <div>
                <button>Personal</button>
                <button>Organization</button>
              </div>
            </div>
            
            <div>
              {dashboardData.weeklyChart.map((day, index) => (
                <div key={index}>
                  <div style={{ height: `${Math.max(day.hours * 20, 20)}px` }}></div>
                  <div>
                    <div>{day.hours.toFixed(1)}</div>
                  </div>
                  <div>{day.day}</div>
                  <div>{index + 7}</div>
                </div>
              ))}
            </div>
            
            <div>
              <span>Total Worked: {formatTime(dashboardData.weeklyStats.yourHours)}</span>
              <span>Time Breaks: 2.5h</span>
              <span>Total Overtime: 4.5h</span>
            </div>
          </div>

          {/* Activities */}
          <div className="chart-section">
            <div>
              <h3>ACTIVITIES</h3>
              <div>
                <button>Personal</button>
                <button>Organization</button>
              </div>
            </div>
            
            <div>
              <div>
                <div>
                  <div>
                    <div>{dashboardData.activities.length}</div>
                    <div>Activities</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div>
                  {dashboardData.activities.slice(0, 3).map((activity, index) => (
                    <div key={index}>
                      <span>{activity.name}</span>
                      <span>{formatTime(activity.hours)}</span>
                    </div>
                  ))}
                </div>
                <button>Go to activities →</button>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="chart-section">
            <div>
              <h3>PROJECTS</h3>
              <div>
                <button>Personal</button>
                <button>Organization</button>
              </div>
            </div>
            
            <div>
              <div>
                <div>
                  <div>
                    <div>{dashboardData.projects.length}</div>
                    <div>Projects</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div>
                  {dashboardData.projects.slice(0, 3).map((project, index) => (
                    <div key={index}>
                      <span>{project.name}</span>
                      <span>{formatTime(project.hours)}</span>
                    </div>
                  ))}
                </div>
                <button>Go to projects →</button>
              </div>
            </div>
          </div>

        </div>

        <div className="dashboard-right">
          <div>
            <h3>Right Sidebar Content</h3>
            <p>Additional dashboard widgets would go here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

