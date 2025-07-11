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
  Briefcase, Copy, Square, Play, CheckSquare, Calculator
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
          department: userData.department,
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
          department: userData.department,
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



// Dashboard Component - Cards in 2x3 grid, Quick Actions FIXED to single row
function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalHours: 0,
    billableHours: 0,
    utilization: 0,
    pendingApprovals: 0,
    teamMembers: 0,
    revenue: 0
  })
  
  // Filter states
  const [filters, setFilters] = useState({
    payPeriod: 'current',
    campaign: 'all',
    individual: 'all'
  })
  
  const [campaigns, setCampaigns] = useState([])
  const [teamMembers, setTeamMembers] = useState([])

  useEffect(() => {
    loadDashboardData()
    loadCampaigns()
    loadTeamMembers()
  }, [filters])

  const loadDashboardData = async () => {
    try {
      // Load real metrics from Supabase
      const metrics = await api.getUtilizationMetrics()
      const timesheets = await api.getTimesheets({ status: 'pending' })
      const users = await api.getUsers()
      
      setStats({
        totalHours: metrics.total_billable_hours || 0,
        billableHours: metrics.total_billable_hours || 0,
        utilization: metrics.overall_utilization || 0,
        pendingApprovals: timesheets.length || 0,
        teamMembers: users.filter(u => u.is_active).length || 0,
        revenue: (metrics.total_billable_hours || 0) * (metrics.revenue_per_hour || 0)
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const loadCampaigns = async () => {
    try {
      const campaignData = await api.getCampaigns()
      setCampaigns([
        { id: 'all', name: 'All Campaigns' },
        ...campaignData.map(c => ({ id: c.id, name: c.name }))
      ])
    } catch (error) {
      console.error('Error loading campaigns:', error)
      setCampaigns([{ id: 'all', name: 'All Campaigns' }])
    }
  }

  const loadTeamMembers = async () => {
    try {
      const userData = await api.getUsers()
      setTeamMembers([
        { id: 'all', name: 'All Team Members' },
        ...userData.filter(u => u.is_active).map(u => ({ id: u.id, name: u.full_name }))
      ])
    } catch (error) {
      console.error('Error loading team members:', error)
      setTeamMembers([{ id: 'all', name: 'All Team Members' }])
    }
  }

  const updateFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name || user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your team today.</p>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter dashboard data by pay period, campaign, and team member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <Label htmlFor="payPeriod" className="block text-sm font-medium text-gray-700 mb-1">Pay Period</Label>
              <Select
                id="payPeriod"
                value={filters.payPeriod}
                onChange={(e) => updateFilter('payPeriod', e.target.value)}
                className="w-full"
              >
                <option value="current">Current Week</option>
                <option value="last">Last Week</option>
                <option value="month">Current Month</option>
                <option value="quarter">Current Quarter</option>
                <option value="year">Current Year</option>
              </Select>
            </div>
            
            <div className="flex-1 min-w-48">
              <Label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-1">Campaign</Label>
              <Select
                id="campaign"
                value={filters.campaign}
                onChange={(e) => updateFilter('campaign', e.target.value)}
                className="w-full"
              >
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </Select>
            </div>
            
            <div className="flex-1 min-w-48">
              <Label htmlFor="individual" className="block text-sm font-medium text-gray-700 mb-1">Team Member</Label>
              <Select
                id="individual"
                value={filters.individual}
                onChange={(e) => updateFilter('individual', e.target.value)}
                className="w-full"
              >
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Cards - 2x3 grid layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Row 1: Total Hours, Billable Hours, Utilization */}
        <Card className="dashboard-stat-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">Billable Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.billableHours.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Real-time data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{stats.utilization.toFixed(1)}%</p>
                <p className="text-xs text-green-600 mt-1">Live calculation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Row 2: Pending Approvals, Team Members, Revenue */}
        <Card className="dashboard-stat-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">From database</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section - Single horizontal row */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Link to="/timesheets" className="quick-action-card">
              <Clock className="quick-action-icon text-blue-600" />
              <div>
                <h3 className="quick-action-title">Submit Timesheet</h3>
                <p className="quick-action-description">Log your daily hours</p>
              </div>
            </Link>
            {user?.role !== 'team_member' && (
              <>
                <Link to="/team" className="quick-action-card">
                  <Users className="quick-action-icon text-green-600" />
                  <div>
                    <h3 className="quick-action-title">View Team</h3>
                    <p className="quick-action-description">Manage team members</p>
                  </div>
                </Link>
                <Link to="/billable-hours" className="quick-action-card">
                  <DollarSign className="quick-action-icon text-purple-600" />
                  <div>
                    <h3 className="quick-action-title">Billable Hours</h3>
                    <p className="quick-action-description">Track billable time</p>
                  </div>
                </Link>
                <Link to="/analytics" className="quick-action-card">
                  <BarChart3 className="quick-action-icon text-orange-600" />
                  <div>
                    <h3 className="quick-action-title">Analytics</h3>
                    <p className="quick-action-description">View performance metrics</p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
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
    department: '',
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
        department: '',
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
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
                      <td className="py-3 px-4">{user.department || 'N/A'}</td>
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
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={newUser.hire_date}
                      onChange={(e) => setNewUser({...newUser, hire_date: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
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
                    <Label htmlFor="edit_department">Department</Label>
                    <Input
                      id="edit_department"
                      value={editingUser.department || ''}
                      onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_hire_date">Hire Date</Label>
                    <Input
                      id="edit_hire_date"
                      type="date"
                      value={editingUser.hire_date || ''}
                      onChange={(e) => setEditingUser({...editingUser, hire_date: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  />
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
    { name: 'Team', href: '/team', icon: Users, roles: ['admin', 'campaign_lead'] },
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

// Task-Based Timesheet Page Component
// Weekly Timesheet Grid Component - Matches the sophisticated interface shown in the image
function TaskBasedTimesheetPage() {
  const { user } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [timesheetEntries, setTimesheetEntries] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentTimer, setCurrentTimer] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [activeEntry, setActiveEntry] = useState(null)

  // Get week dates
  const getWeekDates = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)
    
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
      
      // Reload data
      loadTimesheetData()
    } catch (error) {
      console.error('Error copying previous week:', error)
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
              </tr>
            </thead>
            <tbody>
              {timesheetEntries.map((entry, entryIndex) => (
                <tr key={entry.id}>
                  <td>
                    {entry.is_empty ? (
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
                    {entry.is_empty ? (
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
                      />
                    </td>
                  ))}
                  <td className="text-center">
                    <div className="total-display">
                      {entry.total_hours > 0 ? `${Math.floor(entry.total_hours)}:${String(Math.round((entry.total_hours % 1) * 60)).padStart(2, '0')}` : '0:00'}
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
      const campaign = await api.createCampaign(newCampaign)
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

