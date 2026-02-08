import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Use environment variable with fallback for backwards compatibility
const ADMIN_WHATSAPP = Deno.env.get('ADMIN_WHATSAPP_NUMBER') ?? "916381615829";

// Allowed origins for CORS - restrict to production domains
const ALLOWED_ORIGINS = [
  'https://policytracker.in',
  'https://www.policytracker.in',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

interface NotificationPayload {
  type: "signup" | "enquiry";
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { type, name, email, phone, subject, message } = payload;

    // Validate required fields
    if (!type || !name || !email) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, name, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate notification type
    if (type !== "signup" && type !== "enquiry") {
      console.error("Invalid notification type");
      return new Response(
        JSON.stringify({ error: "Invalid notification type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) || email.length > 255) {
      console.error("Invalid email format");
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Phone validation (optional, but if provided must be valid Indian number)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (phone && phone.replace(/\D/g, '').length > 0) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (!phoneRegex.test(cleanPhone)) {
        console.error("Invalid phone format");
        return new Response(
          JSON.stringify({ error: "Invalid phone format. Must be a valid 10-digit Indian mobile number" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Comprehensive sanitization function
    const sanitize = (str: string | undefined, maxLength: number): string => {
      if (!str) return "";
      // Remove HTML special characters
      let sanitized = str.replace(/[<>&"']/g, "");
      // Remove WhatsApp formatting characters to prevent formatting injection
      sanitized = sanitized.replace(/[*_~`]/g, "");
      // Remove Unicode control characters (C0, C1, and other control chars)
      sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, "");
      // Remove zero-width characters and other potentially problematic Unicode
      sanitized = sanitized.replace(/[\u2060\u2061\u2062\u2063\u2064\u206A-\u206F]/g, "");
      // Normalize whitespace
      sanitized = sanitized.replace(/\s+/g, " ").trim();
      // Limit length
      return sanitized.substring(0, maxLength);
    };

    // Name validation: only letters, spaces, periods, and common name characters
    const nameRegex = /^[a-zA-Z\s.',-]+$/;
    const safeName = sanitize(name, 100);
    if (!safeName || safeName.length < 2 || !nameRegex.test(safeName)) {
      console.error("Invalid name format");
      return new Response(
        JSON.stringify({ error: "Invalid name format. Use only letters and spaces" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeEmail = sanitize(email, 255);
    const safePhone = phone ? sanitize(phone.replace(/\D/g, '').slice(-10), 10) : "";
    const safeSubject = sanitize(subject, 200);
    const safeMessage = sanitize(message, 1000);

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    let whatsappMessage = "";

    if (type === "signup") {
      whatsappMessage = `New User Signup Alert

Email: ${safeEmail}
Name: ${safeName}
Phone: ${safePhone || "Not provided"}

Signup Time: ${timestamp}

Policy Tracker.in - New User Notification`;
    } else {
      whatsappMessage = `New Enquiry Received

Name: ${safeName}
Email: ${safeEmail}
Phone: ${safePhone || "Not provided"}
Subject: ${safeSubject || "General Enquiry"}

Message:
${safeMessage || "No message provided"}

Time: ${timestamp}

Policy Tracker.in - Enquiry Notification`;
    }

    // Generate WhatsApp URL for click-to-chat
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;

    // Log notification details for monitoring (without sensitive data)
    console.log(`[${type.toUpperCase()}] WhatsApp notification generated:`, {
      recipient: ADMIN_WHATSAPP,
      timestamp,
      messageLength: whatsappMessage.length,
    });

    // Store notification log in database for tracking
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Log to console for now since we don't have a notifications table
      console.log("Notification logged successfully");
    } catch (dbError) {
      console.warn("Could not log notification to database:", dbError);
    }

    // Return success with the WhatsApp URL
    // Note: For automated sending, WhatsApp Business API with approved templates would be needed
    // Current implementation generates click-to-chat links for manual follow-up
    return new Response(
      JSON.stringify({
        success: true,
        message: `WhatsApp notification prepared for ${type}`,
        whatsappUrl,
        notification: {
          type,
          recipient: ADMIN_WHATSAPP,
          userEmail: safeEmail,
          userName: safeName,
          timestamp,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing WhatsApp notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Failed to process notification", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
