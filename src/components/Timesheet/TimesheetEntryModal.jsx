import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import OvertimeCalculationEngine from '../utils/overtime_calculation_engine.js';

const TimesheetEntryForm = ({ 
  entry = null, 
  onSave, 
  onCancel, 
  userId,
  defaultDate = null 
}) => {
  const [formData, setFormData] = useState({
    date: defaultDate || new Date().toISOString().split('T')[0],
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
    total: 0,
    calculationMethod: '',
    weeklyHoursAtCalculation: null
  });

  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Load employee info and existing entry data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load employee information
        const empInfo = await OvertimeCalculationEngine.getEmployeeInfo(userId);
        setEmployeeInfo(empInfo);

        // If editing existing entry, populate form
        if (entry) {
          setFormData({
            date: entry.date,
            timeIn: entry.time_in || '',
            timeOut: entry.time_out || '',
            breakDuration: parseFloat(entry.break_duration) || 0,
            isManualOverride: entry.is_manual_override || false,
            overrideReason: entry.override_reason || '',
            manualRegular: parseFloat(entry.regular_hours) || 0,
            manualOvertime: parseFloat(entry.overtime_hours) || 0,
            manualDailyDouble: parseFloat(entry.daily_double_overtime) || 0
          });

          // Set calculated hours from existing entry
          setCalculatedHours({
            regular: parseFloat(entry.regular_hours) || 0,
            overtime: parseFloat(entry.overtime_hours) || 0,
            dailyDoubleOvertime: parseFloat(entry.daily_double_overtime) || 0,
            total: parseFloat(entry.total_hours) || 0,
            calculationMethod: entry.calculation_method || '',
            weeklyHoursAtCalculation: entry.weekly_hours_at_calculation
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId, entry]);

  // Real-time calculation when time fields change
  useEffect(() => {
    if (formData.timeIn && formData.timeOut && !formData.isManualOverride) {
      calculateHours();
    }
  }, [formData.timeIn, formData.timeOut, formData.breakDuration, formData.date, formData.isManualOverride]);

  const calculateHours = async () => {
    if (!formData.timeIn || !formData.timeOut || formData.isManualOverride) {
      return;
    }

    setIsCalculating(true);
    try {
      const result = await OvertimeCalculationEngine.calculateOvertimeEntry(
        userId,
        formData.date,
        formData.timeIn,
        formData.timeOut,
        formData.breakDuration,
        formData.isManualOverride
      );

      setCalculatedHours(result);
      console.log('🧮 REAL-TIME CALCULATION:', result);
    } catch (error) {
      console.error('❌ CALCULATION ERROR:', error);
      setCalculatedHours({
        regular: 0,
        overtime: 0,
        dailyDoubleOvertime: 0,
        total: 0,
        calculationMethod: 'error',
        weeklyHoursAtCalculation: null
      });
    } finally {
      setIsCalculating(false);
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

  const handleManualOverrideToggle = (enabled) => {
    setFormData(prev => ({
      ...prev,
      isManualOverride: enabled,
      overrideReason: enabled ? prev.overrideReason : ''
    }));

    if (!enabled) {
      // Recalculate when turning off manual override
      calculateHours();
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

      // Validate time range
      if (formData.timeIn && formData.timeOut) {
        const validation = OvertimeCalculationEngine.validateTimesheetEntry({
          userId,
          date: formData.date,
          timeIn: formData.timeIn,
          timeOut: formData.timeOut,
          totalHours: calculatedHours.total,
          breakDuration: formData.breakDuration
        });

        if (!validation.isValid) {
          validation.errors.forEach(error => {
            if (error.includes('Time out')) {
              newErrors.timeOut = error;
            } else if (error.includes('exceed 24 hours')) {
              newErrors.timeOut = error;
            } else if (error.includes('negative')) {
              newErrors.breakDuration = error;
            }
          });
        }
      }
    } else {
      // Manual override validation
      if (!formData.overrideReason.trim()) {
        newErrors.overrideReason = 'Override reason is required';
      }

      const totalManual = formData.manualRegular + formData.manualOvertime + formData.manualDailyDouble;
      if (totalManual <= 0) {
        newErrors.manualRegular = 'Total hours must be greater than 0';
      }
      if (totalManual > 24) {
        newErrors.manualRegular = 'Total hours cannot exceed 24';
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
        time_in: formData.isManualOverride ? null : formData.timeIn,
        time_out: formData.isManualOverride ? null : formData.timeOut,
        break_duration: formData.isManualOverride ? 0 : formData.breakDuration,
        is_manual_override: formData.isManualOverride,
        override_reason: formData.isManualOverride ? formData.overrideReason : null,
        calculation_method: formData.isManualOverride ? 'manual_override' : calculatedHours.calculationMethod,
        weekly_hours_at_calculation: calculatedHours.weeklyHoursAtCalculation
      };

      if (formData.isManualOverride) {
        // Use manual values
        entryData.regular_hours = OvertimeCalculationEngine.roundToQuarterHour(formData.manualRegular);
        entryData.overtime_hours = OvertimeCalculationEngine.roundToQuarterHour(formData.manualOvertime);
        entryData.daily_double_overtime = OvertimeCalculationEngine.roundToQuarterHour(formData.manualDailyDouble);
        entryData.total_hours = OvertimeCalculationEngine.roundToQuarterHour(
          formData.manualRegular + formData.manualOvertime + formData.manualDailyDouble
        );
      } else {
        // Use calculated values
        entryData.regular_hours = calculatedHours.regular;
        entryData.overtime_hours = calculatedHours.overtime;
        entryData.daily_double_overtime = calculatedHours.dailyDoubleOvertime;
        entryData.total_hours = calculatedHours.total;
      }

      let result;
      if (entry) {
        // Update existing entry
        result = await supabase
          .from('timesheet_entries')
          .update(entryData)
          .eq('id', entry.id)
          .select()
          .single();
      } else {
        // Create new entry
        result = await supabase
          .from('timesheet_entries')
          .insert(entryData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      console.log('✅ TIMESHEET ENTRY SAVED:', result.data);

      // Recalculate weekly overtime if this affects other entries
      if (!formData.isManualOverride && employeeInfo?.employmentType === 'full_time') {
        await OvertimeCalculationEngine.recalculateWeeklyOvertime(userId, formData.date);
      }

      if (onSave) {
        onSave(result.data);
      }
    } catch (error) {
      console.error('❌ SAVE ERROR:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM format
  };

  const formatHours = (hours) => {
    return parseFloat(hours || 0).toFixed(2);
  };

  const getCalculationMethodDisplay = (method) => {
    switch (method) {
      case 'weekly_cumulative':
        return 'Weekly Cumulative (40+ hours)';
      case 'daily_threshold':
        return 'Daily Threshold (8+ hours)';
      case 'manual_override':
        return 'Manual Override';
      case 'exempt_no_calculation':
        return 'Exempt Employee';
      default:
        return 'Unknown';
    }
  };

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
        padding: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827'
          }}>
            {entry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#6B7280',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Employee Info */}
        {employeeInfo && (
          <div style={{
            backgroundColor: '#F9FAFB',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6B7280'
            }}>
              Employee Type:
            </span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: employeeInfo.isExempt ? '#FEF3C7' : '#DBEAFE',
              color: employeeInfo.isExempt ? '#92400E' : '#1E40AF',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {employeeInfo.employmentType.replace('_', ' ').toUpperCase()}
              {employeeInfo.isExempt && ' (EXEMPT)'}
            </span>
            <span style={{
              fontSize: '12px',
              color: '#6B7280'
            }}>
              OT: {employeeInfo.employmentType === 'part_time' ? 'Daily (8+ hours)' : 'Weekly (40+ hours)'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                onChange={(e) => handleManualOverrideToggle(e.target.checked)}
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
                    value={formatTime(formData.timeIn)}
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
                    value={formatTime(formData.timeOut)}
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
                    border: `1px solid ${errors.breakDuration ? '#EF4444' : '#D1D5DB'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.breakDuration && (
                  <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {errors.breakDuration}
                  </p>
                )}
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
                  {isCalculating ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #0EA5E9',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      🧮 Calculated Hours
                    </>
                  )}
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  marginBottom: '12px'
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

                {calculatedHours.calculationMethod && (
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    borderTop: '1px solid #BAE6FD',
                    paddingTop: '8px'
                  }}>
                    Method: {getCalculationMethodDisplay(calculatedHours.calculationMethod)}
                    {calculatedHours.weeklyHoursAtCalculation && (
                      <span> • Weekly Total: {calculatedHours.weeklyHoursAtCalculation}h</span>
                    )}
                  </div>
                )}
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
                      border: `1px solid ${errors.manualRegular ? '#EF4444' : '#D1D5DB'}`,
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

              {errors.manualRegular && (
                <p style={{ color: '#EF4444', fontSize: '12px', margin: '0 0 16px 0' }}>
                  {errors.manualRegular}
                </p>
              )}

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
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isCalculating}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: loading || isCalculating ? '#9CA3AF' : '#374151',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading || isCalculating ? 'not-allowed' : 'pointer',
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

export default TimesheetEntryForm;

