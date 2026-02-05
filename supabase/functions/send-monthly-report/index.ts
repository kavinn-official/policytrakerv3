import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Check if today is the last day of the month
function isLastDayOfMonth(): boolean {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // If tomorrow is the 1st, today is the last day
  return tomorrow.getDate() === 1;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify cron secret for automated calls
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    // Check if this is a cron job call
    const { manual_trigger } = await req.json().catch(() => ({}));
    
    if (!manual_trigger && authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized cron call");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if today is the last day of month (skip for manual triggers)
    if (!manual_trigger && !isLastDayOfMonth()) {
      console.log("Not the last day of the month, skipping");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Skipped - not last day of month" 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting monthly policy report generation...");

    // Get all users with policies
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name');

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Processing ${profiles?.length || 0} users for monthly report`);

    let successCount = 0;
    let errorCount = 0;

    for (const profile of profiles || []) {
      try {
        // Call the existing send-policy-report function for each user
        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-policy-report`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              manual_trigger: false,
              user_id: profile.id,
              report_type: 'monthly_premium',
              month: 'current'
            }),
          }
        );

        if (response.ok) {
          successCount++;
          console.log(`Monthly report sent successfully for user: ${profile.id}`);
        } else {
          errorCount++;
          console.error(`Failed to send monthly report for user: ${profile.id}`);
        }

        // Add delay between users to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (userError) {
        errorCount++;
        console.error(`Error processing user ${profile.id}:`, userError);
      }
    }

    console.log(`Monthly reports completed. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Monthly policy reports sent",
      successCount,
      errorCount,
      totalUsers: profiles?.length || 0
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: unknown) {
    console.error("Error in send-monthly-report function:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to send monthly reports" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
