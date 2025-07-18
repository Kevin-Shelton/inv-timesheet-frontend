// API service for communicating with the backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://web-production-c2743.up.railway.app/api'
  : 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token')
  }

  // Set authentication token
  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: this.getHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      })
    } finally {
      this.setToken(null)
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  // Profile update method
  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    })
  }

  async resetPassword(email) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // User management methods
  async getUsers() {
    return this.request('/users')
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`)
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // Additional user management methods for admin features
  async resetUserPassword(userId) {
    return this.request(`/users/${userId}/reset-password`, {
      method: 'POST',
    })
  }

  // Campaign management methods
  async getCampaigns() {
    return this.request('/campaigns')
  }

  async getCampaign(campaignId) {
    return this.request(`/campaigns/${campaignId}`)
  }

  async createCampaign(campaignData) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    })
  }

  async updateCampaign(campaignId, campaignData) {
    return this.request(`/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    })
  }

  async deleteCampaign(campaignId) {
    return this.request(`/campaigns/${campaignId}`, {
      method: 'DELETE',
    })
  }

  // Schedule management methods
  async getSchedules() {
    return this.request('/schedules')
  }

  async getSchedule(scheduleId) {
    return this.request(`/schedules/${scheduleId}`)
  }

  async createSchedule(scheduleData) {
    return this.request('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    })
  }

  async updateSchedule(scheduleId, scheduleData) {
    return this.request(`/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    })
  }

  async deleteSchedule(scheduleId) {
    return this.request(`/schedules/${scheduleId}`, {
      method: 'DELETE',
    })
  }

  // Enhanced timesheet management methods
  async getTimesheets(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/timesheets?${queryString}` : '/timesheets'
    return this.request(endpoint)
  }

  async getTimesheet(timesheetId) {
    return this.request(`/timesheets/${timesheetId}`)
  }

  async createTimesheet(timesheetData) {
    return this.request('/timesheets', {
      method: 'POST',
      body: JSON.stringify(timesheetData),
    })
  }

  async updateTimesheet(timesheetId, timesheetData) {
    return this.request(`/timesheets/${timesheetId}`, {
      method: 'PUT',
      body: JSON.stringify(timesheetData),
    })
  }

  async submitTimesheet(timesheetId) {
    return this.request(`/timesheets/${timesheetId}/submit`, {
      method: 'PUT',
    })
  }

  async approveTimesheet(timesheetId, comment = '') {
    return this.request(`/timesheets/${timesheetId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    })
  }

  async rejectTimesheet(timesheetId, comment = '') {
    return this.request(`/timesheets/${timesheetId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    })
  }

  async deleteTimesheet(timesheetId) {
    return this.request(`/timesheets/${timesheetId}`, {
      method: 'DELETE',
    })
  }

  // Enhanced reporting methods
  async getCampaignSummary(campaignId, month) {
    const params = new URLSearchParams({ campaign_id: campaignId, month })
    return this.request(`/reports/campaign-summary?${params}`)
  }

  async getOrganizationSummary(month) {
    const params = new URLSearchParams({ month })
    return this.request(`/reports/organization-summary?${params}`)
  }

  async getUserTimesheetReport(userId, month) {
    const params = new URLSearchParams({ user_id: userId, month })
    return this.request(`/reports/user-timesheet?${params}`)
  }

  // Dashboard stats for admin
  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  async getPayrollReport(startDate, endDate) {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
    return this.request(`/reports/payroll?${params}`)
  }

  // Export methods with enhanced options
  async exportTimesheets(options = {}) {
    const params = new URLSearchParams()
    
    if (options.format) {
      params.append('format', options.format)
    }
    
    if (options.start_date) {
      params.append('start_date', options.start_date)
    }
    
    if (options.end_date) {
      params.append('end_date', options.end_date)
    }
    
    if (options.user_id) {
      params.append('user_id', options.user_id)
    }

    const response = await fetch(`${API_BASE_URL}/reports/timesheets?${params}`, {
      headers: this.getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to export timesheets')
    }
    
    return response.blob()
  }

  async exportCSV(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/reports/export-csv?${queryString}` : '/reports/export-csv'
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  }

  async exportPDF(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/reports/export-pdf?${queryString}` : '/reports/export-pdf'
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  }

  // Utility method for file downloads
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}

// Create and export a singleton instance
export const api = new ApiService()
export default api

