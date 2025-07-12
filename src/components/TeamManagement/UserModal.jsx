import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Select } from '../ui/Select'

export function UserModal({ mode, user, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    role: user?.role || 'team_member',
    pay_rate_per_hour: user?.pay_rate_per_hour || '',
    hire_date: user?.hire_date || new Date().toISOString().split('T')[0],
    phone: user?.phone || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.full_name || !formData.email || !formData.role) {
        throw new Error('Please fill in all required fields')
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Validate pay rate
      if (formData.pay_rate_per_hour && (isNaN(formData.pay_rate_per_hour) || formData.pay_rate_per_hour < 0)) {
        throw new Error('Please enter a valid pay rate')
      }

      await onSubmit(formData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="modal-overlay">
      <div className="user-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? 'Add Team Member' : 'Edit Team Member'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit} className="user-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <Label htmlFor="role">Role *</Label>
                <Select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                >
                  <option value="team_member">Team Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>

              <div className="form-group">
                <Label htmlFor="pay_rate_per_hour">Pay Rate (per hour)</Label>
                <Input
                  id="pay_rate_per_hour"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pay_rate_per_hour}
                  onChange={(e) => handleInputChange('pay_rate_per_hour', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <Label htmlFor="hire_date">Hire Date</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)}
                />
              </div>

              <div className="form-group">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : (mode === 'create' ? 'Add Member' : 'Save Changes')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

