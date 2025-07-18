// CampaignManagement.jsx - Direct Supabase Connection (No Mock Data)

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
  RefreshCw
} from 'lucide-react';

const CampaignManagement = ({ user, supabase }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Load campaigns from Supabase
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
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCampaigns(data || []);
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
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        throw error;
      }

      // Reload campaigns from database
      await loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Error deleting campaign: ' + (error.message || 'Please try again.'));
    }
  };

  const handleToggleActive = async (campaign) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { error } = await supabase
        .from('campaigns')
        .update({ 
          is_active: !campaign.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id);

      if (error) {
        throw error;
      }

      // Reload campaigns from database
      await loadCampaigns();
    } catch (error) {
      console.error('Error updating campaign status:', error);
      alert('Error updating campaign: ' + (error.message || 'Please try again.'));
    }
  };

  const handleSaveCampaign = async () => {
    try {
      setSaving(true);
      setFormErrors([]);

      // Basic validation
      const errors = [];
      if (!formData.name?.trim()) errors.push('Campaign name is required');
      if (!formData.billing_rate_per_hour || parseFloat(formData.billing_rate_per_hour) <= 0) {
        errors.push('Billing rate per hour is required and must be greater than 0');
      }

      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }

      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const campaignData = {
        name: formData.name.trim(),
        billing_rate_per_hour: parseFloat(formData.billing_rate_per_hour),
        client_name: formData.client_name?.trim() || null,
        description: formData.description?.trim() || null,
        is_billable: formData.is_billable,
        is_active: formData.is_active,
        crm_campaign_id: formData.crm_campaign_id?.trim() || null,
        crm_config: formData.crm_config || {},
        updated_at: new Date().toISOString()
      };

      if (showEditModal && selectedCampaign) {
        // Update existing campaign
        const { error } = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', selectedCampaign.id);

        if (error) {
          throw error;
        }

        setShowEditModal(false);
      } else {
        // Create new campaign
        const { error } = await supabase
          .from('campaigns')
          .insert([campaignData]);

        if (error) {
          throw error;
        }

        setShowCreateModal(false);
      }

      // Reload campaigns from database
      await loadCampaigns();

      // Reset form
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
    } catch (error) {
      console.error('Error saving campaign:', error);
      setFormErrors([error.message || 'Error saving campaign. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getBillableBadge = (isBillable) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isBillable 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {isBillable ? 'Billable' : 'Non-Billable'}
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
            className="btn btn-primary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
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
          <p className="text-gray-600">Manage campaigns and billing rates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadCampaigns}
            className="btn btn-outline flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCreateCampaign}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="all">All Campaigns</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
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
                    Billing Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CRM ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className={`hover:bg-gray-50 ${!campaign.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        {campaign.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {campaign.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.client_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${campaign.billing_rate_per_hour}/hr
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getBillableBadge(campaign.is_billable)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.crm_campaign_id || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(campaign.created_at).toLocaleDateString()}
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
                          onClick={() => handleToggleActive(campaign)}
                          className={`btn btn-ghost btn-sm ${
                            campaign.is_active 
                              ? 'text-yellow-600 hover:text-yellow-700' 
                              : 'text-green-600 hover:text-green-700'
                          }`}
                          title={campaign.is_active ? 'Deactivate Campaign' : 'Activate Campaign'}
                        >
                          {campaign.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by creating a new campaign.'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
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

      {/* ULTRA-COMPACT Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold text-gray-900">Create Campaign</h2>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3">
              {/* Error Display */}
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                  <div className="flex">
                    <AlertCircle className="h-3 w-3 text-red-400 mt-0.5" />
                    <div className="ml-2">
                      <h3 className="text-xs font-medium text-red-800">Please fix:</h3>
                      <ul className="text-xs text-red-700 list-disc list-inside">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ULTRA-COMPACT FORM - 2 COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* COLUMN 1 - Basic Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 border-b pb-1">Campaign Details</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Campaign Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter campaign name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Billing Rate per Hour *</label>
                    <input
                      type="number"
                      value={formData.billing_rate_per_hour}
                      onChange={(e) => setFormData({ ...formData, billing_rate_per_hour: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter client name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">CRM Campaign ID</label>
                    <input
                      type="text"
                      value={formData.crm_campaign_id}
                      onChange={(e) => setFormData({ ...formData, crm_campaign_id: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="External CRM ID"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="flex items-center text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.is_billable}
                          onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked })}
                          className="mr-2 h-3 w-3"
                        />
                        Billable
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="mr-2 h-3 w-3"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2 - Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 border-b pb-1">Description</h4>
                  
                  <div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows="8"
                      placeholder="Campaign description and notes..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-2 p-3 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCampaign}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-2 w-2 border-b border-white mr-1"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-2 h-2 mr-1" />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ULTRA-COMPACT Edit Campaign Modal */}
      {showEditModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold text-gray-900">Edit Campaign</h2>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3">
              {/* Error Display */}
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                  <div className="flex">
                    <AlertCircle className="h-3 w-3 text-red-400 mt-0.5" />
                    <div className="ml-2">
                      <h3 className="text-xs font-medium text-red-800">Please fix:</h3>
                      <ul className="text-xs text-red-700 list-disc list-inside">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ULTRA-COMPACT FORM - 2 COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* COLUMN 1 - Basic Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 border-b pb-1">Campaign Details</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Campaign Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter campaign name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Billing Rate per Hour *</label>
                    <input
                      type="number"
                      value={formData.billing_rate_per_hour}
                      onChange={(e) => setFormData({ ...formData, billing_rate_per_hour: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter client name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">CRM Campaign ID</label>
                    <input
                      type="text"
                      value={formData.crm_campaign_id}
                      onChange={(e) => setFormData({ ...formData, crm_campaign_id: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="External CRM ID"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="flex items-center text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.is_billable}
                          onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked })}
                          className="mr-2 h-3 w-3"
                        />
                        Billable
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="mr-2 h-3 w-3"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2 - Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 border-b pb-1">Description</h4>
                  
                  <div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows="8"
                      placeholder="Campaign description and notes..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-2 p-3 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCampaign}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-2 w-2 border-b border-white mr-1"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-2 h-2 mr-1" />
                    Update
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

export default CampaignManagement;

