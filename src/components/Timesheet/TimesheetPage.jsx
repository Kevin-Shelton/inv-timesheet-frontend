import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabaseApi as api } from '../../utils/supabase'
import { TimesheetTable } from './TimesheetTable'
import { ManualEntryModal } from './ManualEntryModal'
import { ApprovalsTab } from './ApprovalsTab'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter,
  Search,
  Plus
} from 'lucide-react'

export function TimesheetPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('timesheets')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [timesheets, setTimesheets] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [currentWeek])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get week range
      const { startDate, endDate } = getWeekRange(currentWeek)
      
      // Load timesheets for the week
      const timesheetData = await api.getTimesheets({
        start_date: startDate,
        end_date: endDate
      })
      
      // Load campaigns and users
      const [campaignData, userData] = await Promise.all([
        api.getCampaigns({ is_active: true }),
        api.getUsers()
      ])
      
      setTimesheets(timesheetData)
      setCampaigns(campaignData)
      setUsers(userData)
      
    } catch (error) {
      console.error('Error loading timesheet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekRange = (date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return {
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0]
    }
  }

  const formatWeekRange = (date) => {
    const { startDate, endDate } = getWeekRange(date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const startDay = start.getDate()
    const endDay = end.getDate()
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`
    }
  }

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction * 7))
    setCurrentWeek(newWeek)
  }

  const handleManualEntrySubmit = async (entryData) => {
    try {
      await api.createTimesheet(entryData)
      await loadData() // Reload data
      setShowManualEntry(false)
    } catch (error) {
      console.error('Error creating timesheet entry:', error)
    }
  }

  if (loading) {
    return (
      <div className="timesheet-loading">
        <div className="loading-spinner"></div>
        <p>Loading timesheets...</p>
      </div>
    )
  }

  return (
    <div className="jibble-timesheet">
      {/* Header */}
      <div className="timesheet-header">
        <div className="header-left">
          <h1 className="page-title">Timesheets</h1>
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'timesheets' ? 'active' : ''}`}
              onClick={() => setActiveTab('timesheets')}
            >
              Timesheets
            </button>
            <button
              className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              Approvals
            </button>
          </div>
        </div>
        <div className="header-right">
          <button className="export-btn">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {activeTab === 'timesheets' ? (
        <div className="timesheets-content">
          {/* Controls */}
          <div className="timesheet-controls">
            <div className="controls-left">
              <div className="week-selector">
                <select className="week-dropdown">
                  <option>Weekly Timesheets</option>
                </select>
                <div className="week-navigation">
                  <button 
                    className="nav-btn"
                    onClick={() => navigateWeek(-1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="week-range">
                    {formatWeekRange(currentWeek)}
                  </span>
                  <button 
                    className="nav-btn"
                    onClick={() => navigateWeek(1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <button 
                className="add-entry-btn"
                onClick={() => setShowManualEntry(true)}
              >
                Add Manual Time Entry
              </button>
            </div>

            <div className="controls-right">
              <div className="filter-controls">
                <select className="filter-select">
                  <option>Payroll hours</option>
                </select>
                <select className="filter-select">
                  <option>Groups</option>
                </select>
                <select className="filter-select">
                  <option>Members</option>
                </select>
                <select className="filter-select">
                  <option>Schedules</option>
                </select>
                <button className="add-filter-btn">
                  <Plus className="w-4 h-4 mr-1" />
                  Add filter
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="search-container">
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Timesheet Table */}
          <TimesheetTable 
            timesheets={timesheets}
            users={users}
            currentWeek={currentWeek}
            searchTerm={searchTerm}
          />
        </div>
      ) : (
        <ApprovalsTab />
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualEntryModal
          user={user}
          campaigns={campaigns}
          onSubmit={handleManualEntrySubmit}
          onClose={() => setShowManualEntry(false)}
        />
      )}
    </div>
  )
}

