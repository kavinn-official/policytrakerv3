import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PlatformSetting {
  key: string;
  value: string;
  description: string | null;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('key, value, description');

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((s) => {
        settingsMap[s.key] = String(s.value).replace(/"/g, '');
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({ value: JSON.stringify(value) })
        .eq('key', key);

      if (error) throw error;
      toast.success(`${key} updated successfully`);
    } catch (error) {
      console.error("Error saving setting:", error);
      toast.error("Failed to save setting");
    } finally {
      setSaving(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-muted-foreground">Configure system limits and pricing</p>
        </div>
        <Button onClick={fetchSettings} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Free Plan Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Free Plan Limits</CardTitle>
            <CardDescription>Configure limits for free tier users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Policy Limit</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={settings.free_policy_limit || '200'}
                    onChange={(e) => setSettings({ ...settings, free_policy_limit: e.target.value })}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleSave('free_policy_limit', settings.free_policy_limit)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>OCR Scan Limit</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={settings.free_ocr_limit || '50'}
                    onChange={(e) => setSettings({ ...settings, free_ocr_limit: e.target.value })}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleSave('free_ocr_limit', settings.free_ocr_limit)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Storage Limit (bytes)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={settings.free_storage_limit || '2147483648'}
                    onChange={(e) => setSettings({ ...settings, free_storage_limit: e.target.value })}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleSave('free_storage_limit', settings.free_storage_limit)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: {formatBytes(Number(settings.free_storage_limit) || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pro Plan Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pro Plan Settings</CardTitle>
            <CardDescription>Configure Pro tier limits and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Storage Limit (bytes)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={settings.pro_storage_limit || '10737418240'}
                    onChange={(e) => setSettings({ ...settings, pro_storage_limit: e.target.value })}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleSave('pro_storage_limit', settings.pro_storage_limit)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: {formatBytes(Number(settings.pro_storage_limit) || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Monthly Price (₹)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={settings.monthly_price || '199'}
                    onChange={(e) => setSettings({ ...settings, monthly_price: e.target.value })}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleSave('monthly_price', settings.monthly_price)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Yearly Price (₹)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={settings.yearly_price || '1999'}
                    onChange={(e) => setSettings({ ...settings, yearly_price: e.target.value })}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleSave('yearly_price', settings.yearly_price)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;