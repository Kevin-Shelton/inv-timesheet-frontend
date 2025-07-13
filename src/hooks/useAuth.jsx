import { createContext, useContext, useState, useEffect } from 'react'

// Create the auth context
const AuthContext = createContext(null)

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('timesheet_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      }
    } catch (error) {
      console.error('Error loading saved user:', error)
      localStorage.removeItem('timesheet_user')
    } finally {
      setLoading(false)
    }
  }, [])

  // Simple login function
  const login = async (email, password) => {
    console.log('Login function called with:', { email, password })
    
    try {
      setLoading(true)

      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check credentials
      let userData = null
      
      if (email === 'admin@test.com' && password === 'password123') {
        userData = {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
          company: 'Invictus'
        }
      } else if (email === 'user@test.com' && password === 'password123') {
        userData = {
          id: '2',
          email: 'user@test.com',
          name: 'Test User',
          role: 'user',
          company: 'Invictus'
        }
      } else {
        throw new Error('Invalid email or password')
      }

      // Save user data
      setUser(userData)
      localStorage.setItem('timesheet_user', JSON.stringify(userData))

      console.log('Login successful:', userData)
      return { success: true, user: userData }

    } catch (error) {
      console.error('Login error:', error)
      setUser(null)
      localStorage.removeItem('timesheet_user')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    console.log('Logout called')
    setUser(null)
    localStorage.removeItem('timesheet_user')
  }

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Default export
export default useAuth

