
import { supabase } from "@/integrations/supabase/client";

export const triggerManualPolicyReport = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('Invoking send-policy-report function for user:', user.id);

    const { data, error } = await supabase.functions.invoke('send-policy-report', {
      body: { 
        manual_trigger: true,
        user_id: user.id
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to send policy report');
    }

    console.log('Policy report response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error triggering policy report:', error);
    throw error;
  }
};
