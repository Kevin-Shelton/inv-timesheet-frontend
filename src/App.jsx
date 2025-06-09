// COMPLETE TIMESHEET MANAGEMENT APPLICATION
// Full implementation with all pages and billable hours management system
// FIXED: Only the timesheet table responsiveness - all other functionality preserved

import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { 
  Clock, Users, BarChart3, Settings, LogOut, Menu, X, AlertCircle, 
  CheckCircle, Plus, Check, XCircle, Download, Filter, Search, Edit, 
  Trash2, UserPlus, Shield, TrendingUp, DollarSign, Calendar, FileText,
  Home, Eye, EyeOff, Database, Upload, Target, Activity, Save, Printer,
  RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Bell, Globe, Lock, User
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, 
  AreaChart, Area 
} from 'recharts'
import './App.css'

// Import new components
import DataUploadCockpit from './DataUploadCockpit.jsx'
import EnhancedEmployeeManagement from './EnhancedEmployeeManagement.jsx'
import BillableHoursEntry from './BillableHoursEntry.jsx'
import UtilizationAnalytics from './UtilizationAnalytics.jsx'
import BillableHoursReporting from './BillableHoursReporting.jsx'
import { calculateEmployeeStatus } from './dataTemplates.jsx'
import { downloadEmployeeTemplate, downloadPayrollTemplate } from './templateGenerator.jsx'

// Enhanced Mock API with billable hours capabilities
const api = {
  login: async (email, password) => {
    // Mock login - replace with actual API call
    if (email === 'admin@test.com' && password === 'password123') {
      return {
        token: 'mock-token',
        user: { id: 1, email, full_name: 'Test Admin', role: 'admin' }
      }
    }
    if (email === 'user@test.com' && password === 'password123') {
      return {
        token: 'mock-token',
        user: { id: 2, email, full_name: 'Test User', role: 'team_member' }
      }
    }
    if (email === 'campaign@test.com' && password === 'password123') {
      return {
        token: 'mock-token',
        user: { id: 3, email, full_name: 'Campaign Leader', role: 'campaign_lead' }
      }
    }
    throw new Error('Invalid credentials')
  },
  getTimesheets: async (params = {}) => {
    // Mock timesheet data
    return [
      { id: 1, date: '2024-01-15', hours: 8, description: 'Campaign work', status: 'pending', user_name: 'John Doe' },
      { id: 2, date: '2024-01-14', hours: 7.5, description: 'Client calls', status: 'approved', user_name: 'Jane Smith' },
      { id: 3, date: '2024-01-13', hours: 8.5, description: 'Data entry', status: 'rejected', user_name: 'Mike Johnson' }
    ]
  },
  createTimesheet: async (data) => {
    console.log('Creating timesheet:', data)
    return { id: Date.now(), ...data, status: 'pending' }
  },
  approveTimesheet: async (id, comment) => {
    console.log('Approving timesheet:', id, comment)
    return { success: true }
  },
  rejectTimesheet: async (id, comment) => {
    console.log('Rejecting timesheet:', id, comment)
    return { success: true }
  },
  // Billable Hours API methods
  getBillableHours: async (params = {}) => {
    // Mock billable hours data
    return [
      {
        id: 1,
        team_member_id: 1,
        team_member_name: 'John Doe',
        date: '2024-01-15',
        client_name: 'Acme Corp',
        project_name: 'Website Redesign',
        task_description: 'Frontend development',
        billable_hours: 6.5,
        hourly_rate: 75,
        total_amount: 487.50,
        status: 'approved',
        entered_by: 'Test Admin'
      }
    ]
  },
  createBillableHours: async (data) => {
    console.log('Creating billable hours entry:', data)
    return { id: Date.now(), ...data, created_at: new Date().toISOString() }
  },
  updateBillableHours: async (id, data) => {
    console.log('Updating billable hours:', id, data)
    return { success: true }
  },
  deleteBillableHours: async (id) => {
    console.log('Deleting billable hours:', id)
    return { success: true }
  },
  getUtilizationMetrics: async (params = {}) => {
    // Mock utilization data
    return {
      overall_utilization: 78.5,
      billable_utilization: 65.2,
      target_utilization: 75.0,
      revenue_per_hour: 68.50,
      total_billable_hours: 1247,
      total_available_hours: 1600,
      efficiency_score: 87.3
    }
  },
  getUsers: async () => {
    // Enhanced user data with new fields for employee management
    return [
      { 
        id: 1, 
        email: 'admin@test.com', 
        full_name: 'Test Admin', 
        role: 'admin', 
        pay_rate_per_hour: 25, 
        is_active: true,
        hire_date: '2023-01-15',
        department: 'Management',
        employee_id: 'EMP001',
        phone: '+1-555-123-4567',
        address: '123 Admin St, City, State 12345',
        emergency_contact_name: 'Emergency Contact',
        emergency_contact_phone: '+1-555-987-6543'
      },
      { 
        id: 2, 
        email: 'user@test.com', 
        full_name: 'Test User', 
        role: 'team_member', 
        pay_rate_per_hour: 18, 
        is_active: true,
        hire_date: '2023-06-01',
        department: 'Operations',
        employee_id: 'EMP002',
        phone: '+1-555-234-5678',
        address: '456 User Ave, City, State 12345',
        emergency_contact_name: 'User Emergency',
        emergency_contact_phone: '+1-555-876-5432'
      },
      {
        id: 3,
        email: 'campaign@test.com',
        full_name: 'Campaign Leader',
        role: 'campaign_lead',
        pay_rate_per_hour: 22,
        is_active: true,
        hire_date: '2023-03-10',
        department: 'Marketing',
        employee_id: 'EMP003',
        phone: '+1-555-345-6789',
        address: '789 Campaign Blvd, City, State 12345',
        emergency_contact_name: 'Campaign Emergency',
        emergency_contact_phone: '+1-555-765-4321'
      }
    ]
  },
  createUser: async (data) => {
    console.log('Creating user:', data)
    return { id: Date.now(), ...data, is_active: true }
  },
  updateUser: async (id, data) => {
    console.log('Updating user:', id, data)
    return { id, ...data }
  },
  deleteUser: async (id) => {
    console.log('Deleting user:', id)
    return { success: true }
  },
  // New bulk upload methods
  bulkCreateUsers: async (users) => {
    console.log('Bulk creating users:', users)
    return users.map((user, index) => ({ id: Date.now() + index, ...user, is_active: true }))
  },
  bulkCreatePayroll: async (payrollData) => {
    console.log('Bulk creating payroll:', payrollData)
    return payrollData.map((record, index) => ({ id: Date.now() + index, ...record }))
  },
  getPayrollData: async () => {
    // Mock payroll data
    return [
      {
        id: 1,
        employee_email: 'user@test.com',
        pay_period_start: '2024-01-01',
        pay_period_end: '2024-01-15',
        regular_hours: 80,
        overtime_hours: 5,
        bonus_amount: 200
      }
    ]
  }
}

// Auth Context
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
  return useContext(AuthContext)
}

// UI Components
const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) => {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    destructive: 'btn-destructive'
  }
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children }) => (
  <div className="card-header">
    {children}
  </div>
)

const CardTitle = ({ children }) => (
  <h3 className="card-title">{children}</h3>
)

const CardDescription = ({ children }) => (
  <p className="card-description">{children}</p>
)

const CardContent = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
)

const Input = ({ className = '', ...props }) => (
  <input className={`form-input ${className}`} {...props} />
)

const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`form-label ${className}`}>
    {children}
  </label>
)

const Alert = ({ children, variant = 'default' }) => (
  <div className={`alert alert-${variant}`}>
    {children}
  </div>
)

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
)

const Badge = ({ children, variant = 'default' }) => (
  <span className={`badge badge-${variant}`}>
    {children}
  </span>
)

const Select = ({ children, value, onChange, className = '' }) => (
  <select className={`form-select ${className}`} value={value} onChange={onChange}>
    {children}
  </select>
)

const Textarea = ({ className = '', ...props }) => (
  <textarea className={`form-textarea ${className}`} {...props} />
)

// Route Protection Components
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  return user ? <Navigate to="/" /> : children
}

// Login Page
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await login(email, password)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="login-title">TimeSheet Manager</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <div className="flex items-center">
                <div className="loading-spinner"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="login-demo">
          <p className="text-sm text-gray-600 mb-2">Demo accounts:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Admin: admin@test.com / password123</p>
            <p>User: user@test.com / password123</p>
            <p>Campaign Leader: campaign@test.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Component
function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalHours: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    billableHours: 0,
    revenue: 0,
    utilization: 0
  })

  useEffect(() => {
    // Mock stats - replace with actual API calls
    setStats({
      totalHours: 1247,
      pendingApprovals: 12,
      totalUsers: 16,
      billableHours: 856,
      revenue: 58420,
      utilization: 78.5
    })
  }, [])

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.full_name || user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-blue">
                <Clock className="w-6 h-6" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Total Hours</p>
                <p className="stat-value">{stats.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-green">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Billable Hours</p>
                <p className="stat-value">{stats.billableHours}</p>
                <p className="stat-change text-green-600">
                  +12% vs last week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-purple">
                <Target className="w-6 h-6" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Utilization</p>
                <p className="stat-value">{stats.utilization}%</p>
                <p className="stat-change text-green-600">Above target</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user?.role === 'admin' && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="stat-icon-container stat-icon-orange">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="stat-details">
                    <p className="stat-title">Pending Approvals</p>
                    <p className="stat-value">{stats.pendingApprovals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="stat-icon-container stat-icon-indigo">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="stat-details">
                    <p className="stat-title">Total Users</p>
                    <p className="stat-value">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="stat-icon-container stat-icon-green">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="stat-details">
                    <p className="stat-title">Revenue</p>
                    <p className="stat-value">${stats.revenue.toLocaleString()}</p>
                    <p className="stat-change text-green-600">
                      +8% vs last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Hours Trend</CardTitle>
            <CardDescription>Hours logged over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { day: 'Mon', hours: 8.5 },
                { day: 'Tue', hours: 7.2 },
                { day: 'Wed', hours: 8.8 },
                { day: 'Thu', hours: 7.5 },
                { day: 'Fri', hours: 8.0 },
                { day: 'Sat', hours: 4.2 },
                { day: 'Sun', hours: 2.1 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Distribution</CardTitle>
            <CardDescription>Breakdown of time allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Billable', value: 65, fill: '#10b981' },
                    { name: 'Non-billable', value: 20, fill: '#f59e0b' },
                    { name: 'Break', value: 10, fill: '#ef4444' },
                    { name: 'Training', value: 5, fill: '#8b5cf6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// FIXED TIMESHEET PAGE - Only the table responsiveness is modified
function TimesheetsPage() {
  const { user } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [weeklyTimesheet, setWeeklyTimesheet] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [employees] = useState([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' }
  ])

  // Get week start (Monday) and end (Sunday)
  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const weekStart = getWeekStart(currentWeek)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return date
  })

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    loadWeeklyTimesheet()
  }, [currentWeek, selectedEmployee])

  const loadWeeklyTimesheet = async () => {
    setLoading(true)
    try {
      // Mock data loading - replace with actual API call
      const mockData = {}
      weekDates.forEach(date => {
        const dateKey = date.toISOString().split('T')[0]
        mockData[dateKey] = {
          timeIn: '',
          breakOut: '',
          breakIn: '',
          timeOut: '',
          vacationHours: '',
          sickHours: '',
          holidayHours: '',
          overtimeHours: '',
          notes: '',
          status: 'draft'
        }
      })
      
      // Add some sample data for Monday
      const mondayKey = weekDates[0].toISOString().split('T')[0]
      mockData[mondayKey] = {
        timeIn: '09:00',
        breakOut: '12:00',
        breakIn: '01:00',
        timeOut: '05:00',
        vacationHours: '',
        sickHours: '',
        holidayHours: '',
        overtimeHours: '',
        notes: 'Regular workday',
        status: 'submitted'
      }
      
      setWeeklyTimesheet(mockData)
    } catch (error) {
      console.error('Error loading timesheet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeChange = (dateKey, field, value) => {
    setWeeklyTimesheet(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [field]: value
      }
    }))
  }

  // Calculate daily hours including all types
  const calculateDailyHours = (dayData) => {
    let totalHours = 0
    
    // Calculate work hours (time in to time out minus breaks)
    if (dayData.timeIn && dayData.timeOut) {
      try {
        const timeIn = new Date(`2000-01-01 ${dayData.timeIn}`)
        const timeOut = new Date(`2000-01-01 ${dayData.timeOut}`)
        let workMinutes = (timeOut - timeIn) / (1000 * 60)
        
        // Handle overnight shifts
        if (workMinutes < 0) {
          workMinutes += 24 * 60
        }
        
        // Subtract break time
        if (dayData.breakOut && dayData.breakIn) {
          const breakOut = new Date(`2000-01-01 ${dayData.breakOut}`)
          const breakIn = new Date(`2000-01-01 ${dayData.breakIn}`)
          const breakMinutes = (breakIn - breakOut) / (1000 * 60)
          if (breakMinutes > 0 && breakMinutes <= 120) { // Max 2 hour break
            workMinutes -= breakMinutes
          }
        }
        
        totalHours += Math.max(0, workMinutes / 60)
      } catch (error) {
        console.error('Error calculating work hours:', error)
      }
    }
    
    // Add vacation hours
    if (dayData.vacationHours) {
      const vacation = parseFloat(dayData.vacationHours) || 0
      totalHours += Math.max(0, Math.min(vacation, 8)) // Max 8 hours vacation per day
    }
    
    // Add sick hours
    if (dayData.sickHours) {
      const sick = parseFloat(dayData.sickHours) || 0
      totalHours += Math.max(0, Math.min(sick, 8)) // Max 8 hours sick per day
    }
    
    // Add holiday hours
    if (dayData.holidayHours) {
      const holiday = parseFloat(dayData.holidayHours) || 0
      totalHours += Math.max(0, Math.min(holiday, 8)) // Max 8 hours holiday per day
    }
    
    // Add overtime hours
    if (dayData.overtimeHours) {
      const overtime = parseFloat(dayData.overtimeHours) || 0
      totalHours += Math.max(0, Math.min(overtime, 12)) // Max 12 hours overtime per day
    }
    
    return totalHours
  }

  // Enhanced weekly total calculation
  const calculateWeeklyTotal = () => {
    return Object.values(weeklyTimesheet).reduce((total, dayData) => {
      return total + calculateDailyHours(dayData)
    }, 0)
  }

  // Calculate different types of hours separately for better reporting
  const calculateWeeklyBreakdown = () => {
    const breakdown = {
      regular: 0,
      vacation: 0,
      sick: 0,
      holiday: 0,
      overtime: 0
    }
    
    Object.values(weeklyTimesheet).forEach(dayData => {
      // Regular hours (work time minus breaks)
      if (dayData.timeIn && dayData.timeOut) {
        try {
          const timeIn = new Date(`2000-01-01 ${dayData.timeIn}`)
          const timeOut = new Date(`2000-01-01 ${dayData.timeOut}`)
          let workMinutes = (timeOut - timeIn) / (1000 * 60)
          
          if (workMinutes < 0) workMinutes += 24 * 60
          
          if (dayData.breakOut && dayData.breakIn) {
            const breakOut = new Date(`2000-01-01 ${dayData.breakOut}`)
            const breakIn = new Date(`2000-01-01 ${dayData.breakIn}`)
            const breakMinutes = (breakIn - breakOut) / (1000 * 60)
            if (breakMinutes > 0 && breakMinutes <= 120) {
              workMinutes -= breakMinutes
            }
          }
          
          breakdown.regular += Math.max(0, workMinutes / 60)
        } catch (error) {
          console.error('Error calculating regular hours:', error)
        }
      }
      
      // Add other hour types
      breakdown.vacation += parseFloat(dayData.vacationHours) || 0
      breakdown.sick += parseFloat(dayData.sickHours) || 0
      breakdown.holiday += parseFloat(dayData.holidayHours) || 0
      breakdown.overtime += parseFloat(dayData.overtimeHours) || 0
    })
    
    return breakdown
  }

  // Validate time entries
  const validateTimeEntry = (dayData) => {
    const errors = []
    
    if (dayData.timeIn && dayData.timeOut) {
      const timeIn = new Date(`2000-01-01 ${dayData.timeIn}`)
      const timeOut = new Date(`2000-01-01 ${dayData.timeOut}`)
      
      // Check if time out is after time in (accounting for overnight shifts)
      let workMinutes = (timeOut - timeIn) / (1000 * 60)
      if (workMinutes < 0) workMinutes += 24 * 60
      
      if (workMinutes > 16 * 60) { // More than 16 hours
        errors.push('Work shift cannot exceed 16 hours')
      }
      
      // Validate break times
      if (dayData.breakOut && dayData.breakIn) {
        const breakOut = new Date(`2000-01-01 ${dayData.breakOut}`)
        const breakIn = new Date(`2000-01-01 ${dayData.breakIn}`)
        
        if (breakOut < timeIn || breakOut > timeOut) {
          errors.push('Break start must be within work hours')
        }
        
        if (breakIn < timeIn || breakIn > timeOut) {
          errors.push('Break end must be within work hours')
        }
        
        if (breakIn <= breakOut) {
          errors.push('Break end must be after break start')
        }
        
        const breakMinutes = (breakIn - breakOut) / (1000 * 60)
        if (breakMinutes > 120) {
          errors.push('Break cannot exceed 2 hours')
        }
      }
    }
    
    return errors
  }

  const saveWeeklyTimesheet = async () => {
    try {
      setSaving(true)
      // Mock API call - replace with actual API
      console.log('Saving weekly timesheet:', weeklyTimesheet)
      
      // Update status to submitted for all days with data
      const updatedTimesheet = { ...weeklyTimesheet }
      Object.keys(updatedTimesheet).forEach(dateKey => {
        const dayData = updatedTimesheet[dateKey]
        if (dayData.timeIn || dayData.timeOut || dayData.vacationHours || dayData.sickHours) {
          dayData.status = 'submitted'
        }
      })
      
      setWeeklyTimesheet(updatedTimesheet)
      alert('Timesheet saved successfully!')
    } catch (error) {
      console.error('Error saving timesheet:', error)
      alert('Error saving timesheet. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeek(newDate)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const weeklyBreakdown = calculateWeeklyBreakdown()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Apple-inspired Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">Weekly Timesheet</h1>
              <p className="text-gray-500 mt-2 font-light">Track your daily work hours and time off</p>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <select 
                  value={selectedEmployee} 
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48 font-light"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              )}
              <button 
                onClick={saveWeeklyTimesheet} 
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Timesheet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Apple-inspired Week Navigation */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek(-1)}
              className="flex items-center justify-center w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200 group"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-light text-gray-900 tracking-tight">
                {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-light">
                Total Hours: {calculateWeeklyTotal().toFixed(1)}h
              </p>
            </div>
            
            <button
              onClick={() => navigateWeek(1)}
              className="flex items-center justify-center w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200 group"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
            </button>
          </div>
        </div>

        {/* Compact Apple-inspired Summary Cards */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-light text-gray-500">Regular Hours</p>
                <p className="text-lg font-light text-gray-900">{weeklyBreakdown.regular.toFixed(1)}h</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-light text-gray-500">Time Off</p>
                <p className="text-lg font-light text-gray-900">
                  {(weeklyBreakdown.vacation + weeklyBreakdown.sick + weeklyBreakdown.holiday).toFixed(1)}h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-light text-gray-500">Overtime</p>
                <p className="text-lg font-light text-gray-900">{weeklyBreakdown.overtime.toFixed(1)}h</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-light text-gray-500">Total Hours</p>
                <p className="text-lg font-light text-gray-900">{calculateWeeklyTotal().toFixed(1)}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* FIXED: Apple-inspired Timesheet Grid with proper scrolling */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-light text-gray-900 tracking-tight">Daily Time Entries</h2>
            <p className="text-gray-500 mt-1 font-light">Enter your daily work schedule and time off hours</p>
          </div>
          
          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                  <span className="text-gray-500 font-light">Loading timesheet...</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-24">Day</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-20">Time In</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-20">Break Out</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-20">Break In</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-20">Time Out</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-20">Vacation</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-20">Sick</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-20">Holiday</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-20">Overtime</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-32">Notes</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-20">Total</th>
                      <th className="text-left py-4 px-3 font-light text-gray-600 w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekDates.map((date, index) => {
                      const dateKey = date.toISOString().split('T')[0]
                      const dayData = weeklyTimesheet[dateKey] || {}
                      const dailyHours = calculateDailyHours(dayData)
                      const errors = validateTimeEntry(dayData)
                      
                      return (
                        <tr key={dateKey} className="border-b border-gray-50 hover:bg-gray-25 transition-colors duration-150">
                          <td className="py-4 px-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm text-gray-900">{dayNames[index]}</span>
                              <span className="text-xs text-gray-500 font-light">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </td>
                          
                          <td className="py-4 px-3">
                            <input
                              type="time"
                              value={dayData.timeIn || ''}
                              onChange={(e) => handleTimeChange(dateKey, 'timeIn', e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-light"
                            />
                          </td>
                          
                          <td className="py-4 px-3">
                            <input
                              type="time"
                              value={dayData.breakOut || ''}
                              onChange={(e) => handleTimeChange(dateKey, 'breakOut', e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-light"
                            />
                          </td>
                          
                          <td className="py-4 px-3">
                            <input
                              type="time"
                              value={dayData.breakIn || ''}
                              onChange={(e) => handleTimeChange(dateKey, 'breakIn', e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-light"
                            />
                          </td>
                          
                          <td className="py-4 px-3">
                            <input
                              type="time"
                              value={dayData.timeOut || ''}
                              onChange={(e) => handleTimeChange(dateKey, 'timeOut', e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-light"
                            />
                          </td>
                          
                          <td className="py-4 px-3">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="8"
                              value={dayData.vacationHours || ''}
                              onChange={(e) => handleTimeChange(dateKey, 'vacationHours', e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-light"
                              placeholder="0"
                            />
                          </td>
                          
                          <td className="py-4 px-3">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="8"
                              value={dayData.sickHours || ''}
                              onChange={(e) => handleTimeChange(dateKey, 'sickHours', e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-light"
                              placeholder="0"
                            />
                          </td>
                          
                          <td className="py-4 px-3">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="8"
                              value={dayData.holidayHours || ''}
                              onChange={(e) => handleTimeChange(dateKey, 'holidayHours', e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-light"
                              placeholder="0"
                            />
                          </td>
                          
                          <td className="py-4 px-3">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={dayData.overtimeHours || ''}
                              onChange={(e) => handleTimeChange(dateKey, 'overtimeHours', e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-light"
                              placeholder="0"
                            />
                          </td>
                          
                          <td className="py-4 px-3">
                            <input
                              type="text"
                              value={dayData.notes || ''}
                              onChange={(e) => handleTimeChange(dateKey, 'notes', e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-light"
                              placeholder="Add notes..."
                            />
                          </td>
                          
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {dailyHours.toFixed(1)}h
                              </span>
                              {errors.length > 0 && (
                                <div className="relative group">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                    {errors.join(', ')}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="py-4 px-3">
                            <div className="flex items-center justify-center">
                              {getStatusIcon(dayData.status)}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


// COMPLETE APPROVAL PAGE IMPLEMENTATION
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

      {/* Filter Tabs */}
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

      {/* Timesheets List */}
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

      {/* Review Modal */}
      {selectedTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Review Timesheet</h3>
            
            <div className="space-y-3 mb-4">
              <div>
                <span className="font-medium">Employee:</span> {selectedTimesheet.user_name}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(selectedTimesheet.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Hours:</span> {selectedTimesheet.hours}h
              </div>
              <div>
                <span className="font-medium">Description:</span> {selectedTimesheet.description}
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => handleApprove(selectedTimesheet.id)}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedTimesheet.id)}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTimesheet(null)
                  setComment('')
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ANALYTICS DASHBOARD IMPLEMENTATION
function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('week')
  const [loading, setLoading] = useState(false)

  const chartData = {
    week: [
      { day: 'Mon', hours: 8.5, billable: 6.2 },
      { day: 'Tue', hours: 7.2, billable: 5.8 },
      { day: 'Wed', hours: 8.8, billable: 7.1 },
      { day: 'Thu', hours: 7.5, billable: 6.0 },
      { day: 'Fri', hours: 8.0, billable: 6.5 },
      { day: 'Sat', hours: 4.2, billable: 3.1 },
      { day: 'Sun', hours: 2.1, billable: 1.5 }
    ],
    month: [
      { week: 'Week 1', hours: 42.3, billable: 32.1 },
      { week: 'Week 2', hours: 38.7, billable: 29.8 },
      { week: 'Week 3', hours: 41.2, billable: 31.5 },
      { week: 'Week 4', hours: 39.8, billable: 30.2 }
    ]
  }

  const utilizationData = [
    { name: 'Billable', value: 65, fill: '#10b981' },
    { name: 'Non-billable', value: 20, fill: '#f59e0b' },
    { name: 'Break', value: 10, fill: '#ef4444' },
    { name: 'Training', value: 5, fill: '#8b5cf6' }
  ]

  return (
    <div className="page-content space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive time tracking analytics</p>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['week', 'month', 'quarter'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-blue">
                <Clock className="w-6 h-6" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Total Hours</p>
                <p className="stat-value">1,247</p>
                <p className="stat-change text-green-600">+8% vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-green">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Billable Hours</p>
                <p className="stat-value">856</p>
                <p className="stat-change text-green-600">+12% vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-purple">
                <Target className="w-6 h-6" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Utilization</p>
                <p className="stat-value">78.5%</p>
                <p className="stat-change text-green-600">Above target</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-orange">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Revenue</p>
                <p className="stat-value">$58,420</p>
                <p className="stat-change text-green-600">+15% vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hours Trend</CardTitle>
            <CardDescription>Total vs billable hours over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData[timeRange]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#3b82f6" name="Total Hours" />
                <Bar dataKey="billable" fill="#10b981" name="Billable Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Distribution</CardTitle>
            <CardDescription>How time is allocated across activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={utilizationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Individual team member metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Team Member</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Billable Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'John Doe', total: 42.5, billable: 35.2, utilization: 82.8, revenue: 2640 },
                  { name: 'Jane Smith', total: 38.7, billable: 31.5, utilization: 81.4, revenue: 2362 },
                  { name: 'Mike Johnson', total: 41.2, billable: 33.8, utilization: 82.0, revenue: 2535 }
                ].map((member, index) => (
                  <tr key={index} className="border-b border-gray-100 hover-bg-gray-50">
                    <td className="py-3 px-4 font-medium">{member.name}</td>
                    <td className="py-3 px-4">{member.total}h</td>
                    <td className="py-3 px-4">{member.billable}h</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          member.utilization >= 80 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {member.utilization}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">${member.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// REPORTS PAGE IMPLEMENTATION
function ReportsPage() {
  const [reportType, setReportType] = useState('timesheet')
  const [dateRange, setDateRange] = useState('week')
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and export detailed reports</p>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg-col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Configure your report parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="timesheet">Timesheet Summary</option>
                  <option value="utilization">Utilization Report</option>
                  <option value="billing">Billing Report</option>
                  <option value="attendance">Attendance Report</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </Select>
              </div>

              <Button 
                onClick={generateReport} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview */}
        <div className="lg-col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Preview of your selected report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select report parameters and click "Generate Report" to preview</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Report Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date Range</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Generated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Weekly Timesheet Report', type: 'Timesheet', range: 'Jan 8-14, 2024', date: '2024-01-15' },
                  { name: 'Monthly Utilization Report', type: 'Utilization', range: 'December 2023', date: '2024-01-01' },
                  { name: 'Q4 Billing Report', type: 'Billing', range: 'Q4 2023', date: '2023-12-31' }
                ].map((report, index) => (
                  <tr key={index} className="border-b border-gray-100 hover-bg-gray-50">
                    <td className="py-3 px-4 font-medium">{report.name}</td>
                    <td className="py-3 px-4">{report.type}</td>
                    <td className="py-3 px-4">{report.range}</td>
                    <td className="py-3 px-4">{new Date(report.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// DATA MANAGEMENT PAGE IMPLEMENTATION
function DataManagementPage() {
  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600 mt-1">Manage employee data and payroll information</p>
      </div>

      <DataUploadCockpit />
    </div>
  )
}

// SETTINGS PAGE IMPLEMENTATION
function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    notifications: true,
    emailReports: false,
    timeFormat: '12h',
    timezone: 'America/New_York'
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                defaultValue={user?.full_name}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                defaultValue={user?.role}
                disabled
                className="bg-gray-50"
              />
            </div>
            <Button>Update Profile</Button>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Customize your application experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications</Label>
                <p className="text-sm text-gray-600">Receive push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                className="toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Email Reports</Label>
                <p className="text-sm text-gray-600">Receive weekly email reports</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailReports}
                onChange={(e) => handleSettingChange('emailReports', e.target.checked)}
                className="toggle"
              />
            </div>

            <div>
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select 
                value={settings.timeFormat} 
                onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.timezone} 
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </Select>
            </div>

            <Button>Save Settings</Button>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Layout Component
function MainLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Timesheets', href: '/timesheets', icon: Clock },
    { name: 'Team', href: '/team', icon: Users },
    ...(user?.role === 'admin' ? [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Reports', href: '/reports', icon: FileText },
      { name: 'Data Management', href: '/data-management', icon: Database },
      { name: 'Billable Hours', href: '/billable-hours', icon: DollarSign },
      { name: 'Utilization', href: '/utilization', icon: Target },
      { name: 'Billable Reports', href: '/billable-reports', icon: Activity }
    ] : []),
    ...(user?.role === 'campaign_lead' ? [
      { name: 'Billable Hours', href: '/billable-hours', icon: DollarSign }
    ] : []),
    { name: 'Settings', href: '/settings', icon: Settings }
  ]

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="sidebar-title">TimeSheet Manager</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* User info */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>
                {user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="user-details">
              <p className="user-name">
                {user?.full_name || user?.name || 'User'}
              </p>
              <p className="user-role">{user?.role || 'Member'}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="ml-2 p-2"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsMobileOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-close-btn" onClick={() => setIsMobileOpen(false)}>
              <X className="h-6 w-6" />
            </button>
            
            {/* Mobile Navigation Content */}
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <h1 className="sidebar-title">TimeSheet</h1>
              </div>
            </div>

            <div className="sidebar-nav">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="nav-icon" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <div className="sidebar-footer">
              <div className="user-info">
                <div className="user-avatar">
                  <span>
                    {user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="user-details">
                  <p className="user-name">
                    {user?.full_name || user?.name || 'User'}
                  </p>
                  <p className="user-role">{user?.role || 'Member'}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="ml-2 p-2"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="main-content">
        {/* Mobile header */}
        <header className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="mobile-title">TimeSheet</h1>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="page-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timesheets" element={<TimesheetsPage />} />
            <Route path="/team" element={<EnhancedEmployeeManagement user={user} api={api} />} />
            {user?.role === 'admin' && (
              <>
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/data-management" element={<DataManagementPage />} />
                <Route path="/billable-hours" element={<BillableHoursEntry user={user} api={api} />} />
                <Route path="/utilization" element={<UtilizationAnalytics user={user} api={api} />} />
                <Route path="/billable-reports" element={<BillableHoursReporting user={user} api={api} />} />
              </>
            )}
            {user?.role === 'campaign_lead' && (
              <Route path="/billable-hours" element={<BillableHoursEntry user={user} api={api} />} />
            )}
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

