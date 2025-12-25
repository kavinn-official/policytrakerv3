
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  mode: string | null;
  company_name: string | null;
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

    // Get the user ID from the request (either from manual trigger or scheduled)
    const { manual_trigger, user_id } = await req.json().catch(() => ({}));
    
    let profiles;
    
    if (manual_trigger && user_id) {
      // For manual trigger, get specific user
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user_id);
      
      if (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
      profiles = data;
    } else {
      // For scheduled runs, get all users
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name');

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
      profiles = data;
    }

    console.log(`Found ${profiles?.length || 0} users to process`);

    // Process each user
    for (const profile of profiles || []) {
      try {
        // Get user's policies
        const { data: policies, error: policiesError } = await supabaseClient
          .from('policies')
          .select('*')
          .eq('user_id', profile.id)
          .order('policy_expiry_date', { ascending: true });

        if (policiesError) {
          console.error(`Error fetching policies for user ${profile.id}:`, policiesError);
          continue;
        }

        if (!policies || policies.length === 0) {
          console.log(`No policies found for user ${profile.email}`);
          continue;
        }

        console.log(`Found ${policies.length} policies for user ${profile.email}`);

        // Calculate policy statistics
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

        // Generate Excel file
        const excelBuffer = await generateExcelFile(policies);
        const excelBase64 = btoa(String.fromCharCode(...new Uint8Array(excelBuffer)));

        // Generate HTML email content
        const emailContent = generateEmailContent(
          profile.full_name || profile.email,
          policies,
          expiringPolicies,
          expiredPolicies
        );

        // Send email using Resend with Excel attachment to the actual user
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          console.error("RESEND_API_KEY not configured");
          throw new Error("Email service not configured. Please contact support.");
        }

        console.log(`Attempting to send email to ${profile.email}...`);

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Policy Report <onboarding@resend.dev>',
            to: [profile.email],
            subject: `Policy Report - ${new Date().toLocaleDateString()}`,
            html: emailContent,
            attachments: [
              {
                filename: `policy_report_${new Date().toISOString().split('T')[0]}.xlsx`,
                content: excelBase64,
              }
            ],
          }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error(`Failed to send email to ${profile.email}:`, JSON.stringify(emailResult));
          throw new Error(emailResult.message || 'Failed to send email');
        } else {
          console.log(`Email with Excel attachment sent successfully to ${profile.email}`, emailResult);
        }

      } catch (userError) {
        console.error(`Error processing user ${profile.email}:`, userError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Policy reports with Excel files sent successfully",
      usersProcessed: profiles?.length || 0
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Error in send-policy-report function:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function generateExcelFile(policies: Policy[]): Promise<ArrayBuffer> {
  const getDaysToExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const worksheet = XLSX.utils.json_to_sheet(policies.map(policy => ({
    'Policy Number': policy.policy_number,
    'Client Name': policy.client_name,
    'Vehicle Number': policy.vehicle_number,
    'Vehicle Make': policy.vehicle_make,
    'Vehicle Model': policy.vehicle_model,
    'Active Date': new Date(policy.policy_active_date).toLocaleDateString(),
    'Expiry Date': new Date(policy.policy_expiry_date).toLocaleDateString(),
    'Days to Expiry': getDaysToExpiry(policy.policy_expiry_date),
    'Status': policy.status,
    'Agent Code': policy.agent_code,
    'Contact Number': policy.contact_number || '',
    'Mode': policy.mode || '',
    'Company Name': policy.company_name || '',
    'Reference': policy.reference
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'All Policies');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

function generateEmailContent(
  userName: string,
  allPolicies: Policy[],
  expiringPolicies: Policy[],
  expiredPolicies: Policy[]
): string {
  const today = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Policy Report with Excel Details</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-card { background: #fff; border: 2px solid #e9ecef; border-radius: 8px; padding: 15px; text-align: center; min-width: 120px; }
            .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-left; }
            .table th { background-color: #f8f9fa; font-weight: bold; }
            .expiring { background-color: #fff3cd; }
            .expired { background-color: #f8d7da; }
            .section-title { color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin: 30px 0 15px 0; }
            .attachment-notice { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Insurance Policy Report with Excel Details</h1>
                <p>Hello ${userName},</p>
                <p>Here's your comprehensive policy report as of ${today}:</p>
            </div>
            
            <div class="attachment-notice">
                <h3>📎 Excel Attachment Included</h3>
                <p><strong>Complete policy details have been attached as an Excel file</strong> for your records and offline analysis. The file contains all policy information with calculated expiry days.</p>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${allPolicies.length}</div>
                    <div>Total Policies</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${expiringPolicies.length}</div>
                    <div>Expiring Soon</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${expiredPolicies.length}</div>
                    <div>Expired</div>
                </div>
            </div>

            ${expiringPolicies.length > 0 ? `
            <h2 class="section-title">⚠️ Policies Expiring in Next 30 Days</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Policy Number</th>
                        <th>Client Name</th>
                        <th>Vehicle</th>
                        <th>Expiry Date</th>
                        <th>Days Left</th>
                    </tr>
                </thead>
                <tbody>
                    ${expiringPolicies.map(policy => {
                      const daysLeft = Math.ceil((new Date(policy.policy_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return `
                        <tr class="expiring">
                            <td>${policy.policy_number}</td>
                            <td>${policy.client_name}</td>
                            <td>${policy.vehicle_number} (${policy.vehicle_make} ${policy.vehicle_model})</td>
                            <td>${new Date(policy.policy_expiry_date).toLocaleDateString()}</td>
                            <td><strong>${daysLeft} days</strong></td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
            ` : ''}

            ${expiredPolicies.length > 0 ? `
            <h2 class="section-title">🚨 Expired Policies</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Policy Number</th>
                        <th>Client Name</th>
                        <th>Vehicle</th>
                        <th>Expiry Date</th>
                        <th>Days Overdue</th>
                    </tr>
                </thead>
                <tbody>
                    ${expiredPolicies.map(policy => {
                      const daysOverdue = Math.ceil((new Date().getTime() - new Date(policy.policy_expiry_date).getTime()) / (1000 * 60 * 60 * 24));
                      return `
                        <tr class="expired">
                            <td>${policy.policy_number}</td>
                            <td>${policy.client_name}</td>
                            <td>${policy.vehicle_number} (${policy.vehicle_make} ${policy.vehicle_model})</td>
                            <td>${new Date(policy.policy_expiry_date).toLocaleDateString()}</td>
                            <td><strong>${daysOverdue} days</strong></td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
            ` : ''}

            <h2 class="section-title">📋 Summary</h2>
            <p>Your complete policy database is attached as an Excel file with the following information:</p>
            <ul>
                <li>Policy numbers and client details</li>
                <li>Vehicle information</li>
                <li>Active and expiry dates with calculated days remaining</li>
                <li>Status, agent codes, and references</li>
                <li>Contact numbers and company information</li>
            </ul>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p><strong>Need Help?</strong></p>
                <p>If you have any questions about your policies or need assistance with renewals, please don't hesitate to contact us.</p>
                <p>This automated report is sent every 15 days to keep you updated on your policy portfolio.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

serve(handler);
