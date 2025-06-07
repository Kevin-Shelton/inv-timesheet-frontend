// dataTemplates.jsx - Data Templates and Structures for Upload System
// This file defines the data structures and validation rules for employee and payroll uploads

export const EMPLOYEE_TEMPLATE_STRUCTURE = {
  // Required fields
  email: {
    type: 'string',
    required: true,
    validation: 'email',
    description: 'Employee email address (must be unique)',
    example: 'john.doe@company.com'
  },
  full_name: {
    type: 'string',
    required: true,
    validation: 'text',
    description: 'Employee full name',
    example: 'John Doe'
  },
  role: {
    type: 'string',
    required: true,
    validation: 'enum',
    options: ['admin', 'campaign_lead', 'team_member'],
    description: 'Employee role in the organization',
    example: 'team_member'
  },
  hire_date: {
    type: 'date',
    required: true,
    validation: 'date',
    description: 'Employee hire date (YYYY-MM-DD)',
    example: '2024-01-15'
  },
  
  // Optional fields
  pay_rate_per_hour: {
    type: 'number',
    required: false,
    validation: 'decimal',
    description: 'Hourly pay rate in USD',
    example: '18.50'
  },
  department: {
    type: 'string',
    required: false,
    validation: 'text',
    description: 'Department or team assignment',
    example: 'Customer Service'
  },
  employee_id: {
    type: 'string',
    required: false,
    validation: 'text',
    description: 'Internal employee ID',
    example: 'EMP001'
  },
  phone: {
    type: 'string',
    required: false,
    validation: 'phone',
    description: 'Employee phone number',
    example: '+1-555-123-4567'
  },
  address: {
    type: 'string',
    required: false,
    validation: 'text',
    description: 'Employee address',
    example: '123 Main St, City, State 12345'
  },
  emergency_contact_name: {
    type: 'string',
    required: false,
    validation: 'text',
    description: 'Emergency contact full name',
    example: 'Jane Doe'
  },
  emergency_contact_phone: {
    type: 'string',
    required: false,
    validation: 'phone',
    description: 'Emergency contact phone number',
    example: '+1-555-987-6543'
  },
  end_date: {
    type: 'date',
    required: false,
    validation: 'date',
    description: 'Employee end date (leave blank for active employees)',
    example: '2024-12-31'
  },
  leave_start_date: {
    type: 'date',
    required: false,
    validation: 'date',
    description: 'Leave start date (if on leave)',
    example: '2024-06-01'
  },
  leave_end_date: {
    type: 'date',
    required: false,
    validation: 'date',
    description: 'Expected leave end date',
    example: '2024-08-01'
  },
  leave_type: {
    type: 'string',
    required: false,
    validation: 'enum',
    options: ['medical', 'maternity', 'paternity', 'personal', 'vacation', 'other'],
    description: 'Type of leave',
    example: 'medical'
  },
  notes: {
    type: 'string',
    required: false,
    validation: 'text',
    description: 'Additional notes about the employee',
    example: 'Bilingual - English/Spanish'
  }
}

export const PAYROLL_TEMPLATE_STRUCTURE = {
  // Required fields
  employee_email: {
    type: 'string',
    required: true,
    validation: 'email',
    description: 'Employee email (must match existing employee)',
    example: 'john.doe@company.com'
  },
  pay_period_start: {
    type: 'date',
    required: true,
    validation: 'date',
    description: 'Pay period start date (YYYY-MM-DD)',
    example: '2024-01-01'
  },
  pay_period_end: {
    type: 'date',
    required: true,
    validation: 'date',
    description: 'Pay period end date (YYYY-MM-DD)',
    example: '2024-01-15'
  },
  regular_hours: {
    type: 'number',
    required: true,
    validation: 'decimal',
    description: 'Regular hours worked',
    example: '80.0'
  },
  
  // Optional fields
  overtime_hours: {
    type: 'number',
    required: false,
    validation: 'decimal',
    description: 'Overtime hours worked',
    example: '5.0'
  },
  holiday_hours: {
    type: 'number',
    required: false,
    validation: 'decimal',
    description: 'Holiday hours worked',
    example: '8.0'
  },
  sick_hours: {
    type: 'number',
    required: false,
    validation: 'decimal',
    description: 'Sick hours taken',
    example: '4.0'
  },
  vacation_hours: {
    type: 'number',
    required: false,
    validation: 'decimal',
    description: 'Vacation hours taken',
    example: '16.0'
  },
  bonus_amount: {
    type: 'number',
    required: false,
    validation: 'decimal',
    description: 'Bonus amount in USD',
    example: '500.00'
  },
  commission_amount: {
    type: 'number',
    required: false,
    validation: 'decimal',
    description: 'Commission amount in USD',
    example: '250.00'
  },
  deduction_amount: {
    type: 'number',
    required: false,
    validation: 'decimal',
    description: 'Total deductions in USD',
    example: '50.00'
  },
  deduction_description: {
    type: 'string',
    required: false,
    validation: 'text',
    description: 'Description of deductions',
    example: 'Health insurance, 401k'
  },
  campaign_name: {
    type: 'string',
    required: false,
    validation: 'text',
    description: 'Campaign or project name',
    example: 'Q1 Customer Outreach'
  },
  cost_center: {
    type: 'string',
    required: false,
    validation: 'text',
    description: 'Cost center or department code',
    example: 'CS-001'
  },
  notes: {
    type: 'string',
    required: false,
    validation: 'text',
    description: 'Additional payroll notes',
    example: 'Performance bonus included'
  }
}

