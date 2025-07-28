import { MapPin, Calendar, BarChart3, Settings, Users, Activity, Clock, Building, Zap, FolderOpen, Target } from 'lucide-react'

// Import the real WorkSchedulesPage component
import { WorkSchedulesPage as RealWorkSchedulesPage } from '../WorkSchedules'

// Import the enhanced CampaignManagement component
import CampaignManagement from '../CampaignManagement/CampaignManagement'

// Import the new PeopleDirectory component
// TEMPORARILY COMMENTED OUT - Will add back once component exists
// import PeopleDirectory from '../People/PeopleDirectory'

// Base page layout component
const BasePage = ({ title, icon: Icon, children, description }) => {
  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9FAFB',
    padding: '24px',
    boxSizing: 'border-box',
    overflow: 'auto'
  }

  const headerStyle = {
    marginBottom: '24px'
  }

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }

  const descriptionStyle = {
    fontSize: '16px',
    color: '#6B7280',
    margin: 0
  }

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    padding: '24px'
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <Icon size={32} />
          {title}
        </h1>
        {description && <p style={descriptionStyle}>{description}</p>}
      </div>
      <div style={cardStyle}>
        {children}
      </div>
    </div>
  )
}

// Dashboard Page
export function DashboardPage() {
  return (
    <BasePage 
      title="Dashboard" 
      icon={BarChart3}
      description="Overview of your time management and team performance"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { title: 'Total Hours This Week', value: '42.5h', change: '+5.2%', color: '#10B981' },
          { title: 'Team Members Active', value: '24', change: '+2', color: '#3B82F6' },
          { title: 'Projects in Progress', value: '8', change: '+1', color: '#F59E0B' },
          { title: 'Overtime Hours', value: '12.3h', change: '-2.1h', color: '#EF4444' }
        ].map((stat, index) => (
          <div key={index} style={{
            padding: '20px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280', margin: '0 0 8px 0' }}>
              {stat.title}
            </h3>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: stat.color }}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { user: 'John Doe', action: 'clocked in', time: '9:00 AM' },
              { user: 'Jane Smith', action: 'submitted timesheet', time: '8:45 AM' },
              { user: 'Mike Johnson', action: 'requested time off', time: '8:30 AM' },
              { user: 'Sarah Wilson', action: 'completed project task', time: '8:15 AM' }
            ].map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '14px', color: '#111827' }}>
                  <strong>{activity.user}</strong> {activity.action}
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Clock In/Out', icon: '⏰' },
              { label: 'View Timesheet', icon: '📊' },
              { label: 'Request Time Off', icon: '🏖️' },
              { label: 'Generate Report', icon: '📈' }
            ].map((action, index) => (
              <button key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151'
              }}>
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </BasePage>
  )
}

