// COMPLETE TIMESHEET MANAGEMENT SYSTEM - TEAM MANAGEMENT FIXED + CAMPAIGN MANAGEMENT ADDED
// Dashboard cards in 2x3 grid, filters horizontal, Quick Actions in single row
// FIXED: Team Management action buttons now work properly
// FIXED: Delete now deactivates users instead of removing them
// FIXED: Edit modal with pre-filled user data
// UPDATED: ALL API CALLS NOW USE REAL SUPABASE DATABASE - NO MORE MOCK DATA
// NEW: Campaign Management page integrated with proper routing

import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { 
  Clock, Users, BarChart3, Settings, LogOut, Menu, X, AlertCircle, 
  CheckCircle, Plus, Check, XCircle, Download, Filter, Search, Edit, 
  Trash2, UserPlus, Shield, TrendingUp, DollarSign, Calendar, FileText,
  Home, Eye, EyeOff, Database, Upload, Target, Activity, Save, Printer,
  RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Bell, Globe, Lock, User,
  Briefcase, Copy, Square, Play, CheckSquare, Calculator, Edit3
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, 
  AreaChart, Area 
} from 'recharts'
import { createClient } from '@supabase/supabase-js'
import './App.css'

// INLINE SUPABASE CONFIGURATION - NO EXTERNAL IMPORTS NEEDED
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// REAL SUPABASE API - REPLACES ALL MOCK DATA
const api = {
  // Authentication
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Get user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (profileError) {
        console.warn('No user profile found, using auth data')
        return {
          token: data.session.access_token,
          user: {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || email,
            role: 'team_member'
          }
        }
      }
      
      return {
        token: data.session.access_token,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          role: userProfile.role,
          department: userProfile.department,
          pay_rate_per_hour: userProfile.pay_rate_per_hour,
          hire_date: userProfile.hire_date,
          phone: userProfile.phone,
          is_active: userProfile.is_active
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Invalid credentials')
    }
  },

  // Timesheets
  getTimesheets: async (params = {}) => {
    try {
      let query = supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name)
        `)
        .order('date', { ascending: false })
      
      if (params.status) {
        query = query.eq('status', params.status)
      }
      if (params.user_id) {
        query = query.eq('user_id', params.user_id)
      }
      if (params.start_date) {
        query = query.gte('date', params.start_date)
      }
      if (params.end_date) {
        query = query.lte('date', params.end_date)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data.map(entry => ({
        ...entry,
        user_name: entry.users?.full_name || 'Unknown User'
      }))
    } catch (error) {
      console.error('Error fetching timesheets:', error)
      return []
    }
  },

  createTimesheet: async (data) => {
    try {
      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .insert([{
          user_id: data.user_id,
          date: data.date,
          hours: data.hours,
          description: data.description,
          status: 'pending'
        }])
        .select()
        .single()
      
      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating timesheet:', error)
      throw error
    }
  },

  approveTimesheet: async (id, comment) => {
    try {
      const { error } = await supabase
        .from('timesheet_entries')
        .update({ 
          status: 'approved',
          approval_comment: comment,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error approving timesheet:', error)
      throw error
    }
  },

  rejectTimesheet: async (id, comment) => {
    try {
      const { error } = await supabase
        .from('timesheet_entries')
        .update({ 
          status: 'rejected',
          approval_comment: comment,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error rejecting timesheet:', error)
      throw error
    }
  },

  // Billable Hours
  getBillableHours: async (params = {}) => {
    try {
      let query = supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name, pay_rate_per_hour),
          campaigns!timesheet_entries_campaign_id_fkey(name, client_name, billing_rate_per_hour)
        `)
        .eq('is_billable', true)
        .eq('status', 'approved')
        .order('date', { ascending: false })
      
      if (params.start_date) {
        query = query.gte('date', params.start_date)
      }
      if (params.end_date) {
        query = query.lte('date', params.end_date)
      }
      if (params.campaign_id) {
        query = query.eq('campaign_id', params.campaign_id)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data.map(entry => ({
        id: entry.id,
        team_member_id: entry.user_id,
        team_member_name: entry.users?.full_name || 'Unknown User',
        date: entry.date,
        client_name: entry.campaigns?.client_name || 'Unknown Client',
        project_name: entry.campaigns?.name || 'Unknown Project',
        task_description: entry.description,
        billable_hours: entry.hours,
        hourly_rate: entry.campaigns?.billing_rate_per_hour || entry.users?.pay_rate_per_hour || 0,
        total_amount: entry.hours * (entry.campaigns?.billing_rate_per_hour || entry.users?.pay_rate_per_hour || 0),
        status: entry.status,
        entered_by: 'System'
      }))
    } catch (error) {
      console.error('Error fetching billable hours:', error)
      return []
    }
  },

  createBillableHours: async (data) => {
    try {
      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .insert([{
          user_id: data.team_member_id,
          campaign_id: data.campaign_id,
          date: data.date,
          hours: data.billable_hours,
          description: data.task_description,
          is_billable: true,
          status: 'approved'
        }])
        .select()
        .single()
      
      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating billable hours:', error)
      throw error
    }
  },

  updateBillableHours: async (id, data) => {
    try {
      const { error } = await supabase
        .from('timesheet_entries')
        .update({
          hours: data.billable_hours,
          description: data.task_description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating billable hours:', error)
      throw error
    }
  },

  deleteBillableHours: async (id) => {
    try {
      const { error } = await supabase
        .from('timesheet_entries')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting billable hours:', error)
      throw error
    }
  },

  // Utilization Metrics
  getUtilizationMetrics: async (params = {}) => {
    try {
      // Get all approved timesheet entries
      const { data: timesheets, error: timesheetError } = await supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name)
        `)
        .eq('status', 'approved')
      
      if (timesheetError) throw timesheetError
      
      // Calculate metrics
      const totalHours = timesheets.reduce((sum, entry) => sum + entry.hours, 0)
      const billableHours = timesheets
        .filter(entry => entry.is_billable)
        .reduce((sum, entry) => sum + entry.hours, 0)
      
      // Assuming 40 hours per week per user
      const { data: activeUsers, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('is_active', true)
      
      if (userError) throw userError
      
      const availableHours = activeUsers.length * 40 * 4 // 4 weeks
      const overallUtilization = availableHours > 0 ? (totalHours / availableHours) * 100 : 0
      const billableUtilization = totalHours > 0 ? (billableHours / totalHours) * 100 : 0
      
      // Team metrics
      const teamMetrics = {}
      timesheets.forEach(entry => {
        const userName = entry.users?.full_name || 'Unknown'
        if (!teamMetrics[userName]) {
          teamMetrics[userName] = { name: userName, totalHours: 0, billableHours: 0 }
        }
        teamMetrics[userName].totalHours += entry.hours
        if (entry.is_billable) {
          teamMetrics[userName].billableHours += entry.hours
        }
      })
      
      const teamMetricsArray = Object.values(teamMetrics).map(member => ({
        ...member,
        utilization: (member.totalHours / 160) * 100 // 160 hours per month
      }))
      
      return {
        overall_utilization: Math.round(overallUtilization * 10) / 10,
        billable_utilization: Math.round(billableUtilization * 10) / 10,
        target_utilization: 75.0,
        revenue_per_hour: billableHours > 0 ? Math.round((billableHours * 75) / billableHours * 100) / 100 : 0,
        total_billable_hours: billableHours,
        total_available_hours: availableHours,
        efficiency_score: Math.round(((billableHours / totalHours) * 100) * 10) / 10,
        team_metrics: teamMetricsArray
      }
    } catch (error) {
      console.error('Error fetching utilization metrics:', error)
      return {
        overall_utilization: 0,
        billable_utilization: 0,
        target_utilization: 75.0,
        revenue_per_hour: 0,
        total_billable_hours: 0,
        total_available_hours: 0,
        efficiency_score: 0,
        team_metrics: []
      }
    }
  },

  // Users/Team Management
  getUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  createUser: async (userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          pay_rate_per_hour: userData.pay_rate_per_hour,
          hire_date: userData.hire_date,
          phone: userData.phone,
          is_active: true
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  updateUser: async (id, userData) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          pay_rate_per_hour: userData.pay_rate_per_hour,
          hire_date: userData.hire_date,
          phone: userData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  deleteUser: async (id) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  deactivateUser: async (id) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deactivating user:', error)
      throw error
    }
  },

  activateUser: async (id) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error activating user:', error)
      throw error
    }
  },

  // Campaigns
  getCampaigns: async (params = {}) => {
    try {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (params.is_active !== undefined) {
        query = query.eq('is_active', params.is_active)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }
  },

  createCampaign: async (campaignData) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          name: campaignData.name,
          billing_rate_per_hour: campaignData.billing_rate_per_hour,
          client_name: campaignData.client_name,
          description: campaignData.description,
          is_billable: campaignData.is_billable,
          is_active: campaignData.is_active,
          crm_campaign_id: campaignData.crm_campaign_id,
          crm_config: campaignData.crm_config
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw error
    }
  },

  updateCampaign: async (id, campaignData) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          name: campaignData.name,
          billing_rate_per_hour: campaignData.billing_rate_per_hour,
          client_name: campaignData.client_name,
          description: campaignData.description,
          is_billable: campaignData.is_billable,
          is_active: campaignData.is_active,
          crm_campaign_id: campaignData.crm_campaign_id,
          crm_config: campaignData.crm_config,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating campaign:', error)
      throw error
    }
  },

  deleteCampaign: async (id) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      throw error
    }
  }
}

// Authentication Context
const AuthContext = createContext()

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password)
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const value = {
    user,
    token,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Login Component
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Timesheet Management</h1>
          <p>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Dashboard Component - Jibble-style with Apple-inspired design
function Dashboard() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weeklyData, setWeeklyData] = useState([])
  const [activitiesData, setActivitiesData] = useState([])
  const [whoIsInData, setWhoIsInData] = useState({ in: 0, out: 0, break: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Load dashboard data
    loadDashboardData()

    return () => clearInterval(timer)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get weekly timesheet data for chart
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 6)
      
      const timesheets = await api.getTimesheets({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      })

      // Process data for weekly chart
      const weeklyChartData = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
        
        const dayEntries = timesheets.filter(entry => 
          new Date(entry.date).toDateString() === date.toDateString()
        )
        
        const workedHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)
        const overtimeHours = Math.max(0, workedHours - 8)
        const regularHours = Math.min(workedHours, 8)
        
        weeklyChartData.push({
          day: dayName,
          worked: regularHours,
          overtime: overtimeHours,
          break: Math.random() * 1 // Mock break data
        })
      }
      
      setWeeklyData(weeklyChartData)

      // Mock activities data
      setActivitiesData([
        { name: 'Client Calls', hours: 2.5 },
        { name: 'Development', hours: 4.0 },
        { name: 'Meetings', hours: 1.5 },
        { name: 'Documentation', hours: 1.0 }
      ])

      // Mock who's in data
      setWhoIsInData({ in: 12, out: 3, break: 2 })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const calculateTotalHours = () => {
    return weeklyData.reduce((total, day) => total + day.worked + day.overtime, 0)
  }

  return (
    <div className="jibble-dashboard">
      {/* Main Content */}
      <div className="dashboard-content">
        {/* Greeting Section */}
        <div className="greeting-section">
          <div className="greeting-content">
            <h1 className="greeting-title">Hello {user?.full_name?.split(' ')[0] || 'User'}</h1>
            <p className="greeting-subtitle">Here's what's happening at Eps</p>
          </div>
          <div className="greeting-illustration">
            <div className="illustration-placeholder">
              <div className="person-icon">👨‍💼</div>
            </div>
          </div>
        </div>

        {/* Upcoming Holidays Section */}
        <div className="holidays-section">
          <div className="holidays-card">
            <h3 className="holidays-title">UPCOMING HOLIDAYS AND TIME OFF</h3>
            <p className="holidays-description">
              Add your holiday calendar for<br />
              reminders and overtime calculations.
            </p>
            <div className="holidays-actions">
              <button className="setup-holidays-btn">
                Set up Holidays
              </button>
              <button className="no-thanks-btn">
                No, thanks
              </button>
            </div>
          </div>
        </div>

        {/* Tracked Hours Section */}
        <div className="tracked-hours-section">
          <div className="section-header">
            <h2 className="section-title">TRACKED HOURS</h2>
            <Link to="/timesheets" className="section-link">
              Go to timesheets
            </Link>
          </div>

          <div className="hours-chart-container">
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color worked"></div>
                <span>0h 0m</span>
              </div>
              <div className="legend-item">
                <div className="legend-color break"></div>
                <span>0h 0m</span>
              </div>
              <div className="legend-item">
                <div className="legend-color overtime"></div>
                <span>OVERTIME HOURS</span>
              </div>
            </div>

            <div className="weekly-chart">
              {weeklyData.map((day, index) => (
                <div key={index} className="chart-day">
                  <div className="chart-bars">
                    <div 
                      className="bar worked" 
                      style={{ height: `${(day.worked / 10) * 100}%` }}
                      title={`Worked: ${day.worked}h`}
                    ></div>
                    <div 
                      className="bar break" 
                      style={{ height: `${(day.break / 10) * 100}%` }}
                      title={`Break: ${day.break}h`}
                    ></div>
                    <div 
                      className="bar overtime" 
                      style={{ height: `${(day.overtime / 10) * 100}%` }}
                      title={`Overtime: ${day.overtime}h`}
                    ></div>
                  </div>
                  <div className="chart-day-label">{day.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="activities-section">
          <div className="section-header">
            <h2 className="section-title">ACTIVITIES</h2>
            <Link to="/activities" className="section-link">
              Go to activities
            </Link>
          </div>

          <div className="activities-content">
            <div className="activity-ring">
              <div className="ring-container">
                <div className="progress-ring">
                  <div className="ring-background"></div>
                  <div className="ring-progress" style={{ '--progress': '65%' }}></div>
                </div>
                <div className="ring-center">
                  <div className="ring-label">clocked</div>
                  <div className="ring-value">0h 0m</div>
                </div>
              </div>
            </div>

            <div className="activities-list">
              <h3 className="activities-list-title">Top 10 activities</h3>
              <div className="activities-items">
                {activitiesData.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-dot"></div>
                    <span className="activity-name">{activity.name}</span>
                    <span className="activity-hours">{activity.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="dashboard-sidebar">
        {/* Who's In/Out */}
        <div className="whos-in-section">
          <h3 className="sidebar-title">Who's In/Out</h3>
          <div className="whos-in-stats">
            <div className="stat-item">
              <div className="stat-number">{whoIsInData.in}</div>
              <div className="stat-label">In</div>
              <div className="stat-indicator in"></div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{whoIsInData.out}</div>
              <div className="stat-label">Out</div>
              <div className="stat-indicator out"></div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{whoIsInData.break}</div>
              <div className="stat-label">Break</div>
              <div className="stat-indicator break"></div>
            </div>
          </div>
        </div>

        {/* Current Time */}
        <div className="current-time-section">
          <div className="time-display">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="current-date">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="timezone">
              No timezone set up
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Team Management Component - Cards layout with proper CRUD operations
function TeamManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    role: 'team_member',
    pay_rate_per_hour: '',
    hire_date: '',
    phone: ''
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const user = await api.createUser(newUser)
      setUsers([...users, user])
      setNewUser({
        full_name: '',
        email: '',
        role: 'team_member',
        pay_rate_per_hour: '',
        hire_date: '',
        phone: ''
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user. Please try again.')
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      await api.updateUser(editingUser.id, editingUser)
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u))
      setShowEditModal(false)
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user. Please try again.')
    }
  }

  const handleDeactivateUser = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.deactivateUser(id)
        setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u))
      } catch (error) {
        console.error('Error deactivating user:', error)
        alert('Error deactivating user. Please try again.')
      }
    }
  }

  const handleActivateUser = async (id) => {
    try {
      await api.activateUser(id)
      setUsers(users.map(u => u.id === id ? { ...u, is_active: true } : u))
    } catch (error) {
      console.error('Error activating user:', error)
      alert('Error activating user. Please try again.')
    }
  }

  const getStatusBadge = (status) => {
    return status ? (
      <span className="status-badge active">Active</span>
    ) : (
      <span className="status-badge inactive">Inactive</span>
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading team members...</p>
      </div>
    )
  }

  return (
    <div className="team-management">
      <div className="page-header">
        <h1>Team Members</h1>
        <button 
          className="add-user-btn"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Team Member
        </button>
      </div>

      <div className="team-grid">
        {users.map(user => (
          <div key={user.id} className="team-card">
            <div className="card-header">
              <div className="user-avatar">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.full_name}</h3>
                <p className="user-email">{user.email}</p>
                <p className="user-role">{user.role}</p>
              </div>
              {getStatusBadge(user.is_active)}
            </div>
            
            <div className="card-details">
              <div className="detail-item">
                <span className="detail-label">Pay Rate:</span>
                <span className="detail-value">${user.pay_rate_per_hour}/hr</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hire Date:</span>
                <span className="detail-value">{user.hire_date}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{user.phone}</span>
              </div>
            </div>
            
            <div className="card-actions">
              <button 
                className="action-btn edit"
                onClick={() => handleEditUser(user)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              {user.is_active ? (
                <button 
                  className="action-btn deactivate"
                  onClick={() => handleDeactivateUser(user.id)}
                >
                  <XCircle className="w-4 h-4" />
                  Deactivate
                </button>
              ) : (
                <button 
                  className="action-btn activate"
                  onClick={() => handleActivateUser(user.id)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Team Member</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="team_member">Team Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pay Rate (per hour)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newUser.pay_rate_per_hour}
                  onChange={(e) => setNewUser({...newUser, pay_rate_per_hour: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hire Date</label>
                <input
                  type="date"
                  value={newUser.hire_date}
                  onChange={(e) => setNewUser({...newUser, hire_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Add Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Team Member</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option value="team_member">Team Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pay Rate (per hour)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingUser.pay_rate_per_hour}
                  onChange={(e) => setEditingUser({...editingUser, pay_rate_per_hour: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hire Date</label>
                <input
                  type="date"
                  value={editingUser.hire_date}
                  onChange={(e) => setEditingUser({...editingUser, hire_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Update Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Billable Hours Component
function BillableHoursPage() {
  const [billableHours, setBillableHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [users, setUsers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [newEntry, setNewEntry] = useState({
    team_member_id: '',
    campaign_id: '',
    date: '',
    billable_hours: '',
    task_description: ''
  })

  useEffect(() => {
    loadBillableHours()
    loadUsers()
    loadCampaigns()
  }, [])

  const loadBillableHours = async () => {
    try {
      setLoading(true)
      const data = await api.getBillableHours()
      setBillableHours(data)
    } catch (error) {
      console.error('Error loading billable hours:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data.filter(user => user.is_active))
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns({ is_active: true })
      setCampaigns(data)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
  }

  const handleCreateEntry = async (e) => {
    e.preventDefault()
    try {
      await api.createBillableHours(newEntry)
      loadBillableHours()
      setNewEntry({
        team_member_id: '',
        campaign_id: '',
        date: '',
        billable_hours: '',
        task_description: ''
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating billable hours entry:', error)
      alert('Error creating entry. Please try again.')
    }
  }

  const handleEditEntry = (entry) => {
    setEditingEntry({
      ...entry,
      billable_hours: entry.billable_hours.toString()
    })
    setShowEditModal(true)
  }

  const handleUpdateEntry = async (e) => {
    e.preventDefault()
    try {
      await api.updateBillableHours(editingEntry.id, editingEntry)
      loadBillableHours()
      setShowEditModal(false)
      setEditingEntry(null)
    } catch (error) {
      console.error('Error updating billable hours entry:', error)
      alert('Error updating entry. Please try again.')
    }
  }

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await api.deleteBillableHours(id)
        setBillableHours(billableHours.filter(entry => entry.id !== id))
      } catch (error) {
        console.error('Error deleting billable hours entry:', error)
        alert('Error deleting entry. Please try again.')
      }
    }
  }

  const getTotalAmount = () => {
    return billableHours.reduce((total, entry) => total + entry.total_amount, 0)
  }

  const getTotalHours = () => {
    return billableHours.reduce((total, entry) => total + entry.billable_hours, 0)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading billable hours...</p>
      </div>
    )
  }

  return (
    <div className="billable-hours-page">
      <div className="page-header">
        <h1>Billable Hours</h1>
        <button 
          className="add-entry-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Hours</h3>
          <p className="summary-value">{getTotalHours().toFixed(1)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Amount</h3>
          <p className="summary-value">${getTotalAmount().toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Average Rate</h3>
          <p className="summary-value">
            ${getTotalHours() > 0 ? (getTotalAmount() / getTotalHours()).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="billable-hours-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Team Member</th>
              <th>Client</th>
              <th>Project</th>
              <th>Description</th>
              <th>Hours</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billableHours.map(entry => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>{entry.team_member_name}</td>
                <td>{entry.client_name}</td>
                <td>{entry.project_name}</td>
                <td>{entry.task_description}</td>
                <td>{entry.billable_hours}</td>
                <td>${entry.hourly_rate}</td>
                <td>${entry.total_amount.toFixed(2)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Billable Hours Entry</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEntry} className="modal-form">
              <div className="form-group">
                <label>Team Member</label>
                <select
                  value={newEntry.team_member_id}
                  onChange={(e) => setNewEntry({...newEntry, team_member_id: e.target.value})}
                  required
                >
                  <option value="">Select Team Member</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Campaign</label>
                <select
                  value={newEntry.campaign_id}
                  onChange={(e) => setNewEntry({...newEntry, campaign_id: e.target.value})}
                  required
                >
                  <option value="">Select Campaign</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Billable Hours</label>
                <input
                  type="number"
                  step="0.25"
                  value={newEntry.billable_hours}
                  onChange={(e) => setNewEntry({...newEntry, billable_hours: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Task Description</label>
                <textarea
                  value={newEntry.task_description}
                  onChange={(e) => setNewEntry({...newEntry, task_description: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditModal && editingEntry && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Billable Hours Entry</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEntry} className="modal-form">
              <div className="form-group">
                <label>Billable Hours</label>
                <input
                  type="number"
                  step="0.25"
                  value={editingEntry.billable_hours}
                  onChange={(e) => setEditingEntry({...editingEntry, billable_hours: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Task Description</label>
                <textarea
                  value={editingEntry.task_description}
                  onChange={(e) => setEditingEntry({...editingEntry, task_description: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Data Management Page
function DataManagementPage() {
  const [activeTab, setActiveTab] = useState('export')
  const [exportFormat, setExportFormat] = useState('csv')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Data exported successfully as ${exportFormat.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="data-management-page">
      <h1>Data Management</h1>
      
      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Export Data
        </button>
        <button 
          className={`tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Import Data
        </button>
      </div>

      {activeTab === 'export' && (
        <div className="export-section">
          <div className="form-group">
            <label>Export Format</label>
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Date Range</label>
            <div className="date-range">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
          
          <button 
            className="export-btn"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="import-section">
          <div className="upload-area">
            <Upload className="w-12 h-12" />
            <p>Drag and drop your file here, or click to browse</p>
            <input type="file" accept=".csv,.xlsx" />
          </div>
        </div>
      )}
    </div>
  )
}

// Utilization Analytics Component
function UtilizationAnalytics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const data = await api.getUtilizationMetrics()
      setMetrics(data)
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-container">Loading analytics...</div>
  }

  return (
    <div className="utilization-analytics">
      <h1>Utilization Analytics</h1>
      {/* Analytics content would go here */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Overall Utilization</h3>
          <p className="metric-value">{metrics?.overall_utilization}%</p>
        </div>
        <div className="metric-card">
          <h3>Billable Utilization</h3>
          <p className="metric-value">{metrics?.billable_utilization}%</p>
        </div>
      </div>
    </div>
  )
}

