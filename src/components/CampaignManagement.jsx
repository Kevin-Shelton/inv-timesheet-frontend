// CampaignManagement.jsx - Campaign Management with COMPACT MODAL LAYOUT

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
  Briefcase
} from 'lucide-react';

const CampaignManagement = ({ user, api }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Form state for campaign creation/editing
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'client',
    status: 'planning',
    priority: 'medium',
    client_name: '',
    start_date: '',
    end_date: '',
    budget: '',
    hourly_rate: '',
    description: '',
    campaign_lead: '',
    team_members: [],
    is_billable: true
  });
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Filter campaigns when search or filters change
  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter, typeFilter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Only use real API calls - no mock data
      if (!api || !api.getCampaigns) {
        throw new Error('API not available. Please ensure your backend is connected.');
      }

      const campaignData = await api.getCampaigns();
      setCampaigns(campaignData || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setError(error.message || 'Failed to load campaigns from database');
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
        campaign.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      name: '',
      code: '',
      type: 'client',
      status: 'planning',
      priority: 'medium',
      client_name: '',
      start_date: '',
      end_date: '',
      budget: '',
      hourly_rate: '',
      description: '',
      campaign_lead: '',
      team_members: [],
      is_billable: true
    });
    setFormErrors([]);
    setShowCreateModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      code: campaign.code || '',
      type: campaign.type || 'client',
      status: campaign.status || 'planning',
      priority: campaign.priority || 'medium',
      client_name: campaign.client_name || '',
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
      budget: campaign.budget?.toString() || '',
      hourly_rate: campaign.hourly_rate?.toString() || '',
      description: campaign.description || '',
      campaign_lead: campaign.campaign_lead || '',
      team_members: campaign.team_members || [],
      is_billable: campaign.is_billable !== false
    });
    setFormErrors([]);
    setShowEditModal(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      if (!api || !api.deleteCampaign) {
        throw new Error('API not available');
      }

      await api.deleteCampaign(campaignId);
      
      // Reload campaigns from database
      await loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Error deleting campaign: ' + (error.message || 'Please try again.'));
    }
  };

  const handleSaveCampaign = async () => {
    try {
      setSaving(true);
      setFormErrors([]);

      // Basic validation
      const errors = [];
      if (!formData.name?.trim()) errors.push('Campaign name is required');
      if (!formData.client_name?.trim()) errors.push('Client name is required');
      if (!formData.start_date) errors.push('Start date is required');
      if (!formData.end_date) errors.push('End date is required');

      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }

      if (!api) {
        throw new Error('API not available');
      }

      const campaignData = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        code: formData.code || `CMP-${Date.now()}`
      };

      if (showEditModal && selectedCampaign) {
        // Update existing campaign
        if (!api.updateCampaign) {
          throw new Error('Update campaign API not available');
        }
        
        await api.updateCampaign(selectedCampaign.id, campaignData);
        setShowEditModal(false);
      } else {
        // Create new campaign
        if (!api.createCampaign) {
          throw new Error('Create campaign API not available');
        }
        
        await api.createCampaign(campaignData);
        setShowCreateModal(false);
      }

      // Reload campaigns from database
      await loadCampaigns();

      // Reset form
      setFormData({
        name: '',
        code: '',
        type: 'client',
        status: 'planning',
        priority: 'medium',
        client_name: '',
        start_date: '',
        end_date: '',
        budget: '',
        hourly_rate: '',
        description: '',
        campaign_lead: '',
        team_members: [],
        is_billable: true
      });
    } catch (error) {
      console.error('Error saving campaign:', error);
      setFormErrors([error.message || 'Error saving campaign. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', class: 'bg-green-100 text-green-800' },
      planning: { label: 'Planning', class: 'bg-blue-100 text-blue-800' },
      paused: { label: 'Paused', class: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completed', class: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.planning;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { label: 'High', class: 'bg-red-100 text-red-800' },
      medium: { label: 'Medium', class: 'bg-yellow-100 text-yellow-800' },
      low: { label: 'Low', class: 'bg-green-100 text-green-800' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      client: { label: 'Client', class: 'bg-blue-100 text-blue-800' },
      internal: { label: 'Internal', class: 'bg-purple-100 text-purple-800' }
    };

    const config = typeConfig[type] || typeConfig.client;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading campaigns from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Database Connection Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadCampaigns}
            className="btn btn-primary"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Manage campaigns, projects, and team assignments</p>
        </div>
        <button
          onClick={handleCreateCampaign}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Types</option>
              <option value="client">Client</option>
              <option value="internal">Internal</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {campaign.code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(campaign.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(campaign.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${campaign.budget?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${campaign.hourly_rate || '0'}/hr
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCampaign(campaign)}
                          className="btn btn-ghost btn-sm"
                          title="Edit Campaign"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by creating a new campaign.'}
                </p>
                {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                  <div className="mt-6">
                    <button
                      onClick={handleCreateCampaign}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Campaign Modal - COMPACT LAYOUT */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Create New Campaign</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                    <div className="ml-2">
                      <h3 className="text-sm font-medium text-red-800">
                        Please fix the following errors:
                      </h3>
                      <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPACT TWO-COLUMN LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN - Basic Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div className="form-group">
                    <label className="form-label text-sm">Campaign Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input text-sm"
                      placeholder="Enter campaign name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Campaign Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="form-input text-sm"
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Client Name *</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="form-input text-sm"
                      placeholder="Enter client name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Campaign Lead</label>
                    <input
                      type="text"
                      value={formData.campaign_lead}
                      onChange={(e) => setFormData({ ...formData, campaign_lead: e.target.value })}
                      className="form-input text-sm"
                      placeholder="Enter campaign lead name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label text-sm">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="form-select text-sm"
                      >
                        <option value="client">Client</option>
                        <option value="internal">Internal</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-sm">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="form-select text-sm"
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-select text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* RIGHT COLUMN - Financial & Timeline */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Financial & Timeline</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label text-sm">Budget</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="form-input text-sm"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-sm">Hourly Rate</label>
                      <input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                        className="form-input text-sm"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label text-sm">Start Date *</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="form-input text-sm"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-sm">End Date *</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="form-input text-sm"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_billable}
                        onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked })}
                        className="mr-2"
                      />
                      Billable Campaign
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-input text-sm"
                      rows="4"
                      placeholder="Enter campaign description"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-outline btn-sm"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCampaign}
                className="btn btn-primary btn-sm"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-2" />
                    Create Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal - COMPACT LAYOUT */}
      {showEditModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Edit Campaign</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                    <div className="ml-2">
                      <h3 className="text-sm font-medium text-red-800">
                        Please fix the following errors:
                      </h3>
                      <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPACT TWO-COLUMN LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN - Basic Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div className="form-group">
                    <label className="form-label text-sm">Campaign Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input text-sm"
                      placeholder="Enter campaign name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Campaign Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="form-input text-sm"
                      placeholder="Campaign code"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Client Name *</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="form-input text-sm"
                      placeholder="Enter client name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Campaign Lead</label>
                    <input
                      type="text"
                      value={formData.campaign_lead}
                      onChange={(e) => setFormData({ ...formData, campaign_lead: e.target.value })}
                      className="form-input text-sm"
                      placeholder="Enter campaign lead name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label text-sm">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="form-select text-sm"
                      >
                        <option value="client">Client</option>
                        <option value="internal">Internal</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-sm">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="form-select text-sm"
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-select text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* RIGHT COLUMN - Financial & Timeline */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Financial & Timeline</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label text-sm">Budget</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="form-input text-sm"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-sm">Hourly Rate</label>
                      <input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                        className="form-input text-sm"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label text-sm">Start Date *</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="form-input text-sm"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-sm">End Date *</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="form-input text-sm"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_billable}
                        onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked })}
                        className="mr-2"
                      />
                      Billable Campaign
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-input text-sm"
                      rows="4"
                      placeholder="Enter campaign description"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-outline btn-sm"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCampaign}
                className="btn btn-primary btn-sm"
                disable

