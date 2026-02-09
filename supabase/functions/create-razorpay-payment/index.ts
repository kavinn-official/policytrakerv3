import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-side pricing - source of truth
const PLAN_PRICES: Record<string, Record<string, number>> = {
  Pro: { monthly: 199, yearly: 1999 },
};

const RATE_LIMIT_MAX_REQUESTS = 10;

async function checkRateLimit(supabaseService: any, userId: string, functionName: string): Promise<{ allowed: boolean }> {
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);

  try {
    const { data: existing, error: fetchError } = await supabaseService
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('function_name', functionName)
      .eq('window_start', windowStart.toISOString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return { allowed: true };
    }

    const currentCount = existing?.request_count || 0;
    if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false };
    }

    if (existing) {
      await supabaseService
        .from('rate_limits')
        .update({ request_count: currentCount + 1 })
        .eq('user_id', userId)
        .eq('function_name', functionName)
        .eq('window_start', windowStart.toISOString());
    } else {
      await supabaseService
        .from('rate_limits')
        .insert({ user_id: userId, function_name: functionName, window_start: windowStart.toISOString(), request_count: 1 });
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("create-razorpay-payment function started");

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header is required" }), {
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

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const rateLimit = await checkRateLimit(supabaseService, user.id, 'create-razorpay-payment');
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: "Too many payment attempts. Please try again later." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429,
      });
    }

    // Parse request body
    let planType = "Pro";
    let billingCycle = "monthly";

    try {
      const body = await req.text();
      if (body && body.trim()) {
        const requestData = JSON.parse(body);
        if (requestData.planType) planType = requestData.planType;
        if (requestData.billingCycle && ["monthly", "yearly"].includes(requestData.billingCycle)) {
          billingCycle = requestData.billingCycle;
        }
      }
    } catch {
      console.log("Could not parse request body, using defaults");
    }

    // Enforce server-side pricing
    const planPrices = PLAN_PRICES[planType];
    if (!planPrices) {
      return new Response(JSON.stringify({ error: `Invalid plan type: ${planType}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    const amount = planPrices[billingCycle];
    console.log(`Plan: ${planType}, Cycle: ${billingCycle}, Amount: ₹${amount}`);

    // Razorpay credentials
    const keyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials not configured");
      return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
      });
    }

    // Create Razorpay order
    const orderData = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { user_id: user.id, plan_type: planType, billing_cycle: billingCycle },
    };

    console.log("Creating Razorpay order...");

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify(orderData),
    });

    const razorpayResult = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay order creation failed:", razorpayResult);
      return new Response(JSON.stringify({ error: "Failed to create payment order" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
      });
    }

    console.log("Razorpay order created:", razorpayResult.id);

    // Store payment request
    const { error: insertError } = await supabaseService.from("payment_requests").insert({
      user_id: user.id,
      order_id: razorpayResult.id,
      amount: amount,
      plan_type: `${planType}_${billingCycle}`,
      status: "pending",
    });

    if (insertError) {
      console.error("Error storing payment request:", insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      orderId: razorpayResult.id,
      amount: razorpayResult.amount,
      currency: razorpayResult.currency,
      keyId: keyId,
      planType,
      billingCycle,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("Error in create-razorpay-payment:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
