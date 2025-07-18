// Enhanced App.jsx with Billable Hours Management System

import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { 
  Clock, Users, BarChart3, Settings, LogOut, Menu, X, AlertCircle, 
  CheckCircle, Plus, Check, XCircle, Download, Filter, Search, Edit, 
  Trash2, UserPlus, Shield, TrendingUp, DollarSign, Calendar, FileText,
  Home, Eye, EyeOff, Database, Upload, Target, Activity
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
  createUser: async (userData) => {
    console.log('Creating user:', userData)
    return { id: Date.now(), ...userData }
  },
  updateUser: async (id, userData) => {
    console.log('Updating user:', id, userData)
    return { success: true }
  },
  deleteUser: async (id) => {
    console.log('Deleting user:', id)
    return { success: true }
  },
  // Bulk upload methods
  uploadEmployees: async (employees) => {
    console.log('Uploading employees:', employees)
    return { success: true, processed: employees.length, errors: [] }
  },
  uploadPayroll: async (payrollData) => {
    console.log('Uploading payroll:', payrollData)
    return { success: true, processed: payrollData.length, errors: [] }
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
    const response = await api.login(email, password)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    return response
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
function Button({ children, variant = 'primary', size = 'md', disabled = false, onClick, className = '', ...props }) {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost'
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

function CardContent({ children }) {
  return <div className="card-content">{children}</div>
}

function Input({ className = '', ...props }) {
  return <input className={`form-input ${className}`} {...props} />
}

function Badge({ children, variant = 'default' }) {
  const variantClasses = {
    default: 'badge',
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
    blue: 'badge-blue'
  }
  
  return <span className={variantClasses[variant]}>{children}</span>
}

// Login Component
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
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="login-title">TimeSheet Manager</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-container">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
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

        <div className="login-footer">
          <p className="demo-credentials">
            <strong>Demo Credentials:</strong><br />
            Admin: admin@test.com / password123<br />
            User: user@test.com / password123<br />
            Campaign Leader: campaign@test.com / password123
          </p>
        </div>
      </div>
    </div>
  )
}

// Dashboard Component (preserved from original with billable hours integration)
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
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Welcome back, {user?.full_name || user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Hours</p>
            <p className="stat-value">{stats.totalHours}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green-100">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Billable Hours</p>
            <p className="stat-value">{stats.billableHours}</p>
            <p className="stat-change text-green-600">
              ${stats.revenue.toLocaleString()} revenue
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-purple-100">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Utilization</p>
            <p className="stat-value">{stats.utilization}%</p>
            <p className="stat-change text-green-600">Above target</p>
          </div>
        </div>

        {user?.role === 'admin' && (
          <>
            <div className="stat-card">
              <div className="stat-icon bg-yellow-100">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Pending Approvals</p>
                <p className="stat-value">{stats.pendingApprovals}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bg-indigo-100">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Users</p>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
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
      </div>
    </div>
  )
}

// All other components preserved from original (AnalyticsDashboard, TimesheetsPage, ReportsPage, SettingsPage, etc.)
// ... [Previous component implementations remain exactly the same] ...

// Main Layout Component (enhanced with billable hours navigation)
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
            <Route path="/team" element={<EnhancedEmployeeManagement />} />
            {user?.role === 'admin' && (
              <>
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/data-management" element={<DataManagementPage />} />
                <Route path="/billable-hours" element={<BillableHoursEntry user={user} />} />
                <Route path="/utilization" element={<UtilizationAnalytics />} />
                <Route path="/billable-reports" element={<BillableHoursReporting />} />
              </>
            )}
            {user?.role === 'campaign_lead' && (
              <Route path="/billable-hours" element={<BillableHoursEntry user={user} />} />
            )}
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// Data Management Page Component (preserved from original)
function DataManagementPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [uploadStats, setUploadStats] = useState({
    totalEmployees: 0,
    totalPayrollRecords: 0,
    lastUpload: null,
    recentUploads: []
  })

  return (
    <div className="page-content space-y-6">
      <div className="page-header">
        <h1 className="page-title">Data Management</h1>
        <p className="page-description">
          Manage employee data and payroll uploads
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover-text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload Data
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover-text-gray-900'
          }`}
        >
          <Download className="w-4 h-4 inline mr-2" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover-text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Upload History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && <DataUploadCockpit />}
      
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="card">
            <CardHeader>
              <CardTitle>Download Templates</CardTitle>
              <CardDescription>
                Download CSV templates with proper formatting and field descriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
                <div className="template-card">
                  <div className="template-icon">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="template-content">
                    <h3 className="template-title">Employee Template</h3>
                    <p className="template-description">
                      Upload employee information including contact details, roles, and employment data
                    </p>
                    <button
                      onClick={downloadEmployeeTemplate}
                      className="btn btn-outline mt-3"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Employee Template
                    </button>
                  </div>
                </div>

                <div className="template-card">
                  <div className="template-icon">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="template-content">
                    <h3 className="template-title">Payroll Template</h3>
                    <p className="template-description">
                      Upload payroll data including hours, rates, bonuses, and deductions
                    </p>
                    <button
                      onClick={downloadPayrollTemplate}
                      className="btn btn-outline mt-3"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Payroll Template
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>Recent data uploads and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="empty-state">
              <FileText className="empty-state-icon" />
              <h3 className="empty-state-title">No upload history</h3>
              <p className="empty-state-description">
                Upload history will appear here once you start uploading data
              </p>
            </div>
          </CardContent>
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
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

function AppContent() {
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
    return <LoginPage />
  }

  return <MainLayout />
}

export default App

