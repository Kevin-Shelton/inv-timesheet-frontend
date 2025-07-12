import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { AppLayout } from './components/Layout/AppLayout'
import { LoginPage } from './components/Auth/LoginPage'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { PublicRoute } from './components/Auth/PublicRoute'
import { Dashboard } from './components/Dashboard/Dashboard'
import { TimesheetPage } from './components/Timesheet/TimesheetPage'
import { TeamPage } from './components/TeamManagement/TeamPage'
import { CampaignManagement } from './components/Campaigns/CampaignManagement'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="timesheets" element={<TimesheetPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="campaigns" element={<CampaignManagement />} />
              <Route path="reports" element={<div className="page-placeholder">Reports Page - Coming Soon</div>} />
              <Route path="settings" element={<div className="page-placeholder">Settings Page - Coming Soon</div>} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={
              <div className="not-found">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

