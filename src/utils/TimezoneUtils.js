// Timezone and Time Utility Functions for Timesheet

// Get user's current timezone information
export const getUserTimezone = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-';
  
  return {
    timezone,
    offset,
    formatted: `${timezone} (GMT${sign}${hours}:${minutes.toString().padStart(2, '0')})`,
    shortFormat: `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`
  };
};

// Get current time in user's timezone
export const getCurrentTime = (format24Hour = true) => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour12: !format24Hour, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

// Get current time without seconds
export const getCurrentTimeShort = (format24Hour = true) => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour12: !format24Hour, 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Get current date in various formats
export const getCurrentDate = (format = 'iso') => {
  const now = new Date();
  
  switch (format) {
    case 'iso':
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'us':
      return now.toLocaleDateString('en-US'); // MM/DD/YYYY
    case 'long':
      return now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'short':
      return now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    default:
      return now.toISOString().split('T')[0];
  }
};

// Convert time string to minutes since midnight
export const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes since midnight to time string
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Calculate time difference in minutes
export const calculateTimeDifference = (startTime, endTime) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    return (24 * 60) - startMinutes + endMinutes;
  }
  
  return endMinutes - startMinutes;
};

// Calculate total hours from time entries
export const calculateTotalHoursFromEntries = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) return 0;
  
  let totalMinutes = 0;
  let lastInTime = null;
  let breakStart = null;
  let totalBreakMinutes = 0;
  
  // Sort entries by timestamp to ensure correct order
  const sortedEntries = [...timeEntries].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  sortedEntries.forEach(entry => {
    const entryMinutes = timeToMinutes(entry.time);
    
    switch (entry.type) {
      case 'in':
        lastInTime = entryMinutes;
        // If we were on break, calculate break duration
        if (breakStart !== null) {
          totalBreakMinutes += entryMinutes - breakStart;
          breakStart = null;
        }
        break;
        
      case 'break':
        if (lastInTime !== null) {
          // Add working time before break
          totalMinutes += entryMinutes - lastInTime;
          breakStart = entryMinutes;
          lastInTime = null;
        }
        break;
        
      case 'out':
        if (lastInTime !== null) {
          // Add working time before clocking out
          totalMinutes += entryMinutes - lastInTime;
          lastInTime = null;
        } else if (breakStart !== null) {
          // If clocking out from break, don't add break time
          breakStart = null;
        }
        break;
        
      default:
        break;
    }
  });
  
  // If still clocked in, calculate time until now
  if (lastInTime !== null) {
    const currentMinutes = timeToMinutes(getCurrentTimeShort());
    totalMinutes += currentMinutes - lastInTime;
  }
  
  return Math.max(0, totalMinutes / 60);
};

// Format duration in hours and minutes
export const formatDuration = (hours) => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
};

// Get time entry status based on current entries
export const getTimeEntryStatus = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) {
    return { status: 'out', canClockIn: true, canTakeBreak: false, canClockOut: false };
  }
  
  const lastEntry = timeEntries[timeEntries.length - 1];
  
  switch (lastEntry.type) {
    case 'in':
      return { 
        status: 'in', 
        canClockIn: false, 
        canTakeBreak: true, 
        canClockOut: true,
        lastAction: 'Clocked in',
        lastTime: lastEntry.time
      };
      
    case 'break':
      return { 
        status: 'break', 
        canClockIn: true, 
        canTakeBreak: false, 
        canClockOut: true,
        lastAction: 'On break',
        lastTime: lastEntry.time
      };
      
    case 'out':
      return { 
        status: 'out', 
        canClockIn: true, 
        canTakeBreak: false, 
        canClockOut: false,
        lastAction: 'Clocked out',
        lastTime: lastEntry.time
      };
      
    default:
      return { status: 'out', canClockIn: true, canTakeBreak: false, canClockOut: false };
  }
};

// Validate time entry sequence
export const validateTimeEntry = (timeEntries, newEntryType) => {
  const status = getTimeEntryStatus(timeEntries);
  
  switch (newEntryType) {
    case 'in':
      if (!status.canClockIn) {
        return { valid: false, message: 'Already clocked in. Please clock out or take a break first.' };
      }
      break;
      
    case 'break':
      if (!status.canTakeBreak) {
        return { valid: false, message: 'Must be clocked in to take a break.' };
      }
      break;
      
    case 'out':
      if (!status.canClockOut) {
        return { valid: false, message: 'Must be clocked in or on break to clock out.' };
      }
      break;
      
    default:
      return { valid: false, message: 'Invalid entry type.' };
  }
  
  return { valid: true, message: '' };
};

// Get split time information
export const getSplitTimeInfo = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) {
    return {
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      breakTime: 0,
      workingSince: null,
      onBreakSince: null
    };
  }
  
  const totalHours = calculateTotalHoursFromEntries(timeEntries);
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(0, totalHours - 8);
  
  const status = getTimeEntryStatus(timeEntries);
  let workingSince = null;
  let onBreakSince = null;
  
  if (status.status === 'in') {
    // Find the last 'in' entry
    for (let i = timeEntries.length - 1; i >= 0; i--) {
      if (timeEntries[i].type === 'in') {
        workingSince = timeEntries[i].time;
        break;
      }
    }
  } else if (status.status === 'break') {
    // Find the last 'break' entry
    for (let i = timeEntries.length - 1; i >= 0; i--) {
      if (timeEntries[i].type === 'break') {
        onBreakSince = timeEntries[i].time;
        break;
      }
    }
  }
  
  return {
    totalHours,
    regularHours,
    overtimeHours,
    breakTime: 0, // TODO: Calculate actual break time
    workingSince,
    onBreakSince,
    status: status.status,
    lastAction: status.lastAction,
    lastTime: status.lastTime
  };
};

