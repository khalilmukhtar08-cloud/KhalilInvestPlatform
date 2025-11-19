import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, Copy, Check, Share2, TrendingUp, Award, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

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

interface AffiliateSale {
  id: string;
  productId: string;
  productName: string;
  amount: string;
  commission: string;
  isPaid: boolean;
  createdAt: string;
}

interface AmbassadorData {
  isAmbassador: boolean;
  ambassador?: {
    id: string;
    affiliateCode: string;
    tier: string;
    totalSales: string;
    salesCount: number;
    totalCommission: string;
    isActive: boolean;
    createdAt: string;
  };
  sales: AffiliateSale[];
}

const tierInfo = {
  bronze: {
    name: "Bronze",
    color: "bg-amber-600 dark:bg-amber-700",
    minSales: 0,
    commission: "5%",
  },
  silver: {
    name: "Silver",
    color: "bg-gray-400 dark:bg-gray-500",
    minSales: 10,
    commission: "7.5%",
  },
  gold: {
    name: "Gold",
    color: "bg-yellow-500 dark:bg-yellow-600",
    minSales: 25,
    commission: "10%",
  },
  platinum: {
    name: "Platinum",
    color: "bg-blue-500 dark:bg-blue-600",
    minSales: 50,
    commission: "15%",
  },
};

export default function UserReferrals() {
  const { toast } = useToast();
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);
  const [mainTab, setMainTab] = useState<"referrals" | "ambassador">("referrals");

  const { data: referralData, isLoading: referralLoading } = useQuery<ReferralData>({
    queryKey: ["/api/referrals"],
  });

  const { data: ambassadorData, isLoading: ambassadorLoading } = useQuery<AmbassadorData>({
    queryKey: ["/api/affiliates/me"],
    enabled: mainTab === "ambassador",
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/affiliates/apply");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates/stats"] });
      toast({
        title: "Success",
        description: "You are now an ambassador!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join ambassador program",
        variant: "destructive",
      });
    },
  });

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      setCopiedReferral(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopiedReferral(false), 2000);
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

  const copyAffiliateCode = () => {
    if (ambassadorData?.ambassador?.affiliateCode) {
      navigator.clipboard.writeText(ambassadorData.ambassador.affiliateCode);
      setCopiedAffiliate(true);
      toast({
        title: "Copied!",
        description: "Affiliate code copied to clipboard",
      });
      setTimeout(() => setCopiedAffiliate(false), 2000);
    }
  };

  const stats = referralData?.stats || {
    totalReferrals: 0,
    paidReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
  };

  const referrals = referralData?.referrals || [];
  const isAmbassador = ambassadorData?.isAmbassador || false;
  const ambassador = ambassadorData?.ambassador;
  const sales = ambassadorData?.sales || [];

  const currentTier = ambassador?.tier || "bronze";
  const nextTierKey = currentTier === "bronze" ? "silver" : currentTier === "silver" ? "gold" : currentTier === "gold" ? "platinum" : null;
  const nextTier = nextTierKey ? tierInfo[nextTierKey as keyof typeof tierInfo] : null;
  const salesNeeded = nextTier ? nextTier.minSales - (ambassador?.salesCount || 0) : 0;

  if (referralLoading && ambassadorLoading) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Referrals & Ambassador</h1>
      </div>

      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "referrals" | "ambassador")} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referrals" data-testid="tab-referrals">
            <UserPlus className="w-4 h-4 mr-2" />
            Referral Program
          </TabsTrigger>
          <TabsTrigger value="ambassador" data-testid="tab-ambassador">
            <Award className="w-4 h-4 mr-2" />
            Ambassador Program
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-6">
          <div>
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
                  {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
        </TabsContent>

        <TabsContent value="ambassador" className="space-y-6">
          {!isAmbassador ? (
            <>
              <div>
                <p className="text-muted-foreground">
                  Join our ambassador program and earn commission on product sales
                </p>
              </div>

              <Card className="text-center py-12">
                <CardContent>
                  <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Become an Ambassador</h2>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Promote products from our e-commerce platform and earn competitive commissions on
                    every sale. The more you sell, the higher your tier and commission rate!
                  </p>
                  <Button
                    onClick={() => applyMutation.mutate()}
                    disabled={applyMutation.isPending}
                    size="lg"
                    data-testid="button-apply"
                  >
                    {applyMutation.isPending ? "Applying..." : "Join Ambassador Program"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ambassador Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(tierInfo).map(([key, tier]) => (
                      <div key={key} className="p-4 border rounded-md space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{tier.name}</h3>
                          <Badge className={tier.color}>{tier.name}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Minimum {tier.minSales} sales required
                        </p>
                        <p className="text-lg font-bold">Commission: {tier.commission}</p>
                      </div>
                    ))}
                  </div>
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
                        <h4 className="font-semibold">Join the Program</h4>
                        <p className="text-sm text-muted-foreground">
                          Apply to become an ambassador and get your unique affiliate code
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Promote Products</h4>
                        <p className="text-sm text-muted-foreground">
                          Share your affiliate code with your audience and promote products
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Earn Commissions</h4>
                        <p className="text-sm text-muted-foreground">
                          Earn commission on every sale made with your code. Higher tiers = higher rates!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div>
                <p className="text-muted-foreground">Track your sales and commission earnings</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Your Affiliate Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={ambassador?.affiliateCode || ""}
                      readOnly
                      className="font-mono text-lg"
                      data-testid="input-affiliate-code"
                    />
                    <Button onClick={copyAffiliateCode} variant="outline" data-testid="button-copy-code">
                      {copiedAffiliate ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share this code with customers. When they purchase products using your code, you earn
                    commission!
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Badge className={tierInfo[currentTier as keyof typeof tierInfo].color} data-testid="badge-tier">
                      {tierInfo[currentTier as keyof typeof tierInfo].name}
                    </Badge>
                    {nextTier && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {salesNeeded} more sale{salesNeeded !== 1 ? "s" : ""} to {nextTier.name}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-sales">
                      ${parseFloat(ambassador?.totalSales || "0").toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ambassador?.salesCount || 0} products sold
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-commission">
                      ${parseFloat(ambassador?.totalCommission || "0").toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-commission-rate">
                      {tierInfo[currentTier as keyof typeof tierInfo].commission}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Per sale</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  {sales.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
                      <p className="text-muted-foreground">
                        Start promoting products to earn commissions
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sales.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between p-4 border rounded-md"
                          data-testid={`sale-item-${sale.id}`}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">{sale.productName}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Sale Amount</p>
                              <p className="font-semibold">${parseFloat(sale.amount).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Commission</p>
                              <p className="font-semibold text-green-600 dark:text-green-500">
                                ${parseFloat(sale.commission).toFixed(2)}
                              </p>
                            </div>
                            <Badge
                              variant={sale.isPaid ? "default" : "secondary"}
                              data-testid={`badge-payment-${sale.id}`}
                            >
                              {sale.isPaid ? "Paid" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tier Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(tierInfo).map(([key, tier]) => {
                      const isCurrentTier = key === currentTier;
                      return (
                        <div
                          key={key}
                          className={`p-4 border rounded-md space-y-2 ${isCurrentTier ? "border-primary bg-primary/5" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{tier.name}</h3>
                            <Badge className={tier.color}>{tier.name}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Minimum {tier.minSales} sales required
                          </p>
                          <p className="text-lg font-bold">Commission: {tier.commission}</p>
                          {isCurrentTier && (
                            <Badge variant="outline" className="mt-2">
                              Current Tier
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}
