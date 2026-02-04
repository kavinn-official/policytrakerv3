
import * as XLSX from "@e965/xlsx";

export interface Policy {
  id: string;
  policy_number: string;
  client_name: string;
  vehicle_number: string;
  vehicle_make: string;
  vehicle_model: string;
  policy_active_date: string;
  policy_expiry_date: string;
  status: string;
  agent_code: string;
  reference: string;
  contact_number?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  document_url?: string;
}

export const getStatusColor = (status: string) => {
  return status === "Fresh" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
};

export const getDaysToExpiry = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const timeDiff = expiry.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const filterPolicies = (policies: Policy[], searchTerm: string) => {
  if (!searchTerm) return policies;
  
  const term = searchTerm.toLowerCase();
  return policies.filter(policy =>
    (policy.policy_number && policy.policy_number.toLowerCase().includes(term)) ||
    (policy.client_name && policy.client_name.toLowerCase().includes(term)) ||
    (policy.vehicle_number && policy.vehicle_number.toLowerCase().includes(term)) ||
    (policy.vehicle_make && policy.vehicle_make.toLowerCase().includes(term)) ||
    (policy.vehicle_model && policy.vehicle_model.toLowerCase().includes(term)) ||
    (policy.agent_code && policy.agent_code.toLowerCase().includes(term)) ||
    (policy.company_name && policy.company_name.toLowerCase().includes(term))
  );
};

/**
 * Formats a date string to DD/MM/YYYY format consistently across all devices
 */
export const formatDateDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

export const downloadPoliciesAsExcel = (policies: Policy[], filename: string) => {
  if (!policies || policies.length === 0) {
    return null;
  }

  const worksheet = XLSX.utils.json_to_sheet(policies.map(policy => ({
    'Policy Number': policy.policy_number,
    'Client Name': policy.client_name,
    'Agent Name': policy.agent_code,
    'Company Name': policy.company_name || '',
    'Vehicle Number': policy.vehicle_number,
    'Vehicle Make': policy.vehicle_make,
    'Vehicle Model': policy.vehicle_model,
    'Risk Start Date (PSD)': formatDateDDMMYYYY(policy.policy_active_date),
    'Risk End Date (PED)': formatDateDDMMYYYY(policy.policy_expiry_date),
    'Status': policy.status,
    'Reference': policy.reference,
    'Contact Number': policy.contact_number || '',
    'Created At': formatDateDDMMYYYY(policy.created_at)
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Policies');
  
  const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  
  return {
    fileName,
    count: policies.length
  };
};
