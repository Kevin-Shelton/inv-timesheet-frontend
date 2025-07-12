import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  Briefcase, 
  FileText, 
  Settings,
  LogOut,
  X
} from 'lucide-react'

export function Sidebar({ isOpen, onClose, user }) {
  const { logout } = useAuth()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'team_member']
    },
    {
      name: 'Timesheets',
      href: '/timesheets',
      icon: Clock,
      roles: ['admin', 'manager', 'team_member']
    },
    {
      name: 'Team Members',
      href: '/team',
      icon: Users,
      roles: ['admin', 'manager']
    },
    {
      name: 'Campaigns',
      href: '/campaigns',
      icon: Briefcase,
      roles: ['admin', 'manager']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      roles: ['admin', 'manager']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['admin', 'manager', 'team_member']
    }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  )

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <>
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2 className="logo-text">Timesheet</h2>
          </div>
          <button 
            className="sidebar-close md:hidden"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-text">{item.name}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

