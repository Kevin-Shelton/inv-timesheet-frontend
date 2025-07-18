import React, { useState, useEffect } from 'react';
import { Search, Clock, Users } from 'lucide-react';

const WhoIsInOutPanel = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState('All Campaigns');
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);

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
      hour12: true
    });
  };

  const formatDate = (date) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Mock data for demonstration - replace with real data
  const mockMembers = [
    { id: 1, name: 'John Doe', status: 'In', campaign: 'Campaign A', lastUpdate: '2:30 PM' },
    { id: 2, name: 'Jane Smith', status: 'Break', campaign: 'Campaign B', lastUpdate: '2:15 PM' },
    { id: 3, name: 'Mike Johnson', status: 'Out', campaign: 'Campaign A', lastUpdate: '1:45 PM' },
  ];

  const campaigns = ['All Campaigns', 'Campaign A', 'Campaign B', 'Campaign C'];

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
    const matchesCampaign = selectedCampaign === 'All Campaigns' || 
      member.campaign === selectedCampaign;
    return matchesSearch && matchesTab && matchesCampaign;
  });

  return (
    <div className="who-is-in-out-panel">
      {/* Header Section */}
      <div className="section-header">
        <h3 className="section-title">
          <Users className="section-icon" />
          Who's in/out
        </h3>
        
        {/* Status Tabs */}
        <div className="status-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`status-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-count">{tab.count}</span>
              <span className="tab-label">{tab.label.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* Campaign Dropdown */}
        <div className="campaign-dropdown">
          <button
            className={`campaign-button ${campaignDropdownOpen ? 'active' : ''}`}
            onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
          >
            <span className="campaign-text">{selectedCampaign}</span>
            <span className={`campaign-chevron ${campaignDropdownOpen ? 'rotated' : ''}`}>
              ▼
            </span>
          </button>
          
          {campaignDropdownOpen && (
            <div className="campaign-menu">
              {campaigns.map(campaign => (
                <button
                  key={campaign}
                  className={`campaign-menu-item ${selectedCampaign === campaign ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setCampaignDropdownOpen(false);
                  }}
                >
                  {campaign}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Member List */}
      <div className="member-list">
        {filteredMembers.length === 0 ? (
          <div className="member-empty">
            <Users className="member-empty-icon" />
            <div>No members found</div>
          </div>
        ) : (
          filteredMembers.map(member => (
            <div key={member.id} className="member-item">
              <div className={`status-indicator ${member.status.toLowerCase()}`}></div>
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-details">
                  <span className="member-campaign">{member.campaign}</span>
                  <span className="member-time">Last: {member.lastUpdate}</span>
                </div>
              </div>
              <div className="member-status">
                <span className={`status-text ${member.status.toLowerCase()}`}>
                  {member.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Current Time Section */}
      <div className="current-time-section">
        <div className="current-time-wrapper">
          <Clock className="time-icon" />
          <div className="time-display">
            <div className="current-time-time">{formatTime(currentTime)}</div>
            <div className="current-time-date">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhoIsInOutPanel;

