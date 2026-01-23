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

// Validation interface
interface ClientData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateClientData(data: any): { valid: boolean; errors: ValidationError[]; sanitized?: ClientData } {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Client name is required' });
  } else if (data.name.length > 200) {
    errors.push({ field: 'name', message: 'Client name must be less than 200 characters' });
  }

  // Email validation (optional but must be valid if provided)
  if (data.email && typeof data.email === 'string' && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    } else if (data.email.length > 255) {
      errors.push({ field: 'email', message: 'Email must be less than 255 characters' });
    }
  }

  // Phone validation (optional but must be 10 digits if provided)
  if (data.phone && typeof data.phone === 'string' && data.phone.length > 0) {
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      errors.push({ field: 'phone', message: 'Phone number must be exactly 10 digits' });
    }
  }

  // Address validation (optional)
  if (data.address && typeof data.address === 'string' && data.address.length > 500) {
    errors.push({ field: 'address', message: 'Address must be less than 500 characters' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize and return clean data
  const sanitized: ClientData = {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone ? data.phone.replace(/\D/g, '').substring(0, 10) : null,
    address: data.address?.trim() || null,
  };

  return { valid: true, errors: [], sanitized };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Client validation function started");

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
    const { action, data, clientId } = body;

    if (!action || !['create', 'update'].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action. Must be 'create' or 'update'" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate the client data
    const validation = validateClientData(data);
    if (!validation.valid) {
      console.log("Validation failed:", validation.errors);
      return new Response(JSON.stringify({ error: "Validation failed", details: validation.errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const sanitizedData = validation.sanitized!;

    if (action === 'create') {
      // Insert the client
      const { data: insertedClient, error: insertError } = await supabaseClient
        .from('clients')
        .insert([{ ...sanitizedData, user_id: userId }])
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log("Client created successfully");
      return new Response(JSON.stringify({ success: true, client: insertedClient }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === 'update') {
      if (!clientId) {
        return new Response(JSON.stringify({ error: "Client ID is required for update" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Verify ownership
      const { data: existingClient, error: fetchError } = await supabaseClient
        .from('clients')
        .select('user_id')
        .eq('id', clientId)
        .single();

      if (fetchError || !existingClient) {
        return new Response(JSON.stringify({ error: "Client not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      if (existingClient.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Unauthorized to update this client" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }

      // Update the client
      const { data: updatedClient, error: updateError } = await supabaseClient
        .from('clients')
        .update(sanitizedData)
        .eq('id', clientId)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      console.log("Client updated successfully");
      return new Response(JSON.stringify({ success: true, client: updatedClient }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });

  } catch (error) {
    console.error("Error in validate-client function:", error instanceof Error ? error.message : "Unknown error");
    return new Response(JSON.stringify({ error: "An error occurred while processing your request. Please try again." }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
