// CampaignDataModels.jsx - Comprehensive Campaign Management Data Models
// Phase 1: Data Models, Campaign Master Data Structure, and Executive Role Integration

// Campaign Status Enumeration
export const CAMPAIGN_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Campaign Type Enumeration
export const CAMPAIGN_TYPE = {
  CLIENT_PROJECT: 'client_project',
  INTERNAL_OPERATIONS: 'internal_operations',
  TECHNICAL_INITIATIVE: 'technical_initiative',
  MARKETING: 'marketing',
  RESEARCH_DEVELOPMENT: 'research_development',
  COMPLIANCE: 'compliance',
  TRAINING: 'training'
}

// Campaign Priority Levels
export const CAMPAIGN_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// User Role Enumeration (Enhanced)
export const USER_ROLES = {
  ADMIN: 'admin',
  EXECUTIVE: 'executive',
  CAMPAIGN_LEAD: 'campaign_lead',
  TEAM_MEMBER: 'team_member'
}

// Campaign Master Data Structure
export const CAMPAIGN_MASTER_STRUCTURE = {
  // Basic Campaign Information
  id: '',
  name: '',
  description: '',
  code: '', // Unique campaign identifier
  
  // Campaign Classification
  type: CAMPAIGN_TYPE.CLIENT_PROJECT,
  priority: CAMPAIGN_PRIORITY.MEDIUM,
  status: CAMPAIGN_STATUS.PLANNING,
  
  // Timeline Information
  start_date: null,
  end_date: null,
  planned_duration_weeks: 0,
  actual_duration_weeks: 0,
  
  // Client and Relationship Information
  client_name: '',
  client_contact_name: '',
  client_contact_email: '',
  client_contact_phone: '',
  relationship_manager_id: null,
  relationship_manager_name: '',
  
  // Financial Information
  budget_total: 0,
  budget_allocated: 0,
  budget_spent: 0,
  hourly_rate_standard: 0,
  hourly_rate_overtime: 0,
  billing_currency: 'USD',
  
  // Project Management
  project_manager_id: null,
  project_manager_name: '',
  delivery_manager_id: null,
  delivery_manager_name: '',
  
  // Campaign Hierarchy
  parent_campaign_id: null, // For sub-campaigns
  campaign_level: 0, // 0 = main campaign, 1 = sub-campaign, 2 = project
  
  // Resource Planning
  estimated_hours_total: 0,
  estimated_hours_billable: 0,
  actual_hours_total: 0,
  actual_hours_billable: 0,
  
  // Team Assignment Information
  assigned_executives: [], // Array of executive user IDs
  assigned_campaign_leaders: [], // Array of campaign leader user IDs
  assigned_team_members: [], // Array of team member user IDs
  
  // Operational Details
  location: '',
  department: '',
  cost_center: '',
  billing_code: '',
  
  // Compliance and Documentation
  compliance_requirements: [],
  documentation_links: [],
  risk_level: 'medium',
  
  // Metadata
  created_by: null,
  created_date: null,
  last_modified_by: null,
  last_modified_date: null,
  
  // Color Coding for Visual Interface
  color_code: '#3B82F6', // Default blue
  
  // Sub-campaigns/Projects
  sub_campaigns: []
}

// Sub-Campaign/Project Structure
export const SUB_CAMPAIGN_STRUCTURE = {
  id: '',
  parent_campaign_id: '',
  name: '',
  description: '',
  code: '',
  type: 'project',
  status: CAMPAIGN_STATUS.PLANNING,
  start_date: null,
  end_date: null,
  estimated_hours: 0,
  actual_hours: 0,
  assigned_team_members: [],
  assigned_campaign_leaders: [],
  budget_allocated: 0,
  budget_spent: 0,
  color_code: '#10B981', // Default green for sub-campaigns
  created_date: null,
  last_modified_date: null
}

