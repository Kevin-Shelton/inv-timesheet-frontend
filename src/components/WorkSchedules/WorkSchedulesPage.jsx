import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  ChevronRight,
  Building2,
  Target,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Eye,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { supabaseApi } from "../../supabaseClient.js";
import ScheduleForm from './ScheduleForm.jsx';

// Import the CSS file
import './work-schedules.css';

const WorkSchedulesPage = () => {
  // State management
  const [schedules, setSchedules] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, campaign, department, active, inactive
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Mock data for demonstration - will be replaced with API calls
  const mockSchedules = [
    {
      id: '1',
      name: 'Standard Business Hours',
      description: 'Monday to Friday, 9 AM to 5 PM',
      schedule_type: 'fixed',
      workdays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
      start_time: '09:00',
      end_time: '17:00',
      campaigns: [{ id: '1', name: 'Customer Support' }, { id: '2', name: 'Sales Team' }],
      assigned_users: 12,
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
      breaks: [
        { name: 'Morning Break', start_time: '10:30', end_time: '10:45', is_paid: true },
        { name: 'Lunch Break', start_time: '12:00', end_time: '13:00', is_paid: false },
        { name: 'Afternoon Break', start_time: '15:00', end_time: '15:15', is_paid: true }
      ],
      overtime_rules: [
        { rule_type: 'daily', threshold_hours: 8, multiplier_rate: 1.5, is_active: true }
      ]
    },
    {
      id: '2',
      name: 'Flexible Development Team',
      description: '40 hours per week, flexible timing',
      schedule_type: 'weekly_flexible',
      workdays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
      hours_per_week: 40,
      campaigns: [{ id: '3', name: 'Product Development' }],
      assigned_users: 8,
      is_active: true,
      created_at: '2025-01-10T14:30:00Z',
      breaks: [
        { name: 'Lunch Break', duration_minutes: 60, is_paid: false }
      ],
      overtime_rules: [
        { rule_type: 'weekly', threshold_hours: 40, multiplier_rate: 1.5, is_active: true }
      ]
    },
    {
      id: '3',
      name: 'Night Shift Operations',
      description: 'Sunday to Thursday, 10 PM to 6 AM',
      schedule_type: 'fixed',
      workdays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: false, saturday: false, sunday: true },
      start_time: '22:00',
      end_time: '06:00',
      campaigns: [{ id: '4', name: 'Operations Support' }],
      assigned_users: 6,
      is_active: true,
      created_at: '2025-01-08T16:45:00Z',
      breaks: [
        { name: 'Midnight Break', start_time: '02:00', end_time: '02:30', is_paid: true }
      ],
      overtime_rules: [
        { rule_type: 'daily', threshold_hours: 8, multiplier_rate: 1.5, is_active: true },
        { rule_type: 'rest_day', multiplier_rate: 2.0, is_active: true }
      ]
    },
    {
      id: '4',
      name: 'Part-Time Weekend',
      description: 'Saturday and Sunday, 4 hours per day',
      schedule_type: 'flexible',
      workdays: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: true, sunday: true },
      hours_per_day: 4,
      campaigns: [{ id: '1', name: 'Customer Support' }],
      assigned_users: 4,
      is_active: false,
      created_at: '2025-01-05T11:20:00Z',
      breaks: [],
      overtime_rules: []
    }
  ];

  // Mock campaigns data
  const mockCampaigns = [
    { id: '1', name: 'Customer Support' },
    { id: '2', name: 'Sales Team' },
    { id: '3', name: 'Product Development' },
    { id: '4', name: 'Operations Support' },
    { id: '5', name: 'Marketing' },
    { id: '6', name: 'Quality Assurance' }
  ];

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Get current user
        const user = await supabaseApi.getCurrentUser();
        setCurrentUser(user);

        // Load campaigns
        try {
          const campaignData = await supabaseApi.getCampaigns();
          setCampaigns(campaignData || mockCampaigns);
        } catch (error) {
          console.warn('Failed to load campaigns from API, using mock data:', error);
          setCampaigns(mockCampaigns);
        }

        // For now, use mock data - will be replaced with API call
        setSchedules(mockSchedules);
        
        // Select first schedule by default
        if (mockSchedules.length > 0) {
          setSelectedSchedule(mockSchedules[0]);
        }
      } catch (error) {
        console.error('Error initializing Work Schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Filter schedules based on search and filter criteria
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'active' && schedule.is_active) ||
                         (filterBy === 'inactive' && !schedule.is_active) ||
                         (filterBy === 'campaign' && schedule.campaigns.length > 0);
    
    return matchesSearch && matchesFilter;
  });

  // Group schedules by campaign/department
  const groupedSchedules = filteredSchedules.reduce((groups, schedule) => {
    if (schedule.campaigns && schedule.campaigns.length > 0) {
      schedule.campaigns.forEach(campaign => {
        if (!groups[campaign.name]) {
          groups[campaign.name] = [];
        }
        groups[campaign.name].push(schedule);
      });
    } else {
      if (!groups['Unassigned']) {
        groups['Unassigned'] = [];
      }
      groups['Unassigned'].push(schedule);
    }
    return groups;
  }, {});

  // Format workdays for display
  const formatWorkdays = (workdays) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return days.filter((day, index) => workdays[dayKeys[index]]).join(', ');
  };

  // Format schedule type for display
  const formatScheduleType = (type) => {
    switch (type) {
      case 'fixed': return 'Fixed Hours';
      case 'flexible': return 'Flexible Daily';
      case 'weekly_flexible': return 'Weekly Flexible';
      default: return type;
    }
  };

  // Handle schedule actions
  const handleCreateSchedule = () => {
    setShowCreateModal(true);
  };

  const handleCopySchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowCopyModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowEditModal(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      try {
        // API call to delete schedule
        setSchedules(prev => prev.filter(s => s.id !== scheduleId));
        if (selectedSchedule?.id === scheduleId) {
          setSelectedSchedule(null);
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const handleToggleScheduleStatus = async (scheduleId) => {
    try {
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, is_active: !s.is_active } : s
      ));
      
      // Update selected schedule if it's the one being toggled
      if (selectedSchedule?.id === scheduleId) {
        setSelectedSchedule(prev => ({ ...prev, is_active: !prev.is_active }));
      }
    } catch (error) {
      console.error('Error toggling schedule status:', error);
    }
  };

  // Handle schedule save (create or update)
  const handleSaveSchedule = async (scheduleData) => {
    try {
      if (editingSchedule) {
        // Update existing schedule
        const updatedSchedule = {
          ...editingSchedule,
          ...scheduleData,
          id: editingSchedule.id,
          updated_at: new Date().toISOString()
        };
        
        setSchedules(prev => prev.map(s => 
          s.id === editingSchedule.id ? updatedSchedule : s
        ));
        
        // Update selected schedule if it's the one being edited
        if (selectedSchedule?.id === editingSchedule.id) {
          setSelectedSchedule(updatedSchedule);
        }
        
        setEditingSchedule(null);
        setShowEditModal(false);
      } else {
        // Create new schedule
        const newSchedule = {
          ...scheduleData,
          id: Date.now().toString(), // Temporary ID generation
          assigned_users: 0,
          created_at: new Date().toISOString(),
          breaks: [],
          overtime_rules: []
        };
        
        setSchedules(prev => [newSchedule, ...prev]);
        setSelectedSchedule(newSchedule);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#F9FAFB'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #FB923C',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>Loading Work Schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#F9FAFB',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden' // Prevent overall page scroll
    }}>
      {/* Left Panel - Schedule List */}
      <div style={{
        width: '350px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden' // Prevent this panel from scrolling the whole page
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E7EB',
          background: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
          color: 'white',
          flexShrink: 0 // Don't shrink this header
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <Calendar size={20} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: 0
              }}>
                Work Schedules
              </h1>
              <p style={{
                fontSize: '14px',
                opacity: 0.9,
                margin: 0
              }}>
                Manage team schedules
              </p>
            </div>
          </div>

          {/* Create Schedule Button */}
          <button
            onClick={handleCreateSchedule}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={16} />
            Add New Schedule
          </button>
        </div>

        {/* Search and Filter */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#FAFAFA',
          flexShrink: 0 // Don't shrink this section
        }}>
          {/* Search */}
          <div style={{
            position: 'relative',
            marginBottom: '12px'
          }}>
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280',
                zIndex: 1
              }}
            />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FB923C';
                e.target.style.boxShadow = '0 0 0 3px rgba(251, 146, 60, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FB923C';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 146, 60, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="all">All Schedules</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="campaign">With Campaigns</option>
          </select>
        </div>

        {/* Schedules List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 0'
        }}>
          {Object.keys(groupedSchedules).length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6B7280'
            }}>
              <Calendar size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', margin: 0 }}>No schedules found</p>
            </div>
          ) : (
            Object.entries(groupedSchedules).map(([groupName, groupSchedules]) => (
              <div key={groupName} style={{ marginBottom: '24px' }}>
                {/* Group Header */}
                <div style={{
                  padding: '0 24px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Building2 size={14} />
                  {groupName}
                </div>

                {/* Group Schedules */}
                {groupSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => setSelectedSchedule(schedule)}
                    style={{
                      margin: '0 16px 8px',
                      padding: '16px',
                      backgroundColor: selectedSchedule?.id === schedule.id ? '#FEF3C7' : '#FFFFFF',
                      border: `1px solid ${selectedSchedule?.id === schedule.id ? '#F59E0B' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSchedule?.id !== schedule.id) {
                        e.target.style.backgroundColor = '#F9FAFB';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSchedule?.id !== schedule.id) {
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {/* Schedule Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#111827',
                          margin: '0 0 4px 0',
                          lineHeight: '1.2'
                        }}>
                          {schedule.name}
                        </h3>
                        <p style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          margin: 0,
                          lineHeight: '1.3'
                        }}>
                          {schedule.description}
                        </p>
                      </div>

                      {/* Status Indicator */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginLeft: '8px'
                      }}>
                        {schedule.is_active ? (
                          <CheckCircle2 size={14} color="#10B981" />
                        ) : (
                          <PauseCircle size={14} color="#6B7280" />
                        )}
                      </div>
                    </div>

                    {/* Schedule Details */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={12} color="#6B7280" />
                        <span style={{
                          fontSize: '11px',
                          color: '#6B7280'
                        }}>
                          {formatScheduleType(schedule.schedule_type)}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Users size={12} color="#6B7280" />
                        <span style={{
                          fontSize: '11px',
                          color: '#6B7280'
                        }}>
                          {schedule.assigned_users} users
                        </span>
                      </div>
                    </div>

                    {/* Workdays */}
                    <div style={{
                      fontSize: '11px',
                      color: '#374151',
                      backgroundColor: '#F3F4F6',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {formatWorkdays(schedule.workdays)}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden' // Prevent this from scrolling the whole page
      }}>
        {selectedSchedule ? (
          <>
            {/* Main Header */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E5E7EB',
              padding: '24px 32px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              flexShrink: 0 // Don't shrink this header
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <h1 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#111827',
                      margin: 0
                    }}>
                      {selectedSchedule.name}
                    </h1>
                    
                    {/* Status Badge */}
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: selectedSchedule.is_active ? '#D1FAE5' : '#F3F4F6',
                      color: selectedSchedule.is_active ? '#065F46' : '#6B7280'
                    }}>
                      {selectedSchedule.is_active ? 'Active' : 'Inactive'}
                    </div>

                    {/* Multi-Campaign Badge */}
                    {selectedSchedule.campaigns && selectedSchedule.campaigns.length > 1 && (
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <AlertCircle size={12} />
                        Multi-Campaign
                      </div>
                    )}
                  </div>
                  
                  <p style={{
                    fontSize: '16px',
                    color: '#6B7280',
                    margin: 0
                  }}>
                    {selectedSchedule.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => handleToggleScheduleStatus(selectedSchedule.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: selectedSchedule.is_active ? '#FEE2E2' : '#D1FAE5',
                      color: selectedSchedule.is_active ? '#DC2626' : '#065F46',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {selectedSchedule.is_active ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                    {selectedSchedule.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleCopySchedule(selectedSchedule)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#E5E7EB';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#F3F4F6';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <Copy size={16} />
                    Copy Schedule
                  </button>

                  <button
                    onClick={() => handleEditSchedule(selectedSchedule)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: '#FB923C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#EA580C';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#FB923C';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <Edit3 size={16} />
                    Edit Schedule
                  </button>

                  {/* More Actions Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      style={{
                        padding: '10px',
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#F3F4F6';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#F9FAFB';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <MoreVertical size={16} color="#6B7280" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Details Content - SCROLLABLE */}
            <div style={{
              flex: 1,
              overflowY: 'auto', // This makes the content area scrollable
              padding: '32px',
              paddingBottom: '64px' // Extra padding at bottom to ensure content isn't cut off
            }}>
              {/* Schedule Overview Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                {/* Basic Information Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#EEF2FF',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Clock size={20} color="#6366F1" />
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      Schedule Details
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Type:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {formatScheduleType(selectedSchedule.schedule_type)}
                      </span>
                    </div>

                    {selectedSchedule.schedule_type === 'fixed' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px', color: '#6B7280' }}>Start Time:</span>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {selectedSchedule.start_time}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px', color: '#6B7280' }}>End Time:</span>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {selectedSchedule.end_time}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedSchedule.hours_per_day && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', color: '#6B7280' }}>Hours/Day:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {selectedSchedule.hours_per_day}
                        </span>
                      </div>
                    )}

                    {selectedSchedule.hours_per_week && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', color: '#6B7280' }}>Hours/Week:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {selectedSchedule.hours_per_week}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Work Days:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {formatWorkdays(selectedSchedule.workdays)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Assignment Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#F0FDF4',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={20} color="#16A34A" />
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      Team Assignment
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Assigned Users:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedSchedule.assigned_users}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Campaigns:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedSchedule.campaigns?.length || 0}
                      </span>
                    </div>

                    {selectedSchedule.campaigns && selectedSchedule.campaigns.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                          Campaign List:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {selectedSchedule.campaigns.map((campaign, index) => (
                            <div
                              key={campaign.id}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#F3F4F6',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#374151'
                              }}
                            >
                              {campaign.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Breaks & Rules Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#FEF3C7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Settings size={20} color="#D97706" />
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      Rules & Breaks
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Breaks:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedSchedule.breaks?.length || 0}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Overtime Rules:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedSchedule.overtime_rules?.length || 0}
                      </span>
                    </div>

                    {selectedSchedule.breaks && selectedSchedule.breaks.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                          Break Schedule:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {selectedSchedule.breaks.map((breakItem, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#F3F4F6',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#374151',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <span>{breakItem.name}</span>
                              <span style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: breakItem.is_paid ? '#D1FAE5' : '#FEE2E2',
                                color: breakItem.is_paid ? '#065F46' : '#DC2626'
                              }}>
                                {breakItem.is_paid ? 'Paid' : 'Unpaid'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Sections */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '32px' // Extra margin to ensure content isn't cut off
              }}>
                {/* Breaks Section */}
                {selectedSchedule.breaks && selectedSchedule.breaks.length > 0 && (
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    padding: '24px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 16px 0'
                    }}>
                      Break Schedule
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedSchedule.breaks.map((breakItem, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '16px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <h4 style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#111827',
                              margin: 0
                            }}>
                              {breakItem.name}
                            </h4>
                            <div style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: breakItem.is_paid ? '#D1FAE5' : '#FEE2E2',
                              color: breakItem.is_paid ? '#065F46' : '#DC2626'
                            }}>
                              {breakItem.is_paid ? 'Paid' : 'Unpaid'}
                            </div>
                          </div>

                          <div style={{ fontSize: '14px', color: '#6B7280' }}>
                            {breakItem.start_time && breakItem.end_time ? (
                              `${breakItem.start_time} - ${breakItem.end_time}`
                            ) : breakItem.duration_minutes ? (
                              `${breakItem.duration_minutes} minutes`
                            ) : (
                              'Flexible timing'
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overtime Rules Section */}
                {selectedSchedule.overtime_rules && selectedSchedule.overtime_rules.length > 0 && (
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    padding: '24px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 16px 0'
                    }}>
                      Overtime Rules
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedSchedule.overtime_rules.map((rule, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '16px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <h4 style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#111827',
                              margin: 0,
                              textTransform: 'capitalize'
                            }}>
                              {rule.rule_type.replace('_', ' ')} Overtime
                            </h4>
                            <div style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: rule.is_active ? '#D1FAE5' : '#F3F4F6',
                              color: rule.is_active ? '#065F46' : '#6B7280'
                            }}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </div>
                          </div>

                          <div style={{ fontSize: '14px', color: '#6B7280' }}>
                            {rule.threshold_hours && (
                              <div>After {rule.threshold_hours} hours</div>
                            )}
                            <div>Rate: {rule.multiplier_rate}x</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* No Schedule Selected */
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F9FAFB'
          }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#FB923C',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Calendar size={40} color="#FFFFFF" />
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 12px 0'
              }}>
                Select a Schedule
              </h2>
              
              <p style={{
                fontSize: '16px',
                color: '#6B7280',
                margin: '0 0 24px 0',
                lineHeight: '1.5'
              }}>
                Choose a schedule from the left panel to view its details, manage team assignments, and configure rules.
              </p>

              <button
                onClick={handleCreateSchedule}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#FB923C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#EA580C';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#FB923C';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Plus size={20} />
                Create Your First Schedule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Form Modals */}
      <ScheduleForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        schedule={null}
        onSave={handleSaveSchedule}
        campaigns={campaigns}
      />

      <ScheduleForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingSchedule(null);
        }}
        schedule={editingSchedule}
        onSave={handleSaveSchedule}
        campaigns={campaigns}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WorkSchedulesPage;

