import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [trackedHours, setTrackedHours] = useState({
    worked: '0h 0m',
    breaks: '0h 0m',
    overtime: '0h 0m'
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sample data for the chart (7 days)
  const weeklyData = [
    { day: 'M', worked: 8, overtime: 0 },
    { day: 'T', worked: 7.5, overtime: 0.5 },
    { day: 'W', worked: 8, overtime: 1 },
    { day: 'T', worked: 8, overtime: 0 },
    { day: 'F', worked: 7, overtime: 0 },
    { day: 'S', worked: 6, overtime: 0 },
    { day: 'S', worked: 0, overtime: 0 }
  ];

  const maxHours = 10; // Maximum hours for chart scaling

  // Sample members data for Who's in/out section
  const membersData = [
    { name: 'John Doe', status: 'out', time: '5:30 PM' },
    { name: 'Jane Smith', status: 'in', time: '9:00 AM' },
    { name: 'Mike Johnson', status: 'break', time: '2:15 PM' },
    { name: 'Sarah Wilson', status: 'out', time: '6:00 PM' },
    { name: 'David Brown', status: 'in', time: '8:45 AM' },
    { name: 'Lisa Davis', status: 'out', time: '5:45 PM' },
    { name: 'Tom Anderson', status: 'break', time: '1:30 PM' },
    { name: 'Emily Taylor', status: 'in', time: '9:15 AM' }
  ];

  return (
    <div className="dashboard-reference-layout">
      {/* Header Section - Two Columns */}
      <div className="dashboard-header-section">
        {/* Hello Kevin Section */}
        <div className="hello-section-improved">
          <div className="hello-text-content">
            <h1 className="hello-main-title">Hello Kevin</h1>
            <p className="hello-company-subtitle">
              Here's what's happening at<br />
              <span className="company-name">Egis</span>
            </p>
            <div className="jibble-logo-container">
              <div className="jibble-logo-orange">
                <span className="jibble-sigma">Σ</span>
              </div>
            </div>
          </div>
          <div className="hello-illustration-area">
            <div className="person-illustration-container">
              <div className="person-figure-blue"></div>
            </div>
          </div>
        </div>

        {/* Upcoming Holidays Section */}
        <div className="holidays-section-improved">
          <div className="holidays-header">
            <h2 className="holidays-title">UPCOMING HOLIDAYS AND TIME OFF</h2>
            <button className="holidays-link">Go to holidays</button>
          </div>
          <div className="holidays-content">
            <p className="no-holidays-text">No upcoming holidays</p>
          </div>
        </div>
      </div>

      {/* Main Content - Three Columns + Right Sidebar */}
      <div className="dashboard-main-content">
        {/* Left Content Area - Three Columns */}
        <div className="dashboard-left-content">
          {/* Tracked Hours Section */}
          <div className="tracked-hours-section">
            <div className="section-header">
              <h3 className="section-title">TRACKED HOURS</h3>
              <button className="section-link">Go to timesheets</button>
            </div>
            
            <div className="hours-legend">
              <div className="legend-item">
                <div className="legend-dot worked"></div>
                <span className="legend-label">WORKED HOURS</span>
                <span className="legend-value">{trackedHours.worked}</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot break"></div>
                <span className="legend-label">BREAKS</span>
                <span className="legend-value">{trackedHours.breaks}</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot overtime"></div>
                <span className="legend-label">OVERTIME HOURS</span>
                <span className="legend-value">{trackedHours.overtime}</span>
              </div>
            </div>

            <div className="weekly-chart">
              <div className="chart-y-axis">
                <span>600h</span>
                <span>500h</span>
                <span>400h</span>
                <span>300h</span>
                <span>200h</span>
                <span>100h</span>
                <span>0h</span>
              </div>
              <div className="chart-bars">
                {weeklyData.map((data, index) => (
                  <div key={index} className="chart-day">
                    <div className="chart-bar-container">
                      {data.worked > 0 && (
                        <div 
                          className="chart-bar worked"
                          style={{ height: `${(data.worked / maxHours) * 100}%` }}
                        ></div>
                      )}
                      {data.overtime > 0 && (
                        <div 
                          className="chart-bar overtime"
                          style={{ height: `${(data.overtime / maxHours) * 100}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="chart-day-label">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="chart-note">Does not include manually added time entries</p>
          </div>

          {/* Activities Section */}
          <div className="activities-section">
            <div className="section-header">
              <h3 className="section-title">ACTIVITIES</h3>
              <button className="section-link">View all</button>
            </div>
            
            <div className="activities-content">
              <div className="activity-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#FB923C"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 35 * 0.3} ${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * 0.25}`}
                    className="activity-progress"
                  />
                </svg>
                <div className="ring-center">
                  <div className="ring-label">TODAY</div>
                  <div className="ring-time">0h 0m</div>
                </div>
              </div>
              
              <div className="activities-list">
                <h4 className="activities-list-title">Most tracked activities</h4>
                <div className="activity-items">
                  <div className="activity-item">
                    <div className="activity-dot" style={{ backgroundColor: '#FB923C' }}></div>
                    <span className="activity-name">General</span>
                    <span className="activity-time">0h 0m</span>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot" style={{ backgroundColor: '#3B82F6' }}></div>
                    <span className="activity-name">Development</span>
                    <span className="activity-time">0h 0m</span>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot" style={{ backgroundColor: '#10B981' }}></div>
                    <span className="activity-name">Meetings</span>
                    <span className="activity-time">0h 0m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="projects-section">
            <div className="section-header">
              <h3 className="section-title">PROJECTS</h3>
              <button className="section-link">View all</button>
            </div>
            
            <div className="projects-content">
              <div className="project-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 35 * 0.2} ${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * 0.25}`}
                    className="project-progress"
                  />
                </svg>
                <div className="ring-center">
                  <div className="ring-label">TODAY</div>
                  <div className="ring-time">0h 0m</div>
                </div>
              </div>
              
              <div className="projects-list">
                <h4 className="projects-list-title">Most tracked projects</h4>
                <div className="project-items">
                  <div className="project-item">
                    <div className="project-dot" style={{ backgroundColor: '#8B5CF6' }}></div>
                    <span className="project-name">Website Redesign</span>
                    <span className="project-time">0h 0m</span>
                  </div>
                  <div className="project-item">
                    <div className="project-dot" style={{ backgroundColor: '#F59E0B' }}></div>
                    <span className="project-name">Mobile App</span>
                    <span className="project-time">0h 0m</span>
                  </div>
                  <div className="project-item">
                    <div className="project-dot" style={{ backgroundColor: '#EF4444' }}></div>
                    <span className="project-name">API Integration</span>
                    <span className="project-time">0h 0m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Wider with Scroll */}
        <div className="dashboard-right-sidebar-wide">
          {/* Who's in/out Section - Expanded */}
          <div className="whos-inout-section-expanded">
            <div className="section-header">
              <h3 className="section-title">WHO'S IN/OUT</h3>
              <span className="member-count">1 member</span>
            </div>
            
            <div className="inout-stats-large">
              <div className="stat-item-large">
                <span className="stat-number-large in">0</span>
                <span className="stat-label-large">IN</span>
              </div>
              <div className="stat-item-large">
                <span className="stat-number-large break">0</span>
                <span className="stat-label-large">BREAK</span>
              </div>
              <div className="stat-item-large">
                <span className="stat-number-large out">1</span>
                <span className="stat-label-large">OUT</span>
              </div>
            </div>

            <div className="search-members-wide">
              <input 
                type="text" 
                placeholder="Search members..." 
                className="member-search-input-wide"
              />
            </div>

            {/* Members List with Scroll */}
            <div className="members-list-container">
              <div className="members-list-scrollable">
                {membersData.map((member, index) => (
                  <div key={index} className="member-item">
                    <div className="member-info">
                      <span className="member-name">{member.name}</span>
                      <span className={`member-status ${member.status}`}>
                        {member.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="member-time">{member.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Time Section */}
          <div className="current-time-section-compact">
            <div className="time-display-large">{formatTime(currentTime)}</div>
            <div className="date-display-large">{formatDate(currentTime)}</div>
            <div className="timezone-large">No members clocked in now</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };

