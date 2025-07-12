export function WeeklyChart({ data }) {
  const maxHours = 10 // Maximum hours for chart scaling

  return (
    <div className="weekly-chart">
      <div className="chart-bars">
        {data.map((day, index) => {
          const totalHours = day.worked + day.overtime
          const workedHeight = (day.worked / maxHours) * 100
          const overtimeHeight = (day.overtime / maxHours) * 100
          const breakHeight = (day.break / maxHours) * 100

          return (
            <div key={index} className="chart-day">
              <div className="chart-bar-container">
                <div 
                  className="chart-bar worked"
                  style={{ height: `${workedHeight}%` }}
                  title={`Worked: ${day.worked}h`}
                />
                {day.overtime > 0 && (
                  <div 
                    className="chart-bar overtime"
                    style={{ height: `${overtimeHeight}%` }}
                    title={`Overtime: ${day.overtime}h`}
                  />
                )}
                <div 
                  className="chart-bar break"
                  style={{ height: `${breakHeight}%` }}
                  title={`Break: ${day.break}h`}
                />
              </div>
              <div className="chart-day-label">
                <div className="day-name">{day.day}</div>
                <div className="day-date">{day.date}</div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Y-axis labels */}
      <div className="chart-y-axis">
        {[0, 2, 4, 6, 8, 10].map(hour => (
          <div key={hour} className="y-axis-label">
            {hour}h
          </div>
        ))}
      </div>
    </div>
  )
}

