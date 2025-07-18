import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

// Professional Invictus Logo for login page
const InvictusLoginLogo = () => (
  <svg 
    width="200" 
    height="60" 
    viewBox="0 0 400 100" 
    style={{ maxWidth: '100%', height: 'auto' }}
  >
    <defs>
      <linearGradient id="loginGreenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8BC34A" />
        <stop offset="100%" stopColor="#4CAF50" />
      </linearGradient>
    </defs>
    
    {/* Logo symbol */}
    <g transform="translate(20, 25)">
      <path 
        d="M 10 30 Q 35 5 60 30" 
        stroke="#6B7280" 
        strokeWidth="5" 
        fill="none"
      />
      <path 
        d="M 20 45 Q 45 20 70 45" 
        stroke="#6B7280" 
        strokeWidth="5" 
        fill="none"
      />
      
      <circle cx="10" cy="30" r="8" fill="url(#loginGreenGradient)" />
      <circle cx="60" cy="30" r="8" fill="url(#loginGreenGradient)" />
      <circle cx="70" cy="45" r="8" fill="url(#loginGreenGradient)" />
    </g>
    
    {/* Invictus text */}
    <text 
      x="110" 
      y="62" 
      fontFamily="Arial, sans-serif" 
      fontSize="36" 
      fontWeight="700" 
      fill="#374151"
    >
      invictus
    </text>
  </svg>
)

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const auth = useAuth()
  const navigate = useNavigate()

  // Regular form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    await performLogin(email, password)
  }

  // Quick login function
  const handleQuickLogin = async (testEmail, testPassword) => {
    setEmail(testEmail)
    setPassword(testPassword)
    await performLogin(testEmail, testPassword)
  }

  // Centralized login logic
  const performLogin = async (loginEmail, loginPassword) => {
    console.log('performLogin called with:', { loginEmail, loginPassword })
    
    setError('')
    setIsLoading(true)

    try {
      // Basic validation
      if (!loginEmail || !loginPassword) {
        throw new Error('Please enter both email and password')
      }

      if (!loginEmail.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      // Check if auth.login exists
      if (!auth || typeof auth.login !== 'function') {
        console.error('Auth context or login function not available:', auth)
        throw new Error('Authentication system not available')
      }

      console.log('Calling auth.login...')
      const result = await auth.login(loginEmail, loginPassword)
      console.log('Login result:', result)
      
      if (result && result.success) {
        console.log('Login successful, navigating to dashboard')
        navigate('/', { replace: true })
      } else {
        throw new Error('Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Inline styles for professional design
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '48px',
    width: '100%',
    maxWidth: '400px',
    position: 'relative'
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '32px'
  }

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: '16px 0 8px 0'
  }

  const subtitleStyle = {
    fontSize: '16px',
    color: '#6B7280',
    margin: 0
  }

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  }

  const inputGroupStyle = {
    position: 'relative'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 44px',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.15s ease',
    boxSizing: 'border-box',
    outline: 'none'
  }

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF'
  }

  const passwordToggleStyle = {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    padding: '4px'
  }

  const buttonStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    opacity: isLoading ? 0.7 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }

  const errorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    color: '#DC2626',
    fontSize: '14px'
  }

  const quickLoginStyle = {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    border: '1px solid #E5E7EB'
  }

  const quickLoginTitleStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: '8px',
    textAlign: 'center'
  }

  const quickLoginButtonStyle = {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'all 0.15s ease'
  }

  const helpTextStyle = {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#6B7280'
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <InvictusLoginLogo />
          <h1 style={titleStyle}>Welcome Back</h1>
          <p style={subtitleStyle}>Sign in to your timesheet account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={errorStyle}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Email Input */}
          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={iconStyle} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@test.com"
                style={inputStyle}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={iconStyle} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={passwordToggleStyle}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={buttonStyle}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Quick Login for Testing */}
        <div style={quickLoginStyle}>
          <div style={quickLoginTitleStyle}>Test Credentials</div>
          <button
            onClick={() => handleQuickLogin('admin@test.com', 'password123')}
            style={quickLoginButtonStyle}
            disabled={isLoading}
          >
            Admin Account: admin@test.com / password123
          </button>
          <button
            onClick={() => handleQuickLogin('user@test.com', 'password123')}
            style={quickLoginButtonStyle}
            disabled={isLoading}
          >
            User Account: user@test.com / password123
          </button>
        </div>

        {/* Help Text */}
        <div style={helpTextStyle}>
          Need help? Contact your administrator
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoginPage

