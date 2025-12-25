
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

    // Parse request body
    const body = await req.text();
    const requestData = JSON.parse(body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = requestData;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ 
        error: "Missing payment verification data" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Verifying Razorpay payment:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });

    // Verify that the payment request exists and hasn't been processed
    const { data: existingPayment, error: fetchError } = await supabaseClient
      .from("payment_requests")
      .select("*")
      .eq("order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingPayment) {
      console.error("Payment request not found:", fetchError);
      return new Response(JSON.stringify({ 
        error: "Payment request not found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (existingPayment.status === "completed") {
      console.error("Payment already processed");
      return new Response(JSON.stringify({ 
        error: "Payment already processed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

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

    // Update payment request status
    const { data: paymentData, error: updateError } = await supabaseClient
      .from("payment_requests")
      .update({ 
        status: "completed",
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq("order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .eq("status", "pending") // Ensure we only update pending payments
      .select()
      .single();

    if (updateError) {
      console.error("Error updating payment request:", updateError);
      return new Response(JSON.stringify({ 
        error: "Failed to update payment status" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("Payment request updated:", paymentData);

    // Update subscription
    if (paymentData) {
      const now = new Date();
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // 1 month subscription

      console.log("Creating/updating subscription for user:", user.id);

      // Update both subscribers and subscriptions tables for consistency
      const { data: subscribersData, error: subscribersError } = await supabaseClient
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
        })
        .select()
        .single();

      if (subscribersError) {
        console.error("Error updating subscribers table:", subscribersError);
      } else {
        console.log("Subscribers table updated successfully:", subscribersData);
      }

      // Update subscriptions table (the one used by the frontend)
      // Use update-or-insert flow since there is no unique constraint on user_id
      const { data: existingSub, error: existingSubError } = await supabaseClient
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let subscriptionData: any = null;
      let subscriptionError: any = null;

      if (existingSubError) {
        console.error("Error checking existing subscription:", existingSubError);
        subscriptionError = existingSubError;
      } else if (existingSub?.id) {
        const { data, error } = await supabaseClient
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
          .eq("id", existingSub.id)
          .select()
          .single();
        subscriptionData = data;
        subscriptionError = error;
      } else {
        const { data, error } = await supabaseClient
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
          })
          .select()
          .single();
        subscriptionData = data;
        subscriptionError = error;
      }

      if (subscriptionError) {
        console.error("Error updating subscriptions table:", subscriptionError);
        return new Response(JSON.stringify({ 
          error: "Failed to update subscription" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      console.log("Subscriptions table updated successfully:", subscriptionData);

    }

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
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
