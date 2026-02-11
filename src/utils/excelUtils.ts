import * as XLSX from "@e965/xlsx";
import { Policy } from "./policyUtils";
import { normalizeCompanyName } from "./companyNormalization";

export const generateSampleExcelTemplate = () => {
  // Template matches Add New Policy page fields - simplified and essential only
  const sampleData = [
    {
      'Policy Number': 'POL001',
      'Insurance Type': 'Vehicle Insurance',
      'Client Name': 'John Doe',
      'Risk Start Date (RSD)': '01-01-2025',
      'Risk End Date (RED)': '31-12-2025',
      'Contact Number': '9876543210',
      'Company Name': 'Cholamandalam',
      'Vehicle Number': 'MH01AB1234',
      'Vehicle Make': 'Maruti',
      'Vehicle Model': 'Swift',
      'Net Premium': '5000',
      'Status': 'Active',
      'Agent Name': 'AG001',
      'Reference': 'New customer',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 15 }, // Policy Number
    { wch: 18 }, // Insurance Type
    { wch: 20 }, // Client Name
    { wch: 18 }, // Risk Start Date (RSD)
    { wch: 18 }, // Risk End Date (RED)
    { wch: 14 }, // Contact Number
    { wch: 18 }, // Company Name
    { wch: 14 }, // Vehicle Number
    { wch: 12 }, // Vehicle Make
    { wch: 12 }, // Vehicle Model
    { wch: 12 }, // Net Premium
    { wch: 10 }, // Status
    { wch: 15 }, // Agent Name
    { wch: 20 }, // Reference
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Policy Template');
  
  // Add instructions sheet
  const instructions = [
    ['Policy Upload Template Instructions'],
    [''],
    ['Mandatory Fields (must be filled):'],
    ['- Policy Number: Unique policy identifier'],
    ['- Insurance Type: Vehicle Insurance, Health Insurance, Life Insurance, Other Insurance'],
    ['- Client Name: Full name of the policyholder'],
    ['- Risk Start Date (RSD): Policy start date (DD-MM-YYYY or YYYY-MM-DD)'],
    [''],
    ['Optional Fields:'],
    ['- Risk End Date (RED): Policy end date (auto-calculated as 1 year from RSD if empty)'],
    ['- Contact Number: Mobile number (10 digits)'],
    ['- Company Name: Insurance company (auto-normalized, e.g., "CHOLA" becomes "Cholamandalam")'],
    ['- Vehicle Number: Registration number (for vehicle insurance)'],
    ['- Vehicle Make: Manufacturer (e.g., Maruti, Honda)'],
    ['- Vehicle Model: Model name'],
    ['- Net Premium: Premium amount in INR'],
    ['- Status: Active or Expired (default: Active)'],
    ['- Agent Name: Your agent name/code'],
    ['- Reference: Any reference notes'],
    [''],
    ['Company Name Shortcuts (auto-converted):'],
    ['- CHOLA, CHOLAMANDALAM MS → Cholamandalam'],
    ['- NATIONAL INS, NIC → National'],
    ['- IFFCO, IFFCO TOKIO → Iffco Tokio'],
    ['- BAJAJ, BAJAJ ALLIANZ → Bajaj Allianz'],
    ['- HDFC, HDFC ERGO → HDFC Ergo'],
    ['- ICICI, ICICI LOMBARD → ICICI Lombard'],
    ['- And many more...'],
    [''],
    ['Notes:'],
    ['- Date formats supported: DD-MM-YYYY, YYYY-MM-DD, or Excel date format'],
    ['- First row must contain column headers exactly as shown'],
    ['- If Risk End Date is left empty, it will be auto-calculated as 1 year from Risk Start Date'],
    ['- Free users can upload up to 200 policies total'],
    ['- Delete this instructions sheet before uploading (optional)'],
  ];
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
  instructionsSheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  const fileName = `policy_upload_template.xlsx`;
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
        // Skip instructions sheet if present
        const sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase() !== 'instructions'
        ) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
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

export const validatePolicyData = (data: any, rowIndex: number): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const rowNum = rowIndex + 2; // +2 for 1-indexed and header row
  
  // Only 4 mandatory fields: Policy Number, Insurance Type, Client Name, Risk Start Date
  if (!data['Policy Number']) {
    errors.push(`Row ${rowNum}: Policy Number is required`);
  }
  
  const insuranceType = data['Insurance Type'] || data['Type of Insurance'];
  if (!insuranceType) {
    errors.push(`Row ${rowNum}: Insurance Type is required`);
  } else {
    const validTypes = ['Vehicle Insurance', 'Health Insurance', 'Life Insurance', 'Other Insurance', 'Other'];
    if (!validTypes.includes(insuranceType)) {
      errors.push(`Row ${rowNum}: Insurance Type must be one of: ${validTypes.join(', ')}`);
    }
  }
  
  if (!data['Client Name']) {
    errors.push(`Row ${rowNum}: Client Name is required`);
  }
  
  // Support both old and new field names for backward compatibility
  const activeDate = data['Risk Start Date (RSD)'] || data['Risk Start Date (PSD)'] || data['Active Date'] || data['Policy Active Date'];
  
  if (!activeDate) {
    errors.push(`Row ${rowNum}: Risk Start Date (RSD) is required`);
  }
  
  // Risk End Date is now optional - will be auto-calculated if empty
  
  // Validate date formats
  if (activeDate) {
    const parsedDate = parseExcelDate(activeDate);
    if (!parsedDate) {
      errors.push(`Row ${rowNum}: Invalid Risk Start Date format`);
    }
  }
  
  const expiryDate = data['Risk End Date (RED)'] || data['Risk End Date (PED)'] || data['Expiry Date'] || data['Policy Expiry Date'];
  if (expiryDate) {
    const parsedDate = parseExcelDate(expiryDate);
    if (!parsedDate) {
      errors.push(`Row ${rowNum}: Invalid Risk End Date format`);
    }
  }
  
  // Validate contact number if provided
  if (data['Contact Number']) {
    const phone = String(data['Contact Number']).replace(/\D/g, '');
    if (phone.length > 0 && phone.length < 10) {
      errors.push(`Row ${rowNum}: Contact Number should be at least 10 digits`);
    }
  }
  
  // Validate premium if provided
  if (data['Net Premium']) {
    const premium = parseFloat(String(data['Net Premium']).replace(/[^\d.]/g, ''));
    if (isNaN(premium) || premium < 0) {
      errors.push(`Row ${rowNum}: Net Premium must be a valid positive number`);
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
    // YYYY-MM-DD format
    const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = String(isoMatch[2]).padStart(2, '0');
      const day = String(isoMatch[3]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // DD-MM-YYYY or DD/MM/YYYY format
    const dmyMatch = value.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
    if (dmyMatch) {
      const day = String(dmyMatch[1]).padStart(2, '0');
      const month = String(dmyMatch[2]).padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
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

// Auto-calculate Risk End Date as 1 year from Risk Start Date
const calculateEndDate = (startDateStr: string): string => {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const endYear = year + 1;
  return `${endYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const convertExcelRowToPolicy = (row: any, userId: string): any => {
  // Support both old and new field names for backward compatibility
  const activeDate = row['Risk Start Date (RSD)'] || row['Risk Start Date (PSD)'] || row['Active Date'] || row['Policy Active Date'];
  const expiryDate = row['Risk End Date (RED)'] || row['Risk End Date (PED)'] || row['Expiry Date'] || row['Policy Expiry Date'];
  
  const parsedStartDate = parseExcelDate(activeDate);
  let parsedEndDate = parseExcelDate(expiryDate);
  
  // Auto-calculate end date if empty (1 year from start date)
  if (!parsedEndDate && parsedStartDate) {
    parsedEndDate = calculateEndDate(parsedStartDate);
  }
  
  // Normalize company name - automatically standardize variations
  let companyName = row['Company Name'] || '';
  if (companyName) {
    companyName = normalizeCompanyName(companyName);
  }
  
  // Parse and clean contact number
  let contactNumber = row['Contact Number'] || '';
  if (contactNumber) {
    contactNumber = String(contactNumber).replace(/\D/g, '');
  }
  
  // Parse premium
  let netPremium = 0;
  if (row['Net Premium']) {
    netPremium = parseFloat(String(row['Net Premium']).replace(/[^\d.]/g, '')) || 0;
  }
  
  return {
    policy_number: String(row['Policy Number'] || '').trim(),
    client_name: String(row['Client Name'] || '').trim(),
    agent_code: String(row['Agent Name'] || row['Agent Code'] || '').trim(),
    company_name: companyName,
    vehicle_number: String(row['Vehicle Number'] || '').trim().toUpperCase(),
    vehicle_make: String(row['Vehicle Make'] || '').trim(),
    vehicle_model: String(row['Vehicle Model'] || '').trim(),
    policy_active_date: parsedStartDate,
    policy_expiry_date: parsedEndDate,
    status: String(row['Status'] || 'Active').trim(),
    reference: String(row['Reference'] || '').trim(),
    contact_number: contactNumber,
    net_premium: netPremium,
    insurance_type: row['Insurance Type'] || row['Type of Insurance'] || 'Vehicle Insurance',
    user_id: userId
  };
};

// Batch validation helper
export const validateBulkUpload = (data: any[]): { 
  valid: boolean; 
  errors: string[]; 
  validRows: number;
  invalidRows: number;
} => {
  const allErrors: string[] = [];
  let validRows = 0;
  let invalidRows = 0;
  
  data.forEach((row, index) => {
    const result = validatePolicyData(row, index);
    if (result.valid) {
      validRows++;
    } else {
      invalidRows++;
      allErrors.push(...result.errors);
    }
  });
  
  // Limit error display to first 10 errors
  const displayErrors = allErrors.slice(0, 10);
  if (allErrors.length > 10) {
    displayErrors.push(`... and ${allErrors.length - 10} more errors`);
  }
  
  return {
    valid: invalidRows === 0,
    errors: displayErrors,
    validRows,
    invalidRows
  };
};
