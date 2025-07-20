// Fixed WhoIsInOutPanel Component - Uses supabaseApi instead of direct supabase
// Replace your existing src/components/Dashboard/WhoIsInOutPanel.jsx with this file

import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';

const WhoIsInOutPanel = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👥 WhoIsInOutPanel: Fetching members and campaigns data');
      
      // Fetch members and campaigns in parallel using corrected supabaseApi
      const [membersData, campaignsData] = await Promise.all([
        supabaseApi.getMembers(),
        supabaseApi.getCampaigns({ is_active: true })
      ]);
      
      console.log('👥 WhoIsInOutPanel: Received members:', membersData?.length || 0);
      console.log('👥 WhoIsInOutPanel: Received campaigns:', campaignsData?.length || 0);
      
      setMembers(membersData || []);
      setCampaigns(campaignsData || []);
      
    } catch (error) {
      console.error('👥 WhoIsInOutPanel: Error fetching data:', error);
      setError(error.message || 'Failed to load team data');
      
      // Set fallback data
      setMembers([
        { id: '1', full_name: 'John Doe', status: 'in', last_activity: new Date().toISOString(), department: 'Development' },
        { id: '2', full_name: 'Jane Smith', status: 'out', last_activity: new Date().toISOString(), department: 'Design' },
        { id: '3', full_name: 'Mike Johnson', status: 'in', last_activity: new Date().toISOString(), department: 'Development' },
        { id: '4', full_name: 'Sarah Wilson', status: 'in', last_activity: new Date().toISOString(), department: 'Marketing' },
        { id: '5', full_name: 'Tom Brown', status: 'out', last_activity: new Date().toISOString(), department: 'Development' }
      ]);
      setCampaigns([
        { id: '1', name: 'Sample Campaign', is_active: true },
        { id: '2', name: 'Development Project', is_active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    if (selectedCampaign === 'all') return true;
    // For demo purposes, randomly assign members to campaigns
    return member.id % 2 === parseInt(selectedCampaign) % 2;
  });

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  const startIndex = (currentPage - 1) * membersPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + membersPerPage);

  const getStatusIcon = (status) => {
    return status === 'in' ? '🟢' : '🔴';
  };

  const getStatusText = (status) => {
    return status === 'in' ? 'In' : 'Out';
  };

  const formatLastActivity = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="who-is-in-out-panel">
        <div className="panel-header">
          <h3>Who's In/Out</h3>
        </div>
        <div className="panel-loading">
          <div className="loading-spinner"></div>
          <p>Loading team status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="who-is-in-out-panel">
      <div className="panel-header">
        <h3>Who's In/Out</h3>
        <div className="current-time">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        {error && (
          <div className="panel-error">
            <small>Using sample data</small>
          </div>
        )}
      </div>
      
      <div className="campaign-filter">
        <select 
          value={selectedCampaign} 
          onChange={(e) => {
            setSelectedCampaign(e.target.value);
            setCurrentPage(1);
          }}
          className="campaign-dropdown"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map(campaign => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="members-list">
        {paginatedMembers.length === 0 ? (
          <div className="no-members">
            <p>No team members found</p>
          </div>
        ) : (
          paginatedMembers.map(member => (
            <div key={member.id} className={`member-item ${member.status}`}>
              <div className="member-info">
                <div className="member-name">
                  <span className="status-icon">{getStatusIcon(member.status)}</span>
                  {member.full_name}
                </div>
                <div className="member-details">
                  <span className="member-department">{member.department || member.role || 'Team Member'}</span>
                  <span className="member-status">{getStatusText(member.status)}</span>
                </div>
              </div>
              <div className="member-activity">
                <span className="last-activity">
                  {formatLastActivity(member.last_activity)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ‹ Prev
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next ›
          </button>
        </div>
      )}
      
      <div className="panel-summary">
        <div className="summary-item">
          <span className="summary-label">Total:</span>
          <span className="summary-value">{filteredMembers.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">In:</span>
          <span className="summary-value in">
            {filteredMembers.filter(m => m.status === 'in').length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Out:</span>
          <span className="summary-value out">
            {filteredMembers.filter(m => m.status === 'out').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WhoIsInOutPanel;

