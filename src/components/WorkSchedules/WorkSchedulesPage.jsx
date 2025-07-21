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

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Get current user
        const user = await supabaseApi.getCurrentUser();
        setCurrentUser(user);

        // Load campaigns
        const campaignData = await supabaseApi.getCampaigns();
        setCampaigns(campaignData || []);

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
    setSelectedSchedule(schedule);
    // Navigate to edit form - will be implemented in next phase
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
    } catch (error) {
      console.error('Error toggling schedule status:', error);
    }
  };

  if (loading) {
    return (
      <div className="work-schedules-loading">
        <div>
          <div className="work-schedules-loading-spinner"></div>
          <p className="work-schedules-loading-text">Loading Work Schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="work-schedules-page">
      {/* Sidebar */}
      <div className="work-schedules-sidebar">
        {/* Sidebar Header */}
        <div className="work-schedules-sidebar-header">
          <div className="work-schedules-logo">
            <div className="work-schedules-logo-icon">
              <Calendar size={20} color="#FFFFFF" />
            </div>
            <div>
              <h1 className="work-schedules-title">Work Schedules</h1>
              <p className="work-schedules-subtitle">Manage team schedules</p>
            </div>
          </div>

          {/* Create Schedule Button */}
          <button onClick={handleCreateSchedule} className="work-schedules-create-btn">
            <Plus size={16} />
            Add New Schedule
          </button>
        </div>

        {/* Search and Filter */}
        <div className="work-schedules-search-section">
          {/* Search */}
          <div className="work-schedules-search-container">
            <Search size={16} className="work-schedules-search-icon" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="work-schedules-search-input"
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="work-schedules-filter-select"
          >
            <option value="all">All Schedules</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="campaign">With Campaigns</option>
          </select>
        </div>

        {/* Schedules List */}
        <div className="work-schedules-list">
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
              <div key={groupName} className="work-schedules-group">
                {/* Group Header */}
                <div className="work-schedules-group-header">
                  <Building2 size={14} />
                  {groupName}
                </div>

                {/* Group Schedules */}
                {groupSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => setSelectedSchedule(schedule)}
                    className={`work-schedules-schedule-card ${selectedSchedule?.id === schedule.id ? 'selected' : ''}`}
                  >
                    {/* Schedule Header */}
                    <div className="work-schedules-schedule-header">
                      <div className="work-schedules-schedule-info">
                        <h3 className="work-schedules-schedule-name">{schedule.name}</h3>
                        <p className="work-schedules-schedule-description">{schedule.description}</p>
                      </div>

                      {/* Status Indicator */}
                      <div className="work-schedules-status-indicator">
                        {schedule.is_active ? (
                          <CheckCircle2 size={14} color="#10B981" />
                        ) : (
                          <PauseCircle size={14} color="#6B7280" />
                        )}
                      </div>
                    </div>

                    {/* Schedule Details */}
                    <div className="work-schedules-schedule-details">
                      <div className="work-schedules-detail-item">
                        <Clock size={12} color="#6B7280" />
                        <span>{formatScheduleType(schedule.schedule_type)}</span>
                      </div>

                      <div className="work-schedules-detail-item">
                        <Users size={12} color="#6B7280" />
                        <span>{schedule.assigned_users} users</span>
                      </div>
                    </div>

                    {/* Workdays */}
                    <div className="work-schedules-workdays-badge">
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
      <div className="work-schedules-main">
        {selectedSchedule ? (
          <>
            {/* Main Header */}
            <div className="work-schedules-main-header">
              <div className="work-schedules-header-content">
                <div>
                  <div className="work-schedules-header-info">
                    <h1 className="work-schedules-main-title">{selectedSchedule.name}</h1>
                    
                    {/* Status Badge */}
                    <div className={`work-schedules-status-badge ${selectedSchedule.is_active ? 'active' : 'inactive'}`}>
                      {selectedSchedule.is_active ? 'Active' : 'Inactive'}
                    </div>

                    {/* Multi-Campaign Badge */}
                    {selectedSchedule.campaigns && selectedSchedule.campaigns.length > 1 && (
                      <div className="work-schedules-multi-campaign-badge">
                        <AlertCircle size={12} />
                        Multi-Campaign
                      </div>
                    )}
                  </div>
                  
                  <p className="work-schedules-main-description">{selectedSchedule.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="work-schedules-actions">
                  <button
                    onClick={() => handleToggleScheduleStatus(selectedSchedule.id)}
                    className={`work-schedules-action-btn ${selectedSchedule.is_active ? 'danger' : 'success'}`}
                  >
                    {selectedSchedule.is_active ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                    {selectedSchedule.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleCopySchedule(selectedSchedule)}
                    className="work-schedules-action-btn secondary"
                  >
                    <Copy size={16} />
                    Copy Schedule
                  </button>

                  <button
                    onClick={() => handleEditSchedule(selectedSchedule)}
                    className="work-schedules-action-btn primary"
                  >
                    <Edit3 size={16} />
                    Edit Schedule
                  </button>

                  {/* More Actions Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button className="work-schedules-action-btn secondary">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Details Content */}
            <div className="work-schedules-content">
              {/* Schedule Overview Cards */}
              <div className="work-schedules-overview-grid">
                {/* Basic Information Card */}
                <div className="work-schedules-card">
                  <div className="work-schedules-card-header">
                    <div className="work-schedules-card-icon blue">
                      <Clock size={20} color="#6366F1" />
                    </div>
                    <h3 className="work-schedules-card-title">Schedule Details</h3>
                  </div>

                  <div className="work-schedules-card-content">
                    <div className="work-schedules-detail-row">
                      <span className="work-schedules-detail-label">Type:</span>
                      <span className="work-schedules-detail-value">{formatScheduleType(selectedSchedule.schedule_type)}</span>
                    </div>

                    {selectedSchedule.schedule_type === 'fixed' && (
                      <>
                        <div className="work-schedules-detail-row">
                          <span className="work-schedules-detail-label">Start Time:</span>
                          <span className="work-schedules-detail-value">{selectedSchedule.start_time}</span>
                        </div>
                        <div className="work-schedules-detail-row">
                          <span className="work-schedules-detail-label">End Time:</span>
                          <span className="work-schedules-detail-value">{selectedSchedule.end_time}</span>
                        </div>
                      </>
                    )}

                    {selectedSchedule.hours_per_day && (
                      <div className="work-schedules-detail-row">
                        <span className="work-schedules-detail-label">Hours/Day:</span>
                        <span className="work-schedules-detail-value">{selectedSchedule.hours_per_day}</span>
                      </div>
                    )}

                    {selectedSchedule.hours_per_week && (
                      <div className="work-schedules-detail-row">
                        <span className="work-schedules-detail-label">Hours/Week:</span>
                        <span className="work-schedules-detail-value">{selectedSchedule.hours_per_week}</span>
                      </div>
                    )}

                    <div className="work-schedules-detail-row">
                      <span className="work-schedules-detail-label">Work Days:</span>
                      <span className="work-schedules-detail-value">{formatWorkdays(selectedSchedule.workdays)}</span>
                    </div>
                  </div>
                </div>

                {/* Team Assignment Card */}
                <div className="work-schedules-card">
                  <div className="work-schedules-card-header">
                    <div className="work-schedules-card-icon green">
                      <Users size={20} color="#16A34A" />
                    </div>
                    <h3 className="work-schedules-card-title">Team Assignment</h3>
                  </div>

                  <div className="work-schedules-card-content">
                    <div className="work-schedules-detail-row">
                      <span className="work-schedules-detail-label">Assigned Users:</span>
                      <span className="work-schedules-detail-value">{selectedSchedule.assigned_users}</span>
                    </div>

                    <div className="work-schedules-detail-row">
                      <span className="work-schedules-detail-label">Campaigns:</span>
                      <span className="work-schedules-detail-value">{selectedSchedule.campaigns?.length || 0}</span>
                    </div>

                    {selectedSchedule.campaigns && selectedSchedule.campaigns.length > 0 && (
                      <div className="work-schedules-campaign-list">
                        <div className="work-schedules-campaign-list-title">Campaign List:</div>
                        <div className="work-schedules-campaign-items">
                          {selectedSchedule.campaigns.map((campaign) => (
                            <div key={campaign.id} className="work-schedules-campaign-item">
                              {campaign.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Breaks & Rules Card */}
                <div className="work-schedules-card">
                  <div className="work-schedules-card-header">
                    <div className="work-schedules-card-icon yellow">
                      <Settings size={20} color="#D97706" />
                    </div>
                    <h3 className="work-schedules-card-title">Rules & Breaks</h3>
                  </div>

                  <div className="work-schedules-card-content">
                    <div className="work-schedules-detail-row">
                      <span className="work-schedules-detail-label">Breaks:</span>
                      <span className="work-schedules-detail-value">{selectedSchedule.breaks?.length || 0}</span>
                    </div>

                    <div className="work-schedules-detail-row">
                      <span className="work-schedules-detail-label">Overtime Rules:</span>
                      <span className="work-schedules-detail-value">{selectedSchedule.overtime_rules?.length || 0}</span>
                    </div>

                    {selectedSchedule.breaks && selectedSchedule.breaks.length > 0 && (
                      <div className="work-schedules-campaign-list">
                        <div className="work-schedules-campaign-list-title">Break Schedule:</div>
                        <div className="work-schedules-campaign-items">
                          {selectedSchedule.breaks.map((breakItem, index) => (
                            <div key={index} className="work-schedules-campaign-item" style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
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
              <div className="work-schedules-details-grid">
                {/* Breaks Section */}
                {selectedSchedule.breaks && selectedSchedule.breaks.length > 0 && (
                  <div className="work-schedules-card">
                    <h3 className="work-schedules-section-title">Break Schedule</h3>

                    <div>
                      {selectedSchedule.breaks.map((breakItem, index) => (
                        <div key={index} className="work-schedules-break-item">
                          <div className="work-schedules-break-header">
                            <h4 className="work-schedules-break-name">{breakItem.name}</h4>
                            <div className={`work-schedules-break-badge ${breakItem.is_paid ? 'paid' : 'unpaid'}`}>
                              {breakItem.is_paid ? 'Paid' : 'Unpaid'}
                            </div>
                          </div>

                          <div className="work-schedules-break-time">
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
                  <div className="work-schedules-card">
                    <h3 className="work-schedules-section-title">Overtime Rules</h3>

                    <div>
                      {selectedSchedule.overtime_rules.map((rule, index) => (
                        <div key={index} className="work-schedules-rule-item">
                          <div className="work-schedules-rule-header">
                            <h4 className="work-schedules-rule-name">
                              {rule.rule_type.replace('_', ' ')} Overtime
                            </h4>
                            <div className={`work-schedules-rule-badge ${rule.is_active ? 'active' : 'inactive'}`}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </div>
                          </div>

                          <div className="work-schedules-rule-details">
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
          <div className="work-schedules-empty-state">
            <div className="work-schedules-empty-content">
              <div className="work-schedules-empty-icon">
                <Calendar size={40} color="#FFFFFF" />
              </div>
              
              <h2 className="work-schedules-empty-title">Select a Schedule</h2>
              
              <p className="work-schedules-empty-description">
                Choose a schedule from the sidebar to view its details, manage team assignments, and configure rules.
              </p>

              <button onClick={handleCreateSchedule} className="work-schedules-action-btn primary">
                <Plus size={20} />
                Create Your First Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkSchedulesPage;

