// Additional API methods needed for the enhanced admin features
// Add these to your existing api.js file

// TIMESHEET APPROVAL METHODS
async approveTimesheet(timesheetId, comment = '') {
  const response = await fetch(`${this.baseURL}/api/timesheets/${timesheetId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    },
    body: JSON.stringify({ comment })
  })
  
  if (!response.ok) {
    throw new Error('Failed to approve timesheet')
  }
  
  return response.json()
}

async rejectTimesheet(timesheetId, comment = '') {
  const response = await fetch(`${this.baseURL}/api/timesheets/${timesheetId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    },
    body: JSON.stringify({ comment })
  })
  
  if (!response.ok) {
    throw new Error('Failed to reject timesheet')
  }
  
  return response.json()
}

// Enhanced getTimesheets to support admin view
async getTimesheets(options = {}) {
  const params = new URLSearchParams()
  
  if (options.status && options.status !== 'all') {
    params.append('status', options.status)
  }
  
  if (options.user_id) {
    params.append('user_id', options.user_id)
  }
  
  if (options.start_date) {
    params.append('start_date', options.start_date)
  }
  
  if (options.end_date) {
    params.append('end_date', options.end_date)
  }

  const response = await fetch(`${this.baseURL}/api/timesheets?${params}`, {
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch timesheets')
  }
  
  return response.json()
}

// USER MANAGEMENT METHODS
async updateUser(userId, userData) {
  const response = await fetch(`${this.baseURL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    },
    body: JSON.stringify(userData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to update user')
  }
  
  return response.json()
}

async deleteUser(userId) {
  const response = await fetch(`${this.baseURL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete user')
  }
  
  return response.json()
}

async resetUserPassword(userId) {
  const response = await fetch(`${this.baseURL}/api/users/${userId}/reset-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to reset user password')
  }
  
  return response.json()
}

// REPORTING AND EXPORT METHODS
async exportTimesheets(options = {}) {
  const params = new URLSearchParams()
  
  if (options.format) {
    params.append('format', options.format) // 'csv', 'pdf', 'excel'
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

  const response = await fetch(`${this.baseURL}/api/reports/timesheets?${params}`, {
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to export timesheets')
  }
  
  // Return blob for file download
  return response.blob()
}

async getPayrollReport(startDate, endDate) {
  const response = await fetch(`${this.baseURL}/api/reports/payroll?start_date=${startDate}&end_date=${endDate}`, {
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch payroll report')
  }
  
  return response.json()
}

async getDashboardStats() {
  const response = await fetch(`${this.baseURL}/api/dashboard/stats`, {
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }
  
  return response.json()
}

// CAMPAIGN MANAGEMENT (for future implementation)
async getCampaigns() {
  const response = await fetch(`${this.baseURL}/api/campaigns`, {
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns')
  }
  
  return response.json()
}

async createCampaign(campaignData) {
  const response = await fetch(`${this.baseURL}/api/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    },
    body: JSON.stringify(campaignData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to create campaign')
  }
  
  return response.json()
}

// UTILITY METHODS
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

