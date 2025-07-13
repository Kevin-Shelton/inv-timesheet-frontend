// ENHANCED SUPABASE API - TIMEZONE FIXED VERSION
// Fixed to handle timezone issues and return proper data structures

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

// Helper function to normalize date to YYYY-MM-DD format
const normalizeDate = (date) => {
  if (!date) return null;
  
  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // If it's a Date object or other format, convert to YYYY-MM-DD
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided:', date);
      return new Date().toISOString().split('T')[0]; // Return today as fallback
    }
    
    // Convert to YYYY-MM-DD format in local timezone
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error normalizing date:', error);
    return new Date().toISOString().split('T')[0]; // Return today as fallback
  }
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

  // SIMPLIFIED TIMESHEET ENTRIES API - NO COMPLEX JOINS
  getTimesheetEntries: async (params = {}) => {
    try {
      let query = supabase
        .from('timesheet_entries')
        .select('*')
        .order('date', { ascending: false })
      
      // Apply filters with date normalization
      if (params.user_id) query = query.eq('user_id', params.user_id)
      if (params.userId) query = query.eq('user_id', params.userId) // Alternative param name
      if (params.campaign_id) query = query.eq('campaign_id', params.campaign_id)
      if (params.status) query = query.eq('status', params.status)
      if (params.date_from) query = query.gte('date', normalizeDate(params.date_from))
      if (params.startDate) query = query.gte('date', normalizeDate(params.startDate)) // Alternative param name
      if (params.date_to) query = query.lte('date', normalizeDate(params.date_to))
      if (params.endDate) query = query.lte('date', normalizeDate(params.endDate)) // Alternative param name
      if (params.week_start) {
        const weekStartNormalized = normalizeDate(params.week_start);
        const weekEnd = new Date(weekStartNormalized);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const weekEndNormalized = normalizeDate(weekEnd);
        query = query.gte('date', weekStartNormalized).lte('date', weekEndNormalized);
      }
      
      const { data, error } = await query
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching timesheet entries:', error)
      // Return empty array instead of throwing to prevent UI crashes
      return []
    }
  },

  // Get daily timesheet - FIXED to handle timezone issues
  getDailyTimesheet: async (userId, date) => {
    try {
      // Normalize the date to prevent timezone issues
      const normalizedDate = normalizeDate(date);
      
      console.log('getDailyTimesheet called with:', { userId, originalDate: date, normalizedDate });
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', normalizedDate)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily timesheet:', error)
        // Return empty structure instead of null to prevent crashes
        return {
          id: null,
          user_id: userId,
          date: normalizedDate,
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
      
      // Return empty structure if no data found
      return {
        id: null,
        user_id: userId,
        date: normalizedDate,
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
      console.error('Error fetching daily timesheet:', error)
      // Return empty structure instead of null to prevent crashes
      return {
        id: null,
        user_id: userId,
        date: normalizeDate(date),
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

  // Create timesheet entry - simplified with date normalization
  createTimesheetEntry: async (entryData) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .insert([{
          user_id: entryData.user_id,
          campaign_id: entryData.campaign_id || null,
          date: normalizeDate(entryData.date),
          time_in: entryData.time_in || null,
          time_out: entryData.time_out || null,
          lunch_start: entryData.lunch_start || null,
          lunch_end: entryData.lunch_end || null,
          break1_start: entryData.break1_start || null,
          break1_end: entryData.break1_end || null,
          break2_start: entryData.break2_start || null,
          break2_end: entryData.break2_end || null,
          vacation_type: entryData.vacation_type || 'none',
          vacation_hours: entryData.vacation_hours || 0,
          sick_hours: entryData.sick_hours || 0,
          holiday_hours: entryData.holiday_hours || 0,
          regular_hours: entryData.regular_hours || 0,
          overtime_hours: entryData.overtime_hours || 0,
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

  // Update timesheet entry
  updateTimesheetEntry: async (id, updateData) => {
    try {
      // Normalize date if it's being updated
      const normalizedUpdateData = { ...updateData };
      if (normalizedUpdateData.date) {
        normalizedUpdateData.date = normalizeDate(normalizedUpdateData.date);
      }
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          ...normalizedUpdateData,
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

  // Clock in/out functionality - simplified with date normalization
  clockIn: async (userId, campaignId = null, metadata = {}) => {
    try {
      const today = normalizeDate(new Date())
      const now = new Date().toISOString()
      
      // Check if entry exists for today
      const { data: existing } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
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
            date: today,
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
      const today = normalizeDate(new Date())
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          time_out: now,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('date', today)
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

  // Break management - simplified with date normalization
  startBreak: async (userId, breakType = 'lunch', metadata = {}) => {
    try {
      const today = normalizeDate(new Date())
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
        .eq('date', today)
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
      const today = normalizeDate(new Date())
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
        .eq('date', today)
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

  // Calculate hours for timesheet entry - simplified
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

