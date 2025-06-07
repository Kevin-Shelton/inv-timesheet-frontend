// ENHANCED TIMESHEET MANAGEMENT APPLICATION
// Complete integration of existing functionality with new data loading features

import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { 
  Clock, Users, BarChart3, Settings, LogOut, Menu, X, AlertCircle, 
  CheckCircle, Plus, Check, XCircle, Download, Filter, Search, Edit, 
  Trash2, UserPlus, Shield, TrendingUp, DollarSign, Calendar, FileText,
  Home, Eye, EyeOff, Database, Upload
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
import { calculateEmployeeStatus } from './dataTemplates.jsx'
import { downloadEmployeeTemplate, downloadPayrollTemplate } from './templateGenerator.jsx'

// Enhanced Mock API with new data loading capabilities
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
        email: 'jane.smith@test.com',
        full_name: 'Jane Smith',
        role: 'campaign_lead',
        pay_rate_per_hour: 22,
        is_active: true,
        hire_date: '2023-03-15',
        department: 'Customer Service',
        employee_id: 'EMP003',
        phone: '+1-555-345-6789',
        leave_start_date: '2024-06-01',
        leave_end_date: '2024-08-01',
        leave_type: 'maternity'
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

// Auth Context (preserved from original)
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

// UI Components (preserved from original)
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

// Route Protection Components (preserved from original)
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

// Login Page (preserved from original)
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
          </div>
        </div>
      </div>
    </div>
  )
}

// NEW: Data Management Page
function DataManagementPage() {
  const { user } = useAuth()
  const [showUploadCockpit, setShowUploadCockpit] = useState(false)
  const [uploadStats, setUploadStats] = useState({
    totalEmployees: 0,
    totalPayrollRecords: 0,
    lastUpload: null
  })

  useEffect(() => {
    fetchUploadStats()
  }, [])

  const fetchUploadStats = async () => {
    try {
      const users = await api.getUsers()
      const payroll = await api.getPayrollData()
      setUploadStats({
        totalEmployees: users.length,
        totalPayrollRecords: payroll.length,
        lastUpload: new Date().toLocaleDateString()
      })
    } catch (error) {
      console.error('Error fetching upload stats:', error)
    }
  }

  const handleDataUploaded = async (data, type) => {
    try {
      if (type === 'employee') {
        await api.bulkCreateUsers(data)
      } else if (type === 'payroll') {
        await api.bulkCreatePayroll(data)
      }
      fetchUploadStats()
    } catch (error) {
      throw new Error(`Failed to upload ${type} data: ${error.message}`)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="page-content">
        <Alert variant="destructive">
          <AlertDescription>You don't have permission to access data management features.</AlertDescription>
        </Alert>
      </div>
    )
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

      {/* Recent Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Data</CardTitle>
          <CardDescription>Preview of recently uploaded data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent uploads</h3>
            <p className="text-gray-600">Upload data to see recent records here</p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Cockpit Modal */}
      {showUploadCockpit && (
        <DataUploadCockpit
          onDataUploaded={handleDataUploaded}
          onClose={() => setShowUploadCockpit(false)}
        />
      )}
    </div>
  )
}

