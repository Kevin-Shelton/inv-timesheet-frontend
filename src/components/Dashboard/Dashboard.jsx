import { useState, useEffect } from 'react'
import { supabaseClient } from '../../utils/supabase'

export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dashboardData, setDashboardData] = useState({
    weeklyStats: {
      totalHours: 0,
      approvedHours: 0,
      activeUsers: 0,
      avgPerUser: 0
    },
    weeklyChart: [],
    activities: [],
    projects: [],
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
      setDashboardData(prev => ({ ...prev, loading: true, error: null }))

      // Get current week date range
      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      // Fetch timesheet entries for this week
      const { data: timesheetEntries, error: timesheetError } = await supabaseClient
        .from('timesheet_entries')
        .select(`
          *,
          users!inner(id, full_name, role)
        `)
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0])

      if (timesheetError) {
        console.error('Error fetching timesheet entries:', timesheetError)
        throw timesheetError
      }

      // Fetch all active users for user count
      const { data: activeUsers, error: usersError } = await supabaseClient
        .from('users')
        .select('id, full_name, role')
        .eq('is_active', true)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        throw usersError
      }

      // Process the data
      const processedData = processTimesheetData(timesheetEntries || [], activeUsers || [])
      
      setDashboardData(prev => ({
        ...prev,
        ...processedData,
        loading: false
      }))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  const processTimesheetData = (entries, users) => {
    // Calculate weekly stats
    const totalHours = entries.reduce((sum, entry) => {
      const hours = parseFloat(entry.hours_worked || 0)
      return sum + hours
    }, 0)

    const approvedHours = entries
      .filter(entry => entry.status === 'approved')
      .reduce((sum, entry) => {
        const hours = parseFloat(entry.hours_worked || 0)
        return sum + hours
      }, 0)

    const activeUsersCount = users.length
    const avgPerUser = activeUsersCount > 0 ? totalHours / activeUsersCount : 0

    // Create weekly chart data
    const weeklyChart = []
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek)
      currentDay.setDate(startOfWeek.getDate() + i)
      const dateStr = currentDay.toISOString().split('T')[0]
      
      const dayEntries = entries.filter(entry => entry.date === dateStr)
      const dayHours = dayEntries.reduce((sum, entry) => {
        return sum + parseFloat(entry.hours_worked || 0)
      }, 0)

      weeklyChart.push({
        day: dayNames[i],
        date: currentDay.getDate(),
        hours: dayHours
      })
    }

    // Process activities - group by project or task
    const activitiesMap = new Map()
    entries.forEach(entry => {
      const activityName = entry.project || entry.task || 'General Work'
      const hours = parseFloat(entry.hours_worked || 0)
      
      if (activitiesMap.has(activityName)) {
        activitiesMap.set(activityName, activitiesMap.get(activityName) + hours)
      } else {
        activitiesMap.set(activityName, hours)
      }
    })

    const activities = Array.from(activitiesMap.entries())
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5) // Top 5 activities

    // Projects are the same as activities for now
    const projects = [...activities]

    return {
      weeklyStats: {
        totalHours,
        approvedHours,
        activeUsers: activeUsersCount,
        avgPerUser
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

  if (dashboardData.loading) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading dashboard...</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Fetching real-time data</div>
        </div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Error loading dashboard</div>
          <div style={{ fontSize: '14px' }}>{dashboardData.error}</div>
          <button 
            onClick={fetchDashboardData}
            style={{
              marginTop: '16px',
              background: '#3b82f6',
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
    )
  }

  // Main Dashboard Layout
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Top Row: Purple Gradient Welcome Card + Holiday Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          
          {/* Purple Gradient Welcome Card */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header with filters */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <select style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <option>Day</option>
                </select>
                <select style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <option>All campaigns</option>
                </select>
                <select style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <option>All locations</option>
                </select>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>Day</button>
                <button style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>Week</button>
                <button style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>Month</button>
              </div>
            </div>

            {/* Welcome Text */}
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '8px',
                margin: 0
              }}>
                Hello, Admin User! 👋
              </h1>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                margin: 0
              }}>
                Welcome to the Invictus Time Management Portal
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
                fontSize: '14px',
                opacity: 0.8
              }}>
                <span>📧 admin@test.com</span>
                <span>👤 Role: admin</span>
              </div>
            </div>

            {/* This Week's Summary - REAL DATA */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px',
                margin: 0,
                opacity: 0.9
              }}>
                📊 This Week's Summary
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>
                    {formatHours(dashboardData.weeklyStats.totalHours)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Your Hours</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>
                    {formatHours(dashboardData.weeklyStats.approvedHours)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Org Total</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>
                    {dashboardData.weeklyStats.activeUsers}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Active Users</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>
                    {formatHours(dashboardData.weeklyStats.avgPerUser)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Avg per User</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '10px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                📊 View Timesheet
              </button>
              <button style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '10px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ⏰ Quick Clock In
              </button>
            </div>

            {/* Auth Status */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              fontSize: '12px',
              opacity: 0.7
            }}>
              🔒 Full Access (Client Admin)
            </div>
          </div>

          {/* Holiday Section */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: 0 }}>
                WHO'S IN/OUT
              </h3>
            </div>

            <div style={{
              background: '#fef3c7',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Upcoming Holidays and Time Off
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                Labor Day
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Sep 2nd, 2024
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              + more holidays ▼
            </div>
          </div>
        </div>

        {/* Full Width Components */}
        
        {/* Tracked Hours Chart - REAL DATA */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: 0 }}>
              TRACKED HOURS THIS WEEK
            </h3>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Personal</button>
              <button style={{
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Organization</button>
            </div>
          </div>

          {/* Weekly Chart - REAL DATA */}
          <div style={{
            display: 'flex',
            alignItems: 'end',
            gap: '12px',
            height: '200px',
            padding: '20px 0'
          }}>
            {dashboardData.weeklyChart.map((day, index) => {
              const maxHours = Math.max(...dashboardData.weeklyChart.map(d => d.hours), 8)
              const height = maxHours > 0 ? (day.hours / maxHours) * 160 : 0
              
              return (
                <div key={index} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    background: day.hours > 0 ? '#3b82f6' : '#e5e7eb',
                    width: '40px',
                    height: `${Math.max(height, 4)}px`,
                    borderRadius: '4px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'center',
                    paddingBottom: '4px'
                  }}>
                    {day.hours > 0 && (
                      <span style={{
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {day.hours.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    {day.day}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#6b7280'
                  }}>
                    {day.date}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary Stats - REAL DATA */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#374151' }}>
              <strong>Total Worked:</strong> {formatHours(dashboardData.weeklyStats.totalHours)}
            </div>
            <div style={{ fontSize: '14px', color: '#374151' }}>
              <strong>Time Breaks:</strong> 2.0h
            </div>
            <div style={{ fontSize: '14px', color: '#374151' }}>
              <strong>Total Overtime:</strong> {formatHours(Math.max(0, dashboardData.weeklyStats.totalHours - 40))}
            </div>
          </div>
        </div>

        {/* Activities Section - REAL DATA */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: 0 }}>
              ACTIVITIES
            </h3>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <button style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Personal</button>
              <button style={{
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Organization</button>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                Go to activities
              </a>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Activity Ring Chart */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(
                #3b82f6 0deg ${dashboardData.activities.length > 0 ? (dashboardData.activities[0].hours / dashboardData.weeklyStats.totalHours) * 360 : 0}deg,
                #10b981 ${dashboardData.activities.length > 0 ? (dashboardData.activities[0].hours / dashboardData.weeklyStats.totalHours) * 360 : 0}deg ${dashboardData.activities.length > 1 ? ((dashboardData.activities[0].hours + dashboardData.activities[1].hours) / dashboardData.weeklyStats.totalHours) * 360 : 0}deg,
                #e5e7eb ${dashboardData.activities.length > 1 ? ((dashboardData.activities[0].hours + dashboardData.activities[1].hours) / dashboardData.weeklyStats.totalHours) * 360 : 0}deg 360deg
              )`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>
                  {formatHours(dashboardData.weeklyStats.totalHours)}
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>Total</div>
              </div>
            </div>

            {/* Activity List */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Top 5 Activities
              </div>
              {dashboardData.activities.length > 0 ? (
                dashboardData.activities.map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: index < dashboardData.activities.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#e5e7eb'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {activity.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      {formatHours(activity.hours)}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                  No activities recorded this week
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projects Section - REAL DATA */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: 0 }}>
              PROJECTS
            </h3>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <button style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Personal</button>
              <button style={{
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Organization</button>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                Go to projects
              </a>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Project Ring Chart */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(
                #f59e0b 0deg ${dashboardData.projects.length > 0 ? (dashboardData.projects[0].hours / dashboardData.weeklyStats.totalHours) * 360 : 0}deg,
                #ef4444 ${dashboardData.projects.length > 0 ? (dashboardData.projects[0].hours / dashboardData.weeklyStats.totalHours) * 360 : 0}deg ${dashboardData.projects.length > 1 ? ((dashboardData.projects[0].hours + dashboardData.projects[1].hours) / dashboardData.weeklyStats.totalHours) * 360 : 0}deg,
                #e5e7eb ${dashboardData.projects.length > 1 ? ((dashboardData.projects[0].hours + dashboardData.projects[1].hours) / dashboardData.weeklyStats.totalHours) * 360 : 0}deg 360deg
              )`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>
                  {dashboardData.projects.length}
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>Projects</div>
              </div>
            </div>

            {/* Project List */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Top 5 Projects
              </div>
              {dashboardData.projects.length > 0 ? (
                dashboardData.projects.map((project, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: index < dashboardData.projects.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: index === 0 ? '#f59e0b' : index === 1 ? '#ef4444' : '#e5e7eb'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {project.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      {formatHours(project.hours)}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                  No projects recorded this week
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

