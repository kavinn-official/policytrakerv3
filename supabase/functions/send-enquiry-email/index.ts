import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return '';
  return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function validateInput(data: any): { valid: boolean; error?: string } {
  const { name, email, subject, message } = data;
  if (!name || !email || !subject || !message) return { valid: false, error: "All required fields must be provided" };
  if (typeof name !== 'string' || typeof email !== 'string' || typeof subject !== 'string' || typeof message !== 'string') return { valid: false, error: "Invalid field types" };
  if (name.length > 200 || email.length > 255 || subject.length > 200 || message.length > 2000) return { valid: false, error: "Input too long" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: "Invalid email format" };
  if ([name, email, subject].some(f => f.includes('\n') || f.includes('\r'))) return { valid: false, error: "Invalid characters" };
  return { valid: true };
}

const RATE_LIMIT_MAX = 3;

async function checkRateLimit(client: any, clientIp: string): Promise<boolean> {
  const windowStart = new Date(); windowStart.setMinutes(0, 0, 0);
  try {
    const ipHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clientIp));
    const userId = Array.from(new Uint8Array(ipHash)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 36);
    const { data: existing } = await client.from('rate_limits').select('request_count').eq('user_id', userId).eq('function_name', 'send-enquiry-email').eq('window_start', windowStart.toISOString()).single();
    const count = existing?.request_count || 0;
    if (count >= RATE_LIMIT_MAX) return false;
    if (existing) { await client.from('rate_limits').update({ request_count: count + 1 }).eq('user_id', userId).eq('function_name', 'send-enquiry-email').eq('window_start', windowStart.toISOString()); }
    else { await client.from('rate_limits').insert({ user_id: userId, function_name: 'send-enquiry-email', window_start: windowStart.toISOString(), request_count: 1 }); }
    return true;
  } catch { return true; }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!(await checkRateLimit(supabaseClient, clientIp))) {
      return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const requestData = await req.json();
    const validation = validateInput(requestData);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { name, email, phone, subject, message } = requestData;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("Email service not configured");

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || 'Not provided');
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const isDemoRequest = subject.toLowerCase().includes("demo");

    // Admin notification email - modern card-based design
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "PolicyTracker <support@policytracker.in>",
        to: ["policytracker.in@gmail.com"],
        subject: isDemoRequest ? `🔔 New Demo Request from ${safeName}` : `New Enquiry: ${safeSubject}`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f0f9ff;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);overflow:hidden;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,${isDemoRequest ? '#7c3aed 0%,#2563eb 100%' : '#0891b2 0%,#0d9488 100%'});padding:32px;text-align:center;">
  <span style="font-size:40px;">${isDemoRequest ? '🎯' : '📩'}</span>
  <h1 style="color:#ffffff;margin:12px 0 0;font-size:24px;font-weight:700;">${isDemoRequest ? 'New Demo Request!' : 'New Enquiry Received'}</h1>
  <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
</td></tr>

<!-- Lead Details Card -->
<tr><td style="padding:32px;">
  <div style="background:#f8fafc;border-radius:12px;padding:24px;border-left:4px solid ${isDemoRequest ? '#7c3aed' : '#0891b2'};">
    <h2 style="color:#0f172a;margin:0 0 20px;font-size:18px;">📋 Lead Details</h2>
    <table role="presentation" style="width:100%;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:100px;">Name</td><td style="padding:8px 0;color:#0f172a;font-size:15px;font-weight:600;">${safeName}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;"><a href="mailto:${safeEmail}" style="color:#0891b2;text-decoration:none;font-size:15px;">${safeEmail}</a></td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;"><a href="tel:${safePhone}" style="color:#0891b2;text-decoration:none;font-size:15px;">${safePhone}</a></td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Subject</td><td style="padding:8px 0;color:#0f172a;font-size:15px;">${safeSubject}</td></tr>
    </table>
  </div>
  
  <div style="margin-top:20px;background:#fffbeb;border-radius:12px;padding:20px;border-left:4px solid #f59e0b;">
    <h3 style="color:#92400e;margin:0 0 8px;font-size:14px;">💬 Message</h3>
    <p style="color:#78350f;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${safeMessage}</p>
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-top:28px;">
    <a href="mailto:${safeEmail}?subject=Re: ${safeSubject}" style="display:inline-block;background:linear-gradient(135deg,#0891b2,#059669);color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;box-shadow:0 4px 12px rgba(8,145,178,0.3);">
      📧 Contact Lead
    </a>
    ${safePhone !== 'Not provided' ? `<br><a href="https://wa.me/91${phone?.replace(/\\D/g, '')}" style="display:inline-block;margin-top:12px;background:#25D366;color:#ffffff;padding:12px 32px;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">💬 WhatsApp</a>` : ''}
  </div>
</td></tr>

<!-- Footer -->
<tr><td style="background:#f1f5f9;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="color:#94a3b8;font-size:12px;margin:0;">PolicyTracker.in Admin Notification • ${new Date().getFullYear()}</p>
</td></tr>

</table></td></tr></table></body></html>`,
      }),
    });

    // Confirmation to user
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "PolicyTracker <support@policytracker.in>",
        to: [email],
        subject: isDemoRequest ? "Thank you for requesting a demo! - PolicyTracker.in" : "Thank you for your enquiry - PolicyTracker.in",
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f0f9ff;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#0891b2 0%,#0d9488 100%);padding:40px 32px;text-align:center;">
  <h1 style="color:#ffffff;margin:0;font-size:26px;">Thank You, ${safeName}! 🙏</h1>
</td></tr>
<tr><td style="padding:32px;">
  <p style="color:#475569;font-size:16px;line-height:1.7;">We've received your ${isDemoRequest ? 'demo request' : 'enquiry'} and our team will reach out within <strong>24 hours</strong>.</p>
  <div style="text-align:center;margin:28px 0;">
    <a href="https://policytracker2.lovable.app/auth" style="display:inline-block;background:linear-gradient(135deg,#0891b2,#059669);color:#ffffff;padding:14px 40px;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">Get Started Free</a>
  </div>
  <p style="color:#64748b;font-size:14px;text-align:center;">Questions? <a href="https://wa.me/916381615829" style="color:#0891b2;">Chat on WhatsApp</a></p>
</td></tr>
<tr><td style="background:#f1f5f9;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} PolicyTracker.in | All Rights Reserved</p>
</td></tr>
</table></td></tr></table></body></html>`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Enquiry email error");
    return new Response(JSON.stringify({ error: "Failed to process enquiry" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
