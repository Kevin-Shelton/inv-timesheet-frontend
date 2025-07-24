import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
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

// Larger, more prominent Invictus Logo
const InvictusLogo = () => (
  <svg 
    width="180" 
    height="48" 
    viewBox="0 0 400 100" 
    style={{ maxWidth: '100%', height: 'auto' }}
  >
    <defs>
      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8BC34A" />
        <stop offset="100%" stopColor="#4CAF50" />
      </linearGradient>
    </defs>
    
    {/* Logo symbol - larger and more prominent */}
    <g transform="translate(15, 25)">
      {/* Main connecting curves */}
      <path 
        d="M 8 30 Q 30 8 52 30" 
        stroke="#6B7280" 
        strokeWidth="4" 
        fill="none"
      />
      <path 
        d="M 18 42 Q 40 20 62 42" 
        stroke="#6B7280" 
        strokeWidth="4" 
        fill="none"
      />
      
      {/* Central connection point */}
      <circle cx="40" cy="30" r="6" fill="url(#greenGradient)" />
      
      {/* End points */}
      <circle cx="8" cy="30" r="4" fill="#6B7280" />
      <circle cx="72" cy="30" r="4" fill="#6B7280" />
      <circle cx="18" cy="42" r="4" fill="#6B7280" />
      <circle cx="62" cy="42" r="4" fill="#6B7280" />
    </g>
    
    {/* Company name - larger and more prominent */}
    <text 
      x="100" 
      y="45" 
      fontFamily="Inter, system-ui, sans-serif" 
      fontSize="28" 
      fontWeight="700" 
      fill="#111827"
    >
      invictus
    </text>
    
    {/* Tagline - smaller but visible */}
    <text 
      x="100" 
      y="65" 
      fontFamily="Inter, system-ui, sans-serif" 
      fontSize="12" 
      fontWeight="400" 
      fill="#6B7280"
    >
      Time Management Portal
    </text>
  </svg>
)

// FIXED: Changed from default export to named export
export const AppLayout = () => {
  const { user, signOut } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Updated navigation items with "People" instead of "My Team"
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/timesheets', icon: Clock, label: 'Timesheets' },
    { path: '/live-locations', icon: MapPin, label: 'Live Locations' },
    { path: '/time-off', icon: Calendar, label: 'Time Off' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/people', icon: Users, label: 'People' }, // Changed from 'My Team' to 'People'
    { path: '/time-tracking', icon: Activity, label: 'Time Tracking' },
    { path: '/work-schedules', icon: Clock, label: 'Work Schedules' },
    { path: '/time-off-holidays', icon: Calendar, label: 'Time Off & Holidays' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
    { path: '/activities-projects', icon: FolderOpen, label: 'Activities & Projects' },
    { path: '/campaigns', icon: Building, label: 'Campaign' },
    { path: '/integrations', icon: Zap, label: 'Integrations' }
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <InvictusLogo />
          <button 
            className="mobile-close"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'nav-item-active' : ''}`
                }
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={16} />
            </div>
            <div className="user-details">
              <div className="user-name">{user?.email || 'User'}</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
          <button className="sign-out-btn" onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button 
              className="mobile-menu-btn"
              onClick={toggleSidebar}
            >
              <Menu size={20} />
            </button>
            <div className="search-bar">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="search-input"
              />
            </div>
          </div>
          <div className="top-bar-right">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-menu">
              <button className="user-menu-btn">
                <div className="user-avatar">
                  <User size={16} />
                </div>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <style jsx>{`
        .app-layout {
          display: flex;
          height: 100vh;
          background-color: #F9FAFB;
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 998;
          display: none;
        }

        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #E5E7EB;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 999;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .sidebar-open {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mobile-close {
          display: none;
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .mobile-close:hover {
          background-color: #F3F4F6;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 0;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          color: #6B7280;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          border-right: 3px solid transparent;
        }

        .nav-item:hover {
          background-color: #F9FAFB;
          color: #374151;
        }

        .nav-item-active {
          background-color: #EFF6FF;
          color: #2563EB;
          border-right-color: #2563EB;
        }

        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid #E5E7EB;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background-color: #E5E7EB;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B7280;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        .user-role {
          font-size: 12px;
          color: #6B7280;
        }

        .sign-out-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          color: #6B7280;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sign-out-btn:hover {
          background-color: #F3F4F6;
          color: #374151;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: 280px;
        }

        .top-bar {
          height: 64px;
          background: white;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .top-bar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
        }

        .mobile-menu-btn:hover {
          background-color: #F3F4F6;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 8px 12px;
          width: 300px;
        }

        .search-input {
          border: none;
          background: none;
          outline: none;
          flex: 1;
          font-size: 14px;
          color: #374151;
        }

        .search-input::placeholder {
          color: #9CA3AF;
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
        }

        .notification-btn:hover {
          background-color: #F3F4F6;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #EF4444;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
        }

        .user-menu-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .user-menu-btn:hover {
          background-color: #F3F4F6;
        }

        .page-content {
          flex: 1;
          overflow: auto;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .sidebar {
            width: 280px;
          }

          .main-content {
            margin-left: 0;
          }

          .mobile-overlay {
            display: block;
          }

          .mobile-menu-btn {
            display: block;
          }

          .mobile-close {
            display: block;
          }

          .search-bar {
            width: 200px;
          }

          .top-bar {
            padding: 0 16px;
          }
        }

        @media (max-width: 480px) {
          .search-bar {
            display: none;
          }

          .sidebar-header {
            padding: 16px;
          }

          .top-bar {
            padding: 0 12px;
          }
        }

        /* Desktop styles */
        @media (min-width: 769px) {
          .sidebar {
            position: static;
            transform: none;
          }

          .mobile-overlay {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