// Timesheets Page
export function TimesheetsPage() {
  return (
    <BasePage 
      title="Timesheets" 
      icon={Clock}
      description="Track and manage your working hours"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { day: 'Monday', hours: '8.0h', status: 'Complete' },
          { day: 'Tuesday', hours: '7.5h', status: 'Complete' },
          { day: 'Wednesday', hours: '8.2h', status: 'Complete' },
          { day: 'Thursday', hours: '6.0h', status: 'In Progress' },
          { day: 'Friday', hours: '0.0h', status: 'Pending' }
        ].map((day, index) => (
          <div key={index} style={{
            padding: '16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
              {day.day}
            </h4>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6', margin: '0 0 4px 0' }}>
              {day.hours}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: day.status === 'Complete' ? '#10B981' : day.status === 'In Progress' ? '#F59E0B' : '#6B7280'
            }}>
              {day.status}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          This Week's Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>29.7h</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>Total Hours</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>40.0h</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>Target Hours</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>-10.3h</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>Remaining</div>
          </div>
        </div>
      </div>
    </BasePage>
  )
}

// Live Locations Page
export function LiveLocationsPage() {
  return (
    <BasePage 
      title="Live Locations" 
      icon={MapPin}
      description="Track team member locations and check-ins"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {[
          { name: 'John Doe', location: 'Main Office - Floor 3', status: 'Checked In', time: '9:00 AM' },
          { name: 'Jane Smith', location: 'Remote - Home Office', status: 'Working', time: '8:30 AM' },
          { name: 'Mike Johnson', location: 'Client Site - Downtown', status: 'On Site', time: '10:15 AM' },
          { name: 'Sarah Wilson', location: 'Main Office - Conference Room B', status: 'In Meeting', time: '11:00 AM' }
        ].map((member, index) => (
          <div key={index} style={{
            padding: '16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {member.name}
              </h4>
              <span style={{ 
                fontSize: '12px', 
                padding: '4px 8px', 
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB'
              }}>
                {member.status}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 8px 0' }}>
              📍 {member.location}
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
              Last updated: {member.time}
            </p>
          </div>
        ))}
      </div>
    </BasePage>
  )
}

// Time Off Page
export function TimeOffPage() {
  return (
    <BasePage 
      title="Time Off" 
      icon={Calendar}
      description="Manage vacation days, sick leave, and other time off requests"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Your Balance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { type: 'Vacation Days', available: 15, used: 5, total: 20 },
              { type: 'Sick Days', available: 8, used: 2, total: 10 },
              { type: 'Personal Days', available: 3, used: 0, total: 3 }
            ].map((balance, index) => (
              <div key={index} style={{
                padding: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {balance.type}
                  </h4>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#3B82F6' }}>
                    {balance.available} available
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#E5E7EB', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(balance.used / balance.total) * 100}%`,
                    height: '100%',
                    backgroundColor: '#3B82F6'
                  }}></div>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '8px 0 0 0' }}>
                  {balance.used} used of {balance.total} total days
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Recent Requests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { dates: 'Dec 23-27, 2024', type: 'Vacation', status: 'Approved', days: 5 },
              { dates: 'Nov 15, 2024', type: 'Sick Day', status: 'Approved', days: 1 },
              { dates: 'Jan 2, 2025', type: 'Personal', status: 'Pending', days: 1 }
            ].map((request, index) => (
              <div key={index} style={{
                padding: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {request.dates}
                  </h4>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    backgroundColor: request.status === 'Approved' ? '#D1FAE5' : '#FEF3C7',
                    color: request.status === 'Approved' ? '#065F46' : '#92400E'
                  }}>
                    {request.status}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                  {request.type} • {request.days} day{request.days > 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BasePage>
  )
}

// Reports Page
export function ReportsPage() {
  return (
    <BasePage 
      title="Reports" 
      icon={BarChart3}
      description="Generate and view detailed time tracking reports"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {[
          { title: 'Weekly Summary', description: 'Hours worked by day and week', icon: '📊' },
          { title: 'Team Performance', description: 'Compare team member productivity', icon: '👥' },
          { title: 'Project Time', description: 'Time allocation across projects', icon: '📁' },
          { title: 'Overtime Analysis', description: 'Overtime trends and patterns', icon: '⏰' },
          { title: 'Attendance Report', description: 'Check-in/out patterns and punctuality', icon: '📅' },
          { title: 'Custom Report', description: 'Build your own custom report', icon: '🔧' }
        ].map((report, index) => (
          <div key={index} style={{
            padding: '20px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>
              {report.icon}
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
              {report.title}
            </h4>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              {report.description}
            </p>
          </div>
        ))}
      </div>
    </BasePage>
  )
}

// Settings Page
export function SettingsPage() {
  return (
    <BasePage 
      title="Settings" 
      icon={Settings}
      description="Configure your account and application preferences"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Account Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Profile Information', description: 'Update your personal details' },
              { label: 'Password & Security', description: 'Change password and security settings' },
              { label: 'Email Preferences', description: 'Manage notification settings' },
              { label: 'Privacy Settings', description: 'Control your data and privacy' }
            ].map((setting, index) => (
              <div key={index} style={{
                padding: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                  {setting.label}
                </h4>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                  {setting.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Application Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Time Zone', description: 'Set your local time zone' },
              { label: 'Date Format', description: 'Choose date display format' },
              { label: 'Theme Preferences', description: 'Light or dark mode' },
              { label: 'Language', description: 'Select your preferred language' }
            ].map((setting, index) => (
              <div key={index} style={{
                padding: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                  {setting.label}
                </h4>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                  {setting.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BasePage>
  )
}

// My Team Page - RESTORED! (This was missing and causing the build error)
export function MyTeamPage() {
  return (
    <BasePage 
      title="My Team" 
      icon={Users}
      description="Manage your team members and their performance"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {[
          { name: 'John Doe', role: 'Senior Developer', status: 'Online', hours: '40h' },
          { name: 'Jane Smith', role: 'Project Manager', status: 'Away', hours: '38h' },
          { name: 'Mike Johnson', role: 'Designer', status: 'Online', hours: '42h' },
          { name: 'Sarah Wilson', role: 'QA Engineer', status: 'Offline', hours: '35h' }
        ].map((member, index) => (
          <div key={index} style={{
            padding: '16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              color: '#6B7280'
            }}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                {member.name}
              </h4>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px 0' }}>
                {member.role}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: member.status === 'Online' ? '#D1FAE5' : member.status === 'Away' ? '#FEF3C7' : '#FEE2E2',
                  color: member.status === 'Online' ? '#065F46' : member.status === 'Away' ? '#92400E' : '#991B1B'
                }}>
                  {member.status}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                  {member.hours}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BasePage>
  )
}

// People Directory Page - TEMPORARILY DISABLED until component exists
export function PeopleDirectoryPage() {
  return (
    <BasePage 
      title="People Directory" 
      icon={Users}
      description="Enhanced team directory with advanced features"
    >
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        backgroundColor: '#FEF3C7',
        borderRadius: '8px',
        border: '1px solid #F59E0B'
      }}>
        <Users size={64} color="#F59E0B" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400E', marginBottom: '8px' }}>
          People Directory Coming Soon
        </h3>
        <p style={{ color: '#92400E', marginBottom: '16px' }}>
          The enhanced People Directory component is being developed. For now, please use the "My Team" page.
        </p>
        <p style={{ fontSize: '12px', color: '#92400E' }}>
          This page will include editable dropdowns, multiple campaign assignments, and enhanced employee management features.
        </p>
      </div>
    </BasePage>
  )
}

// Time Tracking Page
export function TimeTrackingPage() {
  return (
    <BasePage 
      title="Time Tracking" 
      icon={Activity}
      description="Real-time tracking and monitoring of work activities"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Current Session
          </h3>
          <div style={{
            padding: '24px',
            border: '2px solid #3B82F6',
            borderRadius: '12px',
            textAlign: 'center',
            backgroundColor: '#EFF6FF'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#1E40AF', margin: '0 0 8px 0' }}>
              03:42:15
            </div>
            <p style={{ fontSize: '16px', color: '#3B82F6', margin: '0 0 16px 0' }}>
              Currently tracking
            </p>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Stop Tracking
            </button>
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Today's Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { project: 'Website Redesign', time: '2:15:30', status: 'Active' },
              { project: 'Mobile App', time: '1:27:45', status: 'Paused' },
              { project: 'Database Migration', time: '0:45:20', status: 'Completed' }
            ].map((session, index) => (
              <div key={index} style={{
                padding: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                    {session.project}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                    {session.time}
                  </p>
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  backgroundColor: session.status === 'Active' ? '#D1FAE5' : session.status === 'Paused' ? '#FEF3C7' : '#E5E7EB',
                  color: session.status === 'Active' ? '#065F46' : session.status === 'Paused' ? '#92400E' : '#374151'
                }}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BasePage>
  )
}

// Work Schedules Page - Use the real component
export function WorkSchedulesPage() {
  return <RealWorkSchedulesPage />
}

// Time Off & Holidays Page
export function TimeOffHolidaysPage() {
  return (
    <BasePage 
      title="Time Off & Holidays" 
      icon={Calendar}
      description="Manage company holidays and time off policies"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Upcoming Holidays
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'New Year\'s Day', date: 'January 1, 2025', type: 'Federal Holiday' },
              { name: 'Martin Luther King Jr. Day', date: 'January 20, 2025', type: 'Federal Holiday' },
              { name: 'Presidents\' Day', date: 'February 17, 2025', type: 'Federal Holiday' },
              { name: 'Memorial Day', date: 'May 26, 2025', type: 'Federal Holiday' }
            ].map((holiday, index) => (
              <div key={index} style={{
                padding: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {holiday.name}
                  </h4>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB'
                  }}>
                    {holiday.type}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                  {holiday.date}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Time Off Policies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { policy: 'Vacation Days', allocation: '20 days per year', accrual: 'Monthly' },
              { policy: 'Sick Leave', allocation: '10 days per year', accrual: 'Monthly' },
              { policy: 'Personal Days', allocation: '3 days per year', accrual: 'Annual' },
              { policy: 'Bereavement', allocation: '5 days per occurrence', accrual: 'As needed' }
            ].map((policy, index) => (
              <div key={index} style={{
                padding: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                  {policy.policy}
                </h4>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px 0' }}>
                  Allocation: {policy.allocation}
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                  Accrual: {policy.accrual}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BasePage>
  )
}

// Locations Page
export function LocationsPage() {
  return (
    <BasePage 
      title="Locations" 
      icon={MapPin}
      description="Manage office locations and remote work settings"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {[
          { 
            name: 'Main Office', 
            address: '123 Business Ave, Suite 100, New York, NY 10001',
            employees: 45,
            status: 'Active'
          },
          { 
            name: 'West Coast Branch', 
            address: '456 Tech Blvd, San Francisco, CA 94105',
            employees: 28,
            status: 'Active'
          },
          { 
            name: 'Remote Workers', 
            address: 'Various locations worldwide',
            employees: 12,
            status: 'Active'
          },
          { 
            name: 'Client Site - Downtown', 
            address: '789 Corporate Dr, Chicago, IL 60601',
            employees: 8,
            status: 'Temporary'
          }
        ].map((location, index) => (
          <div key={index} style={{
            padding: '20px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {location.name}
              </h4>
              <span style={{ 
                fontSize: '12px', 
                padding: '4px 8px', 
                borderRadius: '12px',
                backgroundColor: location.status === 'Active' ? '#D1FAE5' : '#FEF3C7',
                color: location.status === 'Active' ? '#065F46' : '#92400E'
              }}>
                {location.status}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 12px 0' }}>
              📍 {location.address}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#111827' }}>
                👥 {location.employees} employees
              </span>
              <button style={{
                padding: '6px 12px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </BasePage>
  )
}

// Activities & Projects Page
export function ActivitiesProjectsPage() {
  return (
    <BasePage 
      title="Activities & Projects" 
      icon={FolderOpen}
      description="Manage projects and track activities"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {[
          { name: 'Website Redesign', status: 'In Progress', completion: 75, team: 5 },
          { name: 'Mobile App Development', status: 'Planning', completion: 25, team: 8 },
          { name: 'Database Migration', status: 'Completed', completion: 100, team: 3 },
          { name: 'Marketing Campaign', status: 'In Progress', completion: 60, team: 4 }
        ].map((project, index) => (
          <div key={index} style={{
            padding: '16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {project.name}
              </h4>
              <span style={{ 
                fontSize: '12px', 
                padding: '4px 8px', 
                borderRadius: '12px',
                backgroundColor: project.status === 'Completed' ? '#D1FAE5' : project.status === 'In Progress' ? '#FEF3C7' : '#E5E7EB',
                color: project.status === 'Completed' ? '#065F46' : project.status === 'In Progress' ? '#92400E' : '#374151'
              }}>
                {project.status}
              </span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Progress</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{project.completion}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#E5E7EB', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${project.completion}%`,
                  height: '100%',
                  backgroundColor: project.completion === 100 ? '#10B981' : '#3B82F6',
                  borderRadius: '3px'
                }}></div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              {project.team} team members
            </div>
          </div>
        ))}
      </div>
    </BasePage>
  )
}

// Campaign Management Page - NEW!
export function CampaignManagementPage() {
  return <CampaignManagement />
}

// Integrations Page
export function IntegrationsPage() {
  return (
    <BasePage 
      title="Integrations" 
      icon={Zap}
      description="Connect with third-party applications and services"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {[
          { name: 'Slack', description: 'Team communication and notifications', connected: true },
          { name: 'Google Calendar', description: 'Sync schedules and meetings', connected: true },
          { name: 'Microsoft Teams', description: 'Video conferencing and collaboration', connected: false },
          { name: 'Jira', description: 'Project management and issue tracking', connected: false },
          { name: 'Salesforce', description: 'Customer relationship management', connected: true },
          { name: 'QuickBooks', description: 'Accounting and payroll integration', connected: false }
        ].map((integration, index) => (
          <div key={index} style={{
            padding: '20px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {integration.name}
              </h4>
              <span style={{ 
                fontSize: '12px', 
                padding: '4px 8px', 
                borderRadius: '12px',
                backgroundColor: integration.connected ? '#D1FAE5' : '#FEE2E2',
                color: integration.connected ? '#065F46' : '#991B1B'
              }}>
                {integration.connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 16px 0' }}>
              {integration.description}
            </p>
            <button style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: integration.connected ? '#F3F4F6' : '#3B82F6',
              color: integration.connected ? '#374151' : 'white',
              border: integration.connected ? '1px solid #D1D5DB' : 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              {integration.connected ? 'Configure' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </BasePage>
  )
}

