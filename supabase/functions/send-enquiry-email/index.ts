import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnquiryRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: EnquiryRequest = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

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
        subject: `New Enquiry: ${subject}`,
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
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Phone:</div>
                  <div class="value">${phone}</div>
                </div>
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${subject}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${message}</div>
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
    console.log("Admin notification sent:", adminResult);

    // Send confirmation email to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Policy Tracker <onboarding@resend.dev>",
        to: [email],
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
                <h1 style="margin: 0;">Thank You, ${name}!</h1>
              </div>
              <div class="content">
                <p>We have received your enquiry regarding <strong>"${subject}"</strong>.</p>
                <p>Our team will review your message and get back to you within 24 hours.</p>
                <p><strong>Your message:</strong></p>
                <p style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-style: italic;">"${message}"</p>
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

    const userResult = await userEmailResponse.json();
    console.log("User confirmation sent:", userResult);

    if (!adminEmailResponse.ok) {
      throw new Error(adminResult.message || "Failed to send admin notification");
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-enquiry-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
