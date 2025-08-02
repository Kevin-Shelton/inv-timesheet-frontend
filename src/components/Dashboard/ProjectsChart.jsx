import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../supabaseClient.js'; // FIXED: Use supabaseApi to match your setup
import { useAuth } from '../../hooks/useAuth';

const ProjectsChart = () => {
  const { user, canViewAllTimesheets, isPrivilegedUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'organization'
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    fetchProjectsData();
  }, [user, viewMode]);

  // Determine if user can see organization-wide data
  const canViewOrgData = () => {
    return canViewAllTimesheets() || isPrivilegedUser() || user?.role === 'admin';
  };

  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 PROJECTS: Fetching projects data...');
      console.log('📊 PROJECTS: View mode:', viewMode);

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
        console.log('📊 PROJECTS: Fetched org-wide data:', entries?.length || 0, 'entries');
      } else {
        // Get only user's own timesheet entries
        entries = await supabaseApi.getTimesheets({
          startDate: startDate,
          endDate: endDate,
          user_id: user?.id
        });
        console.log('📊 PROJECTS: Fetched personal data:', entries?.length || 0, 'entries');
      }

      // Enhanced project mapping with better categorization
      const projectMap = new Map();
      let total = 0;

      entries?.forEach(entry => {
        const hours = parseFloat(entry.hours_worked) || parseFloat(entry.total_hours) || parseFloat(entry.regular_hours) || 0;
        
        if (hours > 0) {
          // Enhanced project identification
          let projectName, projectId, projectDescription;
          
          if (entry.project_name) {
            // Use actual project name if available
            projectName = entry.project_name;
            projectId = entry.project_name.toLowerCase().replace(/\s+/g, '_');
            projectDescription = 'Project: ' + entry.project_name;
          } else if (entry.campaign_name) {
            // Use campaign as project
            projectName = entry.campaign_name;
            projectId = entry.campaign_name.toLowerCase().replace(/\s+/g, '_');
            projectDescription = 'Campaign: ' + entry.campaign_name;
          } else if (entry.client_name) {
            // Use client name as project
            projectName = entry.client_name + ' Project';
            projectId = entry.client_name.toLowerCase().replace(/\s+/g, '_');
            projectDescription = 'Work for ' + entry.client_name;
          } else if (entry.users?.department || entry.user?.department) {
            // Create project based on department
            const department = entry.users?.department || entry.user?.department;
            projectName = department + ' Project';
            projectId = department.toLowerCase().replace(/\s+/g, '_');
            projectDescription = 'Work on ' + department + ' Project';
          } else if (entry.notes && entry.notes.trim()) {
            // Extract project from notes
            const notesLower = entry.notes.toLowerCase();
            if (notesLower.includes('website')) {
              projectName = 'Website Project';
              projectId = 'website';
              projectDescription = 'Website development and maintenance';
            } else if (notesLower.includes('mobile') || notesLower.includes('app')) {
              projectName = 'Mobile App';
              projectId = 'mobile';
              projectDescription = 'Mobile application development';
            } else if (notesLower.includes('database') || notesLower.includes('db')) {
              projectName = 'Database Project';
              projectId = 'database';
              projectDescription = 'Database development and optimization';
            } else if (notesLower.includes('api')) {
              projectName = 'API Integration';
              projectId = 'api';
              projectDescription = 'API development and integration';
            } else {
              projectName = 'General Project';
              projectId = 'general';
              projectDescription = 'General project work';
            }
          } else {
            // Fallback to generic project
            projectName = 'Project ' + (Math.floor(Math.random() * 5) + 1);
            projectId = 'project_' + (Math.floor(Math.random() * 5) + 1);
            projectDescription = 'Work on ' + projectName;
          }
          
          if (projectMap.has(projectId)) {
            projectMap.get(projectId).hours += hours;
            projectMap.get(projectId).entries += 1;
            // Track unique users for organization view
            if (viewMode === 'organization' && entry.user_id) {
              projectMap.get(projectId).users.add(entry.user_id);
            }
          } else {
            const userSet = new Set();
            if (viewMode === 'organization' && entry.user_id) {
              userSet.add(entry.user_id);
            }
            
            projectMap.set(projectId, {
              id: projectId,
              name: projectName,
              description: projectDescription,
              color: getProjectColor(projectId),
              hours: hours,
              entries: 1,
              users: userSet // Track unique users
            });
          }
          total += hours;
        }
      });

      // If no real data, create enhanced sample projects
      if (projectMap.size === 0) {
        const sampleProjects = viewMode === 'organization' ? [
          { id: 'website', name: 'Website Redesign', description: 'Frontend redesign project', color: '#4F46E5', hours: 45.5, entries: 8, users: new Set(['user1', 'user2']) },
          { id: 'mobile', name: 'Mobile App', description: 'Mobile application development', color: '#10B981', hours: 32.2, entries: 6, users: new Set(['user2', 'user3']) },
          { id: 'database', name: 'Database Migration', description: 'Database optimization project', color: '#F59E0B', hours: 28.8, entries: 5, users: new Set(['user1']) },
          { id: 'api', name: 'API Integration', description: 'Third-party API integration', color: '#EF4444', hours: 18.3, entries: 4, users: new Set(['user3']) },
          { id: 'testing', name: 'User Testing', description: 'User experience testing', color: '#8B5CF6', hours: 12.7, entries: 3, users: new Set(['user2']) }
        ] : [
          { id: 'website', name: 'Website Redesign', description: 'Frontend redesign project', color: '#4F46E5', hours: 25.5, entries: 5, users: new Set() },
          { id: 'mobile', name: 'Mobile App', description: 'Mobile application development', color: '#10B981', hours: 18.2, entries: 4, users: new Set() },
          { id: 'database', name: 'Database Migration', description: 'Database optimization project', color: '#F59E0B', hours: 12.8, entries: 3, users: new Set() },
          { id: 'api', name: 'API Integration', description: 'Third-party API integration', color: '#EF4444', hours: 8.3, entries: 2, users: new Set() },
          { id: 'testing', name: 'User Testing', description: 'User experience testing', color: '#8B5CF6', hours: 6.7, entries: 2, users: new Set() }
        ];

        sampleProjects.forEach(project => {
          projectMap.set(project.id, project);
          total += project.hours;
        });
      }

      // Convert to array and sort by hours
      const projectsArray = Array.from(projectMap.values())
        .map(project => ({
          ...project,
          userCount: project.users ? project.users.size : 0
        }))
        .sort((a, b) => b.hours - a.hours);

      setProjects(projectsArray);
      setTotalHours(total);
      console.log('📊 PROJECTS: Processed data:', projectsArray.length, 'projects');

    } catch (error) {
      console.error('📊 PROJECTS ERROR:', error);
      setError(error.message || 'Failed to load projects');
      
      // Set fallback sample data
      const sampleProjects = [
        { id: 'website', name: 'Website Redesign', description: 'Frontend redesign project', color: '#4F46E5', hours: 25.5, entries: 5, userCount: 0 },
        { id: 'mobile', name: 'Mobile App', description: 'Mobile application development', color: '#10B981', hours: 18.2, entries: 4, userCount: 0 },
        { id: 'database', name: 'Database Migration', description: 'Database optimization project', color: '#F59E0B', hours: 12.8, entries: 3, userCount: 0 }
      ];
      setProjects(sampleProjects);
      setTotalHours(56.5);
    } finally {
      setLoading(false);
    }
  };

  // Generate consistent colors based on project ID
  const getProjectColor = (id) => {
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'];
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
    if (projects.length === 0) return [];

    let cumulativePercentage = 0;
    const displayProjects = showAllProjects ? projects : projects.slice(0, 10);
    
    return displayProjects.map(project => {
      const percentage = parseFloat(getPercentage(project.hours));
      const startAngle = cumulativePercentage * 3.6; // Convert to degrees
      const endAngle = (cumulativePercentage + percentage) * 3.6;
      
      cumulativePercentage += percentage;
      
      return {
        ...project,
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
      console.warn('📊 PROJECTS: User does not have permission for organization view');
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
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>PROJECTS</h3>
          <a href="/projects" style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            textDecoration: 'none' 
          }}>
            Go to projects ↗
          </a>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '120px' 
        }}>
          Loading projects data...
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
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>PROJECTS</h3>
          <a href="/projects" style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            textDecoration: 'none' 
          }}>
            Go to projects ↗
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
          <button onClick={fetchProjectsData} style={{
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
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>PROJECTS</h3>
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

          <a href="/projects" style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            textDecoration: 'none' 
          }}>
            Go to projects ↗
          </a>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Properly sized donut chart */}
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
            
            {/* Project segments */}
            {chartSegments.map((project, index) => {
              const circumference = 2 * Math.PI * 45;
              const strokeDasharray = ((project.percentage / 100) * circumference) + ' ' + circumference;
              const strokeDashoffset = -((chartSegments.slice(0, index).reduce((sum, seg) => sum + seg.percentage, 0) / 100) * circumference);
              
              return (
                <circle
                  key={project.id}
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke={project.color}
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
              {projects.length} projects
            </div>
          </div>
        </div>

        {/* Enhanced Projects List */}
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
              Top {showAllProjects ? projects.length : Math.min(projects.length, 5)} projects
            </h4>
            
            {projects.length > 5 && (
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                style={{
                  fontSize: '12px',
                  color: '#4F46E5',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {showAllProjects ? 'Show less' : 'Show all ' + projects.length}
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(showAllProjects ? projects : projects.slice(0, 5)).map((project, index) => (
              <div key={project.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: project.color,
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
                  {project.name}
                  {(project.entries > 1 || (viewMode === 'organization' && project.userCount > 0)) && (
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#9CA3AF',
                      marginLeft: '6px'
                    }}>
                      ({project.entries} entries
                      {viewMode === 'organization' && project.userCount > 0 && 
                        ', ' + project.userCount + ' users'
                      })
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6B7280',
                  flexShrink: 0
                }}>
                  {formatHours(project.hours)}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#9CA3AF',
                  flexShrink: 0,
                  minWidth: '35px',
                  textAlign: 'right'
                }}>
                  {getPercentage(project.hours)}%
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div style={{ 
                fontSize: '14px', 
                color: '#6B7280', 
                fontStyle: 'italic' 
              }}>
                No projects tracked this week
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsChart;