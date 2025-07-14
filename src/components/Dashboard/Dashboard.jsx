import React, { useState, useEffect } from 'react';

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
    return (
    <div className="dashboard-page.filters-section card" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
  <div>
    <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Time View</div>
    <select>
      <option>Day</option>
      <option>Week</option>
      <option>Month</option>
    </select>
  </div>
  <div>
    <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Filters</div>
    <select><option>All Locations</option></select>
    <select><option>All Groups</option></select>
    <select><option>All Schedules</option></select>
  </div>
  <div>
    <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>View</div>
    <select><option>Campaign</option></select>
    <select><option>Managed by Me</option></select>
    <select><option>Personal</option></select>
  </div>
</div>) => clearInterval(timer);
  }, []);

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

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
    <div className="dashboard-page.filters-section card" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
  <div>
    <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Time View</div>
    <select>
      <option>Day</option>
      <option>Week</option>
      <option>Month</option>
    </select>
  </div>
  <div>
    <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Filters</div>
    <select><option>All Locations</option></select>
    <select><option>All Groups</option></select>
    <select><option>All Schedules</option></select>
  </div>
  <div>
    <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>View</div>
    <select><option>Campaign</option></select>
    <select><option>Managed by Me</option></select>
    <select><option>Personal</option></select>
  </div>
</div>
    <div className="dashboard-page dashboard-reference-layout max-w-[1600px] mx-auto px-6 py-4 bg-[#f8f9fb]">
      <header className="flex items-center justify-between h-[60px] mb-4">
        <h1 className="text-[18px] font-semibold">Dashboard</h1>
        <div className="flex gap-4">
          <select className="border p-1 rounded"><option>Day</option><option>Week</option><option selected>Month</option></select>
          <select className="border p-1 rounded"><option>All locations</option></select>
          <select className="border p-1 rounded"><option>All groups</option></select>
          <select className="border p-1 rounded"><option>All schedules</option></select>
        </div>
      </header>

      <div className="dashboard-page grid grid-cols-[1fr_280px] gap-6 dashboard-main-content">
        <div className="dashboard-page dashboard-left-content space-y-6">
          <div className="dashboard-page dashboard-header-section flex gap-6 h-[120px]">
            <div className="hello-section-improved flex-[0_0_60%]">
              <div className="hello-text-content">
                <h1 className="dashboard-page hello-main-title">Hello Kevin</h1>
                <p className="dashboard-page hello-company-subtitle">
                  Here's what's happening at<br />
                  <span className="company-name">Egis</span>
                </p>
                <div className="jibble-logo-container">
                  <div className="dashboard-page jibble-logo-orange">
                    <span className="dashboard-page jibble-sigma">Σ</span>
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
                <h2 className="dashboard-page holidays-title">UPCOMING HOLIDAYS AND TIME OFF</h2>
                <button className="dashboard-page holidays-link">Go to holidays</button>
              </div>
              <div className="holidays-content">
                <p className="dashboard-page no-holidays-text">No upcoming holidays</p>
              </div>
            </div>
          </div>

          <div className="tracked-hours-section">
            <div className="dashboard-page section-header">
              <h3 className="dashboard-page section-title">TRACKED HOURS</h3>
              <button className="dashboard-page section-link">Go to timesheets</button>
            </div>

            <div className="dashboard-page hours-legend">
              <div className="dashboard-page legend-item">
                <div className="dashboard-page dashboard-page legend-dot worked"></div>
                <span className="legend-label">WORKED HOURS</span>
                <span className="dashboard-page legend-value">{trackedHours.worked}</span>
              </div>
              <div className="dashboard-page legend-item">
                <div className="dashboard-page dashboard-page legend-dot break"></div>
                <span className="legend-label">BREAKS</span>
                <span className="dashboard-page legend-value">{trackedHours.breaks}</span>
              </div>
              <div className="dashboard-page legend-item">
                <div className="dashboard-page dashboard-page legend-dot overtime"></div>
                <span className="legend-label">OVERTIME HOURS</span>
                <span className="dashboard-page legend-value">{trackedHours.overtime}</span>
              </div>
            </div>

            <div className="dashboard-page weekly-chart">
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
                  <div key={index} className="dashboard-page chart-day">
                    <div className="dashboard-page dashboard-page chart-bar-container">
                      {data.worked > 0 && (
                        <div className="dashboard-page dashboard-page chart-bar worked" style={{ height: `${(data.worked / maxHours) * 100}%` }}></div>
                      )}
                      {data.overtime > 0 && (
                        <div className="dashboard-page dashboard-page chart-bar overtime" style={{ height: `${(data.overtime / maxHours) * 100}%` }}></div>
                      )}
                    </div>
                    <span className="dashboard-page dashboard-page chart-day-label">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="dashboard-page chart-note">Does not include manually added time entries</p>
          </div>

          <div className="flex gap-6">
            <div className="activities-section flex-1">
              {/* original activities content */}
            </div>
            <div className="projects-section flex-1">
              {/* original projects content */}
            </div>
          </div>

          <section className="h-[240px] rounded-xl shadow bg-white flex items-center justify-center">
            <p className="text-gray-500">Map section placeholder</p>
          </section>
        </div>

        <aside className="dashboard-page dashboard-right-sidebar-wide w-[280px] space-y-6">
          <div className="dashboard-page whos-inout-section-expanded">
            <div className="dashboard-page section-header">
              <h3 className="dashboard-page section-title">WHO'S IN/OUT</h3>
              <span className="dashboard-page member-count">1 member</span>
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
              <input type="text" placeholder="Search members..." className="dashboard-page member-search-input-wide" />
            </div>
            <div className="members-list-container">
              <div className="dashboard-page members-list-scrollable">
                {membersData.map((member, index) => (
                  <div key={index} className="dashboard-page member-item">
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

          <div className="dashboard-page current-time-section-compact text-center">
            <div className="dashboard-page time-display-large">{formatTime(currentTime)}</div>
            <div className="dashboard-page date-display-large">{formatDate(currentTime)}</div>
            <div className="dashboard-page timezone-large">No members clocked in now</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export { Dashboard };
