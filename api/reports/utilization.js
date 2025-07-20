// API Route: /api/reports/utilization
// Generate utilization reports (admin only)

import { requireAdmin, getUtilizationReport } from '../supabase-service.js'

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify admin access
    const user = await requireAdmin(req, res)
    if (!user) return // Response already sent by requireAdmin

    // Parse query parameters
    const { 
      start_date, 
      end_date, 
      department,
      format = 'json'
    } = req.query

    // Validate date parameters
    const filters = {}
    
    if (start_date) {
      const startDate = new Date(start_date)
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ error: 'Invalid start_date format' })
      }
      filters.start_date = start_date
    }

    if (end_date) {
      const endDate = new Date(end_date)
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid end_date format' })
      }
      filters.end_date = end_date
    }

    if (department) {
      filters.department = department
    }

    // Generate the report
    const report = await getUtilizationReport(filters)

    // Add metadata
    const reportWithMetadata = {
      ...report,
      generated_at: new Date().toISOString(),
      generated_by: user.id,
      filters: filters,
      period: {
        start: start_date || 'All time',
        end: end_date || 'Present'
      }
    }

    // Handle different response formats
    if (format === 'csv') {
      return handleCSVResponse(res, reportWithMetadata)
    }

    res.status(200).json({
      success: true,
      report: reportWithMetadata
    })

  } catch (error) {
    console.error('Error generating utilization report:', error)
    res.status(500).json({
      error: 'Failed to generate utilization report',
      details: error.message
    })
  }
}

// Helper function to generate CSV response
function handleCSVResponse(res, report) {
  try {
    const csvRows = []
    
    // Header
    csvRows.push('Department,Total Hours,Revenue,Utilization Rate')
    
    // Department data
    Object.entries(report.department_breakdown).forEach(([dept, data]) => {
      const utilizationRate = data.hours > 0 ? ((data.hours / (data.entries * 40)) * 100).toFixed(2) : '0.00'
      csvRows.push(`${dept},${data.hours},${data.revenue.toFixed(2)},${utilizationRate}%`)
    })
    
    // Summary row
    csvRows.push('')
    csvRows.push(`Total,${report.total_hours},${report.total_revenue.toFixed(2)},${report.utilization_rate.toFixed(2)}%`)
    
    const csvContent = csvRows.join('\n')
    
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="utilization-report-${new Date().toISOString().split('T')[0]}.csv"`)
    res.status(200).send(csvContent)
    
  } catch (error) {
    console.error('Error generating CSV:', error)
    res.status(500).json({
      error: 'Failed to generate CSV report',
      details: error.message
    })
  }
}

