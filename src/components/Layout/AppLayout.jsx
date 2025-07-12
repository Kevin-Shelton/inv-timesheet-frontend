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

// Fixed AppLayout component that doesn't constrain dashboard layout
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

  // Inline styles to avoid CSS conflicts
  const layoutStyle = {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
  }

  const sidebarStyle = {
    width: '240px',
    minWidth: '240px',
    height: '100vh',
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 30,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  }

  const mainContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    minWidth: 0 // Important: allows flex item to shrink
  }

  const headerStyle = {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    zIndex: 20,
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexShrink: 0 // Prevent header from shrinking
  }

  // CRITICAL: Content area with NO constraints
  const contentStyle = {
    flex: 1,
    overflow: 'hidden', // Prevent scrollbars on container
    background: 'transparent', // Let dashboard control background
    padding: 0, // NO padding - let dashboard control spacing
    margin: 0,  // NO margin
    width: '100%',
    height: '100%',
    position: 'relative'
  }

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
    gap: '8px'
  }

  const logoIconStyle = {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  }

  const logoTextStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f97316',
    flex: 1
  }

  const navStyle = {
    flex: 1,
    padding: '16px 0',
    overflowY: 'auto'
  }

  const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 20px',
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.15s ease',
    cursor: 'pointer'
  }

  const sidebarBottomStyle = {
    padding: '16px 20px',
    borderTop: '1px solid #f3f4f6',
    marginTop: 'auto'
  }

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0'
  }

  const userAvatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280'
  }

  const userDetailsStyle = {
    flex: 1,
    minWidth: 0
  }

  const userNameStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  const userCompanyStyle = {
    fontSize: '11px',
    color: '#6b7280'
  }

  const logoutBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'color 0.15s ease'
  }

  const headerLeftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  }

  const pageTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  }

  const headerCenterStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  const tabStyle = {
    padding: '6px 12px',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }

  const activeTabStyle = {
    ...tabStyle,
    background: '#f97316',
    color: 'white'
  }

  const headerRightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }

  const filterStyle = {
    padding: '6px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#374151',
    background: 'white',
    cursor: 'pointer'
  }

  const actionBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    background: 'none',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }

  return (
    <div style={layoutStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        {/* Jibble Logo */}
        <div style={logoStyle}>
          <div style={logoIconStyle}>
            <Clock size={24} />
          </div>
          <span style={logoTextStyle}>Jibble</span>
        </div>

        {/* Navigation */}
        <nav style={navStyle}>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.path}
                href={item.path}
                style={navItemStyle}
                onClick={(e) => {
                  e.preventDefault()
                  // Handle navigation here
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb'
                  e.target.style.color = '#374151'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#6b7280'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div style={sidebarBottomStyle}>
          <div style={{
            background: '#fef3c7',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ fontSize: '16px' }}>⚠️</div>
            <div style={{ fontSize: '12px', color: '#92400e' }}>
              14 days left in trial
            </div>
          </div>
          
          <div style={userInfoStyle}>
            <div style={userAvatarStyle}>
              <User size={16} />
            </div>
            <div style={userDetailsStyle}>
              <div style={userNameStyle}>{user?.full_name || user?.email || 'User'}</div>
              <div style={userCompanyStyle}>Eps</div>
            </div>
            <button 
              onClick={handleLogout}
              style={logoutBtnStyle}
              title="Logout"
              onMouseEnter={(e) => e.target.style.color = '#374151'}
              onMouseLeave={(e) => e.target.style.color = '#6b7280'}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Header */}
        <header style={headerStyle}>
          {/* Left - Title */}
          <div style={headerLeftStyle}>
            <h1 style={pageTitleStyle}>Dashboard</h1>
          </div>

          {/* Center - Tabs */}
          <div style={headerCenterStyle}>
            <button style={activeTabStyle}>Day</button>
            <button style={tabStyle}>Week</button>
            <button style={tabStyle}>Month</button>
          </div>

          {/* Right - Controls */}
          <div style={headerRightStyle}>
            <select style={filterStyle}>
              <option>All locations</option>
            </select>
            <select style={filterStyle}>
              <option>All groups</option>
            </select>
            <select style={filterStyle}>
              <option>All schedules</option>
            </select>

            <button style={{
              ...actionBtnStyle,
              background: '#374151',
              color: 'white',
              fontSize: '12px',
              gap: '8px'
            }}>
              <span>Onboarding</span>
              <div style={{
                width: '40px',
                height: '3px',
                background: '#6b7280',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#f97316',
                  width: '60%'
                }}></div>
              </div>
              <span style={{ fontSize: '10px' }}>1 of 7</span>
            </button>

            <button style={actionBtnStyle}>
              <Bell size={18} />
            </button>

            <button style={actionBtnStyle}>
              <User size={18} />
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        
        {/* CRITICAL: Content area with NO constraints */}
        <main style={contentStyle}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Also provide a default export for compatibility
export default AppLayout

