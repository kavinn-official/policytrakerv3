import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Standard CORS headers for all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface Policy {
  id: string;
  policy_number: string;
  client_name: string;
  vehicle_number: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  policy_expiry_date: string;
  contact_number: string | null;
  user_id: string;
}

interface Profile {
  email: string;
  full_name: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("=== Expiry Notification Function Started ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request method:", req.method);

  // Validate cron secret for scheduled invocations - MANDATORY
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  
  // CRON_SECRET is required for security - fail if not configured
  if (!cronSecret || cronSecret.length === 0) {
    console.error("ERROR: CRON_SECRET not configured - function access denied");
    return new Response(
      JSON.stringify({ 
        error: "Service not configured",
        details: "CRON_SECRET environment variable is not set"
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.error("ERROR: Unauthorized access attempt - invalid or missing auth header");
    return new Response(
      JSON.stringify({ 
        error: "Unauthorized",
        details: "Invalid authorization header" 
      }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log("Authorization validated successfully");

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("ERROR: RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured",
          details: "RESEND_API_KEY environment variable is not set"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("RESEND_API_KEY is configured");
    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("ERROR: Missing Supabase configuration");
      throw new Error("Database configuration missing");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, { 
      auth: { persistSession: false } 
    });

    console.log("Supabase client initialized");

    // Calculate date 30 days from now for policy expiry alerts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    console.log(`Checking for policies expiring between ${today.toISOString().split('T')[0]} and ${thirtyDaysFromNow.toISOString().split('T')[0]}`);

    // Get all policies expiring within 30 days
    const { data: policies, error: policiesError } = await supabaseClient
      .from('policies')
      .select('id, policy_number, client_name, vehicle_number, vehicle_make, vehicle_model, policy_expiry_date, contact_number, user_id')
      .gte('policy_expiry_date', today.toISOString().split('T')[0])
      .lte('policy_expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);

    if (policiesError) {
      console.error("ERROR: Failed to fetch policies:", policiesError.message);
      throw policiesError;
    }

    console.log(`Found ${policies?.length || 0} policies expiring within 30 days`);

    if (!policies || policies.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No policies expiring soon", 
          emailsSent: 0,
          timestamp: new Date().toISOString(),
          executionTimeMs: Date.now() - startTime
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group policies by user_id
    const policiesByUser: Record<string, Policy[]> = {};
    for (const policy of policies) {
      if (!policiesByUser[policy.user_id]) {
        policiesByUser[policy.user_id] = [];
      }
      policiesByUser[policy.user_id].push(policy);
    }

    console.log(`Policies grouped into ${Object.keys(policiesByUser).length} users`);

    let emailsSent = 0;
    let emailsFailed = 0;
    const errors: string[] = [];

    for (const [userId, userPolicies] of Object.entries(policiesByUser)) {
      console.log(`\n--- Processing user ${userId.substring(0, 8)}... (${userPolicies.length} policies) ---`);
      
      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        const errMsg = `Database error fetching profile for user ${userId.substring(0, 8)}: ${profileError.message}`;
        console.error("ERROR:", errMsg);
        errors.push(errMsg);
        emailsFailed++;
        continue;
      }

      if (!profile) {
        const errMsg = `No profile found for user ${userId.substring(0, 8)}`;
        console.error("ERROR:", errMsg);
        errors.push(errMsg);
        emailsFailed++;
        continue;
      }

      console.log(`User email: ${profile.email}, Name: ${profile.full_name || 'N/A'}`);

      // Build email content
      const policyRows = userPolicies.map(policy => {
        const expiryDate = new Date(policy.policy_expiry_date);
        const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const vehicleDetails = policy.vehicle_make && policy.vehicle_model 
          ? `${policy.vehicle_make} ${policy.vehicle_model}`
          : policy.vehicle_make || 'N/A';
        
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${policy.client_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${policy.policy_number}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${policy.vehicle_number}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${vehicleDetails}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${expiryDate.toLocaleDateString('en-IN')}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: ${daysToExpiry <= 3 ? '#ef4444' : '#f59e0b'}; font-weight: 600;">${daysToExpiry} days</td>
          </tr>
        `;
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Policy Expiry Alert</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">PolicyTracker Notification</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 20px 0;">Hi ${profile.full_name || 'there'},</p>
            <p style="margin: 0 0 20px 0;">The following <strong>${userPolicies.length} ${userPolicies.length === 1 ? 'policy is' : 'policies are'}</strong> expiring within the next 30 days:</p>
            
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Client</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Policy No.</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Vehicle</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Model</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Expiry Date</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  ${policyRows}
                </tbody>
              </table>
            </div>
            
            <div style="margin-top: 25px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-weight: 600; color: #92400e;">⏰ Action Required</p>
              <p style="margin: 10px 0 0 0; color: #78350f;">Please contact your clients to remind them about their upcoming policy renewals.</p>
            </div>
            
            <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px;">
              Best regards,<br>
              <strong>PolicyTracker Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">This is an automated notification from PolicyTracker.</p>
            <p style="margin: 5px 0 0 0;">You can manage your notification preferences in the app settings.</p>
          </div>
        </body>
        </html>
      `;

      try {
        console.log(`Attempting to send email to ${profile.email}...`);
        
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "PolicyTracker <notifications@resend.dev>",
          to: [profile.email],
          subject: `⚠️ ${userPolicies.length} ${userPolicies.length === 1 ? 'Policy' : 'Policies'} Expiring Soon - Action Required`,
          html: htmlContent,
        });

        if (emailError) {
          const errMsg = `Failed to send email to ${profile.email}: ${JSON.stringify(emailError)}`;
          console.error("ERROR:", errMsg);
          errors.push(errMsg);
          emailsFailed++;
        } else {
          console.log(`SUCCESS: Email sent to ${profile.email} for ${userPolicies.length} policies. Email ID: ${emailData?.id || 'N/A'}`);
          emailsSent++;
        }
      } catch (emailErr) {
        const errMsg = `Exception sending email to ${profile.email}: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`;
        console.error("ERROR:", errMsg);
        errors.push(errMsg);
        emailsFailed++;
      }
    }

    const executionTimeMs = Date.now() - startTime;

    console.log("\n=== Expiry Notification Function Completed ===");
    console.log(`Emails sent: ${emailsSent}`);
    console.log(`Emails failed: ${emailsFailed}`);
    console.log(`Execution time: ${executionTimeMs}ms`);
    
    if (errors.length > 0) {
      console.log(`Errors encountered: ${errors.length}`);
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${emailsSent} notification emails`,
        emailsSent,
        emailsFailed,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
        executionTimeMs
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const executionTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error("=== FATAL ERROR in send-expiry-notifications ===");
    console.error("Error:", errorMessage);
    console.error("Execution time:", executionTimeMs, "ms");
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send notifications",
        details: errorMessage,
        timestamp: new Date().toISOString(),
        executionTimeMs
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});