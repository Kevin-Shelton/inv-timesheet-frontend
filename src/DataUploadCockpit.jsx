// DataUploadCockpit.jsx - Dynamic upload interface with error handling and correction capabilities

import React, { useState, useRef } from "react"
import { 
  Upload, Download, AlertCircle, CheckCircle, X, Edit, Save, 
  FileText, Users, DollarSign, RefreshCw, Eye, EyeOff 
} from "lucide-react"
import { 
  EMPLOYEE_TEMPLATE_STRUCTURE, 
  PAYROLL_TEMPLATE_STRUCTURE, 
  processUploadData,
  validateField 
} from "./dataTemplates.jsx"
import { 
  downloadEmployeeTemplate, 
  downloadPayrollTemplate, 
  parseCSV 
} from "./templateGenerator.jsx"

const DataUploadCockpit = ({ onDataUploaded, onClose }) => {
  const [uploadType, setUploadType] = useState("employee") // "employee" or "payroll"
  const [uploadStep, setUploadStep] = useState("select") // "select", "upload", "review", "correct"
  const [uploadedData, setUploadedData] = useState([])
  const [processedResults, setProcessedResults] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [editedData, setEditedData] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef(null)

  const currentTemplate = uploadType === "employee" ? EMPLOYEE_TEMPLATE_STRUCTURE : PAYROLL_TEMPLATE_STRUCTURE

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setLoading(true)
    try {
      const text = await file.text()
      const data = parseCSV(text)
      setUploadedData(data)
      
      // Process and validate the data
      const results = processUploadData(data, currentTemplate)
      setProcessedResults(results)
      setUploadStep("review")
    } catch (error) {
      alert(`Error reading file: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    if (uploadType === "employee") {
      downloadEmployeeTemplate()
    } else {
      downloadPayrollTemplate()
    }
  }

  const startEdit = (errorItem) => {
    setEditingRow(errorItem.row)
    setEditedData({ ...errorItem.data })
    setUploadStep("correct")
  }

  const saveEdit = () => {
    // Validate the edited data
    const rowErrors = []
    Object.keys(currentTemplate).forEach(fieldName => {
      const fieldConfig = currentTemplate[fieldName]
      const value = editedData[fieldName]
      const fieldErrors = validateField(value, fieldConfig)
      if (fieldErrors.length > 0) {
        rowErrors.push(...fieldErrors.map(error => `${fieldName}: ${error}`))
      }
    })

    if (rowErrors.length > 0) {
      alert(`Please fix the following errors:\n${rowErrors.join("\n")}`)
      return
    }

    // Update the original data
    const updatedData = [...uploadedData]
    updatedData[editingRow - 1] = { ...editedData }
    setUploadedData(updatedData)

    // Reprocess the data
    const results = processUploadData(updatedData, currentTemplate)
    setProcessedResults(results)
    
    setEditingRow(null)
    setEditedData({})
    setUploadStep("review")
  }

  const cancelEdit = () => {
    setEditingRow(null)
    setEditedData({})
    setUploadStep("review")
  }

  const handleFinalUpload = async () => {
    if (!processedResults || processedResults.errors.length > 0) {
      alert("Please fix all errors before uploading")
      return
    }

    setLoading(true)
    try {
      // Call the parent callback with the valid data
      await onDataUploaded(processedResults.valid, uploadType)
      alert(`Successfully uploaded ${processedResults.valid.length} ${uploadType} records`)
      onClose()
    } catch (error) {
      alert(`Upload failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetUpload = () => {
    setUploadStep("select")
    setUploadedData([])
    setProcessedResults(null)
    setEditingRow(null)
    setEditedData({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "1200px", width: "95%", maxHeight: "90vh" }}>
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">Data Upload Cockpit</h2>
              <p className="card-description">Upload and manage employee or payroll data</p>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="card-content" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Step 1: Select Upload Type */}
          {uploadStep === "select" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Upload Type</h3>
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  <div 
                    className={`quick-action-card cursor-pointer ${uploadType === "employee" ? "border-blue-500 bg-blue-50" : "bg-white"}`}
                    onClick={() => setUploadType("employee")}
                  >
                    <Users className="quick-action-icon text-blue-600" />
                    <div>
                      <p className="quick-action-title text-blue-900">Employee Data</p>
                      <p className="quick-action-description text-blue-600">Upload employee information, hire dates, and status</p>
                    </div>
                  </div>
                  <div 
                    className={`quick-action-card cursor-pointer ${uploadType === "payroll" ? "border-green-500 bg-green-50" : "bg-white"}`}
                    onClick={() => setUploadType("payroll")}
                  >
                    <DollarSign className="quick-action-icon text-green-600" />
                    <div>
                      <p className="quick-action-title text-green-900">Payroll Data</p>
                      <p className="quick-action-description text-green-600">Upload historical payroll and time records</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-3">Required Fields for {uploadType === "employee" ? "Employee" : "Payroll"} Upload:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md-grid-cols-2 gap-2 text-sm">
                    {Object.entries(currentTemplate)
                      .filter(([_, config]) => config.required)
                      .map(([field, config]) => (
                        <div key={field} className="flex items-center">
                          <span className="font-medium text-red-600 mr-2">•</span>
                          <span>{config.description}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm-flex-row gap-3">
                <button 
                  onClick={handleDownloadTemplate}
                  className="btn btn-outline flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {uploadType === "employee" ? "Employee" : "Payroll"} Template
                </button>
                <button 
                  onClick={() => setUploadStep("upload")}
                  className="btn btn-primary flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Data File
                </button>
              </div>
            </div>
          )}

          {/* Step 2: File Upload */}
          {uploadStep === "upload" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Upload {uploadType === "employee" ? "Employee" : "Payroll"} Data</h3>
                <p className="text-gray-600 mb-6">Select your CSV file to upload and validate</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover-bg-gray-50">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="btn btn-primary cursor-pointer">
                    {loading ? (
                      <div className="flex items-center">
                        <div className="loading-spinner"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Choose CSV File
                      </>
                    )}
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Only CSV files are supported</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={resetUpload} className="btn btn-outline">
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review Results */}
          {uploadStep === "review" && processedResults && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Results</h3>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md-grid-cols-3 gap-4 mb-6">
                  <div className="stat-card bg-green-50 border-green-200">
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="stat-icon-container stat-icon-green">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="stat-details">
                          <p className="stat-title">Valid Records</p>
                          <p className="stat-value">{processedResults.valid.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card bg-red-50 border-red-200">
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="stat-icon-container stat-icon-red">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="stat-details">
                          <p className="stat-title">Error Records</p>
                          <p className="stat-value">{processedResults.errors.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card bg-blue-50 border-blue-200">
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="stat-icon-container stat-icon-blue">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="stat-details">
                          <p className="stat-title">Total Records</p>
                          <p className="stat-value">{uploadedData.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Records */}
                {processedResults.errors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-red-600 mb-3">Records with Errors (must be fixed before upload):</h4>
                    <div className="space-y-3">
                      {processedResults.errors.map((errorItem, index) => (
                        <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-red-800 mb-2">Row {errorItem.row}</p>
                              <div className="text-sm text-red-600 space-y-1">
                                {errorItem.errors.map((error, errorIndex) => (
                                  <p key={errorIndex}>• {error}</p>
                                ))}
                              </div>
                            </div>
                            <button 
                              onClick={() => startEdit(errorItem)}
                              className="btn btn-sm btn-outline text-red-600 border-red-600 hover-bg-red-50"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Fix
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valid Records Preview */}
                {processedResults.valid.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-green-600">Valid Records Preview:</h4>
                      <button 
                        onClick={() => setShowPreview(!showPreview)}
                        className="btn btn-sm btn-ghost"
                      >
                        {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                        {showPreview ? "Hide" : "Show"} Preview
                      </button>
                    </div>
                    
                    {showPreview && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(currentTemplate).slice(0, 5).map(field => (
                                  <th key={field} className="px-3 py-2 text-left font-medium text-gray-700">
                                    {field}
                                  </th>
                                ))}
                                <th className="px-3 py-2 text-left font-medium text-gray-700">...</th>
                              </tr>
                            </thead>
                            <tbody>
                              {processedResults.valid.slice(0, 3).map((record, index) => (
                                <tr key={index} className="border-t">
                                  {Object.keys(currentTemplate).slice(0, 5).map(field => (
                                    <td key={field} className="px-3 py-2 text-gray-600">
                                      {record[field] || "-"}
                                    </td>
                                  ))}
                                  <td className="px-3 py-2 text-gray-400">...</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {processedResults.valid.length > 3 && (
                          <div className="bg-gray-50 px-3 py-2 text-sm text-gray-600 text-center">
                            ... and {processedResults.valid.length - 3} more records
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm-flex-row gap-3">
                <button onClick={resetUpload} className="btn btn-outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </button>
                <button 
                  onClick={handleFinalUpload}
                  disabled={processedResults.errors.length > 0 || loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="loading-spinner"></div>
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {processedResults.valid.length} Valid Records
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Error Correction */}
          {uploadStep === "correct" && editingRow && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Fix Record - Row {editingRow}</h3>
                <p className="text-gray-600 mb-6">Correct the errors in this record</p>
                
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  {Object.entries(currentTemplate).map(([fieldName, fieldConfig]) => (
                    <div key={fieldName} className="form-group">
                      <label className="form-label">
                        {fieldConfig.description}
                        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {fieldConfig.validation === "enum" ? (
                        <select
                          value={editedData[fieldName] || ""}
                          onChange={(e) => setEditedData({...editedData, [fieldName]: e.target.value})}
                          className="form-select"
                        >
                          <option value="">Select...</option>
                          {fieldConfig.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={fieldConfig.type === "date" ? "date" : fieldConfig.type === "number" ? "number" : "text"}
                          value={editedData[fieldName] || ""}
                          onChange={(e) => setEditedData({...editedData, [fieldName]: e.target.value})}
                          placeholder={fieldConfig.example}
                          className="form-input"
                          step={fieldConfig.validation === "decimal" ? "0.01" : undefined}
                        />
                      )}
                      <p className="text-xs text-gray-500 mt-1">{fieldConfig.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={cancelEdit} className="btn btn-outline">
                  Cancel
                </button>
                <button onClick={saveEdit} className="btn btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataUploadCockpit

