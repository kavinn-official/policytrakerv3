import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Bell, 
  Clock, 
  Calendar, 
  ArrowLeft,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Mail,
  XCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import MonthlyPremiumReport from "@/components/MonthlyPremiumReport";

interface UserSettings {
  id: string;
  user_id: string;
  auto_reminders_enabled: boolean | null;
  reminder_days: number[];
  reminder_frequency: string;
  reminder_time: string;
  custom_reminder_time: string;
  cron_job_status: string;
  last_cron_execution: string | null;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Email verification state
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  // Form state
  const [autoRemindersEnabled, setAutoRemindersEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState<number[]>([7, 15, 30]);
  const [reminderFrequency, setReminderFrequency] = useState("custom");
  const [reminderTime, setReminderTime] = useState("morning");
  const [customReminderTime, setCustomReminderTime] = useState("09:00");
  const [cronJobStatus, setCronJobStatus] = useState("inactive");

  useEffect(() => {
    if (user) {
      fetchSettings();
      checkEmailVerification();
    }
  }, [user]);

  const checkEmailVerification = async () => {
    if (!user) return;
    
    setIsCheckingEmail(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        setUserEmail(authUser.email);
        setEmailVerified(authUser.email_confirmed_at !== null);
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.email && profile.email !== authUser?.email) {
        setUserEmail(profile.email);
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
        return;
      }

      if (data) {
        setSettings(data as unknown as UserSettings);
        setAutoRemindersEnabled(data.auto_reminders_enabled || false);
        setReminderDays(Array.isArray(data.reminder_days) ? data.reminder_days as number[] : [7, 15, 30]);
        setReminderFrequency((data as any).reminder_frequency || "custom");
        setReminderTime((data as any).reminder_time || "morning");
        setCustomReminderTime((data as any).custom_reminder_time?.slice(0, 5) || "09:00");
        setCronJobStatus((data as any).cron_job_status || "inactive");
      } else {
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            auto_reminders_enabled: false,
            reminder_days: [7, 15, 30],
            reminder_frequency: 'custom',
            reminder_time: 'morning',
            custom_reminder_time: '09:00:00',
            cron_job_status: 'inactive'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating settings:', insertError);
        } else if (newData) {
          setSettings(newData as unknown as UserSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const updateData = {
        auto_reminders_enabled: autoRemindersEnabled,
        reminder_days: reminderDays,
        reminder_frequency: reminderFrequency,
        reminder_time: reminderTime,
        custom_reminder_time: customReminderTime + ':00',
        cron_job_status: cronJobStatus,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving settings:', error);
        toast.error('Failed to save settings');
        return;
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReminderDayToggle = (day: number) => {
    if (reminderDays.includes(day)) {
      setReminderDays(reminderDays.filter(d => d !== day));
    } else {
      setReminderDays([...reminderDays, day].sort((a, b) => a - b));
    }
  };

  const handleFrequencyChange = (value: string) => {
    setReminderFrequency(value);
    if (value === 'daily') {
      setReminderDays([1, 2, 3, 4, 5, 6, 7]);
    } else if (value === 'weekly') {
      setReminderDays([7, 14, 21, 28]);
    }
  };

  const getTimeLabel = (time: string) => {
    switch (time) {
      case 'morning': return '9:00 AM';
      case 'afternoon': return '2:00 PM';
      case 'evening': return '6:00 PM';
      default: return customReminderTime;
    }
  };

  const formatLastExecution = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground truncate">Settings</h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Configure your preferences</p>
          </div>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving} 
          className="gap-2 w-full sm:w-auto"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Email Notification Status */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Email Notifications
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Check if your email is configured to receive policy expiry notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCheckingEmail ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking email status...
              </div>
            ) : (
              <>
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm font-medium">Registered Email</span>
                    <span className="text-xs sm:text-sm text-muted-foreground break-all">{userEmail || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium">Email Status</span>
                    {emailVerified === true ? (
                      <Badge variant="default" className="bg-green-600 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : emailVerified === false ? (
                      <Badge variant="destructive" className="text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Unknown</Badge>
                    )}
                  </div>
                </div>
                
                {emailVerified === true ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-green-800 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Your email is verified and ready to receive policy expiry notifications.</span>
                    </p>
                  </div>
                ) : emailVerified === false ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-amber-800 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Please verify your email to receive notifications. Check your inbox for a verification link.</span>
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Push Notifications
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Enable browser push notifications for real-time policy expiry alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PushNotificationToggle />
          </CardContent>
        </Card>

        {/* Monthly Premium Report */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Monthly Premium Report
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Generate and download monthly reports of all policies with net premiums
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyPremiumReport />
          </CardContent>
        </Card>

        {/* WhatsApp Reminders Toggle */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              WhatsApp Reminders
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Enable or disable automated WhatsApp reminders for policy renewals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-3">
              <div className="space-y-1 min-w-0">
                <Label htmlFor="auto-reminders" className="font-medium text-sm">Enable Auto Reminders</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Automatically send WhatsApp reminders for expiring policies
                </p>
              </div>
              <Switch
                id="auto-reminders"
                checked={autoRemindersEnabled}
                onCheckedChange={setAutoRemindersEnabled}
              />
            </div>

            {autoRemindersEnabled && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="font-medium text-sm">Reminder Frequency</Label>
                  <Select value={reminderFrequency} onValueChange={handleFrequencyChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reminderFrequency === 'custom' && (
                  <div className="space-y-3">
                    <Label className="font-medium text-sm">Reminder Days (before expiry)</Label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 3, 5, 7, 10, 15, 20, 30, 45, 60].map((day) => (
                        <Button
                          key={day}
                          variant={reminderDays.includes(day) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleReminderDayToggle(day)}
                          className="min-w-[40px] sm:min-w-[50px] text-xs sm:text-sm"
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Selected: {reminderDays.length > 0 ? reminderDays.join(', ') + ' days' : 'None'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminder Time Settings */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Reminder Time
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choose when you want to receive WhatsApp reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <Label className="font-medium text-sm">Preferred Time</Label>
              <Select value={reminderTime} onValueChange={setReminderTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9:00 AM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (2:00 PM)</SelectItem>
                  <SelectItem value="evening">Evening (6:00 PM)</SelectItem>
                  <SelectItem value="custom">Custom Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reminderTime === 'custom' && (
              <div className="space-y-2">
                <Label className="font-medium text-sm">Custom Time</Label>
                <Input
                  type="time"
                  value={customReminderTime}
                  onChange={(e) => setCustomReminderTime(e.target.value)}
                  className="w-full sm:max-w-[200px]"
                />
              </div>
            )}

            <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <p className="text-xs sm:text-sm font-medium">
                Reminders will be sent at: <span className="text-primary">{getTimeLabel(reminderTime)}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cron Job Status */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Automation Status
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Monitor the status of automated reminder system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Status</span>
                <Badge 
                  variant={cronJobStatus === 'active' ? 'default' : 'secondary'}
                  className={cronJobStatus === 'active' ? 'bg-green-600 text-xs' : 'text-xs'}
                >
                  {cronJobStatus === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-xs sm:text-sm font-medium">Last Execution</span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {formatLastExecution(settings?.last_cron_execution || null)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-blue-800">
                The automation system runs daily to check for expiring policies and send reminders based on your settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
