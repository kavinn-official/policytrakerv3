import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !data.user?.email) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }

    const user = data.user;
    console.log("User authenticated:", user.id.substring(0, 8) + "...");

    const body = await req.text();
    let requestData;
    try { requestData = JSON.parse(body); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = requestData;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: "Missing payment data" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    if (!isValidRazorpayOrderId(razorpay_order_id) || !isValidRazorpayPaymentId(razorpay_payment_id) || !isValidSignature(razorpay_signature)) {
      return new Response(JSON.stringify({ error: "Invalid payment data format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    // Verify signature
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(keySecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
    const expectedSignature = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (expectedSignature !== razorpay_signature) {
      console.error("Invalid payment signature");
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }

    console.log("Payment signature verified");

    // Atomic update - only update if pending
    const { data: paymentData, error: updateError } = await supabaseClient
      .from("payment_requests")
      .update({ status: "completed", payment_id: razorpay_payment_id, updated_at: new Date().toISOString() })
      .eq("order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error updating payment:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update payment" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
      });
    }

    if (!paymentData) {
      return new Response(JSON.stringify({ error: "Payment already processed or not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409,
      });
    }

    // Determine subscription duration from plan_type
    const now = new Date();
    const subscriptionEnd = new Date();
    const planTypeStr = paymentData.plan_type || "Pro_monthly";
    const isYearly = planTypeStr.toLowerCase().includes("yearly");
    
    if (isYearly) {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    const planName = planTypeStr.split("_")[0] || "Pro";

    // Update subscribers table
    const { error: subscribersError } = await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: user.id,
        is_active: true,
        subscription_tier: planName.toLowerCase(),
        subscription_end_date: subscriptionEnd.toISOString(),
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id', ignoreDuplicates: false });

    if (subscribersError) console.error("Subscribers update error:", subscribersError);

    // Update subscriptions table
    const { data: existingSub } = await supabaseClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const subData = {
      user_id: user.id,
      plan_name: planName,
      amount: paymentData.amount,
      currency: "INR",
      status: "active",
      start_date: now.toISOString(),
      end_date: subscriptionEnd.toISOString(),
      razorpay_order_id,
      razorpay_payment_id,
      updated_at: now.toISOString(),
    };

    if (existingSub?.id) {
      await supabaseClient.from("subscriptions").update(subData).eq("id", existingSub.id);
    } else {
      await supabaseClient.from("subscriptions").insert(subData);
    }

    console.log("Subscription activated successfully");

    return new Response(JSON.stringify({ success: true, message: "Payment verified and subscription activated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
