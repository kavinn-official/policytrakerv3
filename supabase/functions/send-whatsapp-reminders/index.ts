import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Minimal headers for cron-only function (no CORS needed - not browser-invoked)
const responseHeaders = {
  'Content-Type': 'application/json',
};

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
  // No CORS handling needed - this function is only called by cron scheduler
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const startTime = Date.now();
  console.log("=== WhatsApp Reminder Function Started ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request method:", req.method);

  // Validate cron secret for scheduled invocations - MANDATORY
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  
  // CRON_SECRET is required for security - fail if not configured
  if (!cronSecret || cronSecret.length === 0) {
    console.error("ERROR: CRON_SECRET not configured - function access denied");
    return new Response(JSON.stringify({ 
      error: "Service not configured",
      details: "CRON_SECRET environment variable is not set"
    }), {
      headers: responseHeaders,
      status: 503,
    });
  }
  
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.error("ERROR: Unauthorized access attempt - invalid or missing auth header");
    return new Response(JSON.stringify({ 
      error: "Unauthorized",
      details: "Invalid authorization header"
    }), {
      headers: responseHeaders,
      status: 401,
    });
  }

  console.log("Authorization validated successfully");

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("ERROR: Missing Supabase configuration");
      throw new Error("Database configuration missing");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, { 
      auth: { persistSession: false } 
    });

    console.log("Supabase client initialized");

    // Get all users with auto reminders enabled
    const { data: userSettings, error: settingsError } = await supabaseClient
      .from('user_settings')
      .select('*')
      .eq('auto_reminders_enabled', true);

    if (settingsError) {
      console.error("ERROR: Failed to fetch user settings:", settingsError.message);
      throw settingsError;
    }

    console.log(`Found ${userSettings?.length || 0} users with auto reminders enabled`);

    if (!userSettings || userSettings.length === 0) {
      console.log("No users have auto reminders enabled - exiting");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No users with auto reminders enabled",
        totalReminders: 0,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime
      }), {
        headers: responseHeaders,
        status: 200,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalReminders = 0;
    let failedReminders = 0;
    let skippedReminders = 0;
    const processedUsers: string[] = [];
    const errors: string[] = [];

    for (const settings of userSettings) {
      const userId = settings.user_id;
      const reminderDays = settings.reminder_days || [7, 15, 30];
      
      console.log(`\n--- Processing user ${userId.substring(0, 8)}... ---`);
      console.log(`Reminder days configured:`, reminderDays);

      // Get policies for this user that are expiring within the reminder windows
      const { data: policies, error: policiesError } = await supabaseClient
        .from('policies')
        .select('id, policy_number, client_name, vehicle_number, vehicle_make, vehicle_model, policy_expiry_date, contact_number, user_id')
        .eq('user_id', userId)
        .gte('policy_expiry_date', today.toISOString().split('T')[0]);

      if (policiesError) {
        const errMsg = `Failed to fetch policies for user ${userId.substring(0, 8)}: ${policiesError.message}`;
        console.error("ERROR:", errMsg);
        errors.push(errMsg);
        continue;
      }

      console.log(`Found ${policies?.length || 0} active policies for user`);

      for (const policy of policies || []) {
        const expiryDate = new Date(policy.policy_expiry_date);
        expiryDate.setHours(0, 0, 0, 0);
        
        const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Check if this policy is due for a reminder
        if (!reminderDays.includes(daysToExpiry)) {
          continue;
        }

        console.log(`Policy ${policy.policy_number}: ${daysToExpiry} days to expiry - matches reminder day`);

        // Check if a reminder was already sent today for this policy
        const todayStart = new Date(today);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const { data: existingLog, error: logError } = await supabaseClient
          .from('whatsapp_reminder_logs')
          .select('id')
          .eq('policy_id', policy.id)
          .eq('user_id', userId)
          .gte('sent_at', todayStart.toISOString())
          .lte('sent_at', todayEnd.toISOString())
          .maybeSingle();

        if (logError) {
          const errMsg = `Error checking existing log for policy ${policy.policy_number}: ${logError.message}`;
          console.error("ERROR:", errMsg);
          errors.push(errMsg);
          continue;
        }

        if (existingLog) {
          console.log(`Reminder already sent today for policy ${policy.policy_number} - skipping`);
          skippedReminders++;
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
            user_id: userId,
            message: message,
            status: reminderStatus,
            sent_at: new Date().toISOString()
          });

        if (insertError) {
          const errMsg = `Error logging reminder for policy ${policy.policy_number}: ${insertError.message}`;
          console.error("ERROR:", errMsg);
          errors.push(errMsg);
          failedReminders++;
          continue;
        }

        totalReminders++;
        console.log(`SUCCESS: Reminder logged for policy ${policy.policy_number} (${daysToExpiry} days to expiry, status: ${reminderStatus})`);
      }

      processedUsers.push(userId.substring(0, 8));
    }

    const executionTimeMs = Date.now() - startTime;
    
    console.log("\n=== WhatsApp Reminder Function Completed ===");
    console.log(`Total reminders logged: ${totalReminders}`);
    console.log(`Failed reminders: ${failedReminders}`);
    console.log(`Skipped (already sent today): ${skippedReminders}`);
    console.log(`Users processed: ${processedUsers.length}`);
    console.log(`Execution time: ${executionTimeMs}ms`);
    
    if (errors.length > 0) {
      console.log(`Errors encountered: ${errors.length}`);
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${totalReminders} reminders, ${failedReminders} failed, ${skippedReminders} skipped`,
      totalReminders,
      failedReminders,
      skippedReminders,
      usersProcessed: processedUsers.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      executionTimeMs
    }), {
      headers: responseHeaders,
      status: 200,
    });

  } catch (error) {
    const executionTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error("=== FATAL ERROR in send-whatsapp-reminders ===");
    console.error("Error:", errorMessage);
    console.error("Execution time:", executionTimeMs, "ms");
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      executionTimeMs
    }), {
      headers: responseHeaders,
      status: 500,
    });
  }
});