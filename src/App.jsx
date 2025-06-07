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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            TimeSheet Manager
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            BPO Management System
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
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
        {/* Mobile header */}
        <div className="md:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold text-gray-900">TimeSheet Manager</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

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
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <span className="text-blue-600 font-bold text-lg">T</span>
          </div>
          <h1 className="text-xl font-bold text-white">TimeSheet Manager</h1>
        </div>
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
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-all duration-150 rounded-r-md`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User info */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.full_name || user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Member'}</p>
          </div>
          <button
            onClick={logout}
            className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            title="Sign out"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name || user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin' ? 'Organization Overview' : 'Your timesheet summary'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {user?.role === 'admin' ? 'Recent Team Activity' : 'Recent Timesheets'}
          </h3>
        </div>
        <div className="p-4 md:p-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🕒</div>
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🕒</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.role === 'admin' ? item.user_name : 'You'} - {item.hours} hours
                      </p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/timesheets"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">📋</span>
                <div>
                  <p className="font-medium text-blue-900">Review Timesheets</p>
                  <p className="text-sm text-blue-600">Approve pending entries</p>
                </div>
              </Link>
              <Link
                to="/team"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">👥</span>
                <div>
                  <p className="font-medium text-green-900">Manage Team</p>
                  <p className="text-sm text-green-600">Add or edit team members</p>
                </div>
              </Link>
              <Link
                to="/reports"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
              >
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">📊</span>
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
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <span className="text-xl md:text-2xl">{icon}</span>
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timesheets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Timesheets</h1>
          <p className="text-gray-600 mt-1">Track and manage your time entries</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">+</span>
          Add Entry
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Add Timesheet Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Time Entry</h3>
          <form onSubmit={handleSubmitTimesheet} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newTimesheet.date}
                  onChange={(e) => setNewTimesheet({...newTimesheet, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">My Time Entries</h3>
        </div>
        <div className="p-4 md:p-6">
          {timesheets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🕒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets yet</h3>
              <p className="text-gray-600">Start by adding your first time entry</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600">🕒</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{timesheet.date}</p>
                      <p className="text-sm text-gray-600">{timesheet.hours} hours</p>
                      {timesheet.description && (
                        <p className="text-sm text-gray-500 truncate">{timesheet.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={`mt-2 sm:mt-0 px-2 py-1 text-xs rounded-full font-medium ${
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timesheets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Timesheet Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve team timesheet entries</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
          <span className="mr-2">📊</span>
          Export
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Timesheets List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Team Timesheets</h3>
        </div>
        <div className="p-4 md:p-6">
          {filteredTimesheets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🕒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets found</h3>
              <p className="text-gray-600">No timesheets match your current filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4 mb-3 lg:mb-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600">🕒</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{timesheet.user_name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600">{timesheet.date} • {timesheet.hours} hours</p>
                      {timesheet.description && (
                        <p className="text-sm text-gray-500 truncate">{timesheet.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Timesheet</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600"><span className="font-medium">Employee:</span> {selectedTimesheet.user_name}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {selectedTimesheet.date}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Hours:</span> {selectedTimesheet.hours}</p>
                {selectedTimesheet.description && (
                  <p className="text-sm text-gray-600"><span className="font-medium">Description:</span> {selectedTimesheet.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments (optional)</label>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
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
        full_name: '',
        role: 'team_member',
        pay_rate_per_hour: '',
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
        </div>
        {canManageTeam && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <span className="mr-2">👤</span>
            Add Member
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!canManageTeam && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          You don't have permission to manage team members. Contact your administrator.
        </div>
      )}

      {/* Add Member Form */}
      {showAddForm && canManageTeam && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="team_member">Team Member</option>
                  <option value="campaign_lead">Campaign Lead</option>
                  {user?.role === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate (per hour)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newMember.pay_rate_per_hour}
                  onChange={(e) => setNewMember({...newMember, pay_rate_per_hour: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={newMember.department}
                onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
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

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
        </div>
        <div className="p-4 md:p-6">
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
              <p className="text-gray-600">Start by adding your first team member</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {member.full_name?.charAt(0) || member.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {member.full_name || member.email}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Role:</span> {member.role?.replace('_', ' ') || 'N/A'}
                    </p>
                    {member.pay_rate_per_hour && (
                      <p className="text-gray-600">
                        <span className="font-medium">Rate:</span> ${member.pay_rate_per_hour}/hr
                      </p>
                    )}
                    <p className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  {canManageTeam && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => setEditingUser(member)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Member Modal */}
      {editingUser && canManageTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Team Member</h3>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="team_member">Team Member</option>
                  <option value="campaign_lead">Campaign Lead</option>
                  {user?.role === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate (per hour)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingUser.pay_rate_per_hour}
                  onChange={(e) => setEditingUser({...editingUser, pay_rate_per_hour: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
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
        </div>
      )}
    </div>
  )
}

// Placeholder components for other pages
function AnalyticsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">Coming soon - Advanced analytics and insights</p>
      </div>
    </div>
  )
}

function ReportsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📈</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports</h2>
        <p className="text-gray-600">Coming soon - Comprehensive reporting tools</p>
      </div>
    </div>
  )
}

function BulkImportPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📁</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Import</h2>
        <p className="text-gray-600">Coming soon - Import timesheet data in bulk</p>
      </div>
    </div>
  )
}

function ErrorManagementPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Management</h2>
        <p className="text-gray-600">Coming soon - System error tracking and resolution</p>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Coming soon - Application settings and preferences</p>
      </div>
    </div>
  )
}

export default App

