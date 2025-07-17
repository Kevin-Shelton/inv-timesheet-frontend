import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../../../lib/supabaseClient';

const WhoIsInOutPanel = () => {
  const [components, setComponents] = useState([
    { id: 'time', type: 'time', title: 'Current Time' },
    { id: 'members', type: 'members', title: "Who's in/out" }
  ]);
  const [members, setMembers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('id, name')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setCampaigns(data || []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('users')
          .select(`
            id,
            full_name,
            email,
            status,
            last_activity,
            campaign_id,
            campaigns!inner(name)
          `)
          .eq('is_active', true);

        if (selectedCampaign !== 'all') {
          query = query.eq('campaign_id', selectedCampaign);
        }

        const { data, error } = await query.order('full_name');

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedCampaign]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
  };

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusCounts = () => {
    const counts = { in: 0, break: 0, out: 0 };
    filteredMembers.forEach(member => {
      if (member.status === 'active') counts.in++;
      else if (member.status === 'break') counts.break++;
      else counts.out++;
    });
    return counts;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderTimeComponent = () => (
    <div className="time-component">
      <div className="current-time">
        <div className="time-display">{formatTime(currentTime)}</div>
        <div className="date-display">{formatDate(currentTime)}</div>
      </div>
    </div>
  );

  const renderMembersComponent = () => {
    const statusCounts = getStatusCounts();

    return (
      <div className="members-component">
        {/* Status Summary */}
        <div className="status-summary">
          <div className="status-item in">
            <div className="count">{statusCounts.in}</div>
            <div className="label">IN</div>
          </div>
          <div className="status-item break">
            <div className="count">{statusCounts.break}</div>
            <div className="label">BREAK</div>
          </div>
          <div className="status-item out">
            <div className="count">{statusCounts.out}</div>
            <div className="label">OUT</div>
          </div>
        </div>

        {/* Campaign Filter */}
        <div className="campaign-filter">
          <select
            className="campaign-select"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
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
        <div className="member-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Members List */}
        {loading ? (
          <div className="loading">Loading members...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredMembers.length === 0 ? (
          <div className="no-members">No members found</div>
        ) : (
          <div className="members-list">
            {filteredMembers.map(member => (
              <div key={member.id} className="member-item">
                <div className="member-avatar">
                  <div className="avatar-placeholder">
                    {getInitials(member.full_name)}
                  </div>
                </div>
                <div className="member-info">
                  <div className="member-name">{member.full_name}</div>
                  <div className={`member-status ${member.status || 'out'}`}>
                    {member.status === 'active' ? 'IN' : 
                     member.status === 'break' ? 'BREAK' : 'OUT'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderComponent = (component) => {
    switch (component.type) {
      case 'time':
        return renderTimeComponent();
      case 'members':
        return renderMembersComponent();
      default:
        return null;
    }
  };

  return (
    <div className="who-is-in-out-panel">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="components">
          {(provided) => (
            <div
              className="draggable-container"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {components.map((component, index) => (
                <Draggable
                  key={component.id}
                  draggableId={component.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`draggable-component ${
                        snapshot.isDragging ? 'dragging' : ''
                      }`}
                    >
                      <div
                        className="drag-handle"
                        {...provided.dragHandleProps}
                      >
                        <div className="component-header">
                          <h3 className="component-title">{component.title}</h3>
                          <div className="drag-icon">⋮⋮</div>
                        </div>
                      </div>
                      <div className="component-content">
                        {renderComponent(component)}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default WhoIsInOutPanel;

