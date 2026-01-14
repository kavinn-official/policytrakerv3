import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to production domains
const ALLOWED_ORIGINS = [
  'https://policytracker.in',
  'https://www.policytracker.in',
  'http://localhost:5173', // Development
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// HTML escape function to prevent XSS
function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Input validation
function validateInput(data: any): { valid: boolean; error?: string } {
  const { name, email, phone, subject, message } = data;

  // Check required fields
  if (!name || !email || !subject || !message) {
    return { valid: false, error: "All required fields must be provided" };
  }

  // Check types
  if (typeof name !== 'string' || typeof email !== 'string' || 
      typeof subject !== 'string' || typeof message !== 'string') {
    return { valid: false, error: "Invalid field types" };
  }

  // Length limits
  if (name.length > 200) return { valid: false, error: "Name too long (max 200 chars)" };
  if (email.length > 255) return { valid: false, error: "Email too long (max 255 chars)" };
  if (phone && phone.length > 20) return { valid: false, error: "Phone too long (max 20 chars)" };
  if (subject.length > 200) return { valid: false, error: "Subject too long (max 200 chars)" };
  if (message.length > 2000) return { valid: false, error: "Message too long (max 2000 chars)" };

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Reject newlines in single-line fields (prevent header injection)
  if (name.includes('\n') || name.includes('\r') || 
      email.includes('\n') || email.includes('\r') ||
      subject.includes('\n') || subject.includes('\r')) {
    return { valid: false, error: "Invalid characters in input" };
  }

  return { valid: true };
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_HOURS = 1;
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 enquiries per hour per IP

// Get client IP from request
function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('cf-connecting-ip') || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

// Rate limiting helper using IP-based limiting
async function checkRateLimit(supabaseClient: any, clientIp: string): Promise<{ allowed: boolean; remaining: number }> {
  const functionName = 'send-enquiry-email';
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);

  try {
    // Use IP hash as user_id for anonymous rate limiting
    const ipHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clientIp));
    const ipHashHex = Array.from(new Uint8Array(ipHash)).map(b => b.toString(16).padStart(2, '0')).join('');
    const userId = ipHashHex.substring(0, 36); // Use first 36 chars as pseudo-UUID

    const { data: existing, error: fetchError } = await supabaseClient
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('function_name', functionName)
      .eq('window_start', windowStart.toISOString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Rate limit check failed');
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
    console.error('Rate limit error');
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }
}

interface EnquiryRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for rate limiting
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check rate limit
    const clientIp = getClientIP(req);
    const rateLimit = await checkRateLimit(supabaseClient, clientIp);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const requestData = await req.json();
    
    // Validate input
    const validation = validateInput(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, phone, subject, message }: EnquiryRequest = requestData;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Email service not configured");
      throw new Error("Email service not configured");
    }

    // Escape all user input before using in HTML
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || 'Not provided');
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    // Send notification email to admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Policy Tracker <onboarding@resend.dev>",
        to: ["policytracker.in@gmail.com"],
        subject: `New Enquiry: ${safeSubject}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0891b2, #0d9488); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #374151; }
              .value { color: #4b5563; margin-top: 5px; }
              .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">New Enquiry Received</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${safeName}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${safeEmail}</div>
                </div>
                <div class="field">
                  <div class="label">Phone:</div>
                  <div class="value">${safePhone}</div>
                </div>
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${safeSubject}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${safeMessage}</div>
                </div>
              </div>
              <div class="footer">
                <p>This enquiry was submitted via Policy Tracker.in</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const adminResult = await adminEmailResponse.json();

    if (!adminEmailResponse.ok) {
      console.error("Failed to send admin notification");
      throw new Error("Failed to send enquiry");
    }

    // Send confirmation email to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Policy Tracker <onboarding@resend.dev>",
        to: [email], // Use original email for sending (validated above)
        subject: "Thank you for your enquiry - Policy Tracker.in",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0891b2, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #0891b2, #0d9488); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Thank You, ${safeName}!</h1>
              </div>
              <div class="content">
                <p>We have received your enquiry regarding <strong>"${safeSubject}"</strong>.</p>
                <p>Our team will review your message and get back to you within 24 hours.</p>
                <p><strong>Your message:</strong></p>
                <p style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-style: italic;">"${safeMessage}"</p>
                <p>In the meantime, you can:</p>
                <ul>
                  <li>Chat with us on WhatsApp: <a href="https://wa.me/916381615829">+91 6381615829</a></li>
                  <li>Explore our features at <a href="https://policytracker.in">policytracker.in</a></li>
                </ul>
                <p style="text-align: center;">
                  <a href="https://policytracker.in/auth" class="cta-button">Get Started Free</a>
                </p>
              </div>
              <div class="footer">
                <p>Policy Tracker.in - Insurance Policy Management for Agents</p>
                <p>© 2025 policytracker.in. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!userEmailResponse.ok) {
      console.error("Failed to send user confirmation");
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Enquiry email function error");
    return new Response(
      JSON.stringify({ error: "Failed to process enquiry. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