// Enhanced User Structure with Executive Role
export const ENHANCED_USER_STRUCTURE = {
  id: '',
  email: '',
  full_name: '',
  employee_id: '',
  role: USER_ROLES.TEAM_MEMBER,
  
  // Executive-specific fields
  executive_level: null, // CEO, CTO, COO, etc.
  executive_scope: 'organization', // 'organization', 'department', 'campaigns'
  
  // Campaign Assignment Information
  assigned_campaigns: [], // Array of campaign IDs
  campaign_roles: {}, // Object mapping campaign_id to role in that campaign
  
  // Utilization and Capacity
  weekly_capacity_hours: 40,
  current_utilization_percentage: 0,
  campaign_allocation_percentages: {}, // campaign_id: percentage
  
  // Visual Indicators
  campaign_count: 0,
  conflict_indicators: [],
  overallocation_warning: false,
  
  // Contact and Profile Information
  department: '',
  title: '',
  phone: '',
  address: '',
  hire_date: null,
  end_date: null,
  
  // Emergency Contact
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  
  // Employment Status
  employment_status: 'active', // active, on_leave, terminated
  leave_type: null,
  leave_start_date: null,
  leave_end_date: null,
  
  // Pay Information
  pay_rate: 0,
  overtime_rate: 0,
  
  // Metadata
  created_date: null,
  last_modified_date: null
}

// Campaign Assignment Structure
export const CAMPAIGN_ASSIGNMENT_STRUCTURE = {
  id: '',
  campaign_id: '',
  user_id: '',
  role_in_campaign: '', // 'executive', 'campaign_leader', 'team_member'
  assignment_percentage: 0, // Percentage of time allocated to this campaign
  start_date: null,
  end_date: null,
  billable: true,
  hourly_rate: 0,
  weekly_scheduled_hours: 0,
  status: 'active', // active, inactive, completed
  created_by: null,
  created_date: null,
  notes: ''
}

// Weekly Schedule Structure (for Campaign Leaders)
export const WEEKLY_SCHEDULE_STRUCTURE = {
  id: '',
  campaign_id: '',
  user_id: '',
  week_start_date: null, // Monday of the week
  week_end_date: null, // Sunday of the week
  
  // Daily planned hours
  monday_hours: 0,
  tuesday_hours: 0,
  wednesday_hours: 0,
  thursday_hours: 0,
  friday_hours: 0,
  saturday_hours: 0,
  sunday_hours: 0,
  
  total_planned_hours: 0,
  
  // Schedule metadata
  created_by: null, // Campaign leader who created the schedule
  created_date: null,
  last_modified_by: null,
  last_modified_date: null,
  
  // Status and approval
  status: 'draft', // draft, submitted, approved, rejected
  approved_by: null,
  approved_date: null,
  
  notes: ''
}

// Enhanced Timesheet Structure (Campaign-Specific)
export const CAMPAIGN_TIMESHEET_STRUCTURE = {
  id: '',
  user_id: '',
  date: null,
  
  // Campaign-specific time entries
  campaign_entries: [
    {
      campaign_id: '',
      campaign_name: '',
      sub_campaign_id: null,
      sub_campaign_name: '',
      
      // Time tracking
      time_in: null,
      break_out: null,
      break_in: null,
      time_out: null,
      
      // Hours breakdown
      regular_hours: 0,
      overtime_hours: 0,
      vacation_hours: 0,
      sick_hours: 0,
      holiday_hours: 0,
      
      // Billable information
      billable_hours: 0,
      non_billable_hours: 0,
      hourly_rate: 0,
      
      // Task and notes
      task_description: '',
      notes: '',
      
      // Status
      status: 'draft' // draft, submitted, approved, rejected
    }
  ],
  
  // Daily totals
  total_hours: 0,
  total_billable_hours: 0,
  total_regular_hours: 0,
  total_overtime_hours: 0,
  
  // Approval workflow
  submitted_date: null,
  approved_by: null,
  approved_date: null,
  rejection_reason: '',
  
  // Metadata
  created_date: null,
  last_modified_date: null
}

