import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';
import './TimesheetApprovalSystem.css';

const TimesheetApprovalSystem = () => {
  const { user, canApproveTimesheets } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [filters, setFilters] = useState({
    dateRange: 'all',
    employee: 'all',
    sortBy: 'oldest'
  });

  useEffect(() => {
    if (canApproveTimesheets()) {
      fetchPendingApprovals();
    }
  }, [user, filters]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 APPROVALS: Fetching pending approvals...');

      // FIXED: Use direct Supabase query instead of supabaseApi to avoid RLS issues
      const { data: entries, error: fetchError } = await supabaseApi.supabase
        .from('timesheet_entries')
        .select(`
          id,
          user_id,
          date,
          hours_worked,
          total_hours,
          regular_hours,
          description,
          status,
          submitted_at,
          submitted_by,
          created_at,
          users!timesheet_entries_user_id_fkey (
            id,
            full_name,
            email,
            department,
            manager_id
          )
        `)
        .in('status', ['pending', 'submitted'])
        .order('submitted_at', { ascending: filters.sortBy === 'oldest' });

      if (fetchError) {
        console.error('📋 APPROVALS: Fetch error:', fetchError);
        throw new Error(`Failed to fetch pending approvals: ${fetchError.message}`);
      }

      // FIXED: Filter based on user permissions without causing RLS recursion
      let filteredEntries = entries || [];
      
      if (user?.role !== 'admin') {
        // For non-admin users, only show entries from their direct reports
        filteredEntries = filteredEntries.filter(entry => 
          entry.users?.manager_id === user?.id
        );
      }

      // Apply additional filters
      if (filters.employee !== 'all') {
        filteredEntries = filteredEntries.filter(entry => 
          entry.user_id === filters.employee
        );
      }

      if (filters.dateRange !== 'all') {
        const now = new Date();
        let cutoffDate;
        
        switch (filters.dateRange) {
          case 'week':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = null;
        }
        
        if (cutoffDate) {
          filteredEntries = filteredEntries.filter(entry => 
            new Date(entry.date) >= cutoffDate
          );
        }
      }

      setPendingApprovals(filteredEntries);
      console.log('📋 APPROVALS: Fetched entries:', filteredEntries.length);

    } catch (error) {
      console.error('📋 APPROVALS: Fetch pending approvals failed:', error);
      setError(error.message);
      setPendingApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const approveTimesheet = async (entryId) => {
    try {
      // FIXED: Validate UUID format before processing
      if (!entryId || typeof entryId !== 'string' || !isValidUUID(entryId)) {
        throw new Error(`Invalid entry ID format: ${entryId}`);
      }

      setProcessingIds(prev => new Set([...prev, entryId]));
      console.log('✅ APPROVALS: Approving timesheet:', entryId);

      // FIXED: Use the helper function we created
      const { data, error } = await supabaseApi.supabase
        .rpc('approve_timesheet_entry', {
          p_entry_id: entryId,
          p_approved_by: user.id,
          p_notes: 'Approved via admin dashboard'
        });

      if (error) {
        console.error('✅ APPROVALS: Approve error:', error);
        throw new Error(`Failed to approve timesheet: ${error.message}`);
      }

      // Create audit log entry
      try {
        await supabaseApi.supabase
          .rpc('create_audit_log_enhanced', {
            p_acting_admin_id: user.id,
            p_acting_admin_name: user.full_name || user.email,
            p_target_user_id: pendingApprovals.find(entry => entry.id === entryId)?.user_id,
            p_action_type: 'timesheet_approved',
            p_action_description: 'Timesheet entry approved',
            p_affected_table: 'timesheet_entries',
            p_affected_record_id: entryId
          });
      } catch (auditError) {
        console.warn('Audit log creation failed:', auditError);
        // Don't fail the approval if audit logging fails
      }

      // Refresh the list
      await fetchPendingApprovals();
      
      console.log('✅ APPROVALS: Timesheet approved successfully');

    } catch (error) {
      console.error('✅ APPROVALS: Approve timesheet failed:', error);
      setError(`Failed to approve timesheet: ${error.message}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(entryId);
        return newSet;
      });
    }
  };

  const rejectTimesheet = async (entryId, reason) => {
    try {
      // FIXED: Validate UUID format before processing
      if (!entryId || typeof entryId !== 'string' || !isValidUUID(entryId)) {
        throw new Error(`Invalid entry ID format: ${entryId}`);
      }

      if (!reason || reason.trim().length === 0) {
        throw new Error('Rejection reason is required');
      }

      setProcessingIds(prev => new Set([...prev, entryId]));
      console.log('❌ APPROVALS: Rejecting timesheet:', entryId);

      // FIXED: Use the helper function we created
      const { data, error } = await supabaseApi.supabase
        .rpc('reject_timesheet_entry', {
          p_entry_id: entryId,
          p_rejected_by: user.id,
          p_rejection_reason: reason.trim()
        });

      if (error) {
        console.error('❌ APPROVALS: Reject error:', error);
        throw new Error(`Failed to reject timesheet: ${error.message}`);
      }

      // Create audit log entry
      try {
        await supabaseApi.supabase
          .rpc('create_audit_log_enhanced', {
            p_acting_admin_id: user.id,
            p_acting_admin_name: user.full_name || user.email,
            p_target_user_id: pendingApprovals.find(entry => entry.id === entryId)?.user_id,
            p_action_type: 'timesheet_rejected',
            p_action_description: `Timesheet entry rejected: ${reason}`,
            p_affected_table: 'timesheet_entries',
            p_affected_record_id: entryId
          });
      } catch (auditError) {
        console.warn('Audit log creation failed:', auditError);
        // Don't fail the rejection if audit logging fails
      }

      // Refresh the list
      await fetchPendingApprovals();
      
      console.log('❌ APPROVALS: Timesheet rejected successfully');

    } catch (error) {
      console.error('❌ APPROVALS: Reject timesheet failed:', error);
      setError(`Failed to reject timesheet: ${error.message}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(entryId);
        return newSet;
      });
    }
  };

  // FIXED: Add UUID validation function
  const isValidUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours || 0);
    const m = Math.round(((hours || 0) - h) * 60);
    return `${h}h ${m}m`;
  };

  const handleRejectClick = (entryId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && reason.trim()) {
      rejectTimesheet(entryId, reason.trim());
    }
  };

  // Check permissions
  if (!canApproveTimesheets()) {
    return (
      <div className="approval-system">
        <div className="approval-header">
          <h2>Timesheet Approvals</h2>
        </div>
        <div className="approval-error">
          <p>You don't have permission to approve timesheets.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="approval-system">
        <div className="approval-header">
          <h2>Timesheet Approvals</h2>
        </div>
        <div className="approval-loading">
          <div className="loading-spinner"></div>
          <p>Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="approval-system">
        <div className="approval-header">
          <h2>Timesheet Approvals</h2>
        </div>
        <div className="approval-error">
          <p>Error: {error}</p>
          <button onClick={fetchPendingApprovals} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-system">
      <div className="approval-header">
        <h2>Timesheet Approvals</h2>
        <div className="approval-stats">
          <span className="stat-item">
            <strong>{pendingApprovals.length}</strong> pending
          </span>
          <span className="stat-item">
            <strong>{formatHours(pendingApprovals.reduce((sum, entry) => sum + (entry.hours_worked || entry.total_hours || 0), 0))}</strong> total hours
          </span>
        </div>
      </div>

      <div className="approval-filters">
        <select 
          value={filters.dateRange} 
          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          className="filter-select"
        >
          <option value="all">All Time</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
        </select>

        <select 
          value={filters.sortBy} 
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          className="filter-select"
        >
          <option value="oldest">Oldest First</option>
          <option value="newest">Newest First</option>
        </select>

        <button onClick={fetchPendingApprovals} className="refresh-button">
          Refresh
        </button>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="approval-empty">
          <p>No pending approvals found.</p>
        </div>
      ) : (
        <div className="approval-list">
          {pendingApprovals.map((entry) => (
            <div key={entry.id} className="approval-item">
              <div className="approval-info">
                <div className="employee-info">
                  <h4>{entry.users?.full_name || 'Unknown Employee'}</h4>
                  <p className="employee-email">{entry.users?.email}</p>
                  {entry.users?.department && (
                    <p className="employee-department">{entry.users.department}</p>
                  )}
                </div>
                
                <div className="timesheet-details">
                  <p><strong>Date:</strong> {formatDate(entry.date)}</p>
                  <p><strong>Hours:</strong> {formatHours(entry.hours_worked || entry.total_hours)}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${entry.status}`}>{entry.status}</span></p>
                  {entry.description && (
                    <p><strong>Description:</strong> {entry.description}</p>
                  )}
                  <p className="submitted-info">
                    Submitted: {formatDate(entry.submitted_at || entry.created_at)}
                  </p>
                </div>
              </div>

              <div className="approval-actions">
                <button
                  onClick={() => approveTimesheet(entry.id)}
                  disabled={processingIds.has(entry.id)}
                  className="approve-button"
                >
                  {processingIds.has(entry.id) ? 'Approving...' : 'Approve'}
                </button>
                
                <button
                  onClick={() => handleRejectClick(entry.id)}
                  disabled={processingIds.has(entry.id)}
                  className="reject-button"
                >
                  {processingIds.has(entry.id) ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimesheetApprovalSystem;

