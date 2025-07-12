import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  ChevronDown,
  Clock,
  Calendar,
  Menu
} from 'lucide-react'

export function Header({ user, onMenuClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  return (
    <header className="header-corrected">
      <div className="header-content-corrected">
        {/* Left Section - Mobile Menu + Page Title */}
        <div className="header-left-corrected">
          <button 
            className="mobile-menu-button-corrected"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
          <div className="page-title-corrected">
            <h2>Dashboard</h2>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="header-center-corrected">
          <div className="search-container-corrected">
            <Search size={16} className="search-icon-corrected" />
            <input 
              type="text" 
              placeholder="Search timesheets, projects..."
              className="search-input-corrected"
            />
          </div>
        </div>

        {/* Right Section - Time, Notifications, Profile */}
        <div className="header-right-corrected">
          {/* Current Time Display */}
          <div className="time-display-corrected">
            <Clock size={14} className="time-icon-corrected" />
            <div className="time-info-corrected">
              <span className="current-time-corrected">{currentTime}</span>
              <span className="current-date-corrected">{currentDate}</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="notification-container-corrected">
            <button 
              className="notification-button-corrected"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={18} />
              <span className="notification-badge-corrected">3</span>
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown-corrected">
                <div className="notification-header-corrected">
                  <h3>Notifications</h3>
                  <span className="notification-count-corrected">3 new</span>
                </div>
                <div className="notification-list-corrected">
                  <div className="notification-item-corrected">
                    <p>Timesheet approval required</p>
                    <span className="notification-time-corrected">2 min ago</span>
                  </div>
                  <div className="notification-item-corrected">
                    <p>New team member added</p>
                    <span className="notification-time-corrected">1 hour ago</span>
                  </div>
                  <div className="notification-item-corrected">
                    <p>Weekly report ready</p>
                    <span className="notification-time-corrected">3 hours ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="profile-menu-container-corrected">
            <button 
              className="profile-button-corrected"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar-corrected">
                <User size={16} />
              </div>
              <div className="profile-text-corrected">
                <span className="profile-name-corrected">{user?.full_name || user?.email || 'User'}</span>
              </div>
              <ChevronDown size={14} className="profile-chevron-corrected" />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown-corrected">
                <div className="profile-dropdown-header-corrected">
                  <div className="profile-dropdown-avatar-corrected">
                    <User size={20} />
                  </div>
                  <div className="profile-dropdown-info-corrected">
                    <div className="profile-dropdown-name-corrected">{user?.full_name || user?.email}</div>
                    <div className="profile-dropdown-email-corrected">{user?.email}</div>
                  </div>
                </div>
                <div className="profile-dropdown-menu-corrected">
                  <button className="profile-menu-item-corrected">
                    <User size={14} />
                    <span>Profile Settings</span>
                  </button>
                  <button className="profile-menu-item-corrected">
                    <Settings size={14} />
                    <span>Preferences</span>
                  </button>
                  <button className="profile-menu-item-corrected">
                    <Calendar size={14} />
                    <span>My Schedule</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

