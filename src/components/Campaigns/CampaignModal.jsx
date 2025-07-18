import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'

export function CampaignModal({ mode, campaign, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    hourly_rate: campaign?.hourly_rate || '',
    start_date: campaign?.start_date || new Date().toISOString().split('T')[0],
    end_date: campaign?.end_date || '',
    is_active: campaign?.is_active ?? true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name) {
        throw new Error('Campaign name is required')
      }

      // Validate hourly rate
      if (formData.hourly_rate && (isNaN(formData.hourly_rate) || formData.hourly_rate < 0)) {
        throw new Error('Please enter a valid hourly rate')
      }

      // Validate dates
      if (formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
        throw new Error('End date cannot be before start date')
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
      <div className="campaign-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? 'Create Campaign' : 'Edit Campaign'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit} className="campaign-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div className="form-group">
                <Label htmlFor="hourly_rate">Hourly Rate</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>

              <div className="form-group">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter campaign description"
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="form-checkbox"
                  />
                  <Label htmlFor="is_active">Active Campaign</Label>
                </div>
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
                {loading ? 'Saving...' : (mode === 'create' ? 'Create Campaign' : 'Save Changes')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

