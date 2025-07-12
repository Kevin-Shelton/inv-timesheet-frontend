import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AppLayout } from './components/Layout/AppLayout'
import { LoginPage } from './components/Auth/LoginPage'
import { Dashboard } from './components/Dashboard/Dashboard'
import { TimesheetPage } from './components/Timesheet/TimesheetPage'
import { TeamPage } from './components/TeamManagement/TeamPage'
import { CampaignManagement } from './components/Campaigns/CampaignManagement'
import './App.css'

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600 font-medium">Loading your timesheet...</p>
        <p className="text-sm text-slate-500">This should only take a moment</p>
      </div>
    </div>
  )
}

// Error component
function ErrorScreen({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Connection Issue</h2>
        <p className="text-slate-600">{error}</p>
        <div className="space-y-2">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

// Protected Route component
function ProtectedRoute({ children }) {
  const { user, loading, error } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={() => window.location.reload()} />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route component (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

// Main App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public route - Login */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="timesheets" element={<TimesheetPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="campaigns" element={<CampaignManagement />} />
        <Route path="reports" element={
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Reports</h2>
            <p className="text-slate-600">Reports feature coming soon...</p>
          </div>
        } />
        <Route path="settings" element={
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Settings</h2>
            <p className="text-slate-600">Settings feature coming soon...</p>
          </div>
        } />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

