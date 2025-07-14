// Dashboard.jsx
import { ActivityRing } from './ActivityRing'
import { WeeklyChart } from './WeeklyChart'
import { HolidaySection } from './HolidaySection'
import { CurrentTime } from './CurrentTime'
import { WelcomeCard } from './WelcomeCard'

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <CurrentTime />
      </div>

      <div className="dashboard-main-content">
        <div className="dashboard-top-row">
          <WelcomeCard />
          <HolidaySection />
        </div>

        <div className="dashboard-middle-row">
          <WeeklyChart />
        </div>

        <div className="dashboard-bottom-row">
          <ActivityRing />
        </div>
      </div>
    </div>
  )
}
