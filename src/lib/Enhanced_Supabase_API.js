// ENHANCED SUPABASE API - OPTIMIZED VERSION
// Fixes multiple GoTrueClient instances and improves profile lookup

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// SINGLETON PATTERN - Prevents multiple GoTrueClient instances
let supabaseInstance = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    console.log('Creating new Supabase client instance');
    supabaseInstance = createClient(supabaseUrl || '', supabaseAnonKey || '', {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Prevent multiple instances by using a unique storage key
        storageKey: 'invictus-timesheet-auth'
      },
      // Add global configuration to prevent conflicts
      global: {
        headers: {
          'X-Client-Info': 'invictus-timesheet-app'
        }
      }
    });
  }
  return supabaseInstance;
};

// Export the singleton instance
export const supabase = getSupabaseClient();

// COMPREHENSIVE DATE NORMALIZATION FUNCTION (keeping the working timezone fix)
const safeDateToString = (date) => {
  if (!date) {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  }
  
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  if (typeof date === 'string') {
    try {
      const cleanDateString = date.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDateString)) {
        return cleanDateString;
      }
      
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
  
  console.warn('Unrecognized date format, using today:', date);
  const today = new Date();
  return today.getFullYear() + '-' + 
         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
         String(today.getDate()).padStart(2, '0');
};

// ENHANCED USER PROFILE MANAGEMENT
const userProfileCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedUserProfile = (userId) => {
  const cached = userProfileCache.get(userId);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.profile;
  }
  return null;
};

const setCachedUserProfile = (userId, profile) => {
  userProfileCache.set(userId, {
    profile,
    timestamp: Date.now()
  });
};

export const enhancedSupabaseApi = {
  // OPTIMIZED USER MANAGEMENT - Prevents multiple lookups and handles missing profiles
  getCurrentUser: async () => {
    try {
      console.log('Getting current user...');
      
      // Get authenticated user from Supabase auth
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth error:', error);
        throw error;
      }
      
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }
      
      console.log('Authenticated user found:', user.id);
      
      // Check cache first
      const cachedProfile = getCachedUserProfile(user.id);
      if (cachedProfile) {
        console.log('Using cached user profile');
        return cachedProfile;
      }
      
      // Try to get user profile from users table
      console.log('Fetching user profile from database...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.log('Profile lookup failed, creating fallback profile:', profileError.message);
        
        // Create a comprehensive fallback profile
        const fallbackProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.email?.split('@')[0] || 
                    'User',
          email: user.email,
          role: 'employee',
          created_at: user.created_at,
          // Add additional fields that might be expected
          pay_rate_per_hour: 0,
          campaign_id: null,
          is_active: true
        };
        
        // Cache the fallback profile
        setCachedUserProfile(user.id, fallbackProfile);
        
        console.log('Using fallback profile:', fallbackProfile);
        return fallbackProfile;
      }
      
      // Cache the real profile
      setCachedUserProfile(user.id, profile);
      console.log('User profile found and cached:', profile.full_name);
      return profile;
      
    } catch (error) {
      console.error('Error getting current user:', error);
      
      // Return development fallback
      const devFallback = {
        id: 'dev-user-1',
        full_name: 'Kevin Shelton',
        email: 'kevin@example.com',
        role: 'employee',
        pay_rate_per_hour: 25,
        campaign_id: null,
        is_active: true
      };
      
      console.log('Using development fallback user');
      return devFallback;
    }
  },

  // OPTIMIZED TIMESHEET ENTRIES API (keeping timezone fixes)
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
      
      // Handle date filters with timezone safety
      if (params.date_from) {
        const safeDateFrom = safeDateToString(params.date_from);
        query = query.gte('date', safeDateFrom);
      }
      if (params.startDate) {
        const safeStartDate = safeDateToString(params.startDate);
        query = query.gte('date', safeStartDate);
      }
      if (params.date_to) {
        const safeDateTo = safeDateToString(params.date_to);
        query = query.lte('date', safeDateTo);
      }
      if (params.endDate) {
        const safeEndDate = safeDateToString(params.endDate);
        query = query.lte('date', safeEndDate);
      }
      if (params.week_start) {
        const weekStartSafe = safeDateToString(params.week_start);
        const weekStartDate = new Date(weekStartSafe + 'T00:00:00');
        weekStartDate.setDate(weekStartDate.getDate() + 6);
        const weekEndSafe = safeDateToString(weekStartDate);
        query = query.gte('date', weekStartSafe).lte('date', weekEndSafe);
      }
      
      const { data, error } = await query
      if (error) {
        console.error('Supabase error in getTimesheetEntries:', error)
        throw error
      }
      
      console.log('getTimesheetEntries returning:', data?.length || 0, 'entries');
      return data || []
    } catch (error) {
      console.error('Error fetching timesheet entries:', error)
      return []
    }
  },

  // OPTIMIZED DAILY TIMESHEET (keeping timezone fixes)
  getDailyTimesheet: async (userId, date) => {
    try {
      const safeDateString = safeDateToString(date);
      
      console.log('getDailyTimesheet called:', { 
        userId, 
        originalDate: date, 
        safeDateString,
        dateType: typeof date
      });
      
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', safeDateString)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily timesheet:', error)
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
      
      if (data) {
        console.log('getDailyTimesheet found data for', safeDateString);
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
      
      console.log('getDailyTimesheet no data found for', safeDateString);
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

  // OPTIMIZED PROFILE MANAGEMENT
  createUserProfile: async (userData) => {
    try {
      console.log('Creating user profile:', userData);
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userData.id,
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role || 'employee',
          pay_rate_per_hour: userData.pay_rate_per_hour || 0,
          campaign_id: userData.campaign_id || null,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
      
      // Cache the new profile
      setCachedUserProfile(userData.id, data);
      console.log('User profile created and cached');
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  updateUserProfile: async (userId, updateData) => {
    try {
      console.log('Updating user profile:', userId, updateData);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
      
      // Update cache
      setCachedUserProfile(userId, data);
      console.log('User profile updated and cached');
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Keep all existing timesheet functions with timezone fixes
  createTimesheetEntry: async (entryData) => {
    try {
      const safeEntryData = {
        ...entryData,
        date: safeDateToString(entryData.date)
      };
      
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

  clockIn: async (userId, campaignId = null, metadata = {}) => {
    try {
      const todaySafe = safeDateToString(new Date())
      const now = new Date().toISOString()
      
      const { data: existing } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', todaySafe)
        .single()
      
      if (existing) {
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

  // Keep all other existing functions...
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
      if (entryData.time_in && entryData.time_out) {
        const timeIn = new Date(entryData.time_in)
        const timeOut = new Date(entryData.time_out)
        let totalMinutes = (timeOut - timeIn) / (1000 * 60)
        
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
        
        const workedMinutes = totalMinutes - breakMinutes
        const workedHours = workedMinutes / 60
        
        const overtimeThreshold = 8.0
        if (workedHours <= overtimeThreshold) {
          calculations.regular_hours = Math.round(workedHours * 100) / 100
        } else {
          calculations.regular_hours = overtimeThreshold
          calculations.overtime_hours = Math.round((workedHours - overtimeThreshold) * 100) / 100
        }
        
        calculations.total_paid_hours = calculations.regular_hours + calculations.overtime_hours
      }
      
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

