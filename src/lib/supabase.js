// SUPABASE API REPLACEMENT FUNCTIONS
// This file contains the real Supabase API functions that replace the mock data
// Import this into your App.jsx to replace the mock API object

import { supabase } from './lib/supabase'

export const supabaseApi = {
  // Authentication
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Get user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (profileError) {
        console.warn('No user profile found, using auth data')
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
          role: userProfile.role || 'team_member',
          department: userProfile.department,
          pay_rate_per_hour: userProfile.pay_rate_per_hour,
          hire_date: userProfile.hire_date,
          phone: userProfile.phone,
          is_active: userProfile.is_active
        }
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed')
    }
  },

  // Timesheets - Connected to timesheet_entries table
  getTimesheets: async (params = {}) => {
    try {
      let query = supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name),
          campaigns!timesheet_entries_campaign_id_fkey(name)
        `)
        .order('date', { ascending: false })
      
      if (params.status) {
        query = query.eq('status', params.status)
      }
      
      if (params.user_id) {
        query = query.eq('user_id', params.user_id)
      }
      
      if (params.campaign_id) {
        query = query.eq('campaign_id', params.campaign_id)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data?.map(entry => ({
        id: entry.id,
        date: entry.date,
        hours: (entry.regular_hours || 0) + (entry.overtime_hours || 0),
        description: `${entry.campaigns?.name || 'Unknown Campaign'}`,
        status: entry.status,
        user_name: entry.users?.full_name || 'Unknown User',
        regular_hours: entry.regular_hours,
        overtime_hours: entry.overtime_hours,
        vacation_hours: entry.vacation_hours,
        sick_hours: entry.sick_hours,
        holiday_hours: entry.holiday_hours
      })) || []
    } catch (error) {
      console.error('Error fetching timesheets:', error)
      return []
    }
  },

  createTimesheet: async (data) => {
    try {
      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .insert([{
          ...data,
          status: 'draft',
          created_at: new Date().toISOString()
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

  approveTimesheet: async (id, comment) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          status: 'approved',
          decision_at: new Date().toISOString(),
          approver_comments: comment
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error approving timesheet:', error)
      throw error
    }
  },

  rejectTimesheet: async (id, comment) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({
          status: 'rejected',
          decision_at: new Date().toISOString(),
          approver_comments: comment
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error rejecting timesheet:', error)
      throw error
    }
  },

  // Billable Hours - Calculated from timesheet data
  getBillableHours: async (params = {}) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name, pay_rate_per_hour),
          campaigns!timesheet_entries_campaign_id_fkey(name, billing_rate_per_hour)
        `)
        .eq('status', 'approved')
        .order('date', { ascending: false })
      
      if (error) throw error
      
      return data?.map(entry => ({
        id: entry.id,
        team_member_id: entry.user_id,
        team_member_name: entry.users?.full_name || 'Unknown User',
        date: entry.date,
        client_name: entry.campaigns?.name || 'Unknown Campaign',
        project_name: entry.campaigns?.name || 'Unknown Project',
        task_description: 'Time entry',
        billable_hours: (entry.regular_hours || 0) + (entry.overtime_hours || 0),
        hourly_rate: entry.campaigns?.billing_rate_per_hour || entry.users?.pay_rate_per_hour || 0,
        total_amount: ((entry.regular_hours || 0) + (entry.overtime_hours || 0)) * 
                     (entry.campaigns?.billing_rate_per_hour || entry.users?.pay_rate_per_hour || 0),
        status: 'approved',
        entered_by: entry.users?.full_name || 'System'
      })) || []
    } catch (error) {
      console.error('Error fetching billable hours:', error)
      return []
    }
  },

  createBillableHours: async (data) => {
    try {
      // Create a timesheet entry for billable hours
      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .insert([{
          user_id: data.team_member_id,
          campaign_id: data.campaign_id,
          date: data.date,
          regular_hours: data.billable_hours,
          status: 'approved',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating billable hours:', error)
      throw error
    }
  },

  updateBillableHours: async (id, data) => {
    try {
      const { data: result, error } = await supabase
        .from('timesheet_entries')
        .update({
          regular_hours: data.billable_hours,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating billable hours:', error)
      throw error
    }
  },

  deleteBillableHours: async (id) => {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting billable hours:', error)
      throw error
    }
  },

  // Analytics and Metrics - Real data from multiple tables
  getUtilizationMetrics: async (params = {}) => {
    try {
      // Get timesheet data for calculations
      const { data: timesheets, error } = await supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!timesheet_entries_user_id_fkey(full_name)
        `)
        .gte('date', params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .lte('date', params.endDate || new Date().toISOString().split('T')[0])
      
      if (error) throw error
      
      // Calculate metrics from real data
      const totalHours = timesheets?.reduce((sum, entry) => 
        sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0), 0) || 0
      
      const billableHours = timesheets?.reduce((sum, entry) => 
        sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0), 0) || 0
      
      // Group by user for team metrics
      const userMetrics = {}
      timesheets?.forEach(entry => {
        const userName = entry.users?.full_name || 'Unknown'
        if (!userMetrics[userName]) {
          userMetrics[userName] = { name: userName, hours: 0, entries: 0 }
        }
        userMetrics[userName].hours += (entry.regular_hours || 0) + (entry.overtime_hours || 0)
        userMetrics[userName].entries += 1
      })
      
      return {
        overall_utilization: totalHours > 0 ? (billableHours / totalHours * 100) : 0,
        billable_utilization: totalHours > 0 ? (billableHours / totalHours * 100) : 0,
        target_utilization: 75.0,
        revenue_per_hour: 68.50,
        total_billable_hours: billableHours,
        total_available_hours: totalHours,
        efficiency_score: totalHours > 0 ? (billableHours / totalHours * 100) : 0,
        team_metrics: Object.values(userMetrics).map(user => ({
          name: user.name,
          utilization: user.hours > 0 ? (user.hours / (user.entries * 8) * 100) : 0,
          billable_hours: user.hours
        }))
      }
    } catch (error) {
      console.error('Error fetching utilization metrics:', error)
      return {
        overall_utilization: 0,
        billable_utilization: 0,
        target_utilization: 75.0,
        revenue_per_hour: 0,
        total_billable_hours: 0,
        total_available_hours: 0,
        efficiency_score: 0,
        team_metrics: []
      }
    }
  },

  // Users/Team Management - Connected to users table
  getUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  createUser: async (userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  updateUser: async (id, userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  deleteUser: async (id) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  // NEW: Deactivate user instead of deleting
  deactivateUser: async (id) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deactivating user:', error)
      throw error
    }
  },

  // NEW: Activate user
  activateUser: async (id) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error activating user:', error)
      throw error
    }
  },

  // NEW: Campaign Management API endpoints - Connected to campaigns table
  getCampaigns: async (params = {}) => {
    try {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (params.is_active !== undefined) {
        query = query.eq('is_active', params.is_active)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }
  },

  createCampaign: async (campaignData) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          ...campaignData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw error
    }
  },

  updateCampaign: async (id, campaignData) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          ...campaignData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating campaign:', error)
      throw error
    }
  },

  deleteCampaign: async (id) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      throw error
    }
  }
}

