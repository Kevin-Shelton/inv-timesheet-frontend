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
    <>
      {/* Mobile Header */}
      <div className="main-header">
        <button 
          className="mobile-menu-button"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#1d1d1f' }}>
          Dashboard
        </h1>
        <div style={{ width: '40px' }}></div> {/* Spacer for centering */}
      </div>

      {/* Desktop Header - Hidden by default in your CSS */}
      <div className="desktop-header" style={{
        display: 'none',
        height: '64px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '0 24px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1d1d1f', margin: 0 }}>
            Dashboard
          </h2>
        </div>

        {/* Center Section - Search */}
        <div style={{ flex: 2, maxWidth: '400px' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }}
            />
            <input 
              type="text" 
              placeholder="Search timesheets, projects..."
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px 0 36px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                fontSize: '13px',
                background: 'rgba(248, 250, 252, 0.8)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
          {/* Time Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            background: '#f1f5f9',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <Clock size={14} style={{ color: '#3b82f6' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', lineHeight: 1 }}>
                {currentTime}
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', lineHeight: 1 }}>
                {currentDate}
              </span>
            </div>
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '16px',
                height: '16px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                fontSize: '9px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white'
              }}>
                3
              </span>
            </button>
          </div>

          {/* Profile */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <User size={16} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                {user?.full_name || user?.email || 'User'}
              </span>
              <ChevronDown size={14} style={{ color: '#64748b' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

