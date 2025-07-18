// EnhancedEmployeeManagement.jsx - Enhanced Employee Management Component
// Includes hiring dates, leave tracking, and advanced status management

import React, { useState, useEffect } from "react"
import { 
  Users, UserPlus, Edit, Trash2, Calendar, Clock, AlertCircle, 
  CheckCircle, XCircle, Briefcase, Heart, Baby, Plane, FileText,
  Filter, Search, Download, Upload, Eye, EyeOff, Plus, Save, X
} from "lucide-react"
import { calculateEmployeeStatus } from "./dataTemplates.jsx"
import DataUploadCockpit from "./DataUploadCockpit.jsx"

const EnhancedEmployeeManagement = ({ user, api }) => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showUploadCockpit, setShowUploadCockpit] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showInactive, setShowInactive] = useState(false)
  
  const [employeeForm, setEmployeeForm] = useState({
    email: "",
    full_name: "",
    role: "team_member",
    hire_date: "",
    pay_rate_per_hour: "",
    department: "",
    employee_id: "",
    phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    end_date: "",
    leave_start_date: "",
    leave_end_date: "",
    leave_type: "",
    notes: ""
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers()
      // Add calculated status to each employee
      const employeesWithStatus = data.map(emp => ({
        ...emp,
        statusInfo: calculateEmployeeStatus(emp)
      }))
      setEmployees(employeesWithStatus)
    } catch (error) {
      setError("Failed to load employees")
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitEmployee = async (e) => {
    e.preventDefault()
    try {
      // Validate required fields
      if (!employeeForm.email || !employeeForm.full_name || !employeeForm.hire_date) {
        setError("Email, full name, and hire date are required")
        return
      }

      // Validate dates
      if (employeeForm.end_date && employeeForm.hire_date && 
          new Date(employeeForm.end_date) <= new Date(employeeForm.hire_date)) {
        setError("End date must be after hire date")
        return
      }

      if (employeeForm.leave_start_date && employeeForm.leave_end_date && 
          new Date(employeeForm.leave_end_date) <= new Date(employeeForm.leave_start_date)) {
        setError("Leave end date must be after leave start date")
        return
      }

      // Clean up empty fields
      const cleanedForm = Object.fromEntries(
        Object.entries(employeeForm).filter(([_, value]) => value !== "")
      )

      if (editingEmployee) {
        await api.updateUser(editingEmployee.id, cleanedForm)
      } else {
        await api.createUser(cleanedForm)
      }

      resetForm()
      fetchEmployees()
    } catch (error) {
      setError(`Failed to ${editingEmployee ? "update" : "create"} employee`)
      console.error(`Error ${editingEmployee ? "updating" : "creating"} employee:`, error)
    }
  }

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
    setEmployeeForm({
      email: employee.email || "",
      full_name: employee.full_name || "",
      role: employee.role || "team_member",
      hire_date: employee.hire_date || "",
      pay_rate_per_hour: employee.pay_rate_per_hour || "",
      department: employee.department || "",
      employee_id: employee.employee_id || "",
      phone: employee.phone || "",
      address: employee.address || "",
      emergency_contact_name: employee.emergency_contact_name || "",
      emergency_contact_phone: employee.emergency_contact_phone || "",
      end_date: employee.end_date || "",
      leave_start_date: employee.leave_start_date || "",
      leave_end_date: employee.leave_end_date || "",
      leave_type: employee.leave_type || "",
      notes: employee.notes || ""
    })
    setShowAddForm(true)
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      try {
        await api.deleteUser(employeeId)
        fetchEmployees()
      } catch (error) {
        setError("Failed to delete employee")
        console.error("Error deleting employee:", error)
      }
    }
  }

  const handleDataUploaded = async (data, type) => {
    if (type === "employee") {
      try {
        // Process each employee record
        for (const employeeData of data) {
          await api.createUser(employeeData)
        }
        fetchEmployees()
      } catch (error) {
        throw new Error(`Failed to upload employee data: ${error.message}`)
      }
    }
  }

  const resetForm = () => {
    setEmployeeForm({
      email: "",
      full_name: "",
      role: "team_member",
      hire_date: "",
      pay_rate_per_hour: "",
      department: "",
      employee_id: "",
      phone: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      end_date: "",
      leave_start_date: "",
      leave_end_date: "",
      leave_type: "",
      notes: ""
    })
    setEditingEmployee(null)
    setShowAddForm(false)
    setError("")
  }

  const getStatusIcon = (statusInfo) => {
    switch (statusInfo.status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "on_leave":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "terminated":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (statusInfo) => {
    switch (statusInfo.status) {
      case "active":
        return "green"
      case "on_leave":
        return "yellow"
      case "terminated":
        return "red"
      default:
        return "gray"
    }
  }

  const getLeaveIcon = (leaveType) => {
    switch (leaveType) {
      case "medical":
        return <Heart className="w-4 h-4" />
      case "maternity":
      case "paternity":
        return <Baby className="w-4 h-4" />
      case "vacation":
        return <Plane className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "red"
      case "campaign_lead":
        return "blue"
      default:
        return "gray"
    }
  }

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || employee.statusInfo.status === statusFilter
    const matchesActive = showInactive || employee.statusInfo.active

    return matchesSearch && matchesStatus && matchesActive
  })

  // Enhanced permission check with case insensitivity and debugging
  const canManageEmployees = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "campaign_lead"
  const isAdmin = user?.role?.toLowerCase() === "admin"
  
  // Debug logging (remove in production)
  console.log('Employee Management - User:', user)
  console.log('Employee Management - User Role:', user?.role)
  console.log('Employee Management - Can Manage:', canManageEmployees)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content space-y-6">
      <div className="flex flex-col lg-flex-row lg-items-center lg-justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage employee information, status, and leave tracking</p>
        </div>
        {canManageEmployees && (
          <div className="flex flex-col sm-flex-row gap-2">
            <button 
              onClick={() => setShowUploadCockpit(true)}
              className="btn btn-outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </button>
            <button 
              onClick={() => {
                resetForm()
                setShowAddForm(true)
              }}
              className="btn btn-primary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-destructive">
          <div className="text-sm">{error}</div>
        </div>
      )}

      {!canManageEmployees && (
        <div className="alert alert-default">
          <div className="text-sm">
            You don"t have permission to manage employees. Contact your administrator for access.
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col lg-flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {["all", "active", "on_leave", "terminated"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-sm ${statusFilter === status ? "btn-primary" : "btn-outline"}`}
            >
              {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 flex-1">
          <div className="search-input-container flex-1 max-w-sm">
            <Search className="search-icon" />
            <input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input form-input"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-inactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus-ring-2 border-gray-300 rounded"
            />
            <label htmlFor="show-inactive" className="text-sm text-gray-600">
              Show inactive
            </label>
          </div>
        </div>
      </div>

      {/* Employee Statistics */}
      <div className="grid grid-cols-1 sm-grid-cols-2 lg-grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-blue">
                <Users className="w-5 h-5" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Total Employees</p>
                <p className="stat-value">{employees.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-green">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Active</p>
                <p className="stat-value">{employees.filter(e => e.statusInfo.status === "active").length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-yellow">
                <Clock className="w-5 h-5" />
              </div>
              <div className="stat-details">
                <p className="stat-title">On Leave</p>
                <p className="stat-value">{employees.filter(e => e.statusInfo.status === "on_leave").length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="stat-icon-container stat-icon-red">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="stat-details">
                <p className="stat-title">Terminated</p>
                <p className="stat-value">{employees.filter(e => e.statusInfo.status === "terminated").length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Employee Form */}
      {showAddForm && canManageEmployees && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{editingEmployee ? "Edit Employee" : "Add New Employee"}</h3>
            <p className="card-description">
              {editingEmployee ? "Update employee information and status" : "Enter employee details and employment information"}
            </p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmitEmployee} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="employee@company.com"
                      value={employeeForm.email}
                      onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={employeeForm.full_name}
                      onChange={(e) => setEmployeeForm({...employeeForm, full_name: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      placeholder="EMP001"
                      value={employeeForm.employee_id}
                      onChange={(e) => setEmployeeForm({...employeeForm, employee_id: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      placeholder="Customer Service"
                      value={employeeForm.department}
                      onChange={(e) => setEmployeeForm({...employeeForm, department: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Employment Details</h4>
                <div className="grid grid-cols-1 md-grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      value={employeeForm.role}
                      onChange={(e) => setEmployeeForm({...employeeForm, role: e.target.value})}
                      className="form-select"
                    >
                      <option value="team_member">Team Member</option>
                      <option value="campaign_lead">Campaign Lead</option>
                      {isAdmin && <option value="admin">Admin</option>}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hire Date *</label>
                    <input
                      type="date"
                      required
                      value={employeeForm.hire_date}
                      onChange={(e) => setEmployeeForm({...employeeForm, hire_date: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pay Rate (per hour)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="18.50"
                      value={employeeForm.pay_rate_per_hour}
                      onChange={(e) => setEmployeeForm({...employeeForm, pay_rate_per_hour: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      placeholder="+1-555-123-4567"
                      value={employeeForm.phone}
                      onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      placeholder="123 Main St, City, State 12345"
                      value={employeeForm.address}
                      onChange={(e) => setEmployeeForm({...employeeForm, address: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={employeeForm.emergency_contact_name}
                      onChange={(e) => setEmployeeForm({...employeeForm, emergency_contact_name: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="+1-555-987-6543"
                      value={employeeForm.emergency_contact_phone}
                      onChange={(e) => setEmployeeForm({...employeeForm, emergency_contact_phone: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Employment Status</h4>
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">End Date (if terminated)</label>
                    <input
                      type="date"
                      value={employeeForm.end_date}
                      onChange={(e) => setEmployeeForm({...employeeForm, end_date: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Leave Type</label>
                    <select
                      value={employeeForm.leave_type}
                      onChange={(e) => setEmployeeForm({...employeeForm, leave_type: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Not on leave</option>
                      <option value="medical">Medical Leave</option>
                      <option value="maternity">Maternity Leave</option>
                      <option value="paternity">Paternity Leave</option>
                      <option value="personal">Personal Leave</option>
                      <option value="vacation">Extended Vacation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {employeeForm.leave_type && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Leave Start Date</label>
                        <input
                          type="date"
                          value={employeeForm.leave_start_date}
                          onChange={(e) => setEmployeeForm({...employeeForm, leave_start_date: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Leave End Date</label>
                        <input
                          type="date"
                          value={employeeForm.leave_end_date}
                          onChange={(e) => setEmployeeForm({...employeeForm, leave_end_date: e.target.value})}
                          className="form-input"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  placeholder="Additional notes about the employee"
                  value={employeeForm.notes}
                  onChange={(e) => setEmployeeForm({...employeeForm, notes: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="flex flex-col sm-flex-row gap-2">
                <button type="submit" className="btn btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  {editingEmployee ? "Update Employee" : "Add Employee"}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employees List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Employees ({filteredEmployees.length})</h3>
          <p className="card-description">Employee directory with status and leave information</p>
        </div>
        <div className="card-content">
          {filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-state-icon" />
              <h3 className="empty-state-title">No employees found</h3>
              <p className="empty-state-description">
                {employees.length === 0 
                  ? "Start by adding your first employee" 
                  : "No employees match your current filters"}
              </p>
              {canManageEmployees && employees.length === 0 && (
                <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Employee
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="team-member-card">
                  <div className="team-member-avatar">
                    <span className="team-member-avatar-text">
                      {employee.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                    </span>
                  </div>
                  
                  <div className="team-member-info">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="team-member-name">{employee.full_name}</p>
                      {getStatusIcon(employee.statusInfo)}
                      <div className={`badge badge-${getStatusBadge(employee.statusInfo)}`}>
                        {employee.statusInfo.status.replace("_", " ")}
                      </div>
                    </div>
                    <p className="team-member-email">{employee.email}</p>
                    {employee.department && (
                      <p className="team-member-rate">{employee.department}</p>
                    )}
                    {employee.hire_date && (
                      <p className="team-member-rate">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Hired: {new Date(employee.hire_date).toLocaleDateString()}
                      </p>
                    )}
                    {employee.statusInfo.status === "on_leave" && employee.leave_type && (
                      <p className="team-member-rate text-yellow-600">
                        {getLeaveIcon(employee.leave_type)}
                        <span className="ml-1">{employee.leave_type} leave</span>
                        {employee.leave_end_date && (
                          <span> until {new Date(employee.leave_end_date).toLocaleDateString()}</span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">{employee.statusInfo.reason}</p>
                  </div>
                  
                  <div className="team-member-actions">
                    <div className="flex items-center gap-2 mb-2 sm-mb-0">
                      <div className={`badge badge-${getRoleBadge(employee.role)}`}>
                        {employee.role?.replace("_", " ")}
                      </div>
                      {employee.pay_rate_per_hour && (
                        <span className="text-sm text-gray-600">${employee.pay_rate_per_hour}/hr</span>
                      )}
                    </div>
                    
                    {isAdmin && employee.id !== user.id && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="btn btn-sm btn-outline"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="btn btn-sm btn-outline text-red-600 border-red-600 hover-bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Cockpit Modal */}
      {showUploadCockpit && (
        <DataUploadCockpit
          onDataUploaded={handleDataUploaded}
          onClose={() => setShowUploadCockpit(false)}
        />
      )}
    </div>
  )
}

export default EnhancedEmployeeManagement

