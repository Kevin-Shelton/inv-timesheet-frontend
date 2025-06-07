// BillableHoursReporting.jsx - Comprehensive reporting system for billable hours

import React, { useState, useEffect } from 'react'
import { 
  FileText, Download, Calendar, Filter, TrendingUp, Users, 
  DollarSign, Clock, BarChart3, PieChart, Target, AlertCircle,
  ChevronDown, ChevronUp, Eye, Mail, Printer
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, 
  Pie, Cell, AreaChart, Area
} from 'recharts'

function BillableHoursReporting() {
  const [reportType, setReportType] = useState('utilization')
  const [period, setPeriod] = useState('weekly')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [selectedResource, setSelectedResource] = useState('all')
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    details: false,
    trends: false
  })

  // Mock reporting data
  const reportData = {
    summary: {
      total_billable_hours: 1247,
      total_revenue: 85395,
      average_utilization: 78.5,
      total_resources: 16,
      active_projects: 8,
      top_performer: 'Jane Smith',
      revenue_growth: 12.3,
      utilization_trend: 2.1
    },
    dailyData: [
      { date: '2024-01-01', billable_hours: 178, revenue: 12150, utilization: 85.2, resources: 16 },
      { date: '2024-01-02', billable_hours: 165, revenue: 11340, utilization: 78.9, resources: 16 },
      { date: '2024-01-03', billable_hours: 182, revenue: 12580, utilization: 87.1, resources: 16 },
      { date: '2024-01-04', billable_hours: 156, revenue: 10920, utilization: 74.6, resources: 16 },
      { date: '2024-01-05', billable_hours: 189, revenue: 13230, utilization: 90.4, resources: 16 },
      { date: '2024-01-06', billable_hours: 145, revenue: 9875, utilization: 69.3, resources: 16 },
      { date: '2024-01-07', billable_hours: 172, revenue: 11800, utilization: 82.3, resources: 16 }
    ],
    weeklyData: [
      { week: 'Week 1', billable_hours: 1247, revenue: 85395, utilization: 78.5, efficiency: 87.2 },
      { week: 'Week 2', billable_hours: 1189, revenue: 81230, utilization: 74.9, efficiency: 85.8 },
      { week: 'Week 3', billable_hours: 1298, revenue: 89150, utilization: 81.7, efficiency: 89.1 },
      { week: 'Week 4', billable_hours: 1156, revenue: 78940, utilization: 72.8, efficiency: 84.3 }
    ],
    monthlyData: [
      { month: 'Jan 2024', billable_hours: 4890, revenue: 334715, utilization: 76.9, efficiency: 86.6 },
      { month: 'Dec 2023', billable_hours: 4567, revenue: 312890, utilization: 71.8, efficiency: 84.2 },
      { month: 'Nov 2023', billable_hours: 4723, revenue: 323450, utilization: 74.3, efficiency: 85.1 },
      { month: 'Oct 2023', billable_hours: 4612, revenue: 315780, utilization: 72.6, efficiency: 83.9 }
    ],
    teamBreakdown: [
      { 
        team: 'Engineering', 
        billable_hours: 456, 
        revenue: 34200, 
        utilization: 78.9, 
        resources: 6,
        avg_rate: 75,
        projects: 3
      },
      { 
        team: 'Design', 
        billable_hours: 312, 
        revenue: 20280, 
        utilization: 81.7, 
        resources: 4,
        avg_rate: 65,
        projects: 2
      },
      { 
        team: 'Analytics', 
        billable_hours: 278, 
        revenue: 15290, 
        utilization: 76.0, 
        resources: 3,
        avg_rate: 55,
        projects: 2
      },
      { 
        team: 'Management', 
        billable_hours: 201, 
        revenue: 15625, 
        utilization: 56.3, 
        resources: 3,
        avg_rate: 85,
        projects: 1
      }
    ],
    resourceDetails: [
      {
        name: 'John Doe',
        team: 'Engineering',
        billable_hours: 32,
        revenue: 2400,
        utilization: 80.0,
        efficiency: 92.1,
        projects: ['Website Redesign', 'Mobile App', 'API Development'],
        top_client: 'Acme Corp',
        hourly_rate: 75
      },
      {
        name: 'Jane Smith',
        team: 'Design',
        billable_hours: 35,
        revenue: 2275,
        utilization: 87.5,
        efficiency: 89.3,
        projects: ['Brand Identity', 'UI Design'],
        top_client: 'Tech Solutions',
        hourly_rate: 65
      },
      {
        name: 'Mike Johnson',
        team: 'Analytics',
        billable_hours: 28,
        revenue: 1540,
        utilization: 70.0,
        efficiency: 85.7,
        projects: ['Data Analysis', 'Reporting', 'KPI Dashboard', 'Market Research'],
        top_client: 'Global Industries',
        hourly_rate: 55
      }
    ],
    clientAnalysis: [
      { 
        client: 'Acme Corp', 
        revenue: 25420, 
        hours: 342, 
        projects: 3, 
        avg_rate: 74.27,
        utilization_impact: 18.2
      },
      { 
        client: 'Tech Solutions', 
        revenue: 18680, 
        hours: 245, 
        projects: 2, 
        avg_rate: 76.24,
        utilization_impact: 13.1
      },
      { 
        client: 'Global Industries', 
        revenue: 15850, 
        hours: 198, 
        projects: 2, 
        avg_rate: 80.05,
        utilization_impact: 10.6
      },
      { 
        client: 'StartupXYZ', 
        revenue: 12200, 
        hours: 156, 
        projects: 1, 
        avg_rate: 78.21,
        utilization_impact: 8.3
      }
    ]
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const generateReport = async () => {
    setLoading(true)
    // Mock report generation
    setTimeout(() => {
      setLoading(false)
      alert(`${reportType} report generated for ${period} period`)
    }, 2000)
  }

  const exportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}`)
  }

  const getCurrentData = () => {
    switch (period) {
      case 'daily':
        return reportData.dailyData
      case 'weekly':
        return reportData.weeklyData
      case 'monthly':
        return reportData.monthlyData
      default:
        return reportData.weeklyData
    }
  }

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <div className="flex flex-col lg-flex-row lg-items-center lg-justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billable Hours Reporting</h1>
          <p className="text-gray-600 mt-1">Comprehensive reports and analytics for billable hours</p>
        </div>
        <div className="flex flex-col sm-flex-row gap-2">
          <button
            onClick={generateReport}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="loading-spinner"></div>
                Generating...
              </div>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => exportReport('pdf')}
              className="btn btn-outline btn-sm"
              title="Export as PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="btn btn-outline btn-sm"
              title="Export as Excel"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-outline btn-sm"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Report Configuration</h3>
          <p className="card-description">Configure your report parameters</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="form-select"
              >
                <option value="utilization">Utilization Report</option>
                <option value="revenue">Revenue Report</option>
                <option value="resource">Resource Report</option>
                <option value="client">Client Analysis</option>
                <option value="project">Project Report</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="form-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="form-select"
              >
                <option value="all">All Teams</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="analytics">Analytics</option>
                <option value="management">Management</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Resource</label>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="form-select"
              >
                <option value="all">All Resources</option>
                <option value="john_doe">John Doe</option>
                <option value="jane_smith">Jane Smith</option>
                <option value="mike_johnson">Mike Johnson</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">Executive Summary</h3>
              <p className="card-description">Key metrics and performance indicators</p>
            </div>
            <button
              onClick={() => toggleSection('summary')}
              className="btn-icon"
            >
              {expandedSections.summary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {expandedSections.summary && (
          <div className="card-content">
            <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-icon bg-blue-100">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Billable Hours</p>
                  <p className="stat-value text-blue-600">{reportData.summary.total_billable_hours.toLocaleString()}h</p>
                  <p className="stat-change text-green-600">+{reportData.summary.utilization_trend}% vs last period</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Revenue</p>
                  <p className="stat-value text-green-600">${reportData.summary.total_revenue.toLocaleString()}</p>
                  <p className="stat-change text-green-600">+{reportData.summary.revenue_growth}% growth</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon bg-purple-100">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Average Utilization</p>
                  <p className="stat-value text-purple-600">{reportData.summary.average_utilization}%</p>
                  <p className="stat-change text-green-600">Above 75% target</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon bg-orange-100">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Active Resources</p>
                  <p className="stat-value text-orange-600">{reportData.summary.total_resources}</p>
                  <p className="stat-change text-gray-600">{reportData.summary.active_projects} active projects</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trends Analysis */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">Trends Analysis</h3>
              <p className="card-description">{period.charAt(0).toUpperCase() + period.slice(1)} performance trends</p>
            </div>
            <button
              onClick={() => toggleSection('trends')}
              className="btn-icon"
            >
              {expandedSections.trends ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {expandedSections.trends && (
          <div className="card-content">
            <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
              <div className="chart-container">
                <h4 className="text-lg font-medium mb-4">Billable Hours & Revenue Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getCurrentData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month'} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="billable_hours" 
                      stroke="#3B82F6" 
                      name="Billable Hours" 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      name="Revenue ($)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h4 className="text-lg font-medium mb-4">Utilization Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getCurrentData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month'} />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="utilization" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                      name="Utilization %" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Team Performance Breakdown</h3>
          <p className="card-description">Detailed analysis by team</p>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Team</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Billable Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Avg Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Resources</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Projects</th>
                </tr>
              </thead>
              <tbody>
                {reportData.teamBreakdown.map((team, index) => (
                  <tr key={index} className="border-b hover-bg-gray-50">
                    <td className="py-3 px-4 font-medium">{team.team}</td>
                    <td className="py-3 px-4">{team.billable_hours}h</td>
                    <td className="py-3 px-4 text-green-600 font-medium">
                      ${team.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className={`mr-2 font-medium ${
                          team.utilization >= 75 ? 'text-green-600' : 
                          team.utilization >= 65 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {team.utilization}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              team.utilization >= 75 ? 'bg-green-600' : 
                              team.utilization >= 65 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{width: `${team.utilization}%`}}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">${team.avg_rate}/hr</td>
                    <td className="py-3 px-4">{team.resources}</td>
                    <td className="py-3 px-4">{team.projects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resource Details */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">Resource Details</h3>
              <p className="card-description">Individual resource performance</p>
            </div>
            <button
              onClick={() => toggleSection('details')}
              className="btn-icon"
            >
              {expandedSections.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {expandedSections.details && (
          <div className="card-content">
            <div className="space-y-4">
              {reportData.resourceDetails.map((resource, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">
                          {resource.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{resource.name}</h4>
                        <p className="text-sm text-gray-600">{resource.team}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">${resource.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{resource.billable_hours}h billable</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md-grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Utilization</p>
                      <div className="flex items-center mt-1">
                        <span className="font-medium mr-2">{resource.utilization}%</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${resource.utilization}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Efficiency</p>
                      <p className="font-medium">{resource.efficiency}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hourly Rate</p>
                      <p className="font-medium">${resource.hourly_rate}/hr</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resource.projects.map((project, idx) => (
                        <span key={idx} className="badge badge-blue text-xs">
                          {project}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Client Analysis */}
      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Client Revenue Distribution</h3>
            <p className="card-description">Revenue breakdown by client</p>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={reportData.clientAnalysis}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({client, revenue}) => `${client}: $${revenue.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {reportData.clientAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Client Performance Metrics</h3>
            <p className="card-description">Key metrics by client</p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {reportData.clientAnalysis.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{client.client}</p>
                    <p className="text-sm text-gray-600">
                      {client.hours}h • {client.projects} projects • ${client.avg_rate.toFixed(2)}/hr avg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${client.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{client.utilization_impact}% of total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillableHoursReporting

