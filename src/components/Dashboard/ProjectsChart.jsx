import React, { useState, useEffect } from 'react';

const ProjectsChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simplified data that should always render
  const sampleProjects = [
    { id: 'web', name: 'Website Redesign', hours: 25.5, color: '#4F46E5' },
    { id: 'mobile', name: 'Mobile App', hours: 18.2, color: '#10B981' },
    { id: 'db', name: 'Database Migration', hours: 12.8, color: '#F59E0B' }
  ];

  const totalHours = 56.5;

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h + 'h ' + m + 'm';
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
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>PROJECTS</h3>
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
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>PROJECTS</h3>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Error: {error}
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
      {/* Header */}
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

      {/* Content */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Simple chart circle */}
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
            background: 'conic-gradient(#4F46E5 0deg 162deg, #10B981 162deg 278deg, #F59E0B 278deg 360deg)',
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
              <div style={{ fontSize: '12px', color: '#6B7280' }}>clocked</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>{formatHours(totalHours)}</div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#6B7280' 
          }}>
            Top projects
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sampleProjects.map((project) => (
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
                  color: '#374151'
                }}>
                  {project.name}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsChart;