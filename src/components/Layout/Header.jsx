import { Menu, Bell, Search } from 'lucide-react'
import { Button } from '../ui/Button'

export function Header({ user, onMenuClick }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <Button
          variant="ghost"
          size="sm"
          className="menu-btn md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <Button variant="ghost" size="sm" className="notification-btn">
          <Bell className="w-5 h-5" />
        </Button>
        
        <div className="user-menu">
          <div className="user-avatar">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}

