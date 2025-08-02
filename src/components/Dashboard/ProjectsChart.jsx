import React from 'react';

const ProjectsChart = () => {
  // Fixed data - no state changes that could cause re-render issues
  const sampleProjects = [
    { id: 'web', name: 'Website Redesign', hours: 25.5, color: '#4F46E5' },
    { id: 'mobile', name: 'Mobile App', hours: 18.2, color: '#10B981' },
    { id: 'db', name: 'Database Migration', hours: 12.8, color: '#F59E0B' },
    { id: 'api', name: 'API Integration', hours: 8.3, color: '#EF4444' },
    { id: 'testing', name: 'User Testing', hours: 6.7, color: '#8B5CF6' }
  ];

  const totalHours = 71.5;

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h + 'h ' + (m > 0 ? m + 'm' : '');
  };

  const getPercentage = (hours) => {
    return totalHours > 0 ? ((hours / totalHours) * 100).toFixed(1) : 0;
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      minHeight: '200px'
    }}>
      {/* Simple Header - NO INTERACTIVE ELEMENTS */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>PROJECTS</h3>
        <span style={{ 
          fontSize: '14px', 
          color: '#6B7280'
        }}>
          Go to projects ↗
        </span>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Enhanced donut chart using SVG */}
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
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="12"
              strokeDasharray="128 283"
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#10B981"
              strokeWidth="12"
              strokeDasharray="92 283"
              strokeDashoffset="-128"
              strokeLinecap="round"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="12"
              strokeDasharray="64 283"
              strokeDashoffset="-220"
              strokeLinecap="round"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#EF4444"
              strokeWidth="12"
              strokeDasharray="42 283"
              strokeDashoffset="-284"
              strokeLinecap="round"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="12"
              strokeDasharray="34 283"
              strokeDashoffset="-326"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center content */}
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
              {sampleProjects.length} projects
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
            Top 5 projects
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
                  color: '#374151',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
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