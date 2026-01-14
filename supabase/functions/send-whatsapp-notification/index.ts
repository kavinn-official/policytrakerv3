import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WHATSAPP_PHONE = "916381615829";

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

    let whatsappMessage = "";
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    if (type === "signup") {
      whatsappMessage = `🎉 *New User Signup!*

📧 *Email:* ${safeEmail}
👤 *Name:* ${safeName}
📱 *Phone:* ${safePhone || "Not provided"}

⏰ *Time:* ${timestamp}

---
_Policy Tracker.in_`;
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
_Policy Tracker.in_`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid notification type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate WhatsApp URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

    // Log the notification for debugging
    console.log(`WhatsApp notification generated for ${type}:`, {
      to: WHATSAPP_PHONE,
      type,
      email: safeEmail,
      timestamp,
    });

    // Return success with the WhatsApp URL
    // Note: The actual sending would require WhatsApp Business API integration
    // For now, we return the URL that can be used to trigger WhatsApp
    return new Response(
      JSON.stringify({
        success: true,
        message: "WhatsApp notification prepared",
        whatsappUrl,
        notification: {
          type,
          recipient: WHATSAPP_PHONE,
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
