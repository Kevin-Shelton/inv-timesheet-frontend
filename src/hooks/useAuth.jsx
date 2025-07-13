import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const savedUser = localStorage.getItem('timesheet_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('timesheet_user')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function with proper error handling
  const login = async (email, password) => {
    try {
      setLoading(true)

      // Simulate API call - replace with actual authentication
      const response = await simulateLogin(email, password)
      
      if (response.success) {
        const userData = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          company: 'Invictus',
          avatar: response.user.avatar,
          loginTime: new Date().toISOString()
        }

        // Save user data
        setUser(userData)
        localStorage.setItem('timesheet_user', JSON.stringify(userData))

        return { success: true, user: userData }
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)
      
      // Clear user data
      setUser(null)
      localStorage.removeItem('timesheet_user')
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')

      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('timesheet_user', JSON.stringify(updatedUser))

      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Simulate login API call - replace with actual API
async function simulateLogin(email, password) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Test credentials
  const validCredentials = [
    {
      email: 'admin@test.com',
      password: 'password123',
      user: {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        avatar: null
      }
    },
    {
      email: 'user@test.com', 
      password: 'password123',
      user: {
        id: '2',
        email: 'user@test.com',
        name: 'Test User',
        role: 'user',
        avatar: null
      }
    }
  ]

  // Check credentials
  const credential = validCredentials.find(
    cred => cred.email === email && cred.password === password
  )

  if (credential) {
    return {
      success: true,
      user: credential.user
    }
  } else {
    return {
      success: false,
      error: 'Invalid email or password'
    }
  }
}

export default useAuth

