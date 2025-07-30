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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard Error</h3>
              <p className="text-red-600">{dashboardData.error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">{currentTime.toLocaleString()}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top Row: Welcome Card + Holiday Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Card - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Hello, Admin User! 👋</h2>
                  <p className="text-purple-100">Welcome to the Invictus Time Management Portal</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span>📧 admin@test.com</span>
                    <span>👤 Role: admin</span>
                  </div>
                </div>
              </div>

              {/* This Week's Summary */}
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  📊 This Week's Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatTime(dashboardData.weeklyStats.yourHours)}</div>
                    <div className="text-sm text-purple-100">Your Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatTime(dashboardData.weeklyStats.orgTotal)}</div>
                    <div className="text-sm text-purple-100">Org Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{dashboardData.weeklyStats.activeUsers}</div>
                    <div className="text-sm text-purple-100">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatTime(dashboardData.weeklyStats.avgPerUser)}</div>
                    <div className="text-sm text-purple-100">Avg per User</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors">
                  📊 View Timesheet
                </button>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors">
                  ⏰ Quick Clock In
                </button>
              </div>

              <div className="mt-4 text-sm text-purple-100">
                🔒 Full Access (Client Admin)
              </div>
            </div>
          </div>

          {/* Holiday Section - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upcoming Holidays and Time Off
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-900">Labor Day</div>
                  <div className="text-sm text-gray-600">Sep 2nd, 2024</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  + more holidays ▼
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tracked Hours Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">TRACKED HOURS THIS WEEK</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Personal</button>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Organization</button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-4 mb-4">
            {dashboardData.weeklyChart.map((day, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-500 rounded-t" style={{ height: `${Math.max(day.hours * 20, 20)}px` }}></div>
                <div className="bg-blue-100 p-2 rounded-b">
                  <div className="text-sm font-medium text-blue-800">{day.hours.toFixed(1)}</div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{day.day}</div>
                <div className="text-xs text-gray-400">{index + 7}</div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Worked: {formatTime(dashboardData.weeklyStats.yourHours)}</span>
            <span>Time Breaks: 2.5h</span>
            <span>Total Overtime: 4.5h</span>
          </div>
        </div>

        {/* Activities and Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">ACTIVITIES</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Personal</button>
                <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Organization</button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 relative">
                <div className="w-full h-full rounded-full border-8 border-purple-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {dashboardData.activities.length}
                    </div>
                    <div className="text-sm text-gray-600">Activities</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="space-y-2">
                  {dashboardData.activities.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{activity.name}</span>
                      <span className="text-sm font-medium">{formatTime(activity.hours)}</span>
                    </div>
                  ))}
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm mt-3">
                  Go to activities →
                </button>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">PROJECTS</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Personal</button>
                <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Organization</button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 relative">
                <div className="w-full h-full rounded-full border-8 border-red-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {dashboardData.projects.length}
                    </div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="space-y-2">
                  {dashboardData.projects.slice(0, 3).map((project, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{project.name}</span>
                      <span className="text-sm font-medium">{formatTime(project.hours)}</span>
                    </div>
                  ))}
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm mt-3">
                  Go to projects →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

