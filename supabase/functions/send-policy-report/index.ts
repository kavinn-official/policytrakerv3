
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://policytracker.in',
  'https://www.policytracker.in',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

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

// Input validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting policy report generation...");

    // Get the request body
    const { manual_trigger, user_id } = await req.json().catch(() => ({}));
    
    let profiles;
    
    if (manual_trigger && user_id) {
      // Validate user_id format
      if (typeof user_id !== 'string' || !isValidUUID(user_id)) {
        console.error("Invalid user_id format");
        return new Response(JSON.stringify({ 
          error: "Invalid user_id format" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // For manual trigger, verify authorization
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

      // SECURITY: Verify the authenticated user matches the requested user_id
      if (authData.user.id !== user_id) {
        console.error("Unauthorized: User cannot trigger reports for other users");
        return new Response(JSON.stringify({ 
          error: "Unauthorized to trigger reports for other users" 
        }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // For manual trigger, get specific user profile, or create one if missing
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user_id)
        .single();
      
      if (profileError || !profileData) {
        // Profile doesn't exist, create one using auth user data
        console.log(`Profile not found for user ${user_id.substring(0, 8)}..., creating one`);
        
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
      console.log(`Manual trigger for user (ID: ${user_id.substring(0, 8)}...)`);
    } else {
      // For scheduled runs, get all users
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
          console.error(`Error fetching policies for user ${profile.id.substring(0, 8)}...`);
          continue;
        }

        if (!policies || policies.length === 0) {
          console.log(`No policies found for user ${profile.id.substring(0, 8)}...`);
          continue;
        }

        console.log(`Found ${policies.length} policies for user ${profile.id.substring(0, 8)}...`);

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

        console.log(`Sending email to user ${profile.id.substring(0, 8)}...`);

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Policy Tracker <no-reply@policytracker.in>',
            to: [profile.email],
            subject: `Policy Report - ${new Date().toLocaleDateString()} | Policy Tracker.in`,
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
          console.error(`Failed to send email to user ${profile.id.substring(0, 8)}...`);
          throw new Error(emailResult.message || 'Failed to send email');
        } else {
          console.log(`Email sent successfully to user ${profile.id.substring(0, 8)}...`);
        }

      } catch (userError) {
        console.error(`Error processing user ${profile.id.substring(0, 8)}...`);
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

  } catch (error: unknown) {
    console.error("Error in send-policy-report function");
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage 
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

  const workbook = (XLSX as any).utils.book_new();
  (XLSX as any).utils.book_append_sheet(workbook, worksheet, 'All Policies');
  
  return (XLSX as any).write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

function generateEmailContent(
  userName: string,
  allPolicies: Policy[],
  expiringPolicies: Policy[],
  expiredPolicies: Policy[]
): string {
  const today = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
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
                                <!-- Greeting -->
                                <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 22px; font-weight: 600;">Hello ${userName}! 👋</h2>
                                <p style="color: #64748b; margin: 0 0 24px 0; font-size: 15px;">Here's your policy report as of <strong>${today}</strong></p>
                                
                                <!-- Stats Cards -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                    <tr>
                                        <td width="33%" style="padding: 8px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); border-radius: 12px; text-align: center; padding: 20px 10px;">
                                                <tr><td style="color: #ffffff; font-size: 32px; font-weight: 700;">${allPolicies.length}</td></tr>
                                                <tr><td style="color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Total Policies</td></tr>
                                            </table>
                                        </td>
                                        <td width="33%" style="padding: 8px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 12px; text-align: center; padding: 20px 10px;">
                                                <tr><td style="color: #ffffff; font-size: 32px; font-weight: 700;">${expiringPolicies.length}</td></tr>
                                                <tr><td style="color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Expiring Soon</td></tr>
                                            </table>
                                        </td>
                                        <td width="33%" style="padding: 8px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); border-radius: 12px; text-align: center; padding: 20px 10px;">
                                                <tr><td style="color: #ffffff; font-size: 32px; font-weight: 700;">${expiredPolicies.length}</td></tr>
                                                <tr><td style="color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Expired</td></tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Attachment Notice -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <table cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="vertical-align: top; padding-right: 12px;">
                                                        <span style="font-size: 24px;">📎</span>
                                                    </td>
                                                    <td>
                                                        <h3 style="color: #059669; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Excel Report Attached</h3>
                                                        <p style="color: #047857; margin: 0; font-size: 14px;">Complete policy details are attached for offline analysis</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                ${expiringPolicies.length > 0 ? `
                                <!-- Expiring Policies -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                    <tr>
                                        <td style="padding-bottom: 12px;">
                                            <h3 style="color: #1e293b; margin: 0; font-size: 18px; font-weight: 600;">
                                                <span style="color: #f59e0b;">⚠️</span> Policies Expiring Soon
                                            </h3>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                                                <tr style="background-color: #f8fafc;">
                                                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Policy</th>
                                                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Client</th>
                                                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Days Left</th>
                                                </tr>
                                                ${expiringPolicies.slice(0, 5).map((policy, index) => {
                                                  const daysLeft = Math.ceil((new Date(policy.policy_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                  const bgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                                                  const urgencyColor = daysLeft <= 7 ? '#ef4444' : daysLeft <= 15 ? '#f59e0b' : '#3b82f6';
                                                  return `
                                                    <tr style="background-color: ${bgColor};">
                                                        <td style="padding: 12px 16px; font-size: 14px; color: #334155;">${policy.policy_number}</td>
                                                        <td style="padding: 12px 16px; font-size: 14px; color: #334155;">${policy.client_name}</td>
                                                        <td style="padding: 12px 16px; text-align: center;">
                                                            <span style="background-color: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${daysLeft} days</span>
                                                        </td>
                                                    </tr>
                                                  `;
                                                }).join('')}
                                                ${expiringPolicies.length > 5 ? `
                                                <tr style="background-color: #f8fafc;">
                                                    <td colspan="3" style="padding: 12px 16px; text-align: center; color: #64748b; font-size: 13px;">
                                                        + ${expiringPolicies.length - 5} more policies (see attached Excel)
                                                    </td>
                                                </tr>
                                                ` : ''}
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                ` : ''}

                                ${expiredPolicies.length > 0 ? `
                                <!-- Expired Policies -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                    <tr>
                                        <td style="padding-bottom: 12px;">
                                            <h3 style="color: #1e293b; margin: 0; font-size: 18px; font-weight: 600;">
                                                <span style="color: #ef4444;">🚨</span> Expired Policies
                                            </h3>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #fecaca; border-radius: 12px; overflow: hidden; background-color: #fef2f2;">
                                                <tr style="background-color: #fee2e2;">
                                                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #991b1b; text-transform: uppercase; border-bottom: 1px solid #fecaca;">Policy</th>
                                                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #991b1b; text-transform: uppercase; border-bottom: 1px solid #fecaca;">Client</th>
                                                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #991b1b; text-transform: uppercase; border-bottom: 1px solid #fecaca;">Overdue</th>
                                                </tr>
                                                ${expiredPolicies.slice(0, 5).map((policy, index) => {
                                                  const daysOverdue = Math.ceil((new Date().getTime() - new Date(policy.policy_expiry_date).getTime()) / (1000 * 60 * 60 * 24));
                                                  return `
                                                    <tr>
                                                        <td style="padding: 12px 16px; font-size: 14px; color: #991b1b; border-bottom: 1px solid #fecaca;">${policy.policy_number}</td>
                                                        <td style="padding: 12px 16px; font-size: 14px; color: #991b1b; border-bottom: 1px solid #fecaca;">${policy.client_name}</td>
                                                        <td style="padding: 12px 16px; text-align: center; border-bottom: 1px solid #fecaca;">
                                                            <span style="color: #dc2626; font-weight: 600;">${daysOverdue} days</span>
                                                        </td>
                                                    </tr>
                                                  `;
                                                }).join('')}
                                                ${expiredPolicies.length > 5 ? `
                                                <tr>
                                                    <td colspan="3" style="padding: 12px 16px; text-align: center; color: #991b1b; font-size: 13px;">
                                                        + ${expiredPolicies.length - 5} more expired policies (see attached Excel)
                                                    </td>
                                                </tr>
                                                ` : ''}
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                ` : ''}

                                <!-- CTA Button -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="padding: 20px 0;">
                                            <a href="https://policytracker.in" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                                                View Dashboard →
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #1e293b; padding: 30px; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">📧 Automated policy report • Sent every 15 days</p>
                                <p style="color: #64748b; margin: 0; font-size: 13px;">
                                    <a href="https://policytracker.in" style="color: #38bdf8; text-decoration: none;">policytracker.in</a> — Your Insurance Policy Management Partner
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
