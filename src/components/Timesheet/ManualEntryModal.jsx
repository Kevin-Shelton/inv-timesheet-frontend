import { useState } from 'react'
import { X, Copy, Clock, User } from 'lucide-react'

export function ManualEntryModal({ user, campaigns, onSubmit, onClose }) {
  const [entryMode, setEntryMode] = useState('time') // 'time' or 'hour'
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    campaign_id: '',
    project: '',
    notes: '',
    // Time entry mode
    time_in: '',
    break_time: '',
    time_out: '',
    // Hour entry mode
    hours: ''
  })

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    
    if (!formData.campaign_id) {
      newErrors.campaign_id = 'Please select an activity'
    }
    
    if (entryMode === 'time') {
      if (!formData.time_in) {
        newErrors.time_in = 'Start time is required'
      }
      if (!formData.time_out) {
        newErrors.time_out = 'End time is required'
      }
      if (formData.time_in && formData.time_out && formData.time_in >= formData.time_out) {
        newErrors.time_out = 'End time must be after start time'
      }
    } else {
      if (!formData.hours || parseFloat(formData.hours) <= 0) {
        newErrors.hours = 'Please enter valid hours'
      }
      if (parseFloat(formData.hours) > 24) {
        newErrors.hours = 'Hours cannot exceed 24'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      let hours = 0
      if (entryMode === 'time') {
        // Calculate hours from time entries
        if (formData.time_in && formData.time_out) {
          const timeIn = new Date(`${formData.date}T${formData.time_in}`)
          const timeOut = new Date(`${formData.date}T${formData.time_out}`)
          const breakMinutes = formData.break_time ? parseInt(formData.break_time) : 0
          
          const totalMinutes = (timeOut - timeIn) / (1000 * 60) - breakMinutes
          hours = Math.max(0, totalMinutes / 60)
        }
      } else {
        hours = parseFloat(formData.hours) || 0
      }

      const entryData = {
        user_id: user.id,
        date: formData.date,
        campaign_id: formData.campaign_id,
        hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
        notes: formData.notes,
        status: 'pending'
      }

      await onSubmit(entryData)
    } catch (error) {
      console.error('Error submitting entry:', error)
      setErrors({ submit: 'Failed to save entry. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const calculatePreviewHours = () => {
    if (entryMode === 'time' && formData.time_in && formData.time_out) {
      const timeIn = new Date(`${formData.date}T${formData.time_in}`)
      const timeOut = new Date(`${formData.date}T${formData.time_out}`)
      const breakMinutes = formData.break_time ? parseInt(formData.break_time) : 0
      
      const totalMinutes = (timeOut - timeIn) / (1000 * 60) - breakMinutes
      const hours = Math.max(0, totalMinutes / 60)
      return Math.round(hours * 100) / 100
    }
    return entryMode === 'hour' ? parseFloat(formData.hours) || 0 : 0
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="manual-entry-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Manual Time Entry</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-content">
          {/* User Info */}
          <div className="user-info-section">
            <div className="user-avatar-large">
              {user?.full_name?.charAt(0)?.toUpperCase() || <User className="w-6 h-6" />}
            </div>
            <div className="user-details">
              <h3 className="user-name">{user?.full_name || 'Unknown User'}</h3>
              <p className="user-meta">Adding entry for {new Date(formData.date).toLocaleDateString()}</p>
              {calculatePreviewHours() > 0 && (
                <p className="user-meta preview-hours">
                  Preview: {calculatePreviewHours()}h
                </p>
              )}
            </div>
          </div>

          {/* Entry Mode Tabs */}
          <div className="entry-mode-tabs">
            <button
              type="button"
              className={`mode-tab ${entryMode === 'time' ? 'active' : ''}`}
              onClick={() => setEntryMode('time')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Time entry
            </button>
            <button
              type="button"
              className={`mode-tab ${entryMode === 'hour' ? 'active' : ''}`}
              onClick={() => setEntryMode('hour')}
            >
              Hour entry
            </button>
          </div>

          <form onSubmit={handleSubmit} className="entry-form">
            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`form-input ${errors.date ? 'error' : ''}`}
                required
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            {/* Time Entry Mode */}
            {entryMode === 'time' && (
              <div className="time-entry-section">
                <div className="time-inputs">
                  <div className="time-input-group">
                    <label className="time-label">In *</label>
                    <input
                      type="time"
                      value={formData.time_in}
                      onChange={(e) => handleInputChange('time_in', e.target.value)}
                      className={`time-input ${errors.time_in ? 'error' : ''}`}
                    />
                    {errors.time_in && <span className="error-message">{errors.time_in}</span>}
                  </div>
                  <div className="time-input-group">
                    <label className="time-label">Break</label>
                    <select
                      value={formData.break_time}
                      onChange={(e) => handleInputChange('break_time', e.target.value)}
                      className="break-select"
                    >
                      <option value="">No break</option>
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 hour</option>
                    </select>
                  </div>
                  <div className="time-input-group">
                    <label className="time-label">Out *</label>
                    <input
                      type="time"
                      value={formData.time_out}
                      onChange={(e) => handleInputChange('time_out', e.target.value)}
                      className={`time-input ${errors.time_out ? 'error' : ''}`}
                    />
                    {errors.time_out && <span className="error-message">{errors.time_out}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Hour Entry Mode */}
            {entryMode === 'hour' && (
              <div className="form-group">
                <label className="form-label">Hours *</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => handleInputChange('hours', e.target.value)}
                  className={`form-input ${errors.hours ? 'error' : ''}`}
                  placeholder="8.00"
                  required
                />
                {errors.hours && <span className="error-message">{errors.hours}</span>}
              </div>
            )}

            {/* Activity/Campaign */}
            <div className="form-group">
              <label className="form-label">Select an activity *</label>
              <select
                value={formData.campaign_id}
                onChange={(e) => handleInputChange('campaign_id', e.target.value)}
                className={`form-select ${errors.campaign_id ? 'error' : ''}`}
                required
              >
                <option value="">Choose activity...</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              {errors.campaign_id && <span className="error-message">{errors.campaign_id}</span>}
            </div>

            {/* Project */}
            <div className="form-group">
              <label className="form-label">Select a project</label>
              <select
                value={formData.project}
                onChange={(e) => handleInputChange('project', e.target.value)}
                className="form-select"
              >
                <option value="">Choose project...</option>
                <option value="general">General</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Add a note</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="form-textarea"
                placeholder="Enter notes..."
                rows="3"
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="error-banner">
                {errors.submit}
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <div className="action-group">
                <button type="button" className="action-btn secondary" disabled={isSubmitting}>
                  <Copy className="w-4 h-4 mr-2" />
                  Add new
                </button>
                <button type="button" className="action-btn secondary" disabled={isSubmitting}>
                  Duplicate
                </button>
              </div>
              <div className="action-group">
                <button type="button" onClick={onClose} className="action-btn cancel" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="action-btn primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

