import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Expiry notification function started at:", new Date().toISOString());

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculate date 7 days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Get all policies expiring within 7 days
    const { data: policies, error: policiesError } = await supabaseClient
      .from('policies')
      .select('id, policy_number, client_name, vehicle_number, vehicle_make, vehicle_model, policy_expiry_date, contact_number, user_id')
      .gte('policy_expiry_date', today.toISOString().split('T')[0])
      .lte('policy_expiry_date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (policiesError) {
      console.error("Error fetching policies:", policiesError);
      throw policiesError;
    }

    console.log(`Found ${policies?.length || 0} policies expiring within 7 days`);

    if (!policies || policies.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No policies expiring soon", emailsSent: 0 }),
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

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const [userId, userPolicies] of Object.entries(policiesByUser)) {
      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        console.error(`Could not fetch profile for user ${userId}`);
        continue;
      }

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
            <p style="margin: 0 0 20px 0;">The following <strong>${userPolicies.length} ${userPolicies.length === 1 ? 'policy is' : 'policies are'}</strong> expiring within the next 7 days:</p>
            
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
        const { error: emailError } = await resend.emails.send({
          from: "PolicyTracker <notifications@resend.dev>",
          to: [profile.email],
          subject: `⚠️ ${userPolicies.length} ${userPolicies.length === 1 ? 'Policy' : 'Policies'} Expiring Soon - Action Required`,
          html: htmlContent,
        });

        if (emailError) {
          console.error(`Failed to send email to ${profile.email}:`, emailError);
          emailsFailed++;
        } else {
          console.log(`Email sent successfully to ${profile.email} for ${userPolicies.length} policies`);
          emailsSent++;
        }
      } catch (emailErr) {
        console.error(`Error sending email to ${profile.email}:`, emailErr);
        emailsFailed++;
      }
    }

    console.log(`Completed: ${emailsSent} emails sent, ${emailsFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${emailsSent} notification emails`,
        emailsSent,
        emailsFailed,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-expiry-notifications function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notifications" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
