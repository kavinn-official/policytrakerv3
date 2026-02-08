import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';

// Subscription limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    maxPolicies: 200,
    maxOcrScans: 50,
    maxStorageBytes: 2 * 1024 * 1024 * 1024, // 2GB
    backupFrequencyDays: 15,
  },
  pro: {
    maxPolicies: Infinity,
    maxOcrScans: Infinity,
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10GB
    backupFrequencyDays: 7,
  },
} as const;

interface UsageData {
  policyCount: number;
  ocrScansUsed: number;
  storageUsedBytes: number;
  lastBackupAt: string | null;
}

interface UsageLimits {
  maxPolicies: number;
  maxOcrScans: number;
  maxStorageBytes: number;
  backupFrequencyDays: number;
}

interface UseUsageTrackingReturn {
  usage: UsageData;
  limits: UsageLimits;
  loading: boolean;
  canAddPolicy: boolean;
  canUseOcr: boolean;
  canUploadFile: (fileSizeBytes: number) => boolean;
  incrementOcrUsage: () => Promise<boolean>;
  addStorageUsage: (bytes: number) => Promise<boolean>;
  refreshUsage: () => Promise<void>;
  formatStorageSize: (bytes: number) => string;
  getUsagePercentage: (used: number, max: number) => number;
}

export const useUsageTracking = (): UseUsageTrackingReturn => {
  const { user } = useAuth();
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageData>({
    policyCount: 0,
    ocrScansUsed: 0,
    storageUsedBytes: 0,
    lastBackupAt: null,
  });

  const limits: UsageLimits = subscribed ? SUBSCRIPTION_LIMITS.pro : SUBSCRIPTION_LIMITS.free;
  const currentMonthYear = format(new Date(), 'yyyy-MM');

  const fetchUsage = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch policy count
      const { count: policyCount, error: policyError } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (policyError) {
        console.error('Error fetching policy count:', policyError);
      }

      // Fetch or create usage tracking record for current month
      let { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear)
        .maybeSingle();

      if (usageError && usageError.code !== 'PGRST116') {
        console.error('Error fetching usage:', usageError);
      }

      // If no record exists for this month, create one
      if (!usageData) {
        const { data: newData, error: insertError } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: user.id,
            month_year: currentMonthYear,
            ocr_scans_used: 0,
            storage_used_bytes: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating usage record:', insertError);
        } else {
          usageData = newData;
        }
      }

      setUsage({
        policyCount: policyCount || 0,
        ocrScansUsed: usageData?.ocr_scans_used || 0,
        storageUsedBytes: usageData?.storage_used_bytes || 0,
        lastBackupAt: usageData?.last_backup_at || null,
      });
    } catch (error) {
      console.error('Error in fetchUsage:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentMonthYear]);

  useEffect(() => {
    if (!subscriptionLoading) {
      fetchUsage();
    }
  }, [fetchUsage, subscriptionLoading]);

  const canAddPolicy = usage.policyCount < limits.maxPolicies;
  const canUseOcr = usage.ocrScansUsed < limits.maxOcrScans;

  const canUploadFile = (fileSizeBytes: number): boolean => {
    return usage.storageUsedBytes + fileSizeBytes <= limits.maxStorageBytes;
  };

  const incrementOcrUsage = async (): Promise<boolean> => {
    if (!user?.id || !canUseOcr) return false;

    try {
      const { error } = await supabase
        .from('usage_tracking')
        .update({ 
          ocr_scans_used: usage.ocrScansUsed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear);

      if (error) {
        console.error('Error incrementing OCR usage:', error);
        return false;
      }

      setUsage(prev => ({ ...prev, ocrScansUsed: prev.ocrScansUsed + 1 }));
      return true;
    } catch (error) {
      console.error('Error in incrementOcrUsage:', error);
      return false;
    }
  };

  const addStorageUsage = async (bytes: number): Promise<boolean> => {
    if (!user?.id || !canUploadFile(bytes)) return false;

    try {
      const { error } = await supabase
        .from('usage_tracking')
        .update({ 
          storage_used_bytes: usage.storageUsedBytes + bytes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear);

      if (error) {
        console.error('Error updating storage usage:', error);
        return false;
      }

      setUsage(prev => ({ ...prev, storageUsedBytes: prev.storageUsedBytes + bytes }));
      return true;
    } catch (error) {
      console.error('Error in addStorageUsage:', error);
      return false;
    }
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${bytes} B`;
  };

  const getUsagePercentage = (used: number, max: number): number => {
    if (max === Infinity) return 0;
    return Math.min(Math.round((used / max) * 100), 100);
  };

  return {
    usage,
    limits,
    loading: loading || subscriptionLoading,
    canAddPolicy,
    canUseOcr,
    canUploadFile,
    incrementOcrUsage,
    addStorageUsage,
    refreshUsage: fetchUsage,
    formatStorageSize,
    getUsagePercentage,
  };
};
