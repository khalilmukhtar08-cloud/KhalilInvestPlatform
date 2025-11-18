import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, Copy, Check, Share2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Referral {
  id: string;
  referredId: string;
  referredName: string;
  referredEmail: string;
  reward: string;
  isPaid: boolean;
  createdAt: string;
}

interface ReferralData {
  referralCode: string;
  referrals: Referral[];
  stats: {
    totalReferrals: number;
    paidReferrals: number;
    pendingReferrals: number;
    totalEarned: number;
  };
}

export default function UserReferrals() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading } = useQuery<ReferralData>({
    queryKey: ["/api/referrals"],
  });

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = () => {
    if (referralData?.referralCode) {
      const link = `${window.location.origin}/?ref=${referralData.referralCode}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const stats = referralData?.stats || {
    totalReferrals: 0,
    paidReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
  };

  const referrals = referralData?.referrals || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Referral Program</h1>
        <p className="text-muted-foreground">
          Earn rewards by referring friends and family to our platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralData?.referralCode || "Loading..."}
              readOnly
              className="font-mono text-lg"
              data-testid="input-referral-code"
            />
            <Button onClick={copyReferralCode} variant="outline" data-testid="button-copy-code">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button onClick={copyReferralLink} variant="outline" data-testid="button-copy-link">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with friends. When they sign up using your code, you both earn rewards!
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-referrals">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.paidReferrals} paid, {stats.pendingReferrals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-earned">
              ${stats.totalEarned.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From referral rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-success-rate">
              {stats.totalReferrals > 0
                ? ((stats.paidReferrals / stats.totalReferrals) * 100).toFixed(0)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
              <p className="text-muted-foreground mb-4">
                Start sharing your referral code to earn rewards
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-md"
                  data-testid={`referral-item-${referral.id}`}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{referral.referredName}</h4>
                    <p className="text-sm text-muted-foreground">{referral.referredEmail}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${parseFloat(referral.reward).toFixed(2)}</p>
                      <Badge
                        variant={referral.isPaid ? "default" : "secondary"}
                        data-testid={`badge-status-${referral.id}`}
                      >
                        {referral.isPaid ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Share Your Code</h4>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral code or link with friends and family
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">They Sign Up</h4>
                <p className="text-sm text-muted-foreground">
                  When they register using your code, they get a welcome bonus
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">You Both Earn</h4>
                <p className="text-sm text-muted-foreground">
                  You receive a referral reward added to your wallet automatically
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
