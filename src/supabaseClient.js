// Supabase Client - Fixed to match your actual database schema
// Replace your existing supabase client file with this

import { createClient } from '@supabase/supabase-js'

// Use Vercel environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// API functions that match your actual database schema
export const supabaseApi = {
  // Users API - matches your users table structure
  getUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, employment_type, is_exempt')
        .order('full_name', { ascending: true })
      
      if (error) {
        console.error('Error fetching users:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  // Members API for Who's In/Out panel
  getMembers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, employment_type')
        .order('full_name', { ascending: true })
      
      if (error) {
        console.error('Error fetching members:', error)
        return []
      }
      
      // Transform data for Who's In/Out display
      return data?.map(user => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        employment_type: user.employment_type,
        status: 'out', // Default status
        last_activity: new Date().toISOString()
      })) || []
    } catch (error) {
      console.error('Error fetching members:', error)
      return []
    }
  },

  // Employee Info API
  getEmployeeInfo: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, employment_type, is_exempt')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching employee info:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error fetching employee info:', error)
      return null
    }
  },

  // Campaigns API - matches your campaigns table structure
  getCampaigns: async (params = {}) => {
    try {
      let query = supabase
        .from('campaigns')
        .select('id, name, description, is_active')
        .order('name', { ascending: true })
      
      if (params.is_active !== undefined) {
        query = query.eq('is_active', params.is_active)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching campaigns:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }
  },

  // Timesheets API - matches your timesheet_entries table structure
  getTimesheets: async (params = {}) => {
    try {
      let query = supabase
        .from('timesheet_entries')
        .select('id, user_id, campaign_id, regular_hours')
        .order('id', { ascending: false })
      
      if (params.user_id) {
        query = query.eq('user_id', params.user_id)
      }
      
      if (params.campaign_id) {
        query = query.eq('campaign_id', params.campaign_id)
      }
      
      if (params.limit) {
        query = query.limit(params.limit)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('ENHANCED TRACKED HOURS ERROR:', error)
        return []
      }
      
      return data?.map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        campaign_id: entry.campaign_id,
        hours: entry.regular_hours || 0,
        regular_hours: entry.regular_hours || 0,
        overtime_hours: 0 // Default since not in your schema yet
      })) || []
    } catch (error) {
      console.error('ENHANCED TRACKED HOURS ERROR:', error)
      return []
    }
  },

  // Authentication with your users table
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Get user profile from your users table
      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id, email, full_name, role, employment_type, is_exempt')
          .eq('email', email)
          .single()
        
        if (profileError) {
          console.warn('No user profile found in users table')
          return {
            token: data.session.access_token,
            user: {
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || email,
              role: 'team_member'
            }
          }
        }
        
        return {
          token: data.session.access_token,
          user: {
            id: userProfile.id,
            email: userProfile.email,
            full_name: userProfile.full_name,
            role: userProfile.role,
            employment_type: userProfile.employment_type,
            is_exempt: userProfile.is_exempt
          }
        }
      } catch (profileError) {
        return {
          token: data.session.access_token,
          user: {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || email,
            role: 'team_member'
          }
        }
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed')
    }
  },

  // Create timesheet entry
  createTimesheet: async (data) => {
    try {
      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .insert([{
          user_id: data.user_id,
          campaign_id: data.campaign_id,
          regular_hours: data.regular_hours || 0
        }])
        .select()
        .single()
      
      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating timesheet:', error)
      throw error
    }
  },

  // Update timesheet entry
  updateTimesheet: async (id, data) => {
    try {
      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .update({
          user_id: data.user_id,
          campaign_id: data.campaign_id,
          regular_hours: data.regular_hours || 0
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return result
    } catch (error) {
      console.error('Error updating timesheet:', error)
      throw error
    }
  }
}

export default supabase

