// CampaignManagement.jsx - Campaign Management Interface Component

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Target, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Eye,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Building,
  User,
  Mail,
  Phone
} from 'lucide-react';

import {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  CAMPAIGN_PRIORITY,
  CAMPAIGN_MASTER_DATA_TEMPLATE,
  SUB_CAMPAIGN_TEMPLATE,
  CAMPAIGN_COLOR_SCHEME,
  CAMPAIGN_STATUS_COLORS,
  PRIORITY_COLORS,
  validateCampaignData,
  generateCampaignCode,
  getCampaignStatusLabel,
  getCampaignTypeLabel,
  generateMockCampaignData
} from './CampaignDataModels.jsx';

const CampaignManagement = ({ user, api }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set());
  const [employees, setEmployees] = useState([]);

  // Form state for campaign creation/editing
  const [formData, setFormData] = useState(CAMPAIGN_MASTER_DATA_TEMPLATE);
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    loadCampaigns();
    loadEmployees();
  }, []);

  // Filter campaigns when search or filters change
  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter, typeFilter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      // For now, use mock data - replace with actual API call
      const mockCampaigns = generateMockCampaignData();
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      if (api && api.getUsers) {
        const employeeData = await api.getUsers();
        setEmployees(employeeData);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === typeFilter);
    }

    setFilteredCampaigns(filtered);
  };

  const handleCreateCampaign = () => {
    setFormData({
      ...CAMPAIGN_MASTER_DATA_TEMPLATE,
      id: `camp_${Date.now()}`,
      code: generateCampaignCode(CAMPAIGN_TYPE.CLIENT),
      created_date: new Date().toISOString().split('T')[0],
      created_by: user?.id || 'current_user'
    });
    setFormErrors([]);
    setShowCreateModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({ ...campaign });
    setFormErrors([]);
    setShowEditModal(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        // API call to delete campaign
        setCampaigns(campaigns.filter(c => c.id !== campaignId));
      } catch (error) {
        console.error('Error deleting campaign:', error);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validate form data
    const errors = validateCampaignData(formData);
    if (errors.length > 0) {
      setFormErrors(errors);
      setSaving(false);
      return;
    }

    try {
      const updatedFormData = {
        ...formData,
        last_modified: new Date().toISOString().split('T')[0],
        modified_by: user?.id || 'current_user'
      };

      if (showCreateModal) {
        // Create new campaign
        setCampaigns([...campaigns, updatedFormData]);
        setShowCreateModal(false);
      } else {
        // Update existing campaign
        setCampaigns(campaigns.map(c => 
          c.id === selectedCampaign.id ? updatedFormData : c
        ));
        setShowEditModal(false);
      }

      setFormData(CAMPAIGN_MASTER_DATA_TEMPLATE);
      setSelectedCampaign(null);
    } catch (error) {
      console.error('Error saving campaign:', error);
      setFormErrors(['Failed to save campaign. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate campaign code when type changes
    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        code: generateCampaignCode(value)
      }));
    }
  };

  const toggleCampaignExpansion = (campaignId) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case CAMPAIGN_STATUS.ACTIVE:
        return <CheckCircle className="w-4 h-4" />;
      case CAMPAIGN_STATUS.PLANNING:
        return <Clock className="w-4 h-4" />;
      case CAMPAIGN_STATUS.ON_HOLD:
        return <Pause className="w-4 h-4" />;
      case CAMPAIGN_STATUS.COMPLETED:
        return <Target className="w-4 h-4" />;
      case CAMPAIGN_STATUS.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.full_name || employee.name : 'Unknown Employee';
  };

  if (loading) {
    return (
      <div className="campaign-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="campaign-management">
      {/* Header */}
      <div className="campaign-header">
        <div className="header-left">
          <h1>Campaign Management</h1>
          <p>Manage campaigns, projects, and team assignments</p>
        </div>
        <div className="header-right">
          <button 
            className="btn btn-primary"
            onClick={handleCreateCampaign}
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="campaign-filters">
        <div className="search-box">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {Object.values(CAMPAIGN_STATUS).map(status => (
              <option key={status} value={status}>
                {getCampaignStatusLabel(status)}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.values(CAMPAIGN_TYPE).map(type => (
              <option key={type} value={type}>
                {getCampaignTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaign List */}
      <div className="campaign-list">
        {filteredCampaigns.length === 0 ? (
          <div className="empty-state">
            <Target className="w-12 h-12" />
            <h3>No campaigns found</h3>
            <p>Create your first campaign to get started</p>
            <button 
              className="btn btn-primary"
              onClick={handleCreateCampaign}
            >
              Create Campaign
            </button>
          </div>
        ) : (
          filteredCampaigns.map(campaign => (
            <div key={campaign.id} className="campaign-card">
              <div className="campaign-card-header">
                <div className="campaign-info">
                  <div className="campaign-title">
                    <button
                      className="expand-button"
                      onClick={() => toggleCampaignExpansion(campaign.id)}
                    >
                      {expandedCampaigns.has(campaign.id) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </button>
                    <h3>{campaign.name}</h3>
                    <span 
                      className="campaign-type-badge"
                      style={{ backgroundColor: CAMPAIGN_COLOR_SCHEME[campaign.type] }}
                    >
                      {getCampaignTypeLabel(campaign.type)}
                    </span>
                  </div>
                  <div className="campaign-meta">
                    <span className="campaign-code">{campaign.code}</span>
                    <span 
                      className="campaign-status"
                      style={{ color: CAMPAIGN_STATUS_COLORS[campaign.status] }}
                    >
                      {getStatusIcon(campaign.status)}
                      {getCampaignStatusLabel(campaign.status)}
                    </span>
                  </div>
                </div>

                <div className="campaign-actions">
                  <button
                    className="btn btn-icon"
                    onClick={() => handleEditCampaign(campaign)}
                    title="Edit Campaign"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-icon btn-danger"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Campaign Summary */}
              <div className="campaign-summary">
                <div className="summary-item">
                  <Calendar className="w-4 h-4" />
                  <span>{campaign.start_date} - {campaign.end_date}</span>
                </div>
                <div className="summary-item">
                  <Users className="w-4 h-4" />
                  <span>{campaign.assigned_team_members?.length || 0} team members</span>
                </div>
                {campaign.is_billable && (
                  <div className="summary-item">
                    <DollarSign className="w-4 h-4" />
                    <span>${campaign.budget?.toLocaleString()}</span>
                  </div>
                )}
                <div className="summary-item">
                  <Clock className="w-4 h-4" />
                  <span>{campaign.planned_hours}h planned</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCampaigns.has(campaign.id) && (
                <div className="campaign-details">
                  <div className="details-section">
                    <h4>Description</h4>
                    <p>{campaign.description || 'No description provided'}</p>
                  </div>

                  {campaign.client_name && (
                    <div className="details-section">
                      <h4>Client Information</h4>
                      <div className="client-info">
                        <div className="info-item">
                          <Building className="w-4 h-4" />
                          <span>{campaign.client_name}</span>
                        </div>
                        {campaign.client_contact_name && (
                          <div className="info-item">
                            <User className="w-4 h-4" />
                            <span>{campaign.client_contact_name}</span>
                          </div>
                        )}
                        {campaign.client_contact_email && (
                          <div className="info-item">
                            <Mail className="w-4 h-4" />
                            <span>{campaign.client_contact_email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="details-section">
                    <h4>Team Assignments</h4>
                    <div className="team-assignments">
                      {campaign.assigned_campaign_leaders?.length > 0 && (
                        <div className="assignment-group">
                          <strong>Campaign Leaders:</strong>
                          <ul>
                            {campaign.assigned_campaign_leaders.map(leaderId => (
                              <li key={leaderId}>{getEmployeeName(leaderId)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {campaign.assigned_team_members?.length > 0 && (
                        <div className="assignment-group">
                          <strong>Team Members:</strong>
                          <ul>
                            {campaign.assigned_team_members.map(memberId => (
                              <li key={memberId}>{getEmployeeName(memberId)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {campaign.assigned_executives?.length > 0 && (
                        <div className="assignment-group">
                          <strong>Executives:</strong>
                          <ul>
                            {campaign.assigned_executives.map(execId => (
                              <li key={execId}>{getEmployeeName(execId)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal campaign-modal">
            <div className="modal-header">
              <h2>Create New Campaign</h2>
              <button
                className="btn btn-icon"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-body">
              {formErrors.length > 0 && (
                <div className="error-messages">
                  {formErrors.map((error, index) => (
                    <div key={index} className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-group">
                    <label>Campaign Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Campaign Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleFormChange('code', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        required
                      >
                        {Object.values(CAMPAIGN_TYPE).map(type => (
                          <option key={type} value={type}>
                            {getCampaignTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                      >
                        {Object.values(CAMPAIGN_PRIORITY).map(priority => (
                          <option key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleFormChange('start_date', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date *</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleFormChange('end_date', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Planned Hours</label>
                    <input
                      type="number"
                      value={formData.planned_hours}
                      onChange={(e) => handleFormChange('planned_hours', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>

                {/* Client Information */}
                <div className="form-section">
                  <h3>Client Information</h3>
                  
                  <div className="form-group">
                    <label>Client Name</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => handleFormChange('client_name', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Client Contact Name</label>
                    <input
                      type="text"
                      value={formData.client_contact_name}
                      onChange={(e) => handleFormChange('client_contact_name', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Client Contact Email</label>
                    <input
                      type="email"
                      value={formData.client_contact_email}
                      onChange={(e) => handleFormChange('client_contact_email', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Client Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.client_contact_phone}
                      onChange={(e) => handleFormChange('client_contact_phone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Financial Information */}
                <div className="form-section">
                  <h3>Financial Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Budget</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => handleFormChange('budget', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="form-group">
                      <label>Hourly Rate</label>
                      <input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => handleFormChange('hourly_rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Billing Type</label>
                      <select
                        value={formData.billing_type}
                        onChange={(e) => handleFormChange('billing_type', e.target.value)}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="fixed">Fixed Price</option>
                        <option value="retainer">Retainer</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleFormChange('currency', e.target.value)}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.is_billable}
                        onChange={(e) => handleFormChange('is_billable', e.target.checked)}
                      />
                      This is a billable campaign
                    </label>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="form-section">
                  <h3>Additional Information</h3>
                  
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.requires_approval}
                        onChange={(e) => handleFormChange('requires_approval', e.target.checked)}
                      />
                      Requires approval for time entries
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal campaign-modal">
            <div className="modal-header">
              <h2>Edit Campaign</h2>
              <button
                className="btn btn-icon"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-body">
              {formErrors.length > 0 && (
                <div className="error-messages">
                  {formErrors.map((error, index) => (
                    <div key={index} className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {/* Same form fields as create modal */}
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-group">
                    <label>Campaign Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Campaign Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleFormChange('code', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        required
                      >
                        {Object.values(CAMPAIGN_TYPE).map(type => (
                          <option key={type} value={type}>
                            {getCampaignTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                      >
                        {Object.values(CAMPAIGN_PRIORITY).map(priority => (
                          <option key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                      >
                        {Object.values(CAMPAIGN_STATUS).map(status => (
                          <option key={status} value={status}>
                            {getCampaignStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleFormChange('start_date', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date *</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleFormChange('end_date', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Planned Hours</label>
                    <input
                      type="number"
                      value={formData.planned_hours}
                      onChange={(e) => handleFormChange('planned_hours', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>

                {/* Client Information - Same as create modal */}
                <div className="form-section">
                  <h3>Client Information</h3>
                  
                  <div className="form-group">
                    <label>Client Name</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => handleFormChange('client_name', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Client Contact Name</label>
                    <input
                      type="text"
                      value={formData.client_contact_name}
                      onChange={(e) => handleFormChange('client_contact_name', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Client Contact Email</label>
                    <input
                      type="email"
                      value={formData.client_contact_email}
                      onChange={(e) => handleFormChange('client_contact_email', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Client Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.client_contact_phone}
                      onChange={(e) => handleFormChange('client_contact_phone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Financial Information - Same as create modal */}
                <div className="form-section">
                  <h3>Financial Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Budget</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => handleFormChange('budget', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="form-group">
                      <label>Hourly Rate</label>
                      <input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => handleFormChange('hourly_rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Billing Type</label>
                      <select
                        value={formData.billing_type}
                        onChange={(e) => handleFormChange('billing_type', e.target.value)}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="fixed">Fixed Price</option>
                        <option value="retainer">Retainer</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleFormChange('currency', e.target.value)}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.is_billable}
                        onChange={(e) => handleFormChange('is_billable', e.target.checked)}
                      />
                      This is a billable campaign
                    </label>
                  </div>
                </div>

                {/* Additional Information - Same as create modal */}
                <div className="form-section">
                  <h3>Additional Information</h3>
                  
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.requires_approval}
                        onChange={(e) => handleFormChange('requires_approval', e.target.checked)}
                      />
                      Requires approval for time entries
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;

