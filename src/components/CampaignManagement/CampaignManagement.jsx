// Enhanced CampaignManagement.jsx with Team Assignment Functionality
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
  Phone,
  Briefcase,
  RefreshCw,
  UserPlus,
  Settings
} from 'lucide-react';

// Import components
import CampaignAssignments from './CampaignAssignments';

// Import the enhanced supabase client
import { supabaseApi } from '../supabaseClient.js';

const CampaignManagement = ({ user }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Tab and view state
  const [activeTab, setActiveTab] = useState('campaigns');
  const [viewingAssignments, setViewingAssignments] = useState(false);
  const [assignmentCampaign, setAssignmentCampaign] = useState(null);

  // Form state for campaign creation/editing
  const [formData, setFormData] = useState({
    name: '',
    billing_rate_per_hour: '',
    client_name: '',
    description: '',
    is_billable: true,
    is_active: true,
    crm_campaign_id: '',
    crm_config: {}
  });
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load campaigns using enhanced API
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Filter campaigns when search or filters change
  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 CAMPAIGN MANAGEMENT: Loading campaigns...');
      
      // Use enhanced API that handles authentication and fallbacks
      const data = await supabaseApi.getCampaigns();
      
      console.log('🎯 CAMPAIGN MANAGEMENT: Loaded', data.length, 'campaigns');
      setCampaigns(data || []);
      
    } catch (error) {
      console.error('🎯 CAMPAIGN MANAGEMENT ERROR:', error);
      setError(error.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.crm_campaign_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(campaign => campaign.is_active === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(campaign => campaign.is_active === false);
    }

    setFilteredCampaigns(filtered);
  };

  const handleCreateCampaign = () => {
    setFormData({
      name: '',
      billing_rate_per_hour: '',
      client_name: '',
      description: '',
      is_billable: true,
      is_active: true,
      crm_campaign_id: '',
      crm_config: {}
    });
    setFormErrors([]);
    setShowCreateModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      billing_rate_per_hour: campaign.billing_rate_per_hour?.toString() || '',
      client_name: campaign.client_name || '',
      description: campaign.description || '',
      is_billable: campaign.is_billable !== false,
      is_active: campaign.is_active !== false,
      crm_campaign_id: campaign.crm_campaign_id || '',
      crm_config: campaign.crm_config || {}
    });
    setFormErrors([]);
    setShowEditModal(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      
      // For now, just remove from local state since we don't have delete API
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      
      console.log('🎯 CAMPAIGN MANAGEMENT: Campaign deleted (local only)');
      
    } catch (error) {
      console.error('🎯 CAMPAIGN DELETE ERROR:', error);
      setError('Failed to delete campaign: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleViewAssignments = (campaign) => {
    setAssignmentCampaign(campaign);
    setViewingAssignments(true);
    setActiveTab('assignments');
  };

  const handleBackToCampaigns = () => {
    setViewingAssignments(false);
    setAssignmentCampaign(null);
    setActiveTab('campaigns');
  };

  const handleSaveCampaign = async () => {
    try {
      setSaving(true);
      setFormErrors([]);

      // Basic validation
      const errors = [];
      if (!formData.name?.trim()) {
        errors.push('Campaign name is required');
      }
      if (!formData.client_name?.trim()) {
        errors.push('Client name is required');
      }
      if (formData.billing_rate_per_hour && isNaN(parseFloat(formData.billing_rate_per_hour))) {
        errors.push('Billing rate must be a valid number');
      }

      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }

      // For now, just update local state since we don't have save API
      const campaignData = {
        ...formData,
        billing_rate_per_hour: formData.billing_rate_per_hour ? parseFloat(formData.billing_rate_per_hour) : null,
        id: selectedCampaign?.id || `temp-${Date.now()}`,
        created_at: selectedCampaign?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (selectedCampaign) {
        // Update existing
        setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? campaignData : c));
        console.log('🎯 CAMPAIGN MANAGEMENT: Campaign updated (local only)');
      } else {
        // Create new
        setCampaigns(prev => [campaignData, ...prev]);
        console.log('🎯 CAMPAIGN MANAGEMENT: Campaign created (local only)');
      }

      // Close modals
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedCampaign(null);

    } catch (error) {
      console.error('🎯 CAMPAIGN SAVE ERROR:', error);
      setFormErrors(['Failed to save campaign: ' + error.message]);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCampaign(null);
    setFormErrors([]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // If viewing assignments, show the assignments component
  if (viewingAssignments && assignmentCampaign) {
    return (
      <CampaignAssignments
        campaignId={assignmentCampaign.id}
        campaignName={assignmentCampaign.name}
        onBack={handleBackToCampaigns}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="campaign-management">
        <div className="campaign-header">
          <h2>Campaign Management</h2>
        </div>
        <div className="campaign-loading">
          <RefreshCw className="spin" size={24} />
          <span>Loading campaigns...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-management">
      <div className="campaign-header">
        <div className="campaign-title">
          <h2>Campaign Management</h2>
          <span className="campaign-count">
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="campaign-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateCampaign}
            disabled={saving}
          >
            <Plus size={16} />
            New Campaign
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="campaign-tabs">
        <button 
          className={`tab ${activeTab === 'campaigns' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          <Target size={16} />
          All Campaigns
        </button>
        <button 
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
          disabled={!assignmentCampaign}
        >
          <Users size={16} />
          Team Assignments
          {assignmentCampaign && (
            <span className="tab-subtitle">({assignmentCampaign.name})</span>
          )}
        </button>
      </div>

      {error && (
        <div className="campaign-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={loadCampaigns} className="btn btn-sm">
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      <div className="campaign-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="campaign-list">
        {filteredCampaigns.length === 0 ? (
          <div className="campaign-empty">
            <Target size={48} />
            <h3>No campaigns found</h3>
            <p>
              {campaigns.length === 0 
                ? 'Create your first campaign to get started.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {campaigns.length === 0 && (
              <button 
                className="btn btn-primary"
                onClick={handleCreateCampaign}
              >
                <Plus size={16} />
                Create Campaign
              </button>
            )}
          </div>
        ) : (
          filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={handleEditCampaign}
              onDelete={handleDeleteCampaign}
              onViewAssignments={handleViewAssignments}
              saving={saving}
            />
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {formErrors.length > 0 && (
                <div className="form-errors">
                  {formErrors.map((error, index) => (
                    <div key={index} className="error-message">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Campaign Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter campaign name"
                  />
                </div>

                <div className="form-group">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    placeholder="Enter client name"
                  />
                </div>

                <div className="form-group">
                  <label>Billing Rate ($/hour)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.billing_rate_per_hour}
                    onChange={(e) => handleInputChange('billing_rate_per_hour', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>CRM Campaign ID</label>
                  <input
                    type="text"
                    value={formData.crm_campaign_id}
                    onChange={(e) => handleInputChange('crm_campaign_id', e.target.value)}
                    placeholder="External campaign ID"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Campaign description..."
                  rows="3"
                />
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_billable}
                    onChange={(e) => handleInputChange('is_billable', e.target.checked)}
                  />
                  Billable Campaign
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  />
                  Active Campaign
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseModal}
                disabled={saving}
              >
                Cancel
              </button>
              
              <button
                className="btn btn-primary"
                onClick={handleSaveCampaign}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    {selectedCampaign ? 'Update' : 'Create'} Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Campaign Card Component
const CampaignCard = ({ campaign, onEdit, onDelete, onViewAssignments, saving }) => {
  const [teamSize, setTeamSize] = useState(0);
  const [loadingTeamSize, setLoadingTeamSize] = useState(true);

  useEffect(() => {
    loadTeamSize();
  }, [campaign.id]);

  const loadTeamSize = async () => {
    try {
      const summary = await supabaseApi.getCampaignAssignmentSummary(campaign.id);
      setTeamSize(summary.total_team_members);
    } catch (error) {
      console.error('Error loading team size:', error);
      setTeamSize(0);
    } finally {
      setLoadingTeamSize(false);
    }
  };

  return (
    <div className="campaign-card">
      <div className="campaign-card-header">
        <div className="campaign-info">
          <h3>{campaign.name}</h3>
          <div className="campaign-meta">
            <span className="client-name">
              <Building size={14} />
              {campaign.client_name || 'No client specified'}
            </span>
            {campaign.billing_rate_per_hour && (
              <span className="billing-rate">
                <DollarSign size={14} />
                ${campaign.billing_rate_per_hour}/hr
              </span>
            )}
            <span className="team-size">
              <Users size={14} />
              {loadingTeamSize ? '...' : `${teamSize} member${teamSize !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
        
        <div className="campaign-status">
          <span className={`status-badge ${campaign.is_active ? 'active' : 'inactive'}`}>
            {campaign.is_active ? (
              <>
                <CheckCircle size={14} />
                Active
              </>
            ) : (
              <>
                <Pause size={14} />
                Inactive
              </>
            )}
          </span>
        </div>
      </div>

      {campaign.description && (
        <div className="campaign-description">
          <p>{campaign.description}</p>
        </div>
      )}

      <div className="campaign-actions">
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => onViewAssignments(campaign)}
          disabled={saving}
        >
          <UserPlus size={14} />
          Team ({teamSize})
        </button>

        <button
          className="btn btn-sm btn-secondary"
          onClick={() => onEdit(campaign)}
          disabled={saving}
        >
          <Edit size={14} />
          Edit
        </button>
        
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(campaign.id)}
          disabled={saving}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default CampaignManagement;

