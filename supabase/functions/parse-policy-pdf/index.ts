import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers - allow all origins for flexibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Max file size: 10MB in base64 (~14MB encoded)
const MAX_BASE64_SIZE = 14680064;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_HOURS = 1;
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 PDF parses per hour

// Rate limiting helper
async function checkRateLimit(supabaseService: any, userId: string, functionName: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0); // Round to current hour

  try {
    const { data: existing, error: fetchError } = await supabaseService
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('function_name', functionName)
      .eq('window_start', windowStart.toISOString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Rate limit check error:', fetchError);
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
    }

    const currentCount = existing?.request_count || 0;
    
    if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0 };
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
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.log("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", userData.user.id);

    // Rate limiting check
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const rateLimit = await checkRateLimit(supabaseService, userData.user.id, 'parse-policy-pdf');
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for user ${userData.user.id.substring(0, 8)}...`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { pdfBase64 } = await req.json();
    
    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: "No PDF data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side size validation
    if (pdfBase64.length > MAX_BASE64_SIZE) {
      console.log("File too large:", pdfBase64.length, "bytes");
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 10MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate base64 format before processing
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    // Clean potential whitespace and check format (check first 1000 chars for performance)
    const base64Sample = pdfBase64.substring(0, 1000).replace(/\s/g, '');
    if (!base64Pattern.test(base64Sample)) {
      console.log("Invalid base64 format detected");
      return new Response(
        JSON.stringify({ error: "Invalid file format. Please upload a valid document." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Detect the MIME type from base64 magic bytes (file signature)
    // These are well-known file signatures encoded in base64
    let mimeType = "application/pdf"; // default
    let detectedType = "unknown";
    
    if (pdfBase64.startsWith('JVBERi0')) {
      // PDF magic bytes: %PDF-
      mimeType = "application/pdf";
      detectedType = "PDF";
    } else if (pdfBase64.startsWith('/9j/')) {
      // JPEG magic bytes: FFD8FF
      mimeType = "image/jpeg";
      detectedType = "JPEG";
    } else if (pdfBase64.startsWith('iVBORw0KGgo')) {
      // PNG magic bytes: 89504E47
      mimeType = "image/png";
      detectedType = "PNG";
    } else if (pdfBase64.startsWith('UklGR')) {
      // WebP magic bytes: RIFF....WEBP
      mimeType = "image/webp";
      detectedType = "WebP";
    } else if (pdfBase64.startsWith('R0lGODlh') || pdfBase64.startsWith('R0lGODdh')) {
      // GIF magic bytes: GIF89a or GIF87a
      mimeType = "image/gif";
      detectedType = "GIF";
    } else if (pdfBase64.startsWith('Qk')) {
      // BMP magic bytes: BM
      mimeType = "image/bmp";
      detectedType = "BMP";
    } else {
      // If we can't detect the type, log a warning but continue with PDF default
      console.log("Unknown file signature, defaulting to PDF. First 20 chars:", pdfBase64.substring(0, 20));
    }
    
    console.log(`Document type detection - detected: ${detectedType}, mimeType: ${mimeType}, Base64 length: ${pdfBase64.length}`);

    // Build the content structure using image_url format (works for PDFs and images)
    const userContent: any[] = [
      {
        type: "text",
        text: "Extract insurance policy details from this document. Return ONLY a valid JSON object with these fields: policy_number, client_name, vehicle_number, vehicle_make, vehicle_model, company_name, contact_number (10 digits), policy_active_date (YYYY-MM-DD), policy_expiry_date (YYYY-MM-DD), net_premium (number only - MUST be the base premium BEFORE GST/taxes, NOT the total premium), insurance_type (must be one of: 'Vehicle Insurance', 'Health Insurance', 'Life Insurance', 'Other'). IMPORTANT: For net_premium, look for 'Net Premium', 'Basic Premium', 'Base Premium', or 'Premium (Before Tax)'. EXCLUDE any GST components (CGST, SGST, IGST, Service Tax). If only Total Premium is shown with GST breakup, calculate: Net Premium = Total Premium - All GST amounts. If a field cannot be found, use empty string for text or 0 for net_premium."
      },
      {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${pdfBase64}`
        }
      }
    ];

    // Use Gemini to extract policy details
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert at extracting insurance policy information from Indian insurance documents.

CRITICAL INSTRUCTIONS FOR NET PREMIUM:
The net_premium field MUST contain the base premium amount BEFORE any GST/taxes are added. This is essential for accurate reporting.

How to find Net Premium:
1. Look for fields labeled: "Net Premium", "Basic Premium", "Base Premium", "Premium (Before Tax)", "Own Damage Premium + Third Party Premium"
2. EXCLUDE these from net_premium: CGST, SGST, IGST, GST, Service Tax, Cess, any tax component
3. If only "Total Premium" or "Gross Premium" is shown WITH a GST breakup, calculate: Net Premium = Total Premium - (CGST + SGST + IGST + any other taxes)
4. Common pattern: Look for premium breakdown table - the net premium is typically shown before the GST line items

Extract these fields:
- policy_number: The policy number/ID
- client_name: The policyholder's name  
- vehicle_number: The vehicle registration number (if applicable)
- vehicle_make: The vehicle manufacturer/make (e.g., Maruti, Honda, Toyota) - if applicable
- vehicle_model: The vehicle model name - if applicable
- company_name: The insurance company name
- contact_number: The contact phone number (10 digits only)
- policy_active_date: The policy start date in YYYY-MM-DD format
- policy_expiry_date: The policy end date in YYYY-MM-DD format
- net_premium: The BASE premium amount BEFORE GST (numeric value only, no currency symbols or commas)
- insurance_type: Determine the type from keywords - "Vehicle Insurance", "Health Insurance", "Life Insurance", or "Other"

Return ONLY a valid JSON object. If a field cannot be found, use empty string for text or 0 for net_premium. Default insurance_type to "Vehicle Insurance" if unclear.
Do not include any explanation or markdown formatting.`
          },
          {
            role: "user",
            content: userContent
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      // Return generic error messages to clients - keep specifics in server logs only
      if (response.status === 429 || response.status === 402 || response.status >= 500) {
        return new Response(
          JSON.stringify({ error: "Unable to process document. Please try again later." }),
          { status: response.status === 429 ? 429 : 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Document processing failed");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let extractedData;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      extractedData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      extractedData = {
        policy_number: "",
        client_name: "",
        vehicle_number: "",
        vehicle_make: "",
        vehicle_model: "",
        company_name: "",
        contact_number: "",
        policy_active_date: "",
        policy_expiry_date: "",
        net_premium: 0,
        insurance_type: "Vehicle Insurance",
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error parsing policy PDF:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to parse PDF" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
