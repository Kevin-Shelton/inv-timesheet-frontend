import React, { useState, useEffect } from 'react';
import { Grid3X3, Search } from 'lucide-react';

const WhoIsInOutPanel = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  // Mock data for demonstration - replace with real data
  const mockMembers = [
    { id: 1, name: 'John Doe', status: 'In', campaign: 'Campaign A', lastUpdate: '2:30 PM' },
    { id: 2, name: 'Jane Smith', status: 'Break', campaign: 'Campaign B', lastUpdate: '2:15 PM' },
    { id: 3, name: 'Mike Johnson', status: 'Out', campaign: 'Campaign A', lastUpdate: '1:45 PM' },
  ];

  const tabs = [
    { id: 'All', label: 'All', count: mockMembers.length },
    { id: 'In', label: 'In', count: mockMembers.filter(m => m.status === 'In').length },
    { id: 'Break', label: 'Break', count: mockMembers.filter(m => m.status === 'Break').length },
    { id: 'Out', label: 'Out', count: mockMembers.filter(m => m.status === 'Out').length },
  ];

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || member.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="whoisinout-panel-container">
      {/* Current Time Section */}
      <div className="current-time-section">
        <div className="section-header-row">
          <Grid3X3 className="section-grid-icon" size={16} />
          <span className="section-title-text">CURRENT TIME</span>
        </div>
        <div className="current-time-display">
          <div className="time-text">{formatTime(currentTime)}</div>
          <div className="date-text">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Member List Section */}
      <div className="member-list-section">
        <div className="section-header-row">
          <Grid3X3 className="section-grid-icon" size={16} />
          <span className="section-title-text">MEMBER LIST</span>
        </div>
        
        <div className="whoisinout-content">
          <h3 className="whoisinout-main-title">Who's In/Out</h3>
          <p className="whoisinout-subtitle">Search members...</p>
          
          {/* Status Tabs */}
          <div className="status-tabs-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`status-tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.id.toLowerCase()}-tab`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-label-text">{tab.label}</span>
                <span className="tab-count-text">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="search-input-container">
            <Search className="search-input-icon" size={16} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-field"
            />
          </div>

          {/* Members List or Empty State */}
          <div className="members-display-area">
            {filteredMembers.length === 0 ? (
              <div className="no-members-message">
                <p>No members found.</p>
              </div>
            ) : (
              <div className="members-list-container">
                {filteredMembers.map((member) => (
                  <div key={member.id} className={`member-list-item status-${member.status.toLowerCase()}`}>
                    <div className="member-info-section">
                      <div className="member-name-text">{member.name}</div>
                      <div className="member-campaign-text">{member.campaign}</div>
                      <div className="member-time-text">Last: {member.lastUpdate}</div>
                    </div>
                    <div className="member-status-section">
                      <div className={`status-indicator ${member.status.toLowerCase()}`}>
                        {member.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhoIsInOutPanel;

