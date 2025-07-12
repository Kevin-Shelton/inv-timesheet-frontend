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
  X,
  Menu
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
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar-corrected">
        {/* Logo Section */}
        <div className="sidebar-logo-corrected">
          <div className="logo-container-corrected">
            <div className="logo-icon-corrected">
              <Clock size={24} className="logo-clock-corrected" />
            </div>
            <div className="logo-text-corrected">
              <h1>Timesheet</h1>
              <span>Pro</span>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="sidebar-profile-corrected">
          <div className="profile-container-corrected">
            <div className="profile-avatar-corrected">
              <User size={20} />
            </div>
            <div className="profile-info-corrected">
              <div className="profile-name-corrected">{user?.full_name || user?.email || 'User'}</div>
              <div className="profile-role-corrected">{user?.role || 'Team Member'}</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav-corrected">
          <ul className="nav-list-corrected">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path} className="nav-item-corrected">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `nav-link-corrected ${isActive ? 'nav-link-active-corrected' : ''}`
                    }
                    onClick={() => window.innerWidth < 768 && onClose()}
                  >
                    <Icon size={18} className="nav-icon-corrected" />
                    <span className="nav-label-corrected">{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="sidebar-footer-corrected">
          <button 
            onClick={handleLogout}
            className="logout-button-corrected"
          >
            <LogOut size={18} className="logout-icon-corrected" />
            <span className="logout-label-corrected">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