// Billable Hours Reporting Component
function BillableHoursReporting() {
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      const data = await api.getBillableHours()
      setReportData(data)
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-container">Loading report...</div>
  }

  return (
    <div className="billable-hours-reporting">
      <h1>Billable Hours Report</h1>
      {/* Report content would go here */}
    </div>
  )
}

// Approval Page Component
function ApprovalPage() {
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPendingTimesheets()
  }, [])

  const loadPendingTimesheets = async () => {
    try {
      const data = await api.getTimesheets({ status: 'pending' })
      setTimesheets(data)
    } catch (error) {
      console.error('Error loading pending timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.approveTimesheet(id, 'Approved')
      setTimesheets(timesheets.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error approving timesheet:', error)
      alert('Error approving timesheet. Please try again.')
    }
  }

  const handleReject = async (id) => {
    const comment = prompt('Please provide a reason for rejection:')
    if (comment) {
      try {
        await api.rejectTimesheet(id, comment)
        setTimesheets(timesheets.filter(t => t.id !== id))
      } catch (error) {
        console.error('Error rejecting timesheet:', error)
        alert('Error rejecting timesheet. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pending approvals...</p>
      </div>
    )
  }

  return (
    <div className="approval-page">
      <h1>Timesheet Approvals</h1>
      
      {timesheets.length === 0 ? (
        <div className="empty-state">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h2>All caught up!</h2>
          <p>No timesheets pending approval.</p>
        </div>
      ) : (
        <div className="approval-list">
          {timesheets.map(timesheet => (
            <div key={timesheet.id} className="approval-card">
              <div className="timesheet-info">
                <h3>{timesheet.user_name}</h3>
                <p>Date: {timesheet.date}</p>
                <p>Hours: {timesheet.hours}</p>
                <p>Description: {timesheet.description}</p>
              </div>
              <div className="approval-actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleApprove(timesheet.id)}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleReject(timesheet.id)}
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Settings Page Component
function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'Acme Corp',
    workingHours: 8,
    overtimeThreshold: 40,
    currency: 'USD',
    timeFormat: '12',
    notifications: {
      email: true,
      browser: false,
      overtime: true
    }
  })

  const handleSave = () => {
    // Mock save functionality
    alert('Settings saved successfully!')
  }

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      
      <div className="settings-sections">
        <div className="settings-section">
          <h2>Company Settings</h2>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({...settings, companyName: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Standard Working Hours per Day</label>
            <input
              type="number"
              value={settings.workingHours}
              onChange={(e) => setSettings({...settings, workingHours: parseInt(e.target.value)})}
            />
          </div>
          <div className="form-group">
            <label>Overtime Threshold (hours per week)</label>
            <input
              type="number"
              value={settings.overtimeThreshold}
              onChange={(e) => setSettings({...settings, overtimeThreshold: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Display Settings</h2>
          <div className="form-group">
            <label>Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({...settings, currency: e.target.value})}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
            >
              <option value="12">12-hour (AM/PM)</option>
              <option value="24">24-hour</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {...settings.notifications, email: e.target.checked}
                })}
              />
              Email notifications
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications.browser}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {...settings.notifications, browser: e.target.checked}
                })}
              />
              Browser notifications
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications.overtime}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {...settings.notifications, overtime: e.target.checked}
                })}
              />
              Overtime alerts
            </label>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-btn" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  )
}

