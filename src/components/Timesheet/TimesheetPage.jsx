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

const TimesheetPage = () => {
  // State for filters
  const [weekFilter, setWeekFilter] = useState('current');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortField, setSortField] = useState('employee.name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Get current week dates
  const currentWeek = getCurrentWeekDates();
  const [customStartDate, setCustomStartDate] = useState(currentWeek.start);
  const [customEndDate, setCustomEndDate] = useState(currentWeek.end);

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    if (weekFilter === 'current') {
      return currentWeek;
    } else if (weekFilter === 'last') {
      const lastWeekStart = new Date(currentWeek.start);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(currentWeek.end);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
      return {
        start: lastWeekStart.toISOString().split('T')[0],
        end: lastWeekEnd.toISOString().split('T')[0]
      };
    } else {
      return {
        start: customStartDate,
        end: customEndDate
      };
    }
  }, [weekFilter, customStartDate, customEndDate, currentWeek]);

  // Get filtered and sorted timesheet data
  const timesheetData = useMemo(() => {
    let data = generateWeeklyTimesheets(dateRange.start, dateRange.end);

    // Apply filters
    if (departmentFilter !== 'All Departments') {
      data = data.filter(timesheet => timesheet.employee.department === departmentFilter);
    }

    if (statusFilter !== 'All Status') {
      data = data.filter(timesheet => timesheet.status === statusFilter);
    }

    if (searchTerm) {
      data = data.filter(timesheet => 
        timesheet.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.campaigns.some(campaign => 
          campaign.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue, bValue;
      
      if (sortField.includes('.')) {
        const [obj, prop] = sortField.split('.');
        aValue = a[obj][prop];
        bValue = b[obj][prop];
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return data;
  }, [dateRange, departmentFilter, statusFilter, searchTerm, sortField, sortDirection]);

  // Get summary statistics
  const summary = useMemo(() => {
    return getTimesheetSummary(dateRange.start, dateRange.end);
  }, [dateRange]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
    // In a real app, this would save to a backend
    console.log('Saving timesheet entry:', entryData);
    // For demo purposes, we'll just close the modal
    setIsModalOpen(false);
    setEditEntry(null);
  };

  // Handle export actions
  const handleExport = (type) => {
    setShowExportMenu(false);
    
    switch (type) {
      case 'csv':
        exportFunctions.timesheets(timesheetData);
        break;
      case 'detailed':
        exportFunctions.detailed(dateRange.start, dateRange.end);
        break;
      case 'excel':
        exportFunctions.excel(timesheetData);
        break;
      case 'summary':
        exportFunctions.summary(dateRange.start, dateRange.end);
        break;
      case 'campaigns':
        exportFunctions.campaigns(dateRange.start, dateRange.end);
        break;
      default:
        break;
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Draft': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.Draft}`}>
        {status}
      </span>
    );
  };

  // Sort icon component
  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '32px' 
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
            Timesheets
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280' }}>
            Manage employee timesheets and track project hours
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#F9FAFB';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#FFFFFF';
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showExportMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                minWidth: '200px'
              }}>
                <div style={{ padding: '8px' }}>
                  <button
                    onClick={() => handleExport('csv')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#F3F4F6';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#F3F4F6';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('detailed')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#F3F4F6';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Detailed Report
                  </button>
                  <button
                    onClick={() => handleExport('summary')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#F3F4F6';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Summary Report
                  </button>
                  <button
                    onClick={() => handleExport('campaigns')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#374151',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#F3F4F6';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Campaign Report
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Entry Button */}
          <button
            onClick={handleAddEntry}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#FFFFFF',
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563EB';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3B82F6';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Entry
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Total Hours</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            {summary.totalHours.toFixed(1)}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Approved Timesheets</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
            {summary.approvedCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Pending Approval</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
            {summary.pendingCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Overtime Hours</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>
            {summary.overtimeHours.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          alignItems: 'end'
        }}>
          {/* Week Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Week Period
            </label>
            <select
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="current">Current Week</option>
              <option value="last">Last Week</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {weekFilter === 'custom' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </>
          )}

          {/* Department Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF'
              }}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF'
              }}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search employees, positions, campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Timesheet Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F9FAFB' }}>
              <tr>
                <th 
                  onClick={() => handleSort('employee.name')}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Employee
                    <SortIcon field="employee.name" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('weekPeriod')}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Week Period
                    <SortIcon field="weekPeriod" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('totalHours')}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    Total Hours
                    <SortIcon field="totalHours" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('regularHours')}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    Regular Hours
                    <SortIcon field="regularHours" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('overtimeHours')}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    Overtime Hours
                    <SortIcon field="overtimeHours" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('submittedAt')}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Submitted
                    <SortIcon field="submittedAt" />
                  </div>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {timesheetData.map((timesheet, index) => (
                <tr 
                  key={timesheet.id}
                  style={{
                    borderBottom: index < timesheetData.length - 1 ? '1px solid #F3F4F6' : 'none',
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={timesheet.employee.avatar}
                        alt={timesheet.employee.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {timesheet.employee.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          {timesheet.employee.position}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          {timesheet.employee.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {timesheet.weekPeriod}
                    {timesheet.campaigns.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                        {timesheet.campaigns.slice(0, 2).join(', ')}
                        {timesheet.campaigns.length > 2 && ` +${timesheet.campaigns.length - 2} more`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {timesheet.totalHours.toFixed(1)}h
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: '#374151' }}>
                    {timesheet.regularHours.toFixed(1)}h
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: timesheet.overtimeHours > 0 ? '#EF4444' : '#374151' }}>
                    {timesheet.overtimeHours.toFixed(1)}h
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <StatusBadge status={timesheet.status} />
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {formatDate(timesheet.submittedAt)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEditEntry(timesheet)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#3B82F6',
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #DBEAFE',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#DBEAFE';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#EFF6FF';
                        }}
                      >
                        View
                      </button>
                      {timesheet.status === 'Pending' && (
                        <button
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#10B981',
                            backgroundColor: '#ECFDF5',
                            border: '1px solid #D1FAE5',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#D1FAE5';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#ECFDF5';
                          }}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {timesheetData.length === 0 && (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              No timesheets found
            </div>
            <div style={{ fontSize: '14px' }}>
              Try adjusting your filters or date range
            </div>
          </div>
        )}
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
        currentUser={{ id: 1, role: 'admin' }} // Mock current user
      />

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5
          }}
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
};

export default TimesheetPage;

