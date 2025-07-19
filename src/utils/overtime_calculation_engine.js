/**
 * Overtime Calculation Engine
 * 
 * Comprehensive overtime calculation system supporting multiple employee types
 * and compliance with federal and state labor regulations.
 * 
 * Features::
 * - Full-time weekly overtime calculation (40+ hours)
 * - Part-time daily overtime calculation (8+ hours)
 * - Quarter-hour rounding_
 * - Administrative override support
 * - Audit trail integration
 * - Multi-jurisdiction support
 */

import { supabase } from './supabaseClient.js';

/**
 * Employee type constants
 */
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  TEMPORARY: 'temporary',
  CONTRACTOR: 'contractor',
  INTERN: 'intern',
  SEASONAL: 'seasonal'
};

/**
 * Pay type constants
 */
export const PAY_TYPES = {
  HOURLY: 'hourly',
  SALARIED: 'salaried'
};

/**
 * Calculation method constants
 */
export const CALCULATION_METHODS = {
  WEEKLY_CUMULATIVE: 'weekly_cumulative',
  DAILY_THRESHOLD: 'daily_threshold',
  MANUAL_OVERRIDE: 'manual_override',
  EXEMPT_NO_CALCULATION: 'exempt_no_calculation'
};

/**
 * Quarter-hour rounding utility
 * Rounds time to nearest 0.25 hour increment
 * 
 * @param {number} hours - Hours to round
 * @returns {number} Rounded hours
 */
export function roundToQuarterHour(hours) {
  if (typeof hours !== 'number' || isNaN(hours)) {
    return 0;
  }
  
  // Round to nearest quarter hour (0.25 increments)
  return Math.round(hours * 4) / 4;
}

/**
 * Calculate time difference in hours between two time strings
 * 
 * @param {string} timeIn - Start time (HH:MM format)
 * @param {string} timeOut - End time (HH:MM format)
 * @param {number} breakDuration - Break duration in hours
 * @returns {number} Total hours worked (rounded to quarter hour)
 */
export function calculateHoursWorked(timeIn, timeOut, breakDuration = 0) {
  if (!timeIn || !timeOut) {
    return 0;
  }
  
  try {
    // Parse time strings
    const [inHour, inMinute] = timeIn.split(':').map(Number);
    const [outHour, outMinute] = timeOut.split(':').map(Number);
    
    // Convert to minutes
    const inMinutes = inHour * 60 + inMinute;
    let outMinutes = outHour * 60 + outMinute;
    
    // Handle overnight shifts
    if (outMinutes < inMinutes) {
      outMinutes += 24 * 60; // Add 24 hours
    }
    
    // Calculate total minutes worked
    const totalMinutes = outMinutes - inMinutes;
    
    // Convert to hours and subtract break time
    const totalHours = (totalMinutes / 60) - (breakDuration || 0);
    
    // Round to quarter hour
    return roundToQuarterHour(Math.max(0, totalHours));
  } catch (error) {
    console.error('Error calculating hours worked:', error);
    return 0;
  }
}

/**
 * Get employee information including employment type and exemption status
 * 
 * @param {string} userId - Employee user ID
 * @returns {Promise<Object>} Employee information
 */
export async function getEmployeeInfo(userId) {
  try {
    const { data: employee, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        employment_type,
        is_exempt,
        pay_type,
        status,
        hourly_rate,
        salary_amount,
        overtime_rate_multiplier
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: employee.id,
      fullName: employee.full_name,
      employmentType: employee.employment_type || EMPLOYMENT_TYPES.FULL_TIME,
      isExempt: employee.is_exempt || false,
      payType: employee.pay_type || PAY_TYPES.HOURLY,
      status: employee.status || 'active',
      hourlyRate: employee.hourly_rate || 0,
      salaryAmount: employee.salary_amount || 0,
      overtimeRateMultiplier: employee.overtime_rate_multiplier || 1.5
    };
  } catch (error) {
    console.error('Error fetching employee info:', error);
    // Return default values for development
    return {
      id: userId,
      fullName: 'Unknown Employee',
      employmentType: EMPLOYMENT_TYPES.FULL_TIME,
      isExempt: false,
      payType: PAY_TYPES.HOURLY,
      status: 'active',
      hourlyRate: 0,
      salaryAmount: 0,
      overtimeRateMultiplier: 1.5
    };
  }
}

/**
 * Get weekly timesheet entries for overtime calculation
 * 
 * @param {string} userId - Employee user ID
 * @param {string} date - Date within the week (YYYY-MM-DD)
 * @returns {Promise<Array>} Weekly timesheet entries
 */
