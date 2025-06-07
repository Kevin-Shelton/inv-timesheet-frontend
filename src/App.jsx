import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import api from './lib/api'

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            <Route path="/timesheets" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            <Route path="/bulk-import" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            <Route path="/error-management" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

// Auth Context
const AuthContext = React.createContext()

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
  return React.useContext(AuthContext)
}

// Route Protection Components
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  }
  
  return user ? <Navigate to="/dashboard" /> : children
}

// Login Component
function Login() {
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
    } catch (error) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            TimeSheet Manager
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            BPO Management System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Layout Component
function MainLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getCurrentPage = () => {
    const path = location.pathname
    if (path === '/' || path === '/dashboard') return 'dashboard'
    return path.substring(1)
  }

  const renderCurrentPage = () => {
    const currentPage = getCurrentPage()
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'timesheets':
        return <TimesheetsPage />
      case 'team':
        return <TeamPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'reports':
        return <ReportsPage />
      case 'bulk-import':
        return <BulkImportPage />
      case 'error-management':
        return <ErrorManagementPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  )
}

// Sidebar Component
function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Timesheets', href: '/timesheets', icon: '🕒' },
    { name: 'Team', href: '/team', icon: '👥' },
    ...(user?.role === 'admin' ? [
      { name: 'Analytics', href: '/analytics', icon: '📊' },
      { name: 'Reports', href: '/reports', icon: '📈' },
      { name: 'Bulk Import', href: '/bulk-import', icon: '📁' },
      { name: 'Error Management', href: '/error-management', icon: '⚠️' }
    ] : []),
    { name: 'Settings', href: '/settings', icon: '⚙️' }
  ]

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <span className="text-white text-xl">×</span>
              </button>
            </div>
            <SidebarContent navigation={navigation} user={user} logout={logout} location={location} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} user={user} logout={logout} location={location} />
        </div>
      </div>
    </>
  )
}

