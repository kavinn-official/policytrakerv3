import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// HTML escape function to prevent XSS
function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface WelcomeEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Authentication failed");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;

    const { name, email }: WelcomeEmailRequest = await req.json();

    // Ensure user can only send welcome email to their own email address
    if (email !== userEmail) {
      console.error("Email mismatch - user attempted to send email to different address");
      return new Response(
        JSON.stringify({ error: "You can only send welcome emails to your own email address" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email) {
      console.error("Missing email address");
      return new Response(
        JSON.stringify({ error: "Email address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending welcome email for user: ${userId.substring(0, 8)}...`);

    const userName = escapeHtml(name) || "Valued User";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Policy Tracker <onboarding@resend.dev>",
        to: [email],
        subject: "🎉 Welcome to Policy Tracker.in - Your Insurance Management Journey Starts Here!",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Policy Tracker.in</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0891b2 0%, #0d9488 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                🎉 Welcome to Policy Tracker.in!
              </h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">
                India's #1 Insurance Policy Management Platform
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 22px;">
                Hello ${userName}! 👋
              </h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining <strong>Policy Tracker.in</strong>! We're thrilled to have you on board. 
                You've just taken the first step towards stress-free insurance policy management.
              </p>
              
              <!-- Quick Start Steps -->
              <div style="background-color: #f0fdfa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #0d9488; margin: 0 0 16px 0; font-size: 18px;">
                  🚀 Quick Start Guide
                </h3>
                
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #0891b2, #0d9488); color: white; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 12px;">1</span>
                      <span style="color: #334155; font-size: 15px;"><strong>Add Your First Policy</strong> - Upload PDF or enter details manually</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #0891b2, #0d9488); color: white; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 12px;">2</span>
                      <span style="color: #334155; font-size: 15px;"><strong>Set Up Client Contacts</strong> - For quick WhatsApp reminders</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #0891b2, #0d9488); color: white; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 12px;">3</span>
                      <span style="color: #334155; font-size: 15px;"><strong>Enable Notifications</strong> - Never miss a renewal again</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Key Features -->
              <h3 style="color: #1e293b; margin: 24px 0 16px 0; font-size: 18px;">
                ✨ What You Can Do
              </h3>
              
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #475569; font-size: 15px;">
                    ✅ Track Motor, Health & Life Insurance policies
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #475569; font-size: 15px;">
                    ✅ Send WhatsApp reminders to clients with one click
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #475569; font-size: 15px;">
                    ✅ Auto-fill policy details from PDF uploads
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #475569; font-size: 15px;">
                    ✅ Generate Excel reports for your records
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #475569; font-size: 15px;">
                    ✅ View analytics and business insights
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://policytrackerv1.lovable.app/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #0891b2, #0d9488); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);">
                  Go to Dashboard →
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                Need help getting started? Reply to this email or contact us at<br>
                <a href="mailto:policytracker.in@gmail.com" style="color: #0d9488;">policytracker.in@gmail.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                <strong>Policy Tracker.in</strong> - India's #1 Agent Policy Tracker
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2026 PolicyTracker.in | All Rights Reserved
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send welcome email:", result);
      return new Response(
        JSON.stringify({ error: "Failed to send welcome email", details: result }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Welcome email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while sending the welcome email. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
