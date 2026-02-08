import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Verify PayU hash
async function verifyHash(params: Record<string, string>, salt: string): Promise<boolean> {
  // Reverse hash formula: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const hashString = `${salt}|${params.status}|||||||||||${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${params.key}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(hashString);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return calculatedHash.toLowerCase() === params.hash?.toLowerCase();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('verify-payu-payment function started');

  try {
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Parse form data from PayU callback
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log('PayU callback received for txnid:', params.txnid?.substring(0, 10) + '...');

    // Validate required fields
    if (!params.txnid || !params.status || !params.hash) {
      console.error('Missing required PayU parameters');
      return new Response(
        createRedirectHtml('/subscription?payment=failed&error=missing_params'),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Verify hash
    const merchantSalt = Deno.env.get('PAYU_MERCHANT_SALT');
    if (!merchantSalt) {
      console.error('PayU salt not configured');
      return new Response(
        createRedirectHtml('/subscription?payment=failed&error=config_error'),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const isValidHash = await verifyHash(params, merchantSalt);
    if (!isValidHash) {
      console.error('Invalid PayU hash');
      return new Response(
        createRedirectHtml('/subscription?payment=failed&error=invalid_hash'),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    console.log('Hash verified successfully');

    // Get payment request
    const { data: paymentData, error: fetchError } = await supabaseService
      .from('payment_requests')
      .select('*')
      .eq('order_id', params.txnid)
      .eq('status', 'pending')
      .maybeSingle();

    if (fetchError || !paymentData) {
      console.error('Payment request not found or already processed');
      return new Response(
        createRedirectHtml('/subscription?payment=failed&error=not_found'),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Check payment status
    if (params.status !== 'success') {
      console.log('Payment failed or cancelled:', params.status);
      
      // Update payment request status
      await supabaseService
        .from('payment_requests')
        .update({ 
          status: 'failed',
          payment_id: params.mihpayid || null,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', params.txnid);

      return new Response(
        createRedirectHtml(`/subscription?payment=failed&error=${params.status}`),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Payment successful - update payment request
    const { error: updateError } = await supabaseService
      .from('payment_requests')
      .update({ 
        status: 'completed',
        payment_id: params.mihpayid,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', params.txnid)
      .eq('status', 'pending');

    if (updateError) {
      console.error('Error updating payment request');
    }

    // Calculate subscription end date
    const now = new Date();
    const subscriptionEnd = new Date();
    const isYearly = paymentData.plan_type?.includes('yearly');
    
    if (isYearly) {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    // Update subscription
    const planName = paymentData.plan_type?.split('_')[0] || 'Pro';

    // Check for existing subscription
    const { data: existingSub } = await supabaseService
      .from('subscriptions')
      .select('id')
      .eq('user_id', paymentData.user_id)
      .maybeSingle();

    if (existingSub?.id) {
      await supabaseService
        .from('subscriptions')
        .update({
          plan_name: planName,
          amount: paymentData.amount,
          status: 'active',
          start_date: now.toISOString(),
          end_date: subscriptionEnd.toISOString(),
          razorpay_order_id: params.txnid, // Using for PayU txnid
          razorpay_payment_id: params.mihpayid, // Using for PayU mihpayid
          updated_at: now.toISOString(),
        })
        .eq('id', existingSub.id);
    } else {
      await supabaseService
        .from('subscriptions')
        .insert({
          user_id: paymentData.user_id,
          plan_name: planName,
          amount: paymentData.amount,
          status: 'active',
          start_date: now.toISOString(),
          end_date: subscriptionEnd.toISOString(),
          razorpay_order_id: params.txnid,
          razorpay_payment_id: params.mihpayid,
        });
    }

    // Update subscribers table
    await supabaseService
      .from('subscribers')
      .upsert({
        user_id: paymentData.user_id,
        is_active: true,
        subscription_tier: planName,
        subscription_end_date: subscriptionEnd.toISOString(),
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id' });

    console.log('Subscription activated successfully');

    return new Response(
      createRedirectHtml('/subscription?payment=success'),
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Error in verify-payu-payment:', error);
    return new Response(
      createRedirectHtml('/subscription?payment=failed&error=server_error'),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
});

function createRedirectHtml(path: string): string {
  // Get the frontend URL from environment or use default
  const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://policytracker.in';
  const fullUrl = `${frontendUrl}${path}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${fullUrl}">
        <script>window.location.href = '${fullUrl}';</script>
      </head>
      <body>
        <p>Redirecting to PolicyTracker...</p>
        <p>If not redirected, <a href="${fullUrl}">click here</a>.</p>
      </body>
    </html>
  `;
}
