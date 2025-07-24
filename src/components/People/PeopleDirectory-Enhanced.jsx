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
  CheckCircle
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
      const [employeesResult, departmentsResult, managersResult] = await Promise.all([
        supabaseApi.getAllEmployees(),
        supabaseApi.getDepartments(),
        supabaseApi.getManagers()
      ])

      if (employeesResult.error) throw employeesResult.error
      if (departmentsResult.error) throw departmentsResult.error
      if (managersResult.error) throw managersResult.error

      setEmployees(employeesResult.data || [])
      setDepartments(departmentsResult.data || [])
      setManagers(managersResult.data || [])
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

  // ==================== FORM HANDLING ====================
  const openModal = (mode, employee = null) => {
    setModalMode(mode)
    setSelectedEmployee(employee)
    setFormData(employee ? { ...employee } : getDefaultFormData())
    setFormErrors({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEmployee(null)
    setFormData({})
    setFormErrors({})
    setSaving(false)
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
      let result
      if (modalMode === 'create') {
        result = await supabaseApi.createEmployee(formData)
      } else {
        result = await supabaseApi.updateEmployee(selectedEmployee.id, formData)
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
                <select
                  value={formData.department || ''}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  disabled={isReadOnly}
                  className={formErrors.department ? 'error' : ''}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {formErrors.department && <span className="error-text">{formErrors.department}</span>}
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role || 'team_member'}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  disabled={isReadOnly || !userPermissions.isAdmin}
                >
                  <option value="team_member">Team Member</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                  {userPermissions.isAdmin && <option value="admin">Admin</option>}
                </select>
              </div>
              
              <div className="form-group">
                <label>Employment Type</label>
                <select
                  value={formData.employment_type || 'full_time'}
                  onChange={e => setFormData({...formData, employment_type: e.target.value})}
                  disabled={isReadOnly}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contractor">Contractor</option>
                  <option value="intern">Intern</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Employment Status</label>
                <select
                  value={formData.employment_status || 'active'}
                  onChange={e => setFormData({...formData, employment_status: e.target.value})}
                  disabled={isReadOnly}
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                <select
                  value={formData.time_zone || 'America/New_York'}
                  onChange={e => setFormData({...formData, time_zone: e.target.value})}
                  disabled={isReadOnly}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
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

