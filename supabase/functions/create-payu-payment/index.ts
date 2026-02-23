import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// PayU configuration - Hardcoded to production
const PAYU_BASE_URL = 'https://secure.payu.in/_payment';

// Plan pricing (server-side enforcement)
const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  "Pro": { monthly: 199, yearly: 1999 },
};

// Generate transaction ID
function generateTxnId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `PT${timestamp}${random}`.toUpperCase();
}

// Generate PayU hash
async function generateHash(params: Record<string, string>, salt: string): Promise<string> {
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${salt}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(hashString);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('create-payu-payment function started');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !authData.user?.email) {
      console.error('Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = authData.user;
    console.log('User authenticated:', user.id.substring(0, 8) + '...');

    // Parse request
    let planType = 'Pro';
    let billingCycle = 'monthly';

    try {
      const body = await req.json();
      if (body.planType && PLAN_PRICES[body.planType]) {
        planType = body.planType;
      }
      if (body.billingCycle === 'yearly') {
        billingCycle = 'yearly';
      }
    } catch {
      console.log('Using default plan configuration');
    }

    // Get PayU credentials
    const merchantKey = Deno.env.get('PAYU_MERCHANT_KEY');
    const merchantSalt = Deno.env.get('PAYU_MERCHANT_SALT');

    if (!merchantKey || !merchantSalt) {
      console.error('PayU credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate amount based on plan and billing cycle
    const amount = billingCycle === 'yearly'
      ? PLAN_PRICES[planType].yearly
      : PLAN_PRICES[planType].monthly;

    const txnId = generateTxnId();

    // Determine frontend URL based on request origin to support local testing
    const origin = req.headers.get('origin') || 'https://policytracker.in';
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const frontendUrl = isLocal ? origin : 'https://policytracker.in';

    // The URLs PayU will redirect to after payment (we pass the frontendUrl in the URL so verify can redirect back correctly)
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-payu-payment?redirect_to=${encodeURIComponent(frontendUrl)}`;

    // PayU parameters
    const params: Record<string, string> = {
      key: merchantKey,
      txnid: txnId,
      amount: amount.toFixed(2),
      productinfo: `PolicyTracker.in ${planType} - ${billingCycle}`,
      firstname: user.user_metadata?.full_name?.split(' ')[0] || 'Customer',
      email: user.email,
      phone: user.user_metadata?.mobile_number || '',
      surl: callbackUrl,
      furl: callbackUrl,
    };

    // Generate hash
    const hash = await generateHash(params, merchantSalt);

    // Store payment request in database
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseService.from('payment_requests').insert({
      user_id: user.id,
      order_id: txnId,
      amount: amount,
      plan_type: `${planType}_${billingCycle}`,
      status: 'pending',
    });

    if (insertError) {
      console.error('Error storing payment request');
      return new Response(
        JSON.stringify({ error: 'Failed to create payment request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment request created:', txnId);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: PAYU_BASE_URL,
        params: {
          ...params,
          hash: hash,
        },
        txnId: txnId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-payu-payment:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
