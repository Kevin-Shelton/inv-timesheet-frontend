// ENHANCED SUPABASE API - COMPREHENSIVE TIMESHEET FUNCTIONALITY
// Updated to use full database schema with all timesheet features

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

export const enhancedSupabaseApi = {
  // MISSING FUNCTION - Get current authenticated user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        // Get user profile from users table
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

  // COMPREHENSIVE TIMESHEET ENTRIES API
  
  // Get timesheet entries with full details
  getTimesheetEntries: async (params = {}) => {
    try {
      let query = supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(
            id, email, full_name, role, pay_rate_per_hour, campaign_id
          ),
          campaigns!timesheet_entries_campaign_id_fkey(
            id, name, billing_rate_per_hour, client_name, is_billable
          ),
          approver:users!timesheet_entries_approver_id_fkey(
            full_name, email
          )
        `)
        .order('date', { ascending: false })
      
      // Apply filters
      if (params.user_id) query = query.eq('user_id', params.user_id)
      if (params.userId) query = query.eq('user_id', params.userId) // Alternative param name
      if (params.campaign_id) query = query.eq('campaign_id', params.campaign_id)
      if (params.status) query = query.eq('status', params.status)
      if (params.date_from) query = query.gte('date', params.date_from)
      if (params.startDate) query = query.gte('date', params.startDate) // Alternative param name
      if (params.date_to) query = query.lte('date', params.date_to)
      if (params.endDate) query = query.lte('date', params.endDate) // Alternative param name
      if (params.week_start) {
        const weekEnd = new Date(params.week_start)
        weekEnd.setDate(weekEnd.getDate() + 6)
        query = query.gte('date', params.week_start).lte('date', weekEnd.toISOString().split('T')[0])
      }
      
      const { data, error } = await query
      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error fetching timesheet entries:', error)
      return []
    }
  },

  // Get daily timesheet with detailed breakdown
  getDailyTimesheet: async (userId, date) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(
            full_name, email, pay_rate_per_hour
          ),
          campaigns!timesheet_entries_campaign_id_fkey(
            name, billing_rate_per_hour, client_name
          ),
          task_time_entries:task_timesheets!inner(
            id, custom_task_name, task_description,
            task_time_entries(
              entry_date, duration_hours, duration_minutes, 
              is_completed, notes
            )
          )
        `)
        .eq('user_id', userId)
        .eq('date', date)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching daily timesheet:', error)
      return null
    }
  },

  // Create comprehensive timesheet entry
  createTimesheetEntry: async (entryData) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .insert([{
          user_id: entryData.user_id,
          campaign_id: entryData.campaign_id,
          date: entryData.date,
          time_in: entryData.time_in,
          time_out: entryData.time_out,
          lunch_start: entryData.lunch_start,
          lunch_end: entryData.lunch_end,
          break1_start: entryData.break1_start,
          break1_end: entryData.break1_end,
          break2_start: entryData.break2_start,
          break2_end: entryData.break2_end,
          vacation_type: entryData.vacation_type || 'none',
          vacation_hours: entryData.vacation_hours || 0,
          sick_hours: entryData.sick_hours || 0,
          holiday_hours: entryData.holiday_hours || 0,
          status: 'draft',
          calculation_metadata: entryData.calculation_metadata || {},
          created_from_schedule: entryData.created_from_schedule || false,
          schedule_event_id: entryData.schedule_event_id
        }])
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name),
          campaigns!timesheet_entries_campaign_id_fkey(name)
        `)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating timesheet entry:', error)
      throw error
    }
  },

  // Update timesheet entry with calculations
  updateTimesheetEntry: async (id, updateData) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name),
          campaigns!timesheet_entries_campaign_id_fkey(name)
        `)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating timesheet entry:', error)
      throw error
    }
  },

  // Clock in/out functionality
  clockIn: async (userId, campaignId, metadata = {}) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()
      
      // Check if entry exists for today
      const { data: existing } = await supabase
        .from('timesheet_entries')
        .select('id, time_in, time_out')
        .eq('user_id', userId)
        .eq('date', today)
        .single()
      
      if (existing) {
        // Update existing entry
        return await supabase
          .from('timesheet_entries')
          .update({
            time_in: existing.time_in || now,
            calculation_metadata: {
              ...existing.calculation_metadata,
              ...metadata,
              last_clock_action: 'clock_in',
              last_clock_time: now
            }
          })
          .eq('id', existing.id)
          .select()
          .single()
      } else {
        // Create new entry
        return await supabase
          .from('timesheet_entries')
          .insert([{
            user_id: userId,
            campaign_id: campaignId,
            date: today,
            time_in: now,
            status: 'draft',
            calculation_metadata: {
              ...metadata,
              clock_in_device: metadata.device || 'web_app',
              clock_in_method: metadata.method || 'manual',
              last_clock_action: 'clock_in',
              last_clock_time: now
            }
          }])
          .select()
          .single()
      }
    } catch (error) {
      console.error('Error clocking in:', error)
      throw error
    }
  },

  clockOut: async (userId, metadata = {}) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          time_out: now,
          calculation_metadata: {
            clock_out_device: metadata.device || 'web_app',
            clock_out_method: metadata.method || 'manual',
            last_clock_action: 'clock_out',
            last_clock_time: now
          }
        })
        .eq('user_id', userId)
        .eq('date', today)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error clocking out:', error)
      throw error
    }
  },

  // Break management
  startBreak: async (userId, breakType = 'lunch', metadata = {}) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()
      
      const updateField = breakType === 'lunch' ? 'lunch_start' : 
                         breakType === 'break1' ? 'break1_start' : 'break2_start'
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          [updateField]: now,
          calculation_metadata: {
            [`${breakType}_start_device`]: metadata.device || 'web_app',
            last_break_action: `${breakType}_start`,
            last_break_time: now
          }
        })
        .eq('user_id', userId)
        .eq('date', today)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error starting break:', error)
      throw error
    }
  },

  endBreak: async (userId, breakType = 'lunch', metadata = {}) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()
      
      const updateField = breakType === 'lunch' ? 'lunch_end' : 
                         breakType === 'break1' ? 'break1_end' : 'break2_end'
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          [updateField]: now,
          calculation_metadata: {
            [`${breakType}_end_device`]: metadata.device || 'web_app',
            last_break_action: `${breakType}_end`,
            last_break_time: now
          }
        })
        .eq('user_id', userId)
        .eq('date', today)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error ending break:', error)
      throw error
    }
  },

  // Get weekly summary
  getWeeklySummary: async (userId, weekStart) => {
    try {
      const { data, error } = await supabase
        .from('weekly_user_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', weekStart)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching weekly summary:', error)
      return null
    }
  },

  // Get time calculation rules
  getTimeCalculationRules: async (jurisdiction = 'US') => {
    try {
      const { data, error } = await supabase
        .from('time_calculation_rules')
        .select('*')
        .eq('jurisdiction', jurisdiction)
        .eq('is_active', true)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching time calculation rules:', error)
      return {
        max_daily_hours: 16,
        overtime_threshold: 8.0,
        max_break_duration: 2.0,
        required_break_6h: 0.5,
        required_break_8h: 1.0
      }
    }
  },

  // Calculate hours for timesheet entry
  calculateHours: async (entryData, rules = null) => {
    if (!rules) {
      rules = await enhancedSupabaseApi.getTimeCalculationRules()
    }
    
    const calculations = {
      regular_hours: 0,
      overtime_hours: 0,
      break_hours: 0,
      total_paid_hours: 0,
      total_unpaid_breaks: 0,
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
        
        // Apply overtime rules
        if (workedHours <= rules.overtime_threshold) {
          calculations.regular_hours = Math.round(workedHours * 100) / 100
        } else {
          calculations.regular_hours = rules.overtime_threshold
          calculations.overtime_hours = Math.round((workedHours - rules.overtime_threshold) * 100) / 100
        }
        
        calculations.total_paid_hours = calculations.regular_hours + calculations.overtime_hours
        
        // Validation checks
        if (workedHours > rules.max_daily_hours) {
          calculations.validation_errors.push(`Worked hours (${workedHours.toFixed(2)}) exceed maximum daily hours (${rules.max_daily_hours})`)
        }
        
        if (workedHours >= 6 && calculations.break_hours < rules.required_break_6h) {
          calculations.validation_warnings.push(`Break time may be insufficient for ${workedHours.toFixed(2)} hour shift`)
        }
        
        if (calculations.break_hours > rules.max_break_duration) {
          calculations.validation_warnings.push(`Break time (${calculations.break_hours.toFixed(2)}h) exceeds maximum allowed (${rules.max_break_duration}h)`)
        }
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
          submitted_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
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
          approver_comments: comments
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
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
          approver_comments: comments
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error rejecting timesheet:', error)
      throw error
    }
  },

  // Get user schedules
  getUserSchedule: async (campaignId) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('campaign_id', campaignId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching user schedule:', error)
      return null
    }
  },

  // Get calendar events
  getCalendarEvents: async (campaignId, dateFrom, dateTo) => {
    try {
      const { data, error } = await supabase
        .from('campaign_calendar_events')
        .select('*')
        .eq('campaign_id', campaignId)
        .gte('start_time', dateFrom)
        .lte('end_time', dateTo)
        .order('start_time')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      return []
    }
  }
}

export default enhancedSupabaseApi

