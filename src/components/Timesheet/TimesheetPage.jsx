import { useState } from 'react'
import { Clock, Plus, Search, Filter, Download, Calendar } from 'lucide-react'

export function TimesheetsPage() {
  const [selectedWeek, setSelectedWeek] = useState('Current Week')
  const [searchTerm, setSearchTerm] = useState('')

  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9FAFB',
    padding: '24px',
    boxSizing: 'border-box',
    overflow: 'auto'
  }

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  }

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: 0
  }

  const actionsStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  }

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #D1D5DB'
  }

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    padding: '24px',
    marginBottom: '24px'
  }

  const filterBarStyle = {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap'
  }

  const searchInputStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    backgroundColor: 'white',
    minWidth: '250px'
  }

  const inputStyle = {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    flex: 1
  }

  const selectStyle = {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden'
  }

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB'
  }

  const tdStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #F3F4F6',
    fontSize: '14px',
    color: '#374151'
  }

  const statusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  }

  const approvedBadgeStyle = {
    ...statusBadgeStyle,
    backgroundColor: '#D1FAE5',
    color: '#065F46'
  }

  const pendingBadgeStyle = {
    ...statusBadgeStyle,
    backgroundColor: '#FEF3C7',
    color: '#92400E'
  }

  // Sample timesheet data
  const timesheetData = [
    {
      id: 1,
      employee: 'John Doe',
      week: 'Jul 7 - Jul 13, 2024',
      totalHours: '40.0',
      regularHours: '40.0',
      overtimeHours: '0.0',
      status: 'Approved',
      submittedDate: '2024-07-14'
    },
    {
      id: 2,
      employee: 'Jane Smith',
      week: 'Jul 7 - Jul 13, 2024',
      totalHours: '42.5',
      regularHours: '40.0',
      overtimeHours: '2.5',
      status: 'Pending',
      submittedDate: '2024-07-14'
    },
    {
      id: 3,
      employee: 'Mike Johnson',
      week: 'Jul 7 - Jul 13, 2024',
      totalHours: '38.0',
      regularHours: '38.0',
      overtimeHours: '0.0',
      status: 'Approved',
      submittedDate: '2024-07-13'
    }
  ]

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Timesheets</h1>
        <div style={actionsStyle}>
          <button style={secondaryButtonStyle}>
            <Download size={16} />
            Export
          </button>
          <button style={buttonStyle}>
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={filterBarStyle}>
        <div style={searchInputStyle}>
          <Search size={16} color="#6B7280" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
        </div>
        
        <select 
          value={selectedWeek} 
          onChange={(e) => setSelectedWeek(e.target.value)}
          style={selectStyle}
        >
          <option>Current Week</option>
          <option>Last Week</option>
          <option>Last 2 Weeks</option>
          <option>Last Month</option>
        </select>

        <select style={selectStyle}>
          <option>All Departments</option>
          <option>Engineering</option>
          <option>Sales</option>
          <option>Marketing</option>
        </select>

        <select style={selectStyle}>
          <option>All Status</option>
          <option>Approved</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>

        <button style={secondaryButtonStyle}>
          <Filter size={16} />
          More Filters
        </button>
      </div>

      {/* Timesheets Table */}
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Employee</th>
              <th style={thStyle}>Week Period</th>
              <th style={thStyle}>Total Hours</th>
              <th style={thStyle}>Regular Hours</th>
              <th style={thStyle}>Overtime Hours</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Submitted</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheetData.map((timesheet) => (
              <tr key={timesheet.id}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6B7280'
                    }}>
                      {timesheet.employee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style={{ fontWeight: '500' }}>{timesheet.employee}</span>
                  </div>
                </td>
                <td style={tdStyle}>{timesheet.week}</td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: '600' }}>{timesheet.totalHours}h</span>
                </td>
                <td style={tdStyle}>{timesheet.regularHours}h</td>
                <td style={tdStyle}>{timesheet.overtimeHours}h</td>
                <td style={tdStyle}>
                  <span style={timesheet.status === 'Approved' ? approvedBadgeStyle : pendingBadgeStyle}>
                    {timesheet.status}
                  </span>
                </td>
                <td style={tdStyle}>{timesheet.submittedDate}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#3B82F6',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      View
                    </button>
                    <button style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#6B7280',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        <div style={{
          ...cardStyle,
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>120.5</div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Total Hours This Week</div>
        </div>
        
        <div style={{
          ...cardStyle,
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>3</div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Approved Timesheets</div>
        </div>
        
        <div style={{
          ...cardStyle,
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>1</div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Pending Approval</div>
        </div>
        
        <div style={{
          ...cardStyle,
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>2.5</div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Overtime Hours</div>
        </div>
      </div>
    </div>
  )
}

export default TimesheetsPage

