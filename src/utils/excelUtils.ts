import * as XLSX from "@e965/xlsx";
import { Policy } from "./policyUtils";
import { normalizeCompanyName } from "./companyNormalization";

export const generateSampleExcelTemplate = () => {
  // Template matches Add New Policy page fields exactly
  const sampleData = [
    {
      'Policy Number': 'POL001',
      'Client Name': 'John Doe',
      'Contact Number': '9876543210',
      'Insurance Type': 'Vehicle Insurance',
      'Company Name': 'Cholamandalam',
      'Vehicle Number': 'MH01AB1234',
      'Vehicle Make': 'Maruti',
      'Vehicle Model': 'Swift',
      'Risk Start Date (RSD)': '2025-01-01',
      'Risk End Date (RED)': '2025-12-31',
      'Net Premium': '5000',
      'Agent Name': 'Agent Name',
      'Reference': 'REF001',
      'Status': 'Active'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 15 }, // Policy Number
    { wch: 20 }, // Client Name
    { wch: 12 }, // Contact Number
    { wch: 18 }, // Insurance Type
    { wch: 20 }, // Company Name
    { wch: 15 }, // Vehicle Number
    { wch: 12 }, // Vehicle Make
    { wch: 12 }, // Vehicle Model
    { wch: 18 }, // Risk Start Date (RSD)
    { wch: 18 }, // Risk End Date (RED)
    { wch: 12 }, // Net Premium
    { wch: 15 }, // Agent Name
    { wch: 15 }, // Reference
    { wch: 10 }, // Status
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Policy Template');
  
  const fileName = `policy_template_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};

export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const validatePolicyData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data['Policy Number']) errors.push('Policy Number is required');
  if (!data['Client Name']) errors.push('Client Name is required');
  
  // Support both old and new field names for backward compatibility
  const activeDate = data['Risk Start Date (RSD)'] || data['Risk Start Date (PSD)'] || data['Active Date'] || data['Policy Active Date'];
  const expiryDate = data['Risk End Date (RED)'] || data['Risk End Date (PED)'] || data['Expiry Date'] || data['Policy Expiry Date'];
  
  if (!activeDate) errors.push('Risk Start Date (RSD) is required');
  if (!expiryDate) errors.push('Risk End Date (RED) is required');
  
  // Validate date formats
  if (activeDate && isNaN(Date.parse(activeDate))) {
    errors.push('Risk Start Date (RSD) must be a valid date');
  }
  if (expiryDate && isNaN(Date.parse(expiryDate))) {
    errors.push('Risk End Date (RED) must be a valid date');
  }
  
  // Validate company name (optional but normalize if present)
  if (data['Company Name']) {
    const companyName = String(data['Company Name']).trim();
    if (companyName.length > 100) {
      errors.push('Company Name is too long (max 100 characters)');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

const parseExcelDate = (value: any): string => {
  if (!value) return '';
  
  // If it's already a string in YYYY-MM-DD format, return it directly
  if (typeof value === 'string') {
    const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }
  }
  
  // If it's a Date object, use UTC methods to avoid timezone issues
  if (value instanceof Date && !isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // If it's an Excel serial number (numeric)
  if (typeof value === 'number') {
    // Excel dates are stored as days since 1900-01-01
    const excelEpoch = new Date(Date.UTC(1900, 0, 1));
    const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse as a date string
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return '';
};

export const convertExcelRowToPolicy = (row: any, userId: string): any => {
  // Support both old and new field names for backward compatibility
  const activeDate = row['Risk Start Date (RSD)'] || row['Risk Start Date (PSD)'] || row['Active Date'] || row['Policy Active Date'];
  const expiryDate = row['Risk End Date (RED)'] || row['Risk End Date (PED)'] || row['Expiry Date'] || row['Policy Expiry Date'];
  
  // Normalize company name - specifically handle Cholamandalam variations
  let companyName = row['Company Name'] || '';
  if (companyName) {
    companyName = normalizeCompanyName(companyName);
  }
  
  return {
    policy_number: row['Policy Number'] || '',
    client_name: row['Client Name'] || '',
    agent_code: row['Agent Name'] || '',
    company_name: companyName,
    vehicle_number: row['Vehicle Number'] || '',
    vehicle_make: row['Vehicle Make'] || '',
    vehicle_model: row['Vehicle Model'] || '',
    policy_active_date: parseExcelDate(activeDate),
    policy_expiry_date: parseExcelDate(expiryDate),
    status: row['Status'] || 'Active',
    reference: row['Reference'] || '',
    contact_number: row['Contact Number'] || '',
    net_premium: row['Net Premium'] ? parseFloat(String(row['Net Premium']).replace(/[^\d.]/g, '')) || 0 : 0,
    insurance_type: row['Insurance Type'] || 'Vehicle Insurance',
    user_id: userId
  };
};
