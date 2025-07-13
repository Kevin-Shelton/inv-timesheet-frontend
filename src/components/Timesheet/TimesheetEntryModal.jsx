import React, { useState, useEffect } from 'react';
import { campaignsData, employeesData } from '../../data/TimesheetData';

const TimesheetEntryModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editEntry = null,
  currentUser = null 
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    campaignId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    breakTime: 0.5,
    description: '',
    status: 'Draft'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens or edit entry changes
  useEffect(() => {
    if (editEntry) {
      setFormData({
        employeeId: editEntry.employeeId,
        campaignId: editEntry.campaignId,
        date: editEntry.date,
        startTime: editEntry.startTime,
        endTime: editEntry.endTime,
        breakTime: editEntry.breakTime,
        description: editEntry.description,
        status: editEntry.status
      });
    } else {
      // Reset form for new entry
      setFormData({
        employeeId: currentUser?.id || '',
        campaignId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        breakTime: 0.5,
        description: '',
        status: 'Draft'
      });
    }
    setErrors({});
  }, [editEntry, currentUser, isOpen]);

  // Calculate total hours
  const calculateHours = () => {
    if (!formData.startTime || !formData.endTime) return { total: 0, regular: 0, overtime: 0 };

    const start = new Date(`2000-01-01T${formData.startTime}:00`);
    const end = new Date(`2000-01-01T${formData.endTime}:00`);
    
    if (end <= start) {
      return { total: 0, regular: 0, overtime: 0 };
    }

    const totalMinutes = (end - start) / (1000 * 60);
    const totalHours = (totalMinutes / 60) - (formData.breakTime || 0);
    const regularHours = Math.min(totalHours, 8);
    const overtimeHours = Math.max(0, totalHours - 8);

    return {
      total: Math.max(0, totalHours),
      regular: Math.max(0, regularHours),
      overtime: Math.max(0, overtimeHours)
    };
  };

  const hours = calculateHours();

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }

    if (!formData.campaignId) {
      newErrors.campaignId = 'Campaign/Project is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (hours.total <= 0) {
      newErrors.time = 'Total hours must be greater than 0';
    }

    if (hours.total > 24) {
      newErrors.time = 'Total hours cannot exceed 24 hours';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const entryData = {
        ...formData,
        totalHours: hours.total,
        regularHours: hours.regular,
        overtimeHours: hours.overtime,
        submittedAt: new Date().toISOString(),
        id: editEntry?.id || Date.now() // Simple ID generation for demo
      };

      await onSave(entryData);
      onClose();
    } catch (error) {
      console.error('Error saving timesheet entry:', error);
      setErrors({ submit: 'Failed to save timesheet entry. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Get filtered campaigns based on selected employee
  const getAvailableCampaigns = () => {
    if (!formData.employeeId) return campaignsData;
    
    const employee = employeesData.find(emp => emp.id === parseInt(formData.employeeId));
    if (!employee) return campaignsData;

    return campaignsData.filter(campaign => 
      campaign.status === 'Active' && 
      campaign.teamMembers.includes(employee.username)
    );
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {editEntry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#6B7280'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#F3F4F6';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Hours Summary */}
          <div style={{
            backgroundColor: '#F9FAFB',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Total Hours</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  {hours.total.toFixed(1)}h
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Regular Hours</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#10B981' }}>
                  {hours.regular.toFixed(1)}h
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Overtime Hours</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: hours.overtime > 0 ? '#EF4444' : '#6B7280' }}>
                  {hours.overtime.toFixed(1)}h
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Employee Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Employee *
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.employeeId ? '#EF4444' : '#D1D5DB'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="">Select Employee</option>
                {employeesData.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                  {errors.employeeId}
                </div>
              )}
            </div>

            {/* Campaign Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Campaign/Project *
              </label>
              <select
                value={formData.campaignId}
                onChange={(e) => handleInputChange('campaignId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.campaignId ? '#EF4444' : '#D1D5DB'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="">Select Campaign/Project</option>
                {getAvailableCampaigns().map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name} - {campaign.client}
                  </option>
                ))}
              </select>
              {errors.campaignId && (
                <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                  {errors.campaignId}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.date ? '#EF4444' : '#D1D5DB'}`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {errors.date && (
                <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                  {errors.date}
                </div>
              )}
            </div>

            {/* Time Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.startTime ? '#EF4444' : '#D1D5DB'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.startTime && (
                  <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                    {errors.startTime}
                  </div>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.endTime ? '#EF4444' : '#D1D5DB'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.endTime && (
                  <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                    {errors.endTime}
                  </div>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Break Time (hours)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="4"
                  value={formData.breakTime}
                  onChange={(e) => handleInputChange('breakTime', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {errors.time && (
              <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '-16px' }}>
                {errors.time}
              </div>
            )}

            {/* Description */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the work performed..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.description ? '#EF4444' : '#D1D5DB'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              {errors.description && (
                <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                  {errors.description}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Submit for Approval</option>
                {currentUser?.role === 'admin' && (
                  <option value="Approved">Approved</option>
                )}
              </select>
            </div>

            {errors.submit && (
              <div style={{
                padding: '12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#DC2626'
              }}>
                {errors.submit}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid #E5E7EB'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#F9FAFB';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#FFFFFF';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#FFFFFF',
                backgroundColor: isSubmitting ? '#9CA3AF' : '#3B82F6',
                border: 'none',
                borderRadius: '6px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#2563EB';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#3B82F6';
                }
              }}
            >
              {isSubmitting ? 'Saving...' : (editEntry ? 'Update Entry' : 'Save Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimesheetEntryModal;

