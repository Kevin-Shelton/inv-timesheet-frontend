// Complete Task-Based Timesheet Page Component
// Replaces the current time-in/out system with task-based tracking
// Maintains Apple-inspired design and responsive patterns

import React, { useState, useEffect } from 'react'
import { Save, ChevronLeft, ChevronRight, Plus, X, CheckCircle, AlertCircle, Clock, Edit3, Copy } from 'lucide-react'

// Mock API functions (replace with actual API calls)
const api = {
  getCampaigns: async () => {
    return [
      { id: 1, name: "Customer Service - General", client_name: "Various Clients", is_billable: true, hourly_rate: 18.00 },
      { id: 2, name: "Technical Support", client_name: "Tech Companies", is_billable: true, hourly_rate: 22.00 },
      { id: 3, name: "Sales Support", client_name: "Sales Organizations", is_billable: true, hourly_rate: 20.00 },
      { id: 11, name: "Training & Development", client_name: "Internal", is_billable: false, hourly_rate: 0.00 },
      { id: 12, name: "Administrative Tasks", client_name: "Internal", is_billable: false, hourly_rate: 0.00 },
      { id: 15, name: "Break Time", client_name: "Internal", is_billable: false, hourly_rate: 0.00 }
    ]
  },
  
  getTaskTemplates: async (campaignId) => {
    const templates = {
      1: [
        { id: 1, task_name: "Inbound Calls", description: "Handle incoming customer calls" },
        { id: 2, task_name: "Email Response", description: "Respond to customer emails" },
        { id: 3, task_name: "Chat Support", description: "Live chat customer assistance" },
        { id: 4, name: "Case Documentation", description: "Document customer cases and resolutions" }
      ],
      2: [
        { id: 6, task_name: "Troubleshooting", description: "Technical problem diagnosis and resolution" },
        { id: 7, task_name: "Software Support", description: "Software installation and configuration help" },
        { id: 8, task_name: "Hardware Support", description: "Hardware troubleshooting and guidance" }
      ],
      11: [
        { id: 20, task_name: "Skills Training", description: "Participate in skills development training" },
        { id: 21, task_name: "Onboarding", description: "New employee onboarding activities" }
      ],
      12: [
        { id: 25, task_name: "Documentation", description: "Administrative documentation tasks" },
        { id: 26, task_name: "Reporting", description: "Generate administrative reports" }
      ],
      15: [
        { id: 30, task_name: "Lunch Break", description: "Scheduled lunch break" },
        { id: 31, task_name: "Rest Break", description: "Scheduled rest breaks" }
      ]
    }
    return templates[campaignId] || []
  },
  
  getSystemSettings: async () => {
    return {
      regular_hours_threshold: 40,
      overtime_multiplier: 1.5,
      max_daily_hours: 12
    }
  }
}

// Utility functions
const formatDuration = (hours, minutes) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const parseDuration = (durationStr) => {
  if (!durationStr || durationStr === 'hh:mm') return { hours: 0, minutes: 0 }
  const [hours, minutes] = durationStr.split(':').map(Number)
  return { hours: hours || 0, minutes: minutes || 0 }
}

const addDurations = (duration1, duration2) => {
  const totalMinutes = (duration1.hours * 60 + duration1.minutes) + (duration2.hours * 60 + duration2.minutes)
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  }
}