// Color Coding System for Visual Interface
export const CAMPAIGN_COLOR_CODES = {
  [CAMPAIGN_TYPE.CLIENT_PROJECT]: '#3B82F6', // Blue
  [CAMPAIGN_TYPE.INTERNAL_OPERATIONS]: '#10B981', // Green
  [CAMPAIGN_TYPE.TECHNICAL_INITIATIVE]: '#8B5CF6', // Purple
  [CAMPAIGN_TYPE.MARKETING]: '#F59E0B', // Amber
  [CAMPAIGN_TYPE.RESEARCH_DEVELOPMENT]: '#EF4444', // Red
  [CAMPAIGN_TYPE.COMPLIANCE]: '#6B7280', // Gray
  [CAMPAIGN_TYPE.TRAINING]: '#EC4899' // Pink
}

// Status Color Codes
export const STATUS_COLOR_CODES = {
  [CAMPAIGN_STATUS.PLANNING]: '#6B7280', // Gray
  [CAMPAIGN_STATUS.ACTIVE]: '#10B981', // Green
  [CAMPAIGN_STATUS.ON_HOLD]: '#F59E0B', // Amber
  [CAMPAIGN_STATUS.COMPLETED]: '#3B82F6', // Blue
  [CAMPAIGN_STATUS.CANCELLED]: '#EF4444' // Red
}

// Priority Color Codes
export const PRIORITY_COLOR_CODES = {
  [CAMPAIGN_PRIORITY.LOW]: '#10B981', // Green
  [CAMPAIGN_PRIORITY.MEDIUM]: '#F59E0B', // Amber
  [CAMPAIGN_PRIORITY.HIGH]: '#EF4444', // Red
  [CAMPAIGN_PRIORITY.CRITICAL]: '#7C2D12' // Dark red
}

// Validation Functions
export const validateCampaignData = (campaign) => {
  const errors = []
  
  if (!campaign.name || campaign.name.trim() === '') {
    errors.push('Campaign name is required')
  }
  
  if (!campaign.code || campaign.code.trim() === '') {
    errors.push('Campaign code is required')
  }
  
  if (!campaign.start_date) {
    errors.push('Start date is required')
  }
  
  if (!campaign.end_date) {
    errors.push('End date is required')
  }
  
  if (campaign.start_date && campaign.end_date && new Date(campaign.start_date) >= new Date(campaign.end_date)) {
    errors.push('End date must be after start date')
  }
  
  if (campaign.budget_total < 0) {
    errors.push('Budget cannot be negative')
  }
  
  if (campaign.estimated_hours_total < 0) {
    errors.push('Estimated hours cannot be negative')
  }
  
  return errors
}

// Utility Functions
export const calculateCampaignProgress = (campaign) => {
  if (!campaign.start_date || !campaign.end_date) return 0
  
  const start = new Date(campaign.start_date)
  const end = new Date(campaign.end_date)
  const now = new Date()
  
  if (now < start) return 0
  if (now > end) return 100
  
  const totalDuration = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  
  return Math.round((elapsed / totalDuration) * 100)
}

export const calculateUserUtilization = (user, campaigns) => {
  let totalAllocatedPercentage = 0
  
  user.assigned_campaigns.forEach(campaignId => {
    const allocation = user.campaign_allocation_percentages[campaignId] || 0
    totalAllocatedPercentage += allocation
  })
  
  return {
    utilization_percentage: totalAllocatedPercentage,
    is_overallocated: totalAllocatedPercentage > 100,
    available_capacity: Math.max(0, 100 - totalAllocatedPercentage)
  }
}

export const detectScheduleConflicts = (user, weeklySchedules) => {
  const conflicts = []
  const weeklyTotals = {}
  
  weeklySchedules.forEach(schedule => {
    const weekKey = schedule.week_start_date
    if (!weeklyTotals[weekKey]) {
      weeklyTotals[weekKey] = 0
    }
    weeklyTotals[weekKey] += schedule.total_planned_hours
  })
  
  Object.entries(weeklyTotals).forEach(([week, totalHours]) => {
    if (totalHours > user.weekly_capacity_hours) {
      conflicts.push({
        week: week,
        planned_hours: totalHours,
        capacity_hours: user.weekly_capacity_hours,
        overallocation: totalHours - user.weekly_capacity_hours
      })
    }
  })
  
  return conflicts
}

