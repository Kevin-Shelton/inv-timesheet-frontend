import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabaseApi as api } from '../../utils/supabase'
import { CampaignTable } from './CampaignTable'
import { CampaignModal } from './CampaignModal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Search, Filter } from 'lucide-react'

export function CampaignManagement() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const campaignData = await api.getCampaigns()
      setCampaigns(campaignData)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async (campaignData) => {
    try {
      await api.createCampaign(campaignData)
      await loadCampaigns()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw error
    }
  }

  const handleUpdateCampaign = async (campaignData) => {
    try {
      await api.updateCampaign(editingCampaign.id, campaignData)
      await loadCampaigns()
      setShowEditModal(false)
      setEditingCampaign(null)
    } catch (error) {
      console.error('Error updating campaign:', error)
      throw error
    }
  }

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign)
    setShowEditModal(true)
  }

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        await api.deleteCampaign(campaignId)
        await loadCampaigns()
      } catch (error) {
        console.error('Error deleting campaign:', error)
        alert('Error deleting campaign. Please try again.')
      }
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && campaign.is_active) ||
                         (filterStatus === 'inactive' && !campaign.is_active)
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="campaigns-loading">
        <div className="loading-spinner"></div>
        <p>Loading campaigns...</p>
      </div>
    )
  }

  return (
    <div className="campaigns-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Campaign Management</h1>
          <p className="page-subtitle">Manage your campaigns and track performance</p>
        </div>
        <div className="header-right">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="add-campaign-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="campaigns-controls">
        <div className="controls-left">
          <div className="search-container">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="controls-right">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="campaigns-stats">
        <div className="stat-card">
          <div className="stat-number">{campaigns.length}</div>
          <div className="stat-label">Total Campaigns</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{campaigns.filter(c => c.is_active).length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{campaigns.filter(c => !c.is_active).length}</div>
          <div className="stat-label">Inactive</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {campaigns.reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / campaigns.length || 0}
          </div>
          <div className="stat-label">Avg Rate</div>
        </div>
      </div>

      {/* Campaign Table */}
      <CampaignTable
        campaigns={filteredCampaigns}
        onEdit={handleEditCampaign}
        onDelete={handleDeleteCampaign}
      />

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CampaignModal
          mode="create"
          onSubmit={handleCreateCampaign}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && editingCampaign && (
        <CampaignModal
          mode="edit"
          campaign={editingCampaign}
          onSubmit={handleUpdateCampaign}
          onClose={() => {
            setShowEditModal(false)
            setEditingCampaign(null)
          }}
        />
      )}
    </div>
  )
}

