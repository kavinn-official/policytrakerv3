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

// Validation schemas using manual validation (Zod-like validation)
const VALID_INSURANCE_TYPES = ['Vehicle Insurance', 'Health Insurance', 'Life Insurance', 'Other'];

interface PolicyData {
  policy_number: string;
  client_name: string;
  vehicle_number: string;
  vehicle_make?: string;
  vehicle_model?: string;
  company_name?: string;
  contact_number?: string;
  agent_code?: string;
  reference?: string;
  status?: string;
  net_premium?: number;
  policy_active_date: string;
  policy_expiry_date: string;
  document_url?: string;
  insurance_type: string;
}

interface ValidationError {
  field: string;
  message: string;
}

function validatePolicyData(data: any): { valid: boolean; errors: ValidationError[]; sanitized?: PolicyData } {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!data.policy_number || typeof data.policy_number !== 'string' || data.policy_number.trim().length === 0) {
    errors.push({ field: 'policy_number', message: 'Policy number is required' });
  } else if (data.policy_number.length > 100) {
    errors.push({ field: 'policy_number', message: 'Policy number must be less than 100 characters' });
  }

  if (!data.client_name || typeof data.client_name !== 'string' || data.client_name.trim().length === 0) {
    errors.push({ field: 'client_name', message: 'Client name is required' });
  } else if (data.client_name.length > 200) {
    errors.push({ field: 'client_name', message: 'Client name must be less than 200 characters' });
  }

  if (!data.vehicle_number || typeof data.vehicle_number !== 'string' || data.vehicle_number.trim().length === 0) {
    errors.push({ field: 'vehicle_number', message: 'Vehicle number is required' });
  } else if (data.vehicle_number.length > 20) {
    errors.push({ field: 'vehicle_number', message: 'Vehicle number must be less than 20 characters' });
  }

  // Date validation
  if (!data.policy_active_date || typeof data.policy_active_date !== 'string') {
    errors.push({ field: 'policy_active_date', message: 'Policy active date is required' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.policy_active_date)) {
    errors.push({ field: 'policy_active_date', message: 'Policy active date must be in YYYY-MM-DD format' });
  }

  if (!data.policy_expiry_date || typeof data.policy_expiry_date !== 'string') {
    errors.push({ field: 'policy_expiry_date', message: 'Policy expiry date is required' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.policy_expiry_date)) {
    errors.push({ field: 'policy_expiry_date', message: 'Policy expiry date must be in YYYY-MM-DD format' });
  }

  // Optional fields validation
  if (data.contact_number && typeof data.contact_number === 'string' && data.contact_number.length > 0) {
    const digits = data.contact_number.replace(/\D/g, '');
    if (digits.length !== 10) {
      errors.push({ field: 'contact_number', message: 'Contact number must be exactly 10 digits' });
    }
  }

  if (data.vehicle_make && typeof data.vehicle_make === 'string' && data.vehicle_make.length > 100) {
    errors.push({ field: 'vehicle_make', message: 'Vehicle make must be less than 100 characters' });
  }

  if (data.vehicle_model && typeof data.vehicle_model === 'string' && data.vehicle_model.length > 100) {
    errors.push({ field: 'vehicle_model', message: 'Vehicle model must be less than 100 characters' });
  }

  if (data.company_name && typeof data.company_name === 'string' && data.company_name.length > 200) {
    errors.push({ field: 'company_name', message: 'Company name must be less than 200 characters' });
  }

  if (data.agent_code && typeof data.agent_code === 'string' && data.agent_code.length > 100) {
    errors.push({ field: 'agent_code', message: 'Agent code must be less than 100 characters' });
  }

  if (data.reference && typeof data.reference === 'string' && data.reference.length > 200) {
    errors.push({ field: 'reference', message: 'Reference must be less than 200 characters' });
  }

  // Insurance type validation
  if (!data.insurance_type || typeof data.insurance_type !== 'string') {
    errors.push({ field: 'insurance_type', message: 'Insurance type is required' });
  } else if (!VALID_INSURANCE_TYPES.includes(data.insurance_type)) {
    errors.push({ field: 'insurance_type', message: 'Invalid insurance type' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize and return clean data
  const sanitized: PolicyData = {
    policy_number: data.policy_number.trim().toUpperCase(),
    client_name: data.client_name.trim(),
    vehicle_number: data.vehicle_number.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
    vehicle_make: data.vehicle_make?.trim() || null,
    vehicle_model: data.vehicle_model?.trim() || null,
    company_name: data.company_name?.trim() || null,
    contact_number: data.contact_number ? data.contact_number.replace(/\D/g, '').substring(0, 10) : null,
    agent_code: data.agent_code?.trim() || null,
    reference: data.reference?.trim() || null,
    status: data.status || 'Active',
    net_premium: data.net_premium ? Number(data.net_premium) : 0,
    policy_active_date: data.policy_active_date,
    policy_expiry_date: data.policy_expiry_date,
    document_url: data.document_url || null,
    insurance_type: data.insurance_type || 'Vehicle Insurance',
  };

  return { valid: true, errors: [], sanitized };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Policy validation function started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      console.error("Authentication failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = userData.user.id;
    console.log("User authenticated:", userId.substring(0, 8) + "...");

    const body = await req.json();
    const { action, data, policyId } = body;

    if (!action || !['create', 'update'].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action. Must be 'create' or 'update'" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate the policy data
    const validation = validatePolicyData(data);
    if (!validation.valid) {
      console.log("Validation failed:", validation.errors);
      return new Response(JSON.stringify({ error: "Validation failed", details: validation.errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const sanitizedData = validation.sanitized!;

    if (action === 'create') {
      // Check subscription limits for free users
      const { data: subscription } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const isSubscribed = subscription && 
        subscription.status === 'active' && 
        subscription.end_date && 
        new Date(subscription.end_date) > new Date();

      if (!isSubscribed) {
        const { count, error: countError } = await supabaseClient
          .from('policies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (countError) throw countError;

        if (count !== null && count >= 50) {
          return new Response(JSON.stringify({ 
            error: "Policy limit reached. Free users can add up to 50 policies. Please upgrade to add more policies." 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          });
        }
      }

      // Insert the policy
      const { data: insertedPolicy, error: insertError } = await supabaseClient
        .from('policies')
        .insert([{ ...sanitizedData, user_id: userId }])
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log("Policy created successfully");
      return new Response(JSON.stringify({ success: true, policy: insertedPolicy }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === 'update') {
      if (!policyId) {
        return new Response(JSON.stringify({ error: "Policy ID is required for update" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Verify ownership
      const { data: existingPolicy, error: fetchError } = await supabaseClient
        .from('policies')
        .select('user_id')
        .eq('id', policyId)
        .single();

      if (fetchError || !existingPolicy) {
        return new Response(JSON.stringify({ error: "Policy not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      if (existingPolicy.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Unauthorized to update this policy" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }

      // Update the policy
      const { data: updatedPolicy, error: updateError } = await supabaseClient
        .from('policies')
        .update(sanitizedData)
        .eq('id', policyId)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      console.log("Policy updated successfully");
      return new Response(JSON.stringify({ success: true, policy: updatedPolicy }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });

  } catch (error) {
    console.error("Error in validate-policy function:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred while processing your request" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
