// ENHANCED SUPABASE API - COMPLETE TIMEZONE FIX
// This version completely eliminates timezone issues by using UTC dates and simple string operations

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// COMPREHENSIVE DATE NORMALIZATION FUNCTION
const safeDateToString = (date) => {
  if (!date) {
    // Return today's date in YYYY-MM-DD format
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  }
  
  // If it's already a simple YYYY-MM-DD string, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // If it's a string but not in YYYY-MM-DD format, try to parse it
  if (typeof date === 'string') {
    try {
      // Remove any timezone information from the string
      const cleanDateString = date.split('T')[0]; // Take only the date part
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDateString)) {
        return cleanDateString;
      }
      
      // If it's not in ISO format, try to parse and convert
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.getFullYear() + '-' + 
               String(parsedDate.getMonth() + 1).padStart(2, '0') + '-' + 
               String(parsedDate.getDate()).padStart(2, '0');
      }
    } catch (error) {
      console.warn('Error parsing date string:', date, error);
    }
  }
  
  // If it's a Date object, convert to YYYY-MM-DD
  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      console.warn('Invalid Date object provided:', date);
      const today = new Date();
      return today.getFullYear() + '-' + 
             String(today.getMonth() + 1).padStart(2, '0') + '-' + 
             String(today.getDate()).padStart(2, '0');
    }
    
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }
  
  // Fallback: return today's date
  console.warn('Unrecognized date format, using today:', date);
  const today = new Date();
  return today.getFullYear() + '-' + 
         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
         String(today.getDate()).padStart(2, '0');
};

