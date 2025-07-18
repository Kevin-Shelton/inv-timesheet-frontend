// VisualAssignmentEditor.jsx - Drag & Drop Team Assignment Interface

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Crown, 
  Shield, 
  Briefcase,
  Plus,
  Minus,
  Search,
  Filter,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Settings,
  Info,
  Zap,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

import {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  ROLE_TYPES,
  EXECUTIVE_TYPES,
  CAMPAIGN_COLOR_SCHEME,
  CAMPAIGN_STATUS_COLORS,
  getCampaignStatusLabel,
  getCampaignTypeLabel,
  generateMockCampaignData
} from './CampaignDataModels.jsx';

const VisualAssignmentEditor = ({ user, api }) => {
  // State management
  const [campaigns, setCampaigns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [draggedEmployee, setDraggedEmployee] = useState(null);
  const [dragOverCampaign, setDragOverCampaign] = useState(null);
  const [showConflicts, setShowConflicts] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid, tree, kanban
  
  // Filters
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  
  // Conflict detection
  const [conflicts, setConflicts] = useState([]);
  const [utilizationData, setUtilizationData] = useState({});

  // Refs for drag and drop
  const dragRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateConflicts();
    calculateUtilization();
  }, [assignments, employees, campaigns]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load campaigns
      const campaignData = generateMockCampaignData();
      setCampaigns(campaignData);
      
      // Load employees
      if (api && api.getUsers) {
        const employeeData = await api.getUsers();
        setEmployees(employeeData);
      } else {
        // Mock employee data
        const mockEmployees = [
          { id: 'emp_001', full_name: 'John Smith', role: 'admin', email: 'john@company.com', department: 'IT' },
          { id: 'emp_002', full_name: 'Sarah Johnson', role: 'campaign_lead', email: 'sarah@company.com', department: 'Marketing' },
          { id: 'emp_003', full_name: 'Mike Davis', role: 'team_member', email: 'mike@company.com', department: 'Development' },
          { id: 'emp_004', full_name: 'Lisa Chen', role: 'team_member', email: 'lisa@company.com', department: 'Design' },
          { id: 'emp_005', full_name: 'David Wilson', role: 'team_member', email: 'david@company.com', department: 'Development' },
          { id: 'exec_001', full_name: 'Robert CEO', role: 'executive', email: 'ceo@company.com', department: 'Executive', executive_type: 'ceo' },
          { id: 'exec_002', full_name: 'Maria CIO', role: 'executive', email: 'cio@company.com', department: 'Executive', executive_type: 'cio' },
          { id: 'exec_003', full_name: 'James Operations', role: 'executive', email: 'ops@company.com', department: 'Executive', executive_type: 'operations_director' }
        ];
        setEmployees(mockEmployees);
      }
      
      // Load existing assignments
      loadAssignments();
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = () => {
    // Mock assignment data - in real app, load from API
    const mockAssignments = [
      { id: 'assign_001', employee_id: 'emp_002', campaign_id: 'camp_001', role_in_campaign: 'Campaign Leader', assignment_percentage: 80 },
      { id: 'assign_002', employee_id: 'emp_003', campaign_id: 'camp_001', role_in_campaign: 'Developer', assignment_percentage: 60 },
      { id: 'assign_003', employee_id: 'emp_004', campaign_id: 'camp_001', role_in_campaign: 'Designer', assignment_percentage: 40 },
      { id: 'assign_004', employee_id: 'exec_001', campaign_id: 'camp_001', role_in_campaign: 'Executive Oversight', assignment_percentage: 10 },
      { id: 'assign_005', employee_id: 'emp_003', campaign_id: 'camp_002', role_in_campaign: 'Developer', assignment_percentage: 30 },
      { id: 'assign_006', employee_id: 'exec_002', campaign_id: 'camp_002', role_in_campaign: 'Technical Director', assignment_percentage: 15 }
    ];
    setAssignments(mockAssignments);
  };

  const calculateConflicts = () => {
    const newConflicts = [];
    const employeeWorkload = {};

    // Calculate total assignment percentage per employee
    assignments.forEach(assignment => {
      if (!employeeWorkload[assignment.employee_id]) {
        employeeWorkload[assignment.employee_id] = 0;
      }
      employeeWorkload[assignment.employee_id] += assignment.assignment_percentage;
    });

    // Identify overallocated employees
    Object.entries(employeeWorkload).forEach(([employeeId, totalPercentage]) => {
      if (totalPercentage > 100) {
        const employee = employees.find(emp => emp.id === employeeId);
        const employeeAssignments = assignments.filter(a => a.employee_id === employeeId);
        
        newConflicts.push({
          type: 'overallocation',
          employee_id: employeeId,
          employee_name: employee?.full_name || 'Unknown',
          total_percentage: totalPercentage,
          assignments: employeeAssignments,
          severity: totalPercentage > 150 ? 'high' : 'medium'
        });
      }
    });

    setConflicts(newConflicts);
  };

  const calculateUtilization = () => {
    const utilization = {};
    
    employees.forEach(employee => {
      const employeeAssignments = assignments.filter(a => a.employee_id === employee.id);
      const totalPercentage = employeeAssignments.reduce((sum, a) => sum + a.assignment_percentage, 0);
      const campaignCount = employeeAssignments.length;
      
      utilization[employee.id] = {
        total_percentage: totalPercentage,
        campaign_count: campaignCount,
        assignments: employeeAssignments,
        status: totalPercentage > 100 ? 'overallocated' : 
                totalPercentage > 80 ? 'high' : 
                totalPercentage > 50 ? 'medium' : 'low'
      };
    });
    
    setUtilizationData(utilization);
  };

  const handleDragStart = (e, employee) => {
    setDraggedEmployee(employee);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, campaign) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCampaign(campaign.id);
  };

  const handleDragLeave = (e) => {
    setDragOverCampaign(null);
  };

  const handleDrop = (e, campaign) => {
    e.preventDefault();
    setDragOverCampaign(null);
    
    if (draggedEmployee) {
      assignEmployeeToCampaign(draggedEmployee, campaign);
      setDraggedEmployee(null);
    }
  };

  const assignEmployeeToCampaign = (employee, campaign, percentage = 50) => {
    // Check if assignment already exists
    const existingAssignment = assignments.find(
      a => a.employee_id === employee.id && a.campaign_id === campaign.id
    );
    
    if (existingAssignment) {
      alert('Employee is already assigned to this campaign');
      return;
    }

    // Determine role in campaign based on employee role
    let roleInCampaign = 'Team Member';
    if (employee.role === 'campaign_lead') {
      roleInCampaign = 'Campaign Leader';
    } else if (employee.role === 'executive') {
      roleInCampaign = 'Executive Oversight';
    }

    const newAssignment = {
      id: `assign_${Date.now()}`,
      employee_id: employee.id,
      campaign_id: campaign.id,
      role_in_campaign: roleInCampaign,
      assignment_percentage: percentage,
      start_date: new Date().toISOString().split('T')[0],
      is_active: true,
      assigned_date: new Date().toISOString(),
      assigned_by: user?.id || 'current_user'
    };

    setAssignments([...assignments, newAssignment]);
  };

  const removeAssignment = (assignmentId) => {
    setAssignments(assignments.filter(a => a.id !== assignmentId));
  };

  const updateAssignmentPercentage = (assignmentId, newPercentage) => {
    setAssignments(assignments.map(a => 
      a.id === assignmentId 
        ? { ...a, assignment_percentage: Math.max(0, Math.min(100, newPercentage)) }
        : a
    ));
  };

  const getEmployeeAssignments = (employeeId) => {
    return assignments.filter(a => a.employee_id === employeeId);
  };

  const getCampaignAssignments = (campaignId) => {
    return assignments.filter(a => a.campaign_id === campaignId);
  };

  const getEmployeeById = (employeeId) => {
    return employees.find(emp => emp.id === employeeId);
  };

  const getCampaignById = (campaignId) => {
    return campaigns.find(camp => camp.id === campaignId);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'executive':
        return <Crown className="w-4 h-4" />;
      case 'campaign_lead':
        return <Target className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getUtilizationColor = (percentage) => {
    if (percentage > 100) return '#EF4444'; // Red - Overallocated
    if (percentage > 80) return '#F59E0B'; // Orange - High
    if (percentage > 50) return '#10B981'; // Green - Medium
    return '#6B7280'; // Gray - Low
  };

  const getConflictSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name?.toLowerCase().includes(employeeFilter.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(employeeFilter.toLowerCase());
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name?.toLowerCase().includes(campaignFilter.toLowerCase()) ||
                         campaign.code?.toLowerCase().includes(campaignFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const saveAssignments = async () => {
    setSaving(true);
    try {
      // API call to save assignments
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      alert('Assignments saved successfully!');
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('Failed to save assignments');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="visual-assignment-loading">
        <div className="loading-spinner"></div>
        <p>Loading assignment editor...</p>
      </div>
    );
  }

  return (
    <div className="visual-assignment-editor">
      {/* Header */}
      <div className="assignment-header">
        <div className="header-left">
          <h1>Visual Assignment Editor</h1>
          <p>Drag and drop team members to assign them to campaigns</p>
        </div>
        <div className="header-right">
          <div className="view-controls">
            <button
              className={`btn btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Target className="w-4 h-4" />
            </button>
            <button
              className={`btn btn-icon ${showConflicts ? 'active' : ''}`}
              onClick={() => setShowConflicts(!showConflicts)}
              title="Show Conflicts"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={saveAssignments}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="loading-spinner small"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Assignments
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conflicts Panel */}
      {showConflicts && conflicts.length > 0 && (
        <div className="conflicts-panel">
          <div className="conflicts-header">
            <AlertTriangle className="w-5 h-5" />
            <h3>Assignment Conflicts ({conflicts.length})</h3>
          </div>
          <div className="conflicts-list">
            {conflicts.map((conflict, index) => (
              <div 
                key={index} 
                className="conflict-item"
                style={{ borderLeftColor: getConflictSeverityColor(conflict.severity) }}
              >
                <div className="conflict-info">
                  <strong>{conflict.employee_name}</strong>
                  <span className="conflict-details">
                    Overallocated: {conflict.total_percentage}% 
                    ({conflict.assignments.length} campaigns)
                  </span>
                </div>
                <div className="conflict-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSelectedEmployee(conflict.employee_id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="assignment-content">
        {/* Employee Panel */}
        <div className="employee-panel">
          <div className="panel-header">
            <h2>Team Members</h2>
            <div className="panel-filters">
              <div className="search-box">
                <Search className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="executive">Executives</option>
                <option value="campaign_lead">Campaign Leaders</option>
                <option value="team_member">Team Members</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="employee-list">
            {filteredEmployees.map(employee => {
              const utilization = utilizationData[employee.id] || { total_percentage: 0, campaign_count: 0 };
              const hasConflict = conflicts.some(c => c.employee_id === employee.id);
              
              return (
                <div
                  key={employee.id}
                  className={`employee-card ${hasConflict ? 'has-conflict' : ''} ${selectedEmployee === employee.id ? 'selected' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, employee)}
                  onClick={() => setSelectedEmployee(selectedEmployee === employee.id ? null : employee.id)}
                >
                  <div className="employee-info">
                    <div className="employee-header">
                      <div className="employee-name">
                        {getRoleIcon(employee.role)}
                        <span>{employee.full_name}</span>
                      </div>
                      <div className="employee-badges">
                        {hasConflict && (
                          <span className="conflict-badge">
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                        <span 
                          className="utilization-badge"
                          style={{ backgroundColor: getUtilizationColor(utilization.total_percentage) }}
                        >
                          {utilization.total_percentage}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="employee-details">
                      <span className="employee-role">{employee.role.replace('_', ' ')}</span>
                      <span className="employee-department">{employee.department}</span>
                    </div>
                    
                    <div className="employee-assignments">
                      <span className="assignment-count">
                        {utilization.campaign_count} campaign{utilization.campaign_count !== 1 ? 's' : ''}
                      </span>
                      <div 
                        className="utilization-bar"
                        style={{ 
                          width: `${Math.min(100, utilization.total_percentage)}%`,
                          backgroundColor: getUtilizationColor(utilization.total_percentage)
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedEmployee === employee.id && (
                    <div className="employee-expanded">
                      <h4>Current Assignments</h4>
                      {utilization.assignments.length === 0 ? (
                        <p className="no-assignments">No current assignments</p>
                      ) : (
                        <div className="assignment-details">
                          {utilization.assignments.map(assignment => {
                            const campaign = getCampaignById(assignment.campaign_id);
                            return (
                              <div key={assignment.id} className="assignment-detail">
                                <div className="assignment-info">
                                  <span className="campaign-name">{campaign?.name}</span>
                                  <span className="assignment-role">{assignment.role_in_campaign}</span>
                                </div>
                                <div className="assignment-controls">
                                  <input
                                    type="number"
                                    value={assignment.assignment_percentage}
                                    onChange={(e) => updateAssignmentPercentage(assignment.id, parseInt(e.target.value))}
                                    min="0"
                                    max="100"
                                    className="percentage-input"
                                  />
                                  <span>%</span>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => removeAssignment(assignment.id)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign Panel */}
        <div className="campaign-panel">
          <div className="panel-header">
            <h2>Campaigns</h2>
            <div className="panel-filters">
              <div className="search-box">
                <Search className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="planning">Planning</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="campaign-grid">
            {filteredCampaigns.map(campaign => {
              const campaignAssignments = getCampaignAssignments(campaign.id);
              const isDragOver = dragOverCampaign === campaign.id;
              
              return (
                <div
                  key={campaign.id}
                  className={`campaign-card ${isDragOver ? 'drag-over' : ''} ${selectedCampaign === campaign.id ? 'selected' : ''}`}
                  onDragOver={(e) => handleDragOver(e, campaign)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, campaign)}
                  onClick={() => setSelectedCampaign(selectedCampaign === campaign.id ? null : campaign.id)}
                >
                  <div className="campaign-header">
                    <div className="campaign-title">
                      <h3>{campaign.name}</h3>
                      <span 
                        className="campaign-type-badge"
                        style={{ backgroundColor: CAMPAIGN_COLOR_SCHEME[campaign.type] }}
                      >
                        {getCampaignTypeLabel(campaign.type)}
                      </span>
                    </div>
                    <div className="campaign-status">
                      <span 
                        className="status-indicator"
                        style={{ color: CAMPAIGN_STATUS_COLORS[campaign.status] }}
                      >
                        {getCampaignStatusLabel(campaign.status)}
                      </span>
                    </div>
                  </div>

                  <div className="campaign-info">
                    <div className="info-item">
                      <Calendar className="w-4 h-4" />
                      <span>{campaign.start_date} - {campaign.end_date}</span>
                    </div>
                    <div className="info-item">
                      <Users className="w-4 h-4" />
                      <span>{campaignAssignments.length} assigned</span>
                    </div>
                    {campaign.is_billable && (
                      <div className="info-item">
                        <DollarSign className="w-4 h-4" />
                        <span>${campaign.budget?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Drop Zone Indicator */}
                  {isDragOver && (
                    <div className="drop-zone-indicator">
                      <Plus className="w-8 h-8" />
                      <span>Drop to assign</span>
                    </div>
                  )}

                  {/* Assigned Team Members */}
                  <div className="assigned-members">
                    {campaignAssignments.map(assignment => {
                      const employee = getEmployeeById(assignment.employee_id);
                      if (!employee) return null;
                      
                      return (
                        <div key={assignment.id} className="assigned-member">
                          <div className="member-info">
                            {getRoleIcon(employee.role)}
                            <span className="member-name">{employee.full_name}</span>
                            <span className="member-percentage">{assignment.assignment_percentage}%</span>
                          </div>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAssignment(assignment.id);
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded Campaign Details */}
                  {selectedCampaign === campaign.id && (
                    <div className="campaign-expanded">
                      <div className="campaign-description">
                        <h4>Description</h4>
                        <p>{campaign.description || 'No description provided'}</p>
                      </div>
                      
                      {campaign.client_name && (
                        <div className="client-info">
                          <h4>Client</h4>
                          <p>{campaign.client_name}</p>
                        </div>
                      )}
                      
                      <div className="assignment-summary">
                        <h4>Team Composition</h4>
                        <div className="composition-stats">
                          <div className="stat-item">
                            <Crown className="w-4 h-4" />
                            <span>Executives: {campaignAssignments.filter(a => getEmployeeById(a.employee_id)?.role === 'executive').length}</span>
                          </div>
                          <div className="stat-item">
                            <Target className="w-4 h-4" />
                            <span>Leaders: {campaignAssignments.filter(a => getEmployeeById(a.employee_id)?.role === 'campaign_lead').length}</span>
                          </div>
                          <div className="stat-item">
                            <User className="w-4 h-4" />
                            <span>Members: {campaignAssignments.filter(a => getEmployeeById(a.employee_id)?.role === 'team_member').length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assignment Summary */}
      <div className="assignment-summary-panel">
        <h3>Assignment Summary</h3>
        <div className="summary-stats">
          <div className="stat-card">
            <Users className="w-6 h-6" />
            <div className="stat-info">
              <span className="stat-value">{employees.length}</span>
              <span className="stat-label">Total Employees</span>
            </div>
          </div>
          <div className="stat-card">
            <Target className="w-6 h-6" />
            <div className="stat-info">
              <span className="stat-value">{campaigns.length}</span>
              <span className="stat-label">Active Campaigns</span>
            </div>
          </div>
          <div className="stat-card">
            <Briefcase className="w-6 h-6" />
            <div className="stat-info">
              <span className="stat-value">{assignments.length}</span>
              <span className="stat-label">Total Assignments</span>
            </div>
          </div>
          <div className="stat-card">
            <AlertTriangle className="w-6 h-6" />
            <div className="stat-info">
              <span className="stat-value">{conflicts.length}</span>
              <span className="stat-label">Conflicts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualAssignmentEditor;