function SidebarContent({ navigation, user, logout, location }) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-600">
        <h1 className="text-xl font-bold text-white">TimeSheet Manager</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors duration-150`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User info */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="ml-auto text-gray-400 hover:text-gray-600"
            title="Sign out"
          >
            <span className="text-lg">🚪</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Dashboard Component
function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalHours: 0,
    activeTimesheets: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'admin') {
        const dashboardData = await api.getDashboardStats()
        setStats(dashboardData.stats)
        setRecentActivity(dashboardData.recentActivity)
      } else {
        // Personal stats for regular users
        const timesheets = await api.getTimesheets()
        const thisWeekHours = timesheets
          .filter(t => new Date(t.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((sum, t) => sum + parseFloat(t.hours || 0), 0)
        
        setStats({
          hoursThisWeek: thisWeekHours,
          pendingApprovals: timesheets.filter(t => t.status === 'pending').length,
          monthlyTotal: timesheets
            .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
            .reduce((sum, t) => sum + parseFloat(t.hours || 0), 0),
          overtimeHours: Math.max(0, thisWeekHours - 40)
        })
        setRecentActivity(timesheets.slice(0, 5))
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          {user?.role === 'admin' ? 'Organization Overview' : 'Your timesheet summary'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {user?.role === 'admin' ? (
          <>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon="⏳"
              color="yellow"
            />
            <StatCard
              title="Total Hours (Month)"
              value={stats.totalHours}
              icon="🕒"
              color="green"
            />
            <StatCard
              title="Active Timesheets"
              value={stats.activeTimesheets}
              icon="📊"
              color="purple"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Hours This Week"
              value={stats.hoursThisWeek}
              icon="🕒"
              color="blue"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon="⏳"
              color="yellow"
            />
            <StatCard
              title="Monthly Total"
              value={stats.monthlyTotal}
              icon="📊"
              color="green"
            />
            <StatCard
              title="Overtime Hours"
              value={stats.overtimeHours}
              icon="⚡"
              color="red"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {user?.role === 'admin' ? 'Recent Team Activity' : 'Recent Timesheets'}
          </h3>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🕒</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.role === 'admin' ? item.user_name : 'You'} - {item.hours} hours
                      </p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'approved' ? 'bg-green-100 text-green-800' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions for Admin */}
      {user?.role === 'admin' && (
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/timesheets"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-2xl mr-3">📋</span>
                <div>
                  <p className="font-medium text-blue-900">Review Timesheets</p>
                  <p className="text-sm text-blue-600">Approve pending entries</p>
                </div>
              </Link>
              <Link
                to="/team"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <p className="font-medium text-green-900">Manage Team</p>
                  <p className="text-sm text-green-600">Add or edit team members</p>
                </div>
              </Link>
              <Link
                to="/reports"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <p className="font-medium text-purple-900">Export Reports</p>
                  <p className="text-sm text-purple-600">Generate payroll reports</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Timesheets Page Component
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Timesheets</h1>
          <p className="text-gray-600">Track and manage your time entries</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Entry
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add Timesheet Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Time Entry</h3>
          <form onSubmit={handleSubmitTimesheet} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newTimesheet.date}
                  onChange={(e) => setNewTimesheet({...newTimesheet, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder="8.0"
                  value={newTimesheet.hours}
                  onChange={(e) => setNewTimesheet({...newTimesheet, hours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Brief description of work performed"
                value={newTimesheet.description}
                onChange={(e) => setNewTimesheet({...newTimesheet, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Entry
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timesheets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">My Time Entries</h3>
        </div>
        <div className="p-6">
          {timesheets.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">🕒</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets yet</h3>
              <p className="text-gray-600">Start by adding your first time entry</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">🕒</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{timesheet.date}</p>
                      <p className="text-sm text-gray-600">{timesheet.hours} hours</p>
                      {timesheet.description && (
                        <p className="text-sm text-gray-500">{timesheet.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    timesheet.status === 'approved' ? 'bg-green-100 text-green-800' :
                    timesheet.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {timesheet.status}
                  </span>
                </div>
              ))}
            </div>
          )}
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

  const filteredTimesheets = allTimesheets.filter(timesheet =>
    timesheet.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timesheet.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheet Approvals</h1>
          <p className="text-gray-600">Review and approve team timesheet entries</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          📊 Export
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by user or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Timesheets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Team Timesheets</h3>
        </div>
        <div className="p-6">
          {filteredTimesheets.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">🕒</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets found</h3>
              <p className="text-gray-600">No timesheets match your current filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">🕒</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{timesheet.user_name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600">{timesheet.date} • {timesheet.hours} hours</p>
                      {timesheet.description && (
                        <p className="text-sm text-gray-500">{timesheet.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      timesheet.status === 'approved' ? 'bg-green-100 text-green-800' :
                      timesheet.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {timesheet.status}
                    </span>
                    {timesheet.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTimesheet(timesheet)
                            setApprovalComment('')
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTimesheet(timesheet)
                            setApprovalComment('')
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {selectedTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Timesheet</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Employee: {selectedTimesheet.user_name}</p>
                <p className="text-sm text-gray-600">Date: {selectedTimesheet.date}</p>
                <p className="text-sm text-gray-600">Hours: {selectedTimesheet.hours}</p>
                {selectedTimesheet.description && (
                  <p className="text-sm text-gray-600">Description: {selectedTimesheet.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments (optional)</label>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApproval(selectedTimesheet.id, 'approve')}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleApproval(selectedTimesheet.id, 'reject')}
                  className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => setSelectedTimesheet(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Team Page Component
function TeamPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    role: 'team_member',
    pay_rate: '',
    department: ''
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

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await api.createUser(newMember)
      setNewMember({
        email: '',
        name: '',
        role: 'team_member',
        pay_rate: '',
        department: ''
      })
      setShowAddForm(false)
      fetchTeamMembers()
    } catch (error) {
      setError('Failed to add team member')
      console.error('Error adding team member:', error)
    }
  }

  const handleUpdateMember = async (e) => {
    e.preventDefault()
    try {
      await api.updateUser(editingUser.id, editingUser)
      setEditingUser(null)
      fetchTeamMembers()
    } catch (error) {
      setError('Failed to update team member')
      console.error('Error updating team member:', error)
    }
  }

  const handleDeleteMember = async (userId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await api.deleteUser(userId)
        fetchTeamMembers()
      } catch (error) {
        setError('Failed to delete team member')
        console.error('Error deleting team member:', error)
      }
    }
  }

  const canManageTeam = user?.role === 'admin' || user?.role === 'campaign_lead'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members and their roles</p>
        </div>
        {canManageTeam && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            👤 Add Member
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!canManageTeam && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          You don't have permission to manage team members. Contact your administrator.
        </div>
      )}

      {/* Add Member Form */}
      {showAddForm && canManageTeam && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="team_member">Team Member</option>
                  <option value="campaign_lead">Campaign Lead</option>
                  {user?.role === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={newMember.pay_rate}
                  onChange={(e) => setNewMember({...newMember, pay_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={newMember.department}
                onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Member
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Member Form */}
      {editingUser && canManageTeam && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Team Member</h3>
          <form onSubmit={handleUpdateMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="team_member">Team Member</option>
                  <option value="campaign_lead">Campaign Lead</option>
                  {user?.role === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingUser.pay_rate}
                  onChange={(e) => setEditingUser({...editingUser, pay_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={editingUser.department || ''}
                onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Member
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
        </div>
        <div className="p-6">
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">👥</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
              <p className="text-gray-600">Start by adding your first team member</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">👤</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'admin' ? 'bg-red-100 text-red-800' :
                          member.role === 'campaign_lead' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role.replace('_', ' ')}
                        </span>
                        {member.pay_rate && (
                          <span className="text-xs text-gray-500">${member.pay_rate}/hr</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {canManageTeam && member.id !== user?.id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingUser(member)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Analytics Page Component
function AnalyticsPage() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('last_30_days')
  const [activeView, setActiveView] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const data = await api.getAnalytics(dateRange)
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          You don't have permission to view analytics. Contact your administrator.
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="last_90_days">Last 90 days</option>
            <option value="last_year">Last year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            📊 Export
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['overview', 'productivity', 'team_performance', 'time_analysis'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === view
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {view.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Hours Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Total Hours</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <span className="text-4xl mb-2 block">📊</span>
              <p className="text-gray-600">Chart visualization would go here</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {analyticsData?.totalHours || 2840} hours
              </p>
            </div>
          </div>
        </div>

        {/* Active Users Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Users</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <span className="text-4xl mb-2 block">👥</span>
              <p className="text-gray-600">User activity chart would go here</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {analyticsData?.activeUsers || 45} users
              </p>
            </div>
          </div>
        </div>

        {/* Average Hours per User */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Avg Hours/User</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <span className="text-4xl mb-2 block">⏱️</span>
              <p className="text-gray-600">Average hours chart would go here</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {analyticsData?.avgHoursPerUser || 63.1} hrs
              </p>
            </div>
          </div>
        </div>

        {/* Productivity Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Productivity Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <span className="text-4xl mb-2 block">📈</span>
              <p className="text-gray-600">Productivity trend chart would go here</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                +{analyticsData?.productivityIncrease || 12}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Projects</p>
            <p className="text-2xl font-bold text-blue-900">{analyticsData?.totalProjects || 24}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Completed Tasks</p>
            <p className="text-2xl font-bold text-green-900">{analyticsData?.completedTasks || 156}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-yellow-900">{analyticsData?.pendingApprovals || 8}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Team Efficiency</p>
            <p className="text-2xl font-bold text-purple-900">{analyticsData?.teamEfficiency || 94}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reports Page Component
function ReportsPage() {
  const { user } = useAuth()
  const [reportType, setReportType] = useState('payroll')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      const reportData = await api.generateReport({
        type: reportType,
        dateRange,
        users: selectedUsers
      })
      
      // Create and download the report
      const blob = new Blob([reportData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}_report_${dateRange.start}_to_${dateRange.end}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          You don't have permission to generate reports. Contact your administrator.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports for payroll, productivity, and more</p>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="payroll">Payroll Report</option>
              <option value="productivity">Productivity Report</option>
              <option value="attendance">Attendance Report</option>
              <option value="overtime">Overtime Report</option>
              <option value="client_billing">Client Billing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : '📊 Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">💰</span>
            <h3 className="text-lg font-medium text-gray-900">Payroll Reports</h3>
          </div>
          <p className="text-gray-600 mb-4">Generate comprehensive payroll summaries with hours, rates, and total costs.</p>
          <button
            onClick={() => {
              setReportType('payroll')
              handleGenerateReport()
            }}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Generate Payroll Report
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📈</span>
            <h3 className="text-lg font-medium text-gray-900">Productivity Reports</h3>
          </div>
          <p className="text-gray-600 mb-4">Analyze team productivity metrics and performance trends over time.</p>
          <button
            onClick={() => {
              setReportType('productivity')
              handleGenerateReport()
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Productivity Report
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📅</span>
            <h3 className="text-lg font-medium text-gray-900">Attendance Reports</h3>
          </div>
          <p className="text-gray-600 mb-4">Track attendance patterns and identify trends in team availability.</p>
          <button
            onClick={() => {
              setReportType('attendance')
              handleGenerateReport()
            }}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Generate Attendance Report
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">⏰</span>
            <h3 className="text-lg font-medium text-gray-900">Overtime Reports</h3>
          </div>
          <p className="text-gray-600 mb-4">Monitor overtime hours and associated costs for budget management.</p>
          <button
            onClick={() => {
              setReportType('overtime')
              handleGenerateReport()
            }}
            className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Generate Overtime Report
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">💼</span>
            <h3 className="text-lg font-medium text-gray-900">Client Billing</h3>
          </div>
          <p className="text-gray-600 mb-4">Create detailed billing reports for client invoicing and project costs.</p>
          <button
            onClick={() => {
              setReportType('client_billing')
              handleGenerateReport()
            }}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Generate Billing Report
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🔧</span>
            <h3 className="text-lg font-medium text-gray-900">Custom Reports</h3>
          </div>
          <p className="text-gray-600 mb-4">Create custom reports with specific filters and date ranges.</p>
          <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            Create Custom Report
          </button>
        </div>
      </div>
    </div>
  )
}

// Bulk Import Page Component
function BulkImportPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('team_members')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResults, setImportResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (file, type) => {
    setLoading(true)
    setUploadProgress(0)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const result = await api.bulkImport(formData, (progress) => {
        setUploadProgress(progress)
      })
      
      setImportResults(result)
    } catch (error) {
      console.error('Import error:', error)
      setImportResults({
        success: false,
        error: error.message,
        processed: 0,
        errors: []
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = (type) => {
    const templates = {
      team_members: 'email,name,role,pay_rate,department,hire_date\nadmin@example.com,John Doe,admin,25.00,IT,2024-01-01\nuser@example.com,Jane Smith,team_member,20.00,Operations,2024-01-15',
      historical_timesheets: 'employee_email,date,hours,description,status,campaign\nadmin@example.com,2024-01-01,8.0,Project work,approved,Campaign A\nuser@example.com,2024-01-01,7.5,Client support,approved,Campaign B'
    }
    
    const content = templates[type]
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}_template.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          You don't have permission to perform bulk imports. Contact your administrator.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
          <p className="text-gray-600">Import team members and historical data in bulk</p>
        </div>
      </div>

      {/* Import Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('team_members')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'team_members'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 Team Members
        </button>
        <button
          onClick={() => setActiveTab('historical_timesheets')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'historical_timesheets'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🕒 Historical Timesheets
        </button>
      </div>

      {/* Import Interface */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {activeTab === 'team_members' ? 'Import Team Members' : 'Import Historical Timesheets'}
          </h3>
          <button
            onClick={() => downloadTemplate(activeTab)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            📋 Download Template
          </button>
        </div>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <span className="text-4xl mb-4 block">📁</span>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h4>
          <p className="text-gray-600 mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                handleFileUpload(file, activeTab)
              }
            }}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Choose File
          </label>
        </div>

        {/* Upload Progress */}
        {loading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <div className="mt-6 p-4 border rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Import Results</h4>
            {importResults.success ? (
              <div className="text-green-600">
                ✅ Successfully imported {importResults.processed} records
              </div>
            ) : (
              <div className="text-red-600">
                ❌ Import failed: {importResults.error}
              </div>
            )}
            {importResults.errors && importResults.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Errors encountered:</p>
                <ul className="text-sm text-red-600 mt-1">
                  {importResults.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {importResults.errors.length > 5 && (
                    <li>• ... and {importResults.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Template Information</h3>
        {activeTab === 'team_members' ? (
          <div>
            <p className="text-gray-600 mb-2">Team Members CSV should include the following columns:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>email</strong> - Employee email address (required, unique)</li>
              <li>• <strong>name</strong> - Full name (required)</li>
              <li>• <strong>role</strong> - admin, campaign_lead, or team_member (required)</li>
              <li>• <strong>pay_rate</strong> - Hourly pay rate (optional)</li>
              <li>• <strong>department</strong> - Department name (optional)</li>
              <li>• <strong>hire_date</strong> - Hire date in YYYY-MM-DD format (optional)</li>
            </ul>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Historical Timesheets CSV should include the following columns:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>employee_email</strong> - Employee email address (required)</li>
              <li>• <strong>date</strong> - Date in YYYY-MM-DD format (required)</li>
              <li>• <strong>hours</strong> - Number of hours worked (required)</li>
              <li>• <strong>description</strong> - Work description (optional)</li>
              <li>• <strong>status</strong> - pending, approved, or rejected (optional, defaults to approved)</li>
              <li>• <strong>campaign</strong> - Campaign or project name (optional)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// Error Management Page Component
function ErrorManagementPage() {
  const { user } = useAuth()
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('unresolved')

  useEffect(() => {
    fetchErrors()
  }, [filter])

  const fetchErrors = async () => {
    try {
      setLoading(true)
      const data = await api.getImportErrors({ status: filter })
      setErrors(data)
    } catch (error) {
      console.error('Error fetching import errors:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveError = async (errorId) => {
    try {
      await api.resolveImportError(errorId)
      fetchErrors()
    } catch (error) {
      console.error('Error resolving import error:', error)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          You don't have permission to manage import errors. Contact your administrator.
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Management</h1>
          <p className="text-gray-600">Monitor and resolve import errors</p>
        </div>
      </div>

      {/* Error Filters */}
      <div className="flex space-x-2">
        {['unresolved', 'resolved', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Errors List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Import Errors</h3>
        </div>
        <div className="p-6">
          {errors.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">✅</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No errors found</h3>
              <p className="text-gray-600">All imports completed successfully</p>
            </div>
          ) : (
            <div className="space-y-4">
              {errors.map((error) => (
                <div key={error.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600">⚠️</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{error.type} Import Error</p>
                      <p className="text-sm text-gray-600">{error.message}</p>
                      <p className="text-xs text-gray-500">
                        {error.created_at} • Row {error.row_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      error.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {error.status}
                    </span>
                    {error.status === 'unresolved' && (
                      <button
                        onClick={() => resolveError(error.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Settings Page Component
function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    reminders: true,
    reports: false
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.updateProfile(profile)
      setMessage('Profile updated successfully')
    } catch (error) {
      setMessage('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      setMessage('New passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.changePassword(passwords.current, passwords.new)
      setPasswords({ current: '', new: '', confirm: '' })
      setMessage('Password changed successfully')
    } catch (error) {
      setMessage('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotifications = async () => {
    setLoading(true)
    try {
      await api.updateNotificationSettings(notifications)
      setMessage('Notification settings updated')
    } catch (error) {
      setMessage('Failed to update notification settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {/* Settings Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['profile', 'security', 'notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'profile' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email notifications for important updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Timesheet Reminders</p>
                  <p className="text-sm text-gray-600">Get reminded to submit your timesheets</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.reminders}
                  onChange={(e) => setNotifications({...notifications, reminders: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Weekly Reports</p>
                  <p className="text-sm text-gray-600">Receive weekly productivity reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.reports}
                  onChange={(e) => setNotifications({...notifications, reports: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <button
                onClick={handleUpdateNotifications}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Preferences'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

