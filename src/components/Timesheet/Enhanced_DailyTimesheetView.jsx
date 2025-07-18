import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Plus, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from "../../supabaseClient.js";
import { 
  TimesheetIndicators, 
  StatusBadge, 
  TimeEntryTypeBadge, 
  ProjectBadge,
  IndicatorLegend 
} from './TimesheetIndicators'

const Enhanced_DailyTimesheetView = ({ userId, selectedDate, onDateChange }) => {
  const [dailyData, setDailyData] = useState(null)
  const [timeEntries, setTimeEntries] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [expandedSections, setExpandedSections] = useState({
    trackedHours: false,
    payrollHours: false,
    changeHistory: false
  })
  const [showLegend, setShowLegend] = useState(false)

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load daily data
  useEffect(() => {
    loadDailyData()
  }, [userId, selectedDate])

  const loadDailyData = async () => {
    setLoading(true)
    try {
      // Get detailed daily timesheet data
      const data = await enhancedSupabaseApi.getDailyTimesheet(userId, selectedDate)
      setDailyData(data.summary)
      setTimeEntries(data.entries || [])
      
      if (data.summary?.users) {
        setUserProfile(data.summary.users)
      }
    } catch (error) {
      console.error('Error loading daily data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return null
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDuration = (hours) => {
    if (!hours || hours === 0) return '0h 0m'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() + direction)
    onDateChange(currentDate.toISOString().split('T')[0])
  }

  const getCurrentStatus = () => {
    if (!dailyData) return { status: 'Not clocked in', duration: null, color: 'text-gray-500' }
    
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    
    // Only show current status for today
    if (selectedDate !== todayStr) {
      return { status: 'Historical data', duration: null, color: 'text-gray-500' }
    }

    if (dailyData.time_out) {
      return { status: 'Clocked out', duration: null, color: 'text-gray-500' }
    }

    if (dailyData.break2_start && !dailyData.break2_end) {
      const breakStart = new Date(dailyData.break2_start)
      const duration = Math.floor((now - breakStart) / 1000 / 60)
      return { status: 'On break', duration: `${duration}m`, color: 'text-yellow-600' }
    }

    if (dailyData.break1_start && !dailyData.break1_end) {
      const breakStart = new Date(dailyData.break1_start)
      const duration = Math.floor((now - breakStart) / 1000 / 60)
      return { status: 'On break', duration: `${duration}m`, color: 'text-yellow-600' }
    }

    if (dailyData.lunch_start && !dailyData.lunch_end) {
      const lunchStart = new Date(dailyData.lunch_start)
      const duration = Math.floor((now - lunchStart) / 1000 / 60)
      return { status: 'On lunch break', duration: `${duration}m`, color: 'text-blue-600' }
    }

    if (dailyData.time_in) {
      const clockIn = new Date(dailyData.time_in)
      const workingMinutes = Math.floor((now - clockIn) / 1000 / 60)
      const hours = Math.floor(workingMinutes / 60)
      const minutes = workingMinutes % 60
      return { 
        status: 'Working', 
        duration: `${hours}h ${minutes}m`, 
        color: 'text-green-600' 
      }
    }

    return { status: 'Not clocked in', duration: null, color: 'text-gray-500' }
  }

  const getTimezone = () => {
    const offset = new Date().getTimezoneOffset()
    const hours = Math.floor(Math.abs(offset) / 60)
    const minutes = Math.abs(offset) % 60
    const sign = offset <= 0 ? '+' : '-'
    return `GMT${sign}${hours}${minutes > 0 ? ':' + minutes.toString().padStart(2, '0') : ''}`
  }

  const getSplitTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const createTimelineEntries = () => {
    const entries = []
    
    if (dailyData?.time_in) {
      entries.push({
        time: dailyData.time_in,
        type: 'clock_in',
        label: 'Clock in',
        metadata: dailyData.calculation_metadata
      })
    }

    if (dailyData?.lunch_start) {
      entries.push({
        time: dailyData.lunch_start,
        type: 'lunch_start',
        label: 'Lunch break',
        metadata: dailyData.calculation_metadata
      })
    }

    if (dailyData?.lunch_end) {
      entries.push({
        time: dailyData.lunch_end,
        type: 'lunch_end',
        label: 'Resume work',
        metadata: dailyData.calculation_metadata
      })
    }

    if (dailyData?.break1_start) {
      entries.push({
        time: dailyData.break1_start,
        type: 'break_start',
        label: 'Break',
        metadata: dailyData.calculation_metadata
      })
    }

    if (dailyData?.break1_end) {
      entries.push({
        time: dailyData.break1_end,
        type: 'break_end',
        label: 'Resume work',
        metadata: dailyData.calculation_metadata
      })
    }

    if (dailyData?.break2_start) {
      entries.push({
        time: dailyData.break2_start,
        type: 'break_start',
        label: 'Break',
        metadata: dailyData.calculation_metadata
      })
    }

    if (dailyData?.break2_end) {
      entries.push({
        time: dailyData.break2_end,
        type: 'break_end',
        label: 'Resume work',
        metadata: dailyData.calculation_metadata
      })
    }

    if (dailyData?.time_out) {
      entries.push({
        time: dailyData.time_out,
        type: 'clock_out',
        label: 'Clock out',
        metadata: dailyData.calculation_metadata
      })
    }

    return entries.sort((a, b) => new Date(a.time) - new Date(b.time))
  }

  const currentStatus = getCurrentStatus()
  const timelineEntries = createTimelineEntries()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Header with Navigation */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Time Entries
              </h2>
              <p className="text-sm text-gray-500">
                Detailed list of clocked work hours and breaks
              </p>
            </div>
            
            <button 
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowLegend(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Info className="w-4 h-4" />
              <span>Legend</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              <Plus className="w-4 h-4" />
              <span>Add Time Entry</span>
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {formatDate(selectedDate)}
          </h3>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - User Profile and Summary */}
        <div className="w-80 border-r border-gray-200 p-6 bg-gray-50">
          {/* User Profile */}
          {userProfile && (
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-orange-600">
                    {userProfile.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{userProfile.full_name}</div>
                  <div className="text-sm text-gray-500">Clocked from {getTimezone()}</div>
                  <div className="text-sm text-gray-500">Split time: {getSplitTime()}</div>
                </div>
              </div>
              
              {/* Current Status */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${currentStatus.color}`}>
                      {currentStatus.status}
                    </div>
                    {currentStatus.duration && (
                      <div className="text-sm text-gray-500">
                        {currentStatus.duration}
                      </div>
                    )}
                  </div>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* Daily Summary */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tracked hours</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Worked hours</span>
                  <span className="font-medium">{formatDuration(dailyData?.regular_hours || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Breaks</span>
                  <span className="font-medium">{formatDuration(dailyData?.break_hours || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">{formatDuration((dailyData?.regular_hours || 0) + (dailyData?.overtime_hours || 0))}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Payroll hours</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Regular hours</span>
                  <span className="font-medium">{formatDuration(dailyData?.regular_hours || 0)}</span>
                </div>
                {(dailyData?.overtime_hours || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overtime</span>
                    <span className="font-medium text-orange-600">{formatDuration(dailyData.overtime_hours)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">{formatDuration(dailyData?.total_paid_hours || 0)}</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            {dailyData?.status && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <StatusBadge status={dailyData.status} />
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Timeline */}
        <div className="flex-1 p-6">
          {/* Timeline Entries */}
          <div className="space-y-4">
            {timelineEntries.map((entry, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {userProfile?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">
                      {formatTime(entry.time)}
                    </span>
                    <TimeEntryTypeBadge entryType={entry.type} />
                    {dailyData?.campaigns && (
                      <ProjectBadge campaign={dailyData.campaigns} />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {entry.label}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TimesheetIndicators entry={{ calculation_metadata: entry.metadata }} />
                  <span className="text-sm text-gray-500">
                    {formatDuration(
                      index < timelineEntries.length - 1 
                        ? (new Date(timelineEntries[index + 1].time) - new Date(entry.time)) / (1000 * 60 * 60)
                        : 0
                    )}
                  </span>
                </div>
              </div>
            ))}

            {timelineEntries.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries</h3>
                <p className="text-gray-500">No time entries recorded for this date.</p>
              </div>
            )}
          </div>

          {/* Expandable Sections */}
          <div className="mt-8 space-y-4">
            {/* Tracked Hours Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('trackedHours')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium text-gray-900">TRACKED HOURS</h3>
                  <p className="text-sm text-gray-500">Include worked hours, break hours and any auto deductions.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {formatDuration((dailyData?.regular_hours || 0) + (dailyData?.overtime_hours || 0))}
                  </span>
                  {expandedSections.trackedHours ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections.trackedHours && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Worked hours</span>
                      <span>{formatDuration(dailyData?.regular_hours || 0)}</span>
                    </div>
                    {(dailyData?.overtime_hours || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Overtime hours</span>
                        <span className="text-orange-600">{formatDuration(dailyData.overtime_hours)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Break hours</span>
                      <span>{formatDuration(dailyData?.break_hours || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payroll Hours Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('payrollHours')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium text-gray-900">PAYROLL HOURS</h3>
                  <p className="text-sm text-gray-500">Include regular hours, paid breaks, overtime hours and paid time off.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {formatDuration(dailyData?.total_paid_hours || 0)}
                  </span>
                  {expandedSections.payrollHours ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSections.payrollHours && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Regular</span>
                      <span>{formatDuration(dailyData?.regular_hours || 0)}</span>
                    </div>
                    {(dailyData?.overtime_hours || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Daily Overtime</span>
                        <span className="text-orange-600">{formatDuration(dailyData.overtime_hours)}</span>
                      </div>
                    )}
                    {(dailyData?.vacation_hours || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Vacation</span>
                        <span className="text-blue-600">{formatDuration(dailyData.vacation_hours)}</span>
                      </div>
                    )}
                    {(dailyData?.sick_hours || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Sick Leave</span>
                        <span className="text-red-600">{formatDuration(dailyData.sick_hours)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Change History Section */}
            {(dailyData?.validation_errors?.length > 0 || dailyData?.validation_warnings?.length > 0) && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('changeHistory')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">CHANGE HISTORY</h3>
                    <p className="text-sm text-gray-500">View a history log of time entries that are manually added or changed.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {(dailyData?.validation_errors?.length || 0) + (dailyData?.validation_warnings?.length || 0)}
                    </span>
                    {expandedSections.changeHistory ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {expandedSections.changeHistory && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="space-y-2">
                      {dailyData.validation_errors?.map((error, index) => (
                        <div key={index} className="text-sm text-red-600">
                          • {error}
                        </div>
                      ))}
                      {dailyData.validation_warnings?.map((warning, index) => (
                        <div key={index} className="text-sm text-yellow-600">
                          • {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicator Legend Modal */}
      <IndicatorLegend 
        isOpen={showLegend} 
        onClose={() => setShowLegend(false)} 
      />
    </div>
  )
}

export default Enhanced_DailyTimesheetView

