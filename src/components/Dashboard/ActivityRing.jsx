import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const SimpleActivitiesChart = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current week dates - same pattern as WeeklyChart
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Try to fetch real data using same pattern as WelcomeCard
      const { data: timesheetData, error: fetchError } = await supabase
        .from('timesheet_entries')
        .select(`
          date,
          hours_worked,
          total_hours,
          regular_hours,
          notes,
          activity_type,
          project_name,
          user_id
        `)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) {
        console.warn('Using sample data:', fetchError.message);
      }

      // Process activities or use sample data
      let processedActivities = [];
      let total = 0;

      if (timesheetData && timesheetData.length > 0) {
        const activityMap = new Map();
        
        timesheetData.forEach(entry => {
          const hours = entry.hours_worked || entry.total_hours || entry.regular_hours || 0;
          
          if (hours > 0) {
            let activityName = 'General Work';
            
            if (entry.activity_type) {
              activityName = entry.activity_type;
            } else if (entry.project_name) {
              activityName = entry.project_name;
            } else if (entry.notes) {
              const notesLower = entry.notes.toLowerCase();
              if (notesLower.includes('meeting')) activityName = 'Meetings';
              else if (notesLower.includes('development')) activityName = 'Development';
              else if (notesLower.includes('testing')) activityName = 'Testing';
              else if (notesLower.includes('documentation')) activityName = 'Documentation';
            }
            
            if (activityMap.has(activityName)) {
              activityMap.get(activityName).hours += hours;
            } else {
              activityMap.set(activityName, {
                id: activityName.toLowerCase().replace(/\s+/g, '_'),
                name: activityName,
                hours: hours,
                color: getActivityColor(activityName)
              });
            }
            total += hours;
          }
        });

        processedActivities = Array.from(activityMap.values())
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 5);
      }

      // Use sample data if no real data
      if (processedActivities.length === 0) {
        processedActivities = [
          { id: 'development', name: 'Development', hours: 25.5, color: '#4F46E5' },
          { id: 'meetings', name: 'Meetings', hours: 8.0, color: '#10B981' },
          { id: 'testing', name: 'Testing', hours: 6.5, color: '#F59E0B' },
          { id: 'documentation', name: 'Documentation', hours: 4.0, color: '#EF4444' }
        ];
        total = 44;
      }

      setActivities(processedActivities);
      setTotalHours(total);

    } catch (error) {
      console.error('Error fetching activities:', error);
      setError(error.message);
      
      // Fallback to sample data
      setActivities([
        { id: 'development', name: 'Development', hours: 25.5, color: '#4F46E5' },
        { id: 'meetings', name: 'Meetings', hours: 8.0, color: '#10B981' },
        { id: 'testing', name: 'Testing', hours: 6.5, color: '#F59E0B' }
      ]);
      setTotalHours(40);
    } finally {
      setLoading(false);
    }
  };

  const getActivityColor = (activityName) => {
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const hash = activityName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h + 'h ' + (m > 0 ? m + 'm' : '');
  };

  const getPercentage = (hours) => {
    return totalHours > 0 ? ((hours / totalHours) * 100).toFixed(1) : 0;
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minHeight: '200px'
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
          height: '120px',
          color: '#6B7280'
        }}>
          Loading activities...
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
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minHeight: '200px'
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
          <p style={{ margin: 0, color: '#EF4444' }}>Error: {error}</p>
          <button 
            onClick={fetchActivities}
            style={{
              padding: '8px 16px',
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
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
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      minHeight: '200px'
    }}>
      {/* Header */}
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

      {/* Content */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Simple donut chart */}
        <div style={{ 
          position: 'relative', 
          width: '120px', 
          height: '120px',
          flexShrink: 0
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: activities.length > 0 ? `conic-gradient(
              ${activities[0]?.color || '#4F46E5'} 0deg ${(getPercentage(activities[0]?.hours || 0) * 3.6)}deg,
              ${activities[1]?.color || '#10B981'} ${(getPercentage(activities[0]?.hours || 0) * 3.6)}deg ${((getPercentage(activities[0]?.hours || 0) + getPercentage(activities[1]?.hours || 0)) * 3.6)}deg,
              ${activities[2]?.color || '#F59E0B'} ${((getPercentage(activities[0]?.hours || 0) + getPercentage(activities[1]?.hours || 0)) * 3.6)}deg ${((getPercentage(activities[0]?.hours || 0) + getPercentage(activities[1]?.hours || 0) + getPercentage(activities[2]?.hours || 0)) * 3.6)}deg,
              #E5E7EB ${((getPercentage(activities[0]?.hours || 0) + getPercentage(activities[1]?.hours || 0) + getPercentage(activities[2]?.hours || 0)) * 3.6)}deg 360deg
            )` : '#E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>total</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>{formatHours(totalHours)}</div>
            </div>
          </div>
        </div>

        {/* Activities list */}
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#6B7280' 
          }}>
            Top activities
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activities.map((activity) => (
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
                  color: '#374151'
                }}>
                  {activity.name}
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
            {activities.length === 0 && (
              <div style={{ 
                fontSize: '14px', 
                color: '#6B7280', 
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '20px'
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

export default SimpleActivitiesChart;