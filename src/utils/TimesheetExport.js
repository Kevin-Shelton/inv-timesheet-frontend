// Timesheet Export Functionality

import { 
  generateWeeklyTimesheets, 
  getEmployeeById, 
  getCampaignById, 
  timeEntriesData,
  formatDate 
} from '../data/TimesheetData';

// Export timesheet data to CSV format
export const exportToCSV = (data, filename = 'timesheets.csv') => {
  const headers = [
    'Employee Name',
    'Employee ID',
    'Position',
    'Department',
    'Week Period',
    'Total Hours',
    'Regular Hours',
    'Overtime Hours',
    'Status',
    'Submitted Date',
    'Campaigns/Projects',
    'Number of Entries'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(timesheet => [
      `"${timesheet.employee.name}"`,
      timesheet.employee.id,
      `"${timesheet.employee.position}"`,
      `"${timesheet.employee.department}"`,
      `"${timesheet.weekPeriod}"`,
      timesheet.totalHours.toFixed(2),
      timesheet.regularHours.toFixed(2),
      timesheet.overtimeHours.toFixed(2),
      timesheet.status,
      formatDate(timesheet.submittedAt),
      `"${timesheet.campaigns.join('; ')}"`,
      timesheet.entries
    ].join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

// Export detailed time entries to CSV
export const exportDetailedToCSV = (startDate, endDate, filename = 'detailed_timesheet.csv') => {
  const entries = timeEntriesData.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entryDate >= start && entryDate <= end;
  });

  const headers = [
    'Date',
    'Employee Name',
    'Employee ID',
    'Position',
    'Department',
    'Campaign/Project',
    'Client',
    'Start Time',
    'End Time',
    'Break Time (hours)',
    'Total Hours',
    'Regular Hours',
    'Overtime Hours',
    'Description',
    'Status',
    'Submitted Date',
    'Approved Date',
    'Approved By'
  ];

  const csvContent = [
    headers.join(','),
    ...entries.map(entry => {
      const employee = getEmployeeById(entry.employeeId);
      const campaign = getCampaignById(entry.campaignId);
      
      return [
        entry.date,
        `"${employee?.name || 'Unknown'}"`,
        entry.employeeId,
        `"${employee?.position || 'Unknown'}"`,
        `"${employee?.department || 'Unknown'}"`,
        `"${campaign?.name || 'Unknown'}"`,
        `"${campaign?.client || 'Unknown'}"`,
        entry.startTime,
        entry.endTime,
        entry.breakTime.toFixed(2),
        entry.totalHours.toFixed(2),
        entry.regularHours.toFixed(2),
        entry.overtimeHours.toFixed(2),
        `"${entry.description.replace(/"/g, '""')}"`,
        entry.status,
        formatDate(entry.submittedAt),
        entry.approvedAt ? formatDate(entry.approvedAt) : '',
        entry.approvedBy || ''
      ].join(',');
    })
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

// Export timesheet data to Excel format (simplified CSV with Excel-friendly formatting)
export const exportToExcel = (data, filename = 'timesheets.xlsx') => {
  // Create a more Excel-friendly CSV format
  const headers = [
    'Employee Name',
    'Employee ID',
    'Position',
    'Department',
    'Week Start',
    'Week End',
    'Total Hours',
    'Regular Hours',
    'Overtime Hours',
    'Status',
    'Submitted Date',
    'Primary Campaign',
    'All Campaigns',
    'Hourly Rate',
    'Total Pay (Regular)',
    'Total Pay (Overtime)',
    'Total Pay (All)'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(timesheet => {
      const weekDates = timesheet.weekPeriod.split(' - ');
      const regularPay = timesheet.regularHours * (timesheet.employee.hourlyRate || 0);
      const overtimePay = timesheet.overtimeHours * (timesheet.employee.hourlyRate || 0) * 1.5;
      const totalPay = regularPay + overtimePay;

      return [
        `"${timesheet.employee.name}"`,
        timesheet.employee.id,
        `"${timesheet.employee.position}"`,
        `"${timesheet.employee.department}"`,
        weekDates[0]?.trim() || '',
        weekDates[1]?.trim() || '',
        timesheet.totalHours.toFixed(2),
        timesheet.regularHours.toFixed(2),
        timesheet.overtimeHours.toFixed(2),
        timesheet.status,
        formatDate(timesheet.submittedAt),
        `"${timesheet.campaigns[0] || ''}"`,
        `"${timesheet.campaigns.join('; ')}"`,
        timesheet.employee.hourlyRate || 0,
        regularPay.toFixed(2),
        overtimePay.toFixed(2),
        totalPay.toFixed(2)
      ].join(',');
    })
  ].join('\n');

  // Use .csv extension but name it as Excel file
  downloadFile(csvContent, filename.replace('.xlsx', '.csv'), 'text/csv');
};

// Export summary report
export const exportSummaryReport = (startDate, endDate, filename = 'timesheet_summary.csv') => {
  const entries = timeEntriesData.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entryDate >= start && entryDate <= end;
  });

  // Calculate summary by employee
  const employeeSummary = {};
  entries.forEach(entry => {
    const employee = getEmployeeById(entry.employeeId);
    const key = entry.employeeId;
    
    if (!employeeSummary[key]) {
      employeeSummary[key] = {
        employee,
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        entries: 0,
        campaigns: new Set(),
        approvedEntries: 0,
        pendingEntries: 0
      };
    }
    
    employeeSummary[key].totalHours += entry.totalHours;
    employeeSummary[key].regularHours += entry.regularHours;
    employeeSummary[key].overtimeHours += entry.overtimeHours;
    employeeSummary[key].entries += 1;
    
    const campaign = getCampaignById(entry.campaignId);
    if (campaign) {
      employeeSummary[key].campaigns.add(campaign.name);
    }
    
    if (entry.status === 'Approved') {
      employeeSummary[key].approvedEntries += 1;
    } else if (entry.status === 'Pending') {
      employeeSummary[key].pendingEntries += 1;
    }
  });

  const headers = [
    'Employee Name',
    'Department',
    'Position',
    'Total Hours',
    'Regular Hours',
    'Overtime Hours',
    'Total Entries',
    'Approved Entries',
    'Pending Entries',
    'Campaigns Worked On',
    'Hourly Rate',
    'Regular Pay',
    'Overtime Pay',
    'Total Pay'
  ];

  const csvContent = [
    headers.join(','),
    ...Object.values(employeeSummary).map(summary => {
      const regularPay = summary.regularHours * (summary.employee.hourlyRate || 0);
      const overtimePay = summary.overtimeHours * (summary.employee.hourlyRate || 0) * 1.5;
      const totalPay = regularPay + overtimePay;

      return [
        `"${summary.employee.name}"`,
        `"${summary.employee.department}"`,
        `"${summary.employee.position}"`,
        summary.totalHours.toFixed(2),
        summary.regularHours.toFixed(2),
        summary.overtimeHours.toFixed(2),
        summary.entries,
        summary.approvedEntries,
        summary.pendingEntries,
        `"${Array.from(summary.campaigns).join('; ')}"`,
        summary.employee.hourlyRate || 0,
        regularPay.toFixed(2),
        overtimePay.toFixed(2),
        totalPay.toFixed(2)
      ].join(',');
    })
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

// Export campaign/project report
export const exportCampaignReport = (startDate, endDate, filename = 'campaign_report.csv') => {
  const entries = timeEntriesData.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entryDate >= start && entryDate <= end;
  });

  // Calculate summary by campaign
  const campaignSummary = {};
  entries.forEach(entry => {
    const campaign = getCampaignById(entry.campaignId);
    const key = entry.campaignId;
    
    if (!campaignSummary[key]) {
      campaignSummary[key] = {
        campaign,
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        entries: 0,
        employees: new Set(),
        totalCost: 0
      };
    }
    
    const employee = getEmployeeById(entry.employeeId);
    const hourlyRate = employee?.hourlyRate || 0;
    const regularCost = entry.regularHours * hourlyRate;
    const overtimeCost = entry.overtimeHours * hourlyRate * 1.5;
    
    campaignSummary[key].totalHours += entry.totalHours;
    campaignSummary[key].regularHours += entry.regularHours;
    campaignSummary[key].overtimeHours += entry.overtimeHours;
    campaignSummary[key].entries += 1;
    campaignSummary[key].employees.add(employee?.name || 'Unknown');
    campaignSummary[key].totalCost += regularCost + overtimeCost;
  });

  const headers = [
    'Campaign/Project',
    'Client',
    'Status',
    'Budget',
    'Total Hours',
    'Regular Hours',
    'Overtime Hours',
    'Total Entries',
    'Team Members',
    'Labor Cost',
    'Budget Utilization %'
  ];

  const csvContent = [
    headers.join(','),
    ...Object.values(campaignSummary).map(summary => {
      const budgetUtilization = summary.campaign?.budget 
        ? ((summary.totalCost / summary.campaign.budget) * 100).toFixed(1)
        : '0';

      return [
        `"${summary.campaign?.name || 'Unknown'}"`,
        `"${summary.campaign?.client || 'Unknown'}"`,
        `"${summary.campaign?.status || 'Unknown'}"`,
        summary.campaign?.budget || 0,
        summary.totalHours.toFixed(2),
        summary.regularHours.toFixed(2),
        summary.overtimeHours.toFixed(2),
        summary.entries,
        `"${Array.from(summary.employees).join('; ')}"`,
        summary.totalCost.toFixed(2),
        budgetUtilization
      ].join(',');
    })
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

// Utility function to download file
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Generate filename with current date
export const generateFilename = (baseName, extension = 'csv') => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  return `${baseName}_${dateStr}.${extension}`;
};

// Export functions with default filenames
export const exportFunctions = {
  timesheets: (data) => exportToCSV(data, generateFilename('timesheets')),
  detailed: (startDate, endDate) => exportDetailedToCSV(startDate, endDate, generateFilename('detailed_timesheet')),
  excel: (data) => exportToExcel(data, generateFilename('timesheets', 'xlsx')),
  summary: (startDate, endDate) => exportSummaryReport(startDate, endDate, generateFilename('timesheet_summary')),
  campaigns: (startDate, endDate) => exportCampaignReport(startDate, endDate, generateFilename('campaign_report'))
};

