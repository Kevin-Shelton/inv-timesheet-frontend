import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  AlertCircle, 
  CheckCircle2,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { supabaseApi } from "../../supabaseClient.js";

const ScheduleForm = ({ 
  isOpen, 
  onClose, 
  schedule = null, // null for create, object for edit
  onSave,
  campaigns = []
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule_type: 'fixed', // fixed, flexible, weekly_flexible
    workdays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    start_time: '09:00',
    end_time: '17:00',
    hours_per_day: 8,
    hours_per_week: 40,
    include_time_before_shift: false,
    split_time: '00:00',
    campaign_ids: [],
    department: '',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize form data when schedule prop changes
  useEffect(() => {
    if (schedule) {
      // Edit mode - populate form with existing schedule data
      setFormData({
        name: schedule.name || '',
        description: schedule.description || '',
        schedule_type: schedule.schedule_type || 'fixed',
        workdays: schedule.workdays || {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        },
        start_time: schedule.start_time || '09:00',
        end_time: schedule.end_time || '17:00',
        hours_per_day: schedule.hours_per_day || 8,
        hours_per_week: schedule.hours_per_week || 40,
        include_time_before_shift: schedule.include_time_before_shift || false,
        split_time: schedule.split_time || '00:00',
        campaign_ids: schedule.campaigns?.map(c => c.id) || [],
        department: schedule.department || '',
        is_active: schedule.is_active !== undefined ? schedule.is_active : true
      });
    } else {
      // Create mode - reset to defaults
      setFormData({
        name: '',
        description: '',
        schedule_type: 'fixed',
        workdays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        start_time: '09:00',
        end_time: '17:00',
        hours_per_day: 8,
        hours_per_week: 40,
        include_time_before_shift: false,
        split_time: '00:00',
        campaign_ids: [],
        department: '',
        is_active: true
      });
    }
    setErrors({});
  }, [schedule]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle workday changes
  const handleWorkdayChange = (day, checked) => {
    setFormData(prev => ({
      ...prev,
      workdays: {
        ...prev.workdays,
        [day]: checked
      }
    }));
  };

  // Handle campaign selection
  const handleCampaignChange = (campaignId, checked) => {
    setFormData(prev => ({
      ...prev,
      campaign_ids: checked 
        ? [...prev.campaign_ids, campaignId]
        : prev.campaign_ids.filter(id => id !== campaignId)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Schedule name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Workdays validation
    const hasWorkdays = Object.values(formData.workdays).some(day => day);
    if (!hasWorkdays) {
      newErrors.workdays = 'At least one workday must be selected';
    }

    // Time validation for fixed schedules
    if (formData.schedule_type === 'fixed') {
      if (!formData.start_time) {
        newErrors.start_time = 'Start time is required for fixed schedules';
      }
      if (!formData.end_time) {
        newErrors.end_time = 'End time is required for fixed schedules';
      }
      
      // Check if end time is after start time
      if (formData.start_time && formData.end_time) {
        const start = new Date(`2000-01-01T${formData.start_time}`);
        const end = new Date(`2000-01-01T${formData.end_time}`);
        
        if (end <= start) {
          newErrors.end_time = 'End time must be after start time';
        }
      }
    }

    // Hours validation for flexible schedules
    if (formData.schedule_type === 'flexible') {
      if (!formData.hours_per_day || formData.hours_per_day <= 0) {
        newErrors.hours_per_day = 'Hours per day must be greater than 0';
      }
      if (formData.hours_per_day > 24) {
        newErrors.hours_per_day = 'Hours per day cannot exceed 24';
      }
    }

    if (formData.schedule_type === 'weekly_flexible') {
      if (!formData.hours_per_week || formData.hours_per_week <= 0) {
        newErrors.hours_per_week = 'Hours per week must be greater than 0';
      }
      if (formData.hours_per_week > 168) {
        newErrors.hours_per_week = 'Hours per week cannot exceed 168';
      }
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

    setLoading(true);
    try {
      // Prepare data for API
      const scheduleData = {
        ...formData,
        campaigns: formData.campaign_ids.map(id => 
          campaigns.find(c => c.id === id)
        ).filter(Boolean)
      };

      await onSave(scheduleData);
      onClose();
    } catch (error) {
      console.error('Error saving schedule:', error);
      setErrors({ submit: 'Failed to save schedule. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Quick preset functions
  const applyPreset = (preset) => {
    switch (preset) {
      case 'business_hours':
        setFormData(prev => ({
          ...prev,
          name: 'Standard Business Hours',
          description: 'Monday to Friday, 9 AM to 5 PM',
          schedule_type: 'fixed',
          workdays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false
          },
          start_time: '09:00',
          end_time: '17:00'
        }));
        break;
      case 'night_shift':
        setFormData(prev => ({
          ...prev,
          name: 'Night Shift',
          description: 'Sunday to Thursday, 10 PM to 6 AM',
          schedule_type: 'fixed',
          workdays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: false,
            saturday: false,
            sunday: true
          },
          start_time: '22:00',
          end_time: '06:00',
          split_time: '00:00'
        }));
        break;
      case 'flexible_40':
        setFormData(prev => ({
          ...prev,
          name: 'Flexible 40 Hours',
          description: '40 hours per week, flexible timing',
          schedule_type: 'weekly_flexible',
          workdays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false
          },
          hours_per_week: 40
        }));
        break;
      case 'part_time':
        setFormData(prev => ({
          ...prev,
          name: 'Part-Time Schedule',
          description: '4 hours per day, flexible days',
          schedule_type: 'flexible',
          workdays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
          },
          hours_per_day: 4
        }));
        break;
    }
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
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F9FAFB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#FB923C',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                {schedule ? 'Edit Schedule' : 'Create New Schedule'}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: 0
              }}>
                {schedule ? 'Modify schedule settings and assignments' : 'Set up a new work schedule for your team'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Quick Presets */}
            {!schedule && (
              <div style={{
                marginBottom: '32px',
                padding: '20px',
                backgroundColor: '#F0F9FF',
                borderRadius: '8px',
                border: '1px solid #E0F2FE'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 12px 0'
                }}>
                  Quick Start Templates
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: '0 0 16px 0'
                }}>
                  Choose a preset to get started quickly, then customize as needed.
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}>
                  {[
                    { key: 'business_hours', label: 'Business Hours', desc: 'Mon-Fri, 9-5' },
                    { key: 'night_shift', label: 'Night Shift', desc: 'Sun-Thu, 10PM-6AM' },
                    { key: 'flexible_40', label: 'Flexible 40h', desc: '40h/week flexible' },
                    { key: 'part_time', label: 'Part-Time', desc: '4h/day flexible' }
                  ].map(preset => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => applyPreset(preset.key)}
                      style={{
                        padding: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#F9FAFB';
                        e.target.style.borderColor = '#FB923C';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.borderColor = '#E5E7EB';
                      }}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '4px'
                      }}>
                        {preset.label}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6B7280'
                      }}>
                        {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div style={{
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info size={20} color="#FB923C" />
                Basic Information
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                {/* Schedule Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Schedule Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Standard Business Hours"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${errors.name ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (!errors.name) {
                        e.target.style.borderColor = '#FB923C';
                        e.target.style.boxShadow = '0 0 0 3px rgba(251, 146, 60, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.name) {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  {errors.name && (
                    <p style={{
                      fontSize: '12px',
                      color: '#EF4444',
                      margin: '4px 0 0 0'
                    }}>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Schedule Type */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Schedule Type *
                  </label>
                  <select
                    value={formData.schedule_type}
                    onChange={(e) => handleChange('schedule_type', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FB923C';
                      e.target.style.boxShadow = '0 0 0 3px rgba(251, 146, 60, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="fixed">Fixed Hours (start/end time)</option>
                    <option value="flexible">Flexible Daily (hours per day)</option>
                    <option value="weekly_flexible">Weekly Flexible (hours per week)</option>
                  </select>
                </div>
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
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of this schedule..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.description ? '#EF4444' : '#E5E7EB'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.description) {
                      e.target.style.borderColor = '#FB923C';
                      e.target.style.boxShadow = '0 0 0 3px rgba(251, 146, 60, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.description) {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                {errors.description && (
                  <p style={{
                    fontSize: '12px',
                    color: '#EF4444',
                    margin: '4px 0 0 0'
                  }}>
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Work Days */}
            <div style={{
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar size={20} color="#FB923C" />
                Work Days *
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '12px'
              }}>
                {[
                  { key: 'monday', label: 'Mon' },
                  { key: 'tuesday', label: 'Tue' },
                  { key: 'wednesday', label: 'Wed' },
                  { key: 'thursday', label: 'Thu' },
                  { key: 'friday', label: 'Fri' },
                  { key: 'saturday', label: 'Sat' },
                  { key: 'sunday', label: 'Sun' }
                ].map(day => (
                  <label
                    key={day.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '12px 8px',
                      backgroundColor: formData.workdays[day.key] ? '#FEF3C7' : '#F9FAFB',
                      border: `2px solid ${formData.workdays[day.key] ? '#F59E0B' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!formData.workdays[day.key]) {
                        e.target.style.backgroundColor = '#F3F4F6';
                        e.target.style.borderColor = '#D1D5DB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formData.workdays[day.key]) {
                        e.target.style.backgroundColor = '#F9FAFB';
                        e.target.style.borderColor = '#E5E7EB';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.workdays[day.key]}
                      onChange={(e) => handleWorkdayChange(day.key, e.target.checked)}
                      style={{
                        marginBottom: '6px',
                        width: '16px',
                        height: '16px',
                        accentColor: '#FB923C'
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: formData.workdays[day.key] ? '#92400E' : '#6B7280'
                    }}>
                      {day.label}
                    </span>
                  </label>
                ))}
              </div>

              {errors.workdays && (
                <p style={{
                  fontSize: '12px',
                  color: '#EF4444',
                  margin: '12px 0 0 0'
                }}>
                  {errors.workdays}
                </p>
              )}
            </div>

            {/* Schedule Configuration */}
            <div style={{
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Clock size={20} color="#FB923C" />
                Schedule Configuration
              </h3>

              {/* Fixed Hours */}
              {formData.schedule_type === 'fixed' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px'
                }}>
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
                      value={formData.start_time}
                      onChange={(e) => handleChange('start_time', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${errors.start_time ? '#EF4444' : '#E5E7EB'}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    {errors.start_time && (
                      <p style={{
                        fontSize: '12px',
                        color: '#EF4444',
                        margin: '4px 0 0 0'
                      }}>
                        {errors.start_time}
                      </p>
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
                      value={formData.end_time}
                      onChange={(e) => handleChange('end_time', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${errors.end_time ? '#EF4444' : '#E5E7EB'}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    {errors.end_time && (
                      <p style={{
                        fontSize: '12px',
                        color: '#EF4444',
                        margin: '4px 0 0 0'
                      }}>
                        {errors.end_time}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Flexible Daily */}
              {formData.schedule_type === 'flexible' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Hours per Day *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    step="0.5"
                    value={formData.hours_per_day}
                    onChange={(e) => handleChange('hours_per_day', parseFloat(e.target.value))}
                    style={{
                      width: '200px',
                      padding: '10px 12px',
                      border: `1px solid ${errors.hours_per_day ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  {errors.hours_per_day && (
                    <p style={{
                      fontSize: '12px',
                      color: '#EF4444',
                      margin: '4px 0 0 0'
                    }}>
                      {errors.hours_per_day}
                    </p>
                  )}
                </div>
              )}

              {/* Weekly Flexible */}
              {formData.schedule_type === 'weekly_flexible' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Hours per Week *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    step="0.5"
                    value={formData.hours_per_week}
                    onChange={(e) => handleChange('hours_per_week', parseFloat(e.target.value))}
                    style={{
                      width: '200px',
                      padding: '10px 12px',
                      border: `1px solid ${errors.hours_per_week ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  {errors.hours_per_week && (
                    <p style={{
                      fontSize: '12px',
                      color: '#EF4444',
                      margin: '4px 0 0 0'
                    }}>
                      {errors.hours_per_week}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Campaign Assignment */}
            <div style={{
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Building2 size={20} color="#FB923C" />
                Campaign Assignment
              </h3>

              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: '0 0 16px 0'
              }}>
                Select which campaigns this schedule applies to. Leave empty to make it available for all campaigns.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {campaigns.map(campaign => (
                  <label
                    key={campaign.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: formData.campaign_ids.includes(campaign.id) ? '#F0FDF4' : '#F9FAFB',
                      border: `1px solid ${formData.campaign_ids.includes(campaign.id) ? '#16A34A' : '#E5E7EB'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!formData.campaign_ids.includes(campaign.id)) {
                        e.target.style.backgroundColor = '#F3F4F6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formData.campaign_ids.includes(campaign.id)) {
                        e.target.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.campaign_ids.includes(campaign.id)}
                      onChange={(e) => handleCampaignChange(campaign.id, e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#16A34A'
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: formData.campaign_ids.includes(campaign.id) ? '#166534' : '#374151'
                    }}>
                      {campaign.name}
                    </span>
                  </label>
                ))}
              </div>

              {formData.campaign_ids.length > 1 && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} color="#D97706" />
                  <span style={{
                    fontSize: '14px',
                    color: '#92400E'
                  }}>
                    Multi-campaign schedule: Team members can be assigned to different campaigns within this schedule.
                  </span>
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <div style={{
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: showAdvanced ? '20px' : '0'
                }}
              >
                <Settings size={20} color="#FB923C" />
                Advanced Settings
                <span style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  marginLeft: 'auto'
                }}>
                  {showAdvanced ? 'Hide' : 'Show'}
                </span>
              </button>

              {showAdvanced && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Include Time Before Shift */}
                  {formData.schedule_type === 'fixed' && (
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.include_time_before_shift}
                        onChange={(e) => handleChange('include_time_before_shift', e.target.checked)}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: '#FB923C'
                        }}
                      />
                      <div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151'
                        }}>
                          Include time tracked before shift
                        </span>
                        <p style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          margin: '2px 0 0 0'
                        }}>
                          Count time logged before the official start time
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Split Time */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Split Time
                    </label>
                    <input
                      type="time"
                      value={formData.split_time}
                      onChange={(e) => handleChange('split_time', e.target.value)}
                      style={{
                        width: '200px',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <p style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      margin: '4px 0 0 0'
                    }}>
                      Time when the work day splits (affects overtime calculations)
                    </p>
                  </div>

                  {/* Department */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      placeholder="e.g., Customer Service, Development"
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Active Status */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#10B981'
                      }}
                    />
                    <div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        Active Schedule
                      </span>
                      <p style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        margin: '2px 0 0 0'
                      }}>
                        Only active schedules can be assigned to team members
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div style={{
                marginBottom: '24px',
                padding: '12px 16px',
                backgroundColor: '#FEE2E2',
                borderRadius: '6px',
                border: '1px solid #FECACA'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#DC2626',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  {errors.submit}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6B7280'
          }}>
            * Required fields
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FFFFFF';
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: loading ? '#D1D5DB' : '#FB923C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#EA580C';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#FB923C';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #FFFFFF',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {schedule ? 'Update Schedule' : 'Create Schedule'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ScheduleForm;

