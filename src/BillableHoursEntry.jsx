// BillableHoursEntry.jsx - Enhanced with full functionality and proper scrolling 

import React, { useState, useEffect } from 'react'
import { 
  Plus, Edit, Trash2, Search, Filter, Calendar, DollarSign, 
  Clock, User, Building, FileText, Save, X, Check, AlertCircle,
  ChevronDown, ChevronUp, Download, RefreshCw
} from 'lucide-react'

function BillableHoursEntry({ user }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [selectedEntries, setSelectedEntries] = useState([])
  
  // Filters and search
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    client: '',
    project: '',
    status: '',
    teamMember: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    team_member_id: '',
    client_name: '',
    project_name: '',
    task_description: '',
    billable_hours: '',
    hourly_rate: '',
    status: 'pending'
  })

  // Mock data
  const mockClients = ['Acme Corp', 'Tech Solutions', 'Global Industries', 'StartupXYZ', 'Enterprise Co']
  const mockProjects = ['Website Redesign', 'Mobile App', 'Data Migration', 'System Integration', 'Consulting']
  const mockTeamMembers = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Sarah Wilson' }
  ]

  useEffect(() => {
    fetchEntries()
  }, [filters])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockEntries = [
        {
          id: 1,
          date: '2024-01-15',
          team_member_id: 1,
          team_member_name: 'John Doe',
          client_name: 'Acme Corp',
          project_name: 'Website Redesign',
          task_description: 'Frontend development and responsive design implementation',
          billable_hours: 6.5,
          hourly_rate: 75,
          total_amount: 487.50,
          status: 'approved',
          entered_by: user?.full_name || 'Admin'
        },
        {
          id: 2,
          date: '2024-01-14',
          team_member_id: 2,
          team_member_name: 'Jane Smith',
          client_name: 'Tech Solutions',
          project_name: 'Mobile App',
          task_description: 'API integration and testing',
          billable_hours: 8.0,
          hourly_rate: 80,
          total_amount: 640.00,
          status: 'pending',
          entered_by: user?.full_name || 'Admin'
        },
        {
          id: 3,
          date: '2024-01-13',
          team_member_id: 3,
          team_member_name: 'Mike Johnson',
          client_name: 'Global Industries',
          project_name: 'Data Migration',
          task_description: 'Database optimization and data transfer',
          billable_hours: 5.5,
          hourly_rate: 70,
          total_amount: 385.00,
          status: 'rejected',
          entered_by: user?.full_name || 'Admin'
        }
      ]
      setEntries(mockEntries)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const entryData = {
        ...formData,
        total_amount: parseFloat(formData.billable_hours) * parseFloat(formData.hourly_rate),
        entered_by: user?.full_name || 'Admin'
      }
      
      if (editingEntry) {
        // Update existing entry
        setEntries(prev => prev.map(entry => 
          entry.id === editingEntry.id ? { ...entry, ...entryData } : entry
        ))
      } else {
        // Create new entry
        const newEntry = {
          id: Date.now(),
          ...entryData,
          team_member_name: mockTeamMembers.find(m => m.id === parseInt(formData.team_member_id))?.name || ''
        }
        setEntries(prev => [newEntry, ...prev])
      }
      
      setShowForm(false)
      setEditingEntry(null)
      resetForm()
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      team_member_id: '',
      client_name: '',
      project_name: '',
      task_description: '',
      billable_hours: '',
      hourly_rate: '',
      status: 'pending'
    })
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setFormData({
      date: entry.date,
      team_member_id: entry.team_member_id.toString(),
      client_name: entry.client_name,
      project_name: entry.project_name,
      task_description: entry.task_description,
      billable_hours: entry.billable_hours.toString(),
      hourly_rate: entry.hourly_rate.toString(),
      status: entry.status
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(prev => prev.filter(entry => entry.id !== id))
    }
  }

  const handleBulkAction = (action) => {
    if (selectedEntries.length === 0) return
    
    if (action === 'approve') {
      setEntries(prev => prev.map(entry => 
        selectedEntries.includes(entry.id) ? { ...entry, status: 'approved' } : entry
      ))
    } else if (action === 'reject') {
      setEntries(prev => prev.map(entry => 
        selectedEntries.includes(entry.id) ? { ...entry, status: 'rejected' } : entry
      ))
    } else if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedEntries.length} entries?`)) {
        setEntries(prev => prev.filter(entry => !selectedEntries.includes(entry.id)))
      }
    }
    setSelectedEntries([])
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const filteredAndSortedEntries = entries
    .filter(entry => {
      const matchesSearch = 
        entry.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.team_member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.task_description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDateRange = 
        entry.date >= filters.dateRange.start && entry.date <= filters.dateRange.end
      
      const matchesClient = !filters.client || entry.client_name === filters.client
      const matchesProject = !filters.project || entry.project_name === filters.project
      const matchesStatus = !filters.status || entry.status === filters.status
      const matchesTeamMember = !filters.teamMember || entry.team_member_name === filters.teamMember
      
      return matchesSearch && matchesDateRange && matchesClient && matchesProject && matchesStatus && matchesTeamMember
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const totalBillableHours = filteredAndSortedEntries.reduce((sum, entry) => sum + entry.billable_hours, 0)
  const totalRevenue = filteredAndSortedEntries.reduce((sum, entry) => sum + entry.total_amount, 0)

  return (
    <div className="page-content" style={{ height: '100vh', overflowY: 'auto' }}>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billable Hours Entry</h1>
            <p className="text-gray-600 mt-1">Enter and manage daily billable hours for team members</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
            <button
              onClick={fetchEntries}
              disabled={loading}
              className="btn btn-outline flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => console.log('Export entries')}
              className="btn btn-outline flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="stat-icon bg-blue-100">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Billable Hours</p>
              <p className="stat-value text-blue-600">{totalBillableHours.toFixed(1)}h</p>
              <p className="stat-change text-gray-600">{filteredAndSortedEntries.length} entries</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <p className="stat-value text-green-600">${totalRevenue.toLocaleString()}</p>
              <p className="stat-change text-green-600">
                ${totalBillableHours > 0 ? (totalRevenue / totalBillableHours).toFixed(2) : '0'}/hour avg
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon bg-purple-100">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Active Resources</p>
              <p className="stat-value text-purple-600">
                {new Set(filteredAndSortedEntries.map(e => e.team_member_name)).size}
              </p>
              <p className="stat-change text-gray-600">team members</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Client</label>
                <select
                  value={filters.client}
                  onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
                  className="form-select"
                >
                  <option value="">All Clients</option>
                  {mockClients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="form-select"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by client, project, team member, or task description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedEntries.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                {selectedEntries.length} entries selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="btn btn-sm btn-outline text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="btn btn-sm btn-outline text-red-600 border-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="btn btn-sm btn-outline text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entries Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Billable Hours Entries</h3>
            <p className="card-description">
              {filteredAndSortedEntries.length} of {entries.length} entries
            </p>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner mr-3"></div>
                <span>Loading entries...</span>
              </div>
            ) : filteredAndSortedEntries.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
                <p className="text-gray-600 mb-4">No billable hours entries match your current filters.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Entry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedEntries.length === filteredAndSortedEntries.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntries(filteredAndSortedEntries.map(entry => entry.id))
                            } else {
                              setSelectedEntries([])
                            }
                          }}
                          className="form-checkbox"
                        />
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          {sortConfig.key === 'date' && (
                            sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Team Member</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Hours</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedEntries.includes(entry.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEntries(prev => [...prev, entry.id])
                              } else {
                                setSelectedEntries(prev => prev.filter(id => id !== entry.id))
                              }
                            }}
                            className="form-checkbox"
                          />
                        </td>
                        <td className="py-3 px-4">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-blue-600">
                                {entry.team_member_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            {entry.team_member_name}
                          </div>
                        </td>
                        <td className="py-3 px-4">{entry.client_name}</td>
                        <td className="py-3 px-4">{entry.project_name}</td>
                        <td className="py-3 px-4 font-medium">{entry.billable_hours}h</td>
                        <td className="py-3 px-4">${entry.hourly_rate}</td>
                        <td className="py-3 px-4 font-medium text-green-600">
                          ${entry.total_amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge ${
                            entry.status === 'approved' ? 'badge-green' :
                            entry.status === 'rejected' ? 'badge-red' : 'badge-yellow'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="btn btn-sm btn-ghost text-blue-600 hover:text-blue-700"
                              title="Edit entry"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="btn btn-sm btn-ghost text-red-600 hover:text-red-700"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Entry Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingEntry ? 'Edit Billable Hours Entry' : 'Add Billable Hours Entry'}
                </h3>
                <button 
                  onClick={() => {
                    setShowForm(false)
                    setEditingEntry(null)
                    resetForm()
                  }}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Team Member *</label>
                    <select
                      value={formData.team_member_id}
                      onChange={(e) => setFormData({ ...formData, team_member_id: e.target.value })}
                      className="form-select"
                      required
                    >
                      <option value="">Select team member</option>
                      {mockTeamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Client *</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="form-input"
                      placeholder="Enter client name"
                      list="clients"
                      required
                    />
                    <datalist id="clients">
                      {mockClients.map(client => (
                        <option key={client} value={client} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="form-label">Project *</label>
                    <input
                      type="text"
                      value={formData.project_name}
                      onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                      className="form-input"
                      placeholder="Enter project name"
                      list="projects"
                      required
                    />
                    <datalist id="projects">
                      {mockProjects.map(project => (
                        <option key={project} value={project} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="form-label">Billable Hours *</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      value={formData.billable_hours}
                      onChange={(e) => setFormData({ ...formData, billable_hours: e.target.value })}
                      className="form-input"
                      placeholder="8.0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Hourly Rate *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                      className="form-input"
                      placeholder="75.00"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Task Description *</label>
                  <textarea
                    value={formData.task_description}
                    onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe the work performed..."
                    required
                  />
                </div>
                
                {formData.billable_hours && formData.hourly_rate && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">
                        ${(parseFloat(formData.billable_hours || 0) * parseFloat(formData.hourly_rate || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowForm(false)
                      setEditingEntry(null)
                      resetForm()
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingEntry ? 'Update' : 'Save'} Entry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BillableHoursEntry

