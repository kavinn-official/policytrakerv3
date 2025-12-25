
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ 
        error: "Authorization header is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Authenticating user...");
    
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ 
        error: `Authentication failed: ${authError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = data.user;
    if (!user?.email) {
      console.error("User not found or no email");
      return new Response(JSON.stringify({ 
        error: "User not authenticated or email not available" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("User authenticated:", user.email);

    // Parse request body for payment details
    let amount = 50; // Default ₹50
    let planType = "Premium";
    
    try {
      const body = await req.text();
      console.log("Raw request body:", body);
      if (body && body.trim()) {
        const requestData = JSON.parse(body);
        console.log("Parsed request data:", requestData);
        if (requestData.amount) {
          amount = requestData.amount;
        }
        if (requestData.planType) {
          planType = requestData.planType;
        }
      }
    } catch (parseError) {
      console.log("Could not parse request body, using defaults:", parseError);
    }

    // Razorpay configuration
    const keyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials not configured");
      return new Response(JSON.stringify({ 
        error: "Payment gateway not configured properly" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const orderId = `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    // Create Razorpay order
    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: orderId,
      notes: {
        user_id: user.id,
        email: user.email,
        plan_type: planType
      }
    };

    console.log("Creating Razorpay order:", orderData);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`
      },
      body: JSON.stringify(orderData)
    });

    const razorpayResult = await razorpayResponse.json();
    console.log("Razorpay order response:", razorpayResult);

    if (!razorpayResponse.ok) {
      console.error("Razorpay order creation failed:", razorpayResult);
      return new Response(JSON.stringify({ 
        error: "Failed to create payment order",
        details: razorpayResult.error?.description || "Unknown error"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Store payment request in database for tracking
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseService.from("payment_requests").insert({
      user_id: user.id,
      order_id: razorpayResult.id,
      amount: amount,
      plan_type: planType,
      status: "pending",
    });

    if (insertError) {
      console.error("Error storing payment request:", insertError);
      return new Response(JSON.stringify({ 
        error: "Failed to create payment request" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("Payment request stored successfully for order:", razorpayResult.id);

    return new Response(JSON.stringify({ 
      orderId: razorpayResult.id,
      amount: razorpayResult.amount,
      currency: razorpayResult.currency,
      keyId: keyId,
      planType: planType,
      success: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-razorpay-payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check function logs for more information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
