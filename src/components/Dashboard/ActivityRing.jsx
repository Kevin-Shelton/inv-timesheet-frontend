import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const ActivitiesChart = () => {
  const { user, canViewAllTimesheets } = useAuth();
  const [activitiesData, setActivitiesData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivitiesData();
  }, [user]);

  const fetchActivitiesData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📊 ACTIVITIES: Fetching activities data...');

      // Get current week dates
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = monday.toISOString().split('T')[0];
      const endDate = sunday.toISOString().split('T')[0];

      // Build query based on user permissions
      let query = supabase
        .from('timesheet_entries')
        .select(`
          activity_id,
          hours_worked,
          activities!inner(
            id,
            name,
            description,
            color
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .not('activity_id', 'is', null);

      // If user can't view all timesheets, only show their own
      if (!canViewAllTimesheets()) {
        query = query.eq('user_id', user.id);
      }

      const { data: entries, error: fetchError } = await query;

      if (fetchError) {
        console.error('📊 ACTIVITIES ERROR:', fetchError);
        throw fetchError;
      }

      console.log('📊 ACTIVITIES: Fetched entries:', entries?.length || 0);

      // Aggregate activities data
      const activityMap = new Map();
      let total = 0;

      entries?.forEach(entry => {
        const hours = parseFloat(entry.hours_worked) || 0;
        const activity = entry.activities;
        
        if (activity && hours > 0) {
          const activityId = activity.id;
          
          if (activityMap.has(activityId)) {
            activityMap.get(activityId).hours += hours;
          } else {
            activityMap.set(activityId, {
              id: activityId,
              name: activity.name,
              description: activity.description,
              color: activity.color || '#8884d8',
              hours: hours
            });
          }
          total += hours;
        }
      });

      // Convert to array and sort by hours
      const activitiesArray = Array.from(activityMap.values())
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 10); // Top 10 activities

      setActivitiesData(activitiesArray);
      setTotalHours(total);
      console.log('📊 ACTIVITIES: Processed data:', activitiesArray);

    } catch (error) {
      console.error('📊 ACTIVITIES ERROR:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getPercentage = (hours) => {
    return totalHours > 0 ? ((hours / totalHours) * 100).toFixed(1) : 0;
  };

  // Generate chart segments for donut chart
  const generateChartSegments = () => {
    if (activitiesData.length === 0) return [];

    let cumulativePercentage = 0;
    return activitiesData.map(activity => {
      const percentage = parseFloat(getPercentage(activity.hours));
      const startAngle = cumulativePercentage * 3.6; // Convert to degrees
      const endAngle = (cumulativePercentage + percentage) * 3.6;
      
      cumulativePercentage += percentage;
      
      return {
        ...activity,
        percentage,
        startAngle,
        endAngle,
        strokeDasharray: `${percentage} ${100 - percentage}`,
        strokeDashoffset: -cumulativePercentage + percentage
      };
    });
  };

  const chartSegments = generateChartSegments();

  if (loading) {
    return (
      <div className="activities-chart">
        <div className="chart-header">
          <h3>ACTIVITIES</h3>
          <a href="/activities" className="chart-link">Go to activities</a>
        </div>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading activities data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activities-chart">
        <div className="chart-header">
          <h3>ACTIVITIES</h3>
          <a href="/activities" className="chart-link">Go to activities</a>
        </div>
        <div className="chart-error">
          <p>Error loading data: {error}</p>
          <button onClick={fetchActivitiesData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (activitiesData.length === 0) {
    return (
      <div className="activities-chart">
        <div className="chart-header">
          <h3>ACTIVITIES</h3>
          <a href="/activities" className="chart-link">Go to activities</a>
        </div>
        <div className="chart-empty">
          <div className="empty-donut-chart">
            <div className="donut-center">
              <div className="donut-label">No data</div>
              <div className="donut-value">0h 0m</div>
            </div>
          </div>
          <div className="activities-list">
            <h4>Top 10 activities</h4>
            <p>No activities tracked this week</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activities-chart">
      <div className="chart-header">
        <h3>ACTIVITIES</h3>
        <a href="/activities" className="chart-link">Go to activities</a>
      </div>

      <div className="chart-content">
        {/* Donut Chart */}
        <div className="donut-chart-container">
          <svg className="donut-chart" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f0f0f0"
              strokeWidth="8"
            />
            
            {/* Activity segments */}
            {chartSegments.map((activity, index) => (
              <circle
                key={activity.id}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={activity.color}
                strokeWidth="8"
                strokeDasharray={`${activity.percentage * 2.51} 251.2`}
                strokeDashoffset={-activity.strokeDashoffset * 2.51}
                transform="rotate(-90 50 50)"
                className="donut-segment"
                style={{
                  transition: 'stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease'
                }}
              />
            ))}
          </svg>
          
          {/* Center content */}
          <div className="donut-center">
            <div className="donut-label">clocked</div>
            <div className="donut-value">{formatHours(totalHours)}</div>
          </div>
        </div>

        {/* Activities List */}
        <div className="activities-list">
          <h4>Top 10 activities</h4>
          <div className="activities-items">
            {activitiesData.map((activity, index) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-info">
                  <div 
                    className="activity-color" 
                    style={{ backgroundColor: activity.color }}
                  ></div>
                  <div className="activity-details">
                    <span className="activity-name">{activity.name}</span>
                    <span className="activity-hours">{formatHours(activity.hours)}</span>
                  </div>
                </div>
                <div className="activity-percentage">
                  {getPercentage(activity.hours)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesChart;

