// CampaignDataModels.jsx - Data models, constants, and utilities for Campaign Management

// Campaign Status Constants
export const CAMPAIGN_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Campaign Type Constants
export const CAMPAIGN_TYPE = {
  CLIENT: 'client',
  INTERNAL: 'internal',
  MARKETING: 'marketing',
  PRODUCT_LAUNCH: 'product_launch',
  BRAND_AWARENESS: 'brand_awareness',
  LEAD_GENERATION: 'lead_generation',
  DIGITAL_MARKETING: 'digital_marketing',
  SOCIAL_MEDIA: 'social_media',
  EMAIL_MARKETING: 'email_marketing',
  CONTENT_MARKETING: 'content_marketing'
};

// Campaign Priority Constants
export const CAMPAIGN_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Campaign Status Colors
export const CAMPAIGN_STATUS_COLORS = {
  [CAMPAIGN_STATUS.PLANNING]: '#f59e0b',
  [CAMPAIGN_STATUS.ACTIVE]: '#10b981',
  [CAMPAIGN_STATUS.ON_HOLD]: '#ef4444',
  [CAMPAIGN_STATUS.COMPLETED]: '#3b82f6',
  [CAMPAIGN_STATUS.CANCELLED]: '#6b7280'
};

// Priority Colors
export const PRIORITY_COLORS = {
  [CAMPAIGN_PRIORITY.LOW]: '#10b981',
  [CAMPAIGN_PRIORITY.MEDIUM]: '#f59e0b',
  [CAMPAIGN_PRIORITY.HIGH]: '#ef4444',
  [CAMPAIGN_PRIORITY.CRITICAL]: '#dc2626'
};

// Campaign Color Scheme
export const CAMPAIGN_COLOR_SCHEME = {
  [CAMPAIGN_TYPE.CLIENT]: '#3b82f6',
  [CAMPAIGN_TYPE.INTERNAL]: '#8b5cf6',
  [CAMPAIGN_TYPE.MARKETING]: '#f59e0b',
  [CAMPAIGN_TYPE.PRODUCT_LAUNCH]: '#10b981',
  [CAMPAIGN_TYPE.BRAND_AWARENESS]: '#ec4899',
  [CAMPAIGN_TYPE.LEAD_GENERATION]: '#06b6d4',
  [CAMPAIGN_TYPE.DIGITAL_MARKETING]: '#84cc16',
  [CAMPAIGN_TYPE.SOCIAL_MEDIA]: '#f97316',
  [CAMPAIGN_TYPE.EMAIL_MARKETING]: '#6366f1',
  [CAMPAIGN_TYPE.CONTENT_MARKETING]: '#14b8a6'
};

// Campaign Master Data Template
export const CAMPAIGN_MASTER_DATA_TEMPLATE = {
  id: '',
  name: '',
  code: '',
  description: '',
  type: CAMPAIGN_TYPE.CLIENT,
  status: CAMPAIGN_STATUS.PLANNING,
  priority: CAMPAIGN_PRIORITY.MEDIUM,
  start_date: '',
  end_date: '',
  planned_hours: 0,
  actual_hours: 0,
  budget: 0,
  hourly_rate: 0,
  billing_type: 'hourly',
  currency: 'USD',
  is_billable: true,
  is_active: true,
  client_name: '',
  client_contact_name: '',
  client_contact_email: '',
  client_contact_phone: '',
  client_address: '',
  assigned_campaign_leaders: [],
  assigned_team_members: [],
  assigned_executives: [],
  task_templates: [],
  deliverables: [],
  milestones: [],
  notes: '',
  tags: [],
  created_date: '',
  created_by: '',
  last_modified: '',
  modified_by: '',
  completion_percentage: 0,
  risk_level: 'low',
  dependencies: [],
  resources_required: [],
  success_metrics: [],
  approval_required: false,
  approved_by: '',
  approval_date: '',
  archived: false,
  archived_date: '',
  archived_by: ''
};

// Sub Campaign Template
export const SUB_CAMPAIGN_TEMPLATE = {
  id: '',
  parent_campaign_id: '',
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  assigned_team_members: [],
  task_templates: [],
  budget_allocation: 0,
  status: CAMPAIGN_STATUS.PLANNING,
  completion_percentage: 0,
  deliverables: [],
  notes: ''
};

// Task Template Structure
export const TASK_TEMPLATE = {
  id: '',
  campaign_id: '',
  name: '',
  description: '',
  estimated_hours: 0,
  hourly_rate: 0,
  is_billable: true,
  required_skills: [],
  assigned_roles: [],
  dependencies: [],
  priority: CAMPAIGN_PRIORITY.MEDIUM,
  category: '',
  tags: [],
  deliverable_type: '',
  approval_required: false,
  recurring: false,
  recurring_frequency: '',
  template_active: true
};

// Validation Functions
export const validateCampaignData = (campaignData) => {
  const errors = [];

  // Required field validation
  if (!campaignData.name || campaignData.name.trim() === '') {
    errors.push('Campaign name is required');
  }

  if (!campaignData.code || campaignData.code.trim() === '') {
    errors.push('Campaign code is required');
  }

  if (!campaignData.start_date) {
    errors.push('Start date is required');
  }

  if (!campaignData.end_date) {
    errors.push('End date is required');
  }

  // Date validation
  if (campaignData.start_date && campaignData.end_date) {
    const startDate = new Date(campaignData.start_date);
    const endDate = new Date(campaignData.end_date);
    
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
  }

  // Budget validation
  if (campaignData.budget < 0) {
    errors.push('Budget cannot be negative');
  }

  if (campaignData.hourly_rate < 0) {
    errors.push('Hourly rate cannot be negative');
  }

  if (campaignData.planned_hours < 0) {
    errors.push('Planned hours cannot be negative');
  }

  // Email validation
  if (campaignData.client_contact_email && campaignData.client_contact_email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(campaignData.client_contact_email)) {
      errors.push('Invalid email format for client contact');
    }
  }

  // Code uniqueness (would need to check against existing campaigns in real implementation)
  if (campaignData.code && campaignData.code.length < 3) {
    errors.push('Campaign code must be at least 3 characters long');
  }

  return errors;
};

// Campaign Code Generation
export const generateCampaignCode = (campaignType, customPrefix = '') => {
  const typePrefix = {
    [CAMPAIGN_TYPE.CLIENT]: 'CLI',
    [CAMPAIGN_TYPE.INTERNAL]: 'INT',
    [CAMPAIGN_TYPE.MARKETING]: 'MKT',
    [CAMPAIGN_TYPE.PRODUCT_LAUNCH]: 'PLN',
    [CAMPAIGN_TYPE.BRAND_AWARENESS]: 'BRD',
    [CAMPAIGN_TYPE.LEAD_GENERATION]: 'LGN',
    [CAMPAIGN_TYPE.DIGITAL_MARKETING]: 'DIG',
    [CAMPAIGN_TYPE.SOCIAL_MEDIA]: 'SOC',
    [CAMPAIGN_TYPE.EMAIL_MARKETING]: 'EML',
    [CAMPAIGN_TYPE.CONTENT_MARKETING]: 'CNT'
  };

  const prefix = customPrefix || typePrefix[campaignType] || 'CAM';
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `${prefix}-${timestamp}-${randomSuffix}`;
};

// Status Label Functions
export const getCampaignStatusLabel = (status) => {
  const labels = {
    [CAMPAIGN_STATUS.PLANNING]: 'Planning',
    [CAMPAIGN_STATUS.ACTIVE]: 'Active',
    [CAMPAIGN_STATUS.ON_HOLD]: 'On Hold',
    [CAMPAIGN_STATUS.COMPLETED]: 'Completed',
    [CAMPAIGN_STATUS.CANCELLED]: 'Cancelled'
  };
  return labels[status] || 'Unknown';
};

export const getCampaignTypeLabel = (type) => {
  const labels = {
    [CAMPAIGN_TYPE.CLIENT]: 'Client Project',
    [CAMPAIGN_TYPE.INTERNAL]: 'Internal Project',
    [CAMPAIGN_TYPE.MARKETING]: 'Marketing Campaign',
    [CAMPAIGN_TYPE.PRODUCT_LAUNCH]: 'Product Launch',
    [CAMPAIGN_TYPE.BRAND_AWARENESS]: 'Brand Awareness',
    [CAMPAIGN_TYPE.LEAD_GENERATION]: 'Lead Generation',
    [CAMPAIGN_TYPE.DIGITAL_MARKETING]: 'Digital Marketing',
    [CAMPAIGN_TYPE.SOCIAL_MEDIA]: 'Social Media',
    [CAMPAIGN_TYPE.EMAIL_MARKETING]: 'Email Marketing',
    [CAMPAIGN_TYPE.CONTENT_MARKETING]: 'Content Marketing'
  };
  return labels[type] || 'Unknown';
};

export const getPriorityLabel = (priority) => {
  const labels = {
    [CAMPAIGN_PRIORITY.LOW]: 'Low Priority',
    [CAMPAIGN_PRIORITY.MEDIUM]: 'Medium Priority',
    [CAMPAIGN_PRIORITY.HIGH]: 'High Priority',
    [CAMPAIGN_PRIORITY.CRITICAL]: 'Critical Priority'
  };
  return labels[priority] || 'Unknown';
};

