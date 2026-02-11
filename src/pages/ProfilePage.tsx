import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Crown, Calendar, CreditCard, ArrowLeft, Edit2, Save, X, Settings, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UsageStatistics from "@/components/dashboard/UsageStatistics";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  plan_name: string;
  status: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  mobile_number: string | null;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, subscription_tier, subscription_end, loading: subLoading } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const profileInfo = profileData || { id: user.id, email: user.email || '', full_name: null, mobile_number: null };
      setProfile(profileInfo);
      setMobileNumber(profileInfo.mobile_number || '');

      // Fetch transactions from both subscriptions and payment_requests
      const [{ data: subscriptionData }, { data: paymentData }] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('payment_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      // Merge both sources into transactions
      const allTransactions: Transaction[] = [
        ...(subscriptionData || []).map(s => ({
          id: s.id,
          amount: s.amount,
          currency: s.currency,
          plan_name: s.plan_name,
          status: s.status,
          created_at: s.created_at,
        })),
        ...(paymentData || [])
          .filter(p => !subscriptionData?.some(s => s.razorpay_order_id === p.order_id))
          .map(p => ({
            id: p.id,
            amount: p.amount,
            currency: p.currency,
            plan_name: p.plan_type || 'Payment',
            status: p.status,
            created_at: p.created_at,
          })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateMobileNumber = (number: string): boolean => {
    // Remove all non-digit characters
    const cleanedNumber = number.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits and starts with a valid Indian mobile prefix
    if (cleanedNumber.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits');
      return false;
    }
    
    if (!/^[6-9]/.test(cleanedNumber)) {
      setMobileError('Please enter a valid Indian mobile number');
      return false;
    }
    
    setMobileError('');
    return true;
  };

  const handleMobileChange = (value: string) => {
    // Only allow digits
    const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(cleanedValue);
    
    if (cleanedValue.length > 0) {
      validateMobileNumber(cleanedValue);
    } else {
      setMobileError('');
    }
  };

  const handleSaveMobile = async () => {
    if (!user || !mobileNumber) return;

    if (!validateMobileNumber(mobileNumber)) {
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          mobile_number: mobileNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating mobile number:', error);
        toast.error('Failed to update mobile number');
        return;
      }

      setProfile(prev => prev ? { ...prev, mobile_number: mobileNumber } : null);
      setIsEditingMobile(false);
      toast.success('Mobile number updated successfully');
    } catch (error) {
      console.error('Error updating mobile number:', error);
      toast.error('Failed to update mobile number');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setMobileNumber(profile?.mobile_number || '');
    setMobileError('');
    setIsEditingMobile(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  };

  if (isLoading || subLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground text-sm sm:text-base">View and manage your account details</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/settings')}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile Information */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile?.full_name || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium">{profile?.email || user?.email}</p>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile Number</p>
                    {isEditingMobile ? (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">+91</span>
                          <Input
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) => handleMobileChange(e.target.value)}
                            placeholder="Enter 10-digit mobile"
                            className="max-w-[180px] h-9"
                            maxLength={10}
                          />
                        </div>
                        {mobileError && (
                          <p className="text-xs text-destructive">{mobileError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium">
                        {profile?.mobile_number ? `+91 ${profile.mobile_number}` : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditingMobile ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveMobile}
                        disabled={isSaving || !!mobileError || !mobileNumber}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingMobile(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-primary" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-semibold text-lg capitalize">{subscription_tier || 'Free'}</p>
                  <Badge variant={subscribed ? "default" : "secondary"}>
                    {subscribed ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              {subscribed && (
                <Crown className="h-8 w-8 text-yellow-500" />
              )}
            </div>

            {subscription_end && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium">{formatDate(subscription_end)}</p>
                </div>
              </div>
            )}

            {!subscribed && (
              <Button 
                className="w-full mt-2"
                onClick={() => navigate('/subscription')}
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <UsageStatistics />

      {/* Transaction History */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <CreditCard className={`h-4 w-4 ${
                        transaction.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.plan_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <Badge variant={transaction.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
