// templateGenerator.jsx - CSV Template Generator Utility
// Generates downloadable CSV templates for employee and payroll data uploads

import { 
  EMPLOYEE_TEMPLATE_STRUCTURE, 
  PAYROLL_TEMPLATE_STRUCTURE, 
  generateCSVTemplate 
} from "./dataTemplates.jsx"

// Generate Employee Upload Template
export const generateEmployeeTemplate = () => {
  const csvContent = generateCSVTemplate(EMPLOYEE_TEMPLATE_STRUCTURE, "Employee Data")
  return csvContent
}

// Generate Payroll Upload Template
export const generatePayrollTemplate = () => {
  const csvContent = generateCSVTemplate(PAYROLL_TEMPLATE_STRUCTURE, "Payroll Data")
  return csvContent
}

// Download CSV file function
export const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Template download handlers
export const downloadEmployeeTemplate = () => {
  const content = generateEmployeeTemplate()
  downloadCSV(content, "employee_upload_template.csv")
}

export const downloadPayrollTemplate = () => {
  const content = generatePayrollTemplate()
  downloadCSV(content, "payroll_upload_template.csv")
}

// Parse CSV content
export const parseCSV = (csvText) => {
  const lines = csvText.split("\n")
  const result = []
  
  // Find the header line (first line that doesn"t start with #)
  let headerIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith("#") && lines[i].trim() !== "") {
      headerIndex = i
      break
    }
  }
  
  if (headerIndex === -1) {
    throw new Error("No valid header found in CSV file")
  }
  
  const headers = lines[headerIndex].split(",").map(h => h.trim())
  
  // Process data rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === "" || line.startsWith("#")) continue
    
    const values = line.split(",").map(v => v.trim())
    const row = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })
    
    result.push(row)
  }
  
  return result
}

export default {
  generateEmployeeTemplate,
  generatePayrollTemplate,
  downloadEmployeeTemplate,
  downloadPayrollTemplate,
  downloadCSV,
  parseCSV
}


