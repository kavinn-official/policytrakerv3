import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userEmail = claimsData.claims.email as string;
    const { name, email } = await req.json();

    if (email !== userEmail) {
      return new Response(JSON.stringify({ error: "Email mismatch" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userName = escapeHtml(name) || "Valued User";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Policy Tracker <onboarding@resend.dev>",
        to: [email],
        subject: "🎉 Welcome to PolicyTracker.in — Let's Get You Started!",
        html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f0f9ff;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,0.08);overflow:hidden;">

<!-- Header with gradient -->
<tr><td style="background:linear-gradient(135deg,#0891b2 0%,#0d9488 50%,#059669 100%);padding:48px 32px;text-align:center;">
  <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
    <span style="font-size:32px;">🎉</span>
  </div>
  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Welcome to PolicyTracker!</h1>
  <p style="color:#ccfbf1;margin:12px 0 0;font-size:16px;">India's #1 Insurance Policy Management Platform</p>
</td></tr>

<!-- Greeting -->
<tr><td style="padding:40px 32px 24px;">
  <h2 style="color:#0f172a;margin:0 0 16px;font-size:22px;">Hello ${userName}! 👋</h2>
  <p style="color:#475569;font-size:16px;line-height:1.7;margin:0;">Thank you for joining PolicyTracker.in! You're now part of a growing community of <strong>1,500+ insurance agents</strong> who trust us to manage their policies smarter.</p>
</td></tr>

<!-- Quick Start Cards -->
<tr><td style="padding:0 32px 32px;">
  <h3 style="color:#0891b2;margin:0 0 16px;font-size:18px;">🚀 Get Started in 3 Steps</h3>
  
  <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0 12px;">
    <tr><td style="background:linear-gradient(135deg,#ecfdf5,#f0fdfa);border-radius:12px;padding:16px 20px;">
      <table role="presentation"><tr>
        <td style="width:40px;vertical-align:top;"><div style="width:32px;height:32px;background:linear-gradient(135deg,#0891b2,#059669);border-radius:8px;color:white;text-align:center;line-height:32px;font-weight:bold;font-size:14px;">1</div></td>
        <td style="padding-left:12px;"><strong style="color:#0f172a;font-size:15px;">Add Your First Policy</strong><br><span style="color:#64748b;font-size:13px;">Upload a PDF or enter details manually — OCR auto-fills!</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="background:linear-gradient(135deg,#eff6ff,#f0f9ff);border-radius:12px;padding:16px 20px;">
      <table role="presentation"><tr>
        <td style="width:40px;vertical-align:top;"><div style="width:32px;height:32px;background:linear-gradient(135deg,#0891b2,#059669);border-radius:8px;color:white;text-align:center;line-height:32px;font-weight:bold;font-size:14px;">2</div></td>
        <td style="padding-left:12px;"><strong style="color:#0f172a;font-size:15px;">Add Client Contacts</strong><br><span style="color:#64748b;font-size:13px;">Enable one-click WhatsApp renewal reminders</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="background:linear-gradient(135deg,#fef3c7,#fffbeb);border-radius:12px;padding:16px 20px;">
      <table role="presentation"><tr>
        <td style="width:40px;vertical-align:top;"><div style="width:32px;height:32px;background:linear-gradient(135deg,#0891b2,#059669);border-radius:8px;color:white;text-align:center;line-height:32px;font-weight:bold;font-size:14px;">3</div></td>
        <td style="padding-left:12px;"><strong style="color:#0f172a;font-size:15px;">Enable Notifications</strong><br><span style="color:#64748b;font-size:13px;">Never miss a policy renewal deadline again</span></td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>

<!-- Feature Highlights -->
<tr><td style="padding:0 32px 32px;">
  <h3 style="color:#0f172a;margin:0 0 16px;font-size:18px;">✨ Key Features</h3>
  <table role="presentation" style="width:100%;">
    <tr><td style="padding:6px 0;color:#475569;font-size:15px;">✅ Track Motor, Health & Life Insurance policies</td></tr>
    <tr><td style="padding:6px 0;color:#475569;font-size:15px;">✅ WhatsApp reminders with one click</td></tr>
    <tr><td style="padding:6px 0;color:#475569;font-size:15px;">✅ Auto-fill policy details from PDF uploads (OCR)</td></tr>
    <tr><td style="padding:6px 0;color:#475569;font-size:15px;">✅ Commission tracking & Excel reports</td></tr>
    <tr><td style="padding:6px 0;color:#475569;font-size:15px;">✅ Due & expired policy alerts</td></tr>
  </table>
</td></tr>

<!-- CTA -->
<tr><td style="padding:0 32px 40px;text-align:center;">
  <a href="https://policytracker2.lovable.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0891b2,#059669);color:#ffffff;padding:16px 48px;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;box-shadow:0 4px 16px rgba(8,145,178,0.3);">
    Go to Dashboard →
  </a>
  <p style="color:#94a3b8;font-size:13px;margin:16px 0 0;">Free plan includes 200 policies & 50 OCR scans</p>
</td></tr>

<!-- Support -->
<tr><td style="padding:0 32px 32px;text-align:center;">
  <div style="background:#f8fafc;border-radius:12px;padding:20px;">
    <p style="color:#475569;font-size:14px;margin:0 0 8px;">Need help? We're here for you!</p>
    <p style="margin:0;">
      <a href="mailto:policytracker.in@gmail.com" style="color:#0891b2;text-decoration:none;font-size:14px;">📧 policytracker.in@gmail.com</a>
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <a href="https://wa.me/916381615829" style="color:#0891b2;text-decoration:none;font-size:14px;">💬 WhatsApp</a>
    </p>
  </div>
</td></tr>

<!-- Footer -->
<tr><td style="background:#f1f5f9;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="color:#64748b;font-size:13px;margin:0 0 4px;"><strong>PolicyTracker.in</strong> — India's #1 Agent Policy Tracker</p>
  <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 PolicyTracker.in | All Rights Reserved</p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`,
      }),
    });

    const result = await emailResponse.json();
    if (!emailResponse.ok) {
      console.error("Failed to send welcome email:", result);
      return new Response(JSON.stringify({ error: "Failed to send welcome email" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, data: result }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
