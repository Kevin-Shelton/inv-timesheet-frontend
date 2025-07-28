import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const TimesheetFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const { user, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    userId: initialFilters.userId || '',
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
    department: initialFilters.department || '',
    campaign: initialFilters.campaign || '',
    project: initialFilters.project || '',
    status: initialFilters.status || '',
    ...initialFilters
  });

  // Dropdown data
  const [filterOptions, setFilterOptions] = useState({
    users: [],
    departments: [],
    campaigns: [],
    projects: [],
    statuses: [
      { value: '', label: 'All Statuses' },
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending Approval' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]
  });

  useEffect(() => {
    fetchFilterOptions();
  }, [user]);

  useEffect(() => {
    // Notify parent component of filter changes
    onFiltersChange && onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const fetchFilterOptions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 FILTERS: Fetching filter options for role:', user.role);

      let usersQuery = supabase
        .from('users')
        .select('id, full_name, email, department, role')
        .eq('is_active', true);

      // Apply role-based filtering for users
      if (isAdmin()) {
        // Admins can see all users
        console.log('🔍 FILTERS: Admin view - loading all users');
      } else if (isManager()) {
        // Managers can see their direct reports + themselves
        console.log('🔍 FILTERS: Manager view - loading team members');
        usersQuery = usersQuery.or(`id.eq.${user.id},manager_id.eq.${user.id}`);
      } else {
        // Employees can only see themselves
        console.log('🔍 FILTERS: Employee view - loading self only');
        usersQuery = usersQuery.eq('id', user.id);
      }

      const { data: usersData, error: usersError } = await usersQuery.order('full_name');
      if (usersError) throw usersError;

      // Get unique departments
      const departments = [...new Set(usersData?.map(u => u.department).filter(Boolean))]
        .map(dept => ({ value: dept, label: dept }));

      // Fetch campaigns (visible based on user permissions)
      let campaignsQuery = supabase
        .from('campaigns')
        .select('id, name, status')
        .in('status', ['active', 'in_progress', 'completed']);

      const { data: campaignsData, error: campaignsError } = await campaignsQuery.order('name');
      if (campaignsError) throw campaignsError;

      // Fetch projects (visible based on user permissions)
      let projectsQuery = supabase
        .from('projects')
        .select('id, name, status')
        .in('status', ['active', 'in_progress', 'completed']);

      const { data: projectsData, error: projectsError } = await projectsQuery.order('name');
      if (projectsError) throw projectsError;

      setFilterOptions({
        users: [
          { value: '', label: 'All Users' },
          ...usersData?.map(user => ({
            value: user.id,
            label: `${user.full_name} (${user.department || 'No Dept'})`
          })) || []
        ],
        departments: [
          { value: '', label: 'All Departments' },
          ...departments
        ],
        campaigns: [
          { value: '', label: 'All Campaigns' },
          ...campaignsData?.map(campaign => ({
            value: campaign.id,
            label: `${campaign.name} (${campaign.status})`
          })) || []
        ],
        projects: [
          { value: '', label: 'All Projects' },
          ...projectsData?.map(project => ({
            value: project.id,
            label: `${project.name} (${project.status})`
          })) || []
        ],
        statuses: [
          { value: '', label: 'All Statuses' },
          { value: 'draft', label: 'Draft' },
          { value: 'pending', label: 'Pending Approval' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' }
        ]
      });

      console.log('🔍 FILTERS: Loaded options:', {
        users: usersData?.length,
        departments: departments.length,
        campaigns: campaignsData?.length,
        projects: projectsData?.length
      });

    } catch (error) {
      console.error('🔍 FILTERS ERROR:', error);
      setError(`Failed to load filter options: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      userId: '',
      dateFrom: '',
      dateTo: '',
      department: '',
      campaign: '',
      project: '',
      status: ''
    };
    setFilters(clearedFilters);
  };

  const setQuickDateRange = (range) => {
    const today = new Date();
    let dateFrom, dateTo;

    switch (range) {
      case 'today':
        dateFrom = dateTo = today.toISOString().split('T')[0];
        break;
      case 'week':
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        dateFrom = monday.toISOString().split('T')[0];
        dateTo = today.toISOString().split('T')[0];
        break;
      case 'month':
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        dateTo = today.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        dateFrom = quarterStart.toISOString().split('T')[0];
        dateTo = today.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      dateFrom,
      dateTo
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  if (loading) {
    return (
      <div className="timesheet-filters">
        <div className="filters-loading">
          <div className="loading-spinner"></div>
          <span>Loading filters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="timesheet-filters">
      <div className="filters-header">
        <h4>Filters</h4>
        <div className="filters-actions">
          {getActiveFiltersCount() > 0 && (
            <span className="active-filters-count">
              {getActiveFiltersCount()} active
            </span>
          )}
          <button 
            onClick={clearFilters} 
            className="clear-filters-button"
            disabled={getActiveFiltersCount() === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      {error && (
        <div className="filters-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="filters-content">
        {/* Quick Date Ranges */}
        <div className="filter-group">
          <label>Quick Date Ranges</label>
          <div className="quick-date-buttons">
            <button 
              onClick={() => setQuickDateRange('today')}
              className="quick-date-button"
            >
              Today
            </button>
            <button 
              onClick={() => setQuickDateRange('week')}
              className="quick-date-button"
            >
              This Week
            </button>
            <button 
              onClick={() => setQuickDateRange('month')}
              className="quick-date-button"
            >
              This Month
            </button>
            <button 
              onClick={() => setQuickDateRange('quarter')}
              className="quick-date-button"
            >
              This Quarter
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-range-inputs">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              placeholder="From date"
              className="filter-input"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              placeholder="To date"
              className="filter-input"
            />
          </div>
        </div>

        {/* User Selection (if admin/manager) */}
        {(isAdmin() || isManager()) && filterOptions.users.length > 1 && (
          <div className="filter-group">
            <label>Team Member</label>
            <select
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="filter-select"
            >
              {filterOptions.users.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Department Filter */}
        {filterOptions.departments.length > 1 && (
          <div className="filter-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="filter-select"
            >
              {filterOptions.departments.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Campaign Filter */}
        {filterOptions.campaigns.length > 1 && (
          <div className="filter-group">
            <label>Campaign</label>
            <select
              value={filters.campaign}
              onChange={(e) => handleFilterChange('campaign', e.target.value)}
              className="filter-select"
            >
              {filterOptions.campaigns.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Project Filter */}
        {filterOptions.projects.length > 1 && (
          <div className="filter-group">
            <label>Project</label>
            <select
              value={filters.project}
              onChange={(e) => handleFilterChange('project', e.target.value)}
              className="filter-select"
            >
              {filterOptions.projects.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            {filterOptions.statuses.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applied Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <div className="applied-filters">
          <h5>Applied Filters:</h5>
          <div className="filter-tags">
            {filters.dateFrom && (
              <span className="filter-tag">
                From: {filters.dateFrom}
                <button onClick={() => handleFilterChange('dateFrom', '')}>×</button>
              </span>
            )}
            {filters.dateTo && (
              <span className="filter-tag">
                To: {filters.dateTo}
                <button onClick={() => handleFilterChange('dateTo', '')}>×</button>
              </span>
            )}
            {filters.userId && (
              <span className="filter-tag">
                User: {filterOptions.users.find(u => u.value === filters.userId)?.label}
                <button onClick={() => handleFilterChange('userId', '')}>×</button>
              </span>
            )}
            {filters.department && (
              <span className="filter-tag">
                Dept: {filters.department}
                <button onClick={() => handleFilterChange('department', '')}>×</button>
              </span>
            )}
            {filters.campaign && (
              <span className="filter-tag">
                Campaign: {filterOptions.campaigns.find(c => c.value === filters.campaign)?.label}
                <button onClick={() => handleFilterChange('campaign', '')}>×</button>
              </span>
            )}
            {filters.project && (
              <span className="filter-tag">
                Project: {filterOptions.projects.find(p => p.value === filters.project)?.label}
                <button onClick={() => handleFilterChange('project', '')}>×</button>
              </span>
            )}
            {filters.status && (
              <span className="filter-tag">
                Status: {filterOptions.statuses.find(s => s.value === filters.status)?.label}
                <button onClick={() => handleFilterChange('status', '')}>×</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetFilters;

