export function ActivityRing({ percentage, label, value }) {
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="activity-ring">
      <div className="ring-container">
        <svg width="120" height="120" className="ring-svg">
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="16"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#4B5563"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            className="progress-ring"
          />
        </svg>
        
        <div className="ring-content">
          <div className="ring-label">{label}</div>
          <div className="ring-value">{value}</div>
        </div>
      </div>
    </div>
  )
}

