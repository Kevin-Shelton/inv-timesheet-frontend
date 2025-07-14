import React, { useState, useEffect } from 'react';
import './DashboardNamespaced.css'; // ✅ Updated import

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [trackedHours, setTrackedHours] = useState({
    worked: '0h 0m',
    breaks: '0h 0m',
    overtime: '0h 0m'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const weeklyData = [
    { day: 'M', worked: 8, overtime: 0 },
    { day: 'T', worked: 7.5, overtime: 0.5 },
    { day: 'W', worked: 8, overtime: 1 },
    { day: 'T', worked: 8, overtime: 0 },
    { day: 'F', worked: 7, overtime: 0 },
    { day: 'S', worked: 6, overtime: 0 },
    { day: 'S', worked: 0, overtime: 0 }
  ];

  const maxHours = 10;

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
    <div className="dashboard-page">
      <div className="dashboard-reference-layout max-w-[1600px] mx-auto px-6 py-4 bg-[#f8f9fb]">
        <header className="flex items-center justify-between h-[60px] mb-4">
          <h1 className="text-[18px] font-semibold">Dashboard</h1>
          <div className="flex gap-4">
            <select className="border p-1 rounded">
              <option>Day</option>
              <option>Week</option>
              <option selected>Month</option>
            </select>
            <select className="border p-1 rounded">
              <option>All locations</option>
            </select>
            <select className="border p-1 rounded">
              <option>All groups</option>
            </select>
            <select className="border p-1 rounded">
              <option>All schedules</option>
            </select>
          </div>
        </header>

        <div className="grid grid-cols-[1fr_280px] gap-6 dashboard-main-content">
          <div className="dashboard-left-content space-y-6">
            <div className="dashboard-header-section flex gap-6 h-[120px]">
              <div className="hello-section-improved flex-[0_0_60%]">
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
              <div className="holidays-section-improved flex-[0_0_35%]">
                <div className="holidays-header">
                  <h2 className="holidays-title">UPCOMING HOLIDAYS AND TIME OFF</h2>
                  <button className="holidays-link">Go to holidays</button>
                </div>
                <div className="holidays-content">
                  <p className="no-holidays-text">No upcoming holidays</p>
                </div>
              </div>
            </div>

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
                          <div className="chart-bar worked" style={{ height: `${(data.worked / maxHours) * 100}%` }}></div>
                        )}
                        {data.overtime > 0 && (
                          <div className="chart-bar overtime" style={{ height: `${(data.overtime / maxHours) * 100}%` }}></div>
                        )}
                      </div>
                      <span className="chart-day-label">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="chart-note">Does not include manually added time entries</p>
            </div>

            <div className="flex gap-6">
              <div className="activities-section flex-1">{/* original activities content */}</div>
              <div className="projects-section flex-1">{/* original projects content */}</div>
            </div>

            <section className="h-[240px] rounded-xl shadow bg-white flex items-center justify-center">
              <p className="text-gray-500">Map section placeholder</p>
            </section>
          </div>

          <aside className="dashboard-right-sidebar-wide w-[280px] space-y-6">
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
                <input type="text" placeholder="Search members..." className="member-search-input-wide" />
              </div>
              <div className="members-list-container">
                <div className="members-list-scrollable">
                  {membersData.map((member, index) => (
                    <div key={index} className="member-item">
                      <div className="member-info">
                        <span className="member-name">{member.name}</span>
                        <span className={`member-status ${member.status}`}>{member.status.toUpperCase()}</span>
                      </div>
                      <span className="member-time">{member.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="current-time-section-compact text-center">
              <div className="time-display-large">{formatTime(currentTime)}</div>
              <div className="date-display-large">{formatDate(currentTime)}</div>
              <div className="timezone-large">No members clocked in now</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
