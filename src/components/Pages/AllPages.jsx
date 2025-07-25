import { MapPin, Calendar, BarChart3, Settings, Users, Activity, Clock, Building, Zap, FolderOpen, Target } from 'lucide-react'

// Import the real WorkSchedulesPage component
import { WorkSchedulesPage as RealWorkSchedulesPage } from '../WorkSchedules'

// Import the enhanced CampaignManagement component
import CampaignManagement from '../CampaignManagement/CampaignManagement'

// Import PeopleDirectory component (if it exists in the components directory)
// If not, we'll use the MyTeamPage as fallback
let PeopleDirectoryComponent;
try {
  // Try to import from People directory first
  PeopleDirectoryComponent = require('../People/PeopleDirectory').default;
} catch (e) {
  // Fallback to MyTeamPage if PeopleDirectory doesn't exist
  PeopleDirectoryComponent = null;
}

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

// Live Locations Page
export function LiveLocationsPage() {
  return (
    <BasePage 
      title="Live Locations" 
      icon={MapPin}
      description="Track employee locations and manage location-based attendance"
    >
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <MapPin size={64} color="#6B7280" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
          Location Tracking
        </h3>
        <p style={{ color: '#6B7280', marginBottom: '24px' }}>
          Monitor employee locations in real-time and set up geofenced work areas.
        </p>
        <button style={{
          backgroundColor: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Enable Location Tracking
        </button>
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
      description="Manage vacation requests, sick leave, and other time off requests"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Calendar size={48} color="#10B981" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Pending Requests
          </h4>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>3</div>
        </div>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Calendar size={48} color="#F59E0B" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Approved This Month
          </h4>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>12</div>
        </div>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Calendar size={48} color="#EF4444" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Days Remaining
          </h4>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>18</div>
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
      description="Generate detailed reports on attendance, productivity, and time tracking"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {[
          { name: 'Attendance Report', description: 'Daily and weekly attendance summaries' },
          { name: 'Time Tracking Report', description: 'Detailed time tracking analytics' },
          { name: 'Productivity Report', description: 'Employee productivity metrics' },
          { name: 'Overtime Report', description: 'Overtime hours and costs analysis' },
          { name: 'Department Report', description: 'Department-wise performance data' },
          { name: 'Custom Report', description: 'Create custom reports with filters' }
        ].map((report, index) => (
          <div key={index} style={{
            padding: '16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
              {report.name}
            </h4>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
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
      description="Configure application settings and preferences"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[
          { title: 'General Settings', description: 'Basic application configuration' },
          { title: 'User Management', description: 'Manage user accounts and permissions' },
          { title: 'Time Tracking', description: 'Configure time tracking rules and policies' },
          { title: 'Notifications', description: 'Set up email and push notifications' },
          { title: 'Integrations', description: 'Connect with third-party applications' },
          { title: 'Security', description: 'Security settings and access controls' }
        ].map((setting, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                {setting.title}
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                {setting.description}
              </p>
            </div>
            <button style={{
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              Configure
            </button>
          </div>
        ))}
      </div>
    </BasePage>
  )
}

// My Team Page (Fallback)
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

// People Directory Page - Enhanced version or fallback to MyTeamPage
export function PeopleDirectoryPage() {
  // If PeopleDirectory component exists, use it; otherwise fallback to MyTeamPage
  if (PeopleDirectoryComponent) {
    return <PeopleDirectoryComponent />;
  }
  
  // Fallback to MyTeamPage with enhanced title
  return (
    <BasePage 
      title="People Directory" 
      icon={Users}
      description="Manage your team members and their information"
    >
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 0',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
        border: '2px dashed #D1D5DB'
      }}>
        <Users size={64} color="#6B7280" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
          People Directory Coming Soon
        </h3>
        <p style={{ color: '#6B7280', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
          The enhanced People Directory with advanced features is being prepared for deployment.
        </p>
        <button 
          onClick={() => window.location.href = '/my-team'}
          style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          View Team Members
        </button>
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
      description="Track time spent on projects and activities"
    >
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Activity size={64} color="#6B7280" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
          Start Tracking Time
        </h3>
        <p style={{ color: '#6B7280', marginBottom: '24px' }}>
          Begin tracking your work time and activities for accurate reporting.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button style={{
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Start Timer
          </button>
          <button style={{
            backgroundColor: '#F3F4F6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Manual Entry
          </button>
        </div>
      </div>
    </BasePage>
  )
}

// Export the real Work Schedules Page
export function WorkSchedulesPage() {
  return <RealWorkSchedulesPage />
}

// Time Off & Holidays Page
export function TimeOffHolidaysPage() {
  return (
    <BasePage 
      title="Time Off & Holidays" 
      icon={Calendar}
      description="Manage holidays and time off policies"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
            Upcoming Holidays
          </h4>
          {[
            { name: 'Independence Day', date: 'July 4, 2024' },
            { name: 'Labor Day', date: 'September 2, 2024' },
            { name: 'Thanksgiving', date: 'November 28, 2024' }
          ].map((holiday, index) => (
            <div key={index} style={{
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                {holiday.name}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {holiday.date}
              </div>
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
            Time Off Policies
          </h4>
          <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
            <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0' }}>
              Annual Leave: 20 days
            </p>
            <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0' }}>
              Sick Leave: 10 days
            </p>
            <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
              Personal Days: 5 days
            </p>
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
      description="Manage work locations and geofenced areas"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {[
          { name: 'Main Office', address: '123 Business St, City, State', employees: 25 },
          { name: 'Remote Work', address: 'Various Locations', employees: 12 },
          { name: 'Client Site A', address: '456 Client Ave, City, State', employees: 8 },
          { name: 'Warehouse', address: '789 Industrial Blvd, City, State', employees: 15 }
        ].map((location, index) => (
          <div key={index} style={{
            padding: '16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              {location.name}
            </h4>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
              {location.address}
            </p>
            <div style={{ fontSize: '12px', color: '#374151' }}>
              {location.employees} employees
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
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: project.status === 'Completed' ? '#D1FAE5' : project.status === 'In Progress' ? '#DBEAFE' : '#FEF3C7',
                color: project.status === 'Completed' ? '#065F46' : project.status === 'In Progress' ? '#1E40AF' : '#92400E'
              }}>
                {project.status}
              </span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Progress</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{project.completion}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#E5E7EB',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${project.completion}%`,
                  height: '100%',
                  backgroundColor: '#3B82F6',
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

// Organization Page - Keep for backward compatibility but redirect to campaigns
export function OrganizationPage() {
  return (
    <BasePage 
      title="Organization" 
      icon={Building}
      description="Manage organizational structure and departments"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { name: 'Engineering', employees: 15, manager: 'John Smith' },
          { name: 'Sales', employees: 8, manager: 'Sarah Johnson' },
          { name: 'Marketing', employees: 6, manager: 'Mike Wilson' },
          { name: 'HR', employees: 3, manager: 'Lisa Brown' },
          { name: 'Finance', employees: 4, manager: 'David Lee' },
          { name: 'Operations', employees: 10, manager: 'Emma Davis' }
        ].map((dept, index) => (
          <div key={index} style={{
            padding: '16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Building size={32} color="#6B7280" style={{ marginBottom: '8px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
              {dept.name}
            </h4>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
              {dept.employees} employees
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Manager: {dept.manager}
            </p>
          </div>
        ))}
      </div>
    </BasePage>
  )
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
            padding: '16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                {integration.name}
              </h4>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                {integration.description}
              </p>
            </div>
            <button style={{
              backgroundColor: integration.connected ? '#EF4444' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              {integration.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </BasePage>
  )
}

