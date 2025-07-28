import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const AuditLogViewer = ({ onClose }) => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [statistics, setStatistics] = useState({
    total_actions: 0,
    actions_by_type: {},
    actions_by_admin: {},
    recent_activity: []
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    action: '',
    targetUserId: '',
    dateFrom: '',
    dateTo: '',
    limit: 50,
    offset: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    actions: [],
    users: []
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchAuditData();
      fetchFilterOptions();
    }
  }, [filters]);

  const fetchAuditData = async () => {
    if (!isAdmin()) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📊 AUDIT LOG: Fetching audit data with filters:', filters);

      // Fetch audit logs using the database function
      const { data: logsData, error: logsError } = await supabase
        .rpc('get_audit_log_with_details', {
          p_limit: filters.limit,
          p_offset: filters.offset,
          p_action: filters.action || null,
          p_target_user_id: filters.targetUserId || null,
          p_date_from: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
          p_date_to: filters.dateTo ? new Date(filters.dateTo).toISOString() : null
        });

      if (logsError) throw logsError;

      // Fetch statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_audit_statistics', {
          p_date_from: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
          p_date_to: filters.dateTo ? new Date(filters.dateTo).toISOString() : null
        });

      if (statsError) throw statsError;

      setAuditLogs(logsData || []);
      setStatistics(statsData?.[0] || {
        total_actions: 0,
        actions_by_type: {},
        actions_by_admin: {},
        recent_activity: []
      });

      setHasMore((logsData?.length || 0) === filters.limit);

      console.log('📊 AUDIT LOG: Data loaded:', {
        logs: logsData?.length,
        totalActions: statsData?.[0]?.total_actions
      });

    } catch (error) {
      console.error('📊 AUDIT LOG ERROR:', error);
      setError(`Failed to load audit data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Get unique actions from audit log
      const { data: actionsData, error: actionsError } = await supabase
        .from('admin_audit_log')
        .select('action')
        .order('action');

      if (actionsError) throw actionsError;

      const uniqueActions = [...new Set(actionsData?.map(item => item.action) || [])];

      // Get users for target filtering
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('is_active', true)
        .order('full_name');

      if (usersError) throw usersError;

      setFilterOptions({
        actions: uniqueActions.map(action => ({ value: action, label: formatActionLabel(action) })),
        users: usersData?.map(user => ({ 
          value: user.id, 
          label: `${user.full_name} (${user.email})` 
        })) || []
      });

    } catch (error) {
      console.error('📊 AUDIT LOG FILTER OPTIONS ERROR:', error);
    }
  };

  const formatActionLabel = (action) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      offset: 0 // Reset pagination when filters change
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (direction) => {
    const newOffset = direction === 'next' 
      ? filters.offset + filters.limit 
      : Math.max(0, filters.offset - filters.limit);
    
    setFilters(prev => ({ ...prev, offset: newOffset }));
    setCurrentPage(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      targetUserId: '',
      dateFrom: '',
      dateTo: '',
      limit: 50,
      offset: 0
    });
    setCurrentPage(1);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    const iconMap = {
      'create_timesheet': '📝',
      'timesheet_approved': '✅',
      'timesheet_rejected': '❌',
      'edit_timesheet': '✏️',
      'delete_timesheet': '🗑️',
      'user_created': '👤',
      'user_updated': '👤',
      'role_changed': '🔄',
      'login': '🔐',
      'logout': '🔓'
    };
    return iconMap[action] || '📋';
  };

  const renderActionDetails = (action, details) => {
    if (!details) return null;

    return (
      <div className="action-details">
        {details.reason && (
          <div className="detail-item">
            <strong>Reason:</strong> {details.reason}
          </div>
        )}
        {details.hours && (
          <div className="detail-item">
            <strong>Hours:</strong> {details.hours}
          </div>
        )}
        {details.date && (
          <div className="detail-item">
            <strong>Date:</strong> {details.date}
          </div>
        )}
        {details.changes && (
          <div className="detail-item">
            <strong>Changes:</strong> {JSON.stringify(details.changes)}
          </div>
        )}
      </div>
    );
  };

  if (!isAdmin()) {
    return (
      <div className="audit-log-viewer">
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>Only administrators can access audit logs.</p>
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-log-viewer">
      <div className="viewer-header">
        <h2>Audit Log</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      {/* Statistics Dashboard */}
      <div className="audit-statistics">
        <div className="stat-card">
          <h4>Total Actions</h4>
          <div className="stat-number">{statistics.total_actions}</div>
        </div>
        <div className="stat-card">
          <h4>Action Types</h4>
          <div className="stat-breakdown">
            {Object.entries(statistics.actions_by_type || {}).slice(0, 3).map(([action, count]) => (
              <div key={action} className="stat-item">
                <span>{formatActionLabel(action)}: {count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-card">
          <h4>Active Admins</h4>
          <div className="stat-breakdown">
            {Object.entries(statistics.actions_by_admin || {}).slice(0, 3).map(([admin, count]) => (
              <div key={admin} className="stat-item">
                <span>{admin}: {count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="audit-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label>Action Type</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="filter-select"
            >
              <option value="">All Actions</option>
              {filterOptions.actions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Target User</label>
            <select
              value={filters.targetUserId}
              onChange={(e) => handleFilterChange('targetUserId', e.target.value)}
              className="filter-select"
            >
              <option value="">All Users</option>
              {filterOptions.users.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-button">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Loading audit logs...</span>
        </div>
      ) : (
        <>
          {/* Audit Logs Table */}
          <div className="audit-logs-table">
            <div className="table-header">
              <div className="header-cell">Timestamp</div>
              <div className="header-cell">Action</div>
              <div className="header-cell">Admin</div>
              <div className="header-cell">Target User</div>
              <div className="header-cell">Details</div>
            </div>

            {auditLogs.length === 0 ? (
              <div className="no-logs">
                <p>No audit logs found matching the current filters.</p>
              </div>
            ) : (
              <div className="table-body">
                {auditLogs.map((log) => (
                  <div key={log.id} className="table-row">
                    <div className="cell timestamp-cell">
                      {formatTimestamp(log.timestamp)}
                    </div>
                    <div className="cell action-cell">
                      <span className="action-icon">{getActionIcon(log.action)}</span>
                      <span className="action-text">{formatActionLabel(log.action)}</span>
                    </div>
                    <div className="cell admin-cell">
                      <div className="user-info">
                        <span className="user-name">{log.admin_name || 'Unknown'}</span>
                        <span className="user-email">{log.admin_email}</span>
                      </div>
                    </div>
                    <div className="cell target-cell">
                      {log.target_name ? (
                        <div className="user-info">
                          <span className="user-name">{log.target_name}</span>
                          <span className="user-email">{log.target_email}</span>
                        </div>
                      ) : (
                        <span className="no-target">N/A</span>
                      )}
                    </div>
                    <div className="cell details-cell">
                      {renderActionDetails(log.action, log.details)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {filters.offset + 1} - {filters.offset + auditLogs.length} of {statistics.total_actions} entries
            </div>
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="page-number">Page {currentPage}</span>
              <button 
                onClick={() => handlePageChange('next')}
                disabled={!hasMore}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogViewer;

