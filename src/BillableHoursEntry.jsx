// BillableHoursEntry.jsx - Interface for admins and campaign leaders to enter billable hours

import React, { useState, useEffect } from 'react'
import { 
  Clock, Users, Calendar, DollarSign, Plus, Save, Search, Filter,
  CheckCircle, AlertCircle, TrendingUp, Edit, Trash2, Eye
} from 'lucide-react'

// Billable Hours Entry Component
function BillableHoursEntry({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [teamMembers, setTeamMembers] = useState([])
  const [billableEntries, setBillableEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeamMember, setSelectedTeamMember] = useState(null)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    team_member_id: '',
    date: selectedDate,
    client_name: '',
    project_name: '',
    task_description: '',
    billable_hours: '',
    hourly_rate: '',
    total_amount: 0,
    status: 'pending'
  })

  // Mock data for team members
  const mockTeamMembers = [
    { id: 1, name: 'John Doe', role: 'Developer', hourly_rate: 75, department: 'Engineering' },
    { id: 2, name: 'Jane Smith', role: 'Designer', hourly_rate: 65, department: 'Design' },
    { id: 3, name: 'Mike Johnson', role: 'Analyst', hourly_rate: 55, department: 'Analytics' },
    { id: 4, name: 'Sarah Wilson', role: 'Manager', hourly_rate: 85, department: 'Management' }
  ]

  // Mock billable entries
  const mockBillableEntries = [
    {
      id: 1,
      team_member_id: 1,
      team_member_name: 'John Doe',
      date: selectedDate,
      client_name: 'Acme Corp',
      project_name: 'Website Redesign',
      task_description: 'Frontend development',
      billable_hours: 6.5,
      hourly_rate: 75,
      total_amount: 487.50,
      status: 'approved',
      entered_by: user?.full_name
    },
    {
      id: 2,
      team_member_id: 2,
      team_member_name: 'Jane Smith',
      date: selectedDate,
      client_name: 'Tech Solutions',
      project_name: 'Mobile App',
      task_description: 'UI/UX Design',
      billable_hours: 4.0,
      hourly_rate: 65,
      total_amount: 260.00,
      status: 'pending',
      entered_by: user?.full_name
    }
  ]

  useEffect(() => {
    setTeamMembers(mockTeamMembers)
    setBillableEntries(mockBillableEntries)
  }, [selectedDate])

  useEffect(() => {
    if (newEntry.billable_hours && newEntry.hourly_rate) {
      const total = parseFloat(newEntry.billable_hours) * parseFloat(newEntry.hourly_rate)
      setNewEntry(prev => ({ ...prev, total_amount: total.toFixed(2) }))
    }
  }, [newEntry.billable_hours, newEntry.hourly_rate])

  const handleSubmitEntry = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Mock API call
      const entry = {
        ...newEntry,
        id: Date.now(),
        team_member_name: teamMembers.find(tm => tm.id === parseInt(newEntry.team_member_id))?.name,
        entered_by: user?.full_name,
        created_at: new Date().toISOString()
      }
      
      setBillableEntries(prev => [...prev, entry])
      setNewEntry({
        team_member_id: '',
        date: selectedDate,
        client_name: '',
        project_name: '',
        task_description: '',
        billable_hours: '',
        hourly_rate: '',
        total_amount: 0,
        status: 'pending'
      })
      setShowEntryForm(false)
      
    } catch (error) {
      console.error('Error creating billable entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamMemberSelect = (teamMemberId) => {
    const member = teamMembers.find(tm => tm.id === parseInt(teamMemberId))
    if (member) {
      setNewEntry(prev => ({
        ...prev,
        team_member_id: teamMemberId,
        hourly_rate: member.hourly_rate.toString()
      }))
    }
  }

  const filteredEntries = billableEntries.filter(entry =>
    entry.team_member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const dailyTotal = filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.total_amount || 0), 0)
  const totalHours = filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.billable_hours || 0), 0)

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <div className="flex flex-col lg-flex-row lg-items-center lg-justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billable Hours Entry</h1>
          <p className="text-gray-600 mt-1">Enter and manage billable hours for team members</p>
        </div>
        <div className="flex flex-col sm-flex-row gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
          />
          <button
            onClick={() => setShowEntryForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Billable Hours
          </button>
        </div>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md-grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Billable Hours</p>
            <p className="stat-value">{totalHours.toFixed(1)}h</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Daily Revenue</p>
            <p className="stat-value">${dailyTotal.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Team Members</p>
            <p className="stat-value">{new Set(filteredEntries.map(e => e.team_member_id)).size}</p>
          </div>
        </div>
      </div>

      {/* Entry Form Modal */}
      {showEntryForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="modal-title">Add Billable Hours Entry</h3>
              <button 
                onClick={() => setShowEntryForm(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitEntry} className="space-y-4">
              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Team Member</label>
                  <select
                    value={newEntry.team_member_id}
                    onChange={(e) => handleTeamMemberSelect(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <input
                    type="text"
                    value={newEntry.client_name}
                    onChange={(e) => setNewEntry({...newEntry, client_name: e.target.value})}
                    className="form-input"
                    placeholder="Enter client name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    value={newEntry.project_name}
                    onChange={(e) => setNewEntry({...newEntry, project_name: e.target.value})}
                    className="form-input"
                    placeholder="Enter project name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Task Description</label>
                <textarea
                  value={newEntry.task_description}
                  onChange={(e) => setNewEntry({...newEntry, task_description: e.target.value})}
                  className="form-textarea"
                  placeholder="Describe the work performed"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md-grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Billable Hours</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="24"
                    value={newEntry.billable_hours}
                    onChange={(e) => setNewEntry({...newEntry, billable_hours: e.target.value})}
                    className="form-input"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newEntry.hourly_rate}
                    onChange={(e) => setNewEntry({...newEntry, hourly_rate: e.target.value})}
                    className="form-input"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount ($)</label>
                  <input
                    type="text"
                    value={newEntry.total_amount}
                    className="form-input bg-gray-50"
                    disabled
                  />
                </div>
              </div>

              <div className="flex flex-col sm-flex-row gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="loading-spinner"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Entry
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEntryForm(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col lg-flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <div className="search-input-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Billable Hours Entries */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Billable Hours Entries - {selectedDate}</h3>
          <p className="card-description">Manage billable hours for the selected date</p>
        </div>
        <div className="card-content">
          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-state-icon" />
              <h3 className="empty-state-title">No billable hours entries</h3>
              <p className="empty-state-description">
                Add billable hours entries for team members to track revenue and utilization
              </p>
              <button
                onClick={() => setShowEntryForm(true)}
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Team Member</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Client/Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Task</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover-bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-600">
                              {entry.team_member_name?.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium">{entry.team_member_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{entry.client_name}</p>
                          <p className="text-sm text-gray-600">{entry.project_name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {entry.task_description}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-medium">{entry.billable_hours}h</td>
                      <td className="py-3 px-4">${entry.hourly_rate}</td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        ${parseFloat(entry.total_amount).toFixed(2)}
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
                        <div className="flex space-x-2">
                          <button className="btn-icon btn-icon-sm">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="btn-icon btn-icon-sm">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="btn-icon btn-icon-sm text-red-600">
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
    </div>
  )
}

export default BillableHoursEntry

