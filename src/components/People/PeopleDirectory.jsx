import React, { useState, useEffect, useMemo } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Save,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  Clock,
  DollarSign,
  User,
  ChevronDown,
  Check,
  AlertCircle
} from 'lucide-react'
import { supabaseApi } from '../../supabaseClient'
import './people-directory.css'

const PeopleDirectory = () => {
  // State management
  const [employees, setEmployees] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    employmentType: '',
    role: ''
  })
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view') // 'view', 'edit', 'create'
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showRates, setShowRates] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    email: '',
    phone_number: '',
    job_title: '',
    department: '',
    role: '',
    employment_type: '',
    employment_status: '',
    expected_weekly_hours: 40,
    hourly_rate: '',
    billable_rate: '',
    is_billable: false,
    location: '',
    time_zone: 'America/New_York',
    manager_id: '',
    hire_date: '',
    pto_balance: 0,
    sick_balance: 0,
    assigned_campaigns: []
  })

  // Campaign assignment state
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false)
  const [selectedCampaigns, setSelectedCampaigns] = useState([])

  // User permissions (mock for now - replace with actual auth)
  const [userPermissions, setUserPermissions] = useState({
    canEdit: true,
    canDelete: true,
    canViewRates: true,
    isAdmin: true
  })

  // Load data on component mount
  useEffect(() => {
    loadEmployees()
    loadCampaigns()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const data = await supabaseApi.getAllEmployees()
      setEmployees(data)
    } catch (err) {
      console.error('Error loading employees:', err)
      setError('Failed to load employees')
      // Fallback data for development
      setEmployees([
        {
          id: '1',
          full_name: 'Alice Brown',
          display_name: 'Alice',
          email: 'alice.brown@bpocompany.com',
          phone_number: '+1-555-0101',
          job_title: 'Customer Service Representative',
          department: 'Customer Support',
          role: 'team_member',
          employment_type: 'full_time',
          employment_status: 'active',
          expected_weekly_hours: 40,
          hourly_rate: 22.50,
          billable_rate: 35.00,
          is_billable: true,
          location: 'Main Office - Floor 2',
          time_zone: 'America/New_York',
          hire_date: '2023-03-15',
          pto_balance: 18.5,
          sick_balance: 8.0,
          assigned_campaigns: ['Customer Support Campaign', 'Data Entry Project']
        },
        {
          id: '2',
          full_name: 'Bob Wilson',
          display_name: 'Bob',
          email: 'bob.wilson@bpocompany.com',
          phone_number: '+1-555-0102',
          job_title: 'Data Entry Specialist',
          department: 'Operations',
          role: 'team_member',
          employment_type: 'full_time',
          employment_status: 'active',
          expected_weekly_hours: 40,
          hourly_rate: 20.00,
          billable_rate: 30.00,
          is_billable: true,
          location: 'Main Office - Floor 1',
          time_zone: 'America/New_York',
          hire_date: '2023-01-10',
          pto_balance: 15.0,
          sick_balance: 10.0,
          assigned_campaigns: ['Data Entry Project']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadCampaigns = async () => {
    try {
      const data = await supabaseApi.getCampaigns()
      setCampaigns(data)
    } catch (err) {
      console.error('Error loading campaigns:', err)
      // Fallback data for development
      setCampaigns([
        { id: '1', name: 'Customer Support Campaign', client_name: 'ABC Corp', status: 'active' },
        { id: '2', name: 'Data Entry Project', client_name: 'XYZ Inc', status: 'active' },
        { id: '3', name: 'Sales Outreach Campaign', client_name: 'DEF Ltd', status: 'active' },
        { id: '4', name: 'Technical Support', client_name: 'GHI Corp', status: 'active' },
        { id: '5', name: 'Content Moderation', client_name: 'JKL Media', status: 'active' }
      ])
    }
  }

  // Filter and search logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = !searchTerm || 
        employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment = !filters.department || employee.department === filters.department
      const matchesStatus = !filters.status || employee.employment_status === filters.status
      const matchesType = !filters.employmentType || employee.employment_type === filters.employmentType
      const matchesRole = !filters.role || employee.role === filters.role

      return matchesSearch && matchesDepartment && matchesStatus && matchesType && matchesRole
    })
  }, [employees, searchTerm, filters])

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    return {
      departments: [...new Set(employees.map(emp => emp.department).filter(Boolean))],
      statuses: [...new Set(employees.map(emp => emp.employment_status).filter(Boolean))],
      employmentTypes: [...new Set(employees.map(emp => emp.employment_type).filter(Boolean))],
      roles: [...new Set(employees.map(emp => emp.role).filter(Boolean))]
    }
  }, [employees])

  // Predefined options for dropdowns
  const dropdownOptions = {
    departments: ['Customer Support', 'Operations', 'Sales', 'Marketing', 'IT', 'HR', 'Finance', 'Administration'],
    roles: ['admin', 'team_member', 'supervisor', 'manager'],
    employmentTypes: ['full_time', 'part_time', 'contractor', 'intern', 'temporary'],
    employmentStatuses: ['active', 'on_leave', 'terminated', 'inactive'],
    timeZones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix']
  }

  // Modal handlers
  const openModal = (mode, employee = null) => {
    setModalMode(mode)
    setSelectedEmployee(employee)
    if (employee) {
      setFormData({
        ...employee,
        assigned_campaigns: employee.assigned_campaigns || []
      })
      setSelectedCampaigns(employee.assigned_campaigns || [])
    } else {
      setFormData({
        full_name: '',
        display_name: '',
        email: '',
        phone_number: '',
        job_title: '',
        department: '',
        role: 'team_member',
        employment_type: 'full_time',
        employment_status: 'active',
        expected_weekly_hours: 40,
        hourly_rate: '',
        billable_rate: '',
        is_billable: false,
        location: '',
        time_zone: 'America/New_York',
        manager_id: '',
        hire_date: '',
        pto_balance: 0,
        sick_balance: 0,
        assigned_campaigns: []
      })
      setSelectedCampaigns([])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEmployee(null)
    setModalMode('view')
    setShowCampaignDropdown(false)
  }

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCampaignToggle = (campaignName) => {
    const updatedCampaigns = selectedCampaigns.includes(campaignName)
      ? selectedCampaigns.filter(c => c !== campaignName)
      : [...selectedCampaigns, campaignName]
    
    setSelectedCampaigns(updatedCampaigns)
    setFormData(prev => ({
      ...prev,
      assigned_campaigns: updatedCampaigns
    }))
  }

  const handleSave = async () => {
    try {
      if (modalMode === 'create') {
        const newEmployee = await supabaseApi.createEmployee(formData)
        setEmployees(prev => [...prev, newEmployee])
      } else if (modalMode === 'edit') {
        const updatedEmployee = await supabaseApi.updateEmployee(selectedEmployee.id, formData)
        setEmployees(prev => prev.map(emp => 
          emp.id === selectedEmployee.id ? updatedEmployee : emp
        ))
      }
      closeModal()
    } catch (err) {
      console.error('Error saving employee:', err)
      alert('Failed to save employee')
    }
  }

  const handleDelete = async (employeeId) => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    
    try {
      await supabaseApi.deleteEmployee(employeeId)
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId))
    } catch (err) {
      console.error('Error deleting employee:', err)
      alert('Failed to delete employee')
    }
  }

  // Utility functions
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'
  }

  const formatCurrency = (amount) => {
    return amount ? `$${parseFloat(amount).toFixed(2)}` : '$0.00'
  }

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'Not set'
  }

  const getPresenceStatus = (employee) => {
    // Mock presence logic - replace with actual implementation
    const statuses = ['online', 'away', 'offline']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  // Render editable dropdown
  const renderEditableDropdown = (field, value, options, placeholder = 'Select...') => {
    const [isOpen, setIsOpen] = useState(false)
    const [customValue, setCustomValue] = useState('')
    const [showCustomInput, setShowCustomInput] = useState(false)

    const allOptions = [...new Set([...options, ...(value && !options.includes(value) ? [value] : [])])]

    return (
      <div className="editable-dropdown">
        <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
          <span>{value || placeholder}</span>
          <ChevronDown size={16} />
        </div>
        
        {isOpen && (
          <div className="dropdown-menu">
            {allOptions.map(option => (
              <div
                key={option}
                className={`dropdown-item ${value === option ? 'selected' : ''}`}
                onClick={() => {
                  handleInputChange(field, option)
                  setIsOpen(false)
                }}
              >
                {option}
              </div>
            ))}
            
            <div className="dropdown-divider" />
            
            {!showCustomInput ? (
              <div
                className="dropdown-item add-custom"
                onClick={() => setShowCustomInput(true)}
              >
                <Plus size={14} />
                Add Custom Value
              </div>
            ) : (
              <div className="custom-input-container">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Enter custom value"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && customValue.trim()) {
                      handleInputChange(field, customValue.trim())
                      setIsOpen(false)
                      setShowCustomInput(false)
                      setCustomValue('')
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (customValue.trim()) {
                      handleInputChange(field, customValue.trim())
                      setIsOpen(false)
                      setShowCustomInput(false)
                      setCustomValue('')
                    }
                  }}
                >
                  <Check size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render campaign multi-select
  const renderCampaignMultiSelect = () => {
    return (
      <div className="campaign-multiselect">
        <div 
          className="multiselect-trigger"
          onClick={() => setShowCampaignDropdown(!showCampaignDropdown)}
        >
          <span>
            {selectedCampaigns.length === 0 
              ? 'Select Campaigns...' 
              : `${selectedCampaigns.length} campaign(s) selected`
            }
          </span>
          <ChevronDown size={16} />
        </div>
        
        {showCampaignDropdown && (
          <div className="multiselect-dropdown">
            <div className="multiselect-header">
              <span>Select Campaigns</span>
              <button onClick={() => setSelectedCampaigns([])}>
                Clear All
              </button>
            </div>
            
            {campaigns.map(campaign => (
              <div
                key={campaign.id}
                className={`multiselect-item ${selectedCampaigns.includes(campaign.name) ? 'selected' : ''}`}
                onClick={() => handleCampaignToggle(campaign.name)}
              >
                <div className="campaign-info">
                  <span className="campaign-name">{campaign.name}</span>
                  <span className="campaign-client">{campaign.client_name}</span>
                </div>
                {selectedCampaigns.includes(campaign.name) && (
                  <Check size={16} className="check-icon" />
                )}
              </div>
            ))}
          </div>
        )}
        
        {selectedCampaigns.length > 0 && (
          <div className="selected-campaigns">
            {selectedCampaigns.map(campaign => (
              <span key={campaign} className="campaign-tag">
                {campaign}
                <X 
                  size={12} 
                  onClick={() => handleCampaignToggle(campaign)}
                />
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="people-directory">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="people-directory">
      {/* Header */}
      <div className="directory-header">
        <div className="header-left">
          <div className="header-icon">
            <Users size={24} />
          </div>
          <div className="header-text">
            <h1>People Directory</h1>
            <p>Manage employee information and organizational structure</p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'cards' ? 'active' : ''}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </button>
            <button 
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
          
          {userPermissions.canViewRates && (
            <button 
              className={`rates-toggle ${showRates ? 'active' : ''}`}
              onClick={() => setShowRates(!showRates)}
            >
              Show Rates
            </button>
          )}
          
          {userPermissions.canEdit && (
            <button 
              className="add-employee-btn"
              onClick={() => openModal('create')}
            >
              <Plus size={16} />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="directory-filters">
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdowns">
          <select
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
          >
            <option value="">All Departments</option>
            {filterOptions.departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            {filterOptions.statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select
            value={filters.employmentType}
            onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value }))}
          >
            <option value="">All Types</option>
            {filterOptions.employmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          >
            <option value="">All Roles</option>
            {filterOptions.roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee List */}
      {viewMode === 'cards' ? (
        <div className="employee-cards">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="employee-card">
              <div className="card-header">
                <div className="employee-avatar">
                  <span>{getInitials(employee.full_name)}</span>
                  <div className={`presence-indicator ${getPresenceStatus(employee)}`}></div>
                </div>
                
                <div className="employee-info">
                  <h3>{employee.full_name}</h3>
                  <p className="job-title">{employee.job_title}</p>
                  <p className="department">{employee.department}</p>
                </div>
                
                <div className="card-actions">
                  <button onClick={() => openModal('view', employee)}>
                    <Eye size={16} />
                  </button>
                  {userPermissions.canEdit && (
                    <button onClick={() => openModal('edit', employee)}>
                      <Edit size={16} />
                    </button>
                  )}
                  {userPermissions.canDelete && (
                    <button onClick={() => handleDelete(employee.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="card-details">
                <div className="detail-row">
                  <Mail size={14} />
                  <span>{employee.email}</span>
                </div>
                
                {employee.phone_number && (
                  <div className="detail-row">
                    <Phone size={14} />
                    <span>{employee.phone_number}</span>
                  </div>
                )}
                
                {employee.location && (
                  <div className="detail-row">
                    <MapPin size={14} />
                    <span>{employee.location}</span>
                  </div>
                )}
                
                <div className="detail-row">
                  <Clock size={14} />
                  <span>{employee.expected_weekly_hours}h/week</span>
                </div>
                
                {showRates && userPermissions.canViewRates && (
                  <div className="detail-row">
                    <DollarSign size={14} />
                    <span>{formatCurrency(employee.hourly_rate)}/hr</span>
                  </div>
                )}
                
                {employee.assigned_campaigns && employee.assigned_campaigns.length > 0 && (
                  <div className="campaigns-section">
                    <h4>Assigned Campaigns</h4>
                    <div className="campaign-tags">
                      {employee.assigned_campaigns.map(campaign => (
                        <span key={campaign} className="campaign-tag">
                          {campaign}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="card-footer">
                <span className={`status-badge ${employee.employment_status}`}>
                  {employee.employment_status}
                </span>
                <span className={`type-badge ${employee.employment_type}`}>
                  {employee.employment_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="employee-table-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Type</th>
                <th>Hours/Week</th>
                {showRates && <th>Rate</th>}
                <th>Campaigns</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar small">
                        <span>{getInitials(employee.full_name)}</span>
                        <div className={`presence-indicator ${getPresenceStatus(employee)}`}></div>
                      </div>
                      <div>
                        <div className="employee-name">{employee.full_name}</div>
                        <div className="employee-email">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{employee.department}</td>
                  <td>
                    <span className={`role-badge ${employee.role}`}>
                      {employee.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${employee.employment_status}`}>
                      {employee.employment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`type-badge ${employee.employment_type}`}>
                      {employee.employment_type}
                    </span>
                  </td>
                  <td>{employee.expected_weekly_hours}h</td>
                  {showRates && (
                    <td>{formatCurrency(employee.hourly_rate)}</td>
                  )}
                  <td>
                    <div className="campaigns-cell">
                      {employee.assigned_campaigns?.slice(0, 2).map(campaign => (
                        <span key={campaign} className="campaign-tag small">
                          {campaign}
                        </span>
                      ))}
                      {employee.assigned_campaigns?.length > 2 && (
                        <span className="more-campaigns">
                          +{employee.assigned_campaigns.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => openModal('view', employee)}>
                        <Eye size={14} />
                      </button>
                      {userPermissions.canEdit && (
                        <button onClick={() => openModal('edit', employee)}>
                          <Edit size={14} />
                        </button>
                      )}
                      {userPermissions.canDelete && (
                        <button onClick={() => handleDelete(employee.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? 'Add New Employee' : 
                 modalMode === 'edit' ? 'Edit Employee' : 'Employee Details'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Full Name *</label>
                      {modalMode === 'view' ? (
                        <span className="field-value">{formData.full_name}</span>
                      ) : (
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          placeholder="Enter full name"
                        />
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label>Display Name</label>
                      {modalMode === 'view' ? (
                        <span className="field-value">{formData.display_name || 'Not set'}</span>
                      ) : (
                        <input
                          type="text"
                          value={formData.display_name}
                          onChange={(e) => handleInputChange('display_name', e.target.value)}
                          placeholder="Enter display name"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Email *</label>
                      {modalMode === 'view' ? (
                        <span className="field-value">{formData.email}</span>
                      ) : (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter email address"
                        />
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label>Phone Number</label>
                      {modalMode === 'view' ? (
                        <span className="field-value">{formData.phone_number || 'Not set'}</span>
                      ) : (
                        <input
                          type="tel"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="form-section">
                  <h3>Employment Information</h3>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Job Title *</label>
                      {modalMode === 'view' ? (
                        <span className="field-value">{formData.job_title}</span>
                      ) : (
                        <input
                          type="text"
                          value={formData.job_title}
                          onChange={(e) => handleInputChange('job_title', e.target.value)}
                          placeholder="Enter job title"
                        />
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label>Department *</label>
                      {modalMode === 'view' ? (
                        <span className="field-value">{formData.department}</span>
                      ) : (
                        renderEditableDropdown('department', formData.department, dropdownOptions.departments, 'Select Department')
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Role</label>
                      {modalMode === 'view' ? (
                        <span className={`field-value role-badge ${formData.role}`}>{formData.role}</span>
                      ) : (
                        renderEditableDropdown('role', formData.role, dropdownOptions.roles, 'Select Role')
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label>Employment Type</label>
                      {modalMode === 'view' ? (
                        <span className={`field-value type-badge ${formData.employment_type}`}>{formData.employment_type}</span>
                      ) : (
                        renderEditableDropdown('employment_type', formData.employment_type, dropdownOptions.employmentTypes, 'Select Type')
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Employment Status</label>
                      {modalMode === 'view' ? (
                        <span className={`field-value status-badge ${formData.employment_status}`}>{formData.employment_status}</span>
                      ) : (
                        renderEditableDropdown('employment_status', formData.employment_status, dropdownOptions.employmentStatuses, 'Select Status')
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label>Expected Weekly Hours *</label>
                      {modalMode === 'view' ? (
                        <span className="field-value">{formData.expected_weekly_hours}h</span>
                      ) : (
                        <input
                          type="number"
                          value={formData.expected_weekly_hours}
                          onChange={(e) => handleInputChange('expected_weekly_hours', parseFloat(e.target.value))}
                          min="0"
                          max="80"
                          step="0.5"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Campaign Assignments */}
                <div className="form-section">
                  <h3>Campaign Assignments</h3>
                  
                  <div className="form-field full-width">
                    <label>Assigned Campaigns</label>
                    {modalMode === 'view' ? (
                      <div className="campaigns-display">
                        {formData.assigned_campaigns?.length > 0 ? (
                          <div className="campaign-tags">
                            {formData.assigned_campaigns.map(campaign => (
                              <span key={campaign} className="campaign-tag">
                                {campaign}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="field-value">No campaigns assigned</span>
                        )}
                      </div>
                    ) : (
                      renderCampaignMultiSelect()
                    )}
                  </div>
                </div>

                {/* Location & Contact */}
                <div className="form-section">
                  <h3>Location & Contact</h3>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Location</label>
                      {modalMode === 'view' ? (
                        <span className="field-value">{formData.location || 'Not specified'}</span>
                      ) : (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g., Main Office - Floor 2"
                        />
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label>Time Zone</label>
                      {modalMode === 'view' ? (
                        <span className="field-value">{formData.time_zone}</span>
                      ) : (
                        renderEditableDropdown('time_zone', formData.time_zone, dropdownOptions.timeZones, 'Select Time Zone')
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Information (Admin Only) */}
                {userPermissions.canViewRates && (
                  <div className="form-section">
                    <h3>Financial Information</h3>
                    
                    <div className="form-row">
                      <div className="form-field">
                        <label>Hourly Rate</label>
                        {modalMode === 'view' ? (
                          <span className="field-value">{formatCurrency(formData.hourly_rate)}</span>
                        ) : (
                          <input
                            type="number"
                            value={formData.hourly_rate}
                            onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value))}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        )}
                      </div>
                      
                      <div className="form-field">
                        <label>Billable Rate</label>
                        {modalMode === 'view' ? (
                          <span className="field-value">{formatCurrency(formData.billable_rate)}</span>
                        ) : (
                          <input
                            type="number"
                            value={formData.billable_rate}
                            onChange={(e) => handleInputChange('billable_rate', parseFloat(e.target.value))}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-field">
                        <label>PTO Balance (days)</label>
                        {modalMode === 'view' ? (
                          <span className="field-value">{formData.pto_balance} days</span>
                        ) : (
                          <input
                            type="number"
                            value={formData.pto_balance}
                            onChange={(e) => handleInputChange('pto_balance', parseFloat(e.target.value))}
                            min="0"
                            step="0.5"
                          />
                        )}
                      </div>
                      
                      <div className="form-field">
                        <label>Sick Leave Balance (days)</label>
                        {modalMode === 'view' ? (
                          <span className="field-value">{formData.sick_balance} days</span>
                        ) : (
                          <input
                            type="number"
                            value={formData.sick_balance}
                            onChange={(e) => handleInputChange('sick_balance', parseFloat(e.target.value))}
                            min="0"
                            step="0.5"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-field">
                        <label>Hire Date</label>
                        {modalMode === 'view' ? (
                          <span className="field-value">{formatDate(formData.hire_date)}</span>
                        ) : (
                          <input
                            type="date"
                            value={formData.hire_date}
                            onChange={(e) => handleInputChange('hire_date', e.target.value)}
                          />
                        )}
                      </div>
                      
                      <div className="form-field">
                        <label className="checkbox-label">
                          {modalMode === 'view' ? (
                            <span className="field-value">
                              {formData.is_billable ? 'Billable Employee' : 'Non-billable Employee'}
                            </span>
                          ) : (
                            <>
                              <input
                                type="checkbox"
                                checked={formData.is_billable}
                                onChange={(e) => handleInputChange('is_billable', e.target.checked)}
                              />
                              Billable Employee
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
              
              {modalMode !== 'view' && userPermissions.canEdit && (
                <button className="btn-primary" onClick={handleSave}>
                  <Save size={16} />
                  {modalMode === 'create' ? 'Create Employee' : 'Save Changes'}
                </button>
              )}
              
              {modalMode === 'view' && userPermissions.canEdit && (
                <button 
                  className="btn-primary" 
                  onClick={() => setModalMode('edit')}
                >
                  <Edit size={16} />
                  Edit Employee
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && !loading && (
        <div className="empty-state">
          <Users size={48} />
          <h3>No employees found</h3>
          <p>
            {searchTerm || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first employee'
            }
          </p>
          {userPermissions.canEdit && (
            <button 
              className="btn-primary"
              onClick={() => openModal('create')}
            >
              <Plus size={16} />
              Add Employee
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default PeopleDirectory

