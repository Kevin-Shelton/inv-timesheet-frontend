// COMPLETE ENHANCED TIMESHEET MANAGEMENT APP
// Fixed version with proper CSS styling (no Tailwind dependencies)

import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { 
  Clock, Users, BarChart3, Settings, LogOut, Menu, X, AlertCircle, 
  CheckCircle, Plus, Check, XCircle, Download, Filter, Search, Edit, 
  Trash2, UserPlus, Shield, TrendingUp, DollarSign, Calendar, FileText,
  Home, Eye, EyeOff
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, 
  AreaChart, Area 
} from 'recharts'
import './App.css'

// Mock API for demonstration
const api = {
  login: async (email, password) => {
    // Mock login - replace with actual API call
    if (email === 'admin@test.com' && password === 'password123') {
      return {
        token: 'mock-token',
        user: { id: 1, email, full_name: 'Admin User', role: 'admin' }
      }
    }
    if (email === 'user@test.com' && password === 'password123') {
      return {
        token: 'mock-token',
        user: { id: 2, email, full_name: 'Regular User', role: 'team_member' }
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
    return [
      { id: 1, email: 'admin@test.com', full_name: 'Admin User', role: 'admin', pay_rate_per_hour: 25, is_active: true },
      { id: 2, email: 'user@test.com', full_name: 'Regular User', role: 'team_member', pay_rate_per_hour: 18, is_active: true }
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

// UI Components with proper CSS classes
const Button = ({ children, className = '', variant = 'primary', size = 'default', onClick, disabled, type = 'button', ...props }) => {
  const baseClass = 'btn'
  const variantClass = `btn-${variant}`
  const sizeClass = size !== 'default' ? `btn-${size}` : ''
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '', ...props }) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`card-title ${className}`} {...props}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`card-description ${className}`} {...props}>
    {children}
  </p>
)

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`card-content ${className}`} {...props}>
    {children}
  </div>
)

const Input = ({ className = '', type = 'text', ...props }) => (
  <input
    type={type}
    className={`form-input ${className}`}
    {...props}
  />
)

const Label = ({ children, className = '', ...props }) => (
  <label className={`form-label ${className}`} {...props}>
    {children}
  </label>
)

const Badge = ({ children, className = '', variant = 'blue', ...props }) => (
  <div className={`badge badge-${variant} ${className}`} {...props}>
    {children}
  </div>
)

const Alert = ({ children, className = '', variant = 'default', ...props }) => (
  <div className={`alert alert-${variant} ${className}`} {...props}>
    {children}
  </div>
)

const AlertDescription = ({ children, className = '', ...props }) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
)

// Route Protection Components
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="login-container">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
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
      <div className="login-container">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch (error) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="login-title">
            TimeSheet Manager
          </h2>
          <p className="login-subtitle">
            BPO Management System
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="form-group">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="password">Password</Label>
              <div className="password-input-container">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <p>Admin: admin@test.com / password123</p>
            <p>User: user@test.com / password123</p>
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
              'Sign in'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

