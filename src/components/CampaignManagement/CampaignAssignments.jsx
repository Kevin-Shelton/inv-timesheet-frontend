// CampaignAssignments.jsx - Team Member Assignment Management
import React, { useState, useEffect } from 'react';
import './campaign-management.css';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Search, 
  Filter,
  ArrowLeft,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  Save
} from 'lucide-react';
import { supabaseApi } from '../../supabaseClient.js';

const CampaignAssignments = ({ campaign, onBack }) => {
  const [assignments, setAssignments] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [summary, setSummary] = useState({
    total_team_members: 0,
    total_payroll_hours: 0,
    total_billable_hours: 0,
    average_payroll_hours: 0,
    average_billable_hours: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state for adding new assignment
  const [newAssignment, setNewAssignment] = useState({
    user_id: '',
    expected_payroll_hours: '',
    expected_billable_hours: ''
  });

  // Load assignments and related data on component mount
  useEffect(() => {
    if (campaign?.id) {
      loadAssignments();
      loadUnassignedUsers();
      loadSummary();
    }
  }, [campaign?.id]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const assignmentData = await supabaseApi.getCampaignAssignments(campaign.id);
      setAssignments(assignmentData);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Failed to load team assignments. Please try again.');
      // Set fallback data
      setAssignments([
        {
          id: '1',
          campaign_id: campaign.id,
          user_id: '1',
          expected_payroll_hours: 40.00,
          expected_billable_hours: 35.00,
          users: { 
            id: '1', 
            full_name: 'John Doe', 
            email: 'john@example.com', 
            role: 'team_member',
            employment_type: 'full_time'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnassignedUsers = async () => {
    try {
      const userData = await supabaseApi.getUnassignedUsers(campaign.id);
      setUnassignedUsers(userData);
    } catch (err) {
      console.error('Error loading unassigned users:', err);
      setUnassignedUsers([
        { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'team_member' },
        { id: '3', full_name: 'Mike Johnson', email: 'mike@example.com', role: 'manager' }
      ]);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await supabaseApi.getCampaignAssignmentSummary(campaign.id);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error loading summary:', err);
      setSummary({
        total_team_members: 1,
        total_payroll_hours: 40.00,
        total_billable_hours: 35.00,
        average_payroll_hours: 40.00,
        average_billable_hours: 35.00
      });
    }
  };

  // Filter assignments based on search and role
  const filteredAssignments = assignments.filter(assignment => {
    const user = assignment.users;
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleAddAssignment = () => {
    setNewAssignment({
      user_id: '',
      expected_payroll_hours: '',
      expected_billable_hours: ''
    });
    setShowAddModal(true);
  };

  const handleSaveAssignment = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!newAssignment.user_id) {
        alert('Please select a team member');
        return;
      }
      if (!newAssignment.expected_payroll_hours || parseFloat(newAssignment.expected_payroll_hours) < 0) {
        alert('Please enter valid expected payroll hours');
        return;
      }
      if (!newAssignment.expected_billable_hours || parseFloat(newAssignment.expected_billable_hours) < 0) {
        alert('Please enter valid expected billable hours');
        return;
      }

      const assignmentData = {
        campaign_id: campaign.id,
        user_id: newAssignment.user_id,
        expected_payroll_hours: parseFloat(newAssignment.expected_payroll_hours),
        expected_billable_hours: parseFloat(newAssignment.expected_billable_hours)
      };

      await supabaseApi.assignUserToCampaign(assignmentData);
      
      // Reload data
      await loadAssignments();
      await loadUnassignedUsers();
      await loadSummary();
      
      setShowAddModal(false);
      setNewAssignment({
        user_id: '',
        expected_payroll_hours: '',
        expected_billable_hours: ''
      });
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Failed to assign team member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment({
      ...assignment,
      expected_payroll_hours: assignment.expected_payroll_hours.toString(),
      expected_billable_hours: assignment.expected_billable_hours.toString()
    });
  };

  const handleSaveEdit = async (assignmentId) => {
    try {
      setSaving(true);
      
      const updateData = {
        expected_payroll_hours: parseFloat(editingAssignment.expected_payroll_hours),
        expected_billable_hours: parseFloat(editingAssignment.expected_billable_hours)
      };

      await supabaseApi.updateCampaignAssignment(assignmentId, updateData);
      
      // Reload data
      await loadAssignments();
      await loadSummary();
      
      setEditingAssignment(null);
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Failed to update assignment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
  };

  const handleRemoveAssignment = async (assignmentId, userName) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this campaign?`)) {
      return;
    }

    try {
      await supabaseApi.removeUserFromCampaign(assignmentId);
      
      // Reload data
      await loadAssignments();
      await loadUnassignedUsers();
      await loadSummary();
    } catch (error) {
      console.error('Error removing assignment:', error);
      alert('Failed to remove team member. Please try again.');
    }
  };

  const calculateBillableRatio = (billableHours, payrollHours) => {
    if (payrollHours === 0) return 0;
    return Math.round((billableHours / payrollHours) * 100);
  };

  const getBillableRatioClass = (ratio) => {
    if (ratio >= 80) return 'high';
    if (ratio >= 60) return 'medium';
    return 'low';
  };

  return (
    <div className="campaign-assignments">
      {/* Header */}
      <div className="assignments-header">
        <div className="assignments-title">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onBack}
            style={{ marginRight: '16px' }}
          >
            <ArrowLeft size={16} />
            Back to Campaigns
          </button>
          <div>
            <h2>Team Assignments</h2>
            <p className="campaign-name">{campaign.name}</p>
          </div>
        </div>
        <div className="assignments-actions">
          <button 
            className="btn btn-primary"
            onClick={handleAddAssignment}
            disabled={unassignedUsers.length === 0}
          >
            <Plus size={16} />
            Assign Team Member
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="assignments-loading">
          <div className="spin">⏳</div>
          <span>Loading team assignments...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="assignments-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="assignments-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <Users size={24} />
            </div>
            <div className="summary-content">
              <h3>{summary.total_team_members}</h3>
              <p>Team Members</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <Clock size={24} />
            </div>
            <div className="summary-content">
              <h3>{summary.total_payroll_hours.toFixed(1)}h</h3>
              <p>Total Payroll Hours</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <DollarSign size={24} />
            </div>
            <div className="summary-content">
              <h3>{summary.total_billable_hours.toFixed(1)}h</h3>
              <p>Total Billable Hours</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <TrendingUp size={24} />
            </div>
            <div className="summary-content">
              <h3>{summary.total_payroll_hours > 0 ? Math.round((summary.total_billable_hours / summary.total_payroll_hours) * 100) : 0}%</h3>
              <p>Billable Ratio</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {!loading && !error && assignments.length > 0 && (
        <div className="assignments-filters">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <Filter size={16} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="team_member">Team Member</option>
            </select>
          </div>
        </div>
      )}

      {/* Assignments Table */}
      {!loading && !error && (
        <div className="assignments-table-container">
          {filteredAssignments.length === 0 ? (
            <div className="assignments-empty">
              <Users size={48} />
              <h3>No team members assigned</h3>
              <p>
                {searchTerm || roleFilter !== 'all' 
                  ? 'No team members match your search criteria'
                  : 'Get started by assigning team members to this campaign'
                }
              </p>
              {!searchTerm && roleFilter === 'all' && unassignedUsers.length > 0 && (
                <button 
                  className="btn btn-primary"
                  onClick={handleAddAssignment}
                >
                  <Plus size={16} />
                  Assign Team Member
                </button>
              )}
            </div>
          ) : (
            <table className="assignments-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Role</th>
                  <th>Expected Payroll Hours</th>
                  <th>Expected Billable Hours</th>
                  <th>Billable Ratio</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => {
                  const isEditing = editingAssignment?.id === assignment.id;
                  const billableRatio = calculateBillableRatio(
                    assignment.expected_billable_hours, 
                    assignment.expected_payroll_hours
                  );
                  
                  return (
                    <tr 
                      key={assignment.id} 
                      className={isEditing ? 'editing' : ''}
                    >
                      <td>
                        <div className="user-info">
                          <div>
                            <div className="user-name">{assignment.users.full_name}</div>
                            <div className="user-email">{assignment.users.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="role-badge">
                          {assignment.users.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            className="hours-input"
                            value={editingAssignment.expected_payroll_hours}
                            onChange={(e) => setEditingAssignment(prev => ({
                              ...prev,
                              expected_payroll_hours: e.target.value
                            }))}
                          />
                        ) : (
                          <span className="hours-display">
                            {assignment.expected_payroll_hours}h
                          </span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            className="hours-input"
                            value={editingAssignment.expected_billable_hours}
                            onChange={(e) => setEditingAssignment(prev => ({
                              ...prev,
                              expected_billable_hours: e.target.value
                            }))}
                          />
                        ) : (
                          <span className="hours-display">
                            {assignment.expected_billable_hours}h
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`billable-ratio ${getBillableRatioClass(billableRatio)}`}>
                          {billableRatio}%
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {isEditing ? (
                            <>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSaveEdit(assignment.id)}
                                disabled={saving}
                              >
                                <Save size={14} />
                                Save
                              </button>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={handleCancelEdit}
                                disabled={saving}
                              >
                                <X size={14} />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEditAssignment(assignment)}
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveAssignment(assignment.id, assignment.users.full_name)}
                              >
                                <Trash2 size={14} />
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Team Member</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Team Member *</label>
                <select
                  value={newAssignment.user_id}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, user_id: e.target.value }))}
                >
                  <option value="">Select a team member</option>
                  {unassignedUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
                {unassignedUsers.length === 0 && (
                  <small>All available team members are already assigned to this campaign.</small>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Expected Payroll Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newAssignment.expected_payroll_hours}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, expected_payroll_hours: e.target.value }))}
                    placeholder="40.0"
                  />
                  <small>Hours per week for payroll calculation</small>
                </div>
                
                <div className="form-group">
                  <label>Expected Billable Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newAssignment.expected_billable_hours}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, expected_billable_hours: e.target.value }))}
                    placeholder="35.0"
                  />
                  <small>Hours per week billable to client</small>
                </div>
              </div>

              {newAssignment.expected_payroll_hours && newAssignment.expected_billable_hours && (
                <div className="billable-preview">
                  <strong>Billable Ratio: {calculateBillableRatio(
                    parseFloat(newAssignment.expected_billable_hours), 
                    parseFloat(newAssignment.expected_payroll_hours)
                  )}%</strong>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveAssignment}
                disabled={saving || !newAssignment.user_id || !newAssignment.expected_payroll_hours || !newAssignment.expected_billable_hours}
              >
                {saving ? 'Assigning...' : 'Assign Team Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignAssignments;

