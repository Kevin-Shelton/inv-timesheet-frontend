import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';
import './TimesheetApprovalSystem.css';

const TimesheetApprovalSystem = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 APPROVALS: Fetching pending approvals...');

      // SIMPLIFIED: Use the simple function we created
      const { data, error: fetchError } = await supabaseApi.supabase
        .rpc('get_pending_approvals_simple');

      if (fetchError) {
        console.error('📋 APPROVALS: Fetch error:', fetchError);
        throw new Error(`Failed to fetch pending approvals: ${fetchError.message}`);
      }

      setPendingApprovals(data || []);
      console.log('📋 APPROVALS: Fetched entries:', data?.length || 0);

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
      // SIMPLIFIED: Just validate it's a string, don't worry about UUID format for now
      if (!entryId || typeof entryId !== 'string') {
        throw new Error(`Invalid entry ID: ${entryId}`);
      }

      setProcessingIds(prev => new Set([...prev, entryId]));
      console.log('✅ APPROVALS: Approving timesheet:', entryId);

      // SIMPLIFIED: Use the simple approval function
      const { data, error } = await supabaseApi.supabase
        .rpc('approve_timesheet_entry_simple', {
          p_entry_id: entryId,
          p_approved_by: user.id
        });

      if (error) {
        console.error('✅ APPROVALS: Approve error:', error);
        throw new Error(`Failed to approve timesheet: ${error.message}`);
      }

      if (!data) {
        throw new Error('Timesheet entry not found or could not be approved');
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
      // SIMPLIFIED: Just validate it's a string
      if (!entryId || typeof entryId !== 'string') {
        throw new Error(`Invalid entry ID: ${entryId}`);
      }

      if (!reason || reason.trim().length === 0) {
        throw new Error('Rejection reason is required');
      }

      setProcessingIds(prev => new Set([...prev, entryId]));
      console.log('❌ APPROVALS: Rejecting timesheet:', entryId);

      // SIMPLIFIED: Use the simple rejection function
      const { data, error } = await supabaseApi.supabase
        .rpc('reject_timesheet_entry_simple', {
          p_entry_id: entryId,
          p_rejected_by: user.id,
          p_rejection_reason: reason.trim()
        });

      if (error) {
        console.error('❌ APPROVALS: Reject error:', error);
        throw new Error(`Failed to reject timesheet: ${error.message}`);
      }

      if (!data) {
        throw new Error('Timesheet entry not found or could not be rejected');
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

  // SIMPLIFIED: Basic permission check
  if (!user || !['admin', 'campaign_lead', 'manager'].includes(user.role)) {
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
                  <h4>{entry.user_name || 'Unknown Employee'}</h4>
                  <p className="employee-email">{entry.user_email}</p>
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
                  <p className="entry-id">ID: {entry.id}</p>
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