// Mock Data Generation
export const generateMockCampaignData = () => {
  return [
    {
      id: 'camp_1',
      name: 'Digital Marketing Q1 2024',
      code: 'DIG-240101-ABC',
      description: 'Comprehensive digital marketing campaign for Q1 2024 focusing on brand awareness and lead generation.',
      type: CAMPAIGN_TYPE.DIGITAL_MARKETING,
      status: CAMPAIGN_STATUS.ACTIVE,
      priority: CAMPAIGN_PRIORITY.HIGH,
      start_date: '2024-01-01',
      end_date: '2024-03-31',
      planned_hours: 480,
      actual_hours: 120,
      budget: 50000,
      hourly_rate: 75,
      billing_type: 'hourly',
      currency: 'USD',
      is_billable: true,
      is_active: true,
      client_name: 'Acme Corporation',
      client_contact_name: 'John Smith',
      client_contact_email: 'john.smith@acme.com',
      client_contact_phone: '+1-555-0123',
      assigned_campaign_leaders: ['emp3'],
      assigned_team_members: ['emp2', 'emp4'],
      assigned_executives: ['emp1'],
      completion_percentage: 25,
      created_date: '2023-12-15',
      created_by: 'emp1',
      last_modified: '2024-01-15',
      modified_by: 'emp3'
    },
    {
      id: 'camp_2',
      name: 'Product Launch Campaign',
      code: 'PLN-240201-XYZ',
      description: 'Launch campaign for new mobile application with focus on user acquisition and market penetration.',
      type: CAMPAIGN_TYPE.PRODUCT_LAUNCH,
      status: CAMPAIGN_STATUS.PLANNING,
      priority: CAMPAIGN_PRIORITY.CRITICAL,
      start_date: '2024-02-01',
      end_date: '2024-04-30',
      planned_hours: 600,
      actual_hours: 0,
      budget: 75000,
      hourly_rate: 85,
      billing_type: 'project',
      currency: 'USD',
      is_billable: true,
      is_active: true,
      client_name: 'TechStart Inc',
      client_contact_name: 'Sarah Johnson',
      client_contact_email: 'sarah@techstart.com',
      client_contact_phone: '+1-555-0456',
      assigned_campaign_leaders: ['emp3'],
      assigned_team_members: ['emp2'],
      assigned_executives: ['emp1'],
      completion_percentage: 0,
      created_date: '2024-01-10',
      created_by: 'emp1',
      last_modified: '2024-01-20',
      modified_by: 'emp3'
    },
    {
      id: 'camp_3',
      name: 'Internal Brand Refresh',
      code: 'INT-240115-BRD',
      description: 'Internal project to refresh company branding and marketing materials.',
      type: CAMPAIGN_TYPE.INTERNAL,
      status: CAMPAIGN_STATUS.COMPLETED,
      priority: CAMPAIGN_PRIORITY.MEDIUM,
      start_date: '2023-11-01',
      end_date: '2024-01-15',
      planned_hours: 200,
      actual_hours: 185,
      budget: 15000,
      hourly_rate: 65,
      billing_type: 'fixed',
      currency: 'USD',
      is_billable: false,
      is_active: true,
      client_name: '',
      client_contact_name: '',
      client_contact_email: '',
      client_contact_phone: '',
      assigned_campaign_leaders: ['emp3'],
      assigned_team_members: ['emp2', 'emp4'],
      assigned_executives: ['emp1'],
      completion_percentage: 100,
      created_date: '2023-10-15',
      created_by: 'emp1',
      last_modified: '2024-01-15',
      modified_by: 'emp3'
    }
  ];
};

// Utility Functions
export const calculateCampaignProgress = (campaign) => {
  if (!campaign.start_date || !campaign.end_date) return 0;
  
  const startDate = new Date(campaign.start_date);
  const endDate = new Date(campaign.end_date);
  const currentDate = new Date();
  
  if (currentDate < startDate) return 0;
  if (currentDate > endDate) return 100;
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsedDuration = currentDate.getTime() - startDate.getTime();
  
  return Math.round((elapsedDuration / totalDuration) * 100);
};

export const calculateBudgetUtilization = (campaign) => {
  if (!campaign.budget || campaign.budget === 0) return 0;
  
  const spentAmount = (campaign.actual_hours || 0) * (campaign.hourly_rate || 0);
  return Math.round((spentAmount / campaign.budget) * 100);
};

export const getCampaignHealthStatus = (campaign) => {
  const progress = calculateCampaignProgress(campaign);
  const budgetUtilization = calculateBudgetUtilization(campaign);
  const completionPercentage = campaign.completion_percentage || 0;
  
  // Simple health calculation
  if (budgetUtilization > 90 && completionPercentage < 80) {
    return { status: 'at_risk', color: '#ef4444', label: 'At Risk' };
  } else if (progress > completionPercentage + 20) {
    return { status: 'behind_schedule', color: '#f59e0b', label: 'Behind Schedule' };
  } else if (completionPercentage > progress + 10) {
    return { status: 'ahead_of_schedule', color: '#10b981', label: 'Ahead of Schedule' };
  } else {
    return { status: 'on_track', color: '#3b82f6', label: 'On Track' };
  }
};

// Export all constants and functions
export default {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  CAMPAIGN_PRIORITY,
  CAMPAIGN_STATUS_COLORS,
  PRIORITY_COLORS,
  CAMPAIGN_COLOR_SCHEME,
  CAMPAIGN_MASTER_DATA_TEMPLATE,
  SUB_CAMPAIGN_TEMPLATE,
  TASK_TEMPLATE,
  validateCampaignData,
  generateCampaignCode,
  getCampaignStatusLabel,
  getCampaignTypeLabel,
  getPriorityLabel,
  generateMockCampaignData,
  calculateCampaignProgress,
  calculateBudgetUtilization,
  getCampaignHealthStatus
};

