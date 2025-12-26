
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

// Input validation constants
const VALID_PLAN_TYPES = ["Premium", "Basic"] as const;
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100000;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
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
      console.error("Auth error");
      return new Response(JSON.stringify({ 
        error: "Authentication failed" 
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

    console.log("User authenticated:", user.id.substring(0, 8) + "...");

    // Parse and validate request body
    let amount = 99; // Default ₹99
    let planType = "Premium";
    
    try {
      const body = await req.text();
      if (body && body.trim()) {
        const requestData = JSON.parse(body);
        
        // Validate amount
        if (requestData.amount !== undefined) {
          const parsedAmount = Number(requestData.amount);
          if (isNaN(parsedAmount) || parsedAmount < MIN_AMOUNT || parsedAmount > MAX_AMOUNT) {
            return new Response(JSON.stringify({ 
              error: `Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT}` 
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            });
          }
          amount = parsedAmount;
        }
        
        // Validate planType
        if (requestData.planType !== undefined) {
          if (!VALID_PLAN_TYPES.includes(requestData.planType)) {
            return new Response(JSON.stringify({ 
              error: `Invalid plan type. Must be one of: ${VALID_PLAN_TYPES.join(", ")}` 
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            });
          }
          planType = requestData.planType;
        }
      }
    } catch (parseError) {
      console.log("Could not parse request body, using defaults");
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
    
    // Create Razorpay order (no PII in notes)
    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: orderId,
      notes: {
        user_id: user.id,
        plan_type: planType
      }
    };

    console.log("Creating Razorpay order for amount:", amount);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`
      },
      body: JSON.stringify(orderData)
    });

    const razorpayResult = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay order creation failed:", razorpayResult);
      return new Response(JSON.stringify({ 
        error: "Failed to create payment order. Please try again later."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("Razorpay order created successfully");

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
      console.error("Error storing payment request");
      return new Response(JSON.stringify({ 
        error: "Failed to create payment request" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("Payment request stored successfully");

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
    console.error("Error in create-razorpay-payment");
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred",
      details: "Check function logs for more information"
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
