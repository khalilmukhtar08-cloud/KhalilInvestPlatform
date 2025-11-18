import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface UserData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    balance: string;
    referralCode: string | null;
    joinedAt: string;
  };
}

interface ReferralStats {
  totalReferrals: number;
  paidReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
}

interface AmbassadorStats {
  isAmbassador: boolean;
  tier?: string;
  totalSales: number;
  salesCount: number;
  totalCommission: number;
  affiliateCode?: string;
}

export default function UserProfile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: userData, isLoading: userLoading } = useQuery<UserData>({
    queryKey: ["/api/auth/me"],
  });

  const { data: referralStats, isLoading: referralLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referrals/stats"],
  });

  const { data: ambassadorStats, isLoading: ambassadorLoading } = useQuery<AmbassadorStats>({
    queryKey: ["/api/affiliates/stats"],
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (userData?.user) {
      form.reset({
        name: userData.user.name,
        email: userData.user.email,
      });
    }
  }, [userData, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      return apiRequest("PATCH", "/api/auth/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  if (userLoading || referralLoading || ambassadorLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const user = userData?.user;
  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTierBadge = (tier?: string) => {
    const colors = {
      bronze: "bg-amber-600 dark:bg-amber-700",
      silver: "bg-gray-400 dark:bg-gray-500",
      gold: "bg-yellow-500 dark:bg-yellow-600",
      platinum: "bg-blue-500 dark:bg-blue-600",
    };
    return (
      <Badge className={tier ? colors[tier as keyof typeof colors] : ""}>
        {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "None"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information and view your stats</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} data-testid="badge-role">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>

            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save">
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Account Balance: ${parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.referralCode && (
                <div className="space-y-2">
                  <Label>Your Referral Code</Label>
                  <div className="flex gap-2">
                    <Input value={user.referralCode} readOnly data-testid="input-referral-code" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode || "");
                        toast({ title: "Copied!", description: "Referral code copied to clipboard" });
                      }}
                      data-testid="button-copy-code"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold" data-testid="text-total-referrals">{referralStats?.totalReferrals || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold" data-testid="text-total-earned">
                    ${(referralStats?.totalEarned || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ambassador Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ambassadorStats?.isAmbassador ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tier</span>
                    {getTierBadge(ambassadorStats.tier)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Sales</span>
                      <span className="font-semibold" data-testid="text-ambassador-sales">
                        ${parseFloat(ambassadorStats.totalSales.toString()).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sales Count</span>
                      <span className="font-semibold" data-testid="text-ambassador-count">{ambassadorStats.salesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Commission Earned</span>
                      <span className="font-semibold" data-testid="text-ambassador-commission">
                        ${parseFloat(ambassadorStats.totalCommission.toString()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">You're not an ambassador yet</p>
                  <Button variant="outline" data-testid="button-become-ambassador">
                    Become an Ambassador
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
