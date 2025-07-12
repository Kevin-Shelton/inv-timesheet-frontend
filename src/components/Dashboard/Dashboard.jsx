import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabaseApi as api } from '../../utils/supabase'
import { WeeklyChart } from './WeeklyChart'
import { ActivityRing } from './ActivityRing'
import { HolidaySection } from './HolidaySection'
import { CurrentTime } from './CurrentTime'
import { 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState('Week')
  const [weeklyData, setWeeklyData] = useState([])
  const [metrics, setMetrics] = useState({
    totalHours: 0,
    activeUsers: 0,
    utilization: 0,
    completedTasks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    loadDashboardData()

    return () => clearInterval(timer)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get current week dates
      const now = new Date()
      const startOfWeek = new Date(now)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      // Load timesheet data for the week
      const timesheets = await api.getTimesheets({
        start_date: startOfWeek.toISOString().split('T')[0],
        end_date: endOfWeek.toISOString().split('T')[0]
      })

      // Process weekly data for chart
      const weekData = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayEntries = timesheets.filter(entry => entry.date === dateStr)
        const workedHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)
        const overtimeHours = Math.max(0, workedHours - 8)
        const regularHours = Math.min(workedHours, 8)
        
        weekData.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.getDate(),
          worked: regularHours,
          overtime: overtimeHours,
          break: 1 // Assuming 1 hour break
        })
      }
      
      setWeeklyData(weekData)

      // Calculate metrics
      const totalHours = timesheets.reduce((sum, entry) => sum + (entry.hours || 0), 0)
      const uniqueUsers = new Set(timesheets.map(entry => entry.user_id)).size
      const utilization = uniqueUsers > 0 ? (totalHours / (uniqueUsers * 40)) * 100 : 0

      setMetrics({
        totalHours,
        activeUsers: uniqueUsers,
        utilization: Math.round(utilization),
        completedTasks: timesheets.length
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatGreeting = () => {
    const hour = currentTime.getHours()
    let greeting = 'Good morning'
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
    else if (hour >= 17) greeting = 'Good evening'
    
    return `${greeting}, ${user?.full_name?.split(' ')[0] || 'there'}`
  }

  const getCurrentWeekRange = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' })
    const startDay = startOfWeek.getDate()
    const endDay = endOfWeek.getDate()
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="jibble-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="page-title">Dashboard</h1>
          <div className="period-tabs">
            {['Day', 'Week', 'Month'].map(period => (
              <button
                key={period}
                className={`period-tab ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="header-right">
          <div className="filter-controls">
            <select className="filter-select">
              <option>All locations</option>
            </select>
            <select className="filter-select">
              <option>All groups</option>
            </select>
            <select className="filter-select">
              <option>All schedules</option>
            </select>
            <button className="filter-btn">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Greeting Section */}
          <div className="greeting-section">
            <div className="greeting-content">
              <h2 className="greeting-title">Hello {user?.full_name?.split(' ')[0] || 'User'}</h2>
              <p className="greeting-subtitle">Here's what's happening at Eps</p>
            </div>
            <div className="greeting-illustration">
              <div className="illustration-placeholder">
                <div className="person-icon">
                  <div className="person-avatar">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="laptop-icon">💻</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracked Hours Section */}
          <div className="tracked-hours-section">
            <div className="section-header">
              <h3 className="section-title">TRACKED HOURS</h3>
              <a href="/timesheets" className="section-link">Go to timesheets</a>
            </div>

            <div className="hours-chart-container">
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-dot worked"></div>
                  <span>0h 0m</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot break"></div>
                  <span>0h 0m</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot overtime"></div>
                  <span>OVERTIME HOURS</span>
                  <span>0h 0m</span>
                </div>
              </div>

              <WeeklyChart data={weeklyData} />

              <div className="chart-footer">
                <p className="chart-note">
                  Does not include manually entered work hours
                </p>
              </div>
            </div>
          </div>

          {/* Activities Section */}
          <div className="activities-section">
            <div className="section-header">
              <h3 className="section-title">ACTIVITIES</h3>
              <a href="/activities" className="section-link">Go to activities</a>
            </div>

            <div className="activities-content">
              <div className="activity-ring-container">
                <ActivityRing 
                  percentage={metrics.utilization}
                  label="clocked"
                  value="0h 0m"
                />
              </div>

              <div className="activity-list">
                <h4 className="activity-list-title">Top 10 activities</h4>
                <div className="activity-items">
                  {/* Activity items would be rendered here */}
                  <div className="empty-activities">
                    <p>No activities tracked yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          {/* Upcoming Holidays */}
          <HolidaySection />

          {/* Who's In/Out */}
          <div className="whos-in-section">
            <h3 className="sidebar-section-title">Who's In/Out</h3>
            <div className="whos-in-stats">
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">In</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Break</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1</div>
                <div className="stat-label">Out</div>
              </div>
            </div>
          </div>

          {/* Current Time */}
          <CurrentTime currentTime={currentTime} />
        </div>
      </div>
    </div>
  )
}