// Dashboard (preserved from original with minor enhancements)
function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalHours: 0,
    pendingApprovals: 0,
    teamMembers: 0,
    thisWeekHours: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [timesheets, users] = await Promise.all([
        api.getTimesheets(),
        api.getUsers()
      ])
      
      setStats({
        totalHours: timesheets.reduce((sum, t) => sum + t.hours, 0),
        pendingApprovals: timesheets.filter(t => t.status === 'pending').length,
        teamMembers: users.length,
        thisWeekHours: timesheets.reduce((sum, t) => sum + t.hours, 0)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name || user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your team today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm-grid-cols-2 lg-grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-blue">
                <Clock className="w-5 h-5" />
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
              <div className="stat-icon-container stat-icon-yellow">
                <AlertCircle className="w-5 h-5" />
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
              <div className="stat-icon-container stat-icon-green">
                <Users className="w-5 h-5" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Team Members</p>
                <p className="stat-value">{stats.teamMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-purple">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="stat-details">
                <p className="stat-title">This Week</p>
                <p className="stat-value">{stats.thisWeekHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm-grid-cols-2 lg-grid-cols-3 gap-4">
            <Link to="/timesheets" className="quick-action-card">
              <Clock className="quick-action-icon" />
              <div>
                <p className="quick-action-title">Add Timesheet</p>
                <p className="quick-action-description">Log your hours for today</p>
              </div>
            </Link>
            
            {user?.role === 'admin' && (
              <>
                <Link to="/team" className="quick-action-card">
                  <Users className="quick-action-icon" />
                  <div>
                    <p className="quick-action-title">Manage Team</p>
                    <p className="quick-action-description">Add or edit team members</p>
                  </div>
                </Link>
                
                <Link to="/data-management" className="quick-action-card">
                  <Database className="quick-action-icon" />
                  <div>
                    <p className="quick-action-title">Data Management</p>
                    <p className="quick-action-description">Upload employee and payroll data</p>
                  </div>
                </Link>
              </>
            )}
            
            <Link to="/reports" className="quick-action-card">
              <FileText className="quick-action-icon" />
              <div>
                <p className="quick-action-title">Generate Report</p>
                <p className="quick-action-description">Create timesheet reports</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// All other components preserved from original (AnalyticsDashboard, ReportsPage, etc.)
// [The rest of the original components would be included here exactly as they were]
// For brevity, I'm including the key components that demonstrate the integration

// Analytics Dashboard (preserved from original)
function AnalyticsDashboard() {
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  // Mock analytics data
  const analyticsData = {
    timeDistribution: [
      { name: 'Campaign A', hours: 120, percentage: 40 },
      { name: 'Campaign B', hours: 90, percentage: 30 },
      { name: 'Campaign C', hours: 60, percentage: 20 },
      { name: 'Admin', hours: 30, percentage: 10 }
    ],
    approvalStats: [
      { status: 'Approved', count: 45 },
      { status: 'Pending', count: 12 },
      { status: 'Rejected', count: 3 }
    ],
    hoursByDay: [
      { day: 'Mon', regular: 32, overtime: 4 },
      { day: 'Tue', regular: 35, overtime: 2 },
      { day: 'Wed', regular: 38, overtime: 6 },
      { day: 'Thu', regular: 34, overtime: 3 },
      { day: 'Fri', regular: 36, overtime: 5 },
      { day: 'Sat', regular: 8, overtime: 2 },
      { day: 'Sun', regular: 4, overtime: 0 }
    ],
    productivityTrends: [
      { date: '2024-01-01', productivity: 85, hours: 8 },
      { date: '2024-01-02', productivity: 92, hours: 8.5 },
      { date: '2024-01-03', productivity: 78, hours: 7.5 },
      { date: '2024-01-04', productivity: 95, hours: 9 },
      { date: '2024-01-05', productivity: 88, hours: 8 }
    ],
    overtimeAnalysis: [
      { week: 'Week 1', planned: 160, overtime: 12 },
      { week: 'Week 2', planned: 160, overtime: 8 },
      { week: 'Week 3', planned: 160, overtime: 15 },
      { week: 'Week 4', planned: 160, overtime: 6 }
    ],
    teamPerformance: [
      { name: 'John Doe', hours: 168, efficiency: 94, overtime: 8 },
      { name: 'Jane Smith', hours: 160, efficiency: 98, overtime: 0 },
      { name: 'Mike Johnson', hours: 172, efficiency: 87, overtime: 12 },
      { name: 'Sarah Wilson', hours: 156, efficiency: 91, overtime: 4 }
    ]
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const exportReport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Analytics report exported successfully!')
    }, 2000)
  }

  return (
    <div className="page-content space-y-6">
      <div className="flex flex-col lg-flex-row lg-items-center lg-justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into team performance and productivity</p>
        </div>
        <div className="flex flex-col sm-flex-row gap-2">
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-auto"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-auto"
            />
          </div>
          <Button onClick={exportReport} disabled={loading} variant="outline">
            {loading ? (
              <div className="flex items-center">
                <div className="loading-spinner"></div>
                Exporting...
              </div>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'productivity', label: 'Productivity', icon: TrendingUp },
          { id: 'team', label: 'Team Performance', icon: Users },
          { id: 'time', label: 'Time Analysis', icon: Clock }
        ].map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`btn btn-sm ${selectedMetric === metric.id ? 'btn-primary' : 'btn-outline'}`}
          >
            <metric.icon className="w-4 h-4 mr-2" />
            {metric.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
          {/* Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution by Campaign</CardTitle>
              <CardDescription>How time is allocated across different campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.timeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percentage}) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="hours"
                    >
                      {analyticsData.timeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Approval Status */}
          <Card>
            <CardHeader>
              <CardTitle>Timesheet Approval Status</CardTitle>
              <CardDescription>Current status of timesheet submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.approvalStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Hours by Day */}
          <Card className="lg-col-span-2">
            <CardHeader>
              <CardTitle>Daily Hours Breakdown</CardTitle>
              <CardDescription>Regular vs overtime hours by day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.hoursByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="regular" stackId="a" fill="#10B981" name="Regular Hours" />
                    <Bar dataKey="overtime" stackId="a" fill="#F59E0B" name="Overtime Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other tabs would be included here exactly as in the original */}

      {/* Productivity Tab */}
      {selectedMetric === 'productivity' && (
        <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
          {/* Productivity Trends */}
          <Card className="lg-col-span-2">
            <CardHeader>
              <CardTitle>Productivity Trends</CardTitle>
              <CardDescription>Daily productivity metrics and hours worked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.productivityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="productivity" stroke="#3B82F6" name="Productivity %" />
                    <Line yAxisId="right" type="monotone" dataKey="hours" stroke="#10B981" name="Hours Worked" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Overtime Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Overtime Analysis</CardTitle>
              <CardDescription>Planned vs overtime hours by week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.overtimeAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="planned" fill="#3B82F6" name="Planned Hours" />
                    <Bar dataKey="overtime" fill="#F59E0B" name="Overtime Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="metric-item">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Average Productivity</span>
                    <span className="text-lg font-bold text-blue-600">87.6%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '87.6%'}}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Task Completion Rate</span>
                    <span className="text-lg font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '94.2%'}}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Quality Score</span>
                    <span className="text-lg font-bold text-purple-600">91.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '91.8%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Performance Tab */}
      {selectedMetric === 'team' && (
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
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Team Member</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Hours Worked</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Efficiency</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Overtime</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.teamPerformance.map((member, index) => (
                      <tr key={index} className="border-b hover-bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-blue-600">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{member.hours}h</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="mr-2">{member.efficiency}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{width: `${member.efficiency}%`}}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{member.overtime}h</td>
                        <td className="py-3 px-4">
                          <Badge variant={member.efficiency >= 90 ? 'green' : member.efficiency >= 80 ? 'yellow' : 'red'}>
                            {member.efficiency >= 90 ? 'Excellent' : member.efficiency >= 80 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance Charts */}
          <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Distribution</CardTitle>
                <CardDescription>Team efficiency breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="efficiency" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hours vs Overtime</CardTitle>
                <CardDescription>Regular hours vs overtime by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" fill="#10B981" name="Regular Hours" />
                      <Bar dataKey="overtime" fill="#F59E0B" name="Overtime Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Time Analysis Tab */}
      {selectedMetric === 'time' && (
        <div className="space-y-6">
          {/* Time Analysis Overview */}
          <div className="grid grid-cols-1 md-grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Hours</CardTitle>
                <CardDescription>This period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">1,247h</div>
                <p className="text-sm text-gray-600 mt-1">+12% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Overtime Hours</CardTitle>
                <CardDescription>This period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">43h</div>
                <p className="text-sm text-gray-600 mt-1">-8% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Daily</CardTitle>
                <CardDescription>Per team member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">7.8h</div>
                <p className="text-sm text-gray-600 mt-1">Within target range</p>
              </CardContent>
            </Card>
          </div>

          {/* Time Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Time Allocation Trends</CardTitle>
              <CardDescription>Daily time allocation over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.hoursByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="regular" stackId="1" stroke="#10B981" fill="#10B981" name="Regular Hours" />
                    <Area type="monotone" dataKey="overtime" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Overtime Hours" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Time Distribution Analysis */}
          <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
                <CardDescription>Most productive time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">9:00 AM - 11:00 AM</span>
                    <span className="text-blue-600 font-bold">Peak Productivity</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">2:00 PM - 4:00 PM</span>
                    <span className="text-green-600 font-bold">High Efficiency</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">4:00 PM - 6:00 PM</span>
                    <span className="text-yellow-600 font-bold">Moderate Activity</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Utilization</CardTitle>
                <CardDescription>How time is being utilized</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Productive Work</span>
                    <span className="text-sm font-bold">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Meetings</span>
                    <span className="text-sm font-bold">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Administrative</span>
                    <span className="text-sm font-bold">7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '7%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Layout Component (enhanced with new navigation)
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
      { name: 'Data Management', href: '/data-management', icon: Database }
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
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timesheets" element={<TimesheetsPage />} />
            <Route path="/team" element={<EnhancedEmployeeManagement user={user} api={api} />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/data-management" element={<DataManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// Placeholder components for the remaining pages (would include full implementations from original)
function TimesheetsPage() {
  const { user } = useAuth()
  
  // If user is admin, show the approval interface
  if (user?.role === 'admin') {
    return <AdminTimesheetApproval />
  }

  // Regular user timesheet interface
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTimesheet, setNewTimesheet] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: ''
  })

  useEffect(() => {
    fetchTimesheets()
  }, [])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const data = await api.getTimesheets()
      setTimesheets(data)
    } catch (error) {
      setError('Failed to load timesheets')
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTimesheet = async (e) => {
    e.preventDefault()
    try {
      await api.createTimesheet(newTimesheet)
      setNewTimesheet({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: ''
      })
      setShowAddForm(false)
      fetchTimesheets()
    } catch (error) {
      setError('Failed to create timesheet')
      console.error('Error creating timesheet:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'green'
      case 'rejected':
        return 'red'
      default:
        return 'yellow'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading timesheets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content space-y-6">
      <div className="flex flex-col sm-flex-row sm-items-center sm-justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Timesheets</h1>
          <p className="text-gray-600 mt-1">Track and manage your time entries</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Timesheet Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Time Entry</CardTitle>
            <CardDescription>Record your work hours for the day</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTimesheet} className="space-y-4">
              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTimesheet.date}
                    onChange={(e) => setNewTimesheet({...newTimesheet, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="8.0"
                    value={newTimesheet.hours}
                    onChange={(e) => setNewTimesheet({...newTimesheet, hours: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of work performed"
                  value={newTimesheet.description}
                  onChange={(e) => setNewTimesheet({...newTimesheet, description: e.target.value})}
                />
              </div>
              <div className="flex flex-col sm-flex-row gap-2">
                <Button type="submit">
                  Save Entry
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Timesheets List */}
      <Card>
        <CardHeader>
          <CardTitle>My Time Entries</CardTitle>
          <CardDescription>Your submitted timesheet entries</CardDescription>
        </CardHeader>
        <CardContent>
          {timesheets.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-state-icon" />
              <h3 className="empty-state-title">No timesheets yet</h3>
              <p className="empty-state-description">Start by adding your first time entry</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="timesheet-card">
                  <div className="timesheet-icon-container">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="timesheet-info">
                    <p className="timesheet-user">{timesheet.date}</p>
                    <p className="timesheet-details">{timesheet.hours} hours</p>
                    {timesheet.description && (
                      <p className="timesheet-description">{timesheet.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(timesheet.status)}
                    <Badge variant={getStatusBadge(timesheet.status)}>
                      {timesheet.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Admin Timesheet Approval Component
function AdminTimesheetApproval() {
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTimesheet, setSelectedTimesheet] = useState(null)
  const [approvalComment, setApprovalComment] = useState('')

  useEffect(() => {
    fetchTimesheets()
  }, [])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const data = await api.getTimesheets()
      setTimesheets(data)
    } catch (error) {
      setError('Failed to load timesheets')
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (timesheetId, action) => {
    try {
      if (action === 'approve') {
        await api.approveTimesheet(timesheetId, approvalComment)
      } else {
        await api.rejectTimesheet(timesheetId, approvalComment)
      }
      setSelectedTimesheet(null)
      setApprovalComment('')
      fetchTimesheets()
    } catch (error) {
      setError(`Failed to ${action} timesheet`)
      console.error(`Error ${action}ing timesheet:`, error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'green'
      case 'rejected':
        return 'red'
      default:
        return 'yellow'
    }
  }

  const filteredTimesheets = timesheets.filter(timesheet => {
    const matchesStatus = statusFilter === 'all' || timesheet.status === statusFilter
    const matchesSearch = timesheet.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timesheet.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading timesheets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Timesheet Approval</h1>
        <p className="text-gray-600 mt-1">Review and approve team timesheet entries</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col lg-flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex-1 max-w-sm">
          <div className="search-input-container">
            <Search className="search-icon" />
            <Input
              placeholder="Search by user or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Timesheets List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Timesheets</CardTitle>
          <CardDescription>All timesheet entries requiring review</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTimesheets.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-state-icon" />
              <h3 className="empty-state-title">No timesheets found</h3>
              <p className="empty-state-description">No timesheets match your current filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimesheets.map((timesheet) => (
                <div key={timesheet.id} className="timesheet-card">
                  <div className="timesheet-icon-container">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="timesheet-info">
                    <p className="timesheet-user">{timesheet.user_name || 'Unknown User'}</p>
                    <p className="timesheet-details">{timesheet.date} • {timesheet.hours} hours</p>
                    {timesheet.description && (
                      <p className="timesheet-description">{timesheet.description}</p>
                    )}
                  </div>
                  <div className="timesheet-actions">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(timesheet.status)}
                      <Badge variant={getStatusBadge(timesheet.status)}>
                        {timesheet.status}
                      </Badge>
                    </div>
                    {timesheet.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover-bg-green-50"
                          onClick={() => {
                            setSelectedTimesheet(timesheet)
                            setApprovalComment('')
                          }}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover-bg-red-50"
                          onClick={() => {
                            setSelectedTimesheet(timesheet)
                            setApprovalComment('')
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      {selectedTimesheet && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CardHeader>
              <CardTitle>Review Timesheet</CardTitle>
              <CardDescription>
                {selectedTimesheet.user_name} • {selectedTimesheet.date} • {selectedTimesheet.hours} hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTimesheet.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedTimesheet.description}</p>
                </div>
              )}
              <div className="form-group">
                <Label htmlFor="comment">Comments (optional)</Label>
                <Input
                  id="comment"
                  placeholder="Add a comment..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm-flex-row gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleApproval(selectedTimesheet.id, 'approve')}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleApproval(selectedTimesheet.id, 'reject')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTimesheet(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </div>
        </div>
      )}
    </div>
  )
}

function ReportsPage() {
  const [reportType, setReportType] = useState('payroll')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    // Mock report generation
    setTimeout(() => {
      setLoading(false)
      alert(`${reportType} report generated for ${dateRange.start} to ${dateRange.end}`)
    }, 2000)
  }

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive reports for payroll and analytics</p>
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
              <div className="form-group">
                <Label>Report Type</Label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="form-select"
                >
                  <option value="payroll">Payroll Report</option>
                  <option value="timesheet">Timesheet Summary</option>
                  <option value="productivity">Productivity Analysis</option>
                  <option value="attendance">Attendance Report</option>
                </select>
              </div>
              
              <div className="form-group">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
              
              <Button 
                onClick={generateReport} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner"></div>
                    Generating...
                  </div>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
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
              <CardDescription>Preview of your {reportType} report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="empty-state">
                <FileText className="empty-state-icon" />
                <h3 className="empty-state-title">Report Preview</h3>
                <p className="empty-state-description">
                  Configure your report settings and click "Generate Report" to see the preview
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Report will include:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {reportType === 'payroll' && (
                      <>
                        <li>• Employee hours and overtime</li>
                        <li>• Pay calculations by rate</li>
                        <li>• Total payroll costs</li>
                        <li>• Tax and deduction summaries</li>
                      </>
                    )}
                    {reportType === 'timesheet' && (
                      <>
                        <li>• Individual timesheet entries</li>
                        <li>• Approval status tracking</li>
                        <li>• Hours by project/campaign</li>
                        <li>• Time entry patterns</li>
                      </>
                    )}
                    {reportType === 'productivity' && (
                      <>
                        <li>• Productivity metrics by employee</li>
                        <li>• Efficiency trends over time</li>
                        <li>• Goal achievement rates</li>
                        <li>• Performance comparisons</li>
                      </>
                    )}
                    {reportType === 'attendance' && (
                      <>
                        <li>• Daily attendance records</li>
                        <li>• Late arrivals and early departures</li>
                        <li>• Absence patterns</li>
                        <li>• Attendance rate calculations</li>
                      </>
                    )}
                  </ul>
                </div>
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
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <h3 className="empty-state-title">No reports generated yet</h3>
            <p className="empty-state-description">
              Generate your first report to see it listed here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      timesheet_reminders: true,
      approval_notifications: true
    },
    preferences: {
      theme: 'light',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h'
    },
    privacy: {
      profile_visibility: 'team',
      activity_tracking: true
    }
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Mock save operation
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  return (
    <div className="page-content space-y-6">
      <div className="flex flex-col sm-flex-row sm-items-center sm-justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and notifications</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <div className="flex items-center">
              <div className="loading-spinner"></div>
              Saving...
            </div>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus-ring-2 border-gray-300 rounded"
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
                onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus-ring-2 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Timesheet Reminders</Label>
                <p className="text-sm text-gray-600">Daily reminders to submit timesheets</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.timesheet_reminders}
                onChange={(e) => updateSetting('notifications', 'timesheet_reminders', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus-ring-2 border-gray-300 rounded"
              />
            </div>
            
            {user?.role === 'admin' && (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Approval Notifications</Label>
                  <p className="text-sm text-gray-600">Notifications for pending approvals</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.approval_notifications}
                  onChange={(e) => updateSetting('notifications', 'approval_notifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus-ring-2 border-gray-300 rounded"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-group">
              <Label>Theme</Label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                className="form-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div className="form-group">
              <Label>Date Format</Label>
              <select
                value={settings.preferences.date_format}
                onChange={(e) => updateSetting('preferences', 'date_format', e.target.value)}
                className="form-select"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div className="form-group">
              <Label>Time Format</Label>
              <select
                value={settings.preferences.time_format}
                onChange={(e) => updateSetting('preferences', 'time_format', e.target.value)}
                className="form-select"
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
            
            <div className="form-group">
              <Label>Timezone</Label>
              <select
                value={settings.preferences.timezone}
                onChange={(e) => updateSetting('preferences', 'timezone', e.target.value)}
                className="form-select"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="CST">Central Time</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Control your privacy and data settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-group">
              <Label>Profile Visibility</Label>
              <select
                value={settings.privacy.profile_visibility}
                onChange={(e) => updateSetting('privacy', 'profile_visibility', e.target.value)}
                className="form-select"
              >
                <option value="public">Public</option>
                <option value="team">Team Only</option>
                <option value="private">Private</option>
              </select>
              <p className="text-sm text-gray-600 mt-1">Who can see your profile information</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Activity Tracking</Label>
                <p className="text-sm text-gray-600">Allow tracking for analytics and reporting</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.activity_tracking}
                onChange={(e) => updateSetting('privacy', 'activity_tracking', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus-ring-2 border-gray-300 rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-group">
              <Label>Full Name</Label>
              <Input
                value={user?.full_name || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="form-group">
              <Label>Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="form-group">
              <Label>Role</Label>
              <Input
                value={user?.role || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
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
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

