import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Download } from 'lucide-react'
import enhancedSupabaseApi from '../../lib/Enhanced_Supabase_API'

const WeeklyTimesheetView = ({ userId, selectedWeek, onWeekChange, onDayClick }) => {
  const [weeklyData, setWeeklyData] = useState([])
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Calculate week dates
  const weekDates = useMemo(() => {
    const startDate = new Date(selectedWeek)
    const dates = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      })
    }
    
    return dates
  }, [selectedWeek])

  // Load weekly data
  useEffect(() => {
    loadWeeklyData()
  }, [userId, selectedWeek])

  const loadWeeklyData = async () => {
    setLoading(true)
    try {
      // Get timesheet entries for the week
      const entries = await enhancedSupabaseApi.getTimesheetEntries({
        user_id: userId,
        week_start: selectedWeek
      })

      // Get weekly summary
      const summary = await enhancedSupabaseApi.getWeeklySummary(userId, selectedWeek)
      
      // Group entries by date
      const groupedData = weekDates.map(({ date }) => {
        const dayEntries = entries.filter(entry => entry.date === date)
        const dayEntry = dayEntries[0] // Assuming one entry per day
        
        return {
          date,
          entry: dayEntry,
          firstIn: dayEntry?.time_in ? formatTime(dayEntry.time_in) : '-',
          lastOut: dayEntry?.time_out ? formatTime(dayEntry.time_out) : '-',
          trackedHours: (dayEntry?.regular_hours || 0) + (dayEntry?.overtime_hours || 0),
          payrollHours: dayEntry?.total_paid_hours || 0,
          regularHours: dayEntry?.regular_hours || 0,
          overtimeHours: dayEntry?.overtime_hours || 0,
          vacationHours: dayEntry?.vacation_hours || 0,
          sickHours: dayEntry?.sick_hours || 0,
          holidayHours: dayEntry?.holiday_hours || 0,
          status: dayEntry?.status || null,
          vacationType: dayEntry?.vacation_type,
          hasEntry: !!dayEntry
        }
      })

      setWeeklyData(groupedData)
      setWeeklySummary(summary)
      
      // Get user profile from first entry
      if (entries.length > 0 && entries[0].users) {
        setUserProfile(entries[0].users)
      }
    } catch (error) {
      console.error('Error loading weekly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatHours = (hours) => {
    if (!hours || hours === 0) return '-'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  const formatWeekRange = () => {
    const startDate = new Date(selectedWeek)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  const navigateWeek = (direction) => {
    const currentWeek = new Date(selectedWeek)
    currentWeek.setDate(currentWeek.getDate() + (direction * 7))
    onWeekChange(currentWeek.toISOString().split('T')[0])
  }

  const getWeeklyTotals = () => {
    return weeklyData.reduce((totals, day) => ({
      trackedHours: totals.trackedHours + day.trackedHours,
      payrollHours: totals.payrollHours + day.payrollHours,
      regularHours: totals.regularHours + day.regularHours,
      overtimeHours: totals.overtimeHours + day.overtimeHours,
      vacationHours: totals.vacationHours + day.vacationHours,
      sickHours: totals.sickHours + day.sickHours,
      holidayHours: totals.holidayHours + day.holidayHours
    }), {
      trackedHours: 0,
      payrollHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      vacationHours: 0,
      sickHours: 0,
      holidayHours: 0
    })
  }

  const getVacationTypeLabel = (type) => {
    const types = {
      'vacation': 'Leave (Hour)',
      'sick': 'Sick Leave',
      'holiday': 'Public Holiday',
      'personal': 'Personal Leave'
    }
    return types[type] || type
  }

  const getVacationTypeColor = (type) => {
    const colors = {
      'vacation': 'bg-blue-100 text-blue-800',
      'sick': 'bg-red-100 text-red-800',
      'holiday': 'bg-green-100 text-green-800',
      'personal': 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const weeklyTotals = getWeeklyTotals()

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
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {formatWeekRange()}
              </h2>
              <p className="text-sm text-gray-500">
                Weekly Timesheets
              </p>
            </div>
            
            <button 
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Day</th>
                {weekDates.map(({ dayName, dayNumber, date, isToday, isWeekend }) => (
                  <th key={date} className="text-center py-3 px-4 min-w-[120px]">
                    <div className={`${isToday ? 'text-orange-600 font-semibold' : 'text-gray-600'} ${isWeekend ? 'text-gray-400' : ''}`}>
                      <div className="text-sm font-medium">{dayName}</div>
                      <div className="text-lg">{dayNumber}</div>
                    </div>
                  </th>
                ))}
                <th className="text-center py-3 px-4 font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {/* Vacation/Leave Indicators */}
              <tr>
                <td className="py-3 px-4 text-sm text-gray-600">Leave Type</td>
                {weeklyData.map(({ date, vacationType, vacationHours, holidayHours, sickHours }) => (
                  <td key={date} className="text-center py-3 px-4">
                    {vacationType && vacationType !== 'none' ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVacationTypeColor(vacationType)}`}>
                        {getVacationTypeLabel(vacationType)}
                      </span>
                    ) : holidayHours > 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Public Holiday
                      </span>
                    ) : sickHours > 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Sick Leave
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
                <td className="text-center py-3 px-4 text-gray-400">-</td>
              </tr>

              {/* First In */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">First in</td>
                {weeklyData.map(({ date, firstIn, hasEntry }) => (
                  <td 
                    key={date} 
                    className={`text-center py-3 px-4 text-sm ${hasEntry ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                    onClick={() => hasEntry && onDayClick && onDayClick(date)}
                  >
                    <span className={hasEntry ? 'text-gray-900' : 'text-gray-400'}>
                      {firstIn}
                    </span>
                  </td>
                ))}
                <td className="text-center py-3 px-4 text-gray-400">-</td>
              </tr>

              {/* Last Out */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">Last out</td>
                {weeklyData.map(({ date, lastOut, hasEntry }) => (
                  <td 
                    key={date} 
                    className={`text-center py-3 px-4 text-sm ${hasEntry ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                    onClick={() => hasEntry && onDayClick && onDayClick(date)}
                  >
                    <span className={hasEntry ? 'text-gray-900' : 'text-gray-400'}>
                      {lastOut}
                    </span>
                  </td>
                ))}
                <td className="text-center py-3 px-4 text-gray-400">-</td>
              </tr>

              {/* Tracked Hours */}
              <tr className="hover:bg-gray-50 bg-blue-50">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">Tracked hours</td>
                {weeklyData.map(({ date, trackedHours, hasEntry, overtimeHours }) => (
                  <td 
                    key={date} 
                    className={`text-center py-3 px-4 text-sm font-medium ${hasEntry ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                    onClick={() => hasEntry && onDayClick && onDayClick(date)}
                  >
                    <div className={hasEntry ? 'text-gray-900' : 'text-gray-400'}>
                      {formatHours(trackedHours)}
                      {overtimeHours > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          +{formatHours(overtimeHours)} OT
                        </div>
                      )}
                    </div>
                  </td>
                ))}
                <td className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                  {formatHours(weeklyTotals.trackedHours)}
                  {weeklyTotals.overtimeHours > 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      +{formatHours(weeklyTotals.overtimeHours)} OT
                    </div>
                  )}
                </td>
              </tr>

              {/* Payroll Hours */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">Payroll hours</td>
                {weeklyData.map(({ date, payrollHours, hasEntry, vacationHours, sickHours, holidayHours }) => (
                  <td 
                    key={date} 
                    className={`text-center py-3 px-4 text-sm font-medium ${hasEntry ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                    onClick={() => hasEntry && onDayClick && onDayClick(date)}
                  >
                    <div className={hasEntry ? 'text-gray-900' : 'text-gray-400'}>
                      {formatHours(payrollHours)}
                      {(vacationHours > 0 || sickHours > 0 || holidayHours > 0) && (
                        <div className="text-xs text-blue-600 mt-1">
                          {vacationHours > 0 && `V:${formatHours(vacationHours)} `}
                          {sickHours > 0 && `S:${formatHours(sickHours)} `}
                          {holidayHours > 0 && `H:${formatHours(holidayHours)}`}
                        </div>
                      )}
                    </div>
                  </td>
                ))}
                <td className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                  {formatHours(weeklyTotals.payrollHours)}
                  {(weeklyTotals.vacationHours > 0 || weeklyTotals.sickHours > 0 || weeklyTotals.holidayHours > 0) && (
                    <div className="text-xs text-blue-600 mt-1">
                      {weeklyTotals.vacationHours > 0 && `V:${formatHours(weeklyTotals.vacationHours)} `}
                      {weeklyTotals.sickHours > 0 && `S:${formatHours(weeklyTotals.sickHours)} `}
                      {weeklyTotals.holidayHours > 0 && `H:${formatHours(weeklyTotals.holidayHours)}`}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Weekly Summary */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatHours(weeklyTotals.trackedHours)}
              </div>
              <div className="text-sm text-gray-600">Total Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatHours(weeklyTotals.regularHours)}
              </div>
              <div className="text-sm text-gray-600">Regular Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatHours(weeklyTotals.overtimeHours)}
              </div>
              <div className="text-sm text-gray-600">Overtime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatHours(weeklyTotals.payrollHours)}
              </div>
              <div className="text-sm text-gray-600">Total Payroll</div>
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
    </div>
  )
}

export default WeeklyTimesheetView

