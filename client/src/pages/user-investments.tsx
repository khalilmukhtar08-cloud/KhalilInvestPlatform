import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InvestmentCard } from "@/components/investment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function UserInvestments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: investmentsData, isLoading } = useQuery<{ investments: Investment[] }>({
    queryKey: ["/api/investments"],
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

  const handleSubmit = (data: InvestmentFormData) => {
    createInvestmentMutation.mutate(data);
  };

  const investments = investmentsData?.investments || [];

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

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">My Investments</h2>
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
      </div>
    </div>
  );
}
