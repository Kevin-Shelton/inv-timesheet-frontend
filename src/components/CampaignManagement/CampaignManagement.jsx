// Enhanced CampaignManagement.jsx with Team Assignment Functionality
import React, { useState, useEffect } from 'react';
import './campaign-management.css';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  Building,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { supabaseApi } from '../../supabaseClient.js';
import CampaignAssignments from './CampaignAssignments';

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Form state for campaign modal
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_name: '',
    billing_rate: '',
    is_active: true
  });

  // Load campaigns on component mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignData = await supabaseApi.getCampaigns();
      
      // Get team sizes for each campaign
      const campaignsWithTeamSizes = await Promise.all(
        campaignData.map(async (campaign) => {
          try {
            const summary = await supabaseApi.getCampaignAssignmentSummary(campaign.id);
            return {
              ...campaign,
              team_size: summary.total_team_members || 0
            };
          } catch (error) {
            return {
              ...campaign,
              team_size: 0
            };
          }
        })
      );
      
      setCampaigns(campaignsWithTeamSizes);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
      // Set fallback data
      setCampaigns([
        { 
          id: '1', 
          name: 'Sample Campaign', 
          description: 'Sample campaign for demo', 
          client_name: 'Sample Client',
          billing_rate: 75.00,
          is_active: true,
          team_size: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter campaigns based on search and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && campaign.is_active) ||
                         (statusFilter === 'inactive' && !campaign.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateCampaign = () => {
    setModalMode('create');
    setFormData({
      name: '',
      description: '',
      client_name: '',
      billing_rate: '',
      is_active: true
    });
    setEditingCampaign(null);
    setShowModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setModalMode('edit');
    setFormData({
      name: campaign.name || '',
      description: campaign.description || '',
      client_name: campaign.client_name || '',
      billing_rate: campaign.billing_rate || '',
      is_active: campaign.is_active !== false
    });
    setEditingCampaign(campaign);
    setShowModal(true);
  };

  const handleSaveCampaign = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Campaign name is required');
        return;
      }

      // Here you would typically call an API to save the campaign
      // For now, we'll just update the local state
      if (modalMode === 'create') {
        const newCampaign = {
          id: Date.now().toString(),
          ...formData,
          team_size: 0
        };
        setCampaigns(prev => [...prev, newCampaign]);
      } else {
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === editingCampaign.id 
            ? { ...campaign, ...formData }
            : campaign
        ));
      }

      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        client_name: '',
        billing_rate: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign. Please try again.');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      // Here you would typically call an API to delete the campaign
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  const handleManageTeam = (campaign) => {
    setSelectedCampaign(campaign);
    setActiveTab('assignments');
  };

  const handleBackToCampaigns = () => {
    setActiveTab('campaigns');
    setSelectedCampaign(null);
  };

  // Render campaign assignments view
  if (activeTab === 'assignments' && selectedCampaign) {
    return (
      <CampaignAssignments 
        campaign={selectedCampaign}
        onBack={handleBackToCampaigns}
      />
    );
  }

  return (
    <div className="campaign-management">
      {/* Header */}
      <div className="campaign-header">
        <div className="campaign-title">
          <h2>Campaign Management</h2>
          <p className="campaign-count">
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="campaign-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateCampaign}
          >
            <Plus size={16} />
            New Campaign
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="campaign-tabs">
        <button 
          className={`tab ${activeTab === 'campaigns' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          <Building size={16} />
          All Campaigns
          <span className="tab-subtitle">({campaigns.length})</span>
        </button>
        <button 
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
          disabled={!selectedCampaign}
        >
          <Users size={16} />
          Team Assignments
          {selectedCampaign && (
            <span className="tab-subtitle">({selectedCampaign.name})</span>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="campaign-loading">
          <div className="spin">⏳</div>
          <span>Loading campaigns...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="campaign-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      {!loading && !error && (
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}

      {/* Campaign List */}
      {!loading && !error && (
        <div className="campaign-list">
          {filteredCampaigns.length === 0 ? (
            <div className="campaign-empty">
              <Building size={48} />
              <h3>No campaigns found</h3>
              <p>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first campaign'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
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
            filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-card-header">
                  <div className="campaign-info">
                    <h3>{campaign.name}</h3>
                    <div className="campaign-meta">
                      {campaign.client_name && (
                        <span className="client-name">
                          <Building size={14} />
                          {campaign.client_name}
                        </span>
                      )}
                      {campaign.billing_rate && (
                        <span className="billing-rate">
                          <DollarSign size={14} />
                          ${campaign.billing_rate}/hr
                        </span>
                      )}
                      <span className="team-size">
                        <Users size={14} />
                        {campaign.team_size} team member{campaign.team_size !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="campaign-actions">
                    <span className={`status-badge ${campaign.is_active ? 'active' : 'inactive'}`}>
                      {campaign.is_active ? (
                        <>
                          <Check size={12} />
                          Active
                        </>
                      ) : (
                        <>
                          <X size={12} />
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
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleManageTeam(campaign)}
                  >
                    <Users size={14} />
                    Team ({campaign.team_size})
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditCampaign(campaign)}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Campaign Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'Create New Campaign' : 'Edit Campaign'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Campaign Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Client Name</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter campaign description"
                  rows={3}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Billing Rate ($/hour)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.billing_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_rate: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Active Campaign
                </label>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveCampaign}
              >
                {modalMode === 'create' ? 'Create Campaign' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;

