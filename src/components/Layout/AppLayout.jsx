import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings,
  MapPin,
  Calendar,
  Activity,
  Building,
  Zap,
  LogOut,
  User,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'

// Fixed AppLayout component with proper export
export function AppLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return null // This will be handled by ProtectedRoute
  }

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/timesheets', icon: Clock, label: 'Timesheets' },
    { path: '/live-locations', icon: MapPin, label: 'Live Locations' },
    { path: '/time-off', icon: Calendar, label: 'Time Off' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/my-team', icon: Users, label: 'My Team' },
    { path: '/time-tracking', icon: Activity, label: 'Time Tracking' },
    { path: '/work-schedules', icon: Clock, label: 'Work Schedules' },
    { path: '/time-off-holidays', icon: Calendar, label: 'Time Off & Holidays' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
    { path: '/activities-projects', icon: FolderOpen, label: 'Activities & Projects' },
    { path: '/organization', icon: Building, label: 'Organization' },
    { path: '/integrations', icon: Zap, label: 'Integrations' }
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="jibble-layout">
      {/* Sidebar */}
      <div className={`jibble-sidebar ${sidebarOpen ? 'jibble-sidebar-open' : ''}`}>
        {/* Jibble Logo */}
        <div className="jibble-logo">
          <div className="jibble-logo-icon">
            <Clock size={24} />
          </div>
          <span className="jibble-logo-text">Jibble</span>
          {/* Mobile close button */}
          <button 
            className="jibble-mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="jibble-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.path}
                href={item.path}
                className="jibble-nav-item"
                onClick={(e) => {
                  e.preventDefault()
                  // Handle navigation here
                  if (window.innerWidth < 768) setSidebarOpen(false)
                }}
              >
                <Icon size={16} className="jibble-nav-icon" />
                <span className="jibble-nav-label">{item.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="jibble-sidebar-bottom">
          <div className="jibble-trial-info">
            <div className="jibble-trial-icon">⚠️</div>
            <div className="jibble-trial-text">
              <div className="jibble-trial-days">14 days left in trial</div>
            </div>
          </div>
          
          <div className="jibble-user-info">
            <div className="jibble-user-avatar">
              <User size={16} />
            </div>
            <div className="jibble-user-details">
              <div className="jibble-user-name">{user?.full_name || user?.email || 'User'}</div>
              <div className="jibble-user-company">Eps</div>
            </div>
            <button 
              onClick={handleLogout}
              className="jibble-logout-btn"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="jibble-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="jibble-main">
        {/* Header */}
        <header className="jibble-header">
          <div className="jibble-header-content">
            {/* Left - Mobile menu + Title */}
            <div className="jibble-header-left">
              <button 
                className="jibble-mobile-menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <h1 className="jibble-page-title">Dashboard</h1>
            </div>

            {/* Center - Tabs */}
            <div className="jibble-header-center">
              <div className="jibble-tabs">
                <button className="jibble-tab jibble-tab-active">Day</button>
                <button className="jibble-tab">Week</button>
                <button className="jibble-tab">Month</button>
              </div>
            </div>

            {/* Right - Controls */}
            <div className="jibble-header-right">
              <div className="jibble-filters">
                <select className="jibble-filter">
                  <option>All locations</option>
                </select>
                <select className="jibble-filter">
                  <option>All groups</option>
                </select>
                <select className="jibble-filter">
                  <option>All schedules</option>
                </select>
              </div>

              <div className="jibble-header-actions">
                <button className="jibble-action-btn jibble-onboarding-btn">
                  <span className="jibble-onboarding-text">Onboarding</span>
                  <div className="jibble-progress-bar">
                    <div className="jibble-progress-fill" style={{width: '60%'}}></div>
                  </div>
                  <span className="jibble-progress-text">1 of 7</span>
                </button>

                <button className="jibble-notification-btn">
                  <Bell size={18} />
                </button>

                <button className="jibble-profile-btn">
                  <User size={18} />
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="jibble-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Also provide a default export for compatibility
export default AppLayout

