import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const PendingApprovalsWidget = () => {
  const { user, canApproveTimesheets } = useAuth();
  const [approvalStats, setApprovalStats] = useState({
    totalPending: 0,
    totalHours: 0,
    oldestSubmission: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (canApproveTimesheets()) {
      fetchApprovalStats();
      // Refresh every 30 seconds
      const interval = setInterval(fetchApprovalStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchApprovalStats = async () => {
    try {
      setError(null);
      console.log('📊 PENDING APPROVALS: Fetching stats...');

      // FIXED: Use direct query instead of RPC to avoid recursion issues
      const { data: entries, error: fetchError } = await supabaseApi.supabase
        .from('timesheet_entries')
        .select(`
          id,
          user_id,
          hours_worked,
          total_hours,
          submitted_at,
          created_at,
          status,
          users!timesheet_entries_user_id_fkey (
            id,
            manager_id,
            role
          )
        `)
        .in('status', ['pending', 'submitted']);

      if (fetchError) {
        console.error('📊 PENDING APPROVALS: Fetch error:', fetchError);
        throw new Error(`Failed to fetch approval stats: ${fetchError.message}`);
      }

      // FIXED: Filter based on user permissions without causing RLS recursion
      let filteredEntries = entries || [];
      
      if (user?.role !== 'admin') {
        // For non-admin users, only show entries from their direct reports
        filteredEntries = filteredEntries.filter(entry => 
          entry.users?.manager_id === user?.id
        );
      }

      // Calculate statistics
      const totalPending = filteredEntries.length;
      const totalHours = filteredEntries.reduce((sum, entry) => {
        return sum + (entry.hours_worked || entry.total_hours || 0);
      }, 0);

      // Find oldest submission
      const oldestSubmission = filteredEntries.length > 0 
        ? filteredEntries.reduce((oldest, entry) => {
            const submissionDate = new Date(entry.submitted_at || entry.created_at);
            return !oldest || submissionDate < oldest ? submissionDate : oldest;
          }, null)
        : null;

      setApprovalStats({
        totalPending,
        totalHours,
        oldestSubmission
      });

      console.log('📊 PENDING APPROVALS: Stats updated:', { totalPending, totalHours });

    } catch (error) {
      console.error('📊 PENDING APPROVALS: Failed to fetch stats:', error);
      setError(error.message);
      setApprovalStats({
        totalPending: 0,
        totalHours: 0,
        oldestSubmission: null
      });
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours || 0);
    const m = Math.round(((hours || 0) - h) * 60);
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`;
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'N/A';
    
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Don't show widget if user can't approve timesheets
  if (!canApproveTimesheets()) {
    return null;
  }

  if (loading) {
    return (
      <div className="pending-approvals-widget">
        <div className="widget-header">
          <h3>Pending Approvals</h3>
        </div>
        <div className="widget-content">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
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
        <div className="widget-content error">
          <p>Error loading approvals</p>
          <button onClick={fetchApprovalStats} className="retry-button">
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
        <button onClick={fetchApprovalStats} className="refresh-button" title="Refresh">
          🔄
        </button>
      </div>
      
      <div className="widget-content">
        {approvalStats.totalPending === 0 ? (
          <div className="no-approvals">
            <p>✅ No pending approvals</p>
          </div>
        ) : (
          <div className="approval-stats">
            <div className="stat-item primary">
              <div className="stat-number">{approvalStats.totalPending}</div>
              <div className="stat-label">
                {approvalStats.totalPending === 1 ? 'Entry' : 'Entries'} Pending
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-number">{formatHours(approvalStats.totalHours)}</div>
              <div className="stat-label">Total Hours</div>
            </div>
            
            {approvalStats.oldestSubmission && (
              <div className="stat-item">
                <div className="stat-number">{formatTimeAgo(approvalStats.oldestSubmission)}</div>
                <div className="stat-label">Oldest Pending</div>
              </div>
            )}
          </div>
        )}
        
        {approvalStats.totalPending > 0 && (
          <div className="widget-actions">
            <button 
              onClick={() => {
                // This would typically navigate to the approval system
                // For now, just refresh the data
                fetchApprovalStats();
              }}
              className="view-approvals-button"
            >
              View All Approvals
            </button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .pending-approvals-widget {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .widget-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #495057;
        }
        
        .refresh-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .refresh-button:hover {
          background: #e9ecef;
        }
        
        .widget-content {
          padding: 20px;
        }
        
        .widget-content.error {
          text-align: center;
          color: #dc3545;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .no-approvals {
          text-align: center;
          color: #28a745;
          font-weight: 500;
        }
        
        .approval-stats {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .stat-item {
          text-align: center;
          padding: 12px;
          border-radius: 6px;
          background: #f8f9fa;
        }
        
        .stat-item.primary {
          background: #e3f2fd;
          border: 1px solid #bbdefb;
        }
        
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #495057;
          margin-bottom: 4px;
        }
        
        .stat-item.primary .stat-number {
          color: #1976d2;
        }
        
        .stat-label {
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .widget-actions {
          margin-top: 16px;
          text-align: center;
        }
        
        .view-approvals-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .view-approvals-button:hover {
          background: #0056b3;
        }
        
        .retry-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 8px;
        }
        
        .retry-button:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
};

export default PendingApprovalsWidget;

