import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { AppLayout } from './components/Layout/AppLayout'
import { LoginPage } from './components/Auth/LoginPage'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { PublicRoute } from './components/Auth/PublicRoute'
import Dashboard from './components/Dashboard/Dashboard'
import { TimesheetsPage } from './components/Timesheet/TimesheetPage'

// Import all the page components
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
  CampaignManagementPage,  // Updated from OrganizationPage
  IntegrationsPage
} from './components/Pages/AllPages'

import './App.css'

// Loading component
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
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
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '14px',
          margin: 0
        }}>
          Loading Invictus Timesheet...
        </p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Main App component
function AppContent() {
  return (
    <Router>
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
          
          {/* Campaign Management - Updated from Organization */}
          <Route path="campaigns" element={<CampaignManagementPage />} />
          <Route path="organization" element={<Navigate to="/campaigns" replace />} />
          
          {/* Integrations */}
          <Route path="integrations" element={<IntegrationsPage />} />
        </Route>

        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

// Root App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
// Cache bust - Emergency React Import Fix

