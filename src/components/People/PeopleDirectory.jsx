import React, { useState, useEffect, useMemo } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Clock,
  DollarSign,
  User,
  Building,
  Shield,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Check,
  Tag
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import supabaseApi from '../../supabaseClient'
import './people-directory.css'

const PeopleDirectory = () => {
  // ==================== STATE MANAGEMENT ====================
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [managers, setManagers] = useState([])
  const [campaigns, setCampaigns] = useState([]) // NEW: Campaign data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // UI State
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    department: '',
    employment_status: '',
    employment_type: '',
    role: ''
  })
  
  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create', 'edit', 'view'
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // NEW: Custom dropdown states
  const [customDropdowns, setCustomDropdowns] = useState({
    department: { isOpen: false, customValue: '', showCustomInput: false },
    role: { isOpen: false, customValue: '', showCustomInput: false },
    employment_type: { isOpen: false, customValue: '', showCustomInput: false },
    employment_status: { isOpen: false, customValue: '', showCustomInput: false },
    time_zone: { isOpen: false, customValue: '', showCustomInput: false }
  })

  // NEW: Campaign assignment state
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false)
  const [selectedCampaigns, setSelectedCampaigns] = useState([])

  // ==================== USER PERMISSIONS ====================
  const userPermissions = useMemo(() => {
    const userRole = user?.role || 'team_member'
    
    return {
      canViewAll: ['admin', 'manager', 'supervisor'].includes(userRole),
      canEdit: ['admin', 'manager'].includes(userRole),
      canCreate: ['admin'].includes(userRole),
      canDelete: ['admin'].includes(userRole),
      canViewSensitive: ['admin', 'manager'].includes(userRole),
      canViewRates: ['admin'].includes(userRole),
      isAdmin: userRole === 'admin',
      isManager: ['admin', 'manager', 'supervisor'].includes(userRole)
    }
  }, [user])

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [employeesResult, departmentsResult, managersResult, campaignsResult] = await Promise.all([
        supabaseApi.getAllEmployees(),
        supabaseApi.getDepartments(),
        supabaseApi.getManagers(),
        supabaseApi.getCampaigns() // NEW: Load campaigns
      ])

      if (employeesResult.error) throw employeesResult.error
      if (departmentsResult.error) throw departmentsResult.error
      if (managersResult.error) throw managersResult.error

      setEmployees(employeesResult.data || [])
      setDepartments(departmentsResult.data || [])
      setManagers(managersResult.data || [])
      setCampaigns(campaignsResult.data || []) // NEW: Set campaigns
    } catch (err) {
      console.error('Failed to load initial data:', err)
      setError('Failed to load employee data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ==================== FILTERING AND SEARCH ====================
  useEffect(() => {
    let filtered = employees

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(emp => 
        emp.full_name?.toLowerCase().includes(search) ||
        emp.email?.toLowerCase().includes(search) ||
        emp.job_title?.toLowerCase().includes(search) ||
        emp.department?.toLowerCase().includes(search)
      )
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(emp => emp[key] === value)
      }
    })

    setFilteredEmployees(filtered)
  }, [employees, searchTerm, filters])

  // ==================== NEW: CUSTOM DROPDOWN FUNCTIONS ====================
  const handleCustomDropdownToggle = (field) => {
    setCustomDropdowns(prev => ({
      ...prev,
      [field]: { ...prev[field], isOpen: !prev[field].isOpen, showCustomInput: false }
    }))
  }

  const handleCustomValueAdd = (field) => {
    const customValue = customDropdowns[field].customValue.trim()
    if (!customValue) return

    // Add to form data
    setFormData(prev => ({ ...prev, [field]: customValue }))
    
    // Add to options list if it's a department
    if (field === 'department' && !departments.includes(customValue)) {
      setDepartments(prev => [...prev, customValue])
    }

    // Reset custom dropdown state
    setCustomDropdowns(prev => ({
      ...prev,
      [field]: { isOpen: false, customValue: '', showCustomInput: false }
    }))
  }

  const renderCustomDropdown = (field, options, label, value) => {
    const dropdown = customDropdowns[field]
    
    return (
      <div className="custom-dropdown">
        <div 
          className="dropdown-trigger"
          onClick={() => handleCustomDropdownToggle(field)}
        >
          <span>{value || `Select ${label}`}</span>
          <ChevronDown size={16} />
        </div>
        
        {dropdown.isOpen && (
          <div className="dropdown-menu">
            {options.map(option => (
              <div
                key={option}
                className="dropdown-option"
                onClick={() => {
                  setFormData(prev => ({ ...prev, [field]: option }))
                  setCustomDropdowns(prev => ({
                    ...prev,
                    [field]: { ...prev[field], isOpen: false }
                  }))
                }}
              >
                {option}
              </div>
            ))}
            
            {!dropdown.showCustomInput ? (
              <div
                className="dropdown-option add-custom"
                onClick={() => setCustomDropdowns(prev => ({
                  ...prev,
                  [field]: { ...prev[field], showCustomInput: true }
                }))}
              >
                <Plus size={14} />
                Add Custom {label}
              </div>
            ) : (
              <div className="custom-input-container">
                <input
                  type="text"
                  placeholder={`Enter custom ${label.toLowerCase()}`}
                  value={dropdown.customValue}
                  onChange={(e) => setCustomDropdowns(prev => ({
                    ...prev,
                    [field]: { ...prev[field], customValue: e.target.value }
                  }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomValueAdd(field)}
                  autoFocus
                />
                <button onClick={() => handleCustomValueAdd(field)}>
                  <Check size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ==================== NEW: CAMPAIGN ASSIGNMENT FUNCTIONS ====================
  const handleCampaignToggle = (campaignId) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    )
  }

  const clearAllCampaigns = () => {
    setSelectedCampaigns([])
  }

  const renderCampaignDropdown = () => (
    <div className="campaign-dropdown">
      <div 
        className="dropdown-trigger"
        onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
      >
        <span>
          {selectedCampaigns.length === 0 
            ? 'Select Campaigns' 
            : `${selectedCampaigns.length} campaign(s) selected`
          }
        </span>
        <ChevronDown size={16} />
      </div>
      
      {campaignDropdownOpen && (
        <div className="dropdown-menu campaign-menu">
          <div className="campaign-menu-header">
            <span>Select Campaigns</span>
            {selectedCampaigns.length > 0 && (
              <button onClick={clearAllCampaigns} className="clear-all-btn">
                Clear All
              </button>
            )}
          </div>
          
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              className="campaign-option"
              onClick={() => handleCampaignToggle(campaign.id)}
            >
              <input
                type="checkbox"
                checked={selectedCampaigns.includes(campaign.id)}
                onChange={() => {}} // Handled by onClick
              />
              <div className="campaign-info">
                <div className="campaign-name">{campaign.name}</div>
                <div className="campaign-client">{campaign.client_name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderSelectedCampaignTags = () => {
    if (selectedCampaigns.length === 0) return null
    
    return (
      <div className="selected-campaigns">
        {selectedCampaigns.map(campaignId => {
          const campaign = campaigns.find(c => c.id === campaignId)
          if (!campaign) return null
          
          return (
            <div key={campaignId} className="campaign-tag">
              <Tag size={12} />
              <span>{campaign.name}</span>
              <button onClick={() => handleCampaignToggle(campaignId)}>
                <X size={12} />
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  // ==================== FORM HANDLING ====================
  const openModal = (mode, employee = null) => {
    setModalMode(mode)
    setSelectedEmployee(employee)
    setFormData(employee ? { ...employee } : getDefaultFormData())
    setFormErrors({})
    setShowModal(true)
    
    // NEW: Set selected campaigns if editing
    if (employee && employee.campaigns) {
      setSelectedCampaigns(employee.campaigns.map(c => c.id))
    } else {
      setSelectedCampaigns([])
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEmployee(null)
    setFormData({})
    setFormErrors({})
    setSaving(false)
    setSelectedCampaigns([]) // NEW: Clear campaign selection
    setCampaignDropdownOpen(false) // NEW: Close campaign dropdown
  }

  const getDefaultFormData = () => ({
    full_name: '',
    display_name: '',
    email: '',
    phone_number: '',
    job_title: '',
    department: '',
    role: 'team_member',
    employment_type: 'full_time',
    employment_status: 'active',
    expected_weekly_hours: 40.00,
    hourly_rate: '',
    billable_rate: '',
    is_billable: false,
    location: '',
    time_zone: 'America/New_York',
    manager_id: '',
    pto_balance: 20.0,
    sick_balance: 10.0,
    hire_date: new Date().toISOString().split('T')[0]
  })

  const validateForm = () => {
    const errors = {}
    
    if (!formData.full_name?.trim()) errors.full_name = 'Full name is required'
    if (!formData.email?.trim()) errors.email = 'Email is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format'
    if (!formData.job_title?.trim()) errors.job_title = 'Job title is required'
    if (!formData.department?.trim()) errors.department = 'Department is required'
    if (!formData.expected_weekly_hours || formData.expected_weekly_hours <= 0) {
      errors.expected_weekly_hours = 'Expected weekly hours must be greater than 0'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setError(null)

    try {
      // NEW: Include campaign assignments in form data
      const dataToSave = {
        ...formData,
        campaign_assignments: selectedCampaigns
      }

      let result
      if (modalMode === 'create') {
        result = await supabaseApi.createEmployee(dataToSave)
      } else {
        result = await supabaseApi.updateEmployee(selectedEmployee.id, dataToSave)
      }

      if (result.error) throw result.error

      // Refresh data
      await loadInitialData()
      closeModal()
      
      // Show success message (you could implement a toast notification here)
      console.log(`Employee ${modalMode === 'create' ? 'created' : 'updated'} successfully`)
    } catch (err) {
      console.error('Save failed:', err)
      setError(`Failed to ${modalMode} employee. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (employee) => {
    if (!window.confirm(`Are you sure you want to deactivate ${employee.full_name}?`)) return

    try {
      const result = await supabaseApi.deleteEmployee(employee.id)
      if (result.error) throw result.error

      await loadInitialData()
      console.log('Employee deactivated successfully')
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Failed to deactivate employee. Please try again.')
    }
  }

  // ==================== UTILITY FUNCTIONS ====================
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10B981'
      case 'away': return '#F59E0B'
      case 'offline': return '#6B7280'
      default: return '#6B7280'
    }
  }

  const getEmploymentStatusBadge = (status) => {
    const colors = {
      active: { bg: '#D1FAE5', text: '#065F46' },
      on_leave: { bg: '#FEF3C7', text: '#92400E' },
      terminated: { bg: '#FEE2E2', text: '#991B1B' },
      inactive: { bg: '#F3F4F6', text: '#374151' }
    }
    return colors[status] || colors.inactive
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatHours = (hours) => {
    if (!hours) return '0h'
    return `${hours}h`
  }

  // NEW: Render campaign tags for employee cards
  const renderEmployeeCampaignTags = (employee) => {
    if (!employee.campaigns || employee.campaigns.length === 0) return null
    
    const displayCampaigns = employee.campaigns.slice(0, 2)
    const remainingCount = employee.campaigns.length - 2
    
    return (
      <div className="employee-campaigns">
        {displayCampaigns.map(campaign => (
          <span key={campaign.id} className="campaign-tag small">
            {campaign.name}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="campaign-tag small more">
            +{remainingCount} more
          </span>
        )}
      </div>
    )
  }

  // ==================== RENDER COMPONENTS ====================
  const renderEmployeeCard = (employee) => (
    <div key={employee.id} className="person-card">
      <div className="card-header">
        <div className="person-avatar">
          {employee.profile_picture ? (
            <img src={employee.profile_picture} alt={employee.full_name} />
          ) : (
            <div className="avatar-placeholder">
              {employee.initials || employee.full_name?.charAt(0) || '?'}
            </div>
          )}
          <div 
            className="status-indicator" 
            style={{ backgroundColor: getStatusColor(employee.presence_status) }}
            title={`Status: ${employee.presence_status}`}
          />
        </div>
        
        <div className="person-info">
          <h3>{employee.full_name}</h3>
          <p className="job-title">{employee.job_title}</p>
          <p className="department">{employee.department}</p>
          {/* NEW: Campaign tags */}
          {renderEmployeeCampaignTags(employee)}
        </div>
        
        <div className="card-actions">
          <button 
            className="action-btn" 
            onClick={() => openModal('view', employee)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {userPermissions.canEdit && (
            <button 
              className="action-btn" 
              onClick={() => openModal('edit', employee)}
              title="Edit Employee"
            >
              <Edit size={16} />
            </button>
          )}
          {userPermissions.canDelete && (
            <button 
              className="action-btn danger" 
              onClick={() => handleDelete(employee)}
              title="Deactivate Employee"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="card-content">
        <div className="contact-info">
          <div className="contact-item">
            <Mail size={14} />
            <span>{employee.email}</span>
          </div>
          {employee.phone_number && (
            <div className="contact-item">
              <Phone size={14} />
              <span>{employee.phone_number}</span>
            </div>
          )}
          <div className="contact-item">
            <MapPin size={14} />
            <span>{employee.location || 'Not specified'}</span>
          </div>
        </div>
        
        <div className="employment-info">
          <div className="info-row">
            <span className="label">Status:</span>
            <span 
              className="value status-badge"
              style={getEmploymentStatusBadge(employee.employment_status)}
            >
              {employee.employment_status?.replace('_', ' ')}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Type:</span>
            <span className="value">{employee.employment_type?.replace('_', ' ')}</span>
          </div>
          <div className="info-row">
            <span className="label">Hours/Week:</span>
            <span className="value">{formatHours(employee.expected_weekly_hours)}</span>
          </div>
          {userPermissions.canViewRates && showSensitiveData && (
            <>
              <div className="info-row">
                <span className="label">Hourly Rate:</span>
                <span className="value">{formatCurrency(employee.hourly_rate)}</span>
              </div>
              <div className="info-row">
                <span className="label">Billable Rate:</span>
                <span className="value">{formatCurrency(employee.billable_rate)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const renderEmployeeTable = () => (
    <div className="people-table-container">
      <table className="people-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Contact</th>
            <th>Employment</th>
            <th>Location</th>
            <th>Campaigns</th> {/* NEW: Campaign column */}
            {userPermissions.canViewRates && showSensitiveData && <th>Rates</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map(employee => (
            <tr key={employee.id}>
              <td>
                <div className="employee-cell">
                  <div className="employee-avatar">
                    {employee.profile_picture ? (
                      <img src={employee.profile_picture} alt={employee.full_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {employee.initials || employee.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div 
                      className="status-indicator" 
                      style={{ backgroundColor: getStatusColor(employee.presence_status) }}
                    />
                  </div>
                  <div>
                    <div className="employee-name">{employee.full_name}</div>
                    <div className="employee-title">{employee.job_title}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="contact-cell">
                  <div>{employee.email}</div>
                  <div>{employee.phone_number || 'No phone'}</div>
                </div>
              </td>
              <td>
                <div className="employment-cell">
                  <div>{employee.department}</div>
                  <div style={getEmploymentStatusBadge(employee.employment_status)}>
                    {employee.employment_status?.replace('_', ' ')}
                  </div>
                  <div className="location">{formatHours(employee.expected_weekly_hours)} per week</div>
                </div>
              </td>
              <td>
                <div>{employee.location || 'Not specified'}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {employee.time_zone}
                </div>
              </td>
              {/* NEW: Campaign cell */}
              <td>
                <div className="campaigns-cell">
                  {renderEmployeeCampaignTags(employee)}
                </div>
              </td>
              {userPermissions.canViewRates && showSensitiveData && (
                <td>
                  <div className="rates-cell">
                    <div>{formatCurrency(employee.hourly_rate)}</div>
                    <div>Billable: {formatCurrency(employee.billable_rate)}</div>
                  </div>
                </td>
              )}
              <td>
                <div className="table-actions">
                  <button 
                    className="action-btn" 
                    onClick={() => openModal('view', employee)}
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                  {userPermissions.canEdit && (
                    <button 
                      className="action-btn" 
                      onClick={() => openModal('edit', employee)}
                      title="Edit Employee"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  {userPermissions.canDelete && (
                    <button 
                      className="action-btn danger" 
                      onClick={() => handleDelete(employee)}
                      title="Deactivate Employee"
                    >
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
  )

  const renderModal = () => {
    if (!showModal) return null

    const isReadOnly = modalMode === 'view'
    const title = {
      create: 'Add New Employee',
      edit: 'Edit Employee',
      view: 'Employee Details'
    }[modalMode]

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={closeModal}>
              <X size={20} />
            </button>
          </div>
          
          <div className="modal-body">
            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  disabled={isReadOnly}
                  className={formErrors.full_name ? 'error' : ''}
                />
                {formErrors.full_name && <span className="error-text">{formErrors.full_name}</span>}
              </div>
              
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={formData.display_name || ''}
                  onChange={e => setFormData({...formData, display_name: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  disabled={isReadOnly}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone_number || ''}
                  onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  value={formData.job_title || ''}
                  onChange={e => setFormData({...formData, job_title: e.target.value})}
                  disabled={isReadOnly}
                  className={formErrors.job_title ? 'error' : ''}
                />
                {formErrors.job_title && <span className="error-text">{formErrors.job_title}</span>}
              </div>
              
              <div className="form-group">
                <label>Department *</label>
                {isReadOnly ? (
                  <input
                    type="text"
                    value={formData.department || ''}
                    disabled
                  />
                ) : (
                  renderCustomDropdown('department', departments, 'Department', formData.department)
                )}
                {formErrors.department && <span className="error-text">{formErrors.department}</span>}
              </div>
              
              <div className="form-group">
                <label>Role</label>
                {isReadOnly || !userPermissions.isAdmin ? (
                  <input
                    type="text"
                    value={formData.role || 'team_member'}
                    disabled
                  />
                ) : (
                  renderCustomDropdown('role', ['team_member', 'supervisor', 'manager', 'admin'], 'Role', formData.role)
                )}
              </div>
              
              <div className="form-group">
                <label>Employment Type</label>
                {isReadOnly ? (
                  <input
                    type="text"
                    value={formData.employment_type || 'full_time'}
                    disabled
                  />
                ) : (
                  renderCustomDropdown('employment_type', ['full_time', 'part_time', 'contractor', 'intern', 'temporary'], 'Employment Type', formData.employment_type)
                )}
              </div>
              
              <div className="form-group">
                <label>Employment Status</label>
                {isReadOnly ? (
                  <input
                    type="text"
                    value={formData.employment_status || 'active'}
                    disabled
                  />
                ) : (
                  renderCustomDropdown('employment_status', ['active', 'on_leave', 'terminated', 'inactive'], 'Employment Status', formData.employment_status)
                )}
              </div>
              
              <div className="form-group">
                <label>Expected Weekly Hours *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="80"
                  value={formData.expected_weekly_hours || ''}
                  onChange={e => setFormData({...formData, expected_weekly_hours: parseFloat(e.target.value)})}
                  disabled={isReadOnly}
                  className={formErrors.expected_weekly_hours ? 'error' : ''}
                />
                {formErrors.expected_weekly_hours && <span className="error-text">{formErrors.expected_weekly_hours}</span>}
              </div>
              
              <div className="form-group">
                <label>Manager</label>
                <select
                  value={formData.manager_id || ''}
                  onChange={e => setFormData({...formData, manager_id: e.target.value})}
                  disabled={isReadOnly}
                >
                  <option value="">No Manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.full_name} - {manager.job_title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  disabled={isReadOnly}
                  placeholder="e.g., Main Office - Floor 2"
                />
              </div>
              
              {/* NEW: Campaign Assignment Section */}
              <div className="form-group full-width">
                <label>Assigned Campaigns</label>
                {isReadOnly ? (
                  <div className="readonly-campaigns">
                    {selectedCampaigns.length === 0 ? (
                      <span>No campaigns assigned</span>
                    ) : (
                      renderSelectedCampaignTags()
                    )}
                  </div>
                ) : (
                  <div>
                    {renderCampaignDropdown()}
                    {renderSelectedCampaignTags()}
                  </div>
                )}
              </div>
              
              {userPermissions.canViewRates && (
                <>
                  <div className="form-group">
                    <label>Hourly Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourly_rate || ''}
                      onChange={e => setFormData({...formData, hourly_rate: parseFloat(e.target.value)})}
                      disabled={isReadOnly || !userPermissions.canViewRates}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Billable Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.billable_rate || ''}
                      onChange={e => setFormData({...formData, billable_rate: parseFloat(e.target.value)})}
                      disabled={isReadOnly || !userPermissions.canViewRates}
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label>PTO Balance (days)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.pto_balance || ''}
                  onChange={e => setFormData({...formData, pto_balance: parseFloat(e.target.value)})}
                  disabled={isReadOnly}
                />
              </div>
              
              <div className="form-group">
                <label>Sick Leave Balance (days)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.sick_balance || ''}
                  onChange={e => setFormData({...formData, sick_balance: parseFloat(e.target.value)})}
                  disabled={isReadOnly}
                />
              </div>
              
              <div className="form-group">
                <label>Hire Date</label>
                <input
                  type="date"
                  value={formData.hire_date || ''}
                  onChange={e => setFormData({...formData, hire_date: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
              
              <div className="form-group">
                <label>Time Zone</label>
                {isReadOnly ? (
                  <input
                    type="text"
                    value={formData.time_zone || 'America/New_York'}
                    disabled
                  />
                ) : (
                  renderCustomDropdown('time_zone', [
                    'America/New_York',
                    'America/Chicago', 
                    'America/Denver',
                    'America/Los_Angeles'
                  ], 'Time Zone', formData.time_zone)
                )}
              </div>
            </div>
            
            <div className="form-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_billable || false}
                  onChange={e => setFormData({...formData, is_billable: e.target.checked})}
                  disabled={isReadOnly}
                />
                Billable Employee
              </label>
            </div>
          </div>
          
          {!isReadOnly && (
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ==================== MAIN RENDER ====================
  if (loading) {
    return (
      <div className="people-directory">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading employee directory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="people-directory">
      {/* Header */}
      <div className="directory-header">
        <div className="header-content">
          <div className="header-title">
            <h1>
              <Users size={32} />
              People Directory
            </h1>
            <p>Manage employee information and organizational structure</p>
          </div>
          
          <div className="header-actions">
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
                Cards
              </button>
              <button 
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <List size={16} />
                Table
              </button>
            </div>
            
            {userPermissions.canViewSensitive && (
              <button 
                className={`sensitive-toggle ${showSensitiveData ? 'active' : ''}`}
                onClick={() => setShowSensitiveData(!showSensitiveData)}
              >
                {showSensitiveData ? <EyeOff size={16} /> : <Eye size={16} />}
                {showSensitiveData ? 'Hide' : 'Show'} Rates
              </button>
            )}
            
            {userPermissions.canCreate && (
              <button 
                className="btn btn-primary"
                onClick={() => openModal('create')}
              >
                <Plus size={16} />
                Add Employee
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="directory-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.department}
            onChange={e => setFilters({...filters, department: e.target.value})}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={filters.employment_status}
            onChange={e => setFilters({...filters, employment_status: e.target.value})}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={filters.employment_type}
            onChange={e => setFilters({...filters, employment_type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contractor">Contractor</option>
            <option value="intern">Intern</option>
            <option value="temporary">Temporary</option>
          </select>
          
          <select
            value={filters.role}
            onChange={e => setFilters({...filters, role: e.target.value})}
          >
            <option value="">All Roles</option>
            <option value="team_member">Team Member</option>
            <option value="supervisor">Supervisor</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Content */}
      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No employees found</h3>
          <p>Try adjusting your search criteria or filters.</p>
          {userPermissions.canCreate && (
            <button 
              className="btn btn-primary"
              onClick={() => openModal('create')}
            >
              <Plus size={16} />
              Add First Employee
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="people-grid">
              {filteredEmployees.map(renderEmployeeCard)}
            </div>
          ) : (
            renderEmployeeTable()
          )}
        </>
      )}

      {/* Modal */}
      {renderModal()}
    </div>
  )
}

export default PeopleDirectory

