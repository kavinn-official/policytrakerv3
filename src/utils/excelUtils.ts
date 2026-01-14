import * as XLSX from "@e965/xlsx";
import { Policy } from "./policyUtils";

export const generateSampleExcelTemplate = () => {
  const sampleData = [
    {
      'Policy Number': 'POL001',
      'Client Name': 'John Doe',
      'Agent Name': 'AG001',
      'Company Name': 'ABC Insurance',
      'Vehicle Number': 'ABC123',
      'Vehicle Make': 'Toyota',
      'Vehicle Model': 'Camry',
      'Active Date': '2025-01-01',
      'Expiry Date': '2026-01-01',
      'Status': 'Active',
      'Reference': 'REF001',
      'Contact Number': '1234567890'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Policies');
  
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
  if (!data['Active Date']) errors.push('Active Date is required');
  if (!data['Expiry Date']) errors.push('Expiry Date is required');
  
  // Validate date formats
  if (data['Active Date'] && isNaN(Date.parse(data['Active Date']))) {
    errors.push('Active Date must be a valid date');
  }
  if (data['Expiry Date'] && isNaN(Date.parse(data['Expiry Date']))) {
    errors.push('Expiry Date must be a valid date');
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
  return {
    policy_number: row['Policy Number'] || '',
    client_name: row['Client Name'] || '',
    agent_code: row['Agent Name'] || '',
    company_name: row['Company Name'] || '',
    vehicle_number: row['Vehicle Number'] || '',
    vehicle_make: row['Vehicle Make'] || '',
    vehicle_model: row['Vehicle Model'] || '',
    policy_active_date: parseExcelDate(row['Active Date']),
    policy_expiry_date: parseExcelDate(row['Expiry Date']),
    status: row['Status'] || 'Active',
    reference: row['Reference'] || '',
    contact_number: row['Contact Number'] || '',
    user_id: userId
  };
};
