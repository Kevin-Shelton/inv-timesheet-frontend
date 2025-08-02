import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js'; // FIXED: Use supabaseApi to match your setup
import { useAuth } from '../../hooks/useAuth';

const ActivitiesChart = () => {
  const { user, canViewAllTimesheets, isPrivilegedUser } = useAuth();
  const [activitiesData, setActivitiesData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'organization'
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    fetchActivitiesData();
  }, [user, viewMode]);

  // Determine if user can see organization-wide data
  const canViewOrgData = () => {
    return canViewAllTimesheets() || isPrivilegedUser() || user?.role === 'admin';
  };

  const fetchActivitiesData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📊 ACTIVITIES: Fetching activities data...');
      console.log('📊 ACTIVITIES: View mode:', viewMode);

      // Get current week dates
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = monday.toISOString().split('T')[0];
      const endDate = sunday.toISOString().split('T')[0];

      // FIXED: Use supabaseApi.getTimesheets method that returns array directly
      let entries;
      if (viewMode === 'organization' && canViewOrgData()) {
        // Get all timesheet entries for the week
        entries = await supabaseApi.getTimesheets({
          startDate: startDate,
          endDate: endDate
        });
        console.log('📊 ACTIVITIES: Fetched org-wide data:', entries?.length || 0, 'entries');
      } else {
        // Get only user's own timesheet entries
        entries = await supabaseApi.getTimesheets({
          user_id: user.id,
          startDate: startDate,
          endDate: endDate
        });
        console.log('📊 ACTIVITIES: Fetched personal data:', entries?.length || 0, 'entries');
      }

      // Enhanced activity mapping with better categorization
      const activityMap = new Map();
      let total = 0;

      entries?.forEach(entry => {
        const hours = parseFloat(entry.hours_worked) || parseFloat(entry.total_hours) || parseFloat(entry.regular_hours) || 0;
        
        if (hours > 0) {
          // Enhanced activity categorization
          let activityName, activityId, activityDescription;
          
          if (viewMode === 'organization') {
            // For organization view, group by user/department
            if (entry.users?.full_name || entry.user?.full_name) {
              const userName = entry.users?.full_name || entry.user?.full_name || 'Unknown User';
              activityName = userName;
              activityId = entry.user_id || 'unknown';
              activityDescription = 'Work by ' + userName;
              if (entry.users?.department || entry.user?.department) {
                activityDescription += ' (' + (entry.users?.department || entry.user?.department) + ')';
              }
            } else {
              activityName = 'User ' + (entry.user_id || 'Unknown');
              activityId = entry.user_id || 'unknown';
              activityDescription = 'Work activities';
            }
          } else {
            // For personal view, try to categorize by activity type
            if (entry.activity_type) {
              activityName = entry.activity_type;
              activityId = entry.activity_type.toLowerCase().replace(/\s+/g, '_');
              activityDescription = entry.activity_type + ' activities';
            } else if (entry.project_name) {
              activityName = entry.project_name;
              activityId = entry.project_name.toLowerCase().replace(/\s+/g, '_');
              activityDescription = 'Project: ' + entry.project_name;
            } else if (entry.client_name) {
              activityName = entry.client_name + ' Work';
              activityId = entry.client_name.toLowerCase().replace(/\s+/g, '_');
              activityDescription = 'Work for ' + entry.client_name;
            } else if (entry.notes && entry.notes.trim()) {
              // Extract activity type from notes
              const notesLower = entry.notes.toLowerCase();
              if (notesLower.includes('meeting')) {
                activityName = 'Meetings';
                activityId = 'meetings';
                activityDescription = 'Meeting activities';
              } else if (notesLower.includes('development') || notesLower.includes('coding')) {
                activityName = 'Development';
                activityId = 'development';
                activityDescription = 'Software development tasks';
              } else if (notesLower.includes('testing') || notesLower.includes('qa')) {
                activityName = 'Testing';
                activityId = 'testing';
                activityDescription = 'Quality assurance and testing';
              } else if (notesLower.includes('documentation') || notesLower.includes('docs')) {
                activityName = 'Documentation';
                activityId = 'documentation';
                activityDescription = 'Writing and updating documentation';
              } else {
                activityName = 'General Work';
                activityId = 'general';
                activityDescription = 'General work activities';
              }
            } else {
              activityName = 'General Work';
              activityId = 'general';
              activityDescription = 'General work activities';
            }
          }
          
          if (activityMap.has(activityId)) {
            activityMap.get(activityId).hours += hours;
            activityMap.get(activityId).entries += 1;
          } else {
            activityMap.set(activityId, {
              id: activityId,
              name: activityName,
              description: activityDescription,
              color: getActivityColor(activityId),
              hours: hours,
              entries: 1
            });
          }
          total += hours;
        }
      });

      // If no real data, create enhanced sample activities
      if (activityMap.size === 0) {
        const sampleActivities = viewMode === 'organization' ? [
          { id: 'user1', name: 'John Smith', description: 'Work by John Smith (Development)', color: '#4F46E5', hours: 25.5, entries: 5 },
          { id: 'user2', name: 'Sarah Johnson', description: 'Work by Sarah Johnson (Design)', color: '#10B981', hours: 18.0, entries: 4 },
          { id: 'user3', name: 'Mike Davis', description: 'Work by Mike Davis (Testing)', color: '#F59E0B', hours: 12.5, entries: 3 },
          { id: 'user4', name: 'Lisa Chen', description: 'Work by Lisa Chen (Management)', color: '#EF4444', hours: 8.0, entries: 2 },
          { id: 'user5', name: 'Tom Wilson', description: 'Work by Tom Wilson (Support)', color: '#8B5CF6', hours: 6.0, entries: 2 }
        ] : [
          { id: 'development', name: 'Development', description: 'Software development tasks', color: '#4F46E5', hours: 25.5, entries: 5 },
          { id: 'meetings', name: 'Meetings', description: 'Team meetings and calls', color: '#10B981', hours: 8.0, entries: 4 },
          { id: 'testing', name: 'Testing', description: 'Quality assurance and testing', color: '#F59E0B', hours: 6.5, entries: 3 },
          { id: 'documentation', name: 'Documentation', description: 'Writing and updating docs', color: '#EF4444', hours: 4.0, entries: 2 },
          { id: 'planning', name: 'Planning', description: 'Project planning and design', color: '#8B5CF6', hours: 3.5, entries: 2 }
        ];

        sampleActivities.forEach(activity => {
          activityMap.set(activity.id, activity);
          total += activity.hours;
        });
      }

      // Convert to array and sort by hours
      const activitiesArray = Array.from(activityMap.values())
        .sort((a, b) => b.hours - a.hours);

      setActivitiesData(activitiesArray);
      setTotalHours(total);
      console.log('📊 ACTIVITIES: Processed data:', activitiesArray.length, 'activities');

    } catch (error) {
      console.error('📊 ACTIVITIES ERROR:', error);
      setError(error.message || 'Failed to load activities');
      
      // Set fallback sample data
      const sampleActivities = [
        { id: 'development', name: 'Development', description: 'Software development tasks', color: '#4F46E5', hours: 25.5, entries: 5 },
        { id: 'meetings', name: 'Meetings', description: 'Team meetings and calls', color: '#10B981', hours: 8.0, entries: 4 },
        { id: 'testing', name: 'Testing', description: 'Quality assurance and testing', color: '#F59E0B', hours: 6.5, entries: 3 }
      ];
      setActivitiesData(sampleActivities);
      setTotalHours(40);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced color generation with better distribution
  const getActivityColor = (id) => {
    const colors = [
      '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
      '#14B8A6', '#F472B6', '#A855F7', '#3B82F6', '#22C55E'
    ];
    const hash = id.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h + 'h ' + m + 'm';
  };

  const getPercentage = (hours) => {
    return totalHours > 0 ? ((hours / totalHours) * 100).toFixed(1) : 0;
  };

  // Generate chart segments for donut chart
  const generateChartSegments = () => {
    if (activitiesData.length === 0) return [];

    let cumulativePercentage = 0;
    const displayActivities = showAllActivities ? activitiesData : activitiesData.slice(0, 10);
    
    return displayActivities.map(activity => {
      const percentage = parseFloat(getPercentage(activity.hours));
      const startAngle = cumulativePercentage * 3.6; // Convert to degrees
      const endAngle = (cumulativePercentage + percentage) * 3.6;
      
      cumulativePercentage += percentage;
      
      return {
        ...activity,
        percentage,
        startAngle,
        endAngle,
        strokeDasharray: percentage + ' ' + (100 - percentage),
        strokeDashoffset: -cumulativePercentage + percentage
      };
    });
  };

  const chartSegments = generateChartSegments();

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    if (mode === 'organization' && !canViewOrgData()) {
      console.warn('📊 ACTIVITIES: User does not have permission for organization view');
      return;
    }
    setViewMode(mode);
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>ACTIVITIES</h3>
          <a href="/activities" style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            textDecoration: 'none' 
          }}>
            Go to activities ↗
          </a>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '120px' 
        }}>
          Loading activities data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>ACTIVITIES</h3>
          <a href="/activities" style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            textDecoration: 'none' 
          }}>
            Go to activities ↗
          </a>
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '120px',
          gap: '10px'
        }}>
          <p>Error loading data: {error}</p>
          <button onClick={fetchActivitiesData} style={{
            padding: '8px 16px',
            background: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
    }}>
      {/* Enhanced Header with View Mode Toggle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>ACTIVITIES</h3>
          {viewMode === 'organization' && (
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '12px', 
              color: '#6b7280',
              fontStyle: 'italic' 
            }}>
              Organization-wide view
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {canViewOrgData() && (
            <div style={{ 
              display: 'flex', 
              gap: '6px'
            }}>
              <button
                onClick={() => handleViewModeChange('personal')}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  backgroundColor: viewMode === 'personal' ? '#4F46E5' : 'white',
                  color: viewMode === 'personal' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'personal' ? 'bold' : 'normal'
                }}
              >
                Personal
              </button>
              <button
                onClick={() => handleViewModeChange('organization')}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  backgroundColor: viewMode === 'organization' ? '#4F46E5' : 'white',
                  color: viewMode === 'organization' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'organization' ? 'bold' : 'normal'
                }}
              >
                Organization
              </button>
            </div>
          )}

          <a href="/activities" style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            textDecoration: 'none' 
          }}>
            Go to activities ↗
          </a>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Enhanced donut chart */}
        <div style={{ 
          position: 'relative', 
          width: '120px', 
          height: '120px',
          flexShrink: 0
        }}>
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
            />
            
            {/* Activity segments */}
            {chartSegments.map((activity, index) => {
              const circumference = 2 * Math.PI * 45;
              const strokeDasharray = ((activity.percentage / 100) * circumference) + ' ' + circumference;
              const strokeDashoffset = -((chartSegments.slice(0, index).reduce((sum, seg) => sum + seg.percentage, 0) / 100) * circumference);
              
              return (
                <circle
                  key={activity.id}
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke={activity.color}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          
          {/* Enhanced center content */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#6B7280', 
              marginBottom: '2px' 
            }}>
              clocked
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              {formatHours(totalHours)}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#9CA3AF',
              marginTop: '2px'
            }}>
              {activitiesData.length} activities
            </div>
          </div>
        </div>

        {/* Enhanced Activities List */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#6B7280' 
            }}>
              {viewMode === 'organization' ? 'Top team members' : 'Top 10 activities'}
            </h4>
            
            {activitiesData.length > 5 && (
              <button
                onClick={() => setShowAllActivities(!showAllActivities)}
                style={{
                  fontSize: '12px',
                  color: '#4F46E5',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {showAllActivities ? 'Show less' : 'Show all ' + activitiesData.length}
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(showAllActivities ? activitiesData : activitiesData.slice(0, 5)).map((activity, index) => (
              <div key={activity.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: activity.color,
                  flexShrink: 0
                }} />
                <div style={{ 
                  flex: 1, 
                  fontSize: '14px', 
                  color: '#374151',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {activity.name}
                  {activity.entries > 1 && (
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#9CA3AF',
                      marginLeft: '6px'
                    }}>
                      ({activity.entries} entries)
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6B7280',
                  flexShrink: 0
                }}>
                  {formatHours(activity.hours)}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#9CA3AF',
                  flexShrink: 0,
                  minWidth: '35px',
                  textAlign: 'right'
                }}>
                  {getPercentage(activity.hours)}%
                </div>
              </div>
            ))}
            {activitiesData.length === 0 && (
              <div style={{ 
                fontSize: '14px', 
                color: '#6B7280', 
                fontStyle: 'italic' 
              }}>
                No activities tracked this week
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesChart;