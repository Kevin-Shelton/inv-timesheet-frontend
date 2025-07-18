import React, { useState, useEffect } from 'react';
import { Search, Grid3X3, Clock, Users, UserCheck, Coffee, UserX } from 'lucide-react';
import { supabase } from '@/supabaseClient';

const WhoIsInOutPanel = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch members data
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_status')
          .select(`
            *,
            users (
              id,
              first_name,
              last_name,
              email
            ),
            campaigns (
              name
            )
          `)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setMembers(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in':
        return <UserCheck className="status-icon in" size={16} />;
      case 'break':
        return <Coffee className="status-icon break" size={16} />;
      case 'out':
        return <UserX className="status-icon out" size={16} />;
      default:
        return <Users className="status-icon" size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in':
        return 'IN';
      case 'break':
        return 'BREAK';
      case 'out':
        return 'OUT';
      default:
        return 'UNKNOWN';
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === '' || 
      (member.users?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       member.users?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       member.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || member.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getTabCounts = () => {
    const counts = members.reduce((acc, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      in: counts.in || 0,
      break: counts.break || 0,
      out: counts.out || 0,
      all: members.length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="whoisinout-panel">
      {/* Current Time Section */}
      <div className="panel-section">
        <div className="section-header">
          <Grid3X3 className="section-icon" size={16} />
          <h3 className="section-title">Current Time</h3>
        </div>
        <div className="current-time-display">
          <div className="time-large">{formatTime(currentTime)}</div>
          <div className="date-small">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Member List Section */}
      <div className="panel-section">
        <div className="section-header">
          <Grid3X3 className="section-icon" size={16} />
          <h3 className="section-title">Member List</h3>
        </div>
        
        {/* Who's In/Out Header */}
        <div className="whoisinout-header">
          <h4 className="whoisinout-title">Who's In/Out</h4>
          <p className="whoisinout-subtitle">Search members...</p>
        </div>

        {/* Status Tabs */}
        <div className="status-tabs">
          <button
            className={`status-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span className="tab-label">All</span>
            <span className="tab-count">({tabCounts.all})</span>
          </button>
          <button
            className={`status-tab in-tab ${activeTab === 'in' ? 'active' : ''}`}
            onClick={() => setActiveTab('in')}
          >
            <span className="tab-label">In</span>
            <span className="tab-count">({tabCounts.in})</span>
          </button>
          <button
            className={`status-tab break-tab ${activeTab === 'break' ? 'active' : ''}`}
            onClick={() => setActiveTab('break')}
          >
            <span className="tab-label">Break</span>
            <span className="tab-count">({tabCounts.break})</span>
          </button>
          <button
            className={`status-tab out-tab ${activeTab === 'out' ? 'active' : ''}`}
            onClick={() => setActiveTab('out')}
          >
            <span className="tab-label">Out</span>
            <span className="tab-count">({tabCounts.out})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="search-container">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Members List */}
        <div className="members-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading members...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Error loading members: {error}</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" size={32} />
              <p>No members found.</p>
              {searchTerm && <p className="empty-subtext">Try adjusting your search.</p>}
            </div>
          ) : (
            <div className="member-items">
              {filteredMembers.map((member) => (
                <div key={member.id} className={`member-item status-${member.status}`}>
                  <div className="member-info">
                    <div className="member-name">
                      {member.users?.first_name} {member.users?.last_name}
                    </div>
                    <div className="member-details">
                      <div className="campaign-name">
                        {member.campaigns?.name || 'No Campaign'}
                      </div>
                      <div className="status-time">
                        Last updated: {new Date(member.updated_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="member-status">
                    {getStatusIcon(member.status)}
                    <span className={`status-text ${member.status}`}>
                      {getStatusText(member.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhoIsInOutPanel;

