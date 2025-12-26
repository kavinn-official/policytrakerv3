import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Crown, Calendar, CreditCard, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

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
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, subscription_tier, subscription_end, loading: subLoading } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      setProfile(profileData || { id: user.id, email: user.email || '', full_name: null });

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-muted-foreground text-sm sm:text-base">View your account details and subscription</p>
          </div>
        </div>
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

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Mobile Number</p>
                <p className="font-medium">{user?.phone || 'Not set'}</p>
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
