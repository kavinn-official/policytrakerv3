import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_WHATSAPP = "916381615829";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: "signup" | "enquiry";
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { type, name, email, phone, subject, message } = payload;

    // Validate required fields
    if (!type || !name || !email) {
      console.error("Missing required fields:", { type, name, email });
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, name, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs to prevent injection
    const sanitize = (str: string | undefined): string => {
      if (!str) return "";
      return str.replace(/[<>&"']/g, "").substring(0, 500);
    };

    const safeName = sanitize(name);
    const safeEmail = sanitize(email);
    const safePhone = sanitize(phone);
    const safeSubject = sanitize(subject);
    const safeMessage = sanitize(message);

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    let whatsappMessage = "";

    if (type === "signup") {
      whatsappMessage = `🎉 *New User Signup Alert!*

📧 *Email:* ${safeEmail}
👤 *Name:* ${safeName}
📱 *Phone:* ${safePhone || "Not provided"}

⏰ *Signup Time:* ${timestamp}

---
_Policy Tracker.in - New User Notification_`;
    } else if (type === "enquiry") {
      whatsappMessage = `📩 *New Enquiry Received!*

👤 *Name:* ${safeName}
📧 *Email:* ${safeEmail}
📱 *Phone:* ${safePhone || "Not provided"}
📝 *Subject:* ${safeSubject || "General Enquiry"}

💬 *Message:*
${safeMessage || "No message provided"}

⏰ *Time:* ${timestamp}

---
_Policy Tracker.in - Enquiry Notification_`;
    } else {
      console.error("Invalid notification type:", type);
      return new Response(
        JSON.stringify({ error: "Invalid notification type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate WhatsApp URL for click-to-chat
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;

    // Log notification details for monitoring
    console.log(`[${type.toUpperCase()}] WhatsApp notification generated:`, {
      recipient: ADMIN_WHATSAPP,
      userEmail: safeEmail,
      userName: safeName,
      userPhone: safePhone,
      timestamp,
      messageLength: whatsappMessage.length,
    });

    // Log the full message for debugging
    console.log("WhatsApp message content:", whatsappMessage);

    // Store notification log in database for tracking
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Log to console for now since we don't have a notifications table
      console.log("Notification logged successfully for:", safeEmail);
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
