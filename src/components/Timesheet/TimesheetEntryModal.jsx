import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabaseApi } from "../../supabaseClient.js";

const TimesheetEntryModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  userId,
  selectedDate,
  entry = null 
}) => {
  const [formData, setFormData] = useState({
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    timeIn: '',
    timeOut: '',
    breakDuration: 0,
    isManualOverride: false,
    overrideReason: '',
    manualRegular: 0,
    manualOvertime: 0,
    manualDailyDouble: 0
  });

  const [calculatedHours, setCalculatedHours] = useState({
    regular: 0,
    overtime: 0,
    dailyDoubleOvertime: 0,
    total: 0
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (entry) {
        // Editing existing entry
        setFormData({
          date: entry.date,
          timeIn: entry.clock_in_time || '',
          timeOut: entry.clock_out_time || '',
          breakDuration: parseFloat(entry.break_duration) || 0,
          isManualOverride: entry.is_manual_override || false,
          overrideReason: entry.override_reason || '',
          manualRegular: parseFloat(entry.regular_hours) || 0,
          manualOvertime: parseFloat(entry.overtime_hours) || 0,
          manualDailyDouble: parseFloat(entry.daily_double_overtime) || 0
        });
      } else {
        // Creating new entry
        setFormData({
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          timeIn: '',
          timeOut: '',
          breakDuration: 0,
          isManualOverride: false,
          overrideReason: '',
          manualRegular: 0,
          manualOvertime: 0,
          manualDailyDouble: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, entry, selectedDate]);

  // Calculate hours when time fields change
  useEffect(() => {
    if (formData.timeIn && formData.timeOut && !formData.isManualOverride) {
      calculateHours();
    }
  }, [formData.timeIn, formData.timeOut, formData.breakDuration, formData.isManualOverride]);

  const calculateHours = () => {
    if (!formData.timeIn || !formData.timeOut) {
      setCalculatedHours({ regular: 0, overtime: 0, dailyDoubleOvertime: 0, total: 0 });
      return;
    }

    try {
      const timeIn = new Date(`${formData.date}T${formData.timeIn}`);
      const timeOut = new Date(`${formData.date}T${formData.timeOut}`);
      
      // Handle overnight shifts
      if (timeOut < timeIn) {
        timeOut.setDate(timeOut.getDate() + 1);
      }

      const totalMinutes = (timeOut - timeIn) / (1000 * 60);
      const breakMinutes = formData.breakDuration * 60;
      const workedMinutes = Math.max(0, totalMinutes - breakMinutes);
      const workedHours = workedMinutes / 60;

      // Simple calculation - can be enhanced with more complex overtime rules
      let regular = Math.min(8, workedHours);
      let overtime = Math.max(0, workedHours - 8);
      let dailyDouble = Math.max(0, workedHours - 12); // Double time after 12 hours
      overtime = Math.max(0, overtime - dailyDouble); // Adjust overtime

      setCalculatedHours({
        regular: Math.round(regular * 4) / 4, // Round to quarter hours
        overtime: Math.round(overtime * 4) / 4,
        dailyDoubleOvertime: Math.round(dailyDouble * 4) / 4,
        total: Math.round(workedHours * 4) / 4
      });
    } catch (error) {
      console.error('Error calculating hours:', error);
      setCalculatedHours({ regular: 0, overtime: 0, dailyDoubleOvertime: 0, total: 0 });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.isManualOverride) {
      if (!formData.timeIn) {
        newErrors.timeIn = 'Time in is required';
      }
      if (!formData.timeOut) {
        newErrors.timeOut = 'Time out is required';
      }
    } else {
      if (!formData.overrideReason.trim()) {
        newErrors.overrideReason = 'Override reason is required';
      }
      if (formData.manualRegular < 0 || formData.manualOvertime < 0 || formData.manualDailyDouble < 0) {
        newErrors.manualHours = 'Hours cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        user_id: userId,
        date: formData.date,
        clock_in_time: formData.isManualOverride ? null : formData.timeIn,
        clock_out_time: formData.isManualOverride ? null : formData.timeOut,
        break_duration: formData.isManualOverride ? 0 : formData.breakDuration,
        is_manual_override: formData.isManualOverride,
        override_reason: formData.isManualOverride ? formData.overrideReason : null
      };

      if (formData.isManualOverride) {
        // Use manual values
        entryData.regular_hours = formData.manualRegular;
        entryData.overtime_hours = formData.manualOvertime;
        entryData.daily_double_overtime = formData.manualDailyDouble;
        entryData.hours_worked = formData.manualRegular + formData.manualOvertime + formData.manualDailyDouble;
      } else {
        // Use calculated values
        entryData.regular_hours = calculatedHours.regular;
        entryData.overtime_hours = calculatedHours.overtime;
        entryData.daily_double_overtime = calculatedHours.dailyDoubleOvertime;
        entryData.hours_worked = calculatedHours.total;
      }

      let result;
      if (entry) {
        // Update existing entry
        result = await supabaseApi.updateTimesheet(entry.id, entryData);
      } else {
        // Create new entry
        result = await supabaseApi.createTimesheet(entryData);
      }

      console.log('✅ TIMESHEET ENTRY SAVED:', result);

      if (onSave) {
        onSave(result);
      }
      
      handleClose();
    } catch (error) {
      console.error('❌ SAVE ERROR:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      timeIn: '',
      timeOut: '',
      breakDuration: 0,
      isManualOverride: false,
      overrideReason: '',
      manualRegular: 0,
      manualOvertime: 0,
      manualDailyDouble: 0
    });
    setCalculatedHours({ regular: 0, overtime: 0, dailyDoubleOvertime: 0, total: 0 });
    setErrors({});
    setLoading(false);
    if (onClose) {
      onClose();
    }
  };

  const formatHours = (hours) => {
    return parseFloat(hours || 0).toFixed(2);
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
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            {entry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <form onSubmit={handleSubmit}>
            {/* Employee Type Display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#F0F9FF',
              borderRadius: '8px',
              border: '1px solid #0EA5E9'
            }}>
              <div style={{
                padding: '4px 8px',
                backgroundColor: '#0EA5E9',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                FULL TIME
              </div>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>
                OT: Weekly (40+ hours)
              </span>
            </div>

            {/* Date Field */}
            <div style={{ marginBottom: '20px' }}>
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
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF'
                }}
              />
              {errors.date && (
                <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.date}
                </p>
              )}
            </div>

            {/* Manual Override Toggle */}
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.isManualOverride}
                  onChange={(e) => handleInputChange('isManualOverride', e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px'
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Manual Override
                </span>
              </label>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: '4px 0 0 24px'
              }}>
                Enable to manually enter hours instead of calculating from time in/out
              </p>
            </div>

            {!formData.isManualOverride ? (
              /* Automatic Calculation Mode */
              <>
                {/* Time In/Out Fields */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Time In *
                    </label>
                    <input
                      type="time"
                      value={formData.timeIn}
                      onChange={(e) => handleInputChange('timeIn', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${errors.timeIn ? '#EF4444' : '#D1D5DB'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {errors.timeIn && (
                      <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                        {errors.timeIn}
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
                      Time Out *
                    </label>
                    <input
                      type="time"
                      value={formData.timeOut}
                      onChange={(e) => handleInputChange('timeOut', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${errors.timeOut ? '#EF4444' : '#D1D5DB'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {errors.timeOut && (
                      <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                        {errors.timeOut}
                      </p>
                    )}
                  </div>
                </div>

                {/* Break Duration */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Break Duration (hours)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="8"
                    value={formData.breakDuration}
                    onChange={(e) => handleInputChange('breakDuration', parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Calculated Hours Display */}
                <div style={{
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #0EA5E9',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0C4A6E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🧮 Calculated Hours
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>Regular</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {formatHours(calculatedHours.regular)}h
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>Overtime</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#DC2626' }}>
                        {formatHours(calculatedHours.overtime)}h
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>Daily 2x</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#DC2626' }}>
                        {formatHours(calculatedHours.dailyDoubleOvertime)}h
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>Total</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {formatHours(calculatedHours.total)}h
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Manual Override Mode */
              <>
                {/* Override Reason */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Override Reason *
                  </label>
                  <textarea
                    value={formData.overrideReason}
                    onChange={(e) => handleInputChange('overrideReason', e.target.value)}
                    placeholder="Explain why manual override is needed..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${errors.overrideReason ? '#EF4444' : '#D1D5DB'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  {errors.overrideReason && (
                    <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                      {errors.overrideReason}
                    </p>
                  )}
                </div>

                {/* Manual Hours Input */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Regular Hours
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      value={formData.manualRegular}
                      onChange={(e) => handleInputChange('manualRegular', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Overtime Hours
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      value={formData.manualOvertime}
                      onChange={(e) => handleInputChange('manualOvertime', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Daily Double Hours
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      value={formData.manualDailyDouble}
                      onChange={(e) => handleInputChange('manualDailyDouble', parseFloat(e.target.value) || 0)}
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

                {/* Manual Total Display */}
                <div style={{
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#92400E'
                  }}>
                    Total Manual Hours: {formatHours(formData.manualRegular + formData.manualOvertime + formData.manualDailyDouble)}h
                  </div>
                </div>
              </>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #EF4444',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#DC2626', fontSize: '14px', margin: 0 }}>
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #E5E7EB'
            }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: loading ? '#9CA3AF' : '#374151',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #FFFFFF',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                )}
                {loading ? 'Saving...' : (entry ? 'Update Entry' : 'Create Entry')}
              </button>
            </div>
          </form>
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
  );
};

export default TimesheetEntryModal;

