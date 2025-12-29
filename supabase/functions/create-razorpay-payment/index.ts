
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

// Input validation constants with server-side pricing enforcement
const PLAN_PRICES: Record<string, number> = {
  "Premium": 199,
  "Basic": 99
} as const;
const VALID_PLAN_TYPES = Object.keys(PLAN_PRICES);
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100000;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_HOURS = 1;
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 payment attempts per hour

// Rate limiting helper
async function checkRateLimit(supabaseService: any, userId: string, functionName: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0); // Round to current hour

  try {
    // Try to get existing rate limit record
    const { data: existing, error: fetchError } = await supabaseService
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('function_name', functionName)
      .eq('window_start', windowStart.toISOString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Rate limit check error:', fetchError);
      // Fail open - allow request if rate limiting check fails
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
    }

    const currentCount = existing?.request_count || 0;
    
    if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0 };
    }

    // Increment or insert rate limit record
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
        .insert({
          user_id: userId,
          function_name: functionName,
          window_start: windowStart.toISOString(),
          request_count: 1
        });
    }

    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - currentCount - 1 };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }
}

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

    // Rate limiting check
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const rateLimit = await checkRateLimit(supabaseService, user.id, 'create-razorpay-payment');
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for user ${user.id.substring(0, 8)}...`);
      return new Response(JSON.stringify({ 
        error: "Too many payment attempts. Please try again later." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Parse and validate request body
    let amount = 199; // Default ₹199
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
          
          // Server-side price enforcement - override client amount with correct plan price
          const expectedAmount = PLAN_PRICES[planType];
          if (amount !== expectedAmount) {
            console.log(`Amount mismatch for ${planType}: client sent ${amount}, expected ${expectedAmount}. Using server-side price.`);
            amount = expectedAmount;
          }
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

    // Store payment request in database for tracking (reuse supabaseService from rate limiting)

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
    console.error("Error in create-razorpay-payment:", error);
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred. Please try again later."
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
