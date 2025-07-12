import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return null // This will be handled by ProtectedRoute
  }

  return (
    <div className="app-layout-corrected">
      {/* Fixed Desktop Sidebar */}
      <div className="sidebar-container-corrected">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />
      </div>

      {/* Main Content Area */}
      <div className="main-content-corrected">
        {/* Header */}
        <div className="header-container-corrected">
          <Header 
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        {/* Page Content */}
        <main className="page-content-corrected">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay - Only for very small screens */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div 
          className="sidebar-overlay-corrected"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

