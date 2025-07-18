import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Search, X, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Updated: Corrected import path using alias

// Enhanced WhoIsInOutPanel v2.0 - with draggable components and campaign filtering

const WhoIsInOutPanel = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayOrder, setDisplayOrder] = useState([]);

  // Fetch campaigns from database
  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('users') // Assuming 'users' table for members
        .select('id, full_name, status, avatar_url, campaign_id'); // Include campaign_id

      if (error) {
        console.error('Error fetching members:', error.message);
      } else {
        setMembers(data);
      }
    };

    fetchMembers();

    // Initialize display order if not already set (e.g., from local storage)
    const savedOrder = JSON.parse(localStorage.getItem('whoIsInPanelOrder'));
    if (savedOrder) {
      setDisplayOrder(savedOrder);
    } else {
      setDisplayOrder([
        { id: 'current-time', content: <CurrentTimeComponent /> },
        { id: 'member-list', content: <MemberList members={members} searchTerm={searchTerm} /> },
      ]);
    }
  }, [searchTerm, members.length]); // Re-run if members change after initial fetch

  const CurrentTimeComponent = () => (
    <div className="text-center py-4">
      <h3 className="text-lg font-semibold text-gray-800">Current Time</h3>
      <p className="text-2xl font-bold text-blue-600">{new Date().toLocaleTimeString()}</p>
      <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
    </div>
  );

  const MemberList = ({ members, searchTerm }) => {
    const filteredMembers = members.filter(member =>
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Who's In/Out</h3>
        {/* Member Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchTerm('')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => (
              <div key={member.id} className="flex items-center space-x-3">
                <img
                  src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.full_name}&background=random`}
                  alt={member.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-grow">
                  <p className="font-medium text-gray-900">{member.full_name}</p>
                  <p className={`text-sm ${member.status === 'In' ? 'text-green-600' : 'text-red-600'}`}>
                    {member.status}
                  </p>
                </div>
              </div>
             ))
          ) : (
            <p className="text-gray-500 text-sm">No members found.</p>
          )}
        </div>
      </div>
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newOrder = Array.from(displayOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setDisplayOrder(newOrder);
    localStorage.setItem('whoIsInPanelOrder', JSON.stringify(newOrder));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="who-is-in-out-panel">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {displayOrder.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`draggable-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
                  >
                    <div className="draggable-item-header">
                      <h4 className="text-md font-semibold text-gray-700">
                        {item.id === 'current-time' ? 'Current Time' : 'Member List'}
                      </h4>
                      <span {...provided.dragHandleProps} className="draggable-handle">
                        <GripVertical className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="draggable-item-content">
                      {item.id === 'current-time' ? <CurrentTimeComponent /> : <MemberList members={members} searchTerm={searchTerm} />}
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
  );
};

export default WhoIsInOutPanel;
