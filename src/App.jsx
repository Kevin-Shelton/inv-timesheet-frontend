import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './components/Layout/AppLayout'
import { LoginPage } from './components/Auth/LoginPage'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { PublicRoute } from './components/Auth/PublicRoute'
import { Dashboard } from './components/Dashboard/Dashboard'
import { TimesheetsPage } from './components/Timesheet/TimesheetPage'

// Import all the new page components
import { 
  LiveLocationsPage,
  TimeOffPage,
  ReportsPage,
  SettingsPage,
  MyTeamPage,
  TimeTrackingPage,
  WorkSchedulesPage,
  TimeOffHolidaysPage,
  LocationsPage,
  ActivitiesProjectsPage,
  OrganizationPage,
  IntegrationsPage
} from './components/Pages/AllPages'

import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />
            
            {/* Main Navigation Pages */}
            <Route path="timesheets" element={<TimesheetsPage />} />
            <Route path="live-locations" element={<LiveLocationsPage />} />
            <Route path="time-off" element={<TimeOffPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            {/* Team Management */}
            <Route path="my-team" element={<MyTeamPage />} />
            
            {/* Time Management */}
            <Route path="time-tracking" element={<TimeTrackingPage />} />
            <Route path="work-schedules" element={<WorkSchedulesPage />} />
            <Route path="time-off-holidays" element={<TimeOffHolidaysPage />} />
            
            {/* Location Management */}
            <Route path="locations" element={<LocationsPage />} />
            
            {/* Project Management */}
            <Route path="activities-projects" element={<ActivitiesProjectsPage />} />
            
            {/* Organization */}
            <Route path="organization" element={<OrganizationPage />} />
            
            {/* Integrations */}
            <Route path="integrations" element={<IntegrationsPage />} />
          </Route>

          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

