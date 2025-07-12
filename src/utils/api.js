import { supabaseApi as api } from '../utils/supabase'

export const api = {
  // Users API
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  createUser: async (userData) => {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        pay_rate_per_hour: userData.pay_rate_per_hour,
        hire_date: userData.hire_date,
        phone: userData.phone,
        is_active: true
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateUser: async (id, userData) => {
    const { data, error } = await supabase
      .from('users')
      .update({
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        pay_rate_per_hour: userData.pay_rate_per_hour,
        hire_date: userData.hire_date,
        phone: userData.phone
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  deactivateUser: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  activateUser: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Timesheets API
  getTimesheets: async (filters = {}) => {
    let query = supabase
      .from('timesheet_entries')
      .select(`
        *,
        users (
          id,
          full_name,
          email
        ),
        campaigns (
          id,
          name,
          hourly_rate
        )
      `)
      .order('date', { ascending: false })

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters.start_date) {
      query = query.gte('date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('date', filters.end_date)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  createTimesheet: async (timesheetData) => {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .insert([timesheetData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateTimesheet: async (id, timesheetData) => {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .update(timesheetData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  approveTimesheet: async (id) => {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  rejectTimesheet: async (id) => {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Campaigns API
  getCampaigns: async (filters = {}) => {
    let query = supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  createCampaign: async (campaignData) => {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaignData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateCampaign: async (id, campaignData) => {
    const { data, error } = await supabase
      .from('campaigns')
      .update(campaignData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  deleteCampaign: async (id) => {
    const { data, error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return data
  },

  // Analytics API
  getBillableHours: async (filters = {}) => {
    let query = supabase
      .from('timesheet_entries')
      .select(`
        *,
        users (
          id,
          full_name,
          pay_rate_per_hour
        ),
        campaigns (
          id,
          name,
          hourly_rate
        )
      `)

    if (filters.start_date) {
      query = query.gte('date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('date', filters.end_date)
    }

    const { data, error } = await query
    if (error) throw error

    // Calculate billable amounts
    return data.map(entry => ({
      ...entry,
      billable_amount: entry.hours * (entry.campaigns?.hourly_rate || 0),
      cost: entry.hours * (entry.users?.pay_rate_per_hour || 0)
    }))
  },

  getUtilizationMetrics: async (filters = {}) => {
    const timesheets = await api.getTimesheets(filters)
    
    // Calculate utilization metrics
    const totalHours = timesheets.reduce((sum, entry) => sum + entry.hours, 0)
    const uniqueUsers = new Set(timesheets.map(entry => entry.user_id)).size
    const avgHoursPerUser = uniqueUsers > 0 ? totalHours / uniqueUsers : 0
    
    return {
      totalHours,
      uniqueUsers,
      avgHoursPerUser,
      entries: timesheets.length
    }
  }
}

