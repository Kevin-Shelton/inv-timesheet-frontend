// ENHANCED APP.JSX WITH ANALYTICS AND REPORTING
// This is your complete App.jsx file with all admin features + analytics + reporting

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Clock, Users, BarChart3, Settings, LogOut, Menu, X, AlertCircle, CheckCircle, Plus, Check, XCircle, Download, Filter, Search, Edit, Trash2, UserPlus, Shield, TrendingUp, DollarSign, Calendar, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute.jsx'
import api from './lib/api'
import './App.css'

// ANALYTICS DASHBOARD COMPONENT
function AnalyticsDashboard() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState({
    timeDistribution: [],
    productivityTrends: [],
    teamPerformance: [],
    hoursByDay: [],
    approvalStats: [],
    overtimeAnalysis: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedMetric, setSelectedMetric] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration - replace with actual API calls
      const mockData = {
        timeDistribution: [
          { name: 'Campaign A', hours: 120, percentage: 35 },
          { name: 'Campaign B', hours: 85, percentage: 25 },
          { name: 'Campaign C', hours: 95, percentage: 28 },
          { name: 'Admin Tasks', hours: 40, percentage: 12 }
        ],
        productivityTrends: [
          { date: '2024-01-01', productivity: 85, hours: 8.2 },
          { date: '2024-01-02', productivity: 92, hours: 8.5 },
          { date: '2024-01-03', productivity: 78, hours: 7.8 },
          { date: '2024-01-04', productivity: 88, hours: 8.3 },
          { date: '2024-01-05', productivity: 95, hours: 8.7 },
          { date: '2024-01-06', productivity: 82, hours: 8.0 },
          { date: '2024-01-07', productivity: 90, hours: 8.4 }
        ],
        teamPerformance: [
          { name: 'John Doe', hours: 168, efficiency: 92, overtime: 8 },
          { name: 'Jane Smith', hours: 160, efficiency: 88, overtime: 0 },
          { name: 'Mike Johnson', hours: 172, efficiency: 95, overtime: 12 },
          { name: 'Sarah Wilson', hours: 156, efficiency: 85, overtime: 4 }
        ],
        hoursByDay: [
          { day: 'Mon', regular: 32, overtime: 4 },
          { day: 'Tue', regular: 35, overtime: 2 },
          { day: 'Wed', regular: 38, overtime: 6 },
          { day: 'Thu', regular: 36, overtime: 3 },
          { day: 'Fri', regular: 34, overtime: 5 },
          { day: 'Sat', regular: 12, overtime: 8 },
          { day: 'Sun', regular: 8, overtime: 2 }
        ],
        approvalStats: [
          { status: 'Approved', count: 145, percentage: 78 },
          { status: 'Pending', count: 28, percentage: 15 },
          { status: 'Rejected', count: 13, percentage: 7 }
        ],
        overtimeAnalysis: [
          { week: 'Week 1', planned: 160, actual: 168, overtime: 8 },
          { week: 'Week 2', planned: 160, actual: 165, overtime: 5 },
          { week: 'Week 3', planned: 160, actual: 172, overtime: 12 },
          { week: 'Week 4', planned: 160, actual: 158, overtime: 0 }
        ]
      }
      
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into team performance and productivity</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex space-x-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-40"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-40"
            />
          </div>
          <Button onClick={fetchAnalyticsData}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metric Selection Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', name: 'Overview', icon: BarChart3 },
          { id: 'productivity', name: 'Productivity', icon: TrendingUp },
          { id: 'team', name: 'Team Performance', icon: Users },
          { id: 'time', name: 'Time Analysis', icon: Clock }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMetric(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedMetric === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution by Campaign</CardTitle>
              <CardDescription>How time is allocated across different campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.timeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percentage}) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {analyticsData.timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Approval Status */}
          <Card>
            <CardHeader>
              <CardTitle>Timesheet Approval Status</CardTitle>
              <CardDescription>Current status of timesheet submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.approvalStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hours by Day */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Daily Hours Breakdown</CardTitle>
              <CardDescription>Regular vs overtime hours by day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.hoursByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="regular" stackId="a" fill="#10B981" name="Regular Hours" />
                  <Bar dataKey="overtime" stackId="a" fill="#F59E0B" name="Overtime Hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Productivity Tab */}
      {selectedMetric === 'productivity' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Trends</CardTitle>
              <CardDescription>Daily productivity scores and hours worked</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.productivityTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="productivity" stroke="#3B82F6" name="Productivity %" />
                  <Line yAxisId="right" type="monotone" dataKey="hours" stroke="#10B981" name="Hours Worked" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overtime Analysis</CardTitle>
              <CardDescription>Planned vs actual hours with overtime tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.overtimeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="planned" stackId="1" stroke="#8884d8" fill="#8884d8" name="Planned Hours" />
                  <Area type="monotone" dataKey="overtime" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Overtime Hours" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Performance Tab */}
      {selectedMetric === 'team' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Metrics</CardTitle>
              <CardDescription>Individual team member performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.teamPerformance.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.hours} hours this month</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Efficiency</p>
                        <p className="text-lg font-semibold text-green-600">{member.efficiency}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Overtime</p>
                        <p className="text-lg font-semibold text-orange-600">{member.overtime}h</p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${member.efficiency}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Analysis Tab */}
      {selectedMetric === 'time' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Utilization</CardTitle>
              <CardDescription>How time is being utilized across the organization</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Productive Work', value: 75, color: '#10B981' },
                      { name: 'Meetings', value: 15, color: '#3B82F6' },
                      { name: 'Admin Tasks', value: 7, color: '#F59E0B' },
                      { name: 'Breaks', value: 3, color: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}%`}
                  >
                    {[
                      { name: 'Productive Work', value: 75, color: '#10B981' },
                      { name: 'Meetings', value: 15, color: '#3B82F6' },
                      { name: 'Admin Tasks', value: 7, color: '#F59E0B' },
                      { name: 'Breaks', value: 3, color: '#EF4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>When your team is most productive</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { hour: '9 AM', productivity: 65 },
                  { hour: '10 AM', productivity: 85 },
                  { hour: '11 AM', productivity: 92 },
                  { hour: '12 PM', productivity: 78 },
                  { hour: '1 PM', productivity: 45 },
                  { hour: '2 PM', productivity: 88 },
                  { hour: '3 PM', productivity: 95 },
                  { hour: '4 PM', productivity: 82 },
                  { hour: '5 PM', productivity: 70 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="productivity" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// REPORTS PAGE COMPONENT
function ReportsPage() {
  const { user } = useAuth()
  const [activeReport, setActiveReport] = useState('payroll')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    department: 'all',
    employee: 'all',
    status: 'all'
  })

  const reportTypes = [
    { id: 'payroll', name: 'Payroll Report', icon: DollarSign, description: 'Generate payroll summaries for accounting' },
    { id: 'productivity', name: 'Productivity Report', icon: TrendingUp, description: 'Analyze team productivity metrics' },
    { id: 'attendance', name: 'Attendance Report', icon: Calendar, description: 'Track attendance and time patterns' },
    { id: 'overtime', name: 'Overtime Report', icon: Clock, description: 'Monitor overtime hours and costs' },
    { id: 'billing', name: 'Client Billing', icon: FileText, description: 'Generate client billing reports' },
    { id: 'custom', name: 'Custom Report', icon: Settings, description: 'Create custom reports with filters' }
  ]

  const generateReport = async (reportType) => {
    setLoading(true)
    try {
      // Mock report generation - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockReportData = {
        payroll: {
          totalHours: 1240,
          totalCost: 22320,
          employees: [
            { name: 'John Doe', hours: 168, rate: 18.50, gross: 3108 },
            { name: 'Jane Smith', hours: 160, rate: 20.00, gross: 3200 },
            { name: 'Mike Johnson', hours: 172, rate: 19.25, gross: 3311 }
          ]
        },
        productivity: {
          averageEfficiency: 87,
          topPerformer: 'Mike Johnson',
          improvementAreas: ['Time tracking accuracy', 'Break time optimization']
        }
      }
      
      setReportData(mockReportData[reportType] || {})
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format) => {
    try {
      // Mock export - replace with actual API call
      const blob = new Blob(['Mock report data'], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeReport}_report.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports for payroll, billing, and analysis</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Type Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Types</CardTitle>
              <CardDescription>Select the type of report to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                    activeReport === report.id
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <report.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-xs text-gray-600">{report.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Report Configuration and Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Report Filters</CardTitle>
              <CardDescription>Configure your report parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                  >
                    <option value="all">All Departments</option>
                    <option value="campaign_a">Campaign A</option>
                    <option value="campaign_b">Campaign B</option>
                    <option value="admin">Administration</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <select
                    id="employee"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.employee}
                    onChange={(e) => setFilters({...filters, employee: e.target.value})}
                  >
                    <option value="all">All Employees</option>
                    <option value="john_doe">John Doe</option>
                    <option value="jane_smith">Jane Smith</option>
                    <option value="mike_johnson">Mike Johnson</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => generateReport(activeReport)} disabled={loading}>
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Results */}
          {reportData && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {reportTypes.find(r => r.id === activeReport)?.name} Results
                </CardTitle>
                <CardDescription>
                  Report generated for {filters.startDate} to {filters.endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeReport === 'payroll' && reportData.employees && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Total Hours</p>
                        <p className="text-2xl font-bold text-blue-900">{reportData.totalHours}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Total Cost</p>
                        <p className="text-2xl font-bold text-green-900">${reportData.totalCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Employees</p>
                        <p className="text-2xl font-bold text-purple-900">{reportData.employees.length}</p>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left">Employee</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Hours</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Rate</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Gross Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.employees.map((employee, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 px-4 py-2">{employee.name}</td>
                              <td className="border border-gray-300 px-4 py-2">{employee.hours}</td>
                              <td className="border border-gray-300 px-4 py-2">${employee.rate}</td>
                              <td className="border border-gray-300 px-4 py-2">${employee.gross.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {activeReport === 'productivity' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Average Efficiency</p>
                        <p className="text-2xl font-bold text-green-900">{reportData.averageEfficiency}%</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Top Performer</p>
                        <p className="text-2xl font-bold text-blue-900">{reportData.topPerformer}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Areas for Improvement:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {reportData.improvementAreas.map((area, index) => (
                          <li key={index} className="text-gray-600">{area}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ADMIN TIMESHEET APPROVAL COMPONENT (from previous implementation)
function AdminTimesheetApproval() {
  const { user } = useAuth()
  const [allTimesheets, setAllTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTimesheet, setSelectedTimesheet] = useState(null)
  const [approvalComment, setApprovalComment] = useState('')

  useEffect(() => {
    fetchAllTimesheets()
  }, [filter])

  const fetchAllTimesheets = async () => {
    try {
      setLoading(true)
      const data = await api.getTimesheets({ status: filter === 'all' ? undefined : filter })
      setAllTimesheets(data)
    } catch (error) {
      setError('Failed to load timesheets')
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (timesheetId, action) => {
    try {
      if (action === 'approve') {
        await api.approveTimesheet(timesheetId, approvalComment)
      } else {
        await api.rejectTimesheet(timesheetId, approvalComment)
      }
      setApprovalComment('')
      setSelectedTimesheet(null)
      fetchAllTimesheets()
    } catch (error) {
      setError(`Failed to ${action} timesheet`)
      console.error(`Error ${action}ing timesheet:`, error)
    }
  }

  const filteredTimesheets = allTimesheets.filter(timesheet =>
    timesheet.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timesheet.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Loading timesheets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheet Approvals</h1>
          <p className="text-gray-600">Review and approve team timesheet entries</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchAllTimesheets()}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by user or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Timesheets List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Timesheets</CardTitle>
          <CardDescription>All timesheet entries requiring review</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTimesheets.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets found</h3>
              <p className="text-gray-600">No timesheets match your current filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{timesheet.user_name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600">{timesheet.date} • {timesheet.hours} hours</p>
                      {timesheet.description && (
                        <p className="text-sm text-gray-500">{timesheet.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(timesheet.status)}
                      <Badge className={getStatusColor(timesheet.status)}>
                        {timesheet.status}
                      </Badge>
                    </div>
                    {timesheet.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => {
                            setSelectedTimesheet(timesheet)
                            setApprovalComment('')
                          }}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedTimesheet(timesheet)
                            setApprovalComment('')
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      {selectedTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {selectedTimesheet.status === 'pending' ? 'Review Timesheet' : 'Timesheet Details'}
              </CardTitle>
              <CardDescription>
                {selectedTimesheet.user_name} • {selectedTimesheet.date} • {selectedTimesheet.hours} hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTimesheet.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedTimesheet.description}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="comment">Comments (optional)</Label>
                <Input
                  id="comment"
                  placeholder="Add a comment..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => handleApproval(selectedTimesheet.id, 'approve')}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleApproval(selectedTimesheet.id, 'reject')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTimesheet(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ENHANCED TIMESHEETS PAGE WITH ADMIN VIEW
function TimesheetsPage() {
  const { user } = useAuth()
  
  // If user is admin, show the approval interface
  if (user?.role === 'admin') {
    return <AdminTimesheetApproval />
  }

  // Regular user timesheet interface (existing code)
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTimesheet, setNewTimesheet] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: ''
  })

  useEffect(() => {
    fetchTimesheets()
  }, [])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const data = await api.getTimesheets()
      setTimesheets(data)
    } catch (error) {
      setError('Failed to load timesheets')
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTimesheet = async (e) => {
    e.preventDefault()
    try {
      await api.createTimesheet(newTimesheet)
      setNewTimesheet({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: ''
      })
      setShowAddForm(false)
      fetchTimesheets()
    } catch (error) {
      setError('Failed to create timesheet')
      console.error('Error creating timesheet:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Loading timesheets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Timesheets</h1>
          <p className="text-gray-600">Track and manage your time entries</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Timesheet Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Time Entry</CardTitle>
            <CardDescription>Record your work hours for a specific date</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTimesheet} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTimesheet.date}
                    onChange={(e) => setNewTimesheet({...newTimesheet, date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="8.0"
                    value={newTimesheet.hours}
                    onChange={(e) => setNewTimesheet({...newTimesheet, hours: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of work performed"
                  value={newTimesheet.description}
                  onChange={(e) => setNewTimesheet({...newTimesheet, description: e.target.value})}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Save Entry</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Timesheets List */}
      <Card>
        <CardHeader>
          <CardTitle>My Time Entries</CardTitle>
          <CardDescription>Your submitted timesheet entries</CardDescription>
        </CardHeader>
        <CardContent>
          {timesheets.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your time by adding your first entry</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{timesheet.date}</p>
                      <p className="text-sm text-gray-600">{timesheet.hours} hours</p>
                      {timesheet.description && (
                        <p className="text-sm text-gray-500">{timesheet.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(timesheet.status)}
                      <Badge className={getStatusColor(timesheet.status)}>
                        {timesheet.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ENHANCED TEAM PAGE WITH ADMIN FEATURES (from previous implementation)
function TeamPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newMember, setNewMember] = useState({
    email: '',
    full_name: '',
    role: 'team_member',
    pay_rate_per_hour: ''
  })

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers()
      setTeamMembers(data)
    } catch (error) {
      setError('Failed to load team members')
      console.error('Error fetching team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMember = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, newMember)
      } else {
        await api.createUser({
          ...newMember,
          password: 'TempPass123!',
          send_welcome_email: true
        })
      }
      setNewMember({
        email: '',
        full_name: '',
        role: 'team_member',
        pay_rate_per_hour: ''
      })
      setShowAddForm(false)
      setEditingUser(null)
      fetchTeamMembers()
    } catch (error) {
      setError(`Failed to ${editingUser ? 'update' : 'create'} team member`)
      console.error(`Error ${editingUser ? 'updating' : 'creating'} team member:`, error)
    }
  }

  const handleEditUser = (member) => {
    setEditingUser(member)
    setNewMember({
      email: member.email,
      full_name: member.full_name,
      role: member.role,
      pay_rate_per_hour: member.pay_rate_per_hour || ''
    })
    setShowAddForm(true)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId)
        fetchTeamMembers()
      } catch (error) {
        setError('Failed to delete user')
        console.error('Error deleting user:', error)
      }
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'campaign_lead':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    )
  }

  const canManageTeam = user?.role === 'admin' || user?.role === 'campaign_lead'
  const isAdmin = user?.role === 'admin'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members and their roles</p>
        </div>
        {canManageTeam && (
          <Button onClick={() => {
            setEditingUser(null)
            setNewMember({
              email: '',
              full_name: '',
              role: 'team_member',
              pay_rate_per_hour: ''
            })
            setShowAddForm(true)
          }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!canManageTeam && (
        <Alert>
          <AlertDescription>
            You don't have permission to manage team members. Contact your administrator for access.
          </AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Member Form */}
      {showAddForm && canManageTeam && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
            <CardDescription>
              {editingUser ? 'Update team member information' : 'Invite a new member to join your team'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@company.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={newMember.full_name}
                    onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  >
                    <option value="team_member">Team Member</option>
                    <option value="campaign_lead">Campaign Lead</option>
                    {isAdmin && <option value="admin">Admin</option>}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay_rate">Pay Rate (per hour)</Label>
                  <Input
                    id="pay_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="18.50"
                    value={newMember.pay_rate_per_hour}
                    onChange={(e) => setNewMember({...newMember, pay_rate_per_hour: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingUser ? 'Update Member' : 'Add Member'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddForm(false)
                  setEditingUser(null)
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Current team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600 mb-4">Start building your team by adding members</p>
              {canManageTeam && (
                <Button onClick={() => setShowAddForm(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {member.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.full_name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.pay_rate_per_hour && (
                        <p className="text-sm text-gray-500">${member.pay_rate_per_hour}/hour</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getRoleColor(member.role)}>
                      {member.role?.replace('_', ' ')}
                    </Badge>
                    {isAdmin && member.id !== user.id && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteUser(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ENHANCED DASHBOARD WITH ADMIN METRICS (from previous implementation)
function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    personalStats: {
      hoursThisWeek: 32.5,
      pendingApprovals: 3,
      monthlyTotal: 128.5,
      overtimeHours: 4.5
    },
    adminStats: {
      totalUsers: 0,
      activeTimesheets: 0,
      pendingApprovals: 0,
      totalHoursThisMonth: 0
    },
    recentTimesheets: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch personal timesheets
      const personalTimesheets = await api.getTimesheets()
      
      // If admin, fetch additional data
      if (user?.role === 'admin') {
        const [allUsers, allTimesheets] = await Promise.all([
          api.getUsers(),
          api.getTimesheets({ status: 'all' })
        ])
        
        setDashboardData(prev => ({
          ...prev,
          adminStats: {
            totalUsers: allUsers.length,
            activeTimesheets: allTimesheets.filter(t => t.status === 'pending').length,
            pendingApprovals: allTimesheets.filter(t => t.status === 'pending').length,
            totalHoursThisMonth: allTimesheets.reduce((sum, t) => sum + parseFloat(t.hours || 0), 0)
          },
          recentTimesheets: allTimesheets.slice(0, 5)
        }))
      } else {
        setDashboardData(prev => ({
          ...prev,
          recentTimesheets: personalTimesheets.slice(0, 5)
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-600">
          {isAdmin ? "Here's your organization overview" : "Here's your timesheet overview"}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.adminStats.totalUsers}</p>
                    <p className="text-xs text-blue-600">Active team members</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.adminStats.pendingApprovals}</p>
                    <p className="text-xs text-orange-600">Require your review</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hours (Month)</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.adminStats.totalHoursThisMonth}</p>
                    <p className="text-xs text-green-600">Organization wide</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Timesheets</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.adminStats.activeTimesheets}</p>
                    <p className="text-xs text-gray-600">In review</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hours This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.personalStats.hoursThisWeek}</p>
                    <p className="text-xs text-green-600">+2.1 from last week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.personalStats.pendingApprovals}</p>
                    <p className="text-xs text-gray-600">2 submitted today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.personalStats.monthlyTotal}</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.personalStats.overtimeHours}</p>
                    <p className="text-xs text-gray-600">Within limits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? 'Recent Team Activity' : 'Recent Timesheets'}
          </CardTitle>
          <CardDescription>
            {isAdmin ? 'Latest timesheet submissions from your team' : 'Your latest timesheet entries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentTimesheets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              dashboardData.recentTimesheets.map((timesheet, index) => (
                <div key={timesheet.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        {isAdmin && timesheet.user_name ? `${timesheet.user_name} - ` : ''}
                        {timesheet.date}
                      </p>
                      <p className="text-sm text-gray-600">{timesheet.hours} hours</p>
                    </div>
                  </div>
                  <Badge variant={timesheet.status === 'approved' ? 'secondary' : 'outline'}>
                    {timesheet.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Admin */}
      {isAdmin && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link to="/timesheets">
                  <Button className="w-full" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Review Timesheets
                  </Button>
                </Link>
                <Link to="/team">
                  <Button className="w-full" variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Manage Team
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// SETTINGS PAGE (unchanged from previous version)
function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  })
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: Settings },
    { id: 'security', name: 'Security', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Settings },
  ]

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      await api.updateProfile(profileData)
      await updateUser({ ...user, ...profileData })
      setMessage('Profile updated successfully')
    } catch (error) {
      setError('Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }
    
    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }
    
    try {
      await api.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      setMessage('Password changed successfully')
    } catch (error) {
      setError('Failed to change password')
      console.error('Error changing password:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {message && (
        <Alert>
          <AlertDescription className="text-green-600">{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <tab.icon className="mr-3 h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {user?.role?.replace('_', ' ') || 'User'}
                      </Badge>
                      <span className="text-sm text-gray-600">Contact your administrator to change your role</span>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about timesheet activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive email updates about timesheet approvals</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Approval Reminders</h4>
                      <p className="text-sm text-gray-600">Get reminded about pending timesheet approvals</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// LOGIN COMPONENT (unchanged)
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    try {
      await login(email, password)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Inv_TimeSheetMgmt</CardTitle>
          <CardDescription>Sign in to your timesheet account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// SIDEBAR COMPONENT (updated with new navigation items)
function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', icon: BarChart3, href: '/', current: location.pathname === '/' },
    { name: 'Timesheets', icon: Clock, href: '/timesheets', current: location.pathname === '/timesheets' },
    { name: 'Team', icon: Users, href: '/team', current: location.pathname === '/team', roles: ['admin', 'campaign_lead'] },
    { name: 'Analytics', icon: TrendingUp, href: '/analytics', current: location.pathname === '/analytics', roles: ['admin'] },
    { name: 'Reports', icon: FileText, href: '/reports', current: location.pathname === '/reports', roles: ['admin'] },
    { name: 'Settings', icon: Settings, href: '/settings', current: location.pathname === '/settings' },
  ]

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  )

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">TimeSheet</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || 'User'}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {user?.role?.replace('_', ' ') || 'user'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                  ${item.current
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// MAIN LAYOUT COMPONENT (updated with new routes)
function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">TimeSheet</h1>
            <div className="w-8" />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timesheets" element={<TimesheetsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// MAIN APP COMPONENT (unchanged)
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

