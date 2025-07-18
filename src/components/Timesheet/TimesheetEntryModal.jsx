import React, { useState, useEffect } from 'react';
import { campaignsData, employeesData } from '../../data/TimesheetData';
import { 
  getUserTimezone, 
  getCurrentTimeShort, 
  getCurrentDate,
  calculateTotalHoursFromEntries,
  getTimeEntryStatus,
  validateTimeEntry,
  getSplitTimeInfo,
  formatDuration
} from '../../utils/TimezoneUtils';

const TimesheetEntryModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editEntry = null,
  currentUser = null 
}) => {
  const [activeTab, setActiveTab] = useState('time'); // 'time' or 'hour'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [splitTimeInfo, setSplitTimeInfo] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    campaignId: '',
    date: '',
    description: '',
    status: 'Draft'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(getCurrentTimeShort());

  // Update current time every second
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeShort());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Update split time info when time entries change
  useEffect(() => {
    const info = getSplitTimeInfo(timeEntries);
    setSplitTimeInfo(info);
  }, [timeEntries]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = getCurrentDate('iso');
      if (editEntry) {
        setFormData({
          employeeId: editEntry.employeeId,
          campaignId: editEntry.campaignId,
          date: editEntry.date,
          description: editEntry.description,
          status: editEntry.status
        });
        const employee = employeesData.find(emp => emp.id === editEntry.employeeId);
        setSelectedEmployee(employee);
        setTimeEntries(editEntry.timeEntries || []);
      } else {
        setFormData({
          employeeId: currentUser?.id || '',
          campaignId: '',
          date: today,
          description: '',
          status: 'Draft'
        });
        if (currentUser?.id) {
          const employee = employeesData.find(emp => emp.id === currentUser.id);
          setSelectedEmployee(employee);
        }
        setTimeEntries([]);
      }
      setErrors({});
    }
  }, [editEntry, currentUser, isOpen]);

  // Update selected employee when employeeId changes
  useEffect(() => {
    if (formData.employeeId) {
      const employee = employeesData.find(emp => emp.id === parseInt(formData.employeeId));
      setSelectedEmployee(employee);
    }
  }, [formData.employeeId]);

  // Handle time tracking actions
  const handleTimeAction = (action) => {
    const validation = validateTimeEntry(timeEntries, action);
    
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, timeAction: validation.message }));
      return;
    }

    // Clear any previous time action errors
    setErrors(prev => ({ ...prev, timeAction: '' }));

    const now = new Date();
    const timeString = getCurrentTimeShort();
    
    const newEntry = {
      id: Date.now(),
      type: action,
      time: timeString,
      timestamp: now.toISOString(),
      date: getCurrentDate('iso')
    };
    
    setTimeEntries(prev => [...prev, newEntry]);
  };

  // Handle removing a time entry
  const handleRemoveTimeEntry = (entryId) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (activeTab === 'time' && timeEntries.length === 0) {
      newErrors.timeEntries = 'Please add time entries using In/Break/Out buttons';
    }
    
    // Check if there's an incomplete time entry (clocked in or on break)
    if (activeTab === 'time' && timeEntries.length > 0) {
      const status = getTimeEntryStatus(timeEntries);
      if (status.status === 'in' || status.status === 'break') {
        newErrors.timeEntries = 'Please clock out before saving the timesheet entry';
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const totalHours = calculateTotalHoursFromEntries(timeEntries);
      const entryData = {
        ...formData,
        timeEntries: timeEntries,
        totalHours: totalHours,
        regularHours: Math.min(totalHours, 8),
        overtimeHours: Math.max(0, totalHours - 8),
        submittedAt: new Date().toISOString(),
        id: editEntry?.id || Date.now()
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

  // Get button state for time tracking
  const getButtonState = (action) => {
    const status = getTimeEntryStatus(timeEntries);
    
    switch (action) {
      case 'in':
        return status.canClockIn ? 'enabled' : 'disabled';
      case 'break':
        return status.canTakeBreak ? 'enabled' : 'disabled';
      case 'out':
        return status.canClockOut ? 'enabled' : 'disabled';
      default:
        return 'disabled';
    }
  };

  // Get button style based on state and current status
  const getButtonStyle = (action) => {
    const state = getButtonState(action);
    const status = getTimeEntryStatus(timeEntries);
    const isCurrentAction = status.status === action;
    
    if (state === 'disabled') {
      return {
        color: '#9CA3AF',
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        cursor: 'not-allowed'
      };
    }
    
    if (isCurrentAction) {
      return {
        color: '#FFFFFF',
        backgroundColor: '#F97316',
        border: '1px solid #F97316',
        cursor: 'pointer'
      };
    }
    
    return {
      color: '#374151',
      backgroundColor: '#FFFFFF',
      border: '1px solid #D1D5DB',
      cursor: 'pointer'
    };
  };

  if (!isOpen) return null;

  const timezoneInfo = getUserTimezone();
  const status = getTimeEntryStatus(timeEntries);

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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Add Manual Time Entry
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
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Employee Profile Section */}
          {selectedEmployee && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '600',
                color: '#6B7280'
              }}>
                {selectedEmployee.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                  {selectedEmployee.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>
                  Clocking from {timezoneInfo.shortFormat}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>
                  Split time: {currentTime}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {timeEntries.length === 0 ? 'No previous entry' : 
                   status.lastAction ? `${status.lastAction} at ${status.lastTime}` : 
                   `${timeEntries.length} time entries`}
                </div>
              </div>
            </div>
          )}
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('time')}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'time' ? '#F97316' : '#6B7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeTab === 'time' ? '#F97316' : 'transparent'}`,
                cursor: 'pointer'
              }}
            >
              Time entry
            </button>
            <button
              onClick={() => setActiveTab('hour')}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'hour' ? '#F97316' : '#6B7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeTab === 'hour' ? '#F97316' : 'transparent'}`,
                cursor: 'pointer'
              }}
            >
              Hour entry
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'time' && (
            <>
              {/* Time Tracking Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <button
                  onClick={() => handleTimeAction('in')}
                  disabled={getButtonState('in') === 'disabled'}
                  style={{
                    padding: '16px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    ...getButtonStyle('in')
                  }}
                >
                  In
                </button>
                <button
                  onClick={() => handleTimeAction('break')}
                  disabled={getButtonState('break') === 'disabled'}
                  style={{
                    padding: '16px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    ...getButtonStyle('break')
                  }}
                >
                  Break
                </button>
                <button
                  onClick={() => handleTimeAction('out')}
                  disabled={getButtonState('out') === 'disabled'}
                  style={{
                    padding: '16px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    ...getButtonStyle('out')
                  }}
                >
                  Out
                </button>
              </div>

              {/* Time Action Error */}
              {errors.timeAction && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#DC2626',
                  marginBottom: '16px'
                }}>
                  {errors.timeAction}
                </div>
              )}

              {/* Current Status */}
              {splitTimeInfo && (
                <div style={{
                  backgroundColor: '#F0F9FF',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#0369A1', marginBottom: '8px' }}>
                    Current Status: {status.status === 'in' ? 'Working' : 
                                   status.status === 'break' ? 'On Break' : 'Clocked Out'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#6B7280' }}>Total Hours: </span>
                      <span style={{ fontWeight: '500', color: '#111827' }}>
                        {formatDuration(splitTimeInfo.totalHours)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280' }}>Overtime: </span>
                      <span style={{ fontWeight: '500', color: splitTimeInfo.overtimeHours > 0 ? '#DC2626' : '#111827' }}>
                        {formatDuration(splitTimeInfo.overtimeHours)}
                      </span>
                    </div>
                  </div>
                  {splitTimeInfo.workingSince && (
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      Working since {splitTimeInfo.workingSince}
                    </div>
                  )}
                  {splitTimeInfo.onBreakSince && (
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      On break since {splitTimeInfo.onBreakSince}
                    </div>
                  )}
                </div>
              )}

              {/* Time Entries Display */}
              {timeEntries.length > 0 && (
                <div style={{
                  backgroundColor: '#F9FAFB',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px' 
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      Time Entries ({timeEntries.length})
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      Total: {formatDuration(calculateTotalHoursFromEntries(timeEntries))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                    {timeEntries.map((entry, index) => (
                      <div key={entry.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            color: entry.type === 'in' ? '#10B981' : entry.type === 'break' ? '#F59E0B' : '#EF4444',
                            fontWeight: '500',
                            textTransform: 'capitalize',
                            minWidth: '40px'
                          }}>
                            {entry.type}
                          </span>
                          <span style={{ color: '#6B7280' }}>
                            {entry.time}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveTimeEntry(entry.id)}
                          style={{
                            padding: '2px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Remove entry"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            {errors.timeEntries && (
              <div style={{
                padding: '12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#DC2626'
              }}>
                {errors.timeEntries}
              </div>
            )}

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

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '20px',
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
                  backgroundColor: isSubmitting ? '#9CA3AF' : '#F97316',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Saving...' : (editEntry ? 'Update Entry' : 'Save Entry')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TimesheetEntryModal;

