import { useState, useMemo } from 'react';
import './DashboardNamespaced.css';

const workedHeights = [30, 60, 50, 80, 20, 40, 70];
const breakHeights = [5, 10, 8, 6, 2, 4, 6];
const overtimeHeights = [3, 5, 4, 6, 1, 3, 2];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function calculateTotalHours(heightsArray) {
  const total = heightsArray.reduce((acc, h) => acc + h, 0);
  const hours = Math.floor(total / 10);
  const minutes = Math.round(((total / 10) % 1) * 60);
  return `${hours}h ${minutes}m`;
}

export default function WeeklyChart() {
  const [tooltip, setTooltip] = useState({ show: false, day: '', value: '', x: 0, y: 0 });

  const workedTotal = useMemo(() => calculateTotalHours(workedHeights), []);
  const breakTotal = useMemo(() => calculateTotalHours(breakHeights), []);
  const overtimeTotal = useMemo(() => calculateTotalHours(overtimeHeights), []);

  return (
    <div className="dashboard-page tracked-hours-section">
      <h3 className="section-title">Tracked Hours</h3>

      <div className="chart-container">
        {/* Left side labels */}
        <div className="chart-labels">
          <div className="label-group">
            <span className="dot worked"></span>
            <div className="label-content">
              <div className="label-title">WORKED HOURS</div>
              <div className="label-value">{workedTotal}</div>
            </div>
          </div>
          <div className="label-group">
            <span className="dot breaks"></span>
            <div className="label-content">
              <div className="label-title">BREAKS</div>
              <div className="label-value">{breakTotal}</div>
            </div>
          </div>
          <div className="label-group">
            <span className="dot overtime"></span>
            <div className="label-content">
              <div className="label-title">OVERTIME HOURS</div>
              <div className="label-value">{overtimeTotal}</div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="weekly-chart">
          <div className="chart-y-axis">
            {[0, 2, 4, 6, 8, 10].map((hour) => (
              <div key={hour} className="y-label">{hour}h</div>
            ))}
          </div>

<div className="chart-bar-group">
  {workedHeights.map((worked, i) => {
    const breakH = breakHeights[i];
    const overtime = overtimeHeights[i];

    return (
      <div key={i} className="stacked-bar">
        <div
          className="bar-segment worked"
          style={{ height: `${worked}%` }}
        />
        <div
          className="bar-segment breaks"
          style={{ height: `${breakH}%` }}
        />
        <div
          className="bar-segment overtime"
          style={{ height: `${overtime}%` }}
        />
      </div>
    );
  })}
</div>


          <div className="chart-x-axis">
            {days.map((day) => (
              <div key={day} className="x-label">{day}</div>
            ))}
          </div>
        </div>
      </div>

      {tooltip.show && (
        <div className="chart-tooltip" style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}>
          {tooltip.day}: {tooltip.value}
        </div>
      )}
    </div>
  );
}