const TaskBasedTimesheetPage = () => {
  // State management
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [campaigns, setCampaigns] = useState([])
  const [tasks, setTasks] = useState([])
  const [systemSettings, setSystemSettings] = useState({})
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [currentNotesTask, setCurrentNotesTask] = useState(null)
  const [taskNotes, setTaskNotes] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [selectedTaskTemplate, setSelectedTaskTemplate] = useState('')
  const [customTaskName, setCustomTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskTemplates, setTaskTemplates] = useState([])

  // Generate week dates
  const getWeekDates = (startDate) => {
    const dates = []
    const start = new Date(startDate)
    start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday
    
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push({
        date: date,
        formatted: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
        key: date.toISOString().split('T')[0]
      })
    }
    return dates
  }

  const weekDates = getWeekDates(currentWeek)
  const weekStart = weekDates[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const weekEnd = weekDates[4].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaignsData, settingsData] = await Promise.all([
          api.getCampaigns(),
          api.getSystemSettings()
        ])
        setCampaigns(campaignsData)
        setSystemSettings(settingsData)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  // Load task templates when campaign is selected
  useEffect(() => {
    const loadTaskTemplates = async () => {
      if (selectedCampaign) {
        try {
          const templates = await api.getTaskTemplates(parseInt(selectedCampaign))
          setTaskTemplates(templates)
        } catch (error) {
          console.error('Error loading task templates:', error)
        }
      } else {
        setTaskTemplates([])
      }
    }
    loadTaskTemplates()
  }, [selectedCampaign])

  // Task management functions
  const addTask = () => {
    if (!selectedCampaign) return

    const campaign = campaigns.find(c => c.id === parseInt(selectedCampaign))
    const template = taskTemplates.find(t => t.id === parseInt(selectedTaskTemplate))
    
    const newTask = {
      id: Date.now(),
      campaign_id: parseInt(selectedCampaign),
      campaign_name: campaign.name,
      client_project: `${campaign.name}${campaign.client_name !== 'Internal' ? ` - ${campaign.client_name}` : ''}`,
      task_name: template ? template.task_name : customTaskName,
      description: template ? template.description : taskDescription,
      is_billable: campaign.is_billable,
      hourly_rate: campaign.hourly_rate,
      time_entries: weekDates.map(day => ({
        day: day.formatted,
        date: day.key,
        completed: false,
        duration: 'hh:mm'
      })),
      task_total: '0:00',
      notes: ''
    }

    setTasks([...tasks, newTask])
    setShowAddTaskModal(false)
    setSelectedCampaign('')
    setSelectedTaskTemplate('')
    setCustomTaskName('')
    setTaskDescription('')
  }

  const removeTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const updateTimeEntry = (taskId, dayKey, duration, completed) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedEntries = task.time_entries.map(entry => {
          if (entry.date === dayKey) {
            return { ...entry, duration, completed }
          }
          return entry
        })

        // Calculate task total
        let totalMinutes = 0
        updatedEntries.forEach(entry => {
          if (entry.duration !== 'hh:mm') {
            const { hours, minutes } = parseDuration(entry.duration)
            totalMinutes += hours * 60 + minutes
          }
        })

        const taskTotal = formatDuration(Math.floor(totalMinutes / 60), totalMinutes % 60)

        return {
          ...task,
          time_entries: updatedEntries,
          task_total: taskTotal
        }
      }
      return task
    }))
  }

  const toggleCompleted = (taskId, dayKey) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedEntries = task.time_entries.map(entry => {
          if (entry.date === dayKey) {
            return { ...entry, completed: !entry.completed }
          }
          return entry
        })
        return { ...task, time_entries: updatedEntries }
      }
      return task
    }))
  }

  // Calculate daily and weekly totals
  const calculateDailyTotals = () => {
    const dailyTotals = {}
    
    weekDates.forEach(day => {
      let totalMinutes = 0
      tasks.forEach(task => {
        const entry = task.time_entries.find(e => e.date === day.key)
        if (entry && entry.duration !== 'hh:mm') {
          const { hours, minutes } = parseDuration(entry.duration)
          totalMinutes += hours * 60 + minutes
        }
      })
      dailyTotals[day.key] = formatDuration(Math.floor(totalMinutes / 60), totalMinutes % 60)
    })
    
    return dailyTotals
  }

  const calculateWeeklyTotal = () => {
    let totalMinutes = 0
    tasks.forEach(task => {
      task.time_entries.forEach(entry => {
        if (entry.duration !== 'hh:mm') {
          const { hours, minutes } = parseDuration(entry.duration)
          totalMinutes += hours * 60 + minutes
        }
      })
    })
    return formatDuration(Math.floor(totalMinutes / 60), totalMinutes % 60)
  }

  const calculateOvertimeHours = () => {
    const weeklyTotal = calculateWeeklyTotal()
    const { hours, minutes } = parseDuration(weeklyTotal)
    const totalDecimalHours = hours + (minutes / 60)
    const threshold = systemSettings.regular_hours_threshold || 40
    
    if (totalDecimalHours > threshold) {
      const overtimeDecimal = totalDecimalHours - threshold
      return formatDuration(Math.floor(overtimeDecimal), Math.round((overtimeDecimal % 1) * 60))
    }
    return '0:00'
  }

  const dailyTotals = calculateDailyTotals()
  const weeklyTotal = calculateWeeklyTotal()
  const overtimeHours = calculateOvertimeHours()
  const regularHours = formatDuration(
    Math.min(systemSettings.regular_hours_threshold || 40, parseDuration(weeklyTotal).hours),
    parseDuration(weeklyTotal).hours >= (systemSettings.regular_hours_threshold || 40) ? 0 : parseDuration(weeklyTotal).minutes
  )

  // Notes modal functions
  const openNotesModal = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    setCurrentNotesTask(taskId)
    setTaskNotes(task?.notes || '')
    setShowNotesModal(true)
  }

  const saveNotes = () => {
    if (currentNotesTask) {
      setTasks(tasks.map(task => 
        task.id === currentNotesTask ? { ...task, notes: taskNotes } : task
      ))
    }
    setShowNotesModal(false)
    setCurrentNotesTask(null)
    setTaskNotes('')
  }

  // Week navigation
  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction * 7))
    setCurrentWeek(newWeek)
  }

  const copyPreviousWeek = () => {
    // Mock implementation - in real app, would copy from previous week's data
    console.log('Copy previous week functionality')
  }

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Timesheet</h1>
          <p className="text-gray-600 mt-1">Track your time across campaigns and tasks</p>
        </div>
        <div className="flex items-center space-x-4">
          <select className="form-select">
            <option>Jules Wimfield</option>
          </select>
          <button className="btn btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Timesheet
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center space-x-4">
        <button onClick={() => navigateWeek(-1)} className="btn btn-outline btn-sm">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{weekStart} - {weekEnd}</h2>
          <p className="text-sm text-gray-600">Weekly Total: {weeklyTotal}</p>
        </div>
        <button onClick={() => navigateWeek(1)} className="btn btn-outline btn-sm">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{regularHours}</div>
            <div className="text-sm text-gray-600">Regular Hours</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{overtimeHours}</div>
            <div className="text-sm text-gray-600">Overtime Hours</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.is_billable).length}</div>
            <div className="text-sm text-gray-600">Billable Tasks</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{weeklyTotal}</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button 
          onClick={() => setShowAddTaskModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Timesheet Row
        </button>
        <button 
          onClick={copyPreviousWeek}
          className="btn btn-outline"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Previous Week
        </button>
      </div>

      {/* Timesheet Table */}
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Client/Project & Task
                  </th>
                  {weekDates.map(day => (
                    <th key={day.key} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      {day.formatted}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Total
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${task.is_billable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.client_project}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {task.description}
                          </p>
                          {task.notes && (
                            <p className="text-xs text-blue-600 mt-1">
                              📝 Has notes
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    {task.time_entries.map((entry) => (
                      <td key={entry.date} className="px-3 py-4 text-center">
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-1">
                            <input
                              type="text"
                              value={entry.duration}
                              onChange={(e) => updateTimeEntry(task.id, entry.date, e.target.value, entry.completed)}
                              placeholder="hh:mm"
                              className="w-16 text-center text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                            />
                            <button
                              onClick={() => toggleCompleted(task.id, entry.date)}
                              className={`w-5 h-5 rounded ${entry.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'} flex items-center justify-center`}
                            >
                              {entry.completed && '✓'}
                            </button>
                          </div>
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {task.task_total}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => openNotesModal(task.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Add notes"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove task"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Daily Totals Row */}
                <tr className="bg-gray-100 font-medium">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    Daily Totals
                  </td>
                  {weekDates.map(day => (
                    <td key={day.key} className="px-3 py-3 text-center text-sm text-gray-900">
                      {dailyTotals[day.key]}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center text-sm font-bold text-gray-900">
                    {weeklyTotal}
                  </td>
                  <td className="px-3 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign/Project
                </label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full form-select"
                >
                  <option value="">Select campaign...</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} {campaign.client_name !== 'Internal' && `- ${campaign.client_name}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCampaign && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Template
                  </label>
                  <select
                    value={selectedTaskTemplate}
                    onChange={(e) => setSelectedTaskTemplate(e.target.value)}
                    className="w-full form-select"
                  >
                    <option value="">Select task template or create custom...</option>
                    {taskTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.task_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCampaign && !selectedTaskTemplate && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Task Name
                    </label>
                    <input
                      type="text"
                      value={customTaskName}
                      onChange={(e) => setCustomTaskName(e.target.value)}
                      placeholder="Enter task name..."
                      className="w-full form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Description
                    </label>
                    <textarea
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Enter task description..."
                      rows={3}
                      className="w-full form-textarea"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addTask}
                disabled={!selectedCampaign || (!selectedTaskTemplate && !customTaskName)}
                className="flex-1 btn btn-primary"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Task Notes</h3>
            <textarea
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="Add notes about this task..."
              rows={4}
              className="w-full form-textarea mb-4"
            />
            <div className="flex space-x-3">
              <button onClick={saveNotes} className="flex-1 btn btn-primary">
                Save Notes
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskBasedTimesheetPage

