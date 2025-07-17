import React, { useEffect, useState } from "react";
import { Search, Filter, Users, Clock, Coffee, LogOut } from "lucide-react";
import "./DashboardNamespaced.css";
import { supabase } from "../../supabaseClient.js";

export default function WhoIsInOutPanel() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStatuses, setUserStatuses] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch campaigns for filtering
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.warn('Campaigns table not found or empty:', error);
          setCampaigns([]);
        } else {
          setCampaigns(data || []);
        }
      } catch (err) {
        console.warn('Error fetching campaigns:', err);
        setCampaigns([]);
      }
    };

    fetchCampaigns();
  }, []);

  // Fetch real-time user status data
  useEffect(() => {
    const fetchUserStatuses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try the simple approach first - get latest status for each user
        const { data: statusData, error: statusError } = await supabase
          .from('user_status')
          .select(`
            user_id,
            status,
            timestamp,
            location,
            users!inner(
              id,
              full_name,
              campaign_id,
              pay_rate_per_hour,
              employee_type,
              is_active
            )
          `)
          .eq('users.is_active', true)
          .order('timestamp', { ascending: false });

        if (statusError) {
          throw statusError;
        }

        // Get the latest status for each user
        const latestStatuses = {};
        (statusData || []).forEach(item => {
          const userId = item.user_id;
          if (!latestStatuses[userId] || 
              new Date(item.timestamp) > new Date(latestStatuses[userId].timestamp)) {
            latestStatuses[userId] = item;
          }
        });

        // Get campaign names if campaigns exist
        let campaignNames = {};
        if (campaigns.length > 0) {
          const { data: campaignData } = await supabase
            .from('campaigns')
            .select('id, name');
          
          if (campaignData) {
            campaignNames = campaignData.reduce((acc, camp) => {
              acc[camp.id] = camp.name;
              return acc;
            }, {});
          }
        }

        // Transform the data for easier use
        const transformedData = Object.values(latestStatuses).map(item => ({
          user_id: item.user_id,
          full_name: item.users?.full_name || 'Unknown User',
          status: item.status,
          timestamp: item.timestamp,
          location: item.location,
          campaign_id: item.users?.campaign_id,
          campaign_name: campaignNames[item.users?.campaign_id] || 'No Campaign',
          pay_rate: item.users?.pay_rate_per_hour,
          employee_type: item.users?.employee_type
        }));

        setUserStatuses(transformedData);
        console.log('Fetched user statuses:', transformedData);
        
      } catch (err) {
        console.error('Error fetching user statuses:', err);
        setError(`Failed to load user statuses: ${err.message}`);
        setUserStatuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatuses();

    // Set up real-time subscription for user status changes
    const subscription = supabase
      .channel('user_status_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_status' 
        }, 
        (payload) => {
          console.log('Status change detected:', payload);
          // Refetch data when user status changes
          fetchUserStatuses();
        }
      )
      .subscribe();

    // Refresh data every 30 seconds as backup
    const refreshInterval = setInterval(fetchUserStatuses, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [campaigns]);

  // Filter users based on campaign and search term
  const filteredUsers = userStatuses.filter(user => {
    const matchesCampaign = selectedCampaign === 'all' || user.campaign_id === selectedCampaign;
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCampaign && matchesSearch;
  });

  // Calculate status counts
  const statusCounts = filteredUsers.reduce((counts, user) => {
    counts[user.status] = (counts[user.status] || 0) + 1;
    return counts;
  }, {});

  const inCount = statusCounts.in || 0;
  const breakCount = statusCounts.break || 0;
  const outCount = statusCounts.out || 0;
  const totalCount = filteredUsers.length;

  // Format time display
  const timeString = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'in': return <Users size={14} className="status-icon in" />;
      case 'break': return <Coffee size={14} className="status-icon break" />;
      case 'out': return <LogOut size={14} className="status-icon out" />;
      default: return <Clock size={14} className="status-icon" />;
    }
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case 'in': return 'status-in';
      case 'break': return 'status-break';
      case 'out': return 'status-out';
      default: return 'status-unknown';
    }
  };

  if (loading) {
    return (
      <div className="whoisinout-panel">
        <div className="whoisinout-header">
          <h2>Who's in/out</h2>
          <p>Loading...</p>
        </div>
        <div className="loading-spinner">
          <Clock className="animate-spin" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="whoisinout-panel">
      <div className="whoisinout-header">
        <h2>Who's in/out</h2>
        <p>{totalCount} member{totalCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="whoisinout-tabs">
        <div className="tab in-tab">
          {inCount}<br />
          <span>IN</span>
        </div>
        <div className="tab break-tab">
          {breakCount}<br />
          <span>BREAK</span>
        </div>
        <div className="tab out-tab">
          {outCount}<br />
          <span>OUT</span>
        </div>
      </div>

      {/* Campaign Filter - Only show if campaigns exist */}
      {campaigns.length > 0 && (
        <div className="campaign-filter">
          <Filter size={16} className="filter-icon" />
          <select 
            value={selectedCampaign} 
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="campaign-select"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search */}
      <div className="whoisinout-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* User List */}
      <div className="user-list">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                fontSize: '12px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}
        
        {!error && filteredUsers.length === 0 && (
          <div className="empty-state">
            <Users size={32} className="empty-icon" />
            <p>No members found</p>
            {searchTerm && <p className="empty-subtext">Try adjusting your search</p>}
          </div>
        )}

        {!error && filteredUsers.length > 0 && (
          <div className="user-status-list">
            {filteredUsers.map(user => (
              <div key={user.user_id} className={`user-status-item ${getStatusClass(user.status)}`}>
                <div className="user-info">
                  <div className="user-name-status">
                    {getStatusIcon(user.status)}
                    <span className="user-name">{user.full_name}</span>
                  </div>
                  <div className="user-details">
                    <span className="campaign-name">{user.campaign_name}</span>
                    <span className="status-time">{formatTimestamp(user.timestamp)}</span>
                  </div>
                </div>
                <div className="status-badge">
                  <span className={`status-text ${user.status}`}>
                    {user.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Time */}
      <div className="whoisinout-time">
        <div className="clock">{timeString}</div>
        <div className="date">{dateString}</div>
        {inCount > 0 ? (
          <div className="status-note">
            {inCount} member{inCount !== 1 ? 's' : ''} currently clocked in
          </div>
        ) : (
          <div className="empty-note">No members clocked in now</div>
        )}
      </div>
    </div>
  );
}

