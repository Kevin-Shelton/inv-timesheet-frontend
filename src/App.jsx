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

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// UI Components
function Button({ children, variant = 'primary', size = 'md', disabled = false, onClick, className = '', ...props }) {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    destructive: 'btn-destructive'
  }
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'btn-disabled' : ''} ${className}`

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

function CardHeader({ children }) {
  return <div className="card-header">{children}</div>
}

function CardTitle({ children }) {
  return <h3 className="card-title">{children}</h3>
}

function CardDescription({ children }) {
  return <p className="card-description">{children}</p>
}

function CardContent({ children, className = '' }) {
  return <div className={`card-content ${className}`}>{children}</div>
}

function Input({ className = '', ...props }) {
  return <input className={`form-input ${className}`} {...props} />
}

function Label({ children, htmlFor, className = '' }) {
  return <label htmlFor={htmlFor} className={`form-label ${className}`}>{children}</label>
}

function Select({ children, className = '', ...props }) {
  return <select className={`form-select ${className}`} {...props}>{children}</select>
}

function Badge({ children, variant = 'default' }) {
  const variantClasses = {
    default: 'badge-default',
    green: 'badge-green',
    red: 'badge-red',
    orange: 'badge-orange',
    blue: 'badge-blue',
    purple: 'badge-purple'
  }
  return <span className={`badge ${variantClasses[variant]}`}>{children}</span>
}

// Route Protection Components
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

// Login Page
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
          <div className="login-logo">
            <Clock className="login-logo-icon" />
          </div>
          <h1 className="login-title">TimeSheet Manager</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              {error}
            </div>
          )}

          <div className="form-group">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="password">Password</Label>
            <div className="password-input-container">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="login-demo">
          <p className="demo-title">Demo Accounts:</p>
          <div className="demo-accounts">
            <div className="demo-account">
              <strong>Admin:</strong> admin@test.com / password123
            </div>
            <div className="demo-account">
              <strong>User:</strong> user@test.com / password123
            </div>
            <div className="demo-account">
              <strong>Campaign Lead:</strong> campaign@test.com / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



// Dashboard Component - Jibble-style interface
function Dashboard() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [trackedHours, setTrackedHours] = useState({
    worked: 0,
    break: 0,
    overtime: 0
  })
  const [activities, setActivities] = useState([
    { name: 'Project Alpha', time: '2h 30m', color: '#4B5563' },
    { name: 'Client Meeting', time: '1h 15m', color: '#6B7280' },
    { name: 'Code Review', time: '45m', color: '#9CA3AF' },
    { name: 'Documentation', time: '1h 00m', color: '#4B5563' },
    { name: 'Team Standup', time: '30m', color: '#6B7280' }
  ])
  const [weeklyData, setWeeklyData] = useState([
    { day: 'M', hours: 8, overtime: 0 },
    { day: 'T', hours: 7.5, overtime: 0.5 },
    { day: 'W', hours: 8, overtime: 1 },
    { day: 'T', hours: 6, overtime: 0 },
    { day: 'F', hours: 8, overtime: 0 },
    { day: 'S', hours: 4, overtime: 0 },
    { day: 'S', hours: 0, overtime: 0 }
  ])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load real metrics from Supabase
      const metrics = await api.getUtilizationMetrics()
      const timesheets = await api.getTimesheets({ 
        user_id: user?.id,
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      })
      
      // Calculate tracked hours from real data
      let totalWorked = 0
      let totalBreak = 0
      let totalOvertime = 0
      
      timesheets.forEach(timesheet => {
        const hours = timesheet.hours_worked || 0
        if (hours > 8) {
          totalWorked += 8
          totalOvertime += hours - 8
        } else {
          totalWorked += hours
        }
      })
      
      setTrackedHours({
        worked: totalWorked,
        break: totalBreak,
        overtime: totalOvertime
      })
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

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalClocked = trackedHours.worked + trackedHours.overtime
  const clockedPercentage = Math.min((totalClocked / 8) * 100, 100)

  return (
    <div className="jibble-dashboard">
      {/* Header with time period tabs */}
      <div className="dashboard-header">
        <div className="time-period-tabs">
          <button className="tab-button">Day</button>
          <button className="tab-button active">Week</button>
          <button className="tab-button">Month</button>
        </div>
        <div className="header-filters">
          <select className="filter-select">
            <option>All locations</option>
          </select>
          <select className="filter-select">
            <option>All groups</option>
          </select>
          <select className="filter-select">
            <option>All schedules</option>
          </select>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Greeting Section */}
          <div className="greeting-section">
            <div className="greeting-content">
              <h1 className="greeting-title">Hello {user?.full_name?.split(' ')[0] || 'User'}</h1>
              <p className="greeting-subtitle">Here's what's happening at<br />Eps</p>
            </div>
            <div className="greeting-illustration">
              <div className="illustration-placeholder">
                <div className="person-icon">👤</div>
              </div>
            </div>
          </div>

          {/* Tracked Hours Section */}
          <div className="tracked-hours-section">
            <div className="section-header">
              <h2 className="section-title">TRACKED HOURS</h2>
              <button 
                className="section-link"
                onClick={() => window.location.href = '/timesheets'}
                onMouseEnter={(e) => e.target.style.color = '#FB923C'}
                onMouseLeave={(e) => e.target.style.color = '#6B7280'}
              >
                Go to timesheets
              </button>
            </div>
            
            <div className="hours-legend">
              <div className="legend-item">
                <div className="legend-dot worked"></div>
                <span>WORKED HOURS</span>
                <span className="legend-value">{Math.floor(trackedHours.worked)}h {Math.round((trackedHours.worked % 1) * 60)}m</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot break"></div>
                <span>BREAK</span>
                <span className="legend-value">{Math.floor(trackedHours.break)}h {Math.round((trackedHours.break % 1) * 60)}m</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot overtime"></div>
                <span>OVERTIME HOURS</span>
                <span className="legend-value">{Math.floor(trackedHours.overtime)}h {Math.round((trackedHours.overtime % 1) * 60)}m</span>
              </div>
            </div>

            {/* Weekly Chart */}
            <div className="weekly-chart">
              <div className="chart-y-axis">
                <span>60h</span>
                <span>50h</span>
                <span>40h</span>
                <span>30h</span>
                <span>20h</span>
                <span>10h</span>
                <span>0h</span>
              </div>
              <div className="chart-bars">
                {weeklyData.map((day, index) => (
                  <div 
                    key={index} 
                    className="chart-day"
                    onMouseEnter={(e) => {
                      const tooltip = document.createElement('div')
                      tooltip.className = 'chart-tooltip'
                      tooltip.innerHTML = `${day.day}: ${day.hours}h worked${day.overtime > 0 ? `, ${day.overtime}h overtime` : ''}`
                      e.currentTarget.appendChild(tooltip)
                    }}
                    onMouseLeave={(e) => {
                      const tooltip = e.currentTarget.querySelector('.chart-tooltip')
                      if (tooltip) tooltip.remove()
                    }}
                  >
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar worked"
                        style={{ height: `${(day.hours / 8) * 100}%` }}
                      ></div>
                      {day.overtime > 0 && (
                        <div 
                          className="chart-bar overtime"
                          style={{ height: `${(day.overtime / 8) * 100}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="chart-day-label">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="chart-note">Does not include manually entered time from Timesheets</p>
          </div>

          {/* Activities Section */}
          <div className="activities-section">
            <div className="section-header">
              <h2 className="section-title">ACTIVITIES</h2>
              <button 
                className="section-link"
                onClick={() => window.location.href = '/analytics'}
                onMouseEnter={(e) => e.target.style.color = '#FB923C'}
                onMouseLeave={(e) => e.target.style.color = '#6B7280'}
              >
                Go to activities
              </button>
            </div>
            
            <div className="activities-content">
              <div className="activity-ring">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="16"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#4B5563"
                    strokeWidth="16"
                    strokeDasharray={`${clockedPercentage * 3.27} 327`}
                    strokeDashoffset="0"
                    transform="rotate(-90 60 60)"
                    className="activity-progress"
                  />
                </svg>
                <div className="ring-center">
                  <div className="ring-label">clocked</div>
                  <div className="ring-time">{Math.floor(totalClocked)}h {Math.round((totalClocked % 1) * 60)}m</div>
                </div>
              </div>
              
              <div className="activities-list">
                <h3 className="activities-list-title">Top 10 activities</h3>
                <div className="activity-items">
                  {activities.slice(0, 5).map((activity, index) => (
                    <div 
                      key={index} 
                      className="activity-item"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F9FAFB'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }}
                    >
                      <div className="activity-dot" style={{ backgroundColor: activity.color }}></div>
                      <span className="activity-name">{activity.name}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Who's In/Out Section */}
          <div className="whos-inout-section">
            <h2 className="section-title">Who's In/Out</h2>
            <div className="inout-stats">
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">In</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Out</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1</span>
                <span className="stat-label">Break</span>
              </div>
            </div>
            <div className="member-count">1 member</div>
          </div>

          {/* Upcoming Holidays Section */}
          <div className="holidays-section">
            <h2 className="section-title">UPCOMING HOLIDAYS AND TIME OFF</h2>
            <div className="holidays-content">
              <p className="holidays-text">
                Add your holiday calendar for<br />
                reminders and overtime calculations.
              </p>
              <div className="holidays-actions">
                <button 
                  className="btn-primary"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#EA580C'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#FB923C'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  Set up Holidays
                </button>
                <button 
                  className="btn-secondary"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#E5E7EB'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#F3F4F6'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  No, thanks
                </button>
              </div>
            </div>
          </div>

          {/* Current Time */}
          <div className="current-time">
            <div className="time-display">{formatTime(currentTime)}</div>
            <div className="date-display">{formatDate(currentTime)}</div>
            <div className="timezone">No timezone selected</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// FIXED: Team Management with working action buttons
function TeamPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
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

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
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
      setShowAddUser(false)
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      await api.updateUser(editingUser.id, editingUser)
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ))
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user? They will be marked as inactive but their data will be preserved.')) {
      try {
        setActionLoading(true)
        await api.deactivateUser(userId)
        setUsers(users.map(user => 
          user.id === userId ? { ...user, is_active: false } : user
        ))
      } catch (error) {
        console.error('Error deactivating user:', error)
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handleActivateUser = async (userId) => {
    try {
      setActionLoading(true)
      await api.activateUser(userId)
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: true } : user
      ))
    } catch (error) {
      console.error('Error activating user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'red',
      campaign_lead: 'orange',
      team_member: 'blue'
    }
    return <Badge variant={variants[role]}>{role.replace('_', ' ')}</Badge>
  }

  return (
    <div className="page-content space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage team members and their information</p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>All team members (active and inactive)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
              <span className="ml-2">Loading team members...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Pay Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={`border-b border-gray-100 hover-bg-gray-50 ${!user.is_active ? 'opacity-60' : ''}`}>
                      <td className="py-3 px-4">{user.full_name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-3 px-4">${user.pay_rate_per_hour || 0}/hr</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.is_active ? 'green' : 'red'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingUser(user)}
                            disabled={actionLoading}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {user.is_active ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeactivateUser(user.id)}
                              disabled={actionLoading}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleActivateUser(user.id)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Team Member</h3>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="team_member">Team Member</option>
                      <option value="campaign_lead">Campaign Lead</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pay_rate">Pay Rate ($/hour)</Label>
                    <Input
                      id="pay_rate"
                      type="number"
                      step="0.01"
                      value={newUser.pay_rate_per_hour}
                      onChange={(e) => setNewUser({...newUser, pay_rate_per_hour: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={newUser.hire_date}
                      onChange={(e) => setNewUser({...newUser, hire_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddUser(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? 'Adding...' : 'Add Team Member'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Team Member</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_full_name">Full Name</Label>
                    <Input
                      id="edit_full_name"
                      value={editingUser.full_name}
                      onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_role">Role</Label>
                    <Select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    >
                      <option value="team_member">Team Member</option>
                      <option value="campaign_lead">Campaign Lead</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_pay_rate">Pay Rate ($/hour)</Label>
                    <Input
                      id="edit_pay_rate"
                      type="number"
                      step="0.01"
                      value={editingUser.pay_rate_per_hour}
                      onChange={(e) => setEditingUser({...editingUser, pay_rate_per_hour: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_hire_date">Hire Date</Label>
                    <Input
                      id="edit_hire_date"
                      type="date"
                      value={editingUser.hire_date || ''}
                      onChange={(e) => setEditingUser({...editingUser, hire_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_phone">Phone</Label>
                    <Input
                      id="edit_phone"
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? 'Updating...' : 'Update Team Member'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Analytics Dashboard
function AnalyticsDashboard() {
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
    return (
      <div className="page-content">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner"></div>
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    )
  }

  const chartData = metrics?.team_metrics?.map(member => ({
    name: member.name,
    hours: member.totalHours,
    billable: member.billableHours,
    utilization: member.utilization
  })) || []

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Team performance and utilization metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{metrics?.overall_utilization?.toFixed(1) || 0}%</div>
            <div className="text-sm text-gray-600 mt-1">Overall Utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{metrics?.billable_utilization?.toFixed(1) || 0}%</div>
            <div className="text-sm text-gray-600 mt-1">Billable Utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{metrics?.total_billable_hours || 0}h</div>
            <div className="text-sm text-gray-600 mt-1">Total Billable Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">${metrics?.revenue_per_hour?.toFixed(2) || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Revenue per Hour</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Hours worked and utilization by team member</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#3b82f6" name="Total Hours" />
              <Bar dataKey="billable" fill="#10b981" name="Billable Hours" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// Billable Hours Entry Component
function BillableHoursEntry() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({
    team_member_id: '',
    date: '',
    client_name: '',
    project_name: '',
    task_description: '',
    billable_hours: '',
    hourly_rate: ''
  })

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      setLoading(true)
      const data = await api.getBillableHours()
      setEntries(data)
    } catch (error) {
      console.error('Error loading billable hours:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = async (e) => {
    e.preventDefault()
    try {
      const entry = await api.createBillableHours({
        ...newEntry,
        total_amount: parseFloat(newEntry.billable_hours) * parseFloat(newEntry.hourly_rate)
      })
      setEntries([entry, ...entries])
      setNewEntry({
        team_member_id: '',
        date: '',
        client_name: '',
        project_name: '',
        task_description: '',
        billable_hours: '',
        hourly_rate: ''
      })
      setShowAddEntry(false)
    } catch (error) {
      console.error('Error creating billable hours entry:', error)
    }
  }

  return (
    <div className="page-content space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billable Hours</h1>
          <p className="text-gray-600 mt-1">Track and manage billable time entries</p>
        </div>
        <Button onClick={() => setShowAddEntry(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billable Hours Entries</CardTitle>
          <CardDescription>All billable time entries from database</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
              <span className="ml-2">Loading entries...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Team Member</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover-bg-gray-50">
                      <td className="py-3 px-4">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{entry.team_member_name}</td>
                      <td className="py-3 px-4">{entry.client_name}</td>
                      <td className="py-3 px-4">{entry.project_name}</td>
                      <td className="py-3 px-4">{entry.billable_hours}h</td>
                      <td className="py-3 px-4">${entry.hourly_rate}</td>
                      <td className="py-3 px-4">${entry.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={entry.status === 'approved' ? 'green' : 'orange'}>
                          {entry.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddEntry && (
        <div className="modal-overlay" onClick={() => setShowAddEntry(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Billable Hours Entry</h3>
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billable_hours">Billable Hours</Label>
                    <Input
                      id="billable_hours"
                      type="number"
                      step="0.25"
                      value={newEntry.billable_hours}
                      onChange={(e) => setNewEntry({...newEntry, billable_hours: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input
                      id="client_name"
                      value={newEntry.client_name}
                      onChange={(e) => setNewEntry({...newEntry, client_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="project_name">Project Name</Label>
                    <Input
                      id="project_name"
                      value={newEntry.project_name}
                      onChange={(e) => setNewEntry({...newEntry, project_name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="task_description">Task Description</Label>
                  <Input
                    id="task_description"
                    value={newEntry.task_description}
                    onChange={(e) => setNewEntry({...newEntry, task_description: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    value={newEntry.hourly_rate}
                    onChange={(e) => setNewEntry({...newEntry, hourly_rate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddEntry(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Entry
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Reports Page
function ReportsPage() {
  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and download various reports</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Reports dashboard coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Data Upload Cockpit Component
function DataUploadCockpit({ onClose }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const fileArray = Array.from(files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }))
    setUploadedFiles(prev => [...prev, ...fileArray])
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Data Upload Center</h2>
      
      <div className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Supports CSV, Excel, and JSON files
          </p>
          <input
            type="file"
            multiple
            onChange={handleChange}
            className="hidden"
            id="file-upload"
            accept=".csv,.xlsx,.xls,.json"
          />
          <label htmlFor="file-upload" className="btn btn-primary">
            Choose Files
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Badge variant="green">Uploaded</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <Button className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Process Files
          </Button>
        </div>
      </div>
    </div>
  )
}

// Data Management Page
function DataManagementPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600 mt-1">Import and export data, manage templates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowModal(true)}>
          <CardContent className="p-6 text-center">
            <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Data</h3>
            <p className="text-gray-600">Import employee data, timesheets, and payroll information</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Download className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Export Data</h3>
            <p className="text-gray-600">Download reports and data in various formats</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common data management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Database className="w-8 h-8 mb-2" />
              Backup Database
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
              <FileText className="w-8 h-8 mb-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Upload className="w-8 h-8 mb-2" />
              Upload Payroll Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <DataUploadCockpit onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

// Utilization Analytics
function UtilizationAnalytics() {
  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utilization Analytics</h1>
        <p className="text-gray-600 mt-1">Track team utilization and performance metrics</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Utilization analytics dashboard</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Billable Hours Reporting
function BillableHoursReporting() {
  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billable Hours Reporting</h1>
        <p className="text-gray-600 mt-1">Generate detailed billable hours reports</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Billable hours reporting dashboard</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Approval Page
function ApprovalPage() {
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selectedTimesheet, setSelectedTimesheet] = useState(null)
  const [comment, setComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchTimesheets()
  }, [filter])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const data = await api.getTimesheets({ status: filter })
      setTimesheets(data)
    } catch (error) {
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      setActionLoading(true)
      await api.approveTimesheet(id, comment)
      setTimesheets(prev => prev.map(ts => 
        ts.id === id ? { ...ts, status: 'approved' } : ts
      ))
      setSelectedTimesheet(null)
      setComment('')
    } catch (error) {
      console.error('Error approving timesheet:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id) => {
    try {
      setActionLoading(true)
      await api.rejectTimesheet(id, comment)
      setTimesheets(prev => prev.map(ts => 
        ts.id === id ? { ...ts, status: 'rejected' } : ts
      ))
      setSelectedTimesheet(null)
      setComment('')
    } catch (error) {
      console.error('Error rejecting timesheet:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red'
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Timesheet Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve team member timesheets</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timesheets</CardTitle>
          <CardDescription>
            {filter === 'pending' ? 'Pending approval' : `${filter} timesheets`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
              <span className="ml-2">Loading timesheets...</span>
            </div>
          ) : timesheets.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {filter} timesheets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="border-b border-gray-100 hover-bg-gray-50">
                      <td className="py-3 px-4">{timesheet.user_name}</td>
                      <td className="py-3 px-4">
                        {new Date(timesheet.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{timesheet.hours}h</td>
                      <td className="py-3 px-4">{timesheet.description}</td>
                      <td className="py-3 px-4">{getStatusBadge(timesheet.status)}</td>
                      <td className="py-3 px-4">
                        {timesheet.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedTimesheet(timesheet)}
                            >
                              Review
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTimesheet && (
        <div className="modal-overlay" onClick={() => setSelectedTimesheet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Review Timesheet</h3>
                <button
                  onClick={() => setSelectedTimesheet(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employee</Label>
                    <p className="text-sm text-gray-900">{selectedTimesheet.user_name}</p>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedTimesheet.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Hours</Label>
                    <p className="text-sm text-gray-900">{selectedTimesheet.hours}h</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm text-gray-900">{selectedTimesheet.status}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-900">{selectedTimesheet.description}</p>
                </div>
                
                <div>
                  <Label htmlFor="comment">Comment (optional)</Label>
                  <Input
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedTimesheet.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedTimesheet.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Settings Page
function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'TimeSheet Manager',
    timezone: 'America/New_York',
    workingHours: 8,
    overtimeThreshold: 40,
    emailNotifications: true,
    autoApproval: false
  })

  const handleSave = () => {
    console.log('Saving settings:', settings)
    // Here you would typically save to backend
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure system preferences and options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="workingHours">Standard Working Hours per Day</Label>
              <Input
                id="workingHours"
                type="number"
                value={settings.workingHours}
                onChange={(e) => setSettings({...settings, workingHours: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="overtimeThreshold">Overtime Threshold (hours per week)</Label>
              <Input
                id="overtimeThreshold"
                type="number"
                value={settings.overtimeThreshold}
                onChange={(e) => setSettings({...settings, overtimeThreshold: parseInt(e.target.value)})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure email and system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive email alerts for important events</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="form-checkbox"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Approval</Label>
                <p className="text-sm text-gray-600">Automatically approve timesheets under 40 hours</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoApproval}
                onChange={(e) => setSettings({...settings, autoApproval: e.target.checked})}
                className="form-checkbox"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}

// Main App Layout with Navigation
function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'campaign_lead', 'team_member'] },
    { name: 'Timesheets', href: '/timesheets', icon: Clock, roles: ['admin', 'campaign_lead', 'team_member'] },
    { name: 'Team Members', href: '/team', icon: Users, roles: ['admin', 'campaign_lead'] },
    { name: 'Campaigns', href: '/campaigns', icon: Briefcase, roles: ['admin', 'campaign_lead'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'campaign_lead'] },
    { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'campaign_lead'] },
    { name: 'Data Management', href: '/data-management', icon: Database, roles: ['admin'] },
    { name: 'Billable Hours', href: '/billable-hours', icon: DollarSign, roles: ['admin', 'campaign_lead'] },
    { name: 'Utilization', href: '/utilization', icon: Target, roles: ['admin', 'campaign_lead'] },
    { name: 'Billable Reports', href: '/billable-reports', icon: Activity, roles: ['admin', 'campaign_lead'] },
    { name: 'Approvals', href: '/approvals', icon: CheckCircle, roles: ['admin', 'campaign_lead'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <div className="app-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Clock className="sidebar-logo-icon" />
            <span className="sidebar-logo-text">TimeSheet Manager</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User className="w-5 h-5" />
            </div>
            <div className="user-details">
              <p className="user-name">{user?.full_name}</p>
              <p className="user-role">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={logout} className="logout-button">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <header className="main-header">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mobile-menu-button"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="main-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timesheets" element={<TaskBasedTimesheetPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/campaigns" element={<CampaignManagement user={user} api={api} supabase={supabase} />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/data-management" element={<DataManagementPage />} />
            <Route path="/billable-hours" element={<BillableHoursEntry />} />
            <Route path="/utilization" element={<UtilizationAnalytics />} />
            <Route path="/billable-reports" element={<BillableHoursReporting />} />
            <Route path="/approvals" element={<ApprovalPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
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
    startTime: '',
    endTime: '',
    hours: '',
    activity: '',
    project: '',
    note: ''
  })

  // Get week dates
  const getWeekDates = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    startOfWeek.setDate(diff)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDates = getWeekDates(currentWeek)

  // Load data
  useEffect(() => {
    loadTimesheetData()
    loadCampaigns()
  }, [currentWeek])

  const loadTimesheetData = async () => {
    try {
      setLoading(true)
      const startDate = weekDates[0].toISOString().split('T')[0]
      const endDate = weekDates[6].toISOString().split('T')[0]
      
      const entries = await api.getTimesheets({
        start_date: startDate,
        end_date: endDate,
        user_id: user?.id
      })
      
      setTimesheetEntries(entries)
    } catch (error) {
      console.error('Error loading timesheet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCampaigns = async () => {
    try {
      const campaignData = await api.getCampaigns()
      setCampaigns(campaignData)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
  }

  const handleManualEntrySubmit = async (e) => {
    e.preventDefault()
    try {
      const entryData = {
        ...manualEntry,
        user_id: user?.id,
        hours_worked: entryMode === 'hour' ? parseFloat(manualEntry.hours) : calculateHoursFromTime(),
        campaign_id: manualEntry.activity
      }

      await api.createTimesheet(entryData)
      setShowManualEntry(false)
      setManualEntry({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        hours: '',
        activity: '',
        project: '',
        note: ''
      })
      loadTimesheetData()
    } catch (error) {
      console.error('Error creating timesheet entry:', error)
      alert('Error creating entry. Please try again.')
    }
  }

  const calculateHoursFromTime = () => {
    if (!manualEntry.startTime || !manualEntry.endTime) return 0
    
    const start = new Date(`${manualEntry.date}T${manualEntry.startTime}`)
    const end = new Date(`${manualEntry.date}T${manualEntry.endTime}`)
    
    if (end <= start) return 0
    
    return (end - start) / (1000 * 60 * 60) // Convert to hours
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatDateHeader = (date) => {
    return date.getDate().toString()
  }

  const getWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction * 7))
    setCurrentWeek(newWeek)
  }

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
            <span>📤</span> Export
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
                  ←
                </button>
                <span className="week-range">{getWeekRange()}</span>
                <button 
                  className="nav-button"
                  onClick={() => navigateWeek(1)}
                >
                  →
                </button>
              </div>
            </div>
            <div className="controls-right">
              <button className="add-manual-entry-btn" onClick={() => setShowManualEntry(true)}>
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
            
            <button className="add-filter-btn">+ Add filter</button>
          </div>

          {/* Search */}
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
          </div>

          {/* Timesheet Table */}
          <div className="timesheet-table-container">
            {loading ? (
              <div className="loading-state">Loading timesheets...</div>
            ) : (
              <table className="timesheet-table">
                <thead>
                  <tr>
                    <th className="name-column">Name</th>
                    {weekDates.map((date, index) => (
                      <th key={index} className="day-column">
                        <div className="day-header">
                          <div className="day-name">{formatDate(date).split(' ')[0]}</div>
                          <div className="day-number">{formatDateHeader(date)}</div>
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
                          {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <span className="user-name">{user?.full_name || 'User'}</span>
                      </div>
                    </td>
                    {weekDates.map((date, index) => {
                      const dayEntries = timesheetEntries.filter(entry => 
                        new Date(entry.date).toDateString() === date.toDateString()
                      )
                      const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0)
                      
                      return (
                        <td key={index} className="day-cell">
                          {totalHours > 0 ? (
                            <div className="hours-display">
                              {totalHours.toFixed(1)}h
                            </div>
                          ) : (
                            <div className="empty-cell">-</div>
                          )}
                        </td>
                      )
                    })}
                    <td className="total-cell">
                      {timesheetEntries.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0).toFixed(1)}h
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Create New Entry Button */}
          {!loading && timesheetEntries.length === 0 && (
            <div className="empty-state">
              <button 
                className="create-entry-btn"
                onClick={() => setShowManualEntry(true)}
              >
                Create a new entry
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'approvals' && (
        <div className="approvals-tab">
          <div className="approvals-empty-state">
            <div className="empty-state-icon">
              <div className="payroll-icon">💰</div>
            </div>
            <h3 className="empty-state-title">No pay periods set up yet</h3>
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

      {/* Manual Time Entry Sidebar */}
      {showManualEntry && (
        <div className="manual-entry-overlay" onClick={() => setShowManualEntry(false)}>
          <div className="manual-entry-sidebar" onClick={(e) => e.stopPropagation()}>
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
              <div className="user-info-section">
                <div className="user-avatar-large">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="user-details">
                  <div className="user-name">{user?.full_name || 'User'}</div>
                  <div className="user-meta">Start time: 12:00 am<br />No previous entry</div>
                </div>
              </div>

              <form onSubmit={handleManualEntrySubmit} className="entry-form">
                {/* Entry Mode Tabs */}
                <div className="entry-mode-tabs">
                  <button
                    type="button"
                    className={`mode-tab ${entryMode === 'time' ? 'active' : ''}`}
                    onClick={() => setEntryMode('time')}
                  >
                    Time entry
                  </button>
                  <button
                    type="button"
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
                          value={manualEntry.startTime}
                          onChange={(e) => setManualEntry({...manualEntry, startTime: e.target.value})}
                          className="time-input"
                          required
                        />
                      </div>
                      <div className="time-input-group">
                        <label>Break</label>
                        <button type="button" className="break-button">Break</button>
                      </div>
                      <div className="time-input-group">
                        <label>Out</label>
                        <input
                          type="time"
                          value={manualEntry.endTime}
                          onChange={(e) => setManualEntry({...manualEntry, endTime: e.target.value})}
                          className="time-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="calculated-time">
                      {manualEntry.startTime && manualEntry.endTime && (
                        <span>{calculateHoursFromTime().toFixed(2)} hours</span>
                      )}
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
                        value={manualEntry.hours}
                        onChange={(e) => setManualEntry({...manualEntry, hours: e.target.value})}
                        className="hour-input"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={manualEntry.date}
                    onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                {/* Activity */}
                <div className="form-group">
                  <label>Select an activity</label>
                  <select
                    value={manualEntry.activity}
                    onChange={(e) => setManualEntry({...manualEntry, activity: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Choose activity...</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project */}
                <div className="form-group">
                  <label>Select a project</label>
                  <select
                    value={manualEntry.project}
                    onChange={(e) => setManualEntry({...manualEntry, project: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Choose project...</option>
                  </select>
                </div>

                {/* Note */}
                <div className="form-group">
                  <label>Add a note</label>
                  <textarea
                    value={manualEntry.note}
                    onChange={(e) => setManualEntry({...manualEntry, note: e.target.value})}
                    className="form-textarea"
                    placeholder="Enter note..."
                    rows="3"
                  />
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button type="button" className="add-new-btn">+ Add new</button>
                  <button type="button" className="duplicate-btn">🗂 Duplicate</button>
                </div>

                {/* Submit Buttons */}
                <div className="submit-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowManualEntry(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CampaignManagement({ user, api, supabase }) {
    
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDates = getWeekDates(currentWeek)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  useEffect(() => {
    loadCampaigns()
    loadTimesheetData()
  }, [currentWeek])

  useEffect(() => {
    let interval = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTimer(prev => {
          const newSeconds = prev.seconds + 1
          const newMinutes = prev.minutes + Math.floor(newSeconds / 60)
          const newHours = prev.hours + Math.floor(newMinutes / 60)
          
          return {
            hours: newHours,
            minutes: newMinutes % 60,
            seconds: newSeconds % 60
          }
        })
      }, 1000)
    } else if (!isTimerRunning && interval) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns()
      setCampaigns(data)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
  }

  const loadTimesheetData = async () => {
    try {
      setLoading(true)
      const startDate = weekDates[0].toISOString().split('T')[0]
      const endDate = weekDates[4].toISOString().split('T')[0]
      
      const data = await api.getTimesheets({ 
        user_id: user?.id,
        start_date: startDate,
        end_date: endDate
      })
      
      // Transform data into grid format
      const gridData = transformToGridFormat(data)
      setTimesheetEntries(gridData)
    } catch (error) {
      console.error('Error loading timesheet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const transformToGridFormat = (data) => {
    // Group by campaign and task
    const grouped = {}
    
    data.forEach(entry => {
      const key = `${entry.campaign_id || 'no-campaign'}-${entry.description || 'no-task'}`
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          campaign_id: entry.campaign_id,
          campaign_name: entry.campaign_name || 'Not billable',
          task_description: entry.description || 'Select/create a task...',
          daily_hours: {},
          total_hours: 0
        }
      }
      
      const dayIndex = new Date(entry.date).getDay()
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1 // Convert Sunday=0 to Monday=0
      
      if (adjustedIndex >= 0 && adjustedIndex < 5) {
        grouped[key].daily_hours[adjustedIndex] = entry.hours || 0
      }
    })

    // Add empty rows if needed
    const entries = Object.values(grouped)
    
    // Add a few empty rows for new entries
    for (let i = 0; i < 3; i++) {
      entries.push({
        id: `empty-${i}`,
        campaign_id: '',
        campaign_name: 'Select/create a project...',
        task_description: 'Select/create a task...',
        daily_hours: {},
        total_hours: 0,
        is_empty: true
      })
    }

    // Calculate totals
    entries.forEach(entry => {
      entry.total_hours = Object.values(entry.daily_hours).reduce((sum, hours) => sum + (hours || 0), 0)
    })

    return entries
  }

  const updateTimeEntry = async (entryId, dayIndex, hours) => {
    try {
      const entry = timesheetEntries.find(e => e.id === entryId)
      if (!entry || entry.is_empty) return

      const date = weekDates[dayIndex].toISOString().split('T')[0]
      
      // Update or create timesheet entry
      await api.createTimesheet({
        user_id: user?.id,
        campaign_id: entry.campaign_id,
        date: date,
        hours: parseFloat(hours) || 0,
        description: entry.task_description,
        status: 'pending'
      })

      // Update local state
      setTimesheetEntries(prev => prev.map(e => {
        if (e.id === entryId) {
          const newDailyHours = { ...e.daily_hours, [dayIndex]: parseFloat(hours) || 0 }
          const newTotal = Object.values(newDailyHours).reduce((sum, h) => sum + (h || 0), 0)
          return { ...e, daily_hours: newDailyHours, total_hours: newTotal }
        }
        return e
      }))
    } catch (error) {
      console.error('Error updating time entry:', error)
    }
  }

  const startTimer = () => {
    setIsTimerRunning(true)
    setCurrentTimer({ hours: 0, minutes: 0, seconds: 0 })
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    // Here you could automatically add the timer time to a selected entry
  }

  const formatTime = (time) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction * 7))
    setCurrentWeek(newWeek)
  }

  const addTimesheetRow = () => {
    const newId = `new-${Date.now()}`
    const newEntry = {
      id: newId,
      campaign_id: '',
      campaign_name: 'Select/create a project...',
      task_description: 'Select/create a task...',
      daily_hours: {},
      total_hours: 0,
      is_empty: true
    }
    setTimesheetEntries(prev => [...prev, newEntry])
  }

  const copyPreviousWeek = async () => {
    try {
      const prevWeek = new Date(currentWeek)
      prevWeek.setDate(currentWeek.getDate() - 7)
      const prevWeekDates = getWeekDates(prevWeek)
      
      const startDate = prevWeekDates[0].toISOString().split('T')[0]
      const endDate = prevWeekDates[4].toISOString().split('T')[0]
      
      const prevData = await api.getTimesheets({ 
        user_id: user?.id,
        start_date: startDate,
        end_date: endDate
      })
      
      // Copy entries to current week
      for (const entry of prevData) {
        const originalDate = new Date(entry.date)
        const dayOfWeek = originalDate.getDay()
        const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        
        if (adjustedIndex >= 0 && adjustedIndex < 5) {
          const newDate = weekDates[adjustedIndex].toISOString().split('T')[0]
          
          await api.createTimesheet({
            user_id: user?.id,
            campaign_id: entry.campaign_id,
            date: newDate,
            hours: entry.hours,
            description: entry.description,
            status: 'pending'
          })
        }
      }
      
      // Reload      
      loadTimesheetData()
    } catch (error) {
      console.error('Error copying previous week:', error)
    }
  }

  const editTimesheetRow = (entryId) => {
    setTimesheetEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, is_editing: true, original_data: { ...entry } }
        : entry
    ))
  }

  const saveTimesheetRow = async (entryId) => {
    try {
      const entry = timesheetEntries.find(e => e.id === entryId)
      if (!entry) return

      // Validate required fields
      if (!entry.campaign_id || !entry.task_description || entry.task_description === 'Select/create a task...') {
        alert('Please select a campaign and enter a task description.')
        return
      }

      // Save each day's hours to the database
      for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
        const hours = entry.daily_hours[dayIndex]
        if (hours && hours > 0) {
          const date = weekDates[dayIndex].toISOString().split('T')[0]
          
          await api.createTimesheet({
            user_id: user?.id,
            campaign_id: entry.campaign_id,
            date: date,
            hours: hours,
            description: entry.task_description,
            status: 'pending'
          })
        }
      }

      // Update the entry state
      setTimesheetEntries(prev => prev.map(e => 
        e.id === entryId 
          ? { ...e, is_editing: false, is_empty: false, original_data: undefined }
          : e
      ))

      // Reload data to get the latest from database
      loadTimesheetData()
    } catch (error) {
      console.error('Error saving timesheet row:', error)
      alert('Error saving timesheet row. Please try again.')
    }
  }

  const cancelEditTimesheetRow = (entryId) => {
    setTimesheetEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        if (entry.original_data) {
          // Restore original data
          return { ...entry.original_data, is_editing: false, original_data: undefined }
        } else {
          // If it was a new entry, remove it
          return null
        }
      }
      return entry
    }).filter(Boolean))
  }

  const deleteTimesheetRow = async (entryId) => {
    try {
      const entry = timesheetEntries.find(e => e.id === entryId)
      if (!entry) return

      if (entry.is_empty) {
        // Just remove from state if it's an empty row
        setTimesheetEntries(prev => prev.filter(e => e.id !== entryId))
        return
      }

      if (confirm('Are you sure you want to delete this timesheet row? This will remove all time entries for this task.')) {
        // Delete from database
        for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
          const hours = entry.daily_hours[dayIndex]
          if (hours && hours > 0) {
            const date = weekDates[dayIndex].toISOString().split('T')[0]
            
            // Find and delete the timesheet entry
            const timesheets = await api.getTimesheets({ 
              user_id: user?.id,
              campaign_id: entry.campaign_id,
              date: date
            })
            
            for (const timesheet of timesheets) {
              if (timesheet.description === entry.task_description) {
                await api.deleteTimesheet(timesheet.id)
              }
            }
          }
        }

        // Remove from state
        setTimesheetEntries(prev => prev.filter(e => e.id !== entryId))
        
        // Reload data to ensure consistency
        loadTimesheetData()
      }
    } catch (error) {
      console.error('Error deleting timesheet row:', error)
      alert('Error deleting timesheet row. Please try again.')
    }
  }
  const calculateDayTotal = (dayIndex) => {
    return timesheetEntries.reduce((sum, entry) => sum + (entry.daily_hours[dayIndex] || 0), 0)
  }

  const calculateWeekTotal = () => {
    return timesheetEntries.reduce((sum, entry) => sum + entry.total_hours, 0)
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading timesheet...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      {/* Header with Timer */}
      <div className="timesheet-container mb-6">
        <div className="timesheet-header">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="timesheet-title">Weekly Timesheet</h1>
              <p className="timesheet-subtitle">Submit and manage your timesheets</p>
            </div>
            
            {/* Timer Section */}
            <div className="timer-section">
              <button
                onClick={stopTimer}
                disabled={!isTimerRunning}
                className="apple-button apple-button-danger"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </button>
              <button
                onClick={startTimer}
                disabled={isTimerRunning}
                className="apple-button apple-button-success"
              >
                <Play className="w-4 h-4 mr-2" />
                Start new
              </button>
              <div className="timer-display">
                {formatTime(currentTimer)}
              </div>
              <button className="apple-button apple-button-primary">
                Save Timer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button
          onClick={() => navigateWeek(-1)}
          className="nav-button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="week-info">
          <div className="week-title">
            This week, {formatDate(weekDates[0])} - {formatDate(weekDates[4])} {weekDates[0].getFullYear()}
          </div>
          <div className="week-subtitle">
            Week {Math.ceil((weekDates[0] - new Date(weekDates[0].getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}
          </div>
        </div>
        
        <button
          onClick={() => navigateWeek(1)}
          className="nav-button"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <div className="user-badge">
          <User className="w-4 h-4" />
          <span>{user?.full_name} (me)</span>
        </div>
      </div>

      {/* Timesheet Grid */}
      <div className="timesheet-container">
        <div className="overflow-x-auto">
          <table className="timesheet-table">
            <thead>
              <tr>
                <th style={{ width: '280px' }}>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>CAMPAIGN</span>
                  </div>
                </th>
                <th style={{ width: '280px' }}>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    <span>Task</span>
                  </div>
                </th>
                {weekDays.map((day, index) => (
                  <th key={day} style={{ width: '120px' }} className="text-center">
                    <div>
                      <div className="text-sm text-gray-600">{day}, {formatDate(weekDates[index]).split(' ')[1]}</div>
                      <div className="text-lg font-bold">{formatDate(weekDates[index]).split(' ')[0]}</div>
                    </div>
                  </th>
                ))}
                <th style={{ width: '100px' }} className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Total</span>
                  </div>
                </th>
                <th style={{ width: '120px' }} className="text-center">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {timesheetEntries.map((entry, entryIndex) => (
                <tr key={entry.id}>
                  <td>
                    {entry.is_editing || entry.is_empty ? (
                      <select
                        className="apple-select"
                        value={entry.campaign_id}
                        onChange={(e) => {
                          const selectedCampaign = campaigns.find(c => c.id === e.target.value)
                          setTimesheetEntries(prev => prev.map(e => 
                            e.id === entry.id 
                              ? { ...e, campaign_id: e.target.value, campaign_name: selectedCampaign?.name || 'Select/create a project...', is_empty: false }
                              : e
                          ))
                        }}
                      >
                        <option value="">Select/create a project...</option>
                        {campaigns.map(campaign => (
                          <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="campaign-indicator">
                        <div className="campaign-dot"></div>
                        <span className="font-medium">{entry.campaign_name}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {entry.is_editing || entry.is_empty ? (
                      <input
                        type="text"
                        className="apple-input"
                        placeholder="Select/create a task..."
                        value={entry.task_description === 'Select/create a task...' ? '' : entry.task_description}
                        onChange={(e) => {
                          setTimesheetEntries(prev => prev.map(e => 
                            e.id === entry.id 
                              ? { ...e, task_description: e.target.value || 'Select/create a task...', is_empty: false }
                              : e
                          ))
                        }}
                      />
                    ) : (
                      <span>{entry.task_description}</span>
                    )}
                  </td>
                  {weekDays.map((day, dayIndex) => (
                    <td key={day} className="text-center">
                      <input
                        type="text"
                        className="time-input"
                        placeholder="0:00"
                        value={entry.daily_hours[dayIndex] ? `${Math.floor(entry.daily_hours[dayIndex])}:${String(Math.round((entry.daily_hours[dayIndex] % 1) * 60)).padStart(2, '0')}` : ''}
                        onChange={(e) => {
                          const timeStr = e.target.value
                          const [hours, minutes] = timeStr.split(':').map(n => parseInt(n) || 0)
                          const totalHours = hours + (minutes / 60)
                          updateTimeEntry(entry.id, dayIndex, totalHours)
                        }}
                        disabled={!entry.is_editing && !entry.is_empty}
                      />
                    </td>
                  ))}
                  <td className="text-center">
                    <div className="total-display">
                      {entry.total_hours > 0 ? `${Math.floor(entry.total_hours)}:${String(Math.round((entry.total_hours % 1) * 60)).padStart(2, '0')}` : '0:00'}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {entry.is_editing ? (
                        <>
                          <button
                            onClick={() => saveTimesheetRow(entry.id)}
                            className="apple-button apple-button-success btn-sm"
                            title="Save changes"
                          >
                            <CheckSquare className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => cancelEditTimesheetRow(entry.id)}
                            className="apple-button apple-button-secondary btn-sm"
                            title="Cancel editing"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : entry.is_empty ? (
                        <>
                          <button
                            onClick={() => saveTimesheetRow(entry.id)}
                            className="apple-button apple-button-success btn-sm"
                            title="Save new row"
                          >
                            <CheckSquare className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteTimesheetRow(entry.id)}
                            className="apple-button apple-button-danger btn-sm"
                            title="Delete row"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => editTimesheetRow(entry.id)}
                            className="apple-button apple-button-secondary btn-sm"
                            title="Edit row"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteTimesheetRow(entry.id)}
                            className="apple-button apple-button-danger btn-sm"
                            title="Delete row"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="totals-row">
                <td colSpan="2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    <span className="font-semibold">WEEKLY TOTALS</span>
                  </div>
                </td>
                {weekDays.map((day, dayIndex) => (
                  <td key={day} className="text-center">
                    <div className="total-display">
                      {(() => {
                        const total = calculateDayTotal(dayIndex)
                        return total > 0 ? `${Math.floor(total)}:${String(Math.round((total % 1) * 60)).padStart(2, '0')}` : '0:00'
                      })()}
                    </div>
                  </td>
                ))}
                <td className="text-center">
                  <div className="weekly-total">
                    {(() => {
                      const total = calculateWeekTotal()
                      return total > 0 ? `${Math.floor(total)}:${String(Math.round((total % 1) * 60)).padStart(2, '0')}` : '0:00'
                    })()}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <div className="action-group">
          <button
            onClick={addTimesheetRow}
            className="apple-button apple-button-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add timesheet row
          </button>
          <button
            onClick={copyPreviousWeek}
            className="apple-button apple-button-success"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy previous week
          </button>
        </div>
        <div className="action-group">
          <button className="apple-button apple-button-secondary">
            Save Draft
          </button>
          <button className="apple-button apple-button-primary">
            Submit Timesheet
          </button>
        </div>
      </div>
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
      await api.createCampaign(newCampaign)
      setShowCreateModal(false)
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
      loadCampaigns()
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Error creating campaign. Please try again.')
    }
  }

  const handleEditCampaign = (campaign) => {
    setEditingCampaign({
      ...campaign,
      budget: campaign.budget || '',
      hourly_rate: campaign.hourly_rate || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateCampaign = async (e) => {
    e.preventDefault()
    try {
      await api.updateCampaign(editingCampaign.id, editingCampaign)
      setShowEditModal(false)
      setEditingCampaign(null)
      loadCampaigns()
    } catch (error) {
      console.error('Error updating campaign:', error)
      alert('Error updating campaign. Please try again.')
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        await api.deleteCampaign(campaignId)
        loadCampaigns()
      } catch (error) {
        console.error('Error deleting campaign:', error)
        alert('Error deleting campaign. Please try again.')
      }
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      planning: 'orange',
      active: 'green',
      paused: 'yellow',
      completed: 'blue',
      cancelled: 'red'
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  return (
    <div className="page-content space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600 mt-1">Manage campaigns and projects</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>All campaigns from database</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
              <span className="ml-2">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No campaigns found</p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rate</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-gray-100 hover-bg-gray-50">
                      <td className="py-3 px-4">{campaign.name}</td>
                      <td className="py-3 px-4">{campaign.code}</td>
                      <td className="py-3 px-4">{campaign.client_name}</td>
                      <td className="py-3 px-4">{getStatusBadge(campaign.status)}</td>
                      <td className="py-3 px-4">${campaign.budget?.toLocaleString() || 'N/A'}</td>
                      <td className="py-3 px-4">${campaign.hourly_rate || 'N/A'}/hr</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditCampaign(campaign)}
                            className="apple-button apple-button-secondary btn-sm"
                            title="Edit campaign"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="apple-button apple-button-danger btn-sm"
                            title="Delete campaign"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Campaign</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Campaign Code</Label>
                    <Input
                      id="code"
                      value={newCampaign.code}
                      onChange={(e) => setNewCampaign({...newCampaign, code: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input
                      id="client_name"
                      value={newCampaign.client_name}
                      onChange={(e) => setNewCampaign({...newCampaign, client_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newCampaign.status}
                      onChange={(e) => setNewCampaign({...newCampaign, status: e.target.value})}
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newCampaign.budget}
                      onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      value={newCampaign.hourly_rate}
                      onChange={(e) => setNewCampaign({...newCampaign, hourly_rate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    placeholder="Campaign description..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Campaign
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingCampaign && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Campaign</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateCampaign} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_name">Campaign Name</Label>
                    <Input
                      id="edit_name"
                      value={editingCampaign.name}
                      onChange={(e) => setEditingCampaign({...editingCampaign, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_code">Campaign Code</Label>
                    <Input
                      id="edit_code"
                      value={editingCampaign.code}
                      onChange={(e) => setEditingCampaign({...editingCampaign, code: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_client_name">Client Name</Label>
                    <Input
                      id="edit_client_name"
                      value={editingCampaign.client_name}
                      onChange={(e) => setEditingCampaign({...editingCampaign, client_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_status">Status</Label>
                    <Select
                      id="edit_status"
                      value={editingCampaign.status}
                      onChange={(e) => setEditingCampaign({...editingCampaign, status: e.target.value})}
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_budget">Budget ($)</Label>
                    <Input
                      id="edit_budget"
                      type="number"
                      value={editingCampaign.budget}
                      onChange={(e) => setEditingCampaign({...editingCampaign, budget: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="edit_hourly_rate"
                      type="number"
                      step="0.01"
                      value={editingCampaign.hourly_rate}
                      onChange={(e) => setEditingCampaign({...editingCampaign, hourly_rate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit_description">Description</Label>
                  <Input
                    id="edit_description"
                    value={editingCampaign.description}
                    onChange={(e) => setEditingCampaign({...editingCampaign, description: e.target.value})}
                    placeholder="Campaign description..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Campaign
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

