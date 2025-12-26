
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://policytracker.in',
  'https://www.policytracker.in',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// Input validation helpers
function isValidRazorpayOrderId(id: string): boolean {
  return typeof id === 'string' && /^order_[A-Za-z0-9]{14,}$/.test(id);
}

function isValidRazorpayPaymentId(id: string): boolean {
  return typeof id === 'string' && /^pay_[A-Za-z0-9]{14,}$/.test(id);
}

function isValidSignature(sig: string): boolean {
  return typeof sig === 'string' && /^[a-f0-9]{64}$/.test(sig);
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("verify-razorpay-payment function started");

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: "Authorization header is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !data.user?.email) {
      return new Response(JSON.stringify({ 
        error: "Authentication failed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = data.user;
    console.log("User authenticated:", user.id.substring(0, 8) + "...");

    // Parse request body
    const body = await req.text();
    let requestData;
    try {
      requestData = JSON.parse(body);
    } catch {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON body" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = requestData;

    // Input validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ 
        error: "Missing payment verification data" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!isValidRazorpayOrderId(razorpay_order_id)) {
      return new Response(JSON.stringify({ 
        error: "Invalid order_id format" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!isValidRazorpayPaymentId(razorpay_payment_id)) {
      return new Response(JSON.stringify({ 
        error: "Invalid payment_id format" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!isValidSignature(razorpay_signature)) {
      return new Response(JSON.stringify({ 
        error: "Invalid signature format" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Verifying payment for order:", razorpay_order_id.substring(0, 15) + "...");

    // Verify Razorpay signature using HMAC-SHA256
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keySecret);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signatureArray = new Uint8Array(signature);
    const expectedSignature = Array.from(signatureArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== razorpay_signature) {
      console.error("Invalid payment signature");
      return new Response(JSON.stringify({ 
        error: "Invalid payment signature" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("Payment signature verified successfully");

    // ATOMIC UPDATE: Update payment request status only if pending
    // This prevents race conditions by relying on database-level atomicity
    const { data: paymentData, error: updateError } = await supabaseClient
      .from("payment_requests")
      .update({ 
        status: "completed",
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq("order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .eq("status", "pending") // Only update if still pending - prevents double processing
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error updating payment request");
      return new Response(JSON.stringify({ 
        error: "Failed to update payment status" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // If no data returned, payment was already processed or doesn't exist
    if (!paymentData) {
      console.error("Payment already processed or not found");
      return new Response(JSON.stringify({ 
        error: "Payment already processed or not found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 409,
      });
    }

    console.log("Payment request updated successfully");

    // Update subscription
    const now = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // 1 month subscription

    console.log("Creating/updating subscription for user:", user.id.substring(0, 8) + "...");

    // Update both subscribers and subscriptions tables for consistency
    const { error: subscribersError } = await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: user.id,
        is_active: true,
        subscription_tier: paymentData.plan_type,
        subscription_end_date: subscriptionEnd.toISOString(),
        updated_at: now.toISOString(),
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (subscribersError) {
      console.error("Error updating subscribers table");
    } else {
      console.log("Subscribers table updated successfully");
    }

    // Update subscriptions table (the one used by the frontend)
    // Use update-or-insert flow since there is no unique constraint on user_id
    const { data: existingSub, error: existingSubError } = await supabaseClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let subscriptionError: any = null;

    if (existingSubError) {
      console.error("Error checking existing subscription");
      subscriptionError = existingSubError;
    } else if (existingSub?.id) {
      const { error } = await supabaseClient
        .from("subscriptions")
        .update({
          plan_name: paymentData.plan_type || "Premium",
          amount: paymentData.amount,
          currency: paymentData.currency || "INR",
          status: "active",
          start_date: now.toISOString(),
          end_date: subscriptionEnd.toISOString(),
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          updated_at: now.toISOString(),
        })
        .eq("id", existingSub.id);
      subscriptionError = error;
    } else {
      const { error } = await supabaseClient
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_name: paymentData.plan_type || "Premium",
          amount: paymentData.amount,
          currency: paymentData.currency || "INR",
          status: "active",
          start_date: now.toISOString(),
          end_date: subscriptionEnd.toISOString(),
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          updated_at: now.toISOString(),
        });
      subscriptionError = error;
    }

    if (subscriptionError) {
      console.error("Error updating subscriptions table");
      return new Response(JSON.stringify({ 
        error: "Failed to update subscription" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("Subscriptions table updated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      status: "completed",
      message: "Payment verified and subscription activated"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in verify-razorpay-payment:", error);
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred while verifying payment"
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
