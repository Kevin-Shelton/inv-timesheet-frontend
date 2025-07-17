import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const ProjectsChart = () => {
  const { user, canViewAllTimesheets } = useAuth();
  const [projectsData, setProjectsData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Build query based on user permissions
      let query = supabase
        .from('timesheet_entries')
        .select(`
          project_id,
          hours_worked,
          projects!inner(
            id,
            name,
            description,
            color,
            status
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .not('project_id', 'is', null);

      // If user can't view all timesheets, only show their own
      if (!canViewAllTimesheets()) {
        query = query.eq('user_id', user.id);
      }

      const { data: entries, error: fetchError } = await query;

      if (fetchError) {
        console.error('📊 PROJECTS ERROR:', fetchError);
        throw fetchError;
      }

      console.log('📊 PROJECTS: Fetched entries:', entries?.length || 0);

      // Aggregate projects data
      const projectMap = new Map();
      let total = 0;

      entries?.forEach(entry => {
        const hours = parseFloat(entry.hours_worked) || 0;
        const project = entry.projects;
        
        if (project && hours > 0) {
          const projectId = project.id;
          
          if (projectMap.has(projectId)) {
            projectMap.get(projectId).hours += hours;
          } else {
            projectMap.set(projectId, {
              id: projectId,
              name: project.name,
              description: project.description,
              color: project.color || '#82ca9d',
              status: project.status,
              hours: hours
            });
          }
          total += hours;
        }
      });

      // Convert to array and sort by hours
      const projectsArray = Array.from(projectMap.values())
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 10); // Top 10 projects

      setProjectsData(projectsArray);
      setTotalHours(total);
      console.log('📊 PROJECTS: Processed data:', projectsArray);

    } catch (error) {
      console.error('📊 PROJECTS ERROR:', error);
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
    if (projectsData.length === 0) return [];

    let cumulativePercentage = 0;
    return projectsData.map(project => {
      const percentage = parseFloat(getPercentage(project.hours));
      const startAngle = cumulativePercentage * 3.6; // Convert to degrees
      const endAngle = (cumulativePercentage + percentage) * 3.6;
      
      cumulativePercentage += percentage;
      
      return {
        ...project,
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
      <div className="projects-chart">
        <div className="chart-header">
          <h3>PROJECTS</h3>
          <a href="/projects" className="chart-link">Go to projects</a>
        </div>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading projects data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-chart">
        <div className="chart-header">
          <h3>PROJECTS</h3>
          <a href="/projects" className="chart-link">Go to projects</a>
        </div>
        <div className="chart-error">
          <p>Error loading data: {error}</p>
          <button onClick={fetchProjectsData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (projectsData.length === 0) {
    return (
      <div className="projects-chart">
        <div className="chart-header">
          <h3>PROJECTS</h3>
          <a href="/projects" className="chart-link">Go to projects</a>
        </div>
        <div className="chart-empty">
          <div className="empty-donut-chart">
            <div className="donut-center">
              <div className="donut-label">No data</div>
              <div className="donut-value">0h 0m</div>
            </div>
          </div>
          <div className="projects-list">
            <h4>Top 10 projects</h4>
            <p>No projects tracked this week</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-chart">
      <div className="chart-header">
        <h3>PROJECTS</h3>
        <a href="/projects" className="chart-link">Go to projects</a>
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
            
            {/* Project segments */}
            {chartSegments.map((project, index) => (
              <circle
                key={project.id}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={project.color}
                strokeWidth="8"
                strokeDasharray={`${project.percentage * 2.51} 251.2`}
                strokeDashoffset={-project.strokeDashoffset * 2.51}
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

        {/* Projects List */}
        <div className="projects-list">
          <h4>Top 10 projects</h4>
          <div className="projects-items">
            {projectsData.map((project, index) => (
              <div key={project.id} className="project-item">
                <div className="project-info">
                  <div 
                    className="project-color" 
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <div className="project-details">
                    <span className="project-name">{project.name}</span>
                    <span className="project-hours">{formatHours(project.hours)}</span>
                  </div>
                  {project.status && (
                    <span className={`project-status status-${project.status.toLowerCase()}`}>
                      {project.status}
                    </span>
                  )}
                </div>
                <div className="project-percentage">
                  {getPercentage(project.hours)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsChart;

