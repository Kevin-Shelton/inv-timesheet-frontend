// Comprehensive Timesheet Data Structure with Campaign Integration

// Campaign/Project Data
export const campaignsData = [
  {
    id: 1,
    name: "Q4 Marketing Campaign",
    client: "TechCorp Inc",
    status: "Active",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    budget: 50000,
    description: "Comprehensive marketing campaign for Q4 product launch",
    teamMembers: ["john.doe", "sarah.wilson", "mike.johnson"],
    color: "#3B82F6"
  },
  {
    id: 2,
    name: "Website Redesign",
    client: "StartupXYZ",
    status: "Active",
    startDate: "2024-11-01",
    endDate: "2025-01-15",
    budget: 75000,
    description: "Complete website redesign and development project",
    teamMembers: ["sarah.wilson", "alex.chen", "emily.davis"],
    color: "#10B981"
  },
  {
    id: 3,
    name: "Mobile App Development",
    client: "RetailCorp",
    status: "Active",
    startDate: "2024-09-15",
    endDate: "2025-02-28",
    budget: 120000,
    description: "Native mobile app development for iOS and Android",
    teamMembers: ["alex.chen", "mike.johnson", "lisa.brown"],
    color: "#F59E0B"
  },
  {
    id: 4,
    name: "Data Analytics Platform",
    client: "FinanceGroup",
    status: "Planning",
    startDate: "2025-01-01",
    endDate: "2025-06-30",
    budget: 200000,
    description: "Custom data analytics and reporting platform",
    teamMembers: ["john.doe", "alex.chen"],
    color: "#8B5CF6"
  },
  {
    id: 5,
    name: "Brand Identity Refresh",
    client: "FashionBrand",
    status: "Completed",
    startDate: "2024-08-01",
    endDate: "2024-10-31",
    budget: 35000,
    description: "Complete brand identity and logo redesign",
    teamMembers: ["emily.davis", "sarah.wilson"],
    color: "#EF4444"
  }
];

// Employee Data
export const employeesData = [
  {
    id: 1,
    username: "john.doe",
    name: "John Doe",
    email: "john.doe@invictus.com",
    position: "Senior Developer",
    department: "Engineering",
    hourlyRate: 85,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    startDate: "2023-01-15",
    status: "Active"
  },
  {
    id: 2,
    username: "sarah.wilson",
    name: "Sarah Wilson",
    email: "sarah.wilson@invictus.com",
    position: "Project Manager",
    department: "Management",
    hourlyRate: 75,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    startDate: "2023-03-01",
    status: "Active"
  },
  {
    id: 3,
    username: "mike.johnson",
    name: "Mike Johnson",
    email: "mike.johnson@invictus.com",
    position: "UI/UX Designer",
    department: "Design",
    hourlyRate: 70,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    startDate: "2023-02-15",
    status: "Active"
  },
  {
    id: 4,
    username: "alex.chen",
    name: "Alex Chen",
    email: "alex.chen@invictus.com",
    position: "Full Stack Developer",
    department: "Engineering",
    hourlyRate: 80,
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
    startDate: "2023-04-01",
    status: "Active"
  },
  {
    id: 5,
    username: "emily.davis",
    name: "Emily Davis",
    email: "emily.davis@invictus.com",
    position: "Marketing Specialist",
    department: "Marketing",
    hourlyRate: 65,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    startDate: "2023-05-15",
    status: "Active"
  },
  {
    id: 6,
    username: "lisa.brown",
    name: "Lisa Brown",
    email: "lisa.brown@invictus.com",
    position: "QA Engineer",
    department: "Engineering",
    hourlyRate: 72,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    startDate: "2023-06-01",
    status: "Active"
  }
];

