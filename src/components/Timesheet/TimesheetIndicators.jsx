import React from 'react'
import { 
  Smartphone, 
  Monitor, 
  Globe, 
  Tablet, 
  Chrome, 
  MessageSquare,
  Wifi,
  WifiOff,
  MapPin,
  Edit3,
  AlertTriangle,
  UserX,
  Clock,
  Coffee,
  User,
  Settings
} from 'lucide-react'

// Device Icons Component
export const DeviceIcon = ({ deviceType, className = "w-4 h-4" }) => {
  const getDeviceIcon = () => {
    switch (deviceType?.toLowerCase()) {
      case 'kiosk':
      case 'kiosk_speed':
        return <Monitor className={`${className} text-blue-600`} />
      case 'mobile':
      case 'mobile_app':
        return <Smartphone className={`${className} text-green-600`} />
      case 'web':
      case 'web_app':
        return <Globe className={`${className} text-purple-600`} />
      case 'desktop':
      case 'desktop_app':
        return <Monitor className={`${className} text-gray-600`} />
      case 'tablet':
        return <Tablet className={`${className} text-orange-600`} />
      case 'chrome':
      case 'chrome_extension':
        return <Chrome className={`${className} text-yellow-600`} />
      case 'slack':
      case 'teams':
      case 'messaging':
        return <MessageSquare className={`${className} text-indigo-600`} />
      default:
        return <Monitor className={`${className} text-gray-400`} />
    }
  }

  return (
    <div className="inline-flex items-center" title={`Tracked via ${deviceType || 'Unknown device'}`}>
      {getDeviceIcon()}
    </div>
  )
}

// Time Entry Status Icons Component
export const TimeEntryIcon = ({ statusType, className = "w-4 h-4" }) => {
  const getStatusIcon = () => {
    switch (statusType?.toLowerCase()) {
      case 'no_connection':
      case 'offline':
        return <WifiOff className={`${className} text-red-500`} />
      case 'gps_location':
      case 'location_detected':
        return <MapPin className={`${className} text-green-500`} />
      case 'location_edited':
      case 'manual_location':
        return <Edit3 className={`${className} text-yellow-500`} />
      case 'location_flagged':
      case 'location_warning':
        return <AlertTriangle className={`${className} text-red-500`} />
      case 'facial_recognition_failed':
      case 'face_not_detected':
        return <UserX className={`${className} text-red-500`} />
      case 'auto_clock_out':
      case 'automatic_entry':
        return <Clock className={`${className} text-blue-500`} />
      case 'manual_entry':
      case 'manual_edit':
        return <Edit3 className={`${className} text-orange-500`} />
      case 'break_violation':
      case 'break_time_violated':
        return <Coffee className={`${className} text-red-500`} />
      case 'online':
      case 'connected':
        return <Wifi className={`${className} text-green-500`} />
      default:
        return null
    }
  }

  const getStatusLabel = () => {
    switch (statusType?.toLowerCase()) {
      case 'no_connection':
        return 'No connection'
      case 'gps_location':
        return 'Location detected by GPS'
      case 'location_edited':
        return 'Location edited manually'
      case 'location_flagged':
        return 'Location flagged'
      case 'facial_recognition_failed':
        return 'Facial recognition not detected'
      case 'auto_clock_out':
        return 'Auto-clock out entry'
      case 'manual_entry':
        return 'Manual entry'
      case 'break_violation':
        return 'Break time violated'
      default:
        return statusType
    }
  }

  const icon = getStatusIcon()
  if (!icon) return null

  return (
    <div className="inline-flex items-center" title={getStatusLabel()}>
      {icon}
    </div>
  )
}

// Combined Device and Status Indicators
export const TimesheetIndicators = ({ entry, className = "" }) => {
  const { calculation_metadata, validation_errors, validation_warnings } = entry || {}
  
  // Parse metadata if it's a string
  const metadata = typeof calculation_metadata === 'string' 
    ? JSON.parse(calculation_metadata || '{}') 
    : calculation_metadata || {}

  const deviceType = metadata.device_type || metadata.source_device
  const entryMethod = metadata.entry_method || metadata.tracking_method
  const locationStatus = metadata.location_status
  const connectionStatus = metadata.connection_status
  const faceRecognition = metadata.face_recognition_status
  const isAutoEntry = metadata.is_auto_generated || metadata.auto_clock_out
  const isManualEntry = metadata.is_manual_entry || entryMethod === 'manual'
  const hasBreakViolation = metadata.break_violation || metadata.break_time_exceeded

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Device Icon */}
      {deviceType && (
        <DeviceIcon deviceType={deviceType} />
      )}

      {/* Connection Status */}
      {connectionStatus === 'offline' && (
        <TimeEntryIcon statusType="no_connection" />
      )}

      {/* Location Status */}
      {locationStatus === 'gps' && (
        <TimeEntryIcon statusType="gps_location" />
      )}
      {locationStatus === 'manual' && (
        <TimeEntryIcon statusType="location_edited" />
      )}
      {locationStatus === 'flagged' && (
        <TimeEntryIcon statusType="location_flagged" />
      )}

      {/* Face Recognition */}
      {faceRecognition === 'failed' && (
        <TimeEntryIcon statusType="facial_recognition_failed" />
      )}

      {/* Entry Method */}
      {isAutoEntry && (
        <TimeEntryIcon statusType="auto_clock_out" />
      )}
      {isManualEntry && (
        <TimeEntryIcon statusType="manual_entry" />
      )}

      {/* Break Violations */}
      {hasBreakViolation && (
        <TimeEntryIcon statusType="break_violation" />
      )}

      {/* Validation Errors */}
      {validation_errors && validation_errors.length > 0 && (
        <AlertTriangle className="w-4 h-4 text-red-500" title={`${validation_errors.length} validation errors`} />
      )}

      {/* Validation Warnings */}
      {validation_warnings && validation_warnings.length > 0 && (
        <AlertTriangle className="w-4 h-4 text-yellow-500" title={`${validation_warnings.length} validation warnings`} />
      )}
    </div>
  )
}

