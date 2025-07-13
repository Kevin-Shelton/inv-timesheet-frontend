import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle } from 'lucide-react'
import enhancedSupabaseApi from '../../lib/Enhanced_Supabase_API'

const MonthlyTimesheetView = ({ userId, selectedMonth, onMonthChange, onDayClick }) => {
  const [monthlyData, setMonthlyData] = useState({})
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hoveredDay, setHoveredDay] = useState(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  // Calculate month calendar
  const monthCalendar = useMemo(() => {
    const year = new Date(selectedMonth).getFullYear()
    const month = new Date(selectedMonth).getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const weeks = []
    let currentWeek = []
    
    for (let i = 0; i < 42; i++) { // 6 weeks max
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dayData = {
        date: date.toISOString().split('T')[0],
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      }
      
      currentWeek.push(dayData)
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    
    return weeks.filter(week => week.some(day => day.isCurrentMonth))
  }, [selectedMonth])

  // Load monthly data
  useEffect(() => {
    loadMonthlyData()
  }, [userId, selectedMonth])

  const loadMonthlyData = async () => {
    setLoading(true)
    try {
      const year = new Date(selectedMonth).getFullYear()
      const month = new Date(selectedMonth).getMonth()
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0]
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0]
      
      // Get timesheet entries for the month
      const entries = await enhancedSupabaseApi.getTimesheetEntries({
        user_id: userId,
        date_from: firstDay,
        date_to: lastDay
      })

      // Group entries by date
      const groupedData = {}
      entries.forEach(entry => {
        groupedData[entry.date] = {
          ...entry,
          trackedHours: (entry.regular_hours || 0) + (entry.overtime_hours || 0),
          payrollHours: entry.total_paid_hours || 0,
          firstIn: entry.time_in ? formatTime(entry.time_in) : null,
          lastOut: entry.time_out ? formatTime(entry.time_out) : null,
          hasOvertime: (entry.overtime_hours || 0) > 0,
          hasLeave: entry.vacation_type && entry.vacation_type !== 'none',
          leaveType: entry.vacation_type
        }
      })

      setMonthlyData(groupedData)
      
      // Get user profile from first entry
      if (entries.length > 0 && entries[0].users) {
        setUserProfile(entries[0].users)
      }
    } catch (error) {
      console.error('Error loading monthly data:', error)
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

  const formatHours = (hours) => {
    if (!hours || hours === 0) return '0h'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  const formatMonthYear = () => {
    return new Date(selectedMonth).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const navigateMonth = (direction) => {
    const currentMonth = new Date(selectedMonth)
    currentMonth.setMonth(currentMonth.getMonth() + direction)
    onMonthChange(currentMonth.toISOString().split('T')[0])
  }

  const getMonthlyTotals = () => {
    return Object.values(monthlyData).reduce((totals, day) => ({
      trackedHours: totals.trackedHours + day.trackedHours,
      payrollHours: totals.payrollHours + day.payrollHours,
      regularHours: totals.regularHours + (day.regular_hours || 0),
      overtimeHours: totals.overtimeHours + (day.overtime_hours || 0),
      vacationHours: totals.vacationHours + (day.vacation_hours || 0),
      sickHours: totals.sickHours + (day.sick_hours || 0),
      holidayHours: totals.holidayHours + (day.holiday_hours || 0),
      workingDays: totals.workingDays + (day.trackedHours > 0 ? 1 : 0)
    }), {
      trackedHours: 0,
      payrollHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      vacationHours: 0,
      sickHours: 0,
      holidayHours: 0,
      workingDays: 0
    })
  }

  const getWeeklyTotal = (week) => {
    return week.reduce((total, day) => {
      const dayData = monthlyData[day.date]
      return total + (dayData?.trackedHours || 0)
    }, 0)
  }

  const getDayStyle = (day, dayData) => {
    let baseStyle = "relative h-24 p-2 border border-gray-100 cursor-pointer transition-colors "
    
    if (!day.isCurrentMonth) {
      baseStyle += "bg-gray-50 text-gray-400 "
    } else if (day.isToday) {
      baseStyle += "bg-orange-50 border-orange-200 "
    } else if (day.isWeekend) {
      baseStyle += "bg-gray-50 "
    } else {
      baseStyle += "bg-white hover:bg-gray-50 "
    }
    
    if (dayData) {
      if (dayData.hasLeave) {
        baseStyle += "bg-blue-50 border-blue-200 "
      } else if (dayData.hasOvertime) {
        baseStyle += "bg-orange-50 border-orange-200 "
      }
    }
    
    return baseStyle
  }

  const getLeaveTypeLabel = (type) => {
    const types = {
      'vacation': 'Annual Leave',
      'sick': 'Sick Leave', 
      'holiday': 'Public Holiday',
      'personal': 'Personal Leave'
    }
    return types[type] || type
  }

  const handleMouseEnter = (day, dayData, event) => {
    if (dayData && day.isCurrentMonth) {
      setHoveredDay({ day, dayData })
      setHoverPosition({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  const monthlyTotals = getMonthlyTotals()

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
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {formatMonthYear()}
              </h2>
              <p className="text-sm text-gray-500">
                Monthly Timesheets
              </p>
            </div>
            
            <button 
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-8 bg-gray-50">
            <div className="p-3 text-center text-sm font-medium text-gray-600">Week</div>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          {monthCalendar.map((week, weekIndex) => {
            const weekTotal = getWeeklyTotal(week)
            return (
              <div key={weekIndex} className="grid grid-cols-8 border-t border-gray-200">
                {/* Week Total */}
                <div className="p-3 bg-gray-50 border-r border-gray-200 flex flex-col justify-center items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {formatHours(weekTotal)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Week {weekIndex + 1}
                  </div>
                </div>

                {/* Days */}
                {week.map((day) => {
                  const dayData = monthlyData[day.date]
                  return (
                    <div
                      key={day.date}
                      className={getDayStyle(day, dayData)}
                      onClick={() => day.isCurrentMonth && onDayClick && onDayClick(day.date)}
                      onMouseEnter={(e) => handleMouseEnter(day, dayData, e)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Day Number */}
                      <div className={`text-sm font-medium ${day.isToday ? 'text-orange-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                        {day.dayNumber}
                      </div>

                      {/* Leave Indicator */}
                      {dayData?.hasLeave && (
                        <div className="mt-1">
                          <div className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-center">
                            {getLeaveTypeLabel(dayData.leaveType)}
                          </div>
                        </div>
                      )}

                      {/* Hours Display */}
                      {dayData && dayData.trackedHours > 0 && (
                        <div className="mt-1">
                          <div className={`text-xs font-medium ${dayData.hasOvertime ? 'text-orange-600' : 'text-gray-900'}`}>
                            {formatHours(dayData.trackedHours)}
                          </div>
                          {dayData.hasOvertime && (
                            <div className="text-xs text-orange-600">
                              +{formatHours(dayData.overtime_hours)} OT
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status Indicators */}
                      {dayData && (
                        <div className="absolute bottom-1 right-1 flex space-x-1">
                          {dayData.status === 'approved' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                          {dayData.status === 'submitted' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          {dayData.status === 'rejected' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                          {dayData.validation_errors?.length > 0 && (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Monthly Total Row */}
          <div className="grid grid-cols-8 border-t-2 border-gray-300 bg-gray-50">
            <div className="p-3 text-center text-sm font-semibold text-gray-900">
              Monthly total
            </div>
            <div className="col-span-6 p-3 text-center text-lg font-bold text-gray-900">
              {formatHours(monthlyTotals.trackedHours)}
            </div>
            <div className="p-3 text-center text-sm text-gray-600">
              {monthlyTotals.workingDays} days
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatHours(monthlyTotals.trackedHours)}
              </div>
              <div className="text-sm text-gray-600">Total Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatHours(monthlyTotals.regularHours)}
              </div>
              <div className="text-sm text-gray-600">Regular Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatHours(monthlyTotals.overtimeHours)}
              </div>
              <div className="text-sm text-gray-600">Overtime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatHours(monthlyTotals.vacationHours + monthlyTotals.sickHours + monthlyTotals.holidayHours)}
              </div>
              <div className="text-sm text-gray-600">Leave Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {monthlyTotals.workingDays}
              </div>
              <div className="text-sm text-gray-600">Working Days</div>
            </div>
          </div>
        </div>

        {/* User Profile Info */}
        {userProfile && (
          <div className="mt-6 flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-orange-600">
                {userProfile.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{userProfile.full_name}</div>
              <div className="text-sm text-gray-500">{userProfile.email}</div>
              {userProfile.pay_rate_per_hour && (
                <div className="text-sm text-gray-500">
                  Rate: ${userProfile.pay_rate_per_hour}/hour
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {hoveredDay && (
        <div 
          className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none"
          style={{ 
            left: hoverPosition.x + 10, 
            top: hoverPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="text-sm font-medium mb-2">
            {new Date(hoveredDay.day.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="space-y-1 text-xs">
            {hoveredDay.dayData.firstIn && (
              <div>First in: {hoveredDay.dayData.firstIn}</div>
            )}
            {hoveredDay.dayData.lastOut && (
              <div>Last out: {hoveredDay.dayData.lastOut}</div>
            )}
            <div>Regular: {formatHours(hoveredDay.dayData.regular_hours || 0)}</div>
            {hoveredDay.dayData.overtime_hours > 0 && (
              <div>Overtime: {formatHours(hoveredDay.dayData.overtime_hours)}</div>
            )}
            {hoveredDay.dayData.hasLeave && (
              <div>Leave: {getLeaveTypeLabel(hoveredDay.dayData.leaveType)}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MonthlyTimesheetView

