import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Wallet, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().optional(),
});

const transferSchema = z.object({
  recipientEmail: z.string().email("Valid email is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;
type TransferFormData = z.infer<typeof transferSchema>;

interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdraw";
  amount: string;
  status: "pending" | "completed" | "failed";
  description: string | null;
  createdAt: string;
}

export default function UserWallet() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "transfer">("deposit");

  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: ["/api/wallet/balance"],
  });

  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["/api/wallet/transactions"],
  });

  const depositForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  const withdrawForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
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

  const onDeposit = (data: TransactionFormData) => {
    depositMutation.mutate(data);
  };

  const onWithdraw = (data: TransactionFormData) => {
    withdrawMutation.mutate(data);
  };

  const onTransfer = (data: TransferFormData) => {
    transferMutation.mutate(data);
  };

  const balance = (balanceData as any)?.balance || "0.00";
  const transactions = transactionsData?.transactions || [];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-8 h-8" />
        <h1 className="text-3xl font-bold">My Wallet</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
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
                variant={activeTab === "deposit" ? "default" : "outline"}
                onClick={() => setActiveTab("deposit")}
                className="flex-1"
                data-testid="button-tab-deposit"
              >
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Deposit
              </Button>
              <Button
                variant={activeTab === "withdraw" ? "default" : "outline"}
                onClick={() => setActiveTab("withdraw")}
                className="flex-1"
                data-testid="button-tab-withdraw"
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
              <Button
                variant={activeTab === "transfer" ? "default" : "outline"}
                onClick={() => setActiveTab("transfer")}
                className="flex-1"
                data-testid="button-tab-transfer"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Transfer
              </Button>
            </div>

            {activeTab === "deposit" && (
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

            {activeTab === "withdraw" && (
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

            {activeTab === "transfer" && (
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
    </div>
  );
}