// Mock Data Generators for Testing
export const generateMockCampaigns = () => {
  return [
    {
      ...CAMPAIGN_MASTER_STRUCTURE,
      id: 'camp_001',
      name: 'Digital Transformation Initiative',
      description: 'Comprehensive digital transformation for client operations',
      code: 'DTI-2025',
      type: CAMPAIGN_TYPE.CLIENT_PROJECT,
      priority: CAMPAIGN_PRIORITY.HIGH,
      status: CAMPAIGN_STATUS.ACTIVE,
      start_date: '2025-01-01',
      end_date: '2025-06-30',
      client_name: 'TechCorp Industries',
      relationship_manager_name: 'Sarah Johnson',
      budget_total: 500000,
      estimated_hours_total: 2000,
      color_code: CAMPAIGN_COLOR_CODES[CAMPAIGN_TYPE.CLIENT_PROJECT]
    },
    {
      ...CAMPAIGN_MASTER_STRUCTURE,
      id: 'camp_002',
      name: 'Internal IT Infrastructure Upgrade',
      description: 'Upgrading internal systems and infrastructure',
      code: 'ITU-2025',
      type: CAMPAIGN_TYPE.INTERNAL_OPERATIONS,
      priority: CAMPAIGN_PRIORITY.MEDIUM,
      status: CAMPAIGN_STATUS.PLANNING,
      start_date: '2025-02-01',
      end_date: '2025-04-30',
      client_name: 'Internal',
      relationship_manager_name: 'Mike Chen',
      budget_total: 150000,
      estimated_hours_total: 800,
      color_code: CAMPAIGN_COLOR_CODES[CAMPAIGN_TYPE.INTERNAL_OPERATIONS]
    }
  ]
}

export const generateMockUsers = () => {
  return [
    {
      ...ENHANCED_USER_STRUCTURE,
      id: 1,
      email: 'admin@test.com',
      full_name: 'Test Admin',
      role: USER_ROLES.ADMIN,
      assigned_campaigns: ['camp_001', 'camp_002'],
      campaign_count: 2
    },
    {
      ...ENHANCED_USER_STRUCTURE,
      id: 4,
      email: 'ceo@test.com',
      full_name: 'Chief Executive Officer',
      role: USER_ROLES.EXECUTIVE,
      executive_level: 'CEO',
      executive_scope: 'organization',
      assigned_campaigns: ['camp_001', 'camp_002'],
      campaign_count: 2
    },
    {
      ...ENHANCED_USER_STRUCTURE,
      id: 3,
      email: 'campaign@test.com',
      full_name: 'Campaign Leader',
      role: USER_ROLES.CAMPAIGN_LEAD,
      assigned_campaigns: ['camp_001'],
      campaign_count: 1
    },
    {
      ...ENHANCED_USER_STRUCTURE,
      id: 2,
      email: 'user@test.com',
      full_name: 'Test User',
      role: USER_ROLES.TEAM_MEMBER,
      assigned_campaigns: ['camp_001'],
      campaign_count: 1
    }
  ]
}

export default {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  CAMPAIGN_PRIORITY,
  USER_ROLES,
  CAMPAIGN_MASTER_STRUCTURE,
  SUB_CAMPAIGN_STRUCTURE,
  ENHANCED_USER_STRUCTURE,
  CAMPAIGN_ASSIGNMENT_STRUCTURE,
  WEEKLY_SCHEDULE_STRUCTURE,
  CAMPAIGN_TIMESHEET_STRUCTURE,
  CAMPAIGN_COLOR_CODES,
  STATUS_COLOR_CODES,
  PRIORITY_COLOR_CODES,
  validateCampaignData,
  calculateCampaignProgress,
  calculateUserUtilization,
  detectScheduleConflicts,
  generateMockCampaigns,
  generateMockUsers
}

