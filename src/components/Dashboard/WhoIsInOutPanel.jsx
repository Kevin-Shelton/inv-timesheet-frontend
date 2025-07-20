import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';

const WhoIsInOutPanel = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(5); // Show 5 members per page
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    in: 0,
    break: 0,
    out: 0
  });

  useEffect(() => {
    fetchCampaigns();
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, selectedCampaign, searchTerm]);

  useEffect(() => {
    updateStatusCounts();
  }, [filteredMembers]);

  const fetchCampaigns = async () => {
    try {
      // FIXED: Use supabaseApi instead of direct supabase query with correct column names
      const data = await supabaseApi.getCampaigns({ is_active: true });
      
      if (data && data.length > 0) {
        setCampaigns(data);
      } else {
        // Use fallback campaigns
        setCampaigns([
          { id: 1, name: 'Campaign A', is_active: true },
          { id: 2, name: 'Campaign B', is_active: true },
          { id: 3, name: 'Campaign C', is_active: true }
        ]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([
        { id: 1, name: 'Campaign A', is_active: true },
        { id: 2, name: 'Campaign B', is_active: true },
        { id: 3, name: 'Campaign C', is_active: true }
      ]);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // FIXED: Use supabaseApi instead of direct supabase query with complex joins
      const memberData = await supabaseApi.getMembers();
      
      if (memberData && memberData.length > 0) {
        // Transform the data to match the expected format
        const transformedMembers = memberData.map(member => ({
          id: member.id,
          full_name: member.full_name,
          email: member.email,
          status: member.status || (Math.random() > 0.5 ? 'in' : Math.random() > 0.5 ? 'break' : 'out'),
          last_activity: member.last_activity || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          campaign_id: Math.floor(Math.random() * 3) + 1, // Random campaign assignment for demo
          campaigns: { 
            id: Math.floor(Math.random() * 3) + 1, 
            name: `Campaign ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}` 
          }
        }));
        setMembers(transformedMembers);
      } else {
        setMembers(getMockMembers());
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers(getMockMembers());
    } finally {
      setLoading(false);
    }
  };

  const getMockMembers = () => {
    return [
      {
        id: 1,
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        status: 'in',
        last_activity: '2:30 PM',
        campaign_id: 1,
        campaigns: { id: 1, name: 'Campaign A' }
      },
      {
        id: 2,
        full_name: 'Jane Smith',
        email: 'jane.smith@company.com',
        status: 'break',
        last_activity: '2:15 PM',
        campaign_id: 2,
        campaigns: { id: 2, name: 'Campaign B' }
      },
      {
        id: 3,
        full_name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        status: 'out',
        last_activity: '1:45 PM',
        campaign_id: 1,
        campaigns: { id: 1, name: 'Campaign A' }
      },
      {
        id: 4,
        full_name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        status: 'in',
        last_activity: '2:45 PM',
        campaign_id: 3,
        campaigns: { id: 3, name: 'Campaign C' }
      },
      {
        id: 5,
        full_name: 'David Brown',
        email: 'david.brown@company.com',
        status: 'in',
        last_activity: '2:20 PM',
        campaign_id: 2,
        campaigns: { id: 2, name: 'Campaign B' }
      },
      {
        id: 6,
        full_name: 'Lisa Davis',
        email: 'lisa.davis@company.com',
        status: 'break',
        last_activity: '1:30 PM',
        campaign_id: 1,
        campaigns: { id: 1, name: 'Campaign A' }
      },
      {
        id: 7,
        full_name: 'Tom Anderson',
        email: 'tom.anderson@company.com',
        status: 'out',
        last_activity: '12:15 PM',
        campaign_id: 3,
        campaigns: { id: 3, name: 'Campaign C' }
      },
      {
        id: 8,
        full_name: 'Emily Taylor',
        email: 'emily.taylor@company.com',
        status: 'in',
        last_activity: '2:50 PM',
        campaign_id: 2,
        campaigns: { id: 2, name: 'Campaign B' }
      }
    ];
  };

  const filterMembers = () => {
    let filtered = members;

    // Filter by campaign
    if (selectedCampaign !== 'all') {
      filtered = filtered.filter(member => 
        member.campaign_id === parseInt(selectedCampaign) ||
        member.campaigns?.id === parseInt(selectedCampaign)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const updateStatusCounts = () => {
    const counts = {
      all: filteredMembers.length,
      in: filteredMembers.filter(m => m.status === 'in').length,
      break: filteredMembers.filter(m => m.status === 'break').length,
      out: filteredMembers.filter(m => m.status === 'out').length
    };
    setStatusCounts(counts);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in': return '#10B981'; // Green
      case 'break': return '#F59E0B'; // Orange
      case 'out': return '#6B7280'; // Gray
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in': return '🟢';
      case 'break': return '🟡';
      case 'out': return '⚪';
      default: return '⚪';
    }
  };

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCampaignChange = (e) => {
    setSelectedCampaign(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="who-is-in-out-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-title">
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <h3>WHO'S IN/OUT</h3>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        <div className="status-tab">
          <span className="status-count">{statusCounts.all}</span>
          <span className="status-label">ALL</span>
        </div>
        <div className="status-tab">
          <span className="status-count" style={{ color: '#10B981' }}>{statusCounts.in}</span>
          <span className="status-label">IN</span>
        </div>
        <div className="status-tab">
          <span className="status-count" style={{ color: '#F59E0B' }}>{statusCounts.break}</span>
          <span className="status-label">BREAK</span>
        </div>
        <div className="status-tab">
          <span className="status-count" style={{ color: '#6B7280' }}>{statusCounts.out}</span>
          <span className="status-label">OUT</span>
        </div>
      </div>

      {/* Campaign Dropdown */}
      <div className="campaign-selector">
        <select 
          value={selectedCampaign} 
          onChange={handleCampaignChange}
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

      {/* Search */}
      <div className="search-container">
        <svg viewBox="0 0 20 20" fill="currentColor" className="search-icon">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Members List */}
      <div className="members-list">
        {loading ? (
          <div className="loading-state">Loading members...</div>
        ) : currentMembers.length === 0 ? (
          <div className="no-members">
            {searchTerm || selectedCampaign !== 'all' ? 
              'No members found matching your criteria' : 
              'No members found'
            }
          </div>
        ) : (
          currentMembers.map(member => (
            <div key={member.id} className="member-item">
              <div className="member-status">
                <span 
                  className="status-indicator"
                  style={{ color: getStatusColor(member.status) }}
                >
                  {getStatusIcon(member.status)}
                </span>
              </div>
              <div className="member-info">
                <div className="member-name">{member.full_name}</div>
                <div className="member-details">
                  <span className="member-campaign">
                    {member.campaigns?.name || `Campaign ${member.campaign_id}`}
                  </span>
                  <span className="member-time">Last: {member.last_activity}</span>
                </div>
              </div>
              <div className="member-status-badge">
                <span 
                  className={`status-badge ${member.status}`}
                  style={{ backgroundColor: getStatusColor(member.status) }}
                >
                  {member.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="panel-footer">
        <div className="member-count">
          Showing {indexOfFirstMember + 1}-{Math.min(indexOfLastMember, filteredMembers.length)} of {filteredMembers.length} members
        </div>
      </div>
    </div>
  );
};

export default WhoIsInOutPanel;

