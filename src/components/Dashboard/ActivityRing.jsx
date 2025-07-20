// Fixed ActivityRing Component - Uses supabaseApi instead of direct supabase
// Replace your existing src/components/Dashboard/ActivityRing.jsx with this file

import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js';

const ActivityRing = ({ user }) => {
  const [activityData, setActivityData] = useState({
    hoursWorked: 0,
    targetHours: 40,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivityData();
  }, [user]);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 ActivityRing: Fetching activity data for user:', user?.id);
      
      if (!user?.id) {
        console.log('🎯 ActivityRing: No user ID, using sample data');
        setSampleData();
        return;
      }
      
      // Calculate current week date range
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];
      
      // Use corrected supabaseApi function
      const timesheetData = await supabaseApi.getTimesheets({
        user_id: user.id,
        startDate: startDate,
        endDate: endDate
      });
      
      console.log('🎯 ActivityRing: Received timesheet data:', timesheetData?.length || 0, 'entries');
      
      if (!timesheetData || timesheetData.length === 0) {
        console.log('🎯 ActivityRing: No timesheet data found, using sample data');
        setSampleData();
        return;
      }
      
      // Calculate total hours worked this week
      const totalHours = timesheetData.reduce((sum, entry) => {
        const hours = parseFloat(entry.hours_worked || entry.total_hours || entry.regular_hours || 0);
        return sum + hours;
      }, 0);
      
      // Get target hours (default to 40 for full-time, 20 for part-time)
      const targetHours = user?.employment_type === 'part_time' ? 20 : 40;
      const completionPercentage = Math.min((totalHours / targetHours) * 100, 100);
      
      setActivityData({
        hoursWorked: totalHours,
        targetHours: targetHours,
        completionPercentage: completionPercentage
      });
      
      console.log('🎯 ActivityRing: Processed activity data:', {
        hoursWorked: totalHours,
        targetHours: targetHours,
        completionPercentage: completionPercentage
      });
      
    } catch (error) {
      console.error('🎯 ActivityRing: Error fetching activity data:', error);
      setError(error.message || 'Failed to load activity data');
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    const sampleHours = 32;
    const targetHours = 40;
    setActivityData({
      hoursWorked: sampleHours,
      targetHours: targetHours,
      completionPercentage: (sampleHours / targetHours) * 100
    });
  };

  const getStatusColor = () => {
    if (activityData.completionPercentage >= 100) return '#4CAF50'; // Green
    if (activityData.completionPercentage >= 80) return '#FF9800';  // Orange
    return '#2196F3'; // Blue
  };

  const getStatusText = () => {
    if (activityData.completionPercentage >= 100) return 'Target Reached!';
    if (activityData.completionPercentage >= 80) return 'Almost There';
    return 'In Progress';
  };

  if (loading) {
    return (
      <div className="activity-ring">
        <div className="activity-header">
          <h3>Weekly Progress</h3>
        </div>
        <div className="activity-loading">
          <div className="loading-spinner"></div>
          <p>Loading activity...</p>
        </div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (activityData.completionPercentage / 100) * circumference;

  return (
    <div className="activity-ring">
      <div className="activity-header">
        <h3>Weekly Progress</h3>
        {error && (
          <div className="activity-error">
            <small>Using sample data</small>
          </div>
        )}
      </div>
      
      <div className="ring-container">
        <svg className="progress-ring" width="120" height="120">
          {/* Background circle */}
          <circle
            className="progress-ring-background"
            stroke="#e0e0e0"
            strokeWidth="8"
            fill="transparent"
            r="45"
            cx="60"
            cy="60"
          />
          {/* Progress circle */}
          <circle
            className="progress-ring-progress"
            stroke={getStatusColor()}
            strokeWidth="8"
            fill="transparent"
            r="45"
            cx="60"
            cy="60"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        
        <div className="ring-content">
          <div className="hours-worked">
            {activityData.hoursWorked.toFixed(1)}h
          </div>
          <div className="target-hours">
            of {activityData.targetHours}h
          </div>
          <div className="completion-percentage">
            {activityData.completionPercentage.toFixed(0)}%
          </div>
        </div>
      </div>
      
      <div className="activity-status">
        <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}></div>
        <span className="status-text">{getStatusText()}</span>
      </div>
      
      <div className="activity-details">
        <div className="detail-item">
          <span className="detail-label">Remaining:</span>
          <span className="detail-value">
            {Math.max(0, activityData.targetHours - activityData.hoursWorked).toFixed(1)}h
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Daily Avg:</span>
          <span className="detail-value">
            {(activityData.hoursWorked / 7).toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityRing;