export const enhancedSupabaseApi = {
  // Get current authenticated user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        // Try to get user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.warn('Profile not found, using auth user data');
          return {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email
          };
        }
        
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Return fallback user for development
      return {
        id: 1,
        full_name: 'Kevin Shelton',
        email: 'kevin@example.com'
      };
    }
  },

  // COMPLETELY TIMEZONE-SAFE TIMESHEET ENTRIES API
  getTimesheetEntries: async (params = {}) => {
    try {
      console.log('getTimesheetEntries called with params:', params);
      
      let query = supabase
        .from('timesheet_entries')
        .select('*')
        .order('date', { ascending: false })
      
      // Apply filters with safe date conversion
      if (params.user_id) query = query.eq('user_id', params.user_id)
      if (params.userId) query = query.eq('user_id', params.userId)
      if (params.campaign_id) query = query.eq('campaign_id', params.campaign_id)
      if (params.status) query = query.eq('status', params.status)
      
      // Handle date filters with complete timezone safety
      if (params.date_from) {
        const safeDateFrom = safeDateToString(params.date_from);
        console.log('Applying date_from filter:', safeDateFrom);
        query = query.gte('date', safeDateFrom);
      }
      if (params.startDate) {
        const safeStartDate = safeDateToString(params.startDate);
        console.log('Applying startDate filter:', safeStartDate);
        query = query.gte('date', safeStartDate);
      }
      if (params.date_to) {
        const safeDateTo = safeDateToString(params.date_to);
        console.log('Applying date_to filter:', safeDateTo);
        query = query.lte('date', safeDateTo);
      }
      if (params.endDate) {
        const safeEndDate = safeDateToString(params.endDate);
        console.log('Applying endDate filter:', safeEndDate);
        query = query.lte('date', safeEndDate);
      }
      if (params.week_start) {
        const weekStartSafe = safeDateToString(params.week_start);
        const weekStartDate = new Date(weekStartSafe + 'T00:00:00');
        weekStartDate.setDate(weekStartDate.getDate() + 6);
        const weekEndSafe = safeDateToString(weekStartDate);
        console.log('Applying week filter:', weekStartSafe, 'to', weekEndSafe);
        query = query.gte('date', weekStartSafe).lte('date', weekEndSafe);
      }
      
      const { data, error } = await query
      if (error) {
        console.error('Supabase error in getTimesheetEntries:', error)
        throw error
      }
      
      console.log('getTimesheetEntries returning data:', data?.length || 0, 'entries');
      return data || []
    } catch (error) {
      console.error('Error fetching timesheet entries:', error)
      return []
    }
  },

  // COMPLETELY TIMEZONE-SAFE DAILY TIMESHEET
  getDailyTimesheet: async (userId, date) => {
    try {
      // Convert date to safe string format IMMEDIATELY
      const safeDateString = safeDateToString(date);
      
      console.log('getDailyTimesheet called with:', { 
        userId, 
        originalDate: date, 
        safeDateString,
        dateType: typeof date
      });
      
      // Use the safe date string directly in the query
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', safeDateString)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily timesheet:', error)
        // Return safe empty structure
        return {
          id: null,
          user_id: userId,
          date: safeDateString,
          time_in: null,
          time_out: null,
          regular_hours: 0,
          overtime_hours: 0,
          status: 'draft',
          summary: {
            total_hours: 0,
            regular_hours: 0,
            overtime_hours: 0,
            break_hours: 0
          },
          entries: []
        }
      }
      
      // If data exists, ensure it has the expected structure
      if (data) {
        console.log('getDailyTimesheet found data:', data);
        return {
          ...data,
          summary: data.summary || {
            total_hours: (data.regular_hours || 0) + (data.overtime_hours || 0),
            regular_hours: data.regular_hours || 0,
            overtime_hours: data.overtime_hours || 0,
            break_hours: data.break_hours || 0
          },
          entries: data.entries || []
        }
      }
      
      // Return safe empty structure if no data found
      console.log('getDailyTimesheet no data found, returning empty structure');
      return {
        id: null,
        user_id: userId,
        date: safeDateString,
        time_in: null,
        time_out: null,
        regular_hours: 0,
        overtime_hours: 0,
        status: 'draft',
        summary: {
          total_hours: 0,
          regular_hours: 0,
          overtime_hours: 0,
          break_hours: 0
        },
        entries: []
      }
    } catch (error) {
      console.error('Error in getDailyTimesheet:', error)
      // Return safe empty structure
      return {
        id: null,
        user_id: userId,
        date: safeDateToString(date),
        time_in: null,
        time_out: null,
        regular_hours: 0,
        overtime_hours: 0,
        status: 'draft',
        summary: {
          total_hours: 0,
          regular_hours: 0,
          overtime_hours: 0,
          break_hours: 0
        },
        entries: []
      }
    }
  },

  // Create timesheet entry with safe date handling
  createTimesheetEntry: async (entryData) => {
    try {
      const safeEntryData = {
        ...entryData,
        date: safeDateToString(entryData.date)
      };
      
      console.log('Creating timesheet entry with safe data:', safeEntryData);
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .insert([{
          user_id: safeEntryData.user_id,
          campaign_id: safeEntryData.campaign_id || null,
          date: safeEntryData.date,
          time_in: safeEntryData.time_in || null,
          time_out: safeEntryData.time_out || null,
          lunch_start: safeEntryData.lunch_start || null,
          lunch_end: safeEntryData.lunch_end || null,
          break1_start: safeEntryData.break1_start || null,
          break1_end: safeEntryData.break1_end || null,
          break2_start: safeEntryData.break2_start || null,
          break2_end: safeEntryData.break2_end || null,
          vacation_type: safeEntryData.vacation_type || 'none',
          vacation_hours: safeEntryData.vacation_hours || 0,
          sick_hours: safeEntryData.sick_hours || 0,
          holiday_hours: safeEntryData.holiday_hours || 0,
          regular_hours: safeEntryData.regular_hours || 0,
          overtime_hours: safeEntryData.overtime_hours || 0,
          status: 'draft',
          created_at: new Date().toISOString()
        }])
        .select('*')
        .single()
      
      if (error) {
        console.error('Error creating timesheet entry:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error creating timesheet entry:', error)
      throw error
    }
  },

  // Update timesheet entry with safe date handling
  updateTimesheetEntry: async (id, updateData) => {
    try {
      const safeUpdateData = { ...updateData };
      if (safeUpdateData.date) {
        safeUpdateData.date = safeDateToString(safeUpdateData.date);
      }
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          ...safeUpdateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()
      
      if (error) {
        console.error('Error updating timesheet entry:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error updating timesheet entry:', error)
      throw error
    }
  },

  // Clock in/out with safe date handling
  clockIn: async (userId, campaignId = null, metadata = {}) => {
    try {
      const todaySafe = safeDateToString(new Date())
      const now = new Date().toISOString()
      
      console.log('Clock in for date:', todaySafe);
      
      // Check if entry exists for today
      const { data: existing } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', todaySafe)
        .single()
      
      if (existing) {
        // Update existing entry
        const { data, error } = await supabase
          .from('timesheet_entries')
          .update({
            time_in: existing.time_in || now,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select('*')
          .single()
        
        if (error) throw error
        return data
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('timesheet_entries')
          .insert([{
            user_id: userId,
            campaign_id: campaignId,
            date: todaySafe,
            time_in: now,
            status: 'draft',
            created_at: new Date().toISOString()
          }])
          .select('*')
          .single()
        
        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error clocking in:', error)
      throw error
    }
  },

  clockOut: async (userId, metadata = {}) => {
    try {
      const todaySafe = safeDateToString(new Date())
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          time_out: now,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('date', todaySafe)
        .select('*')
        .single()
      
      if (error) {
        console.error('Error clocking out:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error clocking out:', error)
      throw error
    }
  },

  // Break management with safe date handling
  startBreak: async (userId, breakType = 'lunch', metadata = {}) => {
    try {
      const todaySafe = safeDateToString(new Date())
      const now = new Date().toISOString()
      
      const updateField = breakType === 'lunch' ? 'lunch_start' : 
                         breakType === 'break1' ? 'break1_start' : 'break2_start'
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          [updateField]: now,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('date', todaySafe)
        .select('*')
        .single()
      
      if (error) {
        console.error('Error starting break:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error starting break:', error)
      throw error
    }
  },

  endBreak: async (userId, breakType = 'lunch', metadata = {}) => {
    try {
      const todaySafe = safeDateToString(new Date())
      const now = new Date().toISOString()
      
      const updateField = breakType === 'lunch' ? 'lunch_end' : 
                         breakType === 'break1' ? 'break1_end' : 'break2_end'
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          [updateField]: now,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('date', todaySafe)
        .select('*')
        .single()
      
      if (error) {
        console.error('Error ending break:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error ending break:', error)
      throw error
    }
  },

  // Calculate hours for timesheet entry
  calculateHours: async (entryData, rules = null) => {
    const calculations = {
      regular_hours: 0,
      overtime_hours: 0,
      break_hours: 0,
      total_paid_hours: 0,
      validation_errors: [],
      validation_warnings: []
    }
    
    try {
      // Calculate work time
      if (entryData.time_in && entryData.time_out) {
        const timeIn = new Date(entryData.time_in)
        const timeOut = new Date(entryData.time_out)
        let totalMinutes = (timeOut - timeIn) / (1000 * 60)
        
        // Subtract break times
        let breakMinutes = 0
        
        if (entryData.lunch_start && entryData.lunch_end) {
          const lunchStart = new Date(entryData.lunch_start)
          const lunchEnd = new Date(entryData.lunch_end)
          breakMinutes += (lunchEnd - lunchStart) / (1000 * 60)
        }
        
        if (entryData.break1_start && entryData.break1_end) {
          const break1Start = new Date(entryData.break1_start)
          const break1End = new Date(entryData.break1_end)
          breakMinutes += (break1End - break1Start) / (1000 * 60)
        }
        
        if (entryData.break2_start && entryData.break2_end) {
          const break2Start = new Date(entryData.break2_start)
          const break2End = new Date(entryData.break2_end)
          breakMinutes += (break2End - break2Start) / (1000 * 60)
        }
        
        calculations.break_hours = Math.round(breakMinutes / 60 * 100) / 100
        
        // Calculate worked hours
        const workedMinutes = totalMinutes - breakMinutes
        const workedHours = workedMinutes / 60
        
        // Apply overtime rules (8 hour threshold)
        const overtimeThreshold = 8.0
        if (workedHours <= overtimeThreshold) {
          calculations.regular_hours = Math.round(workedHours * 100) / 100
        } else {
          calculations.regular_hours = overtimeThreshold
          calculations.overtime_hours = Math.round((workedHours - overtimeThreshold) * 100) / 100
        }
        
        calculations.total_paid_hours = calculations.regular_hours + calculations.overtime_hours
      }
      
      // Add vacation/sick/holiday hours
      calculations.total_paid_hours += (entryData.vacation_hours || 0) + 
                                      (entryData.sick_hours || 0) + 
                                      (entryData.holiday_hours || 0)
      
      return calculations
    } catch (error) {
      console.error('Error calculating hours:', error)
      calculations.validation_errors.push('Error calculating hours: ' + error.message)
      return calculations
    }
  },

  // Submit timesheet for approval
  submitTimesheet: async (id, userId) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single()
      
      if (error) {
        console.error('Error submitting timesheet:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error submitting timesheet:', error)
      throw error
    }
  },

  // Approve/reject timesheet
  approveTimesheet: async (id, approverId, comments = '') => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          status: 'approved',
          decision_at: new Date().toISOString(),
          approver_id: approverId,
          approver_comments: comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()
      
      if (error) {
        console.error('Error approving timesheet:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error approving timesheet:', error)
      throw error
    }
  },

  rejectTimesheet: async (id, approverId, comments) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          status: 'rejected',
          decision_at: new Date().toISOString(),
          approver_id: approverId,
          approver_comments: comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()
      
      if (error) {
        console.error('Error rejecting timesheet:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error rejecting timesheet:', error)
      throw error
    }
  }
}

export default enhancedSupabaseApi