// Validation functions
export const validateField = (value, fieldConfig) => {
  const errors = []
  
  // Check required fields
  if (fieldConfig.required && (!value || value.toString().trim() === '')) {
    errors.push(`${fieldConfig.description} is required`)
    return errors
  }
  
  // Skip validation if field is empty and not required
  if (!value || value.toString().trim() === '') {
    return errors
  }
  
  // Type-specific validation
  switch (fieldConfig.validation) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errors.push('Invalid email format')
      }
      break
      
    case 'date':
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(value)) {
        errors.push('Date must be in YYYY-MM-DD format')
      } else {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          errors.push('Invalid date')
        }
      }
      break
      
    case 'decimal':
      const num = parseFloat(value)
      if (isNaN(num) || num < 0) {
        errors.push('Must be a positive number')
      }
      break
      
    case 'phone':
      const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/
      if (!phoneRegex.test(value)) {
        errors.push('Invalid phone number format')
      }
      break
      
    case 'enum':
      if (!fieldConfig.options.includes(value)) {
        errors.push(`Must be one of: ${fieldConfig.options.join(', ')}`)
      }
      break
      
    case 'text':
      if (value.length > 500) {
        errors.push('Text too long (max 500 characters)')
      }
      break
  }
  
  return errors
}

// Generate CSV template content
export const generateCSVTemplate = (templateStructure, templateName) => {
  const headers = Object.keys(templateStructure)
  const descriptions = headers.map(key => templateStructure[key].description)
  const examples = headers.map(key => templateStructure[key].example || '')
  const required = headers.map(key => templateStructure[key].required ? 'REQUIRED' : 'OPTIONAL')
  
  const csvContent = [
    `# ${templateName} Upload Template`,
    `# Instructions: Fill in the data below. Required fields must have values.`,
    `# Delete these instruction lines before uploading.`,
    '',
    `# Field Descriptions:`,
    ...headers.map((header, index) => `# ${header}: ${descriptions[index]} (${required[index]})`),
    '',
    headers.join(','),
    examples.join(',')
  ].join('\n')
  
  return csvContent
}

// Employee status calculation
export const calculateEmployeeStatus = (employee) => {
  const now = new Date()
  const endDate = employee.end_date ? new Date(employee.end_date) : null
  const leaveStartDate = employee.leave_start_date ? new Date(employee.leave_start_date) : null
  const leaveEndDate = employee.leave_end_date ? new Date(employee.leave_end_date) : null
  
  // Check if employee has ended employment
  if (endDate && endDate < now) {
    // Exception: if on leave, still considered active until leave ends
    if (leaveStartDate && leaveEndDate && now >= leaveStartDate && now <= leaveEndDate) {
      return {
        status: 'on_leave',
        active: true,
        reason: `On ${employee.leave_type || 'leave'} until ${leaveEndDate.toLocaleDateString()}`
      }
    }
    return {
      status: 'terminated',
      active: false,
      reason: `Employment ended on ${endDate.toLocaleDateString()}`
    }
  }
  
  // Check if employee is currently on leave
  if (leaveStartDate && leaveEndDate && now >= leaveStartDate && now <= leaveEndDate) {
    return {
      status: 'on_leave',
      active: true,
      reason: `On ${employee.leave_type || 'leave'} until ${leaveEndDate.toLocaleDateString()}`
    }
  }
  
  // Check if employee is scheduled for future leave
  if (leaveStartDate && now < leaveStartDate) {
    return {
      status: 'active',
      active: true,
      reason: `Scheduled for ${employee.leave_type || 'leave'} starting ${leaveStartDate.toLocaleDateString()}`
    }
  }
  
  // Default: active employee
  return {
    status: 'active',
    active: true,
    reason: 'Currently active'
  }
}

// Data processing utilities
export const processUploadData = (data, templateStructure) => {
  const results = {
    valid: [],
    errors: [],
    warnings: []
  }
  
  data.forEach((row, index) => {
    const rowErrors = []
    const processedRow = {}
    
    // Validate each field
    Object.keys(templateStructure).forEach(fieldName => {
      const fieldConfig = templateStructure[fieldName]
      const value = row[fieldName]
      
      const fieldErrors = validateField(value, fieldConfig)
      if (fieldErrors.length > 0) {
        rowErrors.push(...fieldErrors.map(error => `${fieldName}: ${error}`))
      } else {
        processedRow[fieldName] = value
      }
    })
    
    if (rowErrors.length > 0) {
      results.errors.push({
        row: index + 1,
        data: row,
        errors: rowErrors
      })
    } else {
      results.valid.push(processedRow)
    }
  })
  
  return results
}

export default {
  EMPLOYEE_TEMPLATE_STRUCTURE,
  PAYROLL_TEMPLATE_STRUCTURE,
  validateField,
  generateCSVTemplate,
  calculateEmployeeStatus,
  processUploadData
}


