
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

// CORS headers for all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Policy {
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
  contact_number: string | null;
  company_name: string | null;
  insurance_type: string;
  net_premium: number | null;
}

// Input validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_HOURS = 1;
const RATE_LIMIT_MAX_REQUESTS = 5;

// Rate limiting helper
async function checkRateLimit(supabaseClient: any, userId: string, functionName: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);

  try {
    const { data: existing, error: fetchError } = await supabaseClient
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('function_name', functionName)
      .eq('window_start', windowStart.toISOString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Rate limit check error:', fetchError);
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
    }

    const currentCount = existing?.request_count || 0;
    
    if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0 };
    }

    if (existing) {
      await supabaseClient
        .from('rate_limits')
        .update({ request_count: currentCount + 1 })
        .eq('user_id', userId)
        .eq('function_name', functionName)
        .eq('window_start', windowStart.toISOString());
    } else {
      await supabaseClient
        .from('rate_limits')
        .insert({
          user_id: userId,
          function_name: functionName,
          window_start: windowStart.toISOString(),
          request_count: 1
        });
    }

    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - currentCount - 1 };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }
}

// Group policies by insurance type
function groupPoliciesByType(policies: Policy[]): Record<string, Policy[]> {
  return policies.reduce((acc, policy) => {
    const type = policy.insurance_type || 'Vehicle Insurance';
    if (!acc[type]) acc[type] = [];
    acc[type].push(policy);
    return acc;
  }, {} as Record<string, Policy[]>);
}

// HTML escape function to prevent XSS in email templates
function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Calculate premium breakup by insurance type
function calculatePremiumBreakup(policies: Policy[]): Record<string, { count: number; premium: number }> {
  const breakup: Record<string, { count: number; premium: number }> = {
    'Vehicle Insurance': { count: 0, premium: 0 },
    'Health Insurance': { count: 0, premium: 0 },
    'Life Insurance': { count: 0, premium: 0 },
    'Other': { count: 0, premium: 0 },
  };

  policies.forEach(policy => {
    const type = policy.insurance_type || 'Vehicle Insurance';
    const premium = Number(policy.net_premium) || 0;
    
    if (breakup[type]) {
      breakup[type].count++;
      breakup[type].premium += premium;
    } else {
      breakup['Other'].count++;
      breakup['Other'].premium += premium;
    }
  });

  return breakup;
}

