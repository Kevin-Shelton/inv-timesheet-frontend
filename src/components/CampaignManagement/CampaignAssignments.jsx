// CampaignAssignments.jsx - Team Member Assignment Management
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  User,
  Mail,
  Briefcase,
  Target,
  TrendingUp,
  Calendar,
  Save,
  X
} from 'lucide-react';

// Import the enhanced supabase client
import { supabaseApi } from '../supabaseClient.js';

const CampaignAssignments = ({ campaignId, campaignName, onBack }) => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Load assignments when component mounts or campaignId changes
  useEffect(() => {
    if (campaignId) {
      loadAssignments();
      loadSummary();
    }
  }, [campaignId]);

  // Filter assignments when search or filters change
  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm, roleFilter]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 CAMPAIGN ASSIGNMENTS: Loading assignments for campaign', campaignId);
      
      const data = await supabaseApi.getCampaignAssignments(campaignId);
      
      console.log('🎯 CAMPAIGN ASSIGNMENTS: Loaded', data.length, 'assignments');
      setAssignments(data || []);
      
    } catch (error) {
      console.error('🎯 CAMPAIGN ASSIGNMENTS ERROR:', error);
      setError(error.message || 'Failed to load campaign assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await supabaseApi.getCampaignAssignmentSummary(campaignId);
      setSummary(summaryData);
    } catch (error) {
      console.error('🎯 CAMPAIGN SUMMARY ERROR:', error);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.users?.role === roleFilter);
    }

    setFilteredAssignments(filtered);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
  };

  const handleSaveEdit = async (assignmentId, newPayrollHours, newBillableHours) => {
    try {
      const updatedAssignment = await supabaseApi.updateCampaignAssignment(assignmentId, {
        expected_payroll_hours: newPayrollHours,
        expected_billable_hours: newBillableHours
      });

      // Update local state
      setAssignments(prev => prev.map(a => 
        a.id === assignmentId ? updatedAssignment : a
      ));

      setEditingAssignment(null);
      loadSummary(); // Refresh summary
      
      console.log('🎯 CAMPAIGN ASSIGNMENTS: Assignment updated');
      
    } catch (error) {
      console.error('🎯 ASSIGNMENT UPDATE ERROR:', error);
      setError('Failed to update assignment: ' + error.message);
    }
  };

  const handleRemoveAssignment = async (assignmentId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from this campaign?`)) {
      return;
    }

    try {
      await supabaseApi.removeUserFromCampaign(assignmentId);
      
      // Update local state
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      loadSummary(); // Refresh summary
      
      console.log('🎯 CAMPAIGN ASSIGNMENTS: Assignment removed');
      
    } catch (error) {
      console.error('🎯 ASSIGNMENT REMOVE ERROR:', error);
      setError('Failed to remove assignment: ' + error.message);
    }
  };

  const handleAssignmentAdded = (newAssignment) => {
    setAssignments(prev => [newAssignment, ...prev]);
    setShowAssignModal(false);
    loadSummary(); // Refresh summary
  };

  // Get unique roles for filter
  const availableRoles = [...new Set(assignments.map(a => a.users?.role).filter(Boolean))];

  if (loading) {
    return (
      <div className="campaign-assignments">
        <div className="assignments-header">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Campaigns
          </button>
          <h2>Team Assignments - {campaignName}</h2>
        </div>
        <div className="assignments-loading">
          <RefreshCw className="spin" size={24} />
          <span>Loading team assignments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-assignments">
      <div className="assignments-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Campaigns
        </button>
        <div className="assignments-title">
          <h2>Team Assignments</h2>
          <span className="campaign-name">{campaignName}</span>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAssignModal(true)}
        >
          <Plus size={16} />
          Assign Team Member
        </button>
      </div>

      {error && (
        <div className="assignments-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={loadAssignments} className="btn btn-sm">
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
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
            <h3>{summary.total_billable_hours > 0 ? ((summary.total_billable_hours / summary.total_payroll_hours) * 100).toFixed(1) : 0}%</h3>
            <p>Billable Ratio</p>
          </div>
        </div>
      </div>

      {/* Filters */}
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
            {availableRoles.map(role => (
              <option key={role} value={role}>
                {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="assignments-table-container">
        {filteredAssignments.length === 0 ? (
          <div className="assignments-empty">
            <Users size={48} />
            <h3>No team members assigned</h3>
            <p>
              {assignments.length === 0 
                ? 'Assign team members to this campaign to get started.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {assignments.length === 0 && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowAssignModal(true)}
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
              {filteredAssignments.map(assignment => (
                <AssignmentRow
                  key={assignment.id}
                  assignment={assignment}
                  isEditing={editingAssignment?.id === assignment.id}
                  onEdit={() => handleEditAssignment(assignment)}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingAssignment(null)}
                  onRemove={handleRemoveAssignment}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Team Member Modal */}
      {showAssignModal && (
        <AssignTeamMemberModal
          campaignId={campaignId}
          campaignName={campaignName}
          onClose={() => setShowAssignModal(false)}
          onAssignmentAdded={handleAssignmentAdded}
        />
      )}
    </div>
  );
};

// Assignment Row Component with inline editing
const AssignmentRow = ({ assignment, isEditing, onEdit, onSave, onCancel, onRemove }) => {
  const [payrollHours, setPayrollHours] = useState(assignment.expected_payroll_hours);
  const [billableHours, setBillableHours] = useState(assignment.expected_billable_hours);

  const handleSave = () => {
    onSave(assignment.id, parseFloat(payrollHours), parseFloat(billableHours));
  };

  const billableRatio = payrollHours > 0 ? ((billableHours / payrollHours) * 100).toFixed(1) : 0;

  if (isEditing) {
    return (
      <tr className="editing">
        <td>
          <div className="user-info">
            <User size={16} />
            <div>
              <div className="user-name">{assignment.users?.full_name}</div>
              <div className="user-email">{assignment.users?.email}</div>
            </div>
          </div>
        </td>
        <td>
          <span className="role-badge">
            {assignment.users?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </td>
        <td>
          <input
            type="number"
            step="0.5"
            min="0"
            value={payrollHours}
            onChange={(e) => setPayrollHours(e.target.value)}
            className="hours-input"
          />
        </td>
        <td>
          <input
            type="number"
            step="0.5"
            min="0"
            value={billableHours}
            onChange={(e) => setBillableHours(e.target.value)}
            className="hours-input"
          />
        </td>
        <td>
          <span className="billable-ratio">{billableRatio}%</span>
        </td>
        <td>
          <div className="action-buttons">
            <button className="btn btn-sm btn-primary" onClick={handleSave}>
              <Save size={14} />
            </button>
            <button className="btn btn-sm btn-secondary" onClick={onCancel}>
              <X size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        <div className="user-info">
          <User size={16} />
          <div>
            <div className="user-name">{assignment.users?.full_name}</div>
            <div className="user-email">{assignment.users?.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span className="role-badge">
          {assignment.users?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </td>
      <td>
        <span className="hours-display">{assignment.expected_payroll_hours}h</span>
      </td>
      <td>
        <span className="hours-display">{assignment.expected_billable_hours}h</span>
      </td>
      <td>
        <span className={`billable-ratio ${billableRatio >= 80 ? 'high' : billableRatio >= 60 ? 'medium' : 'low'}`}>
          {billableRatio}%
        </span>
      </td>
      <td>
        <div className="action-buttons">
          <button className="btn btn-sm btn-secondary" onClick={onEdit}>
            <Edit size={14} />
          </button>
          <button 
            className="btn btn-sm btn-danger" 
            onClick={() => onRemove(assignment.id, assignment.users?.full_name)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Assign Team Member Modal Component
const AssignTeamMemberModal = ({ campaignId, campaignName, onClose, onAssignmentAdded }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [payrollHours, setPayrollHours] = useState('40');
  const [billableHours, setBillableHours] = useState('35');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAvailableUsers();
  }, [campaignId]);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      const users = await supabaseApi.getUnassignedUsers(campaignId);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading available users:', error);
      setError('Failed to load available users');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      setError('Please select a team member');
      return;
    }

    if (!payrollHours || parseFloat(payrollHours) <= 0) {
      setError('Please enter valid payroll hours');
      return;
    }

    if (!billableHours || parseFloat(billableHours) < 0) {
      setError('Please enter valid billable hours');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const newAssignment = await supabaseApi.assignUserToCampaign({
        campaign_id: campaignId,
        user_id: selectedUserId,
        expected_payroll_hours: parseFloat(payrollHours),
        expected_billable_hours: parseFloat(billableHours)
      });

      onAssignmentAdded(newAssignment);
      
    } catch (error) {
      console.error('Error assigning user:', error);
      setError('Failed to assign team member: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Assign Team Member to {campaignName}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <RefreshCw className="spin" size={20} />
              <span>Loading available team members...</span>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="empty-state">
              <Users size={32} />
              <p>All team members are already assigned to this campaign.</p>
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group">
                <label>Team Member *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select a team member...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email}) - {user.role?.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Expected Payroll Hours *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={payrollHours}
                  onChange={(e) => setPayrollHours(e.target.value)}
                  placeholder="40"
                />
                <small>Hours per week for payroll calculation</small>
              </div>

              <div className="form-group">
                <label>Expected Billable Hours *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={billableHours}
                  onChange={(e) => setBillableHours(e.target.value)}
                  placeholder="35"
                />
                <small>Hours per week billable to client</small>
              </div>

              {payrollHours && billableHours && (
                <div className="billable-preview">
                  <strong>Billable Ratio: {((parseFloat(billableHours) / parseFloat(payrollHours)) * 100).toFixed(1)}%</strong>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          
          {availableUsers.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={handleAssign}
              disabled={saving || !selectedUserId}
            >
              {saving ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Assign Team Member
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignAssignments;