// Time Entry Data
export const timeEntriesData = [
  // Week of Dec 9-15, 2024
  {
    id: 1,
    employeeId: 1,
    campaignId: 1,
    date: "2024-12-09",
    startTime: "09:00",
    endTime: "17:30",
    breakTime: 0.5,
    totalHours: 8,
    regularHours: 8,
    overtimeHours: 0,
    description: "Frontend development for campaign landing page",
    status: "Approved",
    submittedAt: "2024-12-09T18:00:00Z",
    approvedAt: "2024-12-10T09:00:00Z",
    approvedBy: "sarah.wilson"
  },
  {
    id: 2,
    employeeId: 1,
    campaignId: 1,
    date: "2024-12-10",
    startTime: "09:00",
    endTime: "18:00",
    breakTime: 0.5,
    totalHours: 8.5,
    regularHours: 8,
    overtimeHours: 0.5,
    description: "API integration and testing",
    status: "Approved",
    submittedAt: "2024-12-10T18:30:00Z",
    approvedAt: "2024-12-11T09:00:00Z",
    approvedBy: "sarah.wilson"
  },
  {
    id: 3,
    employeeId: 1,
    campaignId: 2,
    date: "2024-12-11",
    startTime: "09:00",
    endTime: "17:00",
    breakTime: 0.5,
    totalHours: 7.5,
    regularHours: 7.5,
    overtimeHours: 0,
    description: "Website redesign consultation",
    status: "Approved",
    submittedAt: "2024-12-11T17:30:00Z",
    approvedAt: "2024-12-12T09:00:00Z",
    approvedBy: "sarah.wilson"
  },
  {
    id: 4,
    employeeId: 2,
    campaignId: 1,
    date: "2024-12-09",
    startTime: "08:30",
    endTime: "17:00",
    breakTime: 0.5,
    totalHours: 8,
    regularHours: 8,
    overtimeHours: 0,
    description: "Project planning and team coordination",
    status: "Approved",
    submittedAt: "2024-12-09T17:30:00Z",
    approvedAt: "2024-12-10T08:30:00Z",
    approvedBy: "admin"
  },
  {
    id: 5,
    employeeId: 2,
    campaignId: 2,
    date: "2024-12-10",
    startTime: "08:30",
    endTime: "17:30",
    breakTime: 0.5,
    totalHours: 8.5,
    regularHours: 8,
    overtimeHours: 0.5,
    description: "Client meetings and requirements gathering",
    status: "Approved",
    submittedAt: "2024-12-10T18:00:00Z",
    approvedAt: "2024-12-11T08:30:00Z",
    approvedBy: "admin"
  },
  {
    id: 6,
    employeeId: 3,
    campaignId: 2,
    date: "2024-12-09",
    startTime: "09:30",
    endTime: "18:00",
    breakTime: 0.5,
    totalHours: 8,
    regularHours: 8,
    overtimeHours: 0,
    description: "UI mockups and design system creation",
    status: "Pending",
    submittedAt: "2024-12-09T18:30:00Z",
    approvedAt: null,
    approvedBy: null
  },
  {
    id: 7,
    employeeId: 3,
    campaignId: 3,
    date: "2024-12-10",
    startTime: "09:30",
    endTime: "17:30",
    breakTime: 0.5,
    totalHours: 7.5,
    regularHours: 7.5,
    overtimeHours: 0,
    description: "Mobile app wireframes and prototyping",
    status: "Approved",
    submittedAt: "2024-12-10T18:00:00Z",
    approvedAt: "2024-12-11T09:30:00Z",
    approvedBy: "sarah.wilson"
  },
  {
    id: 8,
    employeeId: 4,
    campaignId: 3,
    date: "2024-12-09",
    startTime: "09:00",
    endTime: "18:30",
    breakTime: 0.5,
    totalHours: 9,
    regularHours: 8,
    overtimeHours: 1,
    description: "Mobile app backend development",
    status: "Approved",
    submittedAt: "2024-12-09T19:00:00Z",
    approvedAt: "2024-12-10T09:00:00Z",
    approvedBy: "sarah.wilson"
  },
  {
    id: 9,
    employeeId: 4,
    campaignId: 2,
    date: "2024-12-10",
    startTime: "09:00",
    endTime: "17:00",
    breakTime: 0.5,
    totalHours: 7.5,
    regularHours: 7.5,
    overtimeHours: 0,
    description: "Website backend integration",
    status: "Approved",
    submittedAt: "2024-12-10T17:30:00Z",
    approvedAt: "2024-12-11T09:00:00Z",
    approvedBy: "sarah.wilson"
  },
  {
    id: 10,
    employeeId: 5,
    campaignId: 1,
    date: "2024-12-09",
    startTime: "08:00",
    endTime: "16:30",
    breakTime: 0.5,
    totalHours: 8,
    regularHours: 8,
    overtimeHours: 0,
    description: "Marketing campaign content creation",
    status: "Approved",
    submittedAt: "2024-12-09T17:00:00Z",
    approvedAt: "2024-12-10T08:00:00Z",
    approvedBy: "sarah.wilson"
  },
  {
    id: 11,
    employeeId: 5,
    campaignId: 5,
    date: "2024-12-10",
    startTime: "08:00",
    endTime: "17:00",
    breakTime: 0.5,
    totalHours: 8.5,
    regularHours: 8,
    overtimeHours: 0.5,
    description: "Brand identity final deliverables",
    status: "Pending",
    submittedAt: "2024-12-10T17:30:00Z",
    approvedAt: null,
    approvedBy: null
  },
  {
    id: 12,
    employeeId: 6,
    campaignId: 3,
    date: "2024-12-09",
    startTime: "09:00",
    endTime: "17:30",
    breakTime: 0.5,
    totalHours: 8,
    regularHours: 8,
    overtimeHours: 0,
    description: "Mobile app testing and quality assurance",
    status: "Approved",
    submittedAt: "2024-12-09T18:00:00Z",
    approvedAt: "2024-12-10T09:00:00Z",
    approvedBy: "sarah.wilson"
  }
];