// Analytics Dashboard Component
function AnalyticsDashboard() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState({
    timeDistribution: [],
    productivityTrends: [],
    teamPerformance: [],
    hoursByDay: [],
    approvalStats: [],
    overtimeAnalysis: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedMetric, setSelectedMetric] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockData = {
        timeDistribution: [
          { name: 'Campaign A', hours: 120, percentage: 35 },
          { name: 'Campaign B', hours: 85, percentage: 25 },
          { name: 'Campaign C', hours: 95, percentage: 28 },
          { name: 'Admin Tasks', hours: 40, percentage: 12 }
        ],
        productivityTrends: [
          { date: '2024-01-01', productivity: 85, hours: 8.2 },
          { date: '2024-01-02', productivity: 92, hours: 8.5 },
          { date: '2024-01-03', productivity: 78, hours: 7.8 },
          { date: '2024-01-04', productivity: 88, hours: 8.3 },
          { date: '2024-01-05', productivity: 95, hours: 8.7 },
          { date: '2024-01-06', productivity: 82, hours: 8.0 },
          { date: '2024-01-07', productivity: 90, hours: 8.4 }
        ],
        teamPerformance: [
          { name: 'John Doe', hours: 168, efficiency: 92, overtime: 8 },
          { name: 'Jane Smith', hours: 160, efficiency: 88, overtime: 0 },
          { name: 'Mike Johnson', hours: 172, efficiency: 95, overtime: 12 },
          { name: 'Sarah Wilson', hours: 156, efficiency: 85, overtime: 4 }
        ],
        hoursByDay: [
          { day: 'Mon', regular: 32, overtime: 4 },
          { day: 'Tue', regular: 35, overtime: 2 },
          { day: 'Wed', regular: 38, overtime: 6 },
          { day: 'Thu', regular: 36, overtime: 3 },
          { day: 'Fri', regular: 34, overtime: 5 },
          { day: 'Sat', regular: 12, overtime: 8 },
          { day: 'Sun', regular: 8, overtime: 2 }
        ],
        approvalStats: [
          { status: 'Approved', count: 145, percentage: 78 },
          { status: 'Pending', count: 28, percentage: 15 },
          { status: 'Rejected', count: 13, percentage: 7 }
        ],
        overtimeAnalysis: [
          { week: 'Week 1', planned: 160, actual: 168, overtime: 8 },
          { week: 'Week 2', planned: 160, actual: 165, overtime: 5 },
          { week: 'Week 3', planned: 160, actual: 172, overtime: 12 },
          { week: 'Week 4', planned: 160, actual: 158, overtime: 0 }
        ]
      }
      
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content space-y-6">
      <div className="flex flex-col lg-flex-row lg-items-center lg-justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into team performance and productivity</p>
        </div>
        <div className="flex flex-col sm-flex-row gap-4">
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-40"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-40"
            />
          </div>
          <Button onClick={fetchAnalyticsData}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metric Selection Tabs */}
      <div className="tab-nav">
        {[
          { id: 'overview', name: 'Overview', icon: BarChart3 },
          { id: 'productivity', name: 'Productivity', icon: TrendingUp },
          { id: 'team', name: 'Team Performance', icon: Users },
          { id: 'time', name: 'Time Analysis', icon: Clock }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMetric(tab.id)}
            className={`tab-button ${selectedMetric === tab.id ? 'active' : ''}`}
          >
            <tab.icon className="tab-icon" />
            <span className="tab-text">{tab.name}</span>
            <span className="tab-text-short">{tab.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
          {/* Time Distribution Pie Chart */}
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

      {/* Productivity Tab */}
      {selectedMetric === 'productivity' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Trends</CardTitle>
              <CardDescription>Daily productivity scores and hours worked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container-large">
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

          <Card>
            <CardHeader>
              <CardTitle>Overtime Analysis</CardTitle>
              <CardDescription>Planned vs actual hours with overtime tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.overtimeAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="planned" stackId="1" stroke="#8884d8" fill="#8884d8" name="Planned Hours" />
                    <Area type="monotone" dataKey="overtime" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Overtime Hours" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Performance Tab */}
      {selectedMetric === 'team' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Metrics</CardTitle>
              <CardDescription>Individual team member performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.teamPerformance.map((member, index) => (
                  <div key={index} className="flex flex-col sm-flex-row sm-items-center sm-justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4 mb-3 sm-mb-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.hours} hours this month</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm-justify-end space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Efficiency</p>
                        <p className="text-lg font-semibold text-green-600">{member.efficiency}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Overtime</p>
                        <p className="text-lg font-semibold text-orange-600">{member.overtime}h</p>
                      </div>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill" 
                          style={{width: `${member.efficiency}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Analysis Tab */}
      {selectedMetric === 'time' && (
        <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Utilization</CardTitle>
              <CardDescription>How time is being utilized across the organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Productive Work', value: 75, color: '#10B981' },
                        { name: 'Meetings', value: 15, color: '#3B82F6' },
                        { name: 'Admin Tasks', value: 7, color: '#F59E0B' },
                        { name: 'Breaks', value: 3, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {[
                        { name: 'Productive Work', value: 75, color: '#10B981' },
                        { name: 'Meetings', value: 15, color: '#3B82F6' },
                        { name: 'Admin Tasks', value: 7, color: '#F59E0B' },
                        { name: 'Breaks', value: 3, color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>When your team is most productive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { hour: '9 AM', productivity: 65 },
                    { hour: '10 AM', productivity: 85 },
                    { hour: '11 AM', productivity: 95 },
                    { hour: '12 PM', productivity: 70 },
                    { hour: '1 PM', productivity: 60 },
                    { hour: '2 PM', productivity: 80 },
                    { hour: '3 PM', productivity: 90 },
                    { hour: '4 PM', productivity: 75 },
                    { hour: '5 PM', productivity: 55 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="productivity" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Reports Page Component
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
    </div>
  )
}

// Admin Timesheet Approval Component
function AdminTimesheetApproval() {
  const [allTimesheets, setAllTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTimesheet, setSelectedTimesheet] = useState(null)
  const [approvalComment, setApprovalComment] = useState('')

  useEffect(() => {
    fetchAllTimesheets()
  }, [filter])

  const fetchAllTimesheets = async () => {
    try {
      setLoading(true)
      const data = await api.getTimesheets({ status: filter === 'all' ? undefined : filter })
      setAllTimesheets(data)
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
      setApprovalComment('')
      setSelectedTimesheet(null)
      fetchAllTimesheets()
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

  const filteredTimesheets = allTimesheets.filter(timesheet =>
    timesheet.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timesheet.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Timesheet Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve team timesheet entries</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm-flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
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

// Regular User Timesheets Page
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

// Team Management Page
function TeamPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newMember, setNewMember] = useState({
    email: '',
    full_name: '',
    role: 'team_member',
    pay_rate_per_hour: ''
  })

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers()
      setTeamMembers(data)
    } catch (error) {
      setError('Failed to load team members')
      console.error('Error fetching team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMember = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          ...newMember,
          id: editingUser.id
        })
      } else {
        await api.createUser(newMember)
      }
      setNewMember({
        email: '',
        full_name: '',
        role: 'team_member',
        pay_rate_per_hour: ''
      })
      setShowAddForm(false)
      setEditingUser(null)
      fetchTeamMembers()
    } catch (error) {
      setError(`Failed to ${editingUser ? 'update' : 'create'} team member`)
      console.error(`Error ${editingUser ? 'updating' : 'creating'} team member:`, error)
    }
  }

  const handleEditUser = (member) => {
    setEditingUser(member)
    setNewMember({
      email: member.email,
      full_name: member.full_name,
      role: member.role,
      pay_rate_per_hour: member.pay_rate_per_hour || ''
    })
    setShowAddForm(true)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId)
        fetchTeamMembers()
      } catch (error) {
        setError('Failed to delete user')
        console.error('Error deleting user:', error)
      }
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'red'
      case 'campaign_lead':
        return 'blue'
      default:
        return 'gray'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    )
  }

  const canManageTeam = user?.role === 'admin' || user?.role === 'campaign_lead'
  const isAdmin = user?.role === 'admin'

  return (
    <div className="page-content space-y-6">
      <div className="flex flex-col sm-flex-row sm-items-center sm-justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
        </div>
        {canManageTeam && (
          <Button onClick={() => {
            setEditingUser(null)
            setNewMember({
              email: '',
              full_name: '',
              role: 'team_member',
              pay_rate_per_hour: ''
            })
            setShowAddForm(true)
          }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!canManageTeam && (
        <Alert>
          <AlertDescription>
            You don't have permission to manage team members. Contact your administrator for access.
          </AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Member Form */}
      {showAddForm && canManageTeam && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
            <CardDescription>
              {editingUser ? 'Update team member information' : 'Invite a new member to join your team'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitMember} className="space-y-4">
              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@company.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={newMember.full_name}
                    onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="form-select"
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  >
                    <option value="team_member">Team Member</option>
                    <option value="campaign_lead">Campaign Lead</option>
                    {isAdmin && <option value="admin">Admin</option>}
                  </select>
                </div>
                <div className="form-group">
                  <Label htmlFor="pay_rate">Pay Rate (per hour)</Label>
                  <Input
                    id="pay_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="18.50"
                    value={newMember.pay_rate_per_hour}
                    onChange={(e) => setNewMember({...newMember, pay_rate_per_hour: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col sm-flex-row gap-2">
                <Button type="submit">
                  {editingUser ? 'Update Member' : 'Add Member'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddForm(false)
                  setEditingUser(null)
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Current team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-state-icon" />
              <h3 className="empty-state-title">No team members yet</h3>
              <p className="empty-state-description">Start building your team by adding members</p>
              {canManageTeam && (
                <Button onClick={() => setShowAddForm(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="team-member-card">
                  <div className="team-member-avatar">
                    <span className="team-member-avatar-text">
                      {member.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  <div className="team-member-info">
                    <p className="team-member-name">{member.full_name}</p>
                    <p className="team-member-email">{member.email}</p>
                    {member.pay_rate_per_hour && (
                      <p className="team-member-rate">${member.pay_rate_per_hour}/hour</p>
                    )}
                  </div>
                  <div className="team-member-actions">
                    <Badge variant={getRoleBadge(member.role)}>
                      {member.role?.replace('_', ' ')}
                    </Badge>
                    {isAdmin && member.id !== user.id && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover-bg-red-50"
                          onClick={() => handleDeleteUser(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  )
}

// Dashboard Component
function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    personalStats: {
      hoursThisWeek: 32.5,
      pendingApprovals: 3,
      monthlyTotal: 128.5,
      overtimeHours: 4.5
    },
    adminStats: {
      totalUsers: 0,
      activeTimesheets: 0,
      pendingApprovals: 0,
      totalHoursThisMonth: 0
    },
    recentTimesheets: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch personal timesheets
      const personalTimesheets = await api.getTimesheets()
      
      // If admin, fetch additional data
      if (user?.role === 'admin') {
        const [allUsers, allTimesheets] = await Promise.all([
          api.getUsers(),
          api.getTimesheets({ status: 'all' })
        ])
        
        setDashboardData(prev => ({
          ...prev,
          adminStats: {
            totalUsers: allUsers.length,
            activeTimesheets: allTimesheets.filter(t => t.status === 'pending').length,
            pendingApprovals: allTimesheets.filter(t => t.status === 'pending').length,
            totalHoursThisMonth: allTimesheets.reduce((sum, t) => sum + parseFloat(t.hours || 0), 0)
          },
          recentTimesheets: allTimesheets.slice(0, 5)
        }))
      } else {
        // Calculate personal stats
        const thisWeekHours = personalTimesheets
          .filter(t => new Date(t.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((sum, t) => sum + parseFloat(t.hours || 0), 0)
        
        setDashboardData(prev => ({
          ...prev,
          personalStats: {
            hoursThisWeek: thisWeekHours,
            pendingApprovals: personalTimesheets.filter(t => t.status === 'pending').length,
            monthlyTotal: personalTimesheets
              .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
              .reduce((sum, t) => sum + parseFloat(t.hours || 0), 0),
            overtimeHours: Math.max(0, thisWeekHours - 40)
          },
          recentTimesheets: personalTimesheets.slice(0, 5)
        }))
      }
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
          <Home className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name || user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin' ? 'Organization Overview' : 'Your timesheet summary'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm-grid-cols-2 lg-grid-cols-4 gap-4 mb-8">
        {user?.role === 'admin' ? (
          <>
            <StatCard
              title="Total Users"
              value={dashboardData.adminStats.totalUsers}
              icon={<Users className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Pending Approvals"
              value={dashboardData.adminStats.pendingApprovals}
              icon={<Clock className="w-6 h-6" />}
              color="yellow"
            />
            <StatCard
              title="Total Hours (Month)"
              value={dashboardData.adminStats.totalHoursThisMonth}
              icon={<BarChart3 className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Active Timesheets"
              value={dashboardData.adminStats.activeTimesheets}
              icon={<FileText className="w-6 h-6" />}
              color="purple"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Hours This Week"
              value={dashboardData.personalStats.hoursThisWeek}
              icon={<Clock className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Pending Approvals"
              value={dashboardData.personalStats.pendingApprovals}
              icon={<AlertCircle className="w-6 h-6" />}
              color="yellow"
            />
            <StatCard
              title="Monthly Total"
              value={dashboardData.personalStats.monthlyTotal}
              icon={<BarChart3 className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Overtime Hours"
              value={dashboardData.personalStats.overtimeHours}
              icon={<TrendingUp className="w-6 h-6" />}
              color="red"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'admin' ? 'Recent Team Activity' : 'Recent Timesheets'}
          </CardTitle>
          <CardDescription>
            {user?.role === 'admin' ? 'Latest timesheet submissions from your team' : 'Your recent time entries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.recentTimesheets.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-state-icon" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentTimesheets.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.role === 'admin' ? item.user_name : 'You'} - {item.hours} hours
                      </p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <Badge variant={
                    item.status === 'approved' ? 'green' :
                    item.status === 'rejected' ? 'red' :
                    'yellow'
                  }>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for Admin */}
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md-grid-cols-3 gap-4">
              <Link
                to="/timesheets"
                className="quick-action-card bg-blue-50 hover-bg-blue-100"
              >
                <Clock className="quick-action-icon text-blue-600" />
                <div>
                  <p className="quick-action-title text-blue-900">Review Timesheets</p>
                  <p className="quick-action-description text-blue-600">Approve pending entries</p>
                </div>
              </Link>
              <Link
                to="/team"
                className="quick-action-card bg-green-50 hover-bg-green-100"
              >
                <Users className="quick-action-icon text-green-600" />
                <div>
                  <p className="quick-action-title text-green-900">Manage Team</p>
                  <p className="quick-action-description text-green-600">Add or edit team members</p>
                </div>
              </Link>
              <Link
                to="/reports"
                className="quick-action-card bg-purple-50 hover-bg-purple-100"
              >
                <FileText className="quick-action-icon text-purple-600" />
                <div>
                  <p className="quick-action-title text-purple-900">Export Reports</p>
                  <p className="quick-action-description text-purple-600">Generate payroll reports</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <Card className="stat-card">
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={`stat-icon-container stat-icon-${color}`}>
            {icon}
          </div>
          <div className="stat-details">
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Settings Page
function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    notifications: true,
    emailReports: false,
    theme: 'light',
    timezone: 'UTC'
  })

  return (
    <div className="page-content space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-group">
              <Label>Full Name</Label>
              <Input value={user?.full_name || ''} readOnly />
            </div>
            <div className="form-group">
              <Label>Email</Label>
              <Input value={user?.email || ''} readOnly />
            </div>
            <div className="form-group">
              <Label>Role</Label>
              <Input value={user?.role?.replace('_', ' ') || ''} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive email updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus-ring-2 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Reports</Label>
                <p className="text-sm text-gray-600">Receive weekly summary emails</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailReports}
                onChange={(e) => setSettings({...settings, emailReports: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus-ring-2 border-gray-300 rounded"
              />
            </div>
            <div className="form-group">
              <Label>Timezone</Label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
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
      </div>
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
      { name: 'Reports', href: '/reports', icon: FileText }
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
            <Route path="/team" element={<TeamPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
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

