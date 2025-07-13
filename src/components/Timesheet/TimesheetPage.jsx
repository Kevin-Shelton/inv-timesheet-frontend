import React, { useState, useMemo } from 'react';
import TimesheetEntryModal from './TimesheetEntryModal';
import { 
  generateWeeklyTimesheets, 
  getTimesheetSummary, 
  getCurrentWeekDates,
  departments,
  statusOptions,
  formatDate
} from '../../data/TimesheetData';
import { exportFunctions } from '../../utils/TimesheetExport';

const TimesheetsPage = () => {
  // Main tab state
  const [activeMainTab, setActiveMainTab] = useState('timesheets'); // 'timesheets' or 'approvals'
  
  // Selector states
  const [viewSelector, setViewSelector] = useState('Daily Timesheets');
  const [campaignSelector, setCampaignSelector] = useState('Campaign');
  const [managedBySelector, setManagedBySelector] = useState('Managed by me');
  
  // Date navigation
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Filter states
  const [payrollHours, setPayrollHours] = useState('Payroll hours');
  const [groups, setGroups] = useState('Groups');
  const [members, setMembers] = useState('Members');
  const [schedules, setSchedules] = useState('Schedules');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  // Get current week dates
  const currentWeek = getCurrentWeekDates();

  // Calculate date range for selected date
  const dateRange = useMemo(() => {
    return {
      start: selectedDate,
      end: selectedDate
    };
  }, [selectedDate]);

  // Get filtered timesheet data
  const timesheetData = useMemo(() => {
    let data = generateWeeklyTimesheets(dateRange.start, dateRange.end);

    if (searchTerm) {
      data = data.filter(timesheet => 
        timesheet.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.campaigns.some(campaign => 
          campaign.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return data;
  }, [dateRange, searchTerm]);

  // Handle date navigation
  const handleDateNavigation = (direction) => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle modal actions
  const handleAddEntry = () => {
    setEditEntry(null);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    setEditEntry(entry);
    setIsModalOpen(true);
  };

  const handleSaveEntry = async (entryData) => {
    console.log('Saving timesheet entry:', entryData);
    setIsModalOpen(false);
    setEditEntry(null);
  };

  // Handle export
  const handleExport = () => {
    exportFunctions.timesheets(timesheetData);
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Main Header with Tabs and Selectors */}
      <div style={{
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 32px',
          height: '60px'
        }}>
          {/* Left Side - Main Tabs */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setActiveMainTab('timesheets')}
              style={{
                padding: '16px 0',
                marginRight: '32px',
                fontSize: '16px',
                fontWeight: '500',
                color: activeMainTab === 'timesheets' ? '#F97316' : '#9CA3AF',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `3px solid ${activeMainTab === 'timesheets' ? '#F97316' : 'transparent'}`,
                cursor: 'pointer'
              }}
            >
              Timesheets
            </button>
            <button
              onClick={() => setActiveMainTab('approvals')}
              style={{
                padding: '16px 0',
                fontSize: '16px',
                fontWeight: '500',
                color: activeMainTab === 'approvals' ? '#F97316' : '#9CA3AF',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `3px solid ${activeMainTab === 'approvals' ? '#F97316' : 'transparent'}`,
                cursor: 'pointer'
              }}
            >
              Approvals
            </button>
          </div>

          {/* Right Side - Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={campaignSelector}
              onChange={(e) => setCampaignSelector(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                color: '#F97316',
                backgroundColor: '#FFFFFF',
                border: '1px solid #F97316',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <option value="Campaign">Campaign</option>
              <option value="Project Alpha">Project Alpha</option>
              <option value="Project Beta">Project Beta</option>
            </select>
            
            <select
              value={managedBySelector}
              onChange={(e) => setManagedBySelector(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                color: '#6B7280',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <option value="Managed by me">Managed by me</option>
              <option value="All employees">All employees</option>
              <option value="My team">My team</option>
            </select>
          </div>
        </div>
      </div>

      {/* Secondary Header with View Selector and Date Navigation */}
      <div style={{
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        padding: '16px 32px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Left Side - View Selector and Date Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <select
              value={viewSelector}
              onChange={(e) => setViewSelector(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <option value="Daily Timesheets">Daily Timesheets</option>
              <option value="Weekly Timesheets">Weekly Timesheets</option>
              <option value="Monthly Timesheets">Monthly Timesheets</option>
            </select>

            {/* Date Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => handleDateNavigation('prev')}
                style={{
                  padding: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#F9FAFB',
                borderRadius: '6px',
                minWidth: '120px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  {formatDisplayDate(selectedDate)}
                </span>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <button
                onClick={() => handleDateNavigation('next')}
                style={{
                  padding: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side - Export Button */}
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '16px 32px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Filter Dropdowns */}
          <select
            value={payrollHours}
            onChange={(e) => setPayrollHours(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <option value="Payroll hours">Payroll hours</option>
            <option value="All hours">All hours</option>
            <option value="Regular hours">Regular hours</option>
            <option value="Overtime hours">Overtime hours</option>
          </select>

          <select
            value={groups}
            onChange={(e) => setGroups(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <option value="Groups">Groups</option>
            <option value="Development">Development</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
          </select>

          <select
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <option value="Members">Members</option>
            <option value="Active members">Active members</option>
            <option value="All members">All members</option>
          </select>

          <select
            value={schedules}
            onChange={(e) => setSchedules(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <option value="Schedules">Schedules</option>
            <option value="Current schedule">Current schedule</option>
            <option value="All schedules">All schedules</option>
          </select>

          {/* Add Filter Button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add filter
          </button>

          {/* Search */}
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <svg 
              width="16" 
              height="16" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: '36px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '14px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                width: '200px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px 32px' }}>
        {/* Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F9FAFB' }}>
              <tr>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Employee
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  First in
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Last out
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Regular
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Overtime
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Daily Double Overtime
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  Tracked
                </th>
              </tr>
            </thead>
            <tbody>
              {timesheetData.length > 0 ? (
                timesheetData.map((timesheet, index) => (
                  <tr 
                    key={timesheet.id}
                    style={{
                      borderBottom: index < timesheetData.length - 1 ? '1px solid #F3F4F6' : 'none'
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#6B7280'
                        }}>
                          {timesheet.employee.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {timesheet.employee.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                      -
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                      -
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                      -
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                      -
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                      -
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                      -
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: '#6B7280',
                    fontSize: '14px'
                  }}>
                    No timesheet data for {formatDisplayDate(selectedDate)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timesheet Entry Modal */}
      <TimesheetEntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditEntry(null);
        }}
        onSave={handleSaveEntry}
        editEntry={editEntry}
        currentUser={{ id: 1, role: 'admin' }}
      />
    </div>
  );
};

export { TimesheetsPage };
export default TimesheetsPage;

