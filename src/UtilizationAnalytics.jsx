// UtilizationAnalytics.jsx - Comprehensive utilization analytics and KPIs

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, Users, Clock, DollarSign, Target, AlertTriangle,
  Calendar, BarChart3, PieChart, Activity, Zap, Award
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, 
  Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts'

function UtilizationAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  // Mock utilization data
  const utilizationData = {
    kpis: {
      overall_utilization: 78.5,
      billable_utilization: 65.2,
      target_utilization: 75.0,
      revenue_per_hour: 68.50,
      total_billable_hours: 1247,
      total_available_hours: 1600,
      efficiency_score: 87.3
    },
    trends: [
      { date: '2024-01-01', billable: 85, non_billable: 15, utilization: 85 },
      { date: '2024-01-02', billable: 78, non_billable: 22, utilization: 78 },
      { date: '2024-01-03', billable: 82, non_billable: 18, utilization: 82 },
      { date: '2024-01-04', billable: 75, non_billable: 25, utilization: 75 },
      { date: '2024-01-05', billable: 88, non_billable: 12, utilization: 88 },
      { date: '2024-01-06', billable: 72, non_billable: 28, utilization: 72 },
      { date: '2024-01-07', billable: 80, non_billable: 20, utilization: 80 }
    ],
    teamUtilization: [
      { team: 'Engineering', billable: 142, non_billable: 38, utilization: 78.9, target: 75 },
      { team: 'Design', billable: 98, non_billable: 22, utilization: 81.7, target: 75 },
      { team: 'Analytics', billable: 76, non_billable: 24, utilization: 76.0, target: 75 },
      { team: 'Management', billable: 45, non_billable: 35, utilization: 56.3, target: 60 }
    ],
    resourceUtilization: [
      { 
        name: 'John Doe', 
        billable_hours: 32, 
        total_hours: 40, 
        utilization: 80, 
        revenue: 2400,
        efficiency: 92,
        projects: 3
      },
      { 
        name: 'Jane Smith', 
        billable_hours: 35, 
        total_hours: 40, 
        utilization: 87.5, 
        revenue: 2275,
        efficiency: 89,
        projects: 2
      },
      { 
        name: 'Mike Johnson', 
        billable_hours: 28, 
        total_hours: 40, 
        utilization: 70, 
        revenue: 1540,
        efficiency: 85,
        projects: 4
      },
      { 
        name: 'Sarah Wilson', 
        billable_hours: 30, 
        total_hours: 40, 
        utilization: 75, 
        revenue: 2550,
        efficiency: 94,
        projects: 2
      }
    ],
    clientRevenue: [
      { name: 'Acme Corp', revenue: 15420, hours: 185, rate: 83.35 },
      { name: 'Tech Solutions', revenue: 12680, hours: 158, rate: 80.25 },
      { name: 'Global Industries', revenue: 9850, hours: 142, rate: 69.37 },
      { name: 'StartupXYZ', revenue: 7200, hours: 96, rate: 75.00 }
    ],
    utilizationByHour: [
      { hour: '9:00', utilization: 95 },
      { hour: '10:00', utilization: 98 },
      { hour: '11:00', utilization: 92 },
      { hour: '12:00', utilization: 45 },
      { hour: '13:00', utilization: 78 },
      { hour: '14:00', utilization: 88 },
      { hour: '15:00', utilization: 85 },
      { hour: '16:00', utilization: 82 },
      { hour: '17:00', utilization: 75 }
    ]
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const getUtilizationColor = (utilization, target = 75) => {
    if (utilization >= target) return 'text-green-600'
    if (utilization >= target * 0.9) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUtilizationBadge = (utilization, target = 75) => {
    if (utilization >= target) return 'badge-green'
    if (utilization >= target * 0.9) return 'badge-yellow'
    return 'badge-red'
  }

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <div className="flex flex-col lg-flex-row lg-items-center lg-justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilization Analytics</h1>
          <p className="text-gray-600 mt-1">Monitor labor hour utilization and billable efficiency</p>
        </div>
        <div className="flex flex-col sm-flex-row gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="form-select"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Overall Utilization</p>
            <p className={`stat-value ${getUtilizationColor(utilizationData.kpis.overall_utilization)}`}>
              {utilizationData.kpis.overall_utilization}%
            </p>
            <p className="stat-change text-green-600">
              +2.3% vs target ({utilizationData.kpis.target_utilization}%)
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green-100">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Revenue per Hour</p>
            <p className="stat-value text-green-600">
              ${utilizationData.kpis.revenue_per_hour}
            </p>
            <p className="stat-change text-green-600">+5.2% from last period</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-purple-100">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Billable Hours</p>
            <p className="stat-value text-purple-600">
              {utilizationData.kpis.total_billable_hours}h
            </p>
            <p className="stat-change text-gray-600">
              of {utilizationData.kpis.total_available_hours}h available
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange-100">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Efficiency Score</p>
            <p className="stat-value text-orange-600">
              {utilizationData.kpis.efficiency_score}%
            </p>
            <p className="stat-change text-green-600">+1.8% improvement</p>
          </div>
        </div>
      </div>

      {/* Utilization Trends */}
      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Utilization Trends</h3>
            <p className="card-description">Daily utilization over time</p>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={utilizationData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="billable" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    name="Billable %" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="non_billable" 
                    stackId="1" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    name="Non-Billable %" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Team Utilization</h3>
            <p className="card-description">Utilization by team vs targets</p>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData.teamUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utilization" fill="#3B82F6" name="Current Utilization %" />
                  <Bar dataKey="target" fill="#10B981" name="Target %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Utilization Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Resource Utilization</h3>
          <p className="card-description">Individual team member utilization metrics</p>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Resource</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Billable Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Efficiency</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Projects</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {utilizationData.resourceUtilization.map((resource, index) => (
                  <tr key={index} className="border-b hover-bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {resource.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium">{resource.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{resource.billable_hours}h</span>
                      <span className="text-gray-500"> / {resource.total_hours}h</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className={`mr-2 font-medium ${getUtilizationColor(resource.utilization)}`}>
                          {resource.utilization}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              resource.utilization >= 75 ? 'bg-green-600' : 
                              resource.utilization >= 65 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{width: `${resource.utilization}%`}}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-green-600">
                      ${resource.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="mr-2">{resource.efficiency}%</span>
                        {resource.efficiency >= 90 && <Award className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </td>
                    <td className="py-3 px-4">{resource.projects}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getUtilizationBadge(resource.utilization)}`}>
                        {resource.utilization >= 75 ? 'On Target' : 
                         resource.utilization >= 65 ? 'Below Target' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
        {/* Client Revenue Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Client Revenue Distribution</h3>
            <p className="card-description">Revenue breakdown by client</p>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={utilizationData.clientRevenue}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, revenue}) => `${name}: $${revenue.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {utilizationData.clientRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Hourly Utilization Pattern */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Hourly Utilization Pattern</h3>
            <p className="card-description">Utilization throughout the day</p>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={utilizationData.utilizationByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="utilization" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Utilization Alerts */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Utilization Alerts</h3>
          <p className="card-description">Areas requiring attention</p>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            <div className="alert alert-warning">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">Management team below target</p>
                <p className="text-sm">Management team utilization at 56.3%, below 60% target</p>
              </div>
            </div>
            <div className="alert alert-info">
              <Activity className="w-5 h-5" />
              <div>
                <p className="font-medium">Peak utilization at 10:00 AM</p>
                <p className="text-sm">Consider scheduling important tasks during peak hours</p>
              </div>
            </div>
            <div className="alert alert-success">
              <TrendingUp className="w-5 h-5" />
              <div>
                <p className="font-medium">Design team exceeding targets</p>
                <p className="text-sm">Design team at 81.7% utilization, 6.7% above target</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UtilizationAnalytics

