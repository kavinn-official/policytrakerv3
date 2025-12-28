import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface PushNotificationToggleProps {
  variant?: 'card' | 'inline';
}

export const PushNotificationToggle = ({ variant = 'card' }: PushNotificationToggleProps) => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    if (variant === 'inline') {
      return (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <BellOff className="h-4 w-4" />
          <span>Push notifications not supported</span>
        </div>
      );
    }
    
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 py-4">
          <BellOff className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Push Notifications Unavailable</p>
            <p className="text-xs text-muted-foreground">
              Your browser doesn't support push notifications. Try installing the app as a PWA.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Bell className={`h-4 w-4 ${isSubscribed ? 'text-primary' : 'text-muted-foreground'}`} />
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={isLoading || permission === 'denied'}
            />
            <span className="text-sm">
              {isSubscribed ? 'Notifications on' : 'Notifications off'}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get real-time alerts when policies are about to expire
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {isSubscribed ? 'Notifications Enabled' : 'Enable Notifications'}
            </p>
            <p className="text-xs text-muted-foreground">
              {permission === 'denied' 
                ? 'Please enable notifications in browser settings' 
                : 'Receive alerts for expiring policies'
              }
            </p>
          </div>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={permission === 'denied'}
            />
          )}
        </div>
        
        {isSubscribed && (
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            className="w-full"
          >
            Send Test Notification
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationToggle;