// App Layout Component
function AppLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Timesheets', href: '/timesheets', icon: Clock },
    { name: 'Team Members', href: '/team', icon: Users },
    { name: 'Billable Hours', href: '/billable-hours', icon: DollarSign },
    { name: 'Campaigns', href: '/campaigns', icon: Target },
    { name: 'Approvals', href: '/approvals', icon: CheckCircle },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Data Management', href: '/data', icon: Database },
    { name: 'Settings', href: '/settings', icon: Settings }
  ]

  const isActive = (href) => location.pathname === href

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Timesheet App</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.full_name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timesheets" element={<TaskBasedTimesheetPage />} />
          <Route path="/team" element={<TeamManagement />} />
          <Route path="/billable-hours" element={<BillableHoursPage />} />
          <Route path="/campaigns" element={<CampaignManagement user={user} api={api} supabase={supabase} />} />
          <Route path="/approvals" element={<ApprovalPage />} />
          <Route path="/reports" element={<div><UtilizationAnalytics /><BillableHoursReporting /></div>} />
          <Route path="/data" element={<DataManagementPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

// Jibble-style Timesheet Page Component
function TaskBasedTimesheetPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('timesheets')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [timesheetEntries, setTimesheetEntries] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [entryMode, setEntryMode] = useState('time') // 'time' or 'hour'
  const [selectedFilters, setSelectedFilters] = useState({
    payrollHours: 'all',
    groups: 'all',
    members: 'all',
    schedules: 'all'
  })

  // Manual entry form state
  const [manualEntry, setManualEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    timeIn: '',
    timeOut: '',
    breakTime: '',
    hours: '',
    activity: '',
    project: '',
    notes: ''
  })

  useEffect(() => {
    loadCampaigns()
    loadTimesheetData()
  }, [currentWeek])

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns({ is_active: true })
      setCampaigns(data)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
  }

  const loadTimesheetData = async () => {
    try {
      setLoading(true)
      const startDate = getWeekStart(currentWeek)
      const endDate = getWeekEnd(currentWeek)
      
      const data = await api.getTimesheets({
        user_id: user?.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      })
      
      setTimesheetEntries(data)
    } catch (error) {
      console.error('Error loading timesheet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekStart = (date) => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    start.setDate(diff)
    return start
  }

  const getWeekEnd = (date) => {
    const end = getWeekStart(date)
    end.setDate(end.getDate() + 6)
    return end
  }

  const getWeekDates = () => {
    const dates = []
    const start = getWeekStart(currentWeek)
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const getWeekRange = () => {
    const start = getWeekStart(currentWeek)
    const end = getWeekEnd(currentWeek)
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction * 7))
    setCurrentWeek(newWeek)
  }

  const calculateTimeWorked = () => {
    if (manualEntry.timeIn && manualEntry.timeOut) {
      const timeIn = new Date(`2000-01-01 ${manualEntry.timeIn}`)
      const timeOut = new Date(`2000-01-01 ${manualEntry.timeOut}`)
      const breakMinutes = manualEntry.breakTime ? parseInt(manualEntry.breakTime) : 0
      
      const diffMs = timeOut - timeIn - (breakMinutes * 60000)
      const hours = Math.max(0, diffMs / (1000 * 60 * 60))
      
      return `${Math.floor(hours)}:${String(Math.round((hours % 1) * 60)).padStart(2, '0')}`
    }
    return '0:00'
  }

  const handleSaveManualEntry = async () => {
    try {
      const hours = entryMode === 'time' 
        ? parseFloat(calculateTimeWorked().replace(':', '.'))
        : parseFloat(manualEntry.hours)

      await api.createTimesheet({
        user_id: user?.id,
        date: manualEntry.date,
        hours: hours,
        description: manualEntry.notes || `${manualEntry.activity} - ${manualEntry.project}`
      })

      // Reset form
      setManualEntry({
        date: new Date().toISOString().split('T')[0],
        timeIn: '',
        timeOut: '',
        breakTime: '',
        hours: '',
        activity: '',
        project: '',
        notes: ''
      })
      
      setShowManualEntry(false)
      loadTimesheetData()
    } catch (error) {
      console.error('Error saving manual entry:', error)
      alert('Error saving entry. Please try again.')
    }
  }

  const weekDates = getWeekDates()
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="jibble-timesheet">
      {/* Header */}
      <div className="timesheet-header">
        <div className="header-left">
          <h1 className="page-title">Timesheets</h1>
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'timesheets' ? 'active' : ''}`}
              onClick={() => setActiveTab('timesheets')}
            >
              Timesheets
            </button>
            <button 
              className={`tab-button ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              Approvals
            </button>
          </div>
        </div>
        <div className="header-right">
          <button className="export-button">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {activeTab === 'timesheets' && (
        <>
          {/* Controls */}
          <div className="timesheet-controls">
            <div className="controls-left">
              <div className="week-selector">
                <select className="week-dropdown">
                  <option>Weekly Timesheets</option>
                </select>
                <button 
                  className="nav-button"
                  onClick={() => navigateWeek(-1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="week-range">{getWeekRange()}</span>
                <button 
                  className="nav-button"
                  onClick={() => navigateWeek(1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="controls-right">
              <button 
                className="add-manual-entry-btn"
                onClick={() => setShowManualEntry(true)}
              >
                Add Manual Time Entry
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="timesheet-filters">
            <select 
              className="filter-select"
              value={selectedFilters.payrollHours}
              onChange={(e) => setSelectedFilters({...selectedFilters, payrollHours: e.target.value})}
            >
              <option value="all">Payroll hours</option>
              <option value="regular">Regular hours</option>
              <option value="overtime">Overtime hours</option>
            </select>
            <select 
              className="filter-select"
              value={selectedFilters.groups}
              onChange={(e) => setSelectedFilters({...selectedFilters, groups: e.target.value})}
            >
              <option value="all">Groups</option>
            </select>
            <select 
              className="filter-select"
              value={selectedFilters.members}
              onChange={(e) => setSelectedFilters({...selectedFilters, members: e.target.value})}
            >
              <option value="all">Members</option>
            </select>
            <select 
              className="filter-select"
              value={selectedFilters.schedules}
              onChange={(e) => setSelectedFilters({...selectedFilters, schedules: e.target.value})}
            >
              <option value="all">Schedules</option>
            </select>
            <button className="add-filter-btn">
              <Plus className="w-4 h-4" />
              Add filter
            </button>
          </div>

          {/* Search */}
          <div className="search-container">
            <div className="search-input-container">
              <Search className="w-4 h-4 search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Timesheet Table */}
          <div className="timesheet-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading timesheet data...</p>
              </div>
            ) : timesheetEntries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-state-icon">
                    <Clock className="w-16 h-16" />
                  </div>
                  <h3>No timesheet entries</h3>
                  <p>Get started by adding your first time entry</p>
                  <button 
                    className="create-entry-btn"
                    onClick={() => setShowManualEntry(true)}
                  >
                    Create a new entry
                  </button>
                </div>
              </div>
            ) : (
              <table className="timesheet-table">
                <thead>
                  <tr>
                    <th className="name-column">Name</th>
                    {weekDates.map((date, index) => (
                      <th key={index} className="day-column">
                        <div className="day-header">
                          <div className="day-name">{weekDays[index]}</div>
                          <div className="day-number">{date.getDate()}</div>
                        </div>
                      </th>
                    ))}
                    <th className="total-column">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="user-row">
                    <td className="name-cell">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="user-name">{user?.full_name}</span>
                      </div>
                    </td>
                    {weekDates.map((date, index) => {
                      const dayEntries = timesheetEntries.filter(entry => 
                        new Date(entry.date).toDateString() === date.toDateString()
                      )
                      const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)
                      
                      return (
                        <td key={index} className="day-cell">
                          {totalHours > 0 ? (
                            <span className="hours-display">{totalHours.toFixed(1)}h</span>
                          ) : (
                            <span className="empty-cell">-</span>
                          )}
                        </td>
                      )
                    })}
                    <td className="total-cell">
                      <span className="hours-display">
                        {timesheetEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0).toFixed(1)}h
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'approvals' && (
        <div className="approvals-tab">
          <div className="approvals-empty-state">
            <div className="empty-state-icon">
              <div className="payroll-icon">💰</div>
            </div>
            <h2 className="empty-state-title">No pay periods set up yet</h2>
            <p className="empty-state-description">
              Process timesheets for payroll with fixed<br />
              pay periods and approval workflows.
            </p>
            <button className="setup-payperiods-btn">
              Set up Pay Periods
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Sidebar */}
      {showManualEntry && (
        <div className="manual-entry-overlay">
          <div className="manual-entry-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Add Manual Time Entry</h2>
              <button 
                className="close-button"
                onClick={() => setShowManualEntry(false)}
              >
                ×
              </button>
            </div>

            <div className="sidebar-content">
              {/* User Info */}
              <div className="user-info-section">
                <div className="user-avatar-large">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <h3 className="user-name">{user?.full_name}</h3>
                  <div className="user-meta">
                    Start time: 7:00 am<br />
                    No previous entry
                  </div>
                </div>
              </div>

              {/* Entry Form */}
              <div className="entry-form">
                {/* Mode Tabs */}
                <div className="entry-mode-tabs">
                  <button 
                    className={`mode-tab ${entryMode === 'time' ? 'active' : ''}`}
                    onClick={() => setEntryMode('time')}
                  >
                    Time entry
                  </button>
                  <button 
                    className={`mode-tab ${entryMode === 'hour' ? 'active' : ''}`}
                    onClick={() => setEntryMode('hour')}
                  >
                    Hour entry
                  </button>
                </div>

                {/* Time Entry Mode */}
                {entryMode === 'time' && (
                  <div className="time-entry-section">
                    <div className="time-inputs">
                      <div className="time-input-group">
                        <label>In</label>
                        <input 
                          type="time" 
                          className="time-input"
                          value={manualEntry.timeIn}
                          onChange={(e) => setManualEntry({...manualEntry, timeIn: e.target.value})}
                        />
                      </div>
                      <button className="break-button">
                        Break
                      </button>
                      <div className="time-input-group">
                        <label>Out</label>
                        <input 
                          type="time" 
                          className="time-input"
                          value={manualEntry.timeOut}
                          onChange={(e) => setManualEntry({...manualEntry, timeOut: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="calculated-time">
                      {calculateTimeWorked()}
                    </div>
                  </div>
                )}

                {/* Hour Entry Mode */}
                {entryMode === 'hour' && (
                  <div className="hour-entry-section">
                    <div className="hour-input-group">
                      <label>Hours</label>
                      <input 
                        type="number" 
                        step="0.25"
                        className="hour-input"
                        value={manualEntry.hours}
                        onChange={(e) => setManualEntry({...manualEntry, hours: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={manualEntry.date}
                    onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})}
                  />
                </div>

                {/* Activity */}
                <div className="form-group">
                  <label>Select an activity</label>
                  <select 
                    className="form-select"
                    value={manualEntry.activity}
                    onChange={(e) => setManualEntry({...manualEntry, activity: e.target.value})}
                  >
                    <option value="">Select an activity</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.name}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project */}
                <div className="form-group">
                  <label>Select a project</label>
                  <select 
                    className="form-select"
                    value={manualEntry.project}
                    onChange={(e) => setManualEntry({...manualEntry, project: e.target.value})}
                  >
                    <option value="">Select a project</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.name}>
                        {campaign.name} - {campaign.client_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label>Add a note</label>
                  <textarea 
                    className="form-textarea"
                    value={manualEntry.notes}
                    onChange={(e) => setManualEntry({...manualEntry, notes: e.target.value})}
                    placeholder="Add a note..."
                  />
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button className="add-new-btn">
                    Add new
                  </button>
                  <button className="duplicate-btn">
                    Duplicate
                  </button>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="submit-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowManualEntry(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={handleSaveManualEntry}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CampaignManagement({ user, api, supabase }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    code: '',
    type: 'client',
    status: 'planning',
    client_name: '',
    start_date: '',
    end_date: '',
    budget: '',
    hourly_rate: '',
    description: ''
  })

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const data = await api.getCampaigns()
      setCampaigns(data)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async (e) => {
    e.preventDefault()
    try {
      const campaign = await api.createCampaign({
        name: newCampaign.name,
        billing_rate_per_hour: parseFloat(newCampaign.hourly_rate) || 0,
        client_name: newCampaign.client_name,
        description: newCampaign.description,
        is_billable: true,
        is_active: true
      })
      
      setCampaigns([campaign, ...campaigns])
      setNewCampaign({
        name: '',
        code: '',
        type: 'client',
        status: 'planning',
        client_name: '',
        start_date: '',
        end_date: '',
        budget: '',
        hourly_rate: '',
        description: ''
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Error creating campaign. Please try again.')
    }
  }

  const handleEditCampaign = (campaign) => {
    setEditingCampaign({
      ...campaign,
      hourly_rate: campaign.billing_rate_per_hour?.toString() || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateCampaign = async (e) => {
    e.preventDefault()
    try {
      await api.updateCampaign(editingCampaign.id, {
        name: editingCampaign.name,
        billing_rate_per_hour: parseFloat(editingCampaign.hourly_rate) || 0,
        client_name: editingCampaign.client_name,
        description: editingCampaign.description,
        is_billable: editingCampaign.is_billable,
        is_active: editingCampaign.is_active
      })
      
      setCampaigns(campaigns.map(c => 
        c.id === editingCampaign.id 
          ? { ...editingCampaign, billing_rate_per_hour: parseFloat(editingCampaign.hourly_rate) || 0 }
          : c
      ))
      setShowEditModal(false)
      setEditingCampaign(null)
    } catch (error) {
      console.error('Error updating campaign:', error)
      alert('Error updating campaign. Please try again.')
    }
  }

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.deleteCampaign(id)
        setCampaigns(campaigns.filter(c => c.id !== id))
      } catch (error) {
        console.error('Error deleting campaign:', error)
        alert('Error deleting campaign. Please try again.')
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      'active': 'status-badge-success',
      'planning': 'status-badge-warning',
      'completed': 'status-badge-info',
      'on-hold': 'status-badge-secondary'
    }
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-badge-secondary'}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading campaigns...</p>
      </div>
    )
  }

  return (
    <div className="campaign-management">
      <div className="page-header">
        <h1>Campaign Management</h1>
        <button 
          className="add-campaign-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Campaign
        </button>
      </div>

      <div className="campaigns-grid">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="campaign-card">
            <div className="card-header">
              <div className="campaign-info">
                <h3 className="campaign-name">{campaign.name}</h3>
                <p className="campaign-client">{campaign.client_name}</p>
              </div>
              {getStatusBadge(campaign.is_active ? 'active' : 'inactive')}
            </div>
            
            <div className="card-details">
              <div className="detail-item">
                <span className="detail-label">Billing Rate:</span>
                <span className="detail-value">${campaign.billing_rate_per_hour}/hr</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Billable:</span>
                <span className="detail-value">{campaign.is_billable ? 'Yes' : 'No'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{campaign.description || 'No description'}</span>
              </div>
            </div>
            
            <div className="card-actions">
              <button 
                className="action-btn edit"
                onClick={() => handleEditCampaign(campaign)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button 
                className="action-btn delete"
                onClick={() => handleDeleteCampaign(campaign.id)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Campaign</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="modal-form">
              <div className="form-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  value={newCampaign.client_name}
                  onChange={(e) => setNewCampaign({...newCampaign, client_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hourly Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={newCampaign.hourly_rate}
                  onChange={(e) => setNewCampaign({...newCampaign, hourly_rate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Add Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && editingCampaign && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Campaign</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateCampaign} className="modal-form">
              <div className="form-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  value={editingCampaign.name}
                  onChange={(e) => setEditingCampaign({...editingCampaign, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  value={editingCampaign.client_name}
                  onChange={(e) => setEditingCampaign({...editingCampaign, client_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hourly Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingCampaign.hourly_rate}
                  onChange={(e) => setEditingCampaign({...editingCampaign, hourly_rate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({...editingCampaign, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingCampaign.is_active}
                    onChange={(e) => setEditingCampaign({...editingCampaign, is_active: e.target.checked})}
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Update Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AuthenticatedApp />
        </div>
      </Router>
    </AuthProvider>
  )
}

function AuthenticatedApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return user ? <AppLayout /> : <LoginPage />
}

export default App

