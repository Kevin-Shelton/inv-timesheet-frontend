import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const WhoIsInOutPanel = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define draggable panel components
  const [panelComponents, setPanelComponents] = useState([
    {
      id: 'whos-in-out',
      title: "Who's in/out",
      type: 'members',
      component: 'MembersComponent'
    },
    {
      id: 'current-time',
      title: 'Current Time',
      type: 'time',
      component: 'TimeComponent'
    }
  ]);

  // Mock data for demonstration
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMembers([
          { id: 1, name: 'John Doe', status: 'in', avatar: null },
          { id: 2, name: 'Jane Smith', status: 'out', avatar: null },
          { id: 3, name: 'Mike Johnson', status: 'break', avatar: null },
        ]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load members');
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(panelComponents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPanelComponents(items);
  };

  // Current time component
  const TimeComponent = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    return (
      <div className="time-component">
        <div className="current-time">
          <div className="time-display">
            {currentTime.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
          <div className="date-display">
            {currentTime.toLocaleDateString([], { 
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    );
  };

  // Members component
  const MembersComponent = () => {
    const inCount = members.filter(m => m.status === 'in').length;
    const outCount = members.filter(m => m.status === 'out').length;
    const breakCount = members.filter(m => m.status === 'break').length;

    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    return (
      <div className="members-component">
        {/* Status Summary */}
        <div className="status-summary">
          <div className="status-item in">
            <span className="count">{inCount}</span>
            <span className="label">IN</span>
          </div>
          <div className="status-item break">
            <span className="count">{breakCount}</span>
            <span className="label">BREAK</span>
          </div>
          <div className="status-item out">
            <span className="count">{outCount}</span>
            <span className="label">OUT</span>
          </div>
        </div>

        {/* Campaign Filter */}
        <div className="campaign-filter">
          <select className="campaign-select">
            <option>All Campaigns</option>
            <option>Campaign A</option>
            <option>Campaign B</option>
          </select>
        </div>

        {/* Search */}
        <div className="member-search">
          <input 
            type="text" 
            placeholder="Search members..." 
            className="search-input"
          />
        </div>

        {/* Members List */}
        <div className="members-list">
          {members.length === 0 ? (
            <div className="no-members">No members found</div>
          ) : (
            members.map(member => (
              <div key={member.id} className="member-item">
                <div className="member-avatar">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  <div className={`member-status ${member.status}`}>
                    {member.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render component based on type
  const renderComponent = (component) => {
    switch (component.type) {
      case 'time':
        return <TimeComponent />;
      case 'members':
        return <MembersComponent />;
      default:
        return <div>Unknown component</div>;
    }
  };

  return (
    <div className="who-is-in-out-panel">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="panel-components">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="draggable-container"
            >
              {panelComponents.map((component, index) => (
                <Draggable 
                  key={component.id} 
                  draggableId={component.id} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`draggable-component ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <div 
                        {...provided.dragHandleProps}
                        className="drag-handle"
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

