import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const TimesheetApprovalSystem = ({ 
  entryId, 
  currentStatus, 
  onStatusChange, 
  showInline = false,
  entry = null 
}) => {
  const { user, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Check if user can approve/reject this entry
  const canApprove = () => {
    if (!user || !entry) return false;
    
    // Admins can approve any entry
    if (isAdmin()) return true;
    
    // Managers can approve their direct reports' entries
    if (isManager() && entry.users?.manager_id === user.id) return true;
    
    return false;
  };

  const handleApprovalAction = async (action, reason = '') => {
    if (!canApprove()) {
      setError('You do not have permission to approve/reject this timesheet.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log(`📋 APPROVAL: ${action.toUpperCase()} entry ${entryId}`, { reason });

      // Prepare update data
      const updateData = {
        status: action, // 'approved' or 'rejected'
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        approval_reason: reason || null,
        updated_at: new Date().toISOString()
      };

      // Update the timesheet entry
      const { data: updatedEntry, error: updateError } = await supabase
        .from('timesheet_entries')
        .update(updateData)
        .eq('id', entryId)
        .select(`
          *,
          users!inner(
            id,
            full_name,
            email,
            manager_id
          )
        `)
        .single();

      if (updateError) throw updateError;

      console.log(`📋 APPROVAL: ${action.toUpperCase()} successful:`, updatedEntry.id);

      // Log the approval action for audit trail
      await logApprovalAction(entryId, action, reason, updatedEntry);

      // Show success message
      setSuccess(`Timesheet ${action} successfully!`);

      // Notify parent component
      onStatusChange && onStatusChange({
        entryId,
        newStatus: action,
        reason,
        updatedEntry,
        success: true
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (error) {
      console.error(`📋 APPROVAL ${action.toUpperCase()} ERROR:`, error);
      setError(`Failed to ${action} timesheet: ${error.message}`);
      
      // Notify parent component of error
      onStatusChange && onStatusChange({
        entryId,
        newStatus: currentStatus,
        reason,
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
      setShowReasonModal(false);
      setPendingAction(null);
      setRejectionReason('');
    }
  };

  const logApprovalAction = async (entryId, action, reason, updatedEntry) => {
    try {
      // Use the database function to log the action
      const { error: logError } = await supabase
        .rpc('log_admin_action', {
          p_action: `timesheet_${action}`,
          p_target_user_id: updatedEntry.user_id,
          p_timesheet_entry_id: entryId,
          p_details: {
            action,
            reason: reason || null,
            date: updatedEntry.date,
            hours: updatedEntry.hours_worked,
            previous_status: currentStatus,
            new_status: action,
            timestamp: new Date().toISOString()
          }
        });

      if (logError) {
        console.error('📋 AUDIT LOG ERROR:', logError);
        // Don't fail the main operation if audit logging fails
      } else {
        console.log('📋 AUDIT LOG: Approval action logged successfully');
      }
    } catch (error) {
      console.error('📋 AUDIT LOG ERROR:', error);
    }
  };

  const handleApprove = () => {
    handleApprovalAction('approved');
  };

  const handleReject = () => {
    setPendingAction('rejected');
    setShowReasonModal(true);
  };

  const confirmRejection = () => {
    if (pendingAction === 'rejected') {
      handleApprovalAction('rejected', rejectionReason);
    }
  };

  const cancelRejection = () => {
    setShowReasonModal(false);
    setPendingAction(null);
    setRejectionReason('');
  };

  // Don't render if user can't approve
  if (!canApprove()) {
    return null;
  }

  // Don't render if already approved/rejected
  if (currentStatus !== 'pending') {
    return (
      <div className="approval-status">
        <span className={`status-badge ${currentStatus}`}>
          {currentStatus === 'approved' ? '✅ Approved' : '❌ Rejected'}
        </span>
      </div>
    );
  }

  if (showInline) {
    return (
      <div className="inline-approval-system">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <div className="approval-buttons">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="approve-button"
            title="Approve timesheet"
          >
            {loading ? '⏳' : '✅'} Approve
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="reject-button"
            title="Reject timesheet"
          >
            {loading ? '⏳' : '❌'} Reject
          </button>
        </div>

        {/* Rejection Reason Modal */}
        {showReasonModal && (
          <div className="reason-modal-overlay">
            <div className="reason-modal">
              <h4>Rejection Reason</h4>
              <p>Please provide a reason for rejecting this timesheet:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows="3"
                className="reason-textarea"
              />
              <div className="modal-actions">
                <button onClick={cancelRejection} className="cancel-button">
                  Cancel
                </button>
                <button 
                  onClick={confirmRejection} 
                  className="confirm-reject-button"
                  disabled={loading}
                >
                  {loading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="timesheet-approval-system">
      <div className="approval-header">
        <h3>Timesheet Approval</h3>
        <div className="entry-info">
          {entry && (
            <>
              <span className="user-name">{entry.users?.full_name}</span>
              <span className="entry-date">{entry.date}</span>
              <span className="entry-hours">{entry.hours_worked}h</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError(null)} className="dismiss-error">×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {success}
        </div>
      )}

      <div className="approval-actions">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="approve-button large"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Approving...
            </>
          ) : (
            <>
              ✅ Approve Timesheet
            </>
          )}
        </button>

        <button
          onClick={handleReject}
          disabled={loading}
          className="reject-button large"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Rejecting...
            </>
          ) : (
            <>
              ❌ Reject Timesheet
            </>
          )}
        </button>
      </div>

      {/* Rejection Reason Modal */}
      {showReasonModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>Rejection Reason</h4>
              <button onClick={cancelRejection} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for rejecting this timesheet:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter detailed reason for rejection..."
                rows="4"
                className="reason-textarea"
                autoFocus
              />
              <div className="reason-examples">
                <p><strong>Common reasons:</strong></p>
                <ul>
                  <li>Insufficient detail in description</li>
                  <li>Hours seem excessive for the task</li>
                  <li>Missing required project/activity information</li>
                  <li>Time conflicts with other entries</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={cancelRejection} className="cancel-button">
                Cancel
              </button>
              <button 
                onClick={confirmRejection} 
                className="confirm-reject-button"
                disabled={loading || !rejectionReason.trim()}
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Info */}
      <div className="permission-info">
        <small>
          You can approve/reject this timesheet as {isAdmin() ? 'an administrator' : 'the team manager'}.
        </small>
      </div>
    </div>
  );
};

// Bulk Approval Component
export const BulkApprovalSystem = ({ entries, onBulkAction }) => {
  const { user, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleBulkApprove = async () => {
    if (!entries || entries.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📋 BULK APPROVAL: Approving', entries.length, 'entries');

      const updateData = {
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        approval_reason: 'Bulk approval',
        updated_at: new Date().toISOString()
      };

      // Update all entries
      const entryIds = entries.map(entry => entry.id);
      const { error: updateError } = await supabase
        .from('timesheet_entries')
        .update(updateData)
        .in('id', entryIds);

      if (updateError) throw updateError;

      // Log bulk approval action
      for (const entry of entries) {
        await supabase.rpc('log_admin_action', {
          p_action: 'timesheet_bulk_approved',
          p_target_user_id: entry.user_id,
          p_timesheet_entry_id: entry.id,
          p_details: {
            action: 'bulk_approved',
            date: entry.date,
            hours: entry.hours_worked,
            bulk_count: entries.length
          }
        });
      }

      setSuccess(`Successfully approved ${entries.length} timesheets!`);
      onBulkAction && onBulkAction({ action: 'approved', count: entries.length });

    } catch (error) {
      console.error('📋 BULK APPROVAL ERROR:', error);
      setError(`Failed to bulk approve: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-approval-system">
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {success}
        </div>
      )}

      <button
        onClick={handleBulkApprove}
        disabled={loading || !entries || entries.length === 0}
        className="bulk-approve-button"
      >
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            Approving {entries?.length} entries...
          </>
        ) : (
          <>
            ✅ Bulk Approve All ({entries?.length || 0})
          </>
        )}
      </button>
    </div>
  );
};

export default TimesheetApprovalSystem;

