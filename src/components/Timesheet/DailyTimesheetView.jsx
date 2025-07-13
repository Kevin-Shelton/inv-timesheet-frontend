import React, { useState, useEffect, useMemo } from 'react'
import { Clock, Calendar, User, MapPin, AlertCircle, CheckCircle, Edit3, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import enhancedSupabaseApi from '../../lib/Enhanced_Supabase_API'

const DailyTimesheetView = ({ userId, selectedDate, onDateChange }) => {
  const [timesheetData, setTimesheetData] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    trackedHours: false,
    payrollHours: false,
    changeHistory: false
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Load timesheet data
  useEffect(() => {
    loadDailyTimesheet()
  }, [userId, selectedDate])

  const loadDailyTimesheet = async () => {
    setLoading(true)
    try {
      const data = await enhancedSupabaseApi.getDailyTimesheet(userId, selectedDate)
      setTimesheetData(data)
      
      if (data?.users) {
        setUserProfile(data.users)
      }
    } catch (error) {
      console.error('Error loading daily timesheet:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate current status and working time
  const currentStatus = useMemo(() => {
    if (!timesheetData) return { status: 'Not clocked in', duration: '0h 0m', color: 'text-gray-500' }
    
    const { time_in, time_out, lunch_start, lunch_end, break1_start, break1_end, break2_start, break2_end } = timesheetData
    
    if (!time_in) return { status: 'Not clocked in', duration: '0h 0m', color: 'text-gray-500' }
    if (time_out) return { status: 'Clocked out', duration: calculateDuration(time_in, time_out), color: 'text-gray-600' }
    
    // Check if on break
    if (lunch_start && !lunch_end) return { status: 'On lunch break', duration: calculateDuration(lunch_start, currentTime), color: 'text-orange-600' }
    if (break1_start && !break1_end) return { status: 'On break', duration: calculateDuration(break1_start, currentTime), color: 'text-orange-600' }
    if (break2_start && !break2_end) return { status: 'On break', duration: calculateDuration(break2_start, currentTime), color: 'text-orange-600' }
    
    // Currently working
    return { status: 'Working', duration: calculateWorkingDuration(), color: 'text-green-600' }
  }, [timesheetData, currentTime])

  const calculateDuration = (start, end) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMs = endTime - startTime
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const calculateWorkingDuration = () => {
    if (!timesheetData?.time_in) return '0h 0m'
    
    const timeIn = new Date(timesheetData.time_in)
    const now = currentTime
    let totalMs = now - timeIn
    
    // Subtract break times
    const breaks = [
      { start: timesheetData.lunch_start, end: timesheetData.lunch_end },
      { start: timesheetData.break1_start, end: timesheetData.break1_end },
      { start: timesheetData.break2_start, end: timesheetData.break2_end }
    ]
    
    breaks.forEach(({ start, end }) => {
      if (start) {
        const breakStart = new Date(start)
        const breakEnd = end ? new Date(end) : now
        totalMs -= (breakEnd - breakStart)
      }
    })
    
    const hours = Math.floor(totalMs / (1000 * 60 * 60))
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getDeviceIcon = (metadata, action) => {
    const device = metadata?.[`${action}_device`] || metadata?.device || 'web_app'
    
    const deviceIcons = {
      'kiosk': '🖥️',
      'mobile_app': '📱',
      'web_app': '🌐',
      'desktop_app': '💻',
      'chrome_extension': '🔧'
    }
    
    return deviceIcons[device] || '🌐'
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'submitted': { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      'approved': { color: 'bg-green-100 text-green-800', label: 'Approved' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    }
    
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Header with User Profile and Date */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-orange-600">
                {userProfile?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {userProfile?.full_name || 'User'}
              </h2>
              <p className="text-sm text-gray-500">
                Clocking from GMT{new Date().getTimezoneOffset() / -60 >= 0 ? '+' : ''}{new Date().getTimezoneOffset() / -60}
              </p>
              <p className="text-sm text-gray-500">
                Split time: {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </p>
              {timesheetData && (
                <p className="text-sm text-gray-500">
                  {timesheetData.created_from_schedule ? 'Generated from schedule' : 'Manual entry'}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {currentStatus.duration}
            </div>
            <div className={`text-sm font-medium ${currentStatus.color}`}>
              {currentStatus.status}
            </div>
            {timesheetData && (
              <div className="mt-2">
                {getStatusBadge(timesheetData.status)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Entries Timeline */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
          <p className="text-sm text-gray-500">
            Detailed list of clocked work hours and breaks
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <button 
            onClick={() => {
              const prevDate = new Date(selectedDate)
              prevDate.setDate(prevDate.getDate() - 1)
              onDateChange(prevDate.toISOString().split('T')[0])
            }}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            ←
          </button>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </div>
            <div className="text-sm text-gray-500">
              {timesheetData?.regular_hours || 0}h {timesheetData?.overtime_hours ? `+ ${timesheetData.overtime_hours}h OT` : ''}
            </div>
          </div>
          
          <button 
            onClick={() => {
              const nextDate = new Date(selectedDate)
              nextDate.setDate(nextDate.getDate() + 1)
              onDateChange(nextDate.toISOString().split('T')[0])
            }}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            →
          </button>
        </div>

        {/* Timeline Entries */}
        <div className="space-y-4">
          {timesheetData ? (
            <>
              {/* Clock In */}
              {timesheetData.time_in && (
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">{getDeviceIcon(timesheetData.calculation_metadata, 'clock_in')}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold">{formatTime(timesheetData.time_in)}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Clock in
                      </span>
                      {timesheetData.campaigns && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {timesheetData.campaigns.name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {calculateDuration(timesheetData.time_in, timesheetData.time_out || currentTime)}
                    </div>
                  </div>
                </div>
              )}

              {/* Lunch Break */}
              {timesheetData.lunch_start && (
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">🍽️</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold">{formatTime(timesheetData.lunch_start)}</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        Lunch {timesheetData.lunch_end ? '' : '(ongoing)'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {timesheetData.lunch_end ? 
                        calculateDuration(timesheetData.lunch_start, timesheetData.lunch_end) :
                        calculateDuration(timesheetData.lunch_start, currentTime)
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Break 1 */}
              {timesheetData.break1_start && (
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">☕</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold">{formatTime(timesheetData.break1_start)}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Break {timesheetData.break1_end ? '' : '(ongoing)'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {timesheetData.break1_end ? 
                        calculateDuration(timesheetData.break1_start, timesheetData.break1_end) :
                        calculateDuration(timesheetData.break1_start, currentTime)
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Clock Out */}
              {timesheetData.time_out && (
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">{getDeviceIcon(timesheetData.calculation_metadata, 'clock_out')}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold">{formatTime(timesheetData.time_out)}</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Clock out
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No time entries for this date</p>
              <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                Add Time Entry
              </button>
            </div>
          )}
        </div>

        {/* Expandable Sections */}
        {timesheetData && (
          <div className="mt-8 space-y-4">
            {/* Tracked Hours Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('trackedHours')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">TRACKED HOURS</h4>
                  <span className="text-sm text-gray-500">
                    Include worked hours, break hours and any auto deductions.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {(timesheetData.regular_hours || 0) + (timesheetData.overtime_hours || 0)}h {Math.round(((timesheetData.regular_hours || 0) + (timesheetData.overtime_hours || 0)) * 60) % 60}m
                  </span>
                  {expandedSections.trackedHours ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              
              {expandedSections.trackedHours && (
                <div className="border-t border-gray-200 p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Worked hours</span>
                    <span className="font-medium">
                      {(timesheetData.regular_hours || 0) + (timesheetData.overtime_hours || 0)}h {Math.round(((timesheetData.regular_hours || 0) + (timesheetData.overtime_hours || 0)) * 60) % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lunch</span>
                    <span className="font-medium text-gray-500">
                      {timesheetData.break_hours ? `${timesheetData.break_hours}h` : 'UNPAID'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Payroll Hours Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('payrollHours')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">PAYROLL HOURS</h4>
                  <span className="text-sm text-gray-500">
                    Include regular hours, paid breaks, overtime hours and paid time off.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {timesheetData.total_paid_hours || 0}h {Math.round((timesheetData.total_paid_hours || 0) * 60) % 60}m
                  </span>
                  {expandedSections.payrollHours ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              
              {expandedSections.payrollHours && (
                <div className="border-t border-gray-200 p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular</span>
                    <span className="font-medium">{timesheetData.regular_hours || 0}h</span>
                  </div>
                  {timesheetData.overtime_hours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Overtime</span>
                      <span className="font-medium">{timesheetData.overtime_hours}h</span>
                    </div>
                  )}
                  {timesheetData.vacation_hours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vacation</span>
                      <span className="font-medium">{timesheetData.vacation_hours}h</span>
                    </div>
                  )}
                  {timesheetData.sick_hours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sick</span>
                      <span className="font-medium">{timesheetData.sick_hours}h</span>
                    </div>
                  )}
                  {timesheetData.holiday_hours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Holiday</span>
                      <span className="font-medium">{timesheetData.holiday_hours}h</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Change History Section */}
            {timesheetData.validation_errors?.length > 0 || timesheetData.validation_warnings?.length > 0 || timesheetData.approver_comments && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('changeHistory')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">CHANGE HISTORY</h4>
                    <span className="text-sm text-gray-500">
                      View a history log of time entries that are manually added or changed.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(timesheetData.validation_errors?.length || 0) + (timesheetData.validation_warnings?.length || 0) > 0 && (
                      <span className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs">
                        {(timesheetData.validation_errors?.length || 0) + (timesheetData.validation_warnings?.length || 0)}
                      </span>
                    )}
                    {expandedSections.changeHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                
                {expandedSections.changeHistory && (
                  <div className="border-t border-gray-200 p-4 space-y-3">
                    {timesheetData.validation_errors?.map((error, index) => (
                      <div key={index} className="flex items-start space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4 mt-0.5" />
                        <span className="text-sm">{error}</span>
                      </div>
                    ))}
                    {timesheetData.validation_warnings?.map((warning, index) => (
                      <div key={index} className="flex items-start space-x-2 text-yellow-600">
                        <AlertCircle className="w-4 h-4 mt-0.5" />
                        <span className="text-sm">{warning}</span>
                      </div>
                    ))}
                    {timesheetData.approver_comments && (
                      <div className="flex items-start space-x-2 text-blue-600">
                        <CheckCircle className="w-4 h-4 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Approver Comments:</div>
                          <div className="text-sm">{timesheetData.approver_comments}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyTimesheetView

