// COMPLETE TIMESHEET MANAGEMENT APPLICATION
// Full implementation with all pages and billable hours management system

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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md-grid-cols-4 gap-4">
            <Link to="/timesheets" className="quick-action-card">
              <Clock className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Timesheets</h3>
              <p className="text-sm text-gray-600">Enter hours</p>
            </Link>

            <Link to="/billable-hours" className="quick-action-card">
              <DollarSign className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-medium">Billable Hours</h3>
              <p className="text-sm text-gray-600">Track billing</p>
            </Link>

            {(user?.role === 'admin' || user?.role === 'campaign_lead') && (
              <>
                <Link to="/team" className="quick-action-card">
                  <Users className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-medium">Employees</h3>
                  <p className="text-sm text-gray-600">Manage team</p>
                </Link>

                <Link to="/utilization" className="quick-action-card">
                  <BarChart3 className="w-8 h-8 text-indigo-600 mb-2" />
                  <h3 className="font-medium">Utilization</h3>
                  <p className="text-sm text-gray-600">View analytics</p>
                </Link>

                <Link to="/billable-reports" className="quick-action-card">
                  <FileText className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="font-medium">Reports</h3>
                  <p className="text-sm text-gray-600">Generate reports</p>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// COMPLETE TIMESHEETS PAGE IMPLEMENTATION WITH APPLE-LIKE DESIGN
function TimesheetsPage() {
  const { user } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [weeklyTimesheet, setWeeklyTimesheet] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(user?.role === 'admin' ? '' : user?.id)
  const [employees, setEmployees] = useState([])

  // Get week start (Monday) and end (Sunday)
  const getWeekDates = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff))
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const weekDates = getWeekDates(currentWeek)
  const weekStart = weekDates[0]
  const weekEnd = weekDates[6]

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Initialize empty timesheet structure
  const initializeWeeklyTimesheet = () => {
    const timesheet = {}
    weekDates.forEach((date, index) => {
      const dateKey = date.toISOString().split('T')[0]
      timesheet[dateKey] = {
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
    return timesheet
  }

  useEffect(() => {
    fetchEmployees()
    fetchWeeklyTimesheet()
  }, [currentWeek, selectedEmployee])

  const fetchEmployees = async () => {
    if (user?.role === 'admin') {
      try {
        // Mock API call - replace with actual API
        const mockEmployees = [
          { id: 1, name: 'John Doe', email: 'john@test.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@test.com' },
          { id: 3, name: 'Test User', email: 'user@test.com' }
        ]
        setEmployees(mockEmployees)
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }
  }

  const fetchWeeklyTimesheet = async () => {
    try {
      setLoading(true)
      // Mock API call - replace with actual API
      const mockTimesheet = initializeWeeklyTimesheet()
      
      // Add some sample data
      const mondayKey = weekDates[0].toISOString().split('T')[0]
      mockTimesheet[mondayKey] = {
        timeIn: '09:00',
        breakOut: '12:00',
        breakIn: '13:00',
        timeOut: '17:00',
        vacationHours: '',
        sickHours: '',
        holidayHours: '',
        overtimeHours: '',
        notes: 'Regular workday',
        status: 'submitted'
      }
      
      setWeeklyTimesheet(mockTimesheet)
    } catch (error) {
      console.error('Error fetching weekly timesheet:', error)
      setWeeklyTimesheet(initializeWeeklyTimesheet())
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

  // Enhanced calculation function that includes all hour types
  const calculateDailyHours = (dayData) => {
    let totalHours = 0
    
    // Calculate regular work hours from time in/out
    if (dayData.timeIn && dayData.timeOut) {
      try {
        const timeIn = new Date(`2000-01-01 ${dayData.timeIn}`)
        const timeOut = new Date(`2000-01-01 ${dayData.timeOut}`)
        
        // Handle overnight shifts
        let workMinutes = (timeOut - timeIn) / (1000 * 60)
        if (workMinutes < 0) {
          workMinutes += 24 * 60 // Add 24 hours for overnight shifts
        }
        
        // Subtract break time if both break out and break in are provided
        if (dayData.breakOut && dayData.breakIn) {
          const breakOut = new Date(`2000-01-01 ${dayData.breakOut}`)
          const breakIn = new Date(`2000-01-01 ${dayData.breakIn}`)
          let breakMinutes = (breakIn - breakOut) / (1000 * 60)
          
          // Validate break times
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

        {/* Apple-inspired Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-light text-gray-500">Regular Hours</p>
                <p className="text-2xl font-light text-gray-900">{weeklyBreakdown.regular.toFixed(1)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-light text-gray-500">Time Off</p>
                <p className="text-2xl font-light text-gray-900">
                  {(weeklyBreakdown.vacation + weeklyBreakdown.sick + weeklyBreakdown.holiday).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-light text-gray-500">Overtime</p>
                <p className="text-2xl font-light text-gray-900">{weeklyBreakdown.overtime.toFixed(1)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-light text-gray-500">Total Hours</p>
                <p className="text-2xl font-light text-gray-900">{calculateWeeklyTotal().toFixed(1)}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Apple-inspired Timesheet Grid */}
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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Review Timesheet</h3>
              <button 
                onClick={() => setSelectedTimesheet(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee</Label>
                  <p className="text-gray-900">{selectedTimesheet.user_name}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="text-gray-900">
                    {new Date(selectedTimesheet.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Hours</Label>
                  <p className="text-gray-900">{selectedTimesheet.hours}h</p>
                </div>
                <div>
                  <Label>Status</Label>
                  {getStatusBadge(selectedTimesheet.status)}
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-gray-900">{selectedTimesheet.description}</p>
              </div>
              
              <div>
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <Button
                variant="outline"
                onClick={() => setSelectedTimesheet(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
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
      )}
    </div>
  )
}

// COMPLETE ANALYTICS DASHBOARD IMPLEMENTATION
function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')
  const [loading, setLoading] = useState(false)

  // Mock data for charts
  const overviewData = [
    { name: 'Week 1', hours: 320, efficiency: 85, overtime: 12 },
    { name: 'Week 2', hours: 340, efficiency: 88, overtime: 8 },
    { name: 'Week 3', hours: 310, efficiency: 82, overtime: 15 },
    { name: 'Week 4', hours: 350, efficiency: 90, overtime: 5 }
  ]

  const productivityData = [
    { date: '2024-01-01', productivity: 85, hours: 8.2 },
    { date: '2024-01-02', productivity: 88, hours: 8.5 },
    { date: '2024-01-03', productivity: 82, hours: 7.8 },
    { date: '2024-01-04', productivity: 90, hours: 8.7 },
    { date: '2024-01-05', productivity: 87, hours: 8.3 }
  ]

  const teamData = [
    { name: 'John Doe', hours: 168, efficiency: 92, overtime: 3, status: 'excellent' },
    { name: 'Jane Smith', hours: 160, efficiency: 88, overtime: 0, status: 'good' },
    { name: 'Mike Johnson', hours: 172, efficiency: 85, overtime: 8, status: 'good' },
    { name: 'Sarah Wilson', hours: 156, efficiency: 90, overtime: 2, status: 'excellent' }
  ]

  const timeAnalysisData = [
    { hour: '9 AM', utilization: 95 },
    { hour: '10 AM', utilization: 98 },
    { hour: '11 AM', utilization: 92 },
    { hour: '12 PM', utilization: 85 },
    { hour: '1 PM', utilization: 78 },
    { hour: '2 PM', utilization: 88 },
    { hour: '3 PM', utilization: 94 },
    { hour: '4 PM', utilization: 90 },
    { hour: '5 PM', utilization: 87 }
  ]

  const pieData = [
    { name: 'Productive', value: 75, color: '#10b981' },
    { name: 'Meetings', value: 15, color: '#3b82f6' },
    { name: 'Breaks', value: 8, color: '#f59e0b' },
    { name: 'Other', value: 2, color: '#ef4444' }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'team', name: 'Team Performance', icon: Users },
    { id: 'time', name: 'Time Analysis', icon: Clock }
  ]

  return (
    <div className="page-content space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into team performance and productivity</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md-grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900">1,320h</p>
                    <p className="text-xs text-green-600">+5% from last month</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">86%</p>
                    <p className="text-xs text-green-600">+2% from last month</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                    <p className="text-2xl font-bold text-gray-900">28h</p>
                    <p className="text-xs text-red-600">-15% from last month</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Size</p>
                    <p className="text-2xl font-bold text-gray-900">16</p>
                    <p className="text-xs text-blue-600">2 new hires</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance Trends</CardTitle>
                <CardDescription>Hours worked and efficiency over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hours" stroke="#3b82f6" name="Hours" />
                    <Line type="monotone" dataKey="efficiency" stroke="#10b981" name="Efficiency %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productivity vs Hours</CardTitle>
                <CardDescription>Daily productivity correlation with hours worked</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="productivity" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                    <Area type="monotone" dataKey="hours" stackId="1" stroke="#10b981" fill="#10b981" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Team Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Overview</CardTitle>
              <CardDescription>Individual team member performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Team Member</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Hours</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Efficiency</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Overtime</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.map((member, index) => (
                      <tr key={index} className="border-b border-gray-100 hover-bg-gray-50">
                        <td className="py-3 px-4">{member.name}</td>
                        <td className="py-3 px-4">{member.hours}h</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="mr-2">{member.efficiency}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${member.efficiency}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{member.overtime}h</td>
                        <td className="py-3 px-4">
                          <Badge variant={member.status === 'excellent' ? 'green' : 'blue'}>
                            {member.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Team Charts */}
          <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Efficiency Distribution</CardTitle>
                <CardDescription>Efficiency percentage by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="efficiency" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hours vs Overtime</CardTitle>
                <CardDescription>Regular hours vs overtime by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#10b981" name="Regular Hours" />
                    <Bar dataKey="overtime" fill="#f59e0b" name="Overtime Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="space-y-6">
          {/* Time Overview Cards */}
          <div className="grid grid-cols-1 md-grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900">1,247h</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                    <p className="text-2xl font-bold text-gray-900">43h</p>
                    <p className="text-xs text-gray-500">3.4% of total</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Daily Hours</p>
                    <p className="text-2xl font-bold text-gray-900">7.8h</p>
                    <p className="text-xs text-green-600">Within target</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Analysis Charts */}
          <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
                <CardDescription>Utilization percentage by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="utilization" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Utilization Breakdown</CardTitle>
                <CardDescription>How time is being utilized</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Time Allocation Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Time Allocation Trends</CardTitle>
              <CardDescription>Daily time allocation across different activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="productivity" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                  <Area type="monotone" dataKey="hours" stackId="1" stroke="#10b981" fill="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// COMPLETE REPORTS PAGE IMPLEMENTATION
function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31'
  })
  const [filters, setFilters] = useState({
    department: '',
    employee: '',
    status: ''
  })
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)

  const reportTypes = [
    {
      id: 'timesheet-summary',
      name: 'Timesheet Summary',
      description: 'Comprehensive overview of all timesheet entries with approval status',
      icon: Clock
    },
    {
      id: 'employee-productivity',
      name: 'Employee Productivity',
      description: 'Individual employee performance metrics and productivity analysis',
      icon: Users
    },
    {
      id: 'department-analysis',
      name: 'Department Analysis',
      description: 'Department-wise time allocation and efficiency metrics',
      icon: BarChart3
    },
    {
      id: 'overtime-report',
      name: 'Overtime Report',
      description: 'Detailed analysis of overtime hours and patterns',
      icon: AlertCircle
    },
    {
      id: 'billable-hours',
      name: 'Billable Hours Report',
      description: 'Client billing analysis and revenue tracking',
      icon: DollarSign
    },
    {
      id: 'utilization-metrics',
      name: 'Utilization Metrics',
      description: 'Resource utilization and capacity planning insights',
      icon: Target
    }
  ]

  const recentReports = [
    {
      id: 1,
      name: 'Monthly Timesheet Summary - December 2023',
      type: 'timesheet-summary',
      generatedAt: '2024-01-02T10:30:00Z',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Q4 Employee Productivity Report',
      type: 'employee-productivity',
      generatedAt: '2024-01-01T15:45:00Z',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Department Analysis - Operations',
      type: 'department-analysis',
      generatedAt: '2023-12-28T09:15:00Z',
      status: 'completed'
    }
  ]

  const handleGenerateReport = async () => {
    if (!selectedReport) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock report data
      setReportData({
        type: selectedReport,
        generatedAt: new Date().toISOString(),
        data: {
          totalEntries: 245,
          totalHours: 1960,
          averageHours: 8.0,
          approvalRate: 94.3
        }
      })
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = (format) => {
    console.log(`Exporting report in ${format} format`)
    // Implement export functionality
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive reports and analytics</p>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg-col-span-2 space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Report Type</CardTitle>
              <CardDescription>Choose the type of report you want to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                {reportTypes.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReport === report.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover-border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <report.icon className={`w-6 h-6 mr-3 mt-1 ${
                        selectedReport === report.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h3 className={`font-medium ${
                          selectedReport === report.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Configuration */}
          {selectedReport && (
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>Configure your report parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Range */}
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md-grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      id="department"
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    >
                      <option value="">All Departments</option>
                      <option value="management">Management</option>
                      <option value="operations">Operations</option>
                      <option value="marketing">Marketing</option>
                      <option value="customer-service">Customer Service</option>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="employee">Employee</Label>
                    <Select
                      id="employee"
                      value={filters.employee}
                      onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                    >
                      <option value="">All Employees</option>
                      <option value="1">Test Admin</option>
                      <option value="2">Test User</option>
                      <option value="3">Campaign Leader</option>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </Select>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-end">
                  <Button onClick={handleGenerateReport} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Results */}
          {reportData && (
            <Card>
              <CardHeader>
                <CardTitle>Report Results</CardTitle>
                <CardDescription>
                  Generated on {new Date(reportData.generatedAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md-grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{reportData.data.totalEntries}</p>
                    <p className="text-sm text-gray-600">Total Entries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{reportData.data.totalHours}h</p>
                    <p className="text-sm text-gray-600">Total Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{reportData.data.averageHours}h</p>
                    <p className="text-sm text-gray-600">Average Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{reportData.data.approvalRate}%</p>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleExportReport('pdf')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" onClick={() => handleExportReport('excel')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button variant="outline" onClick={() => handleExportReport('csv')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Reports Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="p-3 border rounded-lg hover-bg-gray-50">
                    <h4 className="font-medium text-sm text-gray-900">{report.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="green">{report.status}</Badge>
                      <Button size="sm" variant="ghost">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// SETTINGS PAGE IMPLEMENTATION
function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      weekly_summary: true
    },
    preferences: {
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h'
    }
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'security', name: 'Security', icon: Lock }
  ]

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg-col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-none first:rounded-t-lg last:rounded-b-lg ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg-col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
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
                
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: e.target.checked }
                      })}
                      className="toggle"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, push: e.target.checked }
                      })}
                      className="toggle"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Summary</Label>
                      <p className="text-sm text-gray-600">Receive weekly timesheet summary</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.weekly_summary}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, weekly_summary: e.target.checked }
                      })}
                      className="toggle"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>Customize your application experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      id="timezone"
                      value={settings.preferences.timezone}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, timezone: e.target.value }
                      })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="CST">Central Time</option>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="date_format">Date Format</Label>
                    <Select
                      id="date_format"
                      value={settings.preferences.date_format}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, date_format: e.target.value }
                      })}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="time_format">Time Format</Label>
                  <Select
                    id="time_format"
                    value={settings.preferences.time_format}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, time_format: e.target.value }
                    })}
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    placeholder="Enter current password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// DATA MANAGEMENT PAGE IMPLEMENTATION
function DataManagementPage() {
  const [uploadStats, setUploadStats] = useState({
    totalEmployees: 16,
    totalPayrollRecords: 245,
    lastUpload: '2024-01-15'
  })
  const [showUploadCockpit, setShowUploadCockpit] = useState(false)

  const handleDataUploaded = (data) => {
    console.log('Data uploaded:', data)
    setUploadStats(prev => ({
      ...prev,
      totalEmployees: prev.totalEmployees + (data.employees?.length || 0),
      totalPayrollRecords: prev.totalPayrollRecords + (data.payroll?.length || 0),
      lastUpload: new Date().toISOString().split('T')[0]
    }))
    setShowUploadCockpit(false)
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600 mt-1">Upload and manage employee and payroll data</p>
      </div>

      {/* Upload Statistics */}
      <div className="grid grid-cols-1 sm-grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-blue">
                <Users className="w-5 h-5" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Total Employees</p>
                <p className="stat-value">{uploadStats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-green">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Payroll Records</p>
                <p className="stat-value">{uploadStats.totalPayrollRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-purple">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Last Upload</p>
                <p className="stat-value text-sm">{uploadStats.lastUpload || 'Never'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Actions */}
      <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Data Upload</CardTitle>
            <CardDescription>Upload employee information, hire dates, and status data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={downloadEmployeeTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Employee Template
              </Button>
              <Button 
                onClick={() => setShowUploadCockpit(true)}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Employee Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Data Upload</CardTitle>
            <CardDescription>Upload historical payroll and time records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={downloadPayrollTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Payroll Template
              </Button>
              <Button 
                onClick={() => setShowUploadCockpit(true)}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Payroll Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Cockpit Modal */}
      {showUploadCockpit && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            <div className="modal-header">
              <h3 className="modal-title">Data Upload</h3>
              <button 
                onClick={() => setShowUploadCockpit(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <DataUploadCockpit 
              onDataUploaded={handleDataUploaded}
              onClose={() => setShowUploadCockpit(false)}
            />
          </div>
        </div>
      )}
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

