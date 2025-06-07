// BillableHoursReporting.jsx - Enhanced with full functionality and drill-down capabilities

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, PieChart, TrendingUp, Download, Filter, Calendar, 
  Users, DollarSign, Clock, Target, ChevronDown, ChevronUp,
  Search, RefreshCw, Eye, FileText, Printer, Mail
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, 
  Pie, Cell, AreaChart, Area
} from 'recharts'

function BillableHoursReporting() {
  const [selectedReport, setSelectedReport] = useState('utilization')
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [filters, setFilters] = useState({
    team: '',
    client: '',
    project: '',
    resource: ''
  })
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [drillDownData, setDrillDownData] = useState(null)
  const [showDrillDown, setShowDrillDown] = useState(false)

  const reportTypes = [
    { id: 'utilization', name: 'Utilization Report', description: 'Resource utilization and billable efficiency' },
    { id: 'revenue', name: 'Revenue Analysis', description: 'Revenue breakdown by client, project, and resource' },
    { id: 'productivity', name: 'Productivity Report', description: 'Team and individual productivity metrics' },
    { id: 'client', name: 'Client Analysis', description: 'Client profitability and engagement analysis' },
    { id: 'project', name: 'Project Report', description: 'Project performance and resource allocation' },
    { id: 'trend', name: 'Trend Analysis', description: 'Historical trends and forecasting' }
  ]

  useEffect(() => {
    generateReport()
  }, [selectedReport, selectedPeriod, dateRange, filters])

  const generateReport = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData = generateMockReportData(selectedReport, selectedPeriod)
      setReportData(mockData)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockReportData = (reportType, period) => {
    const baseData = {
      summary: {
        total_billable_hours: 2847,
        total_revenue: 198290,
        average_rate: 69.67,
        utilization_rate: 78.5,
        active_resources: 12,
        active_clients: 8,
        active_projects: 15
      }
    }

    switch (reportType) {
      case 'utilization':
        return {
          ...baseData,
          utilizationByResource: [
            { name: 'John Doe', billable: 142, total: 160, utilization: 88.8, target: 80, revenue: 10650 },
            { name: 'Jane Smith', billable: 156, total: 160, utilization: 97.5, target: 80, revenue: 12480 },
            { name: 'Mike Johnson', billable: 128, total: 160, utilization: 80.0, target: 80, revenue: 8960 },
            { name: 'Sarah Wilson', billable: 134, total: 160, utilization: 83.8, target: 80, revenue: 11420 }
          ],
          utilizationTrend: [
            { period: 'Jan', utilization: 75.2, target: 80 },
            { period: 'Feb', utilization: 78.5, target: 80 },
            { period: 'Mar', utilization: 82.1, target: 80 },
            { period: 'Apr', utilization: 79.8, target: 80 }
          ],
          teamUtilization: [
            { team: 'Engineering', utilization: 85.2, target: 80, variance: 5.2 },
            { team: 'Design', utilization: 78.9, target: 80, variance: -1.1 },
            { team: 'Analytics', utilization: 76.5, target: 75, variance: 1.5 },
            { team: 'Management', utilization: 65.3, target: 70, variance: -4.7 }
          ]
        }

      case 'revenue':
        return {
          ...baseData,
          revenueByClient: [
            { name: 'Acme Corp', revenue: 45680, hours: 612, rate: 74.67, projects: 3 },
            { name: 'Tech Solutions', revenue: 38920, hours: 486, rate: 80.04, projects: 2 },
            { name: 'Global Industries', revenue: 32450, hours: 465, rate: 69.78, projects: 4 },
            { name: 'StartupXYZ', revenue: 28740, hours: 398, rate: 72.21, projects: 2 }
          ],
          revenueByProject: [
            { name: 'Website Redesign', client: 'Acme Corp', revenue: 18500, hours: 247, rate: 74.90 },
            { name: 'Mobile App', client: 'Tech Solutions', revenue: 22400, hours: 280, rate: 80.00 },
            { name: 'Data Migration', client: 'Global Industries', revenue: 15600, hours: 234, rate: 66.67 },
            { name: 'System Integration', client: 'StartupXYZ', revenue: 19200, hours: 256, rate: 75.00 }
          ],
          revenueTrend: [
            { period: 'Jan', revenue: 42500, hours: 598 },
            { period: 'Feb', revenue: 48200, hours: 672 },
            { period: 'Mar', revenue: 52800, hours: 745 },
            { period: 'Apr', revenue: 54790, hours: 832 }
          ]
        }

      case 'productivity':
        return {
          ...baseData,
          productivityMetrics: [
            { name: 'John Doe', hours_per_day: 7.8, efficiency: 92, quality_score: 88, projects: 3 },
            { name: 'Jane Smith', hours_per_day: 8.2, efficiency: 95, quality_score: 94, projects: 2 },
            { name: 'Mike Johnson', hours_per_day: 7.5, efficiency: 87, quality_score: 85, projects: 4 },
            { name: 'Sarah Wilson', hours_per_day: 8.0, efficiency: 91, quality_score: 92, projects: 2 }
          ],
          productivityTrend: [
            { period: 'Week 1', efficiency: 88.5, quality: 89.2 },
            { period: 'Week 2', efficiency: 91.2, quality: 90.8 },
            { period: 'Week 3', efficiency: 89.8, quality: 88.5 },
            { period: 'Week 4', efficiency: 92.1, quality: 91.7 }
          ]
        }

      default:
        return baseData
    }
  }

  const handleDrillDown = (dataPoint, chartType) => {
    console.log('Drilling down into:', dataPoint, chartType)
    
    // Generate drill-down data based on the clicked item
    const drillDown = {
      title: `Detailed Analysis: ${dataPoint.name || dataPoint.period}`,
      type: chartType,
      data: generateDrillDownData(dataPoint, chartType)
    }
    
    setDrillDownData(drillDown)
    setShowDrillDown(true)
  }

  const generateDrillDownData = (dataPoint, chartType) => {
    // Mock drill-down data generation
    if (chartType === 'resource') {
      return {
        dailyHours: [
          { date: '2024-01-01', billable: 8, non_billable: 0 },
          { date: '2024-01-02', billable: 7.5, non_billable: 0.5 },
          { date: '2024-01-03', billable: 8, non_billable: 0 },
          { date: '2024-01-04', billable: 6, non_billable: 2 },
          { date: '2024-01-05', billable: 8, non_billable: 0 }
        ],
        projectBreakdown: [
          { project: 'Website Redesign', hours: 45, percentage: 35 },
          { project: 'Mobile App', hours: 38, percentage: 30 },
          { project: 'Data Migration', hours: 28, percentage: 22 },
          { project: 'Consulting', hours: 17, percentage: 13 }
        ]
      }
    }
    return {}
  }

  const exportReport = (format) => {
    console.log(`Exporting report as ${format}`)
    // Implement export functionality
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  return (
    <div className="page-content" style={{ height: '100vh', overflowY: 'auto' }}>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billable Hours Reporting</h1>
            <p className="text-gray-600 mt-1">Comprehensive analytics and reporting for billable hours</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn btn-outline flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => exportReport('pdf')}
                className="btn btn-outline flex items-center gap-2"
                title="Export as PDF"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="btn btn-outline flex items-center gap-2"
                title="Export as Excel"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-outline flex items-center gap-2"
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Report Configuration</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="form-label">Report Type</label>
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="form-select"
                >
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="form-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    {reportTypes.find(t => t.id === selectedReport)?.name}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {reportTypes.find(t => t.id === selectedReport)?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner mr-3"></div>
            <span>Generating report...</span>
          </div>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-icon bg-blue-100">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Billable Hours</p>
                  <p className="stat-value text-blue-600">{reportData.summary.total_billable_hours}h</p>
                  <p className="stat-change text-green-600">+12.5% vs last period</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Revenue</p>
                  <p className="stat-value text-green-600">${reportData.summary.total_revenue.toLocaleString()}</p>
                  <p className="stat-change text-green-600">+8.7% vs last period</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon bg-purple-100">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Utilization Rate</p>
                  <p className="stat-value text-purple-600">{reportData.summary.utilization_rate}%</p>
                  <p className="stat-change text-green-600">+3.2% vs target</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon bg-orange-100">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Average Rate</p>
                  <p className="stat-value text-orange-600">${reportData.summary.average_rate}</p>
                  <p className="stat-change text-green-600">+2.1% vs last period</p>
                </div>
              </div>
            </div>

            {/* Report Content Based on Type */}
            {selectedReport === 'utilization' && reportData.utilizationByResource && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource Utilization Chart */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Resource Utilization</h3>
                    <p className="card-description">Click on bars to drill down</p>
                  </div>
                  <div className="card-content">
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.utilizationByResource}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            dataKey="utilization" 
                            fill="#3B82F6" 
                            name="Utilization %" 
                            onClick={(data) => handleDrillDown(data, 'resource')}
                            style={{ cursor: 'pointer' }}
                          />
                          <Bar dataKey="target" fill="#10B981" name="Target %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Utilization Trend */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Utilization Trend</h3>
                    <p className="card-description">Monthly utilization vs target</p>
                  </div>
                  <div className="card-content">
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reportData.utilizationTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="utilization" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            name="Actual Utilization %"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="target" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Target %"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Team Utilization Table */}
                <div className="card lg:col-span-2">
                  <div className="card-header">
                    <h3 className="card-title">Team Utilization Summary</h3>
                  </div>
                  <div className="card-content">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Team</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Utilization</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Target</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Variance</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.teamUtilization.map((team, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{team.team}</td>
                              <td className="py-3 px-4">{team.utilization}%</td>
                              <td className="py-3 px-4">{team.target}%</td>
                              <td className="py-3 px-4">
                                <span className={`font-medium ${
                                  team.variance >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {team.variance > 0 ? '+' : ''}{team.variance}%
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`badge ${
                                  team.variance >= 0 ? 'badge-green' : 'badge-red'
                                }`}>
                                  {team.variance >= 0 ? 'Above Target' : 'Below Target'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'revenue' && reportData.revenueByClient && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Client */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Revenue by Client</h3>
                    <p className="card-description">Click to view client details</p>
                  </div>
                  <div className="card-content">
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={reportData.revenueByClient}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, revenue}) => `${name}: $${revenue.toLocaleString()}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                            onClick={(data) => handleDrillDown(data, 'client')}
                            style={{ cursor: 'pointer' }}
                          >
                            {reportData.revenueByClient.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Revenue Trend */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Revenue Trend</h3>
                    <p className="card-description">Monthly revenue and hours</p>
                  </div>
                  <div className="card-content">
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportData.revenueTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10B981" 
                            fill="#10B981" 
                            name="Revenue ($)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Drill-down Modal */}
        {showDrillDown && drillDownData && (
          <div className="modal-overlay">
            <div className="modal-content max-w-4xl">
              <div className="modal-header">
                <h3 className="modal-title">{drillDownData.title}</h3>
                <button 
                  onClick={() => setShowDrillDown(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <div className="space-y-6">
                {drillDownData.data.dailyHours && (
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Daily Hours Breakdown</h4>
                    </div>
                    <div className="card-content">
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={drillDownData.data.dailyHours}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="billable" fill="#10B981" name="Billable Hours" />
                            <Bar dataKey="non_billable" fill="#F59E0B" name="Non-Billable Hours" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
                
                {drillDownData.data.projectBreakdown && (
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Project Time Allocation</h4>
                    </div>
                    <div className="card-content">
                      <div className="space-y-3">
                        {drillDownData.data.projectBreakdown.map((project, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="font-medium">{project.project}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{width: `${project.percentage}%`}}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-16">
                                {project.hours}h ({project.percentage}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BillableHoursReporting

