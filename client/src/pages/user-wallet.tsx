import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Wallet, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Clock, Plus, ArrowUpDown, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(["bank_transfer", "mobile_money", "crypto", "paypal", "cash"], {
    required_error: "Please select a payment method",
  }),
  description: z.string().optional(),
});

const transferSchema = z.object({
  recipientEmail: z.string().email("Valid email is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().optional(),
});

const p2pOrderSchema = z.object({
  type: z.enum(["buy", "sell"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  price: z.coerce.number().positive("Price must be positive"),
  minLimit: z.coerce.number().positive("Minimum limit must be positive"),
  maxLimit: z.coerce.number().positive("Maximum limit must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;
type TransferFormData = z.infer<typeof transferSchema>;
type P2POrderFormData = z.infer<typeof p2pOrderSchema>;

interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdraw";
  amount: string;
  status: "pending" | "completed" | "failed";
  description: string | null;
  createdAt: string;
}

interface P2POrder {
  id: string;
  userId: string;
  type: "buy" | "sell";
  amount: string;
  price: string;
  minLimit: string;
  maxLimit: string;
  paymentMethod: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  matchedUserId: string | null;
  completedAmount: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserWallet() {
  const { toast } = useToast();
  const [mainTab, setMainTab] = useState<"wallet" | "p2p">("wallet");
  const [activeWalletTab, setActiveWalletTab] = useState<"deposit" | "withdraw" | "transfer">("deposit");
  const [selectedP2PTab, setSelectedP2PTab] = useState<"buy" | "sell" | "my-orders">("buy");
  const [isP2PDialogOpen, setIsP2PDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null);
  const [tradeAmount, setTradeAmount] = useState("");

  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: ["/api/wallet/balance"],
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });

  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["/api/wallet/transactions"],
  });

  const { data: openBuyOrders } = useQuery<{ orders: P2POrder[] }>({
    queryKey: ["/api/p2p/orders/open/buy"],
    enabled: mainTab === "p2p",
  });

  const { data: openSellOrders } = useQuery<{ orders: P2POrder[] }>({
    queryKey: ["/api/p2p/orders/open/sell"],
    enabled: mainTab === "p2p",
  });

  const { data: myOrders } = useQuery<{ orders: P2POrder[] }>({
    queryKey: ["/api/p2p/orders/my"],
    enabled: mainTab === "p2p",
  });

  const depositForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "bank_transfer",
      description: "",
    },
  });

  const withdrawForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "bank_transfer",
      description: "",
    },
  });

  const transferForm = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientEmail: "",
      amount: 0,
      description: "",
    },
  });

  const p2pForm = useForm<P2POrderFormData>({
    resolver: zodResolver(p2pOrderSchema),
    defaultValues: {
      type: "buy",
      amount: 0,
      price: 0,
      minLimit: 0,
      maxLimit: 0,
      paymentMethod: "",
    },
  });

  const depositMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      return await apiRequest("POST", "/api/wallet/deposit", data);
    },
    onSuccess: () => {
      toast({
        title: "Deposit successful",
        description: "Funds have been added to your wallet",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      depositForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Deposit failed",
        description: error.message || "Failed to deposit funds",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      return await apiRequest("POST", "/api/wallet/withdraw", data);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal successful",
        description: "Funds have been withdrawn from your wallet",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      withdrawForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error.message || "Failed to withdraw funds",
        variant: "destructive",
      });
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      return await apiRequest("POST", "/api/wallet/transfer", data);
    },
    onSuccess: (response: any) => {
      toast({
        title: "Transfer successful",
        description: response.message || "Funds have been transferred",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      transferForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Transfer failed",
        description: error.message || "Failed to transfer funds",
        variant: "destructive",
      });
    },
  });

  const createP2POrderMutation = useMutation({
    mutationFn: async (data: P2POrderFormData) => {
      return await apiRequest("POST", "/api/p2p/orders", data);
    },
    onSuccess: () => {
      toast({
        title: "Order created successfully",
        description: "Your P2P order has been created and is now open",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/open/buy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/open/sell"] });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
      setIsP2PDialogOpen(false);
      p2pForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create order",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const matchOrderMutation = useMutation({
    mutationFn: async ({ orderId, amount }: { orderId: string; amount: number }) => {
      return await apiRequest("POST", `/api/p2p/orders/${orderId}/match`, { amount });
    },
    onSuccess: () => {
      toast({
        title: "Order matched successfully",
        description: "You have successfully matched this order. Please complete the payment.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/open/buy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/open/sell"] });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
      setSelectedOrder(null);
      setTradeAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to match order",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const cancelP2POrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", `/api/p2p/orders/${orderId}/cancel`, {});
    },
    onSuccess: () => {
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/open/buy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/open/sell"] });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel order",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onDeposit = (data: TransactionFormData) => {
    depositMutation.mutate(data);
  };

  const onWithdraw = (data: TransactionFormData) => {
    withdrawMutation.mutate(data);
  };

  const onTransfer = (data: TransferFormData) => {
    transferMutation.mutate(data);
  };

  const handleP2PSubmit = (data: P2POrderFormData) => {
    if (data.minLimit > data.maxLimit) {
      toast({
        title: "Invalid limits",
        description: "Minimum limit cannot be greater than maximum limit",
        variant: "destructive",
      });
      return;
    }
    createP2POrderMutation.mutate(data);
  };

  const handleMatchOrder = (order: P2POrder) => {
    const amount = parseFloat(tradeAmount);
    if (!amount || amount < parseFloat(order.minLimit) || amount > parseFloat(order.maxLimit)) {
      toast({
        title: "Invalid amount",
        description: `Amount must be between $${order.minLimit} and $${order.maxLimit}`,
        variant: "destructive",
      });
      return;
    }
    matchOrderMutation.mutate({ orderId: order.id, amount });
  };

  const balance = (balanceData as any)?.balance || "0.00";
  const transactions = transactionsData?.transactions || [];
  const buyOrders = openBuyOrders?.orders || [];
  const sellOrders = openSellOrders?.orders || [];
  const userOrders = myOrders?.orders || [];

  const statusColors = {
    open: "bg-chart-3 text-white",
    in_progress: "bg-chart-5 text-chart-5-foreground",
    completed: "bg-chart-1 text-white",
    cancelled: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Wallet & P2P Trading</h1>
      </div>

      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "wallet" | "p2p")} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2" data-testid="tablist-wallet-main">
          <TabsTrigger value="wallet" data-testid="tab-wallet">
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="p2p" data-testid="tab-p2p">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            P2P Trading
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {balanceLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : balanceError ? (
                  <div className="text-sm text-destructive">Failed to load balance</div>
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-balance">${balance}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Total funds in your wallet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : transactionsError ? (
                  <div className="text-sm text-destructive">Failed to load</div>
                ) : (
                  <div className="text-2xl font-bold">
                    $
                    {transactions
                      .filter((t) => t.type === "deposit" && t.status === "completed")
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      .toFixed(2)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">All time deposits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : transactionsError ? (
                  <div className="text-sm text-destructive">Failed to load</div>
                ) : (
                  <div className="text-2xl font-bold">
                    $
                    {transactions
                      .filter((t) => t.type === "withdraw" && t.status === "completed")
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      .toFixed(2)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">All time withdrawals</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Manage Funds</CardTitle>
                <CardDescription>Deposit, withdraw, or transfer money</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button
                    variant={activeWalletTab === "deposit" ? "default" : "outline"}
                    onClick={() => setActiveWalletTab("deposit")}
                    className="flex-1"
                    data-testid="button-tab-deposit"
                  >
                    <ArrowDownCircle className="w-4 h-4 mr-2" />
                    Deposit
                  </Button>
                  <Button
                    variant={activeWalletTab === "withdraw" ? "default" : "outline"}
                    onClick={() => setActiveWalletTab("withdraw")}
                    className="flex-1"
                    data-testid="button-tab-withdraw"
                  >
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                  <Button
                    variant={activeWalletTab === "transfer" ? "default" : "outline"}
                    onClick={() => setActiveWalletTab("transfer")}
                    className="flex-1"
                    data-testid="button-tab-transfer"
                  >
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Transfer
                  </Button>
                </div>

                {activeWalletTab === "deposit" && (
                  <Form {...depositForm}>
                    <form onSubmit={depositForm.handleSubmit(onDeposit)} className="space-y-4">
                      <FormField
                        control={depositForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                data-testid="input-deposit-amount"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={depositForm.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-deposit-payment-method">
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={depositForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add a note..."
                                data-testid="input-deposit-description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={depositMutation.isPending}
                        data-testid="button-submit-deposit"
                      >
                        {depositMutation.isPending ? "Processing..." : "Deposit Funds"}
                      </Button>
                    </form>
                  </Form>
                )}

                {activeWalletTab === "withdraw" && (
                  <Form {...withdrawForm}>
                    <form onSubmit={withdrawForm.handleSubmit(onWithdraw)} className="space-y-4">
                      <FormField
                        control={withdrawForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                data-testid="input-withdraw-amount"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={withdrawForm.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-withdraw-payment-method">
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={withdrawForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add a note..."
                                data-testid="input-withdraw-description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={withdrawMutation.isPending}
                        data-testid="button-submit-withdraw"
                      >
                        {withdrawMutation.isPending ? "Processing..." : "Withdraw Funds"}
                      </Button>
                    </form>
                  </Form>
                )}

                {activeWalletTab === "transfer" && (
                  <Form {...transferForm}>
                    <form onSubmit={transferForm.handleSubmit(onTransfer)} className="space-y-4">
                      <FormField
                        control={transferForm.control}
                        name="recipientEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="recipient@example.com"
                                data-testid="input-recipient-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={transferForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                data-testid="input-transfer-amount"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={transferForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add a note..."
                                data-testid="input-transfer-description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={transferMutation.isPending}
                        data-testid="button-submit-transfer"
                      >
                        {transferMutation.isPending ? "Processing..." : "Transfer Funds"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Recent deposits and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start justify-between p-3 rounded-md border">
                        <div className="flex items-start gap-3 flex-1">
                          <Skeleton className="w-5 h-5 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : transactionsError ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Failed to load transaction history</p>
                    <p className="text-sm mt-2">Please try refreshing the page</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-start justify-between p-3 rounded-md border"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div className="flex items-start gap-3">
                          {transaction.type === "deposit" ? (
                            <ArrowDownCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          ) : (
                            <ArrowUpCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium capitalize">{transaction.type}</p>
                            {transaction.description && (
                              <p className="text-sm text-muted-foreground">{transaction.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(transaction.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "deposit" ? "+" : "-"}${transaction.amount}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="p2p" className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-muted-foreground">Buy and sell directly with other users</p>
            </div>
            <Dialog open={isP2PDialogOpen} onOpenChange={setIsP2PDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-p2p-order">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Form {...p2pForm}>
                  <form onSubmit={p2pForm.handleSubmit(handleP2PSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Create P2P Order</DialogTitle>
                      <DialogDescription>
                        Create a new buy or sell order for P2P trading
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <FormField
                        control={p2pForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-order-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="buy">Buy</SelectItem>
                                <SelectItem value="sell">Sell</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={p2pForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (USD)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="1000.00"
                                {...field}
                                data-testid="input-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={p2pForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per Unit</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="1.00"
                                {...field}
                                data-testid="input-price"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={p2pForm.control}
                          name="minLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Limit</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="50.00"
                                  {...field}
                                  data-testid="input-min-limit"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={p2pForm.control}
                          name="maxLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Limit</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="5000.00"
                                  {...field}
                                  data-testid="input-max-limit"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={p2pForm.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-payment-method">
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="wise">Wise</SelectItem>
                                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsP2PDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createP2POrderMutation.isPending} data-testid="button-submit-order">
                        {createP2POrderMutation.isPending ? "Creating..." : "Create Order"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={selectedP2PTab} onValueChange={(value) => setSelectedP2PTab(value as "buy" | "sell" | "my-orders")}>
            <TabsList className="grid w-full grid-cols-3" data-testid="tablist-p2p-orders">
              <TabsTrigger value="buy" data-testid="tab-buy-orders">Buy Orders</TabsTrigger>
              <TabsTrigger value="sell" data-testid="tab-sell-orders">Sell Orders</TabsTrigger>
              <TabsTrigger value="my-orders" data-testid="tab-my-orders">My Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4">
              {buyOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buyOrders.map((order) => (
                    <Card key={order.id} className="hover-elevate" data-testid={`card-buy-order-${order.id}`}>
                      <CardHeader className="gap-1">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">Buy Order</CardTitle>
                          <Badge className={statusColors[order.status]}>{order.status}</Badge>
                        </div>
                        <CardDescription>{order.paymentMethod.replace("_", " ").toUpperCase()}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-2xl font-bold">${parseFloat(order.amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price per Unit</p>
                          <p className="font-semibold">${parseFloat(order.price).toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-muted-foreground">Min</p>
                            <p className="font-medium">${parseFloat(order.minLimit).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max</p>
                            <p className="font-medium">${parseFloat(order.maxLimit).toFixed(2)}</p>
                          </div>
                        </div>
                        {selectedOrder?.id === order.id ? (
                          <div className="space-y-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter amount"
                              value={tradeAmount}
                              onChange={(e) => setTradeAmount(e.target.value)}
                              data-testid="input-trade-amount"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => handleMatchOrder(order)}
                                disabled={matchOrderMutation.isPending}
                                data-testid="button-confirm-trade"
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(null);
                                  setTradeAmount("");
                                }}
                                data-testid="button-cancel-trade"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            data-testid={`button-trade-${order.id}`}
                          >
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Trade
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No buy orders available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sell" className="space-y-4">
              {sellOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellOrders.map((order) => (
                    <Card key={order.id} className="hover-elevate" data-testid={`card-sell-order-${order.id}`}>
                      <CardHeader className="gap-1">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">Sell Order</CardTitle>
                          <Badge className={statusColors[order.status]}>{order.status}</Badge>
                        </div>
                        <CardDescription>{order.paymentMethod.replace("_", " ").toUpperCase()}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-2xl font-bold">${parseFloat(order.amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price per Unit</p>
                          <p className="font-semibold">${parseFloat(order.price).toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-muted-foreground">Min</p>
                            <p className="font-medium">${parseFloat(order.minLimit).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max</p>
                            <p className="font-medium">${parseFloat(order.maxLimit).toFixed(2)}</p>
                          </div>
                        </div>
                        {selectedOrder?.id === order.id ? (
                          <div className="space-y-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter amount"
                              value={tradeAmount}
                              onChange={(e) => setTradeAmount(e.target.value)}
                              data-testid="input-trade-amount"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => handleMatchOrder(order)}
                                disabled={matchOrderMutation.isPending}
                                data-testid="button-confirm-trade"
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(null);
                                  setTradeAmount("");
                                }}
                                data-testid="button-cancel-trade"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            data-testid={`button-trade-${order.id}`}
                          >
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Trade
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No sell orders available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="my-orders" className="space-y-4">
              {userOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userOrders.map((order) => (
                    <Card key={order.id} data-testid={`card-my-order-${order.id}`}>
                      <CardHeader className="gap-1">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{order.type === "buy" ? "Buy" : "Sell"} Order</CardTitle>
                          <Badge className={statusColors[order.status]}>{order.status}</Badge>
                        </div>
                        <CardDescription>{order.paymentMethod.replace("_", " ").toUpperCase()}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-2xl font-bold">${parseFloat(order.amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price per Unit</p>
                          <p className="font-semibold">${parseFloat(order.price).toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-muted-foreground">Min</p>
                            <p className="font-medium">${parseFloat(order.minLimit).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max</p>
                            <p className="font-medium">${parseFloat(order.maxLimit).toFixed(2)}</p>
                          </div>
                        </div>
                        {order.status === "open" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => cancelP2POrderMutation.mutate(order.id)}
                            disabled={cancelP2POrderMutation.isPending}
                            data-testid={`button-cancel-order-${order.id}`}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Order
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">
                      No orders yet. Click "Create Order" to start P2P trading.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