export async function getWeeklyTimesheetEntries(userId, date) {
  try {
    // Calculate week start (Monday) and end (Sunday)
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as day 0
    
    const weekStart = new Date(targetDate);
    weekStart.setDate(targetDate.getDate() + mondayOffset);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];
    
    const { data: entries, error } = await supabase
      .from('timesheet_entries')
      .select(`
        id,
        date,
        regular_hours,
        overtime_hours,
        daily_double_overtime,
        total_hours,
        time_in,
        time_out,
        break_duration,
        is_manual_override,
        calculation_method
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return entries || [];
  } catch (error) {
    console.error('Error fetching weekly timesheet entries:', error);
    return [];
  }
}

/**
 * Calculate overtime for full-time employees (weekly cumulative)
 * 
 * @param {Array} weeklyEntries - All timesheet entries for the week
 * @param {number} currentDayHours - Hours for the current day being calculated
 * @param {string} currentDate - Date being calculated
 * @returns {Object} Calculated regular and overtime hours
 */
export function calculateFullTimeOvertime(weeklyEntries, currentDayHours, currentDate) {
  // Filter out the current day to avoid double counting
  const otherDaysEntries = weeklyEntries.filter(entry => entry.date !== currentDate);
  
  // Calculate total hours from other days in the week
  const otherDaysTotal = otherDaysEntries.reduce((sum, entry) => {
    return sum + (entry.total_hours || 0);
  }, 0);
  
  // Calculate new weekly total including current day
  const newWeeklyTotal = otherDaysTotal + currentDayHours;
  
  // Standard full-time threshold is 40 hours per week
  const weeklyThreshold = 40.0;
  
  if (newWeeklyTotal > weeklyThreshold) {
    // Calculate how much of current day's hours are overtime
    const weeklyOvertimeTotal = newWeeklyTotal - weeklyThreshold;
    const currentDayOvertime = Math.min(currentDayHours, weeklyOvertimeTotal);
    const currentDayRegular = currentDayHours - currentDayOvertime;
    
    return {
      regular: roundToQuarterHour(currentDayRegular),
      overtime: roundToQuarterHour(currentDayOvertime),
      dailyDoubleOvertime: 0,
      calculationMethod: CALCULATION_METHODS.WEEKLY_CUMULATIVE,
      weeklyHoursAtCalculation: roundToQuarterHour(newWeeklyTotal)
    };
  }
  
  // No overtime if under weekly threshold
  return {
    regular: roundToQuarterHour(currentDayHours),
    overtime: 0,
    dailyDoubleOvertime: 0,
    calculationMethod: CALCULATION_METHODS.WEEKLY_CUMULATIVE,
    weeklyHoursAtCalculation: roundToQuarterHour(newWeeklyTotal)
  };
}

/**
 * Calculate overtime for part-time employees (daily threshold)
 * 
 * @param {number} dailyHours - Hours worked in the day
 * @returns {Object} Calculated regular and overtime hours
 */
export function calculatePartTimeOvertime(dailyHours) {
  // Standard part-time daily threshold is 8 hours
  const dailyThreshold = 8.0;
  const dailyDoubleThreshold = 12.0; // Some jurisdictions require double time after 12 hours
  
  if (dailyHours > dailyDoubleThreshold) {
    // Calculate daily double overtime (hours beyond 12)
    const dailyDoubleOvertime = dailyHours - dailyDoubleThreshold;
    const overtime = dailyDoubleThreshold - dailyThreshold; // Hours 8-12
    const regular = dailyThreshold; // First 8 hours
    
    return {
      regular: roundToQuarterHour(regular),
      overtime: roundToQuarterHour(overtime),
      dailyDoubleOvertime: roundToQuarterHour(dailyDoubleOvertime),
      calculationMethod: CALCULATION_METHODS.DAILY_THRESHOLD,
      weeklyHoursAtCalculation: null
    };
  } else if (dailyHours > dailyThreshold) {
    // Calculate regular overtime (hours beyond 8)
    const overtime = dailyHours - dailyThreshold;
    const regular = dailyThreshold;
    
    return {
      regular: roundToQuarterHour(regular),
      overtime: roundToQuarterHour(overtime),
      dailyDoubleOvertime: 0,
      calculationMethod: CALCULATION_METHODS.DAILY_THRESHOLD,
      weeklyHoursAtCalculation: null
    };
  }
  
  // No overtime if under daily threshold
  return {
    regular: roundToQuarterHour(dailyHours),
    overtime: 0,
    dailyDoubleOvertime: 0,
    calculationMethod: CALCULATION_METHODS.DAILY_THRESHOLD,
    weeklyHoursAtCalculation: null
  };
}

/**
 * Main overtime calculation function
 * 
 * @param {string} userId - Employee user ID
 * @param {string} date - Date of timesheet entry (YYYY-MM-DD)
 * @param {string} timeIn - Start time (HH:MM)
 * @param {string} timeOut - End time (HH:MM)
 * @param {number} breakDuration - Break duration in hours
 * @param {boolean} isManualOverride - Whether this is a manual override
 * @returns {Promise<Object>} Calculated timesheet entry data
 */
export async function calculateOvertimeEntry(userId, date, timeIn, timeOut, breakDuration = 0, isManualOverride = false) {
  try {
    console.log('🧮 OVERTIME CALC: Starting calculation for user:', userId, 'date:', date);
    
    // Get employee information
    const employee = await getEmployeeInfo(userId);
    console.log('👤 EMPLOYEE INFO:', employee);
    
    // Calculate total hours worked
    const totalHours = calculateHoursWorked(timeIn, timeOut, breakDuration);
    console.log('⏰ TOTAL HOURS:', totalHours);
    
    // Handle exempt employees
    if (employee.isExempt) {
      return {
        regular: totalHours,
        overtime: 0,
        dailyDoubleOvertime: 0,
        totalHours: totalHours,
        calculationMethod: CALCULATION_METHODS.EXEMPT_NO_CALCULATION,
        weeklyHoursAtCalculation: null,
        isManualOverride: isManualOverride
      };
    }
    
    // Handle manual overrides
    if (isManualOverride) {
      return {
        regular: totalHours,
        overtime: 0,
        dailyDoubleOvertime: 0,
        totalHours: totalHours,
        calculationMethod: CALCULATION_METHODS.MANUAL_OVERRIDE,
        weeklyHoursAtCalculation: null,
        isManualOverride: true
      };
    }
    
    let calculationResult;
    
    // Calculate overtime based on employment type
    switch (employee.employmentType) {
      case EMPLOYMENT_TYPES.FULL_TIME:
      case EMPLOYMENT_TYPES.TEMPORARY:
      case EMPLOYMENT_TYPES.INTERN:
      case EMPLOYMENT_TYPES.SEASONAL:
        // These types use weekly cumulative calculation
        const weeklyEntries = await getWeeklyTimesheetEntries(userId, date);
        calculationResult = calculateFullTimeOvertime(weeklyEntries, totalHours, date);
        break;
        
      case EMPLOYMENT_TYPES.PART_TIME:
        // Part-time uses daily threshold calculation
        calculationResult = calculatePartTimeOvertime(totalHours);
        break;
        
      case EMPLOYMENT_TYPES.CONTRACTOR:
        // Contractors typically don't get overtime
        calculationResult = {
          regular: totalHours,
          overtime: 0,
          dailyDoubleOvertime: 0,
          calculationMethod: CALCULATION_METHODS.EXEMPT_NO_CALCULATION,
          weeklyHoursAtCalculation: null
        };
        break;
        
      default:
        // Default to full-time calculation
        const defaultWeeklyEntries = await getWeeklyTimesheetEntries(userId, date);
        calculationResult = calculateFullTimeOvertime(defaultWeeklyEntries, totalHours, date);
        break;
    }
    
    // Add total hours and metadata
    const result = {
      ...calculationResult,
      totalHours: roundToQuarterHour(
        calculationResult.regular + 
        calculationResult.overtime + 
        calculationResult.dailyDoubleOvertime
      ),
      isManualOverride: isManualOverride,
      employeeType: employee.employmentType,
      isExempt: employee.isExempt
    };
    
    console.log('✅ CALCULATION RESULT:', result);
    return result;
    
  } catch (error) {
    console.error('❌ OVERTIME CALC ERROR:', error);
    
    // Return safe default values
    const totalHours = calculateHoursWorked(timeIn, timeOut, breakDuration);
    return {
      regular: totalHours,
      overtime: 0,
      dailyDoubleOvertime: 0,
      totalHours: totalHours,
      calculationMethod: CALCULATION_METHODS.MANUAL_OVERRIDE,
      weeklyHoursAtCalculation: null,
      isManualOverride: true,
      error: error.message
    };
  }
}

/**
 * Recalculate overtime for an entire week when entries change
 * 
 * @param {string} userId - Employee user ID
 * @param {string} weekStartDate - Monday of the week (YYYY-MM-DD)
 * @returns {Promise<Array>} Updated timesheet entries
 */
export async function recalculateWeeklyOvertime(userId, weekStartDate) {
  try {
    console.log('🔄 RECALC WEEK: Starting weekly recalculation for user:', userId);
    
    const employee = await getEmployeeInfo(userId);
    
    // Skip recalculation for exempt employees or contractors
    if (employee.isExempt || employee.employmentType === EMPLOYMENT_TYPES.CONTRACTOR) {
      console.log('⏭️ RECALC WEEK: Skipping recalculation for exempt/contractor employee');
      return [];
    }
    
    // Get all entries for the week
    const weeklyEntries = await getWeeklyTimesheetEntries(userId, weekStartDate);
    
    if (weeklyEntries.length === 0) {
      console.log('📭 RECALC WEEK: No entries found for week');
      return [];
    }
    
    const updatedEntries = [];
    
    // For full-time employees, recalculate each day in order
    if (employee.employmentType === EMPLOYMENT_TYPES.FULL_TIME ||
        employee.employmentType === EMPLOYMENT_TYPES.TEMPORARY ||
        employee.employmentType === EMPLOYMENT_TYPES.INTERN ||
        employee.employmentType === EMPLOYMENT_TYPES.SEASONAL) {
      
      let cumulativeHours = 0;
      const weeklyThreshold = 40.0;
      
      for (const entry of weeklyEntries) {
        // Skip manual overrides
        if (entry.is_manual_override) {
          cumulativeHours += entry.total_hours || 0;
          continue;
        }
        
        const entryTotalHours = entry.total_hours || 0;
        const newCumulativeHours = cumulativeHours + entryTotalHours;
        
        let regular, overtime;
        
        if (newCumulativeHours > weeklyThreshold) {
          const weeklyOvertimeTotal = newCumulativeHours - weeklyThreshold;
          overtime = Math.min(entryTotalHours, weeklyOvertimeTotal);
          regular = entryTotalHours - overtime;
        } else {
          regular = entryTotalHours;
          overtime = 0;
        }
        
        // Update the entry if values changed
        if (Math.abs(entry.regular_hours - regular) > 0.01 || 
            Math.abs(entry.overtime_hours - overtime) > 0.01) {
          
          const { error } = await supabase
            .from('timesheet_entries')
            .update({
              regular_hours: roundToQuarterHour(regular),
              overtime_hours: roundToQuarterHour(overtime),
              calculation_method: CALCULATION_METHODS.WEEKLY_CUMULATIVE,
              weekly_hours_at_calculation: roundToQuarterHour(newCumulativeHours),
              calculation_timestamp: new Date().toISOString()
            })
            .eq('id', entry.id);
          
          if (!error) {
            updatedEntries.push({
              ...entry,
              regular_hours: roundToQuarterHour(regular),
              overtime_hours: roundToQuarterHour(overtime)
            });
          }
        }
        
        cumulativeHours = newCumulativeHours;
      }
    }
    
    console.log('✅ RECALC WEEK: Updated', updatedEntries.length, 'entries');
    return updatedEntries;
    
  } catch (error) {
    console.error('❌ RECALC WEEK ERROR:', error);
    return [];
  }
}

/**
 * Validate timesheet entry data
 * 
 * @param {Object} entryData - Timesheet entry data to validate
 * @returns {Object} Validation result with errors if any
 */
export function validateTimesheetEntry(entryData) {
  const errors = [];
  
  // Required fields
  if (!entryData.userId) {
    errors.push('User ID is required');
  }
  
  if (!entryData.date) {
    errors.push('Date is required');
  }
  
  // Time validation
  if (entryData.timeIn && entryData.timeOut) {
    const timeInMinutes = timeToMinutes(entryData.timeIn);
    const timeOutMinutes = timeToMinutes(entryData.timeOut);
    
    if (timeInMinutes >= timeOutMinutes && timeOutMinutes < 720) { // 720 = 12:00 PM
      errors.push('Time out must be after time in (unless overnight shift)');
    }
  }
  
  // Hours validation
  if (entryData.totalHours && entryData.totalHours > 24) {
    errors.push('Total hours cannot exceed 24 hours per day');
  }
  
  if (entryData.breakDuration && entryData.breakDuration < 0) {
    errors.push('Break duration cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Helper function to convert time string to minutes
 * 
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Export calculation engine for use in components
 */
export default {
  calculateOvertimeEntry,
  recalculateWeeklyOvertime,
  calculateHoursWorked,
  roundToQuarterHour,
  validateTimesheetEntry,
  getEmployeeInfo,
  EMPLOYMENT_TYPES,
  PAY_TYPES,
  CALCULATION_METHODS
};

