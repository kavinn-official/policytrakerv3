import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Max file size: 10MB in base64 (~14MB encoded)
const MAX_BASE64_SIZE = 14680064;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
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

    // Determine the MIME type - try to detect if it's actually an image
    // PDFs should use file type, images should use image_url
    const isPdf = pdfBase64.startsWith('JVBERi0') || pdfBase64.substring(0, 20).includes('PDF');
    
    console.log("Document type detection - isPdf:", isPdf, "First chars:", pdfBase64.substring(0, 20));

    // Build the appropriate content structure
    const userContent: any[] = [
      {
        type: "text",
        text: "Extract insurance policy details from this document. Return ONLY a valid JSON object with these fields: policy_number, client_name, vehicle_number, vehicle_make, vehicle_model, company_name, contact_number (10 digits), policy_active_date (YYYY-MM-DD), policy_expiry_date (YYYY-MM-DD), net_premium (number only). If a field cannot be found, use empty string for text or 0 for net_premium."
      }
    ];

    if (isPdf) {
      // For PDFs, use file type with proper MIME
      userContent.push({
        type: "file",
        file: {
          filename: "policy.pdf",
          file_data: `data:application/pdf;base64,${pdfBase64}`
        }
      });
    } else {
      // For images (JPEG, PNG, etc.), use image_url
      // Try to detect image type from base64 header
      let mimeType = "image/jpeg"; // default
      if (pdfBase64.startsWith('/9j/')) mimeType = "image/jpeg";
      else if (pdfBase64.startsWith('iVBORw0KGgo')) mimeType = "image/png";
      else if (pdfBase64.startsWith('UklGR')) mimeType = "image/webp";
      
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${pdfBase64}`
        }
      });
    }

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
            content: `You are an expert at extracting insurance policy information from documents. 
Extract the following fields:
- policy_number: The policy number/ID
- client_name: The policyholder's name
- vehicle_number: The vehicle registration number
- vehicle_make: The vehicle manufacturer/make (e.g., Maruti, Honda, Toyota)
- vehicle_model: The vehicle model name
- company_name: The insurance company name
- contact_number: The contact phone number (10 digits only)
- policy_active_date: The policy start date in YYYY-MM-DD format
- policy_expiry_date: The policy end date in YYYY-MM-DD format
- net_premium: The net premium amount (numeric value only, no currency symbols)

Return ONLY a valid JSON object with these fields. If a field cannot be found, use an empty string for text fields or 0 for net_premium.
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
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI processing failed: ${errorText}`);
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
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
