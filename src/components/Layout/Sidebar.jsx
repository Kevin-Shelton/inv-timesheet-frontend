import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings,
  LogOut,
  User,
  X
} from 'lucide-react'

export function Sidebar({ isOpen, onClose, user }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/timesheets', icon: Clock, label: 'Timesheets' },
    { path: '/team', icon: Users, label: 'Team Members' },
    { path: '/campaigns', icon: FolderOpen, label: 'Campaigns' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Clock className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">Timesheet Pro</span>
        </div>
        {/* Close button for mobile */}
        <button 
          className="mobile-close-button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginLeft: 'auto',
            display: window.innerWidth < 768 ? 'block' : 'none'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => window.innerWidth < 768 && onClose()}
            >
              <Icon className="nav-icon" size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-details">
            <div className="user-name">{user?.full_name || user?.email || 'User'}</div>
            <div className="user-role">{user?.role || 'Team Member'}</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="logout-button"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}

