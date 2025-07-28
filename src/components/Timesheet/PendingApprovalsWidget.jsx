import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const PendingApprovalsWidget = ({ onApprovalAction }) => {
  const { user, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingData, setPendingData] = useState({
    totalPending: 0,
    totalHours: 0,
    byStatus: {},
    recentEntries: [],
    byUser: {}
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user && (isAdmin() || isManager())) {
      fetchPendingApprovals();
    }
  }, [user]);

  const fetchPendingApprovals = async () => {
    if (!user || (!isAdmin() && !isManager())) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📋 PENDING APPROVALS: Fetching data for role:', user.role);

      let query = supabase
        .from('timesheet_entries')
        .select(`
          id,
          user_id,
          date,
          hours_worked,
          status,
          created_at,
          created_by_admin,
          admin_user_id,
          users!inner(
            id,
            full_name,
            email,
            department,
            manager_id
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (isAdmin()) {
        console.log('📋 PENDING APPROVALS: Admin view - all pending entries');
        // Admins see all pending entries
      } else if (isManager()) {
        console.log('📋 PENDING APPROVALS: Manager view - team pending entries');
        // Managers see their direct reports' pending entries + their own
        query = query.or(`user_id.eq.${user.id},users.manager_id.eq.${user.id}`);
      }

      const { data: pendingEntries, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      console.log('📋 PENDING APPROVALS: Fetched entries:', pendingEntries?.length);

      if (!pendingEntries || pendingEntries.length === 0) {
        setPendingData({
          totalPending: 0,
          totalHours: 0,
          byStatus: {},
          recentEntries: [],
          byUser: {}
        });
        return;
      }

      // Calculate statistics
      const totalPending = pendingEntries.length;
      const totalHours = pendingEntries.reduce((sum, entry) => 
        sum + (parseFloat(entry.hours_worked) || 0), 0);

      // Group by status (should all be pending, but good for future expansion)
      const byStatus = pendingEntries.reduce((acc, entry) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1;
        return acc;
      }, {});

      // Group by user for summary
      const byUser = pendingEntries.reduce((acc, entry) => {
        const userId = entry.user_id;
        const userName = entry.users?.full_name || 'Unknown User';
        
        if (!acc[userId]) {
          acc[userId] = {
            name: userName,
            email: entry.users?.email,
            department: entry.users?.department,
            count: 0,
            hours: 0,
            entries: []
          };
        }
        
        acc[userId].count += 1;
        acc[userId].hours += parseFloat(entry.hours_worked) || 0;
        acc[userId].entries.push(entry);
        
        return acc;
      }, {});

      // Get recent entries (last 10)
      const recentEntries = pendingEntries.slice(0, 10);

      const newPendingData = {
        totalPending,
        totalHours,
        byStatus,
        recentEntries,
        byUser
      };

      setPendingData(newPendingData);
      console.log('📋 PENDING APPROVALS: Data processed:', newPendingData);

    } catch (error) {
      console.error('📋 PENDING APPROVALS ERROR:', error);
      setError(`Failed to load pending approvals: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (entryId, action, reason = '') => {
    try {
      console.log(`📋 PENDING APPROVALS: ${action.toUpperCase()} entry:`, entryId);

      const updateData = {
        status: action, // 'approved' or 'rejected'
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        approval_reason: reason || null,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('timesheet_entries')
        .update(updateData)
        .eq('id', entryId);

      if (updateError) throw updateError;

      // Log the approval action for audit
      await logApprovalAction(entryId, action, reason);

      // Refresh the pending approvals data
      await fetchPendingApprovals();

      // Notify parent component
      onApprovalAction && onApprovalAction({
        entryId,
        action,
        reason,
        success: true
      });

      console.log(`📋 PENDING APPROVALS: ${action.toUpperCase()} successful`);

    } catch (error) {
      console.error(`📋 PENDING APPROVALS ${action.toUpperCase()} ERROR:`, error);
      
      // Notify parent component of error
      onApprovalAction && onApprovalAction({
        entryId,
        action,
        reason,
        success: false,
        error: error.message
      });
    }
  };

  const logApprovalAction = async (entryId, action, reason) => {
    try {
      const auditEntry = {
        admin_user_id: user.id,
        action: `timesheet_${action}`,
        timesheet_entry_id: entryId,
        details: {
          action,
          reason: reason || null,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      const { error: auditError } = await supabase
        .from('admin_audit_log')
        .insert([auditEntry]);

      if (auditError) {
        console.error('📋 AUDIT LOG ERROR:', auditError);
        // Don't fail the main operation if audit logging fails
      } else {
        console.log('📋 AUDIT LOG: Approval action logged');
      }
    } catch (error) {
      console.error('📋 AUDIT LOG ERROR:', error);
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUrgencyClass = (createdAt) => {
    const daysSinceCreated = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated > 7) return 'urgent';
    if (daysSinceCreated > 3) return 'warning';
    return 'normal';
  };

  if (!user || (!isAdmin() && !isManager())) {
    return null; // Don't show for regular employees
  }

  if (loading) {
    return (
      <div className="pending-approvals-widget">
        <div className="widget-header">
          <h3>Pending Approvals</h3>
        </div>
        <div className="widget-loading">
          <div className="loading-spinner"></div>
          <span>Loading pending approvals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-approvals-widget">
        <div className="widget-header">
          <h3>Pending Approvals</h3>
        </div>
        <div className="widget-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchPendingApprovals} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-approvals-widget">
      <div className="widget-header">
        <h3>Pending Approvals</h3>
        <div className="header-actions">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="expand-button"
          >
            {expanded ? '▼' : '▶'}
          </button>
          <button onClick={fetchPendingApprovals} className="refresh-button">
            🔄
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="approval-summary">
        <div className="summary-stat">
          <span className="stat-number">{pendingData.totalPending}</span>
          <span className="stat-label">Pending Entries</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">{formatHours(pendingData.totalHours)}</span>
          <span className="stat-label">Total Hours</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">{Object.keys(pendingData.byUser).length}</span>
          <span className="stat-label">Team Members</span>
        </div>
      </div>

      {pendingData.totalPending === 0 ? (
        <div className="no-pending">
          <div className="no-pending-icon">✅</div>
          <p>No pending approvals</p>
          <small>All timesheets are up to date!</small>
        </div>
      ) : (
        <>
          {/* User Summary */}
          {!expanded && Object.keys(pendingData.byUser).length > 0 && (
            <div className="user-summary">
              <h4>By Team Member:</h4>
              <div className="user-summary-list">
                {Object.entries(pendingData.byUser).slice(0, 5).map(([userId, userData]) => (
                  <div key={userId} className="user-summary-item">
                    <div className="user-info">
                      <span className="user-name">{userData.name}</span>
                      <span className="user-department">{userData.department}</span>
                    </div>
                    <div className="user-stats">
                      <span className="entry-count">{userData.count} entries</span>
                      <span className="hours-total">{formatHours(userData.hours)}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(pendingData.byUser).length > 5 && (
                  <div className="more-users">
                    +{Object.keys(pendingData.byUser).length - 5} more users
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expanded View */}
          {expanded && (
            <div className="expanded-approvals">
              <h4>Recent Pending Entries:</h4>
              <div className="pending-entries-list">
                {pendingData.recentEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`pending-entry ${getUrgencyClass(entry.created_at)}`}
                  >
                    <div className="entry-info">
                      <div className="entry-header">
                        <span className="user-name">{entry.users?.full_name}</span>
                        <span className="entry-date">{formatDate(entry.date)}</span>
                        <span className="entry-hours">{formatHours(entry.hours_worked)}</span>
                      </div>
                      <div className="entry-details">
                        <span className="department">{entry.users?.department}</span>
                        {entry.created_by_admin && (
                          <span className="admin-created">Admin Created</span>
                        )}
                        <span className="created-date">
                          Submitted {formatDate(entry.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="entry-actions">
                      <button 
                        onClick={() => handleApprovalAction(entry.id, 'approved')}
                        className="approve-button"
                        title="Approve"
                      >
                        ✓
                      </button>
                      <button 
                        onClick={() => {
                          const reason = prompt('Reason for rejection (optional):');
                          if (reason !== null) { // User didn't cancel
                            handleApprovalAction(entry.id, 'rejected', reason);
                          }
                        }}
                        className="reject-button"
                        title="Reject"
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="view-all-button"
            >
              {expanded ? 'Show Less' : 'View All Pending'}
            </button>
            {pendingData.totalPending > 0 && (
              <button 
                onClick={() => {
                  if (confirm(`Approve all ${pendingData.totalPending} pending entries?`)) {
                    // Bulk approve functionality could be added here
                    console.log('Bulk approve requested');
                  }
                }}
                className="bulk-approve-button"
              >
                Bulk Approve All
              </button>
            )}
          </div>
        </>
      )}

      {/* Widget Footer */}
      <div className="widget-footer">
        <small>
          Showing {isAdmin() ? 'organization' : 'team'} pending approvals
          • Last updated: {new Date().toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};

export default PendingApprovalsWidget;

