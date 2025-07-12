import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Card } from '../ui/Card'
import { Eye, EyeOff, Clock, Users, TrendingUp } from 'lucide-react'

export function LoginPage() {
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const fillTestCredentials = (email, password) => {
    setFormData({ email, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-800">
              Welcome to <span className="text-blue-600">Timesheet Pro</span>
            </h1>
            <p className="text-xl text-slate-600">
              Professional time tracking and team management made simple
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Time Tracking</h3>
                <p className="text-slate-600">Accurate time logging with smart automation</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Team Management</h3>
                <p className="text-slate-600">Manage teams and projects effortlessly</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Analytics</h3>
                <p className="text-slate-600">Detailed insights and reporting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                <p className="text-slate-600">Sign in to your timesheet account</p>
              </div>

              {/* Test Credentials */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-blue-800 text-sm">Test Credentials:</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('admin@test.com', 'password123')}
                    className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
                  >
                    <div className="font-medium text-blue-700">Admin Account</div>
                    <div className="text-blue-600">admin@test.com / password123</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('user@test.com', 'password123')}
                    className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
                  >
                    <div className="font-medium text-blue-700">User Account</div>
                    <div className="text-blue-600">user@test.com / password123</div>
                  </button>
                </div>
                <p className="text-xs text-blue-600">Click any credential above to auto-fill</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center">
                <p className="text-sm text-slate-500">
                  Need help? Contact your administrator
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Header for smaller screens */}
      <div className="lg:hidden absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-2xl font-bold text-slate-800">
          <span className="text-blue-600">Timesheet Pro</span>
        </h1>
      </div>
    </div>
  )
}

