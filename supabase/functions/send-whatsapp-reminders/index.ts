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

interface Policy {
  id: string;
  policy_number: string;
  client_name: string;
  vehicle_number: string;
  vehicle_make: string;
  vehicle_model: string;
  policy_expiry_date: string;
  contact_number: string | null;
  user_id: string;
}

interface UserSettings {
  user_id: string;
  auto_reminders_enabled: boolean;
  reminder_days: number[];
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate cron secret for scheduled invocations
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  
  // If CRON_SECRET is configured, require it for access
  if (cronSecret && cronSecret.length > 0) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized access attempt to send-whatsapp-reminders");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
  }

  try {
    console.log("WhatsApp reminder function started at:", new Date().toISOString());

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all users with auto reminders enabled
    const { data: userSettings, error: settingsError } = await supabaseClient
      .from('user_settings')
      .select('*')
      .eq('auto_reminders_enabled', true);

    if (settingsError) {
      console.error("Error fetching user settings:", settingsError);
      throw settingsError;
    }

    console.log(`Found ${userSettings?.length || 0} users with auto reminders enabled`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalReminders = 0;
    let failedReminders = 0;

    for (const settings of userSettings || []) {
      const reminderDays = settings.reminder_days || [7, 15, 30];
      console.log(`Processing user ${settings.user_id.substring(0, 8)}... with reminder days:`, reminderDays);

      // Get policies for this user that are expiring within the reminder windows
      const { data: policies, error: policiesError } = await supabaseClient
        .from('policies')
        .select('id, policy_number, client_name, vehicle_number, vehicle_make, vehicle_model, policy_expiry_date, contact_number, user_id')
        .eq('user_id', settings.user_id)
        .gte('policy_expiry_date', today.toISOString().split('T')[0]);

      if (policiesError) {
        console.error(`Error fetching policies for user ${settings.user_id}:`, policiesError);
        continue;
      }

      for (const policy of policies || []) {
        const expiryDate = new Date(policy.policy_expiry_date);
        expiryDate.setHours(0, 0, 0, 0);
        
        const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Check if this policy is due for a reminder
        if (!reminderDays.includes(daysToExpiry)) {
          continue;
        }

        // Check if a reminder was already sent today for this policy
        const todayStart = new Date(today);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const { data: existingLog, error: logError } = await supabaseClient
          .from('whatsapp_reminder_logs')
          .select('id')
          .eq('policy_id', policy.id)
          .eq('user_id', settings.user_id)
          .gte('sent_at', todayStart.toISOString())
          .lte('sent_at', todayEnd.toISOString())
          .maybeSingle();

        if (logError) {
          console.error(`Error checking existing log for policy ${policy.id}:`, logError);
          continue;
        }

        if (existingLog) {
          console.log(`Reminder already sent today for policy ${policy.policy_number}`);
          continue;
        }

        // Generate the WhatsApp message
        const formattedExpiry = expiryDate.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
        
        const vehicleDetails = policy.vehicle_make && policy.vehicle_model 
          ? `${policy.vehicle_make} - ${policy.vehicle_model}`
          : policy.vehicle_make || 'N/A';
        
        const message = `Hi ${policy.client_name},
your policy ${policy.policy_number} is expiring in ${daysToExpiry} days.
Vehicle Details : ${vehicleDetails}
Registration Number : ${policy.vehicle_number}
Expires : ${formattedExpiry}

Please contact us for renewal.`;

        // Log the reminder
        const reminderStatus = policy.contact_number ? 'pending' : 'no_contact';
        
        const { error: insertError } = await supabaseClient
          .from('whatsapp_reminder_logs')
          .insert({
            policy_id: policy.id,
            user_id: settings.user_id,
            message: message,
            status: reminderStatus,
            sent_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`Error logging reminder for policy ${policy.id}:`, insertError);
          failedReminders++;
          continue;
        }

        totalReminders++;
        console.log(`Reminder logged for policy ${policy.policy_number} (${daysToExpiry} days to expiry)`);
      }
    }

    console.log(`Completed: ${totalReminders} reminders logged, ${failedReminders} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${totalReminders} reminders, ${failedReminders} failed`,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in send-whatsapp-reminders function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
