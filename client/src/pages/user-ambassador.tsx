import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, TrendingUp, Package, DollarSign, Users, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";

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

export default function UserAmbassador() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: ambassadorData, isLoading } = useQuery<AmbassadorData>({
    queryKey: ["/api/affiliates/me"],
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

  const copyAffiliateCode = () => {
    if (ambassadorData?.ambassador?.affiliateCode) {
      navigator.clipboard.writeText(ambassadorData.ambassador.affiliateCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Affiliate code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const isAmbassador = ambassadorData?.isAmbassador || false;
  const ambassador = ambassadorData?.ambassador;
  const sales = ambassadorData?.sales || [];

  if (!isAmbassador) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Ambassador Program</h1>
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
      </div>
    );
  }

  const currentTier = ambassador?.tier || "bronze";
  const nextTierKey = currentTier === "bronze" ? "silver" : currentTier === "silver" ? "gold" : currentTier === "gold" ? "platinum" : null;
  const nextTier = nextTierKey ? tierInfo[nextTierKey as keyof typeof tierInfo] : null;
  const salesNeeded = nextTier ? nextTier.minSales - (ambassador?.salesCount || 0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Ambassador Dashboard</h1>
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
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
    </div>
  );
}
