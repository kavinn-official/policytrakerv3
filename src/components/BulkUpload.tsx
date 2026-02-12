import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import * as XLSX from '@e965/xlsx';
import { normalizeName } from "@/utils/nameNormalization";

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: ValidationError[];
}

const REQUIRED_COLUMNS = [
  'Customer Name',
  'Insurance Type',
  'Insurance Company',
  'Policy Number',
  'Policy Start Date',
  'Policy End Date',
];

const OPTIONAL_COLUMNS = [
  'Mobile Number',
  'Premium Amount',
  'Premium Frequency',
  'Commission Percentage',
  'Policy Status',
  'Vehicle Number',
  'Vehicle Make',
  'Vehicle Model',
  'IDV',
  'Sum Insured',
  'Members Covered',
  'Plan Type',
  'Sum Assured',
  'Policy Term',
  'Premium Payment Term',
  'Agent Code',
  'Reference',
];

const BulkUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);

  const downloadTemplate = () => {
    // Create workbook with two sheets
    const wb = XLSX.utils.book_new();

    // Instructions sheet
    const instructionsData = [
      ['Policy Bulk Upload Template - Instructions'],
      [''],
      ['Required Fields (Must be filled):'],
      ['- Customer Name: Full name of the policyholder'],
      ['- Mobile Number: 10-digit mobile number (optional)'],
      ['- Insurance Type: Vehicle Insurance, Health Insurance, Life Insurance, or Other'],
      ['- Insurance Company: Name of the insurance company'],
      ['- Policy Number: Unique policy number'],
      ['- Policy Start Date: Format DD/MM/YYYY'],
      ['- Policy End Date: Format DD/MM/YYYY'],
      ['- Premium Amount: Numeric value in INR (optional)'],
      [''],
      ['Optional Fields:'],
      ['- Premium Frequency: yearly, half-yearly, quarterly, monthly (default: yearly)'],
      ['- Commission Percentage: Your commission % (e.g., 15)'],
      ['- Policy Status: Active or Expired (default: Active)'],
      ['- Vehicle Number: For motor insurance'],
      ['- Vehicle Model: For motor insurance'],
      ['- IDV: Insured Declared Value for motor insurance'],
      ['- Sum Insured: For health insurance'],
      ['- Members Covered: Number of members for health insurance'],
      ['- Plan Type: Plan type for health insurance'],
      ['- Sum Assured: For life insurance'],
      ['- Policy Term: Term in years for life insurance'],
      ['- Premium Payment Term: Payment term in years'],
      ['- Agent Code: Your agent code'],
      ['- Reference: Any reference notes'],
      [''],
      ['Important Notes:'],
      ['1. Do not modify column headers in the Data sheet'],
      ['2. Dates must be in DD/MM/YYYY format'],
      ['3. Mobile numbers should be 10 digits without country code'],
      ['4. Maximum 500 policies per upload'],
      ['5. File size limit: 10MB'],
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Data sheet with headers
    const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];
      const sampleData = [
      headers,
      [
        'Rajesh Kumar',
        '9876543210',
        'Vehicle Insurance',
        'ICICI Lombard',
        'POL123456789',
        '01/01/2025',
        '31/12/2025',
        '15000',
        'yearly',
        '15',
        'Active',
        'MH12AB1234',
        'Maruti',
        'Swift',
        '500000',
        '',
        '',
        '',
        '',
        '',
        '',
        'AG001',
        'New customer',
      ],
    ];
    const wsData = XLSX.utils.aoa_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, wsData, 'Data');

    // Download
    XLSX.writeFile(wb, 'PolicyTracker_Bulk_Upload_Template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "Fill in your policy data in the 'Data' sheet and upload.",
    });
  };

  const downloadErrorReport = (errors: ValidationError[]) => {
    const wb = XLSX.utils.book_new();
    const errorData = [
      ['Row', 'Field', 'Error Message'],
      ...errors.map(e => [e.row, e.field, e.message]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(errorData);
    XLSX.utils.book_append_sheet(wb, ws, 'Errors');
    XLSX.writeFile(wb, 'PolicyTracker_Upload_Errors.xlsx');
  };

  const parseDate = (value: any): Date | null => {
    if (!value) return null;
    
    // Handle Excel date serial numbers
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return new Date(date.y, date.m - 1, date.d);
      }
    }
    
    // Handle string dates
    const str = String(value).trim();
    
    // Try DD/MM/YYYY format
    let parsed = parse(str, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) return parsed;
    
    // Try DD-MM-YYYY format
    parsed = parse(str, 'dd-MM-yyyy', new Date());
    if (isValid(parsed)) return parsed;
    
    // Try YYYY-MM-DD format
    parsed = parse(str, 'yyyy-MM-dd', new Date());
    if (isValid(parsed)) return parsed;
    
    return null;
  };

  const validateRow = (row: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Required field validations
    if (!row['Customer Name']?.trim()) {
      errors.push({ row: rowIndex, field: 'Customer Name', message: 'Customer name is required' });
    }
    
    const mobile = String(row['Mobile Number'] || '').replace(/\D/g, '');
    if (mobile && mobile.length !== 10) {
      errors.push({ row: rowIndex, field: 'Mobile Number', message: 'Must be 10 digits if provided' });
    }
    
    const validTypes = ['Vehicle Insurance', 'Health Insurance', 'Life Insurance', 'Other'];
    if (!validTypes.includes(row['Insurance Type'])) {
      errors.push({ row: rowIndex, field: 'Insurance Type', message: `Must be one of: ${validTypes.join(', ')}` });
    }
    
    if (!row['Insurance Company']?.trim()) {
      errors.push({ row: rowIndex, field: 'Insurance Company', message: 'Insurance company is required' });
    }
    
    if (!row['Policy Number']?.trim()) {
      errors.push({ row: rowIndex, field: 'Policy Number', message: 'Policy number is required' });
    }
    
    const startDate = parseDate(row['Policy Start Date']);
    if (!startDate) {
      errors.push({ row: rowIndex, field: 'Policy Start Date', message: 'Invalid date format (use DD/MM/YYYY)' });
    }
    
    const endDate = parseDate(row['Policy End Date']);
    if (!endDate) {
      errors.push({ row: rowIndex, field: 'Policy End Date', message: 'Invalid date format (use DD/MM/YYYY)' });
    }
    
    if (startDate && endDate && startDate >= endDate) {
      errors.push({ row: rowIndex, field: 'Policy End Date', message: 'End date must be after start date' });
    }
    
    const premiumVal = row['Premium Amount'];
    if (premiumVal !== undefined && premiumVal !== null && String(premiumVal).trim() !== '') {
      const premium = parseFloat(premiumVal);
      if (isNaN(premium) || premium < 0) {
        errors.push({ row: rowIndex, field: 'Premium Amount', message: 'Must be a positive number if provided' });
      }
    }
    
    return errors;
  };

  const processFile = async (file: File) => {
    if (!user?.id) return;
    
    setUploading(true);
    setProgress(0);
    setResult(null);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Find the data sheet
      const sheetName = workbook.SheetNames.find(name => 
        name.toLowerCase() === 'data' || name.toLowerCase() === 'sheet1'
      ) || workbook.SheetNames[0];
      
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];
      
      if (rows.length === 0) {
        throw new Error('No data found in the file');
      }
      
      if (rows.length > 500) {
        throw new Error('Maximum 500 policies per upload. Please split your file.');
      }
      
      setProgress(10);
      
      // Validate all rows first
      const allErrors: ValidationError[] = [];
      rows.forEach((row, index) => {
        const rowErrors = validateRow(row, index + 2); // +2 for header and 0-indexing
        allErrors.push(...rowErrors);
      });
      
      setProgress(30);
      
      // Prepare valid policies for insertion
      const validPolicies: any[] = [];
      const rowsWithErrors = new Set(allErrors.map(e => e.row));
      
      rows.forEach((row, index) => {
        const rowNum = index + 2;
        if (rowsWithErrors.has(rowNum)) return;
        
        const startDate = parseDate(row['Policy Start Date']);
        const endDate = parseDate(row['Policy End Date']);
        
        validPolicies.push({
          user_id: user.id,
          client_name: String(row['Customer Name']).trim(),
          contact_number: String(row['Mobile Number'] || '').replace(/\D/g, '').substring(0, 10),
          insurance_type: row['Insurance Type'],
          company_name: String(row['Insurance Company']).trim(),
          policy_number: String(row['Policy Number']).trim().toUpperCase(),
          policy_active_date: format(startDate!, 'yyyy-MM-dd'),
          policy_expiry_date: format(endDate!, 'yyyy-MM-dd'),
          net_premium: parseFloat(row['Premium Amount']) || 0,
          premium_frequency: row['Premium Frequency'] || 'yearly',
          commission_percentage: parseFloat(row['Commission Percentage']) || 0,
          status: row['Policy Status'] || 'Active',
          vehicle_number: row['Vehicle Number']?.toUpperCase().replace(/[^A-Z0-9]/g, '') || null,
          vehicle_make: row['Vehicle Make'] || null,
          vehicle_model: row['Vehicle Model'] || null,
          idv: parseFloat(row['IDV']) || 0,
          sum_insured: parseFloat(row['Sum Insured']) || 0,
          members_covered: parseInt(row['Members Covered']) || 0,
          plan_type: row['Plan Type'] || null,
          sum_assured: parseFloat(row['Sum Assured']) || 0,
          policy_term: parseInt(row['Policy Term']) || null,
          premium_payment_term: parseInt(row['Premium Payment Term']) || null,
          agent_code: normalizeName(row['Agent Code']) || null,
          reference: normalizeName(row['Reference']) || null,
        });
      });
      
      setProgress(50);
      
      // Insert valid policies in batches
      let successCount = 0;
      const batchSize = 50;
      
      for (let i = 0; i < validPolicies.length; i += batchSize) {
        const batch = validPolicies.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('policies')
          .insert(batch);
        
        if (error) {
          console.error('Batch insert error:', error);
          // Add errors for this batch
          batch.forEach((_, batchIndex) => {
            const originalIndex = i + batchIndex + 2;
            allErrors.push({
              row: originalIndex,
              field: 'Database',
              message: 'Failed to save to database',
            });
          });
        } else {
          successCount += batch.length;
        }
        
        setProgress(50 + Math.round((i / validPolicies.length) * 45));
      }
      
      setProgress(100);
      
      const finalResult: UploadResult = {
        success: successCount,
        failed: rows.length - successCount,
        errors: allErrors,
      };
      
      setResult(finalResult);
      
      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `${successCount} policies added successfully${allErrors.length > 0 ? `, ${allErrors.length} errors found` : ''}.`,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: "No policies were added. Please check the error report.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('File processing error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process the file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx, .xls) or CSV",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    
    await processFile(file);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          Bulk Policy Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Download */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-3">
            Download our Excel template, fill in your policy data, and upload to add multiple policies at once.
          </p>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
        
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="bulk-upload-input"
          />
          
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-sm text-gray-600">Processing your file...</p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500">{progress}% complete</p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop your Excel file here, or
              </p>
              <Button 
                variant="default" 
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Select File
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supports .xlsx, .xls, .csv (max 10MB, 500 policies)
              </p>
            </>
          )}
        </div>
        
        {/* Results */}
        {result && (
          <div className={`rounded-lg p-4 ${result.failed > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
            <div className="flex items-start gap-3">
              {result.failed > 0 ? (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {result.success} policies added successfully
                </p>
                {result.failed > 0 && (
                  <>
                    <p className="text-sm text-gray-600">
                      {result.failed} policies failed validation
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm text-blue-600"
                      onClick={() => downloadErrorReport(result.errors)}
                    >
                      Download Error Report
                    </Button>
                  </>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setResult(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkUpload;
