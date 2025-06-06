import React, { createContext, useContext, useState, useEffect } from 'react'
import apiService from '../lib/api.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          apiService.setToken(token)
          const userData = await apiService.getCurrentUser()
          setUser(userData.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid token
        localStorage.removeItem('token')
        apiService.setToken(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await apiService.login(email, password)
      setUser(response.user)
      
      return response
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setError(null)
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCampaignLead: user?.role === 'campaign_lead',
    isTeamMember: user?.role === 'team_member',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