// Utility functions for timesheet calculations
export const getEmployeeById = (id) => {
  return employeesData.find(emp => emp.id === id);
};

export const getCampaignById = (id) => {
  return campaignsData.find(campaign => campaign.id === id);
};

export const getTimeEntriesByEmployee = (employeeId, startDate, endDate) => {
  return timeEntriesData.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entry.employeeId === employeeId && entryDate >= start && entryDate <= end;
  });
};

export const getTimeEntriesByWeek = (startDate, endDate) => {
  return timeEntriesData.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entryDate >= start && entryDate <= end;
  });
};

export const calculateWeeklyHours = (employeeId, startDate, endDate) => {
  const entries = getTimeEntriesByEmployee(employeeId, startDate, endDate);
  return entries.reduce((totals, entry) => {
    totals.total += entry.totalHours;
    totals.regular += entry.regularHours;
    totals.overtime += entry.overtimeHours;
    return totals;
  }, { total: 0, regular: 0, overtime: 0 });
};

export const getTimesheetSummary = (startDate, endDate) => {
  const entries = getTimeEntriesByWeek(startDate, endDate);
  const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const overtimeHours = entries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
  const approvedCount = entries.filter(entry => entry.status === 'Approved').length;
  const pendingCount = entries.filter(entry => entry.status === 'Pending').length;
  
  return {
    totalHours,
    overtimeHours,
    approvedCount,
    pendingCount,
    totalEntries: entries.length
  };
};

// Generate weekly timesheet data for display
export const generateWeeklyTimesheets = (startDate, endDate) => {
  const timesheets = [];
  
  employeesData.forEach(employee => {
    const weeklyHours = calculateWeeklyHours(employee.id, startDate, endDate);
    const entries = getTimeEntriesByEmployee(employee.id, startDate, endDate);
    
    if (entries.length > 0) {
      const latestEntry = entries.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
      const hasApproved = entries.some(entry => entry.status === 'Approved');
      const hasPending = entries.some(entry => entry.status === 'Pending');
      
      let status = 'Approved';
      if (hasPending) status = 'Pending';
      if (!hasApproved && !hasPending) status = 'Draft';
      
      timesheets.push({
        id: `${employee.id}-${startDate}`,
        employee,
        weekPeriod: `${formatDate(startDate)} - ${formatDate(endDate)}`,
        totalHours: weeklyHours.total,
        regularHours: weeklyHours.regular,
        overtimeHours: weeklyHours.overtime,
        status,
        submittedAt: latestEntry.submittedAt,
        entries: entries.length,
        campaigns: [...new Set(entries.map(entry => getCampaignById(entry.campaignId)?.name).filter(Boolean))]
      });
    }
  });
  
  return timesheets.sort((a, b) => a.employee.name.localeCompare(b.employee.name));
};

// Utility function to format dates
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Get current week dates
export const getCurrentWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  };
};

// Department list for filtering
export const departments = [
  'All Departments',
  'Engineering',
  'Design',
  'Marketing',
  'Management'
];

// Status list for filtering
export const statusOptions = [
  'All Status',
  'Approved',
  'Pending',
  'Draft'
];