// Status Badge Component
export const StatusBadge = ({ status, className = "" }) => {
  const getStatusStyle = () => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = () => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Draft'
      case 'submitted':
        return 'Submitted'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'pending':
        return 'Pending'
      default:
        return status || 'Unknown'
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle()} ${className}`}>
      {getStatusLabel()}
    </span>
  )
}

// Time Entry Type Badge
export const TimeEntryTypeBadge = ({ entryType, className = "" }) => {
  const getTypeStyle = () => {
    switch (entryType?.toLowerCase()) {
      case 'clock_in':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'clock_out':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'break_start':
      case 'lunch_start':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'break_end':
      case 'lunch_end':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = () => {
    switch (entryType?.toLowerCase()) {
      case 'clock_in':
        return 'Clock in'
      case 'clock_out':
        return 'Clock out'
      case 'break_start':
        return 'Break'
      case 'break_end':
        return 'Resume'
      case 'lunch_start':
        return 'Lunch'
      case 'lunch_end':
        return 'Resume'
      default:
        return entryType || 'Entry'
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeStyle()} ${className}`}>
      {getTypeLabel()}
    </span>
  )
}

// Project/Campaign Badge
export const ProjectBadge = ({ campaign, className = "" }) => {
  if (!campaign) return null

  const colors = [
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-red-100 text-red-800 border-red-200'
  ]

  // Use campaign ID to consistently assign colors
  const colorIndex = (campaign.id || 0) % colors.length
  const colorClass = colors[colorIndex]

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      {campaign.name || 'Unknown Project'}
    </span>
  )
}

// Comprehensive Indicator Legend Component
export const IndicatorLegend = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Timesheet Indicators</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Device Icons */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Device Icons</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <DeviceIcon deviceType="kiosk" />
                <span className="text-sm">Kiosk</span>
              </div>
              <div className="flex items-center space-x-2">
                <DeviceIcon deviceType="mobile" />
                <span className="text-sm">Mobile app</span>
              </div>
              <div className="flex items-center space-x-2">
                <DeviceIcon deviceType="web" />
                <span className="text-sm">Web app</span>
              </div>
              <div className="flex items-center space-x-2">
                <DeviceIcon deviceType="desktop" />
                <span className="text-sm">Desktop app</span>
              </div>
              <div className="flex items-center space-x-2">
                <DeviceIcon deviceType="chrome" />
                <span className="text-sm">Chrome extension</span>
              </div>
              <div className="flex items-center space-x-2">
                <DeviceIcon deviceType="messaging" />
                <span className="text-sm">Messaging apps</span>
              </div>
            </div>
          </div>

          {/* Status Icons */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Status Indicators</h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-2">
                <TimeEntryIcon statusType="no_connection" />
                <span className="text-sm">No connection</span>
              </div>
              <div className="flex items-center space-x-2">
                <TimeEntryIcon statusType="gps_location" />
                <span className="text-sm">Location detected by GPS</span>
              </div>
              <div className="flex items-center space-x-2">
                <TimeEntryIcon statusType="location_edited" />
                <span className="text-sm">Location edited manually</span>
              </div>
              <div className="flex items-center space-x-2">
                <TimeEntryIcon statusType="location_flagged" />
                <span className="text-sm">Location flagged</span>
              </div>
              <div className="flex items-center space-x-2">
                <TimeEntryIcon statusType="facial_recognition_failed" />
                <span className="text-sm">Facial recognition not detected</span>
              </div>
              <div className="flex items-center space-x-2">
                <TimeEntryIcon statusType="auto_clock_out" />
                <span className="text-sm">Auto-clock out entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <TimeEntryIcon statusType="manual_entry" />
                <span className="text-sm">Manual entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <TimeEntryIcon statusType="break_violation" />
                <span className="text-sm">Break time violated</span>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Approval Status</h4>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="draft" />
              <StatusBadge status="submitted" />
              <StatusBadge status="approved" />
              <StatusBadge status="rejected" />
              <StatusBadge status="pending" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default {
  DeviceIcon,
  TimeEntryIcon,
  TimesheetIndicators,
  StatusBadge,
  TimeEntryTypeBadge,
  ProjectBadge,
  IndicatorLegend
}

