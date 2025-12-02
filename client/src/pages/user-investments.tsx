import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InvestmentCard } from "@/components/investment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Building2, Clock, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const investmentSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  amount: z.coerce.number().min(100, "Minimum investment is $100"),
  roi: z.coerce.number().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface Investment {
  id: string;
  projectName: string;
  amount: string;
  roi: string;
  status: "pending" | "approved" | "rejected";
  startDate: string;
  endDate: string;
}

interface PartnerProject {
  id: string;
  partnerId: string;
  externalId: string;
  name: string;
  description: string | null;
  sector: string | null;
  minAmount: string;
  maxAmount: string | null;
  currency: string;
  expectedRoi: string | null;
  duration: number | null;
  durationUnit: string | null;
  riskLevel: string | null;
  status: string;
  partnerName: string;
  partnerLogo: string | null;
  partnerSector: string | null;
}

interface PartnerInvestment {
  id: string;
  userId: string;
  partnerId: string;
  partnerProjectId: string;
  amount: string;
  commissionAmount: string;
  roiAccrued: string;
  currency: string;
  status: "pending" | "sent" | "confirmed" | "failed" | "completed";
  requestedAt: string;
  fulfilledAt: string | null;
  projectName: string;
  partnerName: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  balance: string;
}

export default function UserInvestments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPartnerInvestDialogOpen, setIsPartnerInvestDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PartnerProject | null>(null);
  const [partnerInvestAmount, setPartnerInvestAmount] = useState("");
  const { toast } = useToast();

  const { data: investmentsData, isLoading } = useQuery<{ investments: Investment[] }>({
    queryKey: ["/api/investments"],
  });

  const { data: partnerProjectsData, isLoading: isLoadingPartnerProjects } = useQuery<{ projects: PartnerProject[] }>({
    queryKey: ["/api/partner-projects"],
  });

  const { data: partnerInvestmentsData, isLoading: isLoadingPartnerInvestments } = useQuery<{ investments: PartnerInvestment[] }>({
    queryKey: ["/api/partner-investments"],
  });

  const { data: userData } = useQuery<{ user: UserData }>({
    queryKey: ["/api/auth/me"],
  });

  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      projectName: "",
      amount: 0,
      roi: 0,
      startDate: "",
      endDate: "",
    },
  });

  const createInvestmentMutation = useMutation({
    mutationFn: async (data: InvestmentFormData) => {
      return await apiRequest("POST", "/api/investments", data);
    },
    onSuccess: () => {
      toast({
        title: "Investment request submitted",
        description: "Your investment request has been submitted for admin approval",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create investment",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const createPartnerInvestmentMutation = useMutation({
    mutationFn: async (data: { partnerId: string; partnerProjectId: string; amount: number; currency: string }) => {
      return await apiRequest("POST", "/api/partner-investments", data);
    },
    onSuccess: () => {
      toast({
        title: "Partner investment submitted",
        description: "Your investment has been submitted and is being processed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partner-investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsPartnerInvestDialogOpen(false);
      setSelectedProject(null);
      setPartnerInvestAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create partner investment",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InvestmentFormData) => {
    createInvestmentMutation.mutate(data);
  };

  const handlePartnerInvest = () => {
    if (!selectedProject) return;

    const amount = parseFloat(partnerInvestAmount);
    const minAmount = parseFloat(selectedProject.minAmount);
    const maxAmount = selectedProject.maxAmount ? parseFloat(selectedProject.maxAmount) : null;

    if (isNaN(amount) || amount < minAmount) {
      toast({
        title: "Invalid amount",
        description: `Minimum investment is $${minAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (maxAmount && amount > maxAmount) {
      toast({
        title: "Invalid amount",
        description: `Maximum investment is $${maxAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    const userBalance = parseFloat(userData?.user?.balance || "0");
    if (amount > userBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this investment",
        variant: "destructive",
      });
      return;
    }

    createPartnerInvestmentMutation.mutate({
      partnerId: selectedProject.partnerId,
      partnerProjectId: selectedProject.id,
      amount,
      currency: selectedProject.currency,
    });
  };

  const openPartnerInvestDialog = (project: PartnerProject) => {
    setSelectedProject(project);
    setPartnerInvestAmount(project.minAmount);
    setIsPartnerInvestDialogOpen(true);
  };

  const investments = investmentsData?.investments || [];
  const partnerProjects = partnerProjectsData?.projects || [];
  const partnerInvestments = partnerInvestmentsData?.investments || [];
  const userBalance = parseFloat(userData?.user?.balance || "0");

  const getRiskLevelColor = (riskLevel: string | null) => {
    switch (riskLevel?.toLowerCase()) {
      case "low":
        return "bg-chart-3 text-white";
      case "medium":
        return "bg-chart-5 text-chart-5-foreground";
      case "high":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-chart-5 text-chart-5-foreground";
      case "sent":
      case "confirmed":
        return "bg-chart-2 text-white";
      case "completed":
        return "bg-chart-3 text-white";
      case "failed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const marketData = [
    { symbol: "AAPL", price: 178.25, change: 2.3 },
    { symbol: "GOOGL", price: 142.85, change: -1.2 },
    { symbol: "BTC", price: 64250, change: 5.7 },
    { symbol: "ETH", price: 3420, change: 3.4 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Investments</h1>
          <p className="text-muted-foreground">Track and manage your investment portfolio</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Market Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketData.map((item) => (
              <div key={item.symbol} className="p-3 border border-border rounded-md">
                <p className="text-sm text-muted-foreground">{item.symbol}</p>
                <p className="text-xl font-bold font-mono">${item.price.toLocaleString()}</p>
                <p className={`text-sm ${item.change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="my-investments" className="space-y-6">
        <TabsList data-testid="tabs-investments">
          <TabsTrigger value="my-investments" data-testid="tab-my-investments">My Investments</TabsTrigger>
          <TabsTrigger value="partner-projects" data-testid="tab-partner-projects">Partner Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="my-investments" className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-bold font-serif">My Investments</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-investment">
                  <Plus className="h-4 w-4 mr-2" />
                  New Investment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Request New Investment</DialogTitle>
                      <DialogDescription>
                        Submit a new investment request for admin approval
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Tech Growth Fund"
                                data-testid="input-project-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10000"
                                min="100"
                                data-testid="input-amount"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="roi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected ROI (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="5.0"
                                data-testid="input-roi"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                data-testid="input-start-date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                data-testid="input-end-date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={createInvestmentMutation.isPending}
                        data-testid="button-submit-investment"
                      >
                        {createInvestmentMutation.isPending ? "Submitting..." : "Submit Request"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : investments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  {...investment}
                  amount={parseFloat(investment.amount)}
                  roi={parseFloat(investment.roi)}
                  onView={() => console.log(`View investment ${investment.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  No investments yet. Click "New Investment" to create your first investment request.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="partner-projects" className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold font-serif mb-2">Partner Projects</h2>
            <p className="text-muted-foreground">Browse and invest in projects from our trusted partner companies</p>
          </div>

          {isLoadingPartnerProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : partnerProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerProjects.map((project) => (
                <Card key={project.id} className="hover-elevate" data-testid={`card-partner-project-${project.id}`}>
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground" data-testid={`text-partner-name-${project.id}`}>
                          {project.partnerName}
                        </span>
                      </div>
                      {project.riskLevel && (
                        <Badge 
                          className={getRiskLevelColor(project.riskLevel)}
                          data-testid={`badge-risk-${project.id}`}
                        >
                          {project.riskLevel}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg" data-testid={`text-project-name-${project.id}`}>
                      {project.name}
                    </CardTitle>
                    {project.description && (
                      <CardDescription className="line-clamp-2" data-testid={`text-description-${project.id}`}>
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {project.expectedRoi && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Expected ROI
                          </p>
                          <p className="text-lg font-bold text-chart-3" data-testid={`text-roi-${project.id}`}>
                            +{project.expectedRoi}%
                          </p>
                        </div>
                      )}
                      {project.duration && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Duration
                          </p>
                          <p className="text-lg font-bold" data-testid={`text-duration-${project.id}`}>
                            {project.duration} {project.durationUnit || "months"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Investment Range
                      </p>
                      <p className="font-mono font-medium" data-testid={`text-amount-range-${project.id}`}>
                        ${parseFloat(project.minAmount).toLocaleString()}
                        {project.maxAmount && ` - $${parseFloat(project.maxAmount).toLocaleString()}`}
                      </p>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => openPartnerInvestDialog(project)}
                      data-testid={`button-invest-${project.id}`}
                    >
                      Invest
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  No partner projects available at the moment. Check back later.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold font-serif">My Partner Investments</h3>
            {isLoadingPartnerInvestments ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : partnerInvestments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerInvestments.map((investment) => (
                  <Card key={investment.id} className="hover-elevate" data-testid={`card-partner-investment-${investment.id}`}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-investment-project-${investment.id}`}>
                          {investment.projectName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground" data-testid={`text-investment-partner-${investment.id}`}>
                          {investment.partnerName}
                        </p>
                      </div>
                      <Badge 
                        className={getStatusColor(investment.status)}
                        data-testid={`badge-investment-status-${investment.id}`}
                      >
                        {investment.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount Invested</p>
                          <p className="text-xl font-bold font-mono" data-testid={`text-investment-amount-${investment.id}`}>
                            ${parseFloat(investment.amount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Commission Paid</p>
                          <p className="font-mono" data-testid={`text-investment-commission-${investment.id}`}>
                            ${parseFloat(investment.commissionAmount).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {parseFloat(investment.roiAccrued) > 0 && (
                        <div className="flex items-center justify-between p-2 bg-chart-3/10 rounded-md">
                          <span className="text-sm">ROI Accrued</span>
                          <span className="font-bold text-chart-3" data-testid={`text-investment-roi-${investment.id}`}>
                            +${parseFloat(investment.roiAccrued).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground" data-testid={`text-investment-date-${investment.id}`}>
                        Requested: {new Date(investment.requestedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">
                    No partner investments yet. Browse partner projects above to start investing.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isPartnerInvestDialogOpen} onOpenChange={setIsPartnerInvestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Partner: {selectedProject?.partnerName}
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4 py-4">
              {selectedProject.description && (
                <div>
                  <p className="text-sm font-medium mb-1">About this project</p>
                  <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-md">
                {selectedProject.expectedRoi && (
                  <div>
                    <p className="text-xs text-muted-foreground">Expected ROI</p>
                    <p className="font-bold text-chart-3">+{selectedProject.expectedRoi}%</p>
                  </div>
                )}
                {selectedProject.duration && (
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-bold">{selectedProject.duration} {selectedProject.durationUnit || "months"}</p>
                  </div>
                )}
                {selectedProject.riskLevel && (
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Level</p>
                    <Badge className={getRiskLevelColor(selectedProject.riskLevel)}>
                      {selectedProject.riskLevel}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Investment Amount ({selectedProject.currency})</label>
                <Input
                  type="number"
                  value={partnerInvestAmount}
                  onChange={(e) => setPartnerInvestAmount(e.target.value)}
                  min={parseFloat(selectedProject.minAmount)}
                  max={selectedProject.maxAmount ? parseFloat(selectedProject.maxAmount) : undefined}
                  data-testid="input-partner-invest-amount"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Min: ${parseFloat(selectedProject.minAmount).toLocaleString()}
                  {selectedProject.maxAmount && ` | Max: $${parseFloat(selectedProject.maxAmount).toLocaleString()}`}
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-chart-5/10 rounded-md">
                <AlertTriangle className="h-4 w-4 text-chart-5" />
                <div className="text-sm">
                  <span className="font-medium">Platform Commission: </span>
                  <span>5% (${(parseFloat(partnerInvestAmount || "0") * 0.05).toFixed(2)})</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-chart-3" />
                  <span className="text-sm font-medium">Your Balance</span>
                </div>
                <span className="font-bold font-mono" data-testid="text-user-balance">
                  ${userBalance.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPartnerInvestDialogOpen(false)}
              data-testid="button-cancel-partner-invest"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePartnerInvest}
              disabled={createPartnerInvestmentMutation.isPending}
              data-testid="button-submit-partner-invest"
            >
              {createPartnerInvestmentMutation.isPending ? "Processing..." : "Confirm Investment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
