// COMPLETE TIMESHEET MANAGEMENT APPLICATION
// Full implementation with all pages and billable hours management system

import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { 
  Clock, Users, BarChart3, Settings, LogOut, Menu, X, AlertCircle, 
  CheckCircle, Plus, Check, XCircle, Download, Filter, Search, Edit, 
  Trash2, UserPlus, Shield, TrendingUp, DollarSign, Calendar, FileText,
  Home, Eye, EyeOff, Database, Upload, Target, Activity, Save, Printer,
  RefreshCw, ChevronDown, ChevronUp, Bell, Globe, Lock, User
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
                  ${stats.revenue.toLocaleString()} revenue
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
                  <div className="stat-icon-container stat-icon-yellow">
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
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-4">
            <Link to="/timesheets" className="quick-action-card">
              <Clock className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Log Hours</h3>
              <p className="text-sm text-gray-600">Submit timesheet</p>
            </Link>

            {(user?.role === 'admin' || user?.role === 'campaign_lead') && (
              <Link to="/billable-hours" className="quick-action-card">
                <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-medium">Billable Hours</h3>
                <p className="text-sm text-gray-600">Enter billable time</p>
              </Link>
            )}

            {user?.role === 'admin' && (
              <>
                <Link to="/utilization" className="quick-action-card">
                  <Target className="w-8 h-8 text-purple-600 mb-2" />
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

// COMPLETE TIMESHEETS PAGE IMPLEMENTATION
function TimesheetsPage() {
  const { user } = useAuth()
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTimesheet, setEditingTimesheet] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedTimesheet, setSelectedTimesheet] = useState(null)
  const [approvalComment, setApprovalComment] = useState('')

  // Form state
  const [formData, setFormData] = useState({
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
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTimesheet) {
        // Update existing timesheet
        await api.updateTimesheet(editingTimesheet.id, formData)
      } else {
        // Create new timesheet
        await api.createTimesheet(formData)
      }
      
      setShowForm(false)
      setEditingTimesheet(null)
      setFormData({ date: new Date().toISOString().split('T')[0], hours: '', description: '' })
      fetchTimesheets()
    } catch (error) {
      console.error('Error saving timesheet:', error)
    }
  }

  const handleEdit = (timesheet) => {
    setEditingTimesheet(timesheet)
    setFormData({
      date: timesheet.date,
      hours: timesheet.hours.toString(),
      description: timesheet.description
    })
    setShowForm(true)
  }

  const handleApproval = async (action) => {
    try {
      if (action === 'approve') {
        await api.approveTimesheet(selectedTimesheet.id, approvalComment)
      } else {
        await api.rejectTimesheet(selectedTimesheet.id, approvalComment)
      }
      
      setShowApprovalModal(false)
      setSelectedTimesheet(null)
      setApprovalComment('')
      fetchTimesheets()
    } catch (error) {
      console.error('Error processing approval:', error)
    }
  }

  const filteredTimesheets = timesheets.filter(timesheet => {
    const matchesFilter = filter === 'all' || timesheet.status === filter
    const matchesSearch = timesheet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timesheet.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="page-content space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-600 mt-1">Manage your time entries and approvals</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Timesheet
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm-flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search timesheets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      {/* Timesheets List */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>
            {user?.role === 'admin' ? 'All team timesheets' : 'Your submitted timesheets'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
              <span className="ml-2">Loading timesheets...</span>
            </div>
          ) : filteredTimesheets.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first timesheet entry.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Timesheet
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    {user?.role === 'admin' && <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>}
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="border-b border-gray-100 hover-bg-gray-50">
                      <td className="py-3 px-4">{new Date(timesheet.date).toLocaleDateString()}</td>
                      {user?.role === 'admin' && <td className="py-3 px-4">{timesheet.user_name}</td>}
                      <td className="py-3 px-4">{timesheet.hours}h</td>
                      <td className="py-3 px-4">{timesheet.description}</td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          timesheet.status === 'approved' ? 'green' :
                          timesheet.status === 'rejected' ? 'red' : 'yellow'
                        }>
                          {timesheet.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user?.role === 'admin' && timesheet.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTimesheet(timesheet)
                                  setShowApprovalModal(true)
                                }}
                              >
                                Review
                              </Button>
                            </>
                          )}
                          {(user?.role !== 'admin' || timesheet.status === 'pending') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(timesheet)}
                            >
                              <Edit className="w-4 h-4" />
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

      {/* Add/Edit Timesheet Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTimesheet ? 'Edit Timesheet' : 'Add Timesheet'}
              </h3>
              <button 
                onClick={() => {
                  setShowForm(false)
                  setEditingTimesheet(null)
                  setFormData({ date: new Date().toISOString().split('T')[0], hours: '', description: '' })
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="8.0"
                  required
                />
              </div>
              
              <div className="form-group">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your work..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingTimesheet(null)
                    setFormData({ date: new Date().toISOString().split('T')[0], hours: '', description: '' })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTimesheet ? 'Update' : 'Add'} Timesheet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedTimesheet && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Review Timesheet</h3>
              <button 
                onClick={() => {
                  setShowApprovalModal(false)
                  setSelectedTimesheet(null)
                  setApprovalComment('')
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Timesheet Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Employee:</span>
                    <span className="ml-2 font-medium">{selectedTimesheet.user_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">{new Date(selectedTimesheet.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Hours:</span>
                    <span className="ml-2 font-medium">{selectedTimesheet.hours}h</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Description:</span>
                    <p className="mt-1 font-medium">{selectedTimesheet.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Add a comment about this timesheet..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowApprovalModal(false)
                    setSelectedTimesheet(null)
                    setApprovalComment('')
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleApproval('reject')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => handleApproval('approve')}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
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
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31'
  })

  // Mock data for charts
  const overviewData = [
    { name: 'Week 1', hours: 320, billable: 240, efficiency: 75 },
    { name: 'Week 2', hours: 340, billable: 280, efficiency: 82 },
    { name: 'Week 3', hours: 310, billable: 250, efficiency: 81 },
    { name: 'Week 4', hours: 350, billable: 290, efficiency: 83 }
  ]

  const productivityData = [
    { date: '2024-01-01', productivity: 78, hours: 42 },
    { date: '2024-01-02', productivity: 82, hours: 45 },
    { date: '2024-01-03', productivity: 75, hours: 38 },
    { date: '2024-01-04', productivity: 88, hours: 48 },
    { date: '2024-01-05', productivity: 85, hours: 46 }
  ]

  const teamData = [
    { name: 'John Doe', hours: 168, efficiency: 87, overtime: 8, status: 'excellent' },
    { name: 'Jane Smith', hours: 160, efficiency: 92, overtime: 4, status: 'excellent' },
    { name: 'Mike Johnson', hours: 152, efficiency: 78, overtime: 12, status: 'good' },
    { name: 'Sarah Wilson', hours: 144, efficiency: 85, overtime: 6, status: 'good' }
  ]

  const timeAnalysisData = [
    { hour: '9 AM', utilization: 65 },
    { hour: '10 AM', utilization: 78 },
    { hour: '11 AM', utilization: 85 },
    { hour: '12 PM', utilization: 72 },
    { hour: '1 PM', utilization: 68 },
    { hour: '2 PM', utilization: 82 },
    { hour: '3 PM', utilization: 88 },
    { hour: '4 PM', utilization: 75 }
  ]

  const pieData = [
    { name: 'Productive Work', value: 78, color: '#3b82f6' },
    { name: 'Meetings', value: 15, color: '#10b981' },
    { name: 'Administrative', value: 7, color: '#f59e0b' }
  ]

  return (
    <div className="page-content space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into team performance and productivity</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-auto"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-auto"
            />
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'productivity', label: 'Productivity', icon: TrendingUp },
          { id: 'team', label: 'Team Performance', icon: Users },
          { id: 'time', label: 'Time Analysis', icon: Clock }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover-text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
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
                    <p className="text-2xl font-bold text-gray-900">1,320</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Billable Hours</p>
                    <p className="text-2xl font-bold text-gray-900">1,060</p>
                    <p className="text-xs text-green-600">80.3% utilization</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">85.7%</p>
                    <p className="text-xs text-green-600">+3.2% improvement</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$72,480</p>
                    <p className="text-xs text-green-600">+18% from target</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance Overview</CardTitle>
                <CardDescription>Hours worked vs billable hours by week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overviewData}>
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

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Trends</CardTitle>
                <CardDescription>Weekly efficiency percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'productivity' && (
        <div className="space-y-6">
          {/* Productivity Metrics */}
          <div className="grid grid-cols-1 md-grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Productivity</p>
                    <p className="text-2xl font-bold text-gray-900">87.6%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87.6%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Task Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">94.2%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-gray-900">91.8%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '91.8%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Charts */}
          <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Productivity Trends</CardTitle>
                <CardDescription>Productivity percentage and hours worked</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="productivity" stroke="#3b82f6" name="Productivity %" />
                    <Line type="monotone" dataKey="hours" stroke="#10b981" name="Hours Worked" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overtime Analysis</CardTitle>
                <CardDescription>Planned vs overtime hours by week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#3b82f6" name="Regular Hours" />
                    <Bar dataKey="billable" fill="#f59e0b" name="Overtime Hours" />
                  </BarChart>
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Hours Worked</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Efficiency</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Overtime</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.map((member, index) => (
                      <tr key={index} className="border-b border-gray-100 hover-bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-blue-600">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            {member.name}
                          </div>
                        </td>
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
                        <div className="loading-spinner mr-2"></div>
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

          {/* Report Preview */}
          {reportData && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Report Preview</CardTitle>
                    <CardDescription>
                      Generated on {new Date(reportData.generatedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExportReport('pdf')}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleExportReport('excel')}>
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md-grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{reportData.data.totalEntries}</p>
                    <p className="text-sm text-gray-600">Total Entries</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{reportData.data.totalHours}</p>
                    <p className="text-sm text-gray-600">Total Hours</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{reportData.data.averageHours}</p>
                    <p className="text-sm text-gray-600">Avg Hours/Day</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{reportData.data.approvalRate}%</p>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                  </div>
                </div>
                
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Detailed report content would be displayed here</p>
                  <p className="text-sm">Including charts, tables, and analysis</p>
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
              {recentReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No recent reports</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div key={report.id} className="p-3 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-900 mb-1">{report.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="green">Completed</Badge>
                        <Button size="sm" variant="ghost">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// COMPLETE SETTINGS PAGE IMPLEMENTATION
function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('notifications')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      timesheetReminders: true,
      approvalNotifications: true,
      weeklyReports: false
    },
    preferences: {
      theme: 'light',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      language: 'en'
    },
    privacy: {
      profileVisibility: 'team',
      activityTracking: true,
      dataSharing: false,
      analyticsOptIn: true
    }
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and notifications</p>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg-col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {[
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'preferences', label: 'Preferences', icon: Settings },
                  { id: 'privacy', label: 'Privacy', icon: Lock },
                  { id: 'account', label: 'Account', icon: User }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover-bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg-col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {activeTab === 'notifications' && 'Notification Settings'}
                    {activeTab === 'preferences' && 'User Preferences'}
                    {activeTab === 'privacy' && 'Privacy Controls'}
                    {activeTab === 'account' && 'Account Information'}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === 'notifications' && 'Configure how you receive notifications'}
                    {activeTab === 'preferences' && 'Customize your application experience'}
                    {activeTab === 'privacy' && 'Manage your privacy and data settings'}
                    {activeTab === 'account' && 'View and manage your account details'}
                  </CardDescription>
                </div>
                {activeTab !== 'account' && (
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-900">Email notifications</Label>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-900">Timesheet reminders</Label>
                          <p className="text-sm text-gray-600">Daily reminders to submit timesheets</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.timesheetReminders}
                          onChange={(e) => updateSetting('notifications', 'timesheetReminders', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-900">Approval notifications</Label>
                          <p className="text-sm text-gray-600">When timesheets are approved or rejected</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.approvalNotifications}
                          onChange={(e) => updateSetting('notifications', 'approvalNotifications', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-900">Weekly reports</Label>
                          <p className="text-sm text-gray-600">Weekly summary of your activity</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.weeklyReports}
                          onChange={(e) => updateSetting('notifications', 'weeklyReports', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-900">Browser notifications</Label>
                          <p className="text-sm text-gray-600">Show notifications in your browser</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.push}
                          onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        id="theme"
                        value={settings.preferences.theme}
                        onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        id="timezone"
                        value={settings.preferences.timezone}
                        onChange={(e) => updateSetting('preferences', 'timezone', e.target.value)}
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        id="dateFormat"
                        value={settings.preferences.dateFormat}
                        onChange={(e) => updateSetting('preferences', 'dateFormat', e.target.value)}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <Select
                        id="timeFormat"
                        value={settings.preferences.timeFormat}
                        onChange={(e) => updateSetting('preferences', 'timeFormat', e.target.value)}
                      >
                        <option value="12h">12 Hour</option>
                        <option value="24h">24 Hour</option>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        id="language"
                        value={settings.preferences.language}
                        onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="profileVisibility">Who can see your profile</Label>
                        <Select
                          id="profileVisibility"
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                        >
                          <option value="everyone">Everyone</option>
                          <option value="team">Team members only</option>
                          <option value="managers">Managers only</option>
                          <option value="private">Private</option>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Analytics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-900">Activity tracking</Label>
                          <p className="text-sm text-gray-600">Track your activity for productivity insights</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.privacy.activityTracking}
                          onChange={(e) => updateSetting('privacy', 'activityTracking', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-900">Data sharing</Label>
                          <p className="text-sm text-gray-600">Share anonymized data for product improvement</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.privacy.dataSharing}
                          onChange={(e) => updateSetting('privacy', 'dataSharing', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-900">Analytics opt-in</Label>
                          <p className="text-sm text-gray-600">Include your data in team analytics</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.privacy.analyticsOptIn}
                          onChange={(e) => updateSetting('privacy', 'analyticsOptIn', e.target.checked)}
                          className="form-checkbox"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                          <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Email</Label>
                          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Role</Label>
                          <p className="text-sm font-medium text-gray-900 capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                          <p className="text-sm font-medium text-gray-900">January 2024</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Download Data
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Data Management Page
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