const handler = async (req: Request): Promise<Response> => {
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting policy report generation...");

    const { manual_trigger, user_id, report_type, month } = await req.json().catch(() => ({}));
    
    let profiles;
    
    if (manual_trigger && user_id) {
      if (typeof user_id !== 'string' || !isValidUUID(user_id)) {
        console.error("Invalid user_id format");
        return new Response(JSON.stringify({ 
          error: "Invalid user_id format" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        console.error("Authorization required for manual trigger");
        return new Response(JSON.stringify({ 
          error: "Authorization required" 
        }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (authError || !authData.user) {
        console.error("Authentication failed");
        return new Response(JSON.stringify({ 
          error: "Authentication failed" 
        }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (authData.user.id !== user_id) {
        console.error("Unauthorized: User cannot trigger reports for other users");
        return new Response(JSON.stringify({ 
          error: "Unauthorized to trigger reports for other users" 
        }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const rateLimit = await checkRateLimit(supabaseClient, user_id, 'send-policy-report');
      if (!rateLimit.allowed) {
        console.log("Rate limit exceeded for user");
        return new Response(JSON.stringify({ 
          error: "Too many report requests. Please try again later." 
        }), {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user_id)
        .single();
      
      if (profileError || !profileData) {
        console.log("Profile not found for user, creating one");
        
        const { data: authUserData } = await supabaseClient.auth.admin.getUserById(user_id);
        
        if (authUserData?.user) {
          const { data: newProfile, error: createError } = await supabaseClient
            .from('profiles')
            .upsert({
              id: user_id,
              email: authUserData.user.email,
              full_name: authUserData.user.user_metadata?.full_name || null,
            })
            .select('id, email, full_name')
            .single();
          
          if (createError) {
            console.error("Error creating profile:", createError);
            throw new Error("Failed to create user profile");
          }
          profiles = newProfile ? [newProfile] : [];
        } else {
          console.error("Could not retrieve auth user data");
          throw new Error("User not found");
        }
      } else {
        profiles = [profileData];
      }
      console.log("Manual trigger received");
    } else {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name');

      if (error) {
        console.error("Error fetching profiles");
        throw error;
      }
      profiles = data;
    }

    console.log(`Processing ${profiles?.length || 0} users`);

    for (const profile of profiles || []) {
      try {
        // Determine date range based on report type
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        let isMonthlyReport = report_type === 'monthly_premium';

        if (isMonthlyReport && month) {
          const now = new Date();
          let targetMonth: Date;
          
          switch (month) {
            case "previous":
              targetMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              break;
            case "2months":
              targetMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
              break;
            case "3months":
              targetMonth = new Date(now.getFullYear(), now.getMonth() - 3, 1);
              break;
            default:
              targetMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          }
          
          startDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
          endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
        }

        // Build query based on report type
        let query = supabaseClient
          .from('policies')
          .select('*')
          .eq('user_id', profile.id)
          .order('policy_expiry_date', { ascending: true });

        if (isMonthlyReport && startDate && endDate) {
          query = query
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());
        }

        const { data: policies, error: policiesError } = await query;

        if (policiesError) {
          console.error("Error fetching policies for user");
          continue;
        }

        if (!policies || policies.length === 0) {
          console.log("No policies found for user");
          continue;
        }

        console.log(`Found ${policies.length} policies for user`);

        // Calculate statistics
        const totalPremium = policies.reduce((sum: number, p: Policy) => sum + (Number(p.net_premium) || 0), 0);
        const premiumBreakup = calculatePremiumBreakup(policies);
        const groupedPolicies = groupPoliciesByType(policies);

        // Calculate expiring/expired for general report
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const expiringPolicies = policies.filter((policy: Policy) => {
          const expiryDate = new Date(policy.policy_expiry_date);
          return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
        });

        const expiredPolicies = policies.filter((policy: Policy) => {
          const expiryDate = new Date(policy.policy_expiry_date);
          return expiryDate < today;
        });

        // Generate Excel file - limit to 500 policies for email attachment
        const policiesToExport = policies.length > 500 ? policies.slice(0, 500) : policies;
        const excelBuffer = await generateExcelFile(policiesToExport, isMonthlyReport, startDate, endDate);
        
        // Use Uint8Array directly for base64 encoding to handle large files
        const bytes = new Uint8Array(excelBuffer);
        let binary = '';
        const chunkSize = 0x8000; // 32KB chunks
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
        }
        const excelBase64 = btoa(binary);

        // Generate appropriate email content
        let emailContent: string;
        let emailSubject: string;

        if (isMonthlyReport && startDate) {
          const monthLabel = startDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
          emailSubject = `Monthly Premium Report - ${monthLabel} | Policy Tracker.in`;
          emailContent = generateMonthlyReportEmail(
            profile.full_name || profile.email,
            policies,
            totalPremium,
            premiumBreakup,
            groupedPolicies,
            monthLabel
          );
        } else {
          emailSubject = `Policy Report - ${new Date().toLocaleDateString()} | Policy Tracker.in`;
          emailContent = generateGeneralReportEmail(
            profile.full_name || profile.email,
            policies,
            totalPremium,
            premiumBreakup,
            groupedPolicies,
            expiringPolicies,
            expiredPolicies
          );
        }

        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          console.error("RESEND_API_KEY not configured");
          throw new Error("Email service not configured. Please contact support.");
        }

        console.log("Sending email to user");

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Policy Tracker <no-reply@policytracker.in>',
            to: [profile.email],
            subject: emailSubject,
            html: emailContent,
            attachments: [
              {
                filename: isMonthlyReport 
                  ? `monthly_premium_report_${startDate?.toISOString().split('T')[0]}.xlsx`
                  : `policy_report_${new Date().toISOString().split('T')[0]}.xlsx`,
                content: excelBase64,
              }
            ],
          }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error("Failed to send email to user");
          throw new Error(emailResult.message || 'Failed to send email');
        } else {
          console.log("Email sent successfully");
        }

      } catch (userError) {
        console.error("Error processing user");
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Policy reports sent successfully",
      usersProcessed: profiles?.length || 0
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: unknown) {
    console.error("Error in send-policy-report function:", error);
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred while generating the report" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function generateExcelFile(policies: Policy[], isMonthly: boolean, startDate: Date | null, endDate: Date | null): Promise<ArrayBuffer> {
  const getDaysToExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPremium = policies.reduce((sum, p) => sum + (Number(p.net_premium) || 0), 0);
  const premiumBreakup = calculatePremiumBreakup(policies);

  // Summary sheet data
  const summaryData: any[][] = [
    [isMonthly ? 'Monthly Premium Report' : 'Policy Report'],
    isMonthly && startDate && endDate 
      ? ['Period', `${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')}`]
      : ['Generated On', new Date().toLocaleDateString('en-IN')],
    [],
    ['Summary'],
    ['Total Policies', policies.length],
    ['Total Net Premium', totalPremium],
    [],
    ['Premium Breakup by Insurance Type'],
    ['Type', 'Policy Count', 'Net Premium'],
    ['Vehicle Insurance', premiumBreakup['Vehicle Insurance'].count, premiumBreakup['Vehicle Insurance'].premium],
    ['Health Insurance', premiumBreakup['Health Insurance'].count, premiumBreakup['Health Insurance'].premium],
    ['Life Insurance', premiumBreakup['Life Insurance'].count, premiumBreakup['Life Insurance'].premium],
    ['Other', premiumBreakup['Other'].count, premiumBreakup['Other'].premium],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  const worksheet = XLSX.utils.json_to_sheet(policies.map((policy, index) => ({
    'S.No': index + 1,
    'Policy Number': policy.policy_number,
    'Client Name': policy.client_name,
    'Insurance Type': policy.insurance_type || 'Vehicle Insurance',
    'Vehicle Number': policy.vehicle_number || '',
    'Vehicle Make': policy.vehicle_make || '',
    'Vehicle Model': policy.vehicle_model || '',
    'Active Date': new Date(policy.policy_active_date).toLocaleDateString(),
    'Expiry Date': new Date(policy.policy_expiry_date).toLocaleDateString(),
    'Days to Expiry': getDaysToExpiry(policy.policy_expiry_date),
    'Net Premium': Number(policy.net_premium) || 0,
    'Status': policy.status,
    'Agent Code': policy.agent_code || '',
    'Contact Number': policy.contact_number || '',
    'Company Name': policy.company_name || '',
    'Reference': policy.reference || ''
  })));

  const workbook = (XLSX as any).utils.book_new();
  (XLSX as any).utils.book_append_sheet(workbook, summarySheet, 'Summary');
  (XLSX as any).utils.book_append_sheet(workbook, worksheet, 'All Policies');
  
  return (XLSX as any).write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function generateMonthlyReportEmail(
  userName: string,
  policies: Policy[],
  totalPremium: number,
  premiumBreakup: Record<string, { count: number; premium: number }>,
  groupedPolicies: Record<string, Policy[]>,
  monthLabel: string
): string {
  const policyListByType = Object.entries(groupedPolicies).map(([type, typePolicies]) => {
    const typeTotal = typePolicies.reduce((sum, p) => sum + (Number(p.net_premium) || 0), 0);
    const policyRows = typePolicies.map(p => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${escapeHtml(p.policy_number)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${escapeHtml(p.client_name)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${formatCurrency(Number(p.net_premium) || 0)}</td>
      </tr>
    `).join('');
    
    return `
      <div style="margin-bottom: 24px;">
        <h4 style="color: #1e293b; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
          ${type} (${typePolicies.length} policies - ${formatCurrency(typeTotal)})
        </h4>
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #e2e8f0;">
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b;">Policy No.</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b;">Client</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b;">Premium</th>
            </tr>
          </thead>
          <tbody>
            ${policyRows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monthly Premium Report - Policy Tracker</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; line-height: 1.6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">📊 Monthly Premium Report</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px; font-weight: 500;">${monthLabel}</p>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="background-color: #ffffff; padding: 30px;">
                                <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 22px; font-weight: 600;">Hello ${escapeHtml(userName)}! 👋</h2>
                                <p style="color: #64748b; margin: 0 0 24px 0; font-size: 15px;">Here's your monthly premium summary for <strong>${escapeHtml(monthLabel)}</strong></p>
                                
                                <!-- Stats Cards -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                    <tr>
                                        <td width="50%" style="padding: 8px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; text-align: center; padding: 20px 10px;">
                                                <tr><td style="color: #ffffff; font-size: 32px; font-weight: 700;">${policies.length}</td></tr>
                                                <tr><td style="color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Monthly Policies</td></tr>
                                            </table>
                                        </td>
                                        <td width="50%" style="padding: 8px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; text-align: center; padding: 20px 10px;">
                                                <tr><td style="color: #ffffff; font-size: 32px; font-weight: 700;">${formatCurrency(totalPremium)}</td></tr>
                                                <tr><td style="color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Monthly Premium</td></tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Premium Breakup -->
                                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                    <h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Premium Breakup by Insurance Type</h3>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr style="background: #e2e8f0; border-radius: 8px;">
                                            <th style="padding: 10px; text-align: left; font-size: 12px; color: #64748b;">Type</th>
                                            <th style="padding: 10px; text-align: center; font-size: 12px; color: #64748b;">Count</th>
                                            <th style="padding: 10px; text-align: right; font-size: 12px; color: #64748b;">Premium</th>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; font-size: 14px; color: #1e293b;">🚗 Vehicle</td>
                                            <td style="padding: 10px; text-align: center; font-size: 14px; color: #1e293b;">${premiumBreakup['Vehicle Insurance'].count}</td>
                                            <td style="padding: 10px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 600;">${formatCurrency(premiumBreakup['Vehicle Insurance'].premium)}</td>
                                        </tr>
                                        <tr style="background: #f1f5f9;">
                                            <td style="padding: 10px; font-size: 14px; color: #1e293b;">❤️ Health</td>
                                            <td style="padding: 10px; text-align: center; font-size: 14px; color: #1e293b;">${premiumBreakup['Health Insurance'].count}</td>
                                            <td style="padding: 10px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 600;">${formatCurrency(premiumBreakup['Health Insurance'].premium)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; font-size: 14px; color: #1e293b;">🛡️ Life</td>
                                            <td style="padding: 10px; text-align: center; font-size: 14px; color: #1e293b;">${premiumBreakup['Life Insurance'].count}</td>
                                            <td style="padding: 10px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 600;">${formatCurrency(premiumBreakup['Life Insurance'].premium)}</td>
                                        </tr>
                                        <tr style="background: #f1f5f9;">
                                            <td style="padding: 10px; font-size: 14px; color: #1e293b;">📋 Other</td>
                                            <td style="padding: 10px; text-align: center; font-size: 14px; color: #1e293b;">${premiumBreakup['Other'].count}</td>
                                            <td style="padding: 10px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 600;">${formatCurrency(premiumBreakup['Other'].premium)}</td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- Policy Details by Type -->
                                <h3 style="color: #1e293b; margin: 24px 0 16px 0; font-size: 18px; font-weight: 600;">Policy Details</h3>
                                ${policyListByType}

                                <!-- Attachment Notice -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; margin-top: 24px; border-left: 4px solid #10b981;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <p style="margin: 0; color: #065f46; font-size: 14px;">
                                                📎 <strong>Excel Report Attached</strong> - Complete monthly premium data with all policy details.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #1e293b; padding: 24px; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                                    © ${new Date().getFullYear()} Policy Tracker. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}

function generateGeneralReportEmail(
  userName: string,
  policies: Policy[],
  totalPremium: number,
  premiumBreakup: Record<string, { count: number; premium: number }>,
  groupedPolicies: Record<string, Policy[]>,
  expiringPolicies: Policy[],
  expiredPolicies: Policy[]
): string {
  const today = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  const policyListByType = Object.entries(groupedPolicies).map(([type, typePolicies]) => {
    const typeTotal = typePolicies.reduce((sum, p) => sum + (Number(p.net_premium) || 0), 0);
    const policyRows = typePolicies.slice(0, 10).map(p => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${escapeHtml(p.policy_number)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${escapeHtml(p.client_name)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${new Date(p.policy_expiry_date).toLocaleDateString('en-IN')}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${formatCurrency(Number(p.net_premium) || 0)}</td>
      </tr>
    `).join('');

    const moreCount = typePolicies.length > 10 ? typePolicies.length - 10 : 0;
    
    return `
      <div style="margin-bottom: 24px;">
        <h4 style="color: #1e293b; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
          ${type} (${typePolicies.length} policies - ${formatCurrency(typeTotal)})
        </h4>
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #e2e8f0;">
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b;">Policy No.</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b;">Client</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b;">Expiry</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b;">Premium</th>
            </tr>
          </thead>
          <tbody>
            ${policyRows}
            ${moreCount > 0 ? `<tr><td colspan="4" style="padding: 10px; text-align: center; font-size: 12px; color: #64748b;">... and ${moreCount} more policies (see attached Excel)</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Policy Report - Policy Tracker</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; line-height: 1.6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">📋 Policy Tracker</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Your Insurance Management Partner</p>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="background-color: #ffffff; padding: 30px;">
                                <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 22px; font-weight: 600;">Hello ${escapeHtml(userName)}! 👋</h2>
                                <p style="color: #64748b; margin: 0 0 24px 0; font-size: 15px;">Here's your policy report as of <strong>${today}</strong></p>
                                
                                <!-- Stats Cards -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                    <tr>
                                        <td width="25%" style="padding: 6px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); border-radius: 12px; text-align: center; padding: 16px 8px;">
                                                <tr><td style="color: #ffffff; font-size: 28px; font-weight: 700;">${policies.length}</td></tr>
                                                <tr><td style="color: rgba(255,255,255,0.9); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Total</td></tr>
                                            </table>
                                        </td>
                                        <td width="25%" style="padding: 6px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; text-align: center; padding: 16px 8px;">
                                                <tr><td style="color: #ffffff; font-size: 18px; font-weight: 700;">${formatCurrency(totalPremium)}</td></tr>
                                                <tr><td style="color: rgba(255,255,255,0.9); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Premium</td></tr>
                                            </table>
                                        </td>
                                        <td width="25%" style="padding: 6px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 12px; text-align: center; padding: 16px 8px;">
                                                <tr><td style="color: #ffffff; font-size: 28px; font-weight: 700;">${expiringPolicies.length}</td></tr>
                                                <tr><td style="color: rgba(255,255,255,0.9); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Expiring</td></tr>
                                            </table>
                                        </td>
                                        <td width="25%" style="padding: 6px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); border-radius: 12px; text-align: center; padding: 16px 8px;">
                                                <tr><td style="color: #ffffff; font-size: 28px; font-weight: 700;">${expiredPolicies.length}</td></tr>
                                                <tr><td style="color: rgba(255,255,255,0.9); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Expired</td></tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Premium Breakup -->
                                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                    <h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Premium Breakup by Insurance Type</h3>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr style="background: #e2e8f0; border-radius: 8px;">
                                            <th style="padding: 10px; text-align: left; font-size: 12px; color: #64748b;">Type</th>
                                            <th style="padding: 10px; text-align: center; font-size: 12px; color: #64748b;">Count</th>
                                            <th style="padding: 10px; text-align: right; font-size: 12px; color: #64748b;">Premium</th>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; font-size: 14px; color: #1e293b;">🚗 Vehicle</td>
                                            <td style="padding: 10px; text-align: center; font-size: 14px; color: #1e293b;">${premiumBreakup['Vehicle Insurance'].count}</td>
                                            <td style="padding: 10px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 600;">${formatCurrency(premiumBreakup['Vehicle Insurance'].premium)}</td>
                                        </tr>
                                        <tr style="background: #f1f5f9;">
                                            <td style="padding: 10px; font-size: 14px; color: #1e293b;">❤️ Health</td>
                                            <td style="padding: 10px; text-align: center; font-size: 14px; color: #1e293b;">${premiumBreakup['Health Insurance'].count}</td>
                                            <td style="padding: 10px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 600;">${formatCurrency(premiumBreakup['Health Insurance'].premium)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; font-size: 14px; color: #1e293b;">🛡️ Life</td>
                                            <td style="padding: 10px; text-align: center; font-size: 14px; color: #1e293b;">${premiumBreakup['Life Insurance'].count}</td>
                                            <td style="padding: 10px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 600;">${formatCurrency(premiumBreakup['Life Insurance'].premium)}</td>
                                        </tr>
                                        <tr style="background: #f1f5f9;">
                                            <td style="padding: 10px; font-size: 14px; color: #1e293b;">📋 Other</td>
                                            <td style="padding: 10px; text-align: center; font-size: 14px; color: #1e293b;">${premiumBreakup['Other'].count}</td>
                                            <td style="padding: 10px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 600;">${formatCurrency(premiumBreakup['Other'].premium)}</td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- Policy Details by Type -->
                                <h3 style="color: #1e293b; margin: 24px 0 16px 0; font-size: 18px; font-weight: 600;">Policies by Insurance Type</h3>
                                ${policyListByType}
                                
                                <!-- Attachment Notice -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; margin-top: 24px; border-left: 4px solid #10b981;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <p style="margin: 0; color: #065f46; font-size: 14px;">
                                                📎 <strong>Excel Report Attached</strong> - Complete policy data with premium details for all ${policies.length} policies.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #1e293b; padding: 24px; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                                    © ${new Date().getFullYear()} Policy Tracker. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}

serve(handler);
