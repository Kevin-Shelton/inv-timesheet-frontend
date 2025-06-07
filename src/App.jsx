import React, { useState, useEffect, useContext, createContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, Users, Clock, Settings, LogOut, Plus, Search, Filter, 
  Download, Upload, AlertTriangle, CheckCircle, XCircle, FileSpreadsheet, 
  RefreshCw, Trash2, Eye, AlertCircle, TrendingUp, Calendar, DollarSign,
  PieChart, Activity, Target, Award, Bell, User, Lock, Mail, Phone,
  Edit, Save, X, ChevronDown, ChevronRight, Home, FileText, Database
} from 'lucide-react'
import api from './lib/api'

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
function Button({ children, variant = 'primary', size = 'md', disabled = false, onClick, className = '', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ children }) {
  return <div className="px-6 py-4 border-b border-gray-200">{children}</div>
}

function CardTitle({ children }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
}

function CardDescription({ children }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>
}

function CardContent({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

function Alert({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800'
  }
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]}`}>
      {children}
    </div>
  )
}

function AlertDescription({ children }) {
  return <div className="text-sm">{children}</div>
}

function Label({ children, htmlFor, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </label>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    />
  )
}

// Navigation array
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Timesheets', href: '/timesheets', icon: Clock },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, adminOnly: true },
  { name: 'Reports', href: '/reports', icon: FileText, adminOnly: true },
  { name: 'Bulk Import', href: '/bulk-import', icon: Database, adminOnly: true },
  { name: 'Error Management', href: '/error-management', icon: AlertTriangle, adminOnly: true },
  { name: 'Settings', href: '/settings', icon: Settings }
]

// Sidebar Component
function Sidebar({ user, onLogout }) {
  const location = useLocation()
  
  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false
    }
    return true
  })

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">TimeSheet Manager</h1>
        <p className="text-gray-400 text-sm mt-1">BPO Management System</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="w-full text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

// Login Component
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
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Access your timesheet management system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard Component
function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'admin') {
        const mockAdminData = {
          totalUsers: 45,
          pendingApprovals: 12,
          totalHoursMonth: 1840,
          activeTimesheets: 28,
          recentActivity: [
            { user: 'John Doe', action: 'submitted timesheet', time: '2 hours ago' },
            { user: 'Jane Smith', action: 'approved timesheet', time: '3 hours ago' },
            { user: 'Mike Johnson', action: 'joined team', time: '1 day ago' }
          ]
        }
        setDashboardData(mockAdminData)
      } else {
        const mockUserData = {
          hoursThisWeek: 32.5,
          pendingApprovals: 3,
          monthlyTotal: 128.5,
          overtimeHours: 4.5,
          recentTimesheets: [
            { date: '2024-01-15', hours: 8, status: 'approved' },
            { date: '2024-01-14', hours: 7.5, status: 'pending' },
            { date: '2024-01-13', hours: 8, status: 'approved' }
          ]
        }
        setDashboardData(mockUserData)
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
          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Organization Overview' : 'Your timesheet summary'}
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          {user?.role}
        </Badge>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {user?.role === 'admin' ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.pendingApprovals}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hours (Month)</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalHoursMonth}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Timesheets</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.activeTimesheets}</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hours This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.hoursThisWeek}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.pendingApprovals}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.monthlyTotal}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData?.overtimeHours}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions for Admin */}
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/timesheets">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Clock className="w-6 h-6 mb-2" />
                  Review Timesheets
                </Button>
              </Link>
              <Link to="/team">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Users className="w-6 h-6 mb-2" />
                  Manage Team
                </Button>
              </Link>
              <Link to="/bulk-import">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Database className="w-6 h-6 mb-2" />
                  Bulk Import
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  Export Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'admin' ? 'Recent Team Activity' : 'Recent Timesheets'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user?.role === 'admin' ? (
            <div className="space-y-4">
              {dashboardData?.recentActivity?.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData?.recentTimesheets?.map((timesheet, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{timesheet.date}</p>
                    <p className="text-sm text-gray-600">{timesheet.hours} hours</p>
                  </div>
                  <Badge className={
                    timesheet.status === 'approved' ? 'bg-green-100 text-green-800' :
                    timesheet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {timesheet.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Timesheets Page Component
function TimesheetsPage() {
  const { user } = useAuth()
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [newTimesheet, setNewTimesheet] = useState({
    date: '',
    hours: '',
    description: '',
    campaign: ''
  })

  useEffect(() => {
    fetchTimesheets()
  }, [filterStatus])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      if (user?.role === 'admin') {
        // Admin sees all timesheets for approval
        const mockAdminTimesheets = [
          { id: 1, user_name: 'John Doe', date: '2024-01-15', hours: 8, description: 'Regular work day', status: 'pending', campaign: 'Campaign A' },
          { id: 2, user_name: 'Jane Smith', date: '2024-01-15', hours: 7.5, description: 'Project work', status: 'approved', campaign: 'Campaign B' },
          { id: 3, user_name: 'Mike Johnson', date: '2024-01-14', hours: 8.5, description: 'Overtime work', status: 'pending', campaign: 'Campaign A' },
          { id: 4, user_name: 'Sarah Wilson', date: '2024-01-14', hours: 6, description: 'Half day', status: 'rejected', campaign: 'Campaign C' }
        ]
        setTimesheets(mockAdminTimesheets.filter(t => filterStatus === 'all' || t.status === filterStatus))
      } else {
        // Regular users see only their timesheets
        const mockUserTimesheets = [
          { id: 1, date: '2024-01-15', hours: 8, description: 'Regular work day', status: 'pending', campaign: 'Campaign A' },
          { id: 2, date: '2024-01-14', hours: 7.5, description: 'Project work', status: 'approved', campaign: 'Campaign B' },
          { id: 3, date: '2024-01-13', hours: 8, description: 'Client calls', status: 'approved', campaign: 'Campaign A' }
        ]
        setTimesheets(mockUserTimesheets.filter(t => filterStatus === 'all' || t.status === filterStatus))
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTimesheet = async (e) => {
    e.preventDefault()
    try {
      // Mock API call
      const newEntry = {
        id: Date.now(),
        ...newTimesheet,
        status: 'pending',
        user_name: user.full_name
      }
      setTimesheets(prev => [newEntry, ...prev])
      setNewTimesheet({ date: '', hours: '', description: '', campaign: '' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding timesheet:', error)
    }
  }

  const handleApproval = async (timesheetId, action, comment = '') => {
    try {
      // Mock API call
      setTimesheets(prev => prev.map(t => 
        t.id === timesheetId ? { ...t, status: action } : t
      ))
    } catch (error) {
      console.error('Error updating timesheet:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTimesheets = timesheets.filter(timesheet => {
    const matchesSearch = searchTerm === '' || 
      timesheet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (timesheet.user_name && timesheet.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'Timesheet Approvals' : 'My Timesheets'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Review and approve team timesheet submissions' : 'Track your time and submit for approval'}
          </p>
        </div>
        <div className="flex space-x-2">
          {user?.role === 'admin' && (
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          {user?.role !== 'admin' && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={user?.role === 'admin' ? "Search by user or description..." : "Search descriptions..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Add Timesheet Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Timesheet Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTimesheet} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTimesheet.date}
                    onChange={(e) => setNewTimesheet(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={newTimesheet.hours}
                    onChange={(e) => setNewTimesheet(prev => ({ ...prev, hours: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="campaign">Campaign</Label>
                <select
                  id="campaign"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTimesheet.campaign}
                  onChange={(e) => setNewTimesheet(prev => ({ ...prev, campaign: e.target.value }))}
                  required
                >
                  <option value="">Select Campaign</option>
                  <option value="Campaign A">Campaign A</option>
                  <option value="Campaign B">Campaign B</option>
                  <option value="Campaign C">Campaign C</option>
                </select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTimesheet.description}
                  onChange={(e) => setNewTimesheet(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your work activities..."
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
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
          <CardTitle>
            {user?.role === 'admin' ? 'Team Timesheets' : 'Your Timesheet Entries'}
          </CardTitle>
          <CardDescription>
            {filteredTimesheets.length} {filteredTimesheets.length === 1 ? 'entry' : 'entries'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTimesheets.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets found</h3>
              <p className="text-gray-600">
                {user?.role === 'admin' ? 'No timesheet submissions match your filters' : 'Start by adding your first timesheet entry'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.role === 'admin' ? timesheet.user_name : timesheet.date}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user?.role === 'admin' ? `${timesheet.date} • ${timesheet.hours} hours` : `${timesheet.hours} hours • ${timesheet.campaign}`}
                      </p>
                      <p className="text-sm text-gray-600">{timesheet.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(timesheet.status)}>
                      {timesheet.status}
                    </Badge>
                    {user?.role === 'admin' && timesheet.status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(timesheet.id, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(timesheet.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4" />
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

// Team Page Component
function TeamPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [newMember, setNewMember] = useState({
    email: '',
    full_name: '',
    role: 'team_member',
    pay_rate_per_hour: '',
    department: ''
  })

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      // Mock team data
      const mockTeam = [
        { id: 1, email: 'john.doe@company.com', full_name: 'John Doe', role: 'team_member', pay_rate_per_hour: 18.50, department: 'Sales', created_at: '2024-01-01' },
        { id: 2, email: 'jane.smith@company.com', full_name: 'Jane Smith', role: 'campaign_lead', pay_rate_per_hour: 22.00, department: 'Marketing', created_at: '2024-01-01' },
        { id: 3, email: 'mike.johnson@company.com', full_name: 'Mike Johnson', role: 'team_member', pay_rate_per_hour: 19.25, department: 'Support', created_at: '2024-01-02' }
      ]
      setTeamMembers(mockTeam)
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      const memberToAdd = {
        id: Date.now(),
        ...newMember,
        pay_rate_per_hour: parseFloat(newMember.pay_rate_per_hour),
        created_at: new Date().toISOString().split('T')[0]
      }
      setTeamMembers(prev => [...prev, memberToAdd])
      setNewMember({ email: '', full_name: '', role: 'team_member', pay_rate_per_hour: '', department: '' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding team member:', error)
    }
  }

  const handleEditMember = async (memberId, updatedData) => {
    try {
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, ...updatedData } : member
      ))
      setEditingMember(null)
    } catch (error) {
      console.error('Error updating team member:', error)
    }
  }

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        setTeamMembers(prev => prev.filter(member => member.id !== memberId))
      } catch (error) {
        console.error('Error deleting team member:', error)
      }
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'campaign_lead':
        return 'bg-blue-100 text-blue-800'
      case 'team_member':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  // Check if user has permission to manage team
  const canManageTeam = user?.role === 'admin' || user?.role === 'campaign_lead'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members and their roles</p>
        </div>
        {canManageTeam && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Add Member Form */}
      {showAddForm && canManageTeam && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={newMember.full_name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                    required
                  >
                    <option value="team_member">Team Member</option>
                    <option value="campaign_lead">Campaign Lead</option>
                    {user?.role === 'admin' && <option value="admin">Admin</option>}
                  </select>
                </div>
                <div>
                  <Label htmlFor="pay_rate">Pay Rate ($/hour)</Label>
                  <Input
                    id="pay_rate"
                    type="number"
                    step="0.25"
                    min="0"
                    value={newMember.pay_rate_per_hour}
                    onChange={(e) => setNewMember(prev => ({ ...prev, pay_rate_per_hour: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    value={newMember.department}
                    onChange={(e) => setNewMember(prev => ({ ...prev, department: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
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
          <CardDescription>{teamMembers.length} team members</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
              <p className="text-gray-600">Start by adding your first team member</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.full_name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-sm text-gray-600">{member.department} • ${member.pay_rate_per_hour}/hour</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getRoleColor(member.role)}>
                      {member.role.replace('_', ' ')}
                    </Badge>
                    {canManageTeam && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingMember(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMember(member.id)}
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

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const updatedData = {
                  full_name: formData.get('full_name'),
                  email: formData.get('email'),
                  role: formData.get('role'),
                  pay_rate_per_hour: parseFloat(formData.get('pay_rate_per_hour')),
                  department: formData.get('department')
                }
                handleEditMember(editingMember.id, updatedData)
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      name="email"
                      type="email"
                      defaultValue={editingMember.email}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_full_name">Full Name</Label>
                    <Input
                      id="edit_full_name"
                      name="full_name"
                      type="text"
                      defaultValue={editingMember.full_name}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit_role">Role</Label>
                    <select
                      id="edit_role"
                      name="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={editingMember.role}
                      required
                    >
                      <option value="team_member">Team Member</option>
                      <option value="campaign_lead">Campaign Lead</option>
                      {user?.role === 'admin' && <option value="admin">Admin</option>}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit_pay_rate">Pay Rate ($/hour)</Label>
                    <Input
                      id="edit_pay_rate"
                      name="pay_rate_per_hour"
                      type="number"
                      step="0.25"
                      min="0"
                      defaultValue={editingMember.pay_rate_per_hour}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_department">Department</Label>
                    <Input
                      id="edit_department"
                      name="department"
                      type="text"
                      defaultValue={editingMember.department}
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Settings Page Component
function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    role: user?.role || ''
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    timesheet_reminders: true,
    approval_notifications: true
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      // Mock API call
      console.log('Updating profile:', profileData)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match!')
      return
    }
    try {
      // Mock API call
      console.log('Changing password')
      alert('Password changed successfully!')
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error) {
      console.error('Error changing password:', error)
    }
  }

  const handleNotificationUpdate = async (setting, value) => {
    try {
      setNotificationSettings(prev => ({ ...prev, [setting]: value }))
      // Mock API call
      console.log('Updating notification settings:', { [setting]: value })
    } catch (error) {
      console.error('Error updating notification settings:', error)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  type="text"
                  value={profileData.role}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">Role cannot be changed. Contact your administrator.</p>
              </div>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit">
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.email_notifications}
                  onChange={(e) => handleNotificationUpdate('email_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Timesheet Reminders</p>
                <p className="text-sm text-gray-600">Get reminded to submit your timesheets</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.timesheet_reminders}
                  onChange={(e) => handleNotificationUpdate('timesheet_reminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Approval Notifications</p>
                <p className="text-sm text-gray-600">Get notified when your timesheets are approved or rejected</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.approval_notifications}
                  onChange={(e) => handleNotificationUpdate('approval_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Analytics Page Component
function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('overview')
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      // Mock analytics data
      const mockData = {
        overview: {
          totalHours: 2840,
          totalUsers: 45,
          avgHoursPerUser: 63.1,
          productivityScore: 87
        },
        timeDistribution: [
          { campaign: 'Campaign A', hours: 1200, percentage: 42 },
          { campaign: 'Campaign B', hours: 800, percentage: 28 },
          { campaign: 'Campaign C', hours: 600, percentage: 21 },
          { campaign: 'Campaign D', hours: 240, percentage: 9 }
        ],
        productivityTrends: [
          { date: '2024-01-01', productivity: 85 },
          { date: '2024-01-08', productivity: 88 },
          { date: '2024-01-15', productivity: 87 },
          { date: '2024-01-22', productivity: 90 },
          { date: '2024-01-29', productivity: 89 }
        ],
        topPerformers: [
          { name: 'Jane Smith', hours: 168, efficiency: 95 },
          { name: 'John Doe', hours: 162, efficiency: 92 },
          { name: 'Mike Johnson', hours: 158, efficiency: 89 }
        ]
      }
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const views = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'productivity', name: 'Productivity', icon: TrendingUp },
    { id: 'team', name: 'Team Performance', icon: Users },
    { id: 'time', name: 'Time Analysis', icon: Clock }
  ]

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights into your team's performance and productivity</p>
        </div>
        <div className="flex space-x-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === view.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <view.icon className="w-4 h-4 mr-2" />
            {view.name}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview.totalHours}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Hours/User</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview.avgHoursPerUser}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Productivity Score</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview.productivityScore}%</p>
                  </div>
                  <Award className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution by Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.timeDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full bg-blue-${(index + 1) * 100}`}></div>
                      <span className="font-medium">{item.campaign}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{item.hours} hours</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other views would be implemented similarly */}
      {activeView !== 'overview' && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{views.find(v => v.id === activeView)?.name} View</h3>
            <p className="text-gray-600">This view is under development. Advanced analytics coming soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Reports Page Component
function ReportsPage() {
  const [reportType, setReportType] = useState('payroll')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filters, setFilters] = useState({ department: '', user: '', status: '' })
  const [generating, setGenerating] = useState(false)

  const reportTypes = [
    { id: 'payroll', name: 'Payroll Report', description: 'Generate payroll summaries with hours and costs' },
    { id: 'productivity', name: 'Productivity Report', description: 'Team efficiency and performance metrics' },
    { id: 'attendance', name: 'Attendance Report', description: 'Time tracking and attendance patterns' },
    { id: 'overtime', name: 'Overtime Report', description: 'Overtime hours and cost analysis' },
    { id: 'billing', name: 'Client Billing', description: 'Billing reports for client invoicing' }
  ]

  const handleGenerateReport = async (format) => {
    setGenerating(true)
    try {
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create mock CSV content
      const csvContent = `Report Type,${reportType}\nDate Range,${dateRange.start} to ${dateRange.end}\nGenerated,${new Date().toISOString()}\n\nEmployee,Hours,Rate,Total\nJohn Doe,40,18.50,740.00\nJane Smith,38,22.00,836.00\nMike Johnson,42,19.25,808.50`
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports for your business needs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Configure your report parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Report Type Selection */}
              <div>
                <Label>Report Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {reportTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setReportType(type.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        reportType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{type.name}</p>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="">All Departments</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="user">User</Label>
                  <select
                    id="user"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.user}
                    onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                  >
                    <option value="">All Users</option>
                    <option value="john">John Doe</option>
                    <option value="jane">Jane Smith</option>
                    <option value="mike">Mike Johnson</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Generate Buttons */}
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleGenerateReport('csv')} 
                  disabled={generating || !dateRange.start || !dateRange.end}
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate CSV
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleGenerateReport('pdf')} 
                  disabled={generating || !dateRange.start || !dateRange.end}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleGenerateReport('xlsx')} 
                  disabled={generating || !dateRange.start || !dateRange.end}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Preview of selected report type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {reportTypes.find(t => t.id === reportType)?.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {reportTypes.find(t => t.id === reportType)?.description}
                  </p>
                  
                  {reportType === 'payroll' && (
                    <div className="text-sm space-y-1">
                      <p>• Employee hours and rates</p>
                      <p>• Overtime calculations</p>
                      <p>• Total payroll costs</p>
                      <p>• Department breakdowns</p>
                    </div>
                  )}
                  
                  {reportType === 'productivity' && (
                    <div className="text-sm space-y-1">
                      <p>• Efficiency metrics</p>
                      <p>• Performance trends</p>
                      <p>• Goal achievements</p>
                      <p>• Team comparisons</p>
                    </div>
                  )}
                  
                  {reportType === 'attendance' && (
                    <div className="text-sm space-y-1">
                      <p>• Daily attendance patterns</p>
                      <p>• Late arrivals and early departures</p>
                      <p>• Absence tracking</p>
                      <p>• Schedule compliance</p>
                    </div>
                  )}
                  
                  {reportType === 'overtime' && (
                    <div className="text-sm space-y-1">
                      <p>• Overtime hours by employee</p>
                      <p>• Overtime cost analysis</p>
                      <p>• Department overtime trends</p>
                      <p>• Compliance monitoring</p>
                    </div>
                  )}
                  
                  {reportType === 'billing' && (
                    <div className="text-sm space-y-1">
                      <p>• Client billing summaries</p>
                      <p>• Project cost breakdowns</p>
                      <p>• Billable vs non-billable hours</p>
                      <p>• Revenue projections</p>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Date Range:</strong> {dateRange.start || 'Not set'} to {dateRange.end || 'Not set'}</p>
                  <p><strong>Filters:</strong> {Object.values(filters).filter(Boolean).length || 'None'} applied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Bulk Import Page Component
function BulkImportPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('team-members')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState(null)
  const [importHistory, setImportHistory] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [previewData, setPreviewData] = useState([])
  const [showPreview, setShowPreview] = useState(false)

  const importTypes = [
    {
      id: 'team-members',
      name: 'Team Members',
      icon: Users,
      description: 'Import team members with roles and pay rates',
      templateFields: ['email', 'full_name', 'role', 'pay_rate_per_hour', 'department', 'hire_date'],
      maxRows: 1000
    },
    {
      id: 'historical-timesheets',
      name: 'Historical Timesheets',
      icon: Clock,
      description: 'Import historical timesheet data',
      templateFields: ['employee_email', 'date', 'hours', 'description', 'status', 'campaign'],
      maxRows: 10000
    }
  ]

  useEffect(() => {
    fetchImportHistory()
  }, [])

  const fetchImportHistory = async () => {
    try {
      const mockHistory = [
        {
          id: 1,
          type: 'team-members',
          filename: 'team_members_2024.xlsx',
          status: 'completed',
          total_rows: 25,
          successful_rows: 23,
          failed_rows: 2,
          created_at: '2024-01-15T10:30:00Z',
          completed_at: '2024-01-15T10:32:15Z'
        },
        {
          id: 2,
          type: 'historical-timesheets',
          filename: 'timesheets_q4_2023.xlsx',
          status: 'failed',
          total_rows: 1500,
          successful_rows: 0,
          failed_rows: 1500,
          created_at: '2024-01-14T14:20:00Z',
          error_message: 'Invalid date format in multiple rows'
        }
      ]
      setImportHistory(mockHistory)
    } catch (error) {
      console.error('Error fetching import history:', error)
    }
  }

  const downloadTemplate = (importType) => {
    const type = importTypes.find(t => t.id === importType)
    if (!type) return

    const headers = type.templateFields.join(',')
    let sampleData = ''
    
    if (importType === 'team-members') {
      sampleData = 'john.doe@company.com,John Doe,team_member,18.50,Sales,2024-01-01\njane.smith@company.com,Jane Smith,campaign_lead,22.00,Marketing,2024-01-01'
    } else if (importType === 'historical-timesheets') {
      sampleData = 'john.doe@company.com,2024-01-01,8.0,Regular work day,approved,Campaign A\njane.smith@company.com,2024-01-01,7.5,Project work,approved,Campaign B'
    }

    const csvContent = `${headers}\n${sampleData}`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${importType}_template.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setValidationErrors([])
      setPreviewData([])
      setShowPreview(false)
      
      const allowedTypes = ['.csv', '.xlsx', '.xls']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      
      if (!allowedTypes.includes(fileExtension)) {
        setValidationErrors(['Invalid file type. Please upload CSV or Excel files only.'])
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors(['File size too large. Maximum size is 10MB.'])
        return
      }

      previewFileContent(file)
    }
  }

  const previewFileContent = async (file) => {
    try {
      const mockPreviewData = activeTab === 'team-members' ? [
        { email: 'john.doe@company.com', full_name: 'John Doe', role: 'team_member', pay_rate_per_hour: '18.50' },
        { email: 'jane.smith@company.com', full_name: 'Jane Smith', role: 'campaign_lead', pay_rate_per_hour: '22.00' },
        { email: 'mike.johnson@company.com', full_name: 'Mike Johnson', role: 'team_member', pay_rate_per_hour: '19.25' }
      ] : [
        { employee_email: 'john.doe@company.com', date: '2024-01-01', hours: '8.0', description: 'Regular work', status: 'approved' },
        { employee_email: 'jane.smith@company.com', date: '2024-01-01', hours: '7.5', description: 'Project work', status: 'approved' },
        { employee_email: 'mike.johnson@company.com', date: '2024-01-01', hours: '8.5', description: 'Overtime work', status: 'pending' }
      ]
      
      setPreviewData(mockPreviewData)
      setShowPreview(true)
    } catch (error) {
      setValidationErrors(['Error reading file. Please check the file format.'])
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResults(null)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      const mockResults = {
        total_rows: previewData.length,
        successful_rows: previewData.length - 1,
        failed_rows: 1,
        errors: [
          {
            row: 2,
            field: 'email',
            message: 'Email already exists in system',
            value: 'jane.smith@company.com'
          }
        ],
        import_id: Date.now()
      }

      setUploadResults(mockResults)
      fetchImportHistory()
    } catch (error) {
      setValidationErrors(['Import failed. Please try again.'])
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
          <p className="text-gray-600">Import team members and historical data in bulk</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchImportHistory()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Import Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {importTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setActiveTab(type.id)
              setSelectedFile(null)
              setValidationErrors([])
              setPreviewData([])
              setShowPreview(false)
              setUploadResults(null)
            }}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === type.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <type.icon className="w-4 h-4 mr-2" />
            {type.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {importTypes.find(t => t.id === activeTab)?.name} Import
              </CardTitle>
              <CardDescription>
                {importTypes.find(t => t.id === activeTab)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Download */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Download Template</p>
                    <p className="text-sm text-blue-700">Get the correct format for your import</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => downloadTemplate(activeTab)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" as="span">
                      Choose File
                    </Button>
                  </Label>
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* File Preview */}
              {showPreview && previewData.length > 0 && (
                <div className="space-y-2">
                  <Label>File Preview (First 3 rows)</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(previewData[0]).map((key) => (
                              <th key={key} className="px-4 py-2 text-left font-medium text-gray-900">
                                {key.replace('_', ' ').toUpperCase()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(0, 3).map((row, index) => (
                            <tr key={index} className="border-t">
                              {Object.values(row).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2 text-gray-600">
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Total rows to import: {previewData.length}
                  </p>
                </div>
              )}

              {/* Import Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Import Progress</Label>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{width: `${uploadProgress}%`}}
                    ></div>
                  </div>
                </div>
              )}

              {/* Import Results */}
              {uploadResults && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Import completed!</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Rows</p>
                          <p className="font-medium">{uploadResults.total_rows}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Successful</p>
                          <p className="font-medium text-green-600">{uploadResults.successful_rows}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Failed</p>
                          <p className="font-medium text-red-600">{uploadResults.failed_rows}</p>
                        </div>
                      </div>
                      {uploadResults.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-red-600">Errors:</p>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {uploadResults.errors.slice(0, 3).map((error, index) => (
                              <li key={index}>
                                Row {error.row}: {error.message} ({error.field}: {error.value})
                              </li>
                            ))}
                          </ul>
                          {uploadResults.errors.length > 3 && (
                            <p className="text-sm text-gray-600">
                              +{uploadResults.errors.length - 3} more errors
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Import Button */}
              <div className="flex space-x-2">
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedFile || validationErrors.length > 0 || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Start Import
                    </>
                  )}
                </Button>
                {selectedFile && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewData([])
                      setShowPreview(false)
                      setValidationErrors([])
                      setUploadResults(null)
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Guidelines */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">File Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CSV or Excel format (.csv, .xlsx, .xls)</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Maximum rows: {importTypes.find(t => t.id === activeTab)?.maxRows.toLocaleString()}</li>
                  <li>• First row must contain headers</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Required Fields:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {importTypes.find(t => t.id === activeTab)?.templateFields.map((field) => (
                    <li key={field}>• {field.replace('_', ' ')}</li>
                  ))}
                </ul>
              </div>

              {activeTab === 'team-members' && (
                <div className="space-y-2">
                  <h4 className="font-medium">Valid Roles:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• team_member</li>
                    <li>• campaign_lead</li>
                    <li>• admin</li>
                  </ul>
                </div>
              )}

              {activeTab === 'historical-timesheets' && (
                <div className="space-y-2">
                  <h4 className="font-medium">Valid Status:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• pending</li>
                    <li>• approved</li>
                    <li>• rejected</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>Recent bulk import operations</CardDescription>
        </CardHeader>
        <CardContent>
          {importHistory.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No imports yet</h3>
              <p className="text-gray-600">Your import history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {importHistory.map((import_record) => (
                <div key={import_record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {import_record.type === 'team-members' ? (
                        <Users className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{import_record.filename}</p>
                      <p className="text-sm text-gray-600">
                        {import_record.type.replace('-', ' ')} • {new Date(import_record.created_at).toLocaleDateString()}
                      </p>
                      {import_record.error_message && (
                        <p className="text-sm text-red-600">{import_record.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-600">
                        {import_record.successful_rows}/{import_record.total_rows} successful
                      </p>
                      {import_record.failed_rows > 0 && (
                        <p className="text-red-600">{import_record.failed_rows} failed</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(import_record.status)}
                      <Badge className={getStatusColor(import_record.status)}>
                        {import_record.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {import_record.status === 'failed' && (
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
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

// Error Management Cockpit Component
function ErrorManagementCockpit() {
  const [errorLogs, setErrorLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedError, setSelectedError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchErrorLogs()
  }, [filterStatus, filterType])

  const fetchErrorLogs = async () => {
    try {
      setLoading(true)
      const mockErrors = [
        {
          id: 1,
          import_id: 123,
          import_type: 'team-members',
          filename: 'team_members_2024.xlsx',
          row_number: 5,
          field_name: 'email',
          field_value: 'invalid-email',
          error_message: 'Invalid email format',
          error_type: 'validation',
          status: 'unresolved',
          created_at: '2024-01-15T10:30:00Z',
          resolved_at: null,
          resolved_by: null
        },
        {
          id: 2,
          import_id: 123,
          import_type: 'team-members',
          filename: 'team_members_2024.xlsx',
          row_number: 8,
          field_name: 'role',
          field_value: 'invalid_role',
          error_message: 'Invalid role. Must be one of: team_member, campaign_lead, admin',
          error_type: 'validation',
          status: 'resolved',
          created_at: '2024-01-15T10:30:00Z',
          resolved_at: '2024-01-15T11:00:00Z',
          resolved_by: 'admin@test.com'
        },
        {
          id: 3,
          import_id: 124,
          import_type: 'historical-timesheets',
          filename: 'timesheets_q4_2023.xlsx',
          row_number: 150,
          field_name: 'employee_email',
          field_value: 'nonexistent@company.com',
          error_message: 'Employee not found in system',
          error_type: 'reference',
          status: 'unresolved',
          created_at: '2024-01-14T14:20:00Z',
          resolved_at: null,
          resolved_by: null
        }
      ]
      
      setErrorLogs(mockErrors.filter(error => {
        if (filterStatus !== 'all' && error.status !== filterStatus) return false
        if (filterType !== 'all' && error.import_type !== filterType) return false
        return true
      }))
    } catch (error) {
      console.error('Error fetching error logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveError = async (errorId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setErrorLogs(prev => prev.map(error => 
        error.id === errorId 
          ? { ...error, status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: 'admin@test.com' }
          : error
      ))
      setSelectedError(null)
    } catch (error) {
      console.error('Error resolving error:', error)
    }
  }

  const bulkResolve = async () => {
    const unresolvedErrors = errorLogs.filter(error => error.status === 'unresolved')
    for (const error of unresolvedErrors) {
      await resolveError(error.id)
    }
  }

  const exportErrorReport = () => {
    const csvContent = [
      'Import ID,Import Type,Filename,Row,Field,Value,Error Message,Status,Created At',
      ...errorLogs.map(error => 
        `${error.import_id},${error.import_type},${error.filename},${error.row_number},${error.field_name},"${error.field_value}","${error.error_message}",${error.status},${error.created_at}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error_report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const getErrorTypeColor = (type) => {
    switch (type) {
      case 'validation':
        return 'bg-yellow-100 text-yellow-800'
      case 'reference':
        return 'bg-red-100 text-red-800'
      case 'system':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'unresolved':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading error logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Management Cockpit</h1>
          <p className="text-gray-600">Monitor and resolve import errors</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportErrorReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={bulkResolve} disabled={!errorLogs.some(e => e.status === 'unresolved')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Resolve All
          </Button>
        </div>
      </div>

      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold text-gray-900">{errorLogs.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-red-900">
                  {errorLogs.filter(e => e.status === 'unresolved').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-900">
                  {errorLogs.filter(e => e.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-blue-900">
                  {errorLogs.length > 0 ? Math.round((errorLogs.filter(e => e.status === 'resolved').length / errorLogs.length) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="team-members">Team Members</option>
            <option value="historical-timesheets">Historical Timesheets</option>
          </select>
        </div>
        <Button variant="outline" onClick={fetchErrorLogs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Error Details</CardTitle>
          <CardDescription>Detailed view of import errors</CardDescription>
        </CardHeader>
        <CardContent>
          {errorLogs.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No errors found</h3>
              <p className="text-gray-600">All imports completed successfully</p>
            </div>
          ) : (
            <div className="space-y-4">
              {errorLogs.map((error) => (
                <div key={error.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {error.filename} - Row {error.row_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        {error.field_name}: "{error.field_value}"
                      </p>
                      <p className="text-sm text-red-600">{error.error_message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(error.created_at).toLocaleString()}
                        {error.resolved_at && (
                          <span> • Resolved by {error.resolved_by} on {new Date(error.resolved_at).toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getErrorTypeColor(error.error_type)}>
                      {error.error_type}
                    </Badge>
                    <Badge className={getStatusColor(error.status)}>
                      {error.status}
                    </Badge>
                    {error.status === 'unresolved' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedError(error)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => resolveError(error.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
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

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Error Details</CardTitle>
              <CardDescription>
                Import ID: {selectedError.import_id} • Row {selectedError.row_number}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Filename</Label>
                  <p className="text-sm text-gray-600">{selectedError.filename}</p>
                </div>
                <div>
                  <Label>Import Type</Label>
                  <p className="text-sm text-gray-600">{selectedError.import_type}</p>
                </div>
                <div>
                  <Label>Field Name</Label>
                  <p className="text-sm text-gray-600">{selectedError.field_name}</p>
                </div>
                <div>
                  <Label>Field Value</Label>
                  <p className="text-sm text-gray-600">"{selectedError.field_value}"</p>
                </div>
              </div>
              <div>
                <Label>Error Message</Label>
                <p className="text-sm text-red-600">{selectedError.error_message}</p>
              </div>
              <div>
                <Label>Suggested Resolution</Label>
                <p className="text-sm text-gray-600">
                  {selectedError.error_type === 'validation' && 'Correct the field value according to the validation rules.'}
                  {selectedError.error_type === 'reference' && 'Ensure the referenced record exists in the system.'}
                  {selectedError.error_type === 'system' && 'Contact system administrator for assistance.'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => resolveError(selectedError.id)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </Button>
                <Button variant="outline" onClick={() => setSelectedError(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
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
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={logout} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timesheets" element={<TimesheetsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/analytics" element={
            user.role === 'admin' ? <AnalyticsPage /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/reports" element={
            user.role === 'admin' ? <ReportsPage /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/bulk-import" element={
            user.role === 'admin' ? <BulkImportPage /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/error-management" element={
            user.role === 'admin' ? <ErrorManagementCockpit /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

