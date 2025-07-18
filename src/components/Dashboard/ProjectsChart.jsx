import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth.jsx';

const ProjectsChart = () => {
  const { user, canViewAllTimesheets } = useAuth();
  const [projectsData, setProjectsData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'list'

  useEffect(() => {
    fetchProjectsData();
  }, [user]);

  const fetchProjectsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📊 PROJECTS: Fetching projects data...');

      // Get current week dates
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = monday.toISOString().split('T')[0];
      const endDate = sunday.toISOString().split('T')[0];

      // First, try to get projects data separately to check if projects table exists
      let projectsMap = new Map();
      
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*');
          
        if (projectsError) {
          console.log('📊 PROJECTS: Projects table not accessible:', projectsError.message);
        } else if (projectsData) {
          projectsData.forEach(project => {
            projectsMap.set(project.id, project);
          });
          console.log('📊 PROJECTS: Found projects:', projectsData.length);
        }
      } catch (projectsErr) {
        console.log('📊 PROJECTS: Projects table error:', projectsErr.message);
      }

      // Try to get timesheet entries with project_id
      let query = supabase
        .from('timesheet_entries')
        .select('project_id, hours_worked, date')
        .gte('date', startDate)
        .lte('date', endDate)
        .not('project_id', 'is', null);

      // Add user filter if not admin
      if (!canViewAllTimesheets) {
        query = query.eq('user_id', user.id);
      }

      const { data: entriesData, error: fetchError } = await query;

      if (fetchError) {
        console.error('📊 PROJECTS ERROR:', fetchError);
        throw new Error(`Failed to fetch timesheet entries: ${fetchError.message}`);
      }

      console.log('📊 PROJECTS: Raw timesheet entries:', entriesData?.length || 0);

      if (!entriesData || entriesData.length === 0) {
        console.log('📊 PROJECTS: No timesheet entries with projects found');
        setProjectsData([]);
        setTotalHours(0);
        return;
      }

      // Process and aggregate project data
      const projectHoursMap = new Map();
      let total = 0;

      entriesData.forEach(entry => {
        if (!entry.project_id || !entry.hours_worked) return;

        const projectId = entry.project_id;
        const hours = parseFloat(entry.hours_worked) || 0;
        total += hours;

        if (projectHoursMap.has(projectId)) {
          projectHoursMap.get(projectId).hours += hours;
        } else {
          // Get project info from our projects map, or create default
          const projectInfo = projectsMap.get(projectId) || {
            id: projectId,
            name: `Project ${projectId}`,
            description: '',
            color: null,
            status: 'active'
          };

          projectHoursMap.set(projectId, {
            id: projectId,
            name: projectInfo.name,
            description: projectInfo.description || '',
            color: projectInfo.color,
            status: projectInfo.status || 'active',
            hours: hours
          });
        }
      });

      // Convert to array and sort by hours
      const projectsArray = Array.from(projectHoursMap.values())
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 10); // Top 10 projects

      // Calculate percentages
      const projectsWithPercentages = projectsArray.map((project, index) => ({
        ...project,
        percentage: total > 0 ? ((project.hours / total) * 100).toFixed(1) : 0,
        color: project.color || getProjectColor(index)
      }));

      setProjectsData(projectsWithPercentages);
      setTotalHours(total);
      console.log('📊 PROJECTS: Processed data:', projectsWithPercentages);

    } catch (error) {
      console.error('📊 PROJECTS ERROR:', error);
      setError(error.message || 'Failed to load projects data');
    } finally {
      setLoading(false);
    }
  };

  const getProjectColor = (index) => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // yellow
      '#ef4444', // red
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#f97316', // orange
      '#84cc16', // lime
      '#ec4899', // pink
      '#6b7280'  // gray
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="projects-chart">
        <div className="projects-header">
          <div>
            <h3 className="projects-title">Projects</h3>
            <p className="projects-subtitle">Loading project data...</p>
          </div>
        </div>
        <div className="projects-loading">
          <div className="projects-loading-spinner"></div>
          Loading projects data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-chart">
        <div className="projects-header">
          <div>
            <h3 className="projects-title">Projects</h3>
            <p className="projects-subtitle">Error loading data</p>
          </div>
        </div>
        <div className="projects-error">
          <div className="chart-error-icon">⚠️</div>
          <div>Unable to load projects data</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            {error.includes('relationship') 
              ? 'Database relationship not configured. Please contact your administrator.'
              : error
            }
          </div>
          <button 
            onClick={fetchProjectsData}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (projectsData.length === 0) {
    return (
      <div className="projects-chart">
        <div className="projects-header">
          <div>
            <h3 className="projects-title">Projects</h3>
            <p className="projects-subtitle">This week's project breakdown</p>
          </div>
        </div>
        <div className="projects-empty">
          <div className="projects-empty-icon">📊</div>
          <div>No project data available</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Start tracking time on projects to see data here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-chart">
      {/* Header */}
      <div className="projects-header">
        <div>
          <h3 className="projects-title">Projects</h3>
          <p className="projects-subtitle">
            {totalHours.toFixed(1)} hours across {projectsData.length} projects this week
          </p>
        </div>
        <div className="projects-view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            📊 Chart
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="projects-content">
        {viewMode === 'chart' ? (
          <div className="projects-chart-view">
            <div className="projects-bars-container">
              {projectsData.map((project, index) => (
                <div key={project.id} className="project-bar-item">
                  <div className="project-info">
                    <div className="project-name" title={project.name}>
                      {project.name}
                    </div>
                    <div className={`project-status ${project.status}`}>
                      {project.status}
                    </div>
                  </div>
                  <div className="project-bar">
                    <div
                      className={`project-bar-fill project-${(index % 5) + 1}`}
                      style={{
                        width: `${project.percentage}%`,
                        backgroundColor: project.color
                      }}
                    />
                  </div>
                  <div className="project-hours">
                    <div className="project-hours-value">
                      {project.hours.toFixed(1)}h
                    </div>
                    <div className="project-hours-percentage">
                      {project.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="projects-list-view">
            {projectsData.map((project, index) => (
              <div key={project.id} className="project-list-item">
                <div className="project-list-info">
                  <div
                    className="project-color-indicator"
                    style={{
                      backgroundColor: project.color
                    }}
                  />
                  <div className="project-details">
                    <div className="project-list-name" title={project.name}>
                      {project.name}
                    </div>
                    {project.description && (
                      <div className="project-description" title={project.description}>
                        {project.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="project-list-stats">
                  <div className="project-list-hours">
                    {project.hours.toFixed(1)}h
                  </div>
                  <div className="project-list-percentage">
                    {project.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsChart;

