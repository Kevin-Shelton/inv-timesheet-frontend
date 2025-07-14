import './DashboardNamespaced.css'
export default function WeeklyChart() {
  return (
    <div className="dashboard-page weekly-chart-wrapper">
      <h3 className="dashboard-page section-title">Weekly Hours Chart</h3>
      <div className="dashboard-page weekly-chart">
        <div className="chart-bar-group">
          {/* Static sample data */}
          <div className="chart-bar" style={{ height: '30%' }} />
          <div className="chart-bar" style={{ height: '60%' }} />
          <div className="chart-bar" style={{ height: '50%' }} />
          <div className="chart-bar" style={{ height: '80%' }} />
          <div className="chart-bar" style={{ height: '20%' }} />
          <div className="chart-bar" style={{ height: '40%' }} />
          <div className="chart-bar" style={{ height: '70%' }} />
        </div>

        <div className="chart-y-axis">
          {[0, 2, 4, 6, 8, 10].map((hour) => (
            <div key={hour} className="y-label">
              {hour}h
            </div>
          ))}
        </div>

        <div className="chart-x-axis">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="x-label">
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
