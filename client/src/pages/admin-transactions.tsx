import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowUpCircle, ArrowDownCircle, Check, X, Receipt } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdraw";
  amount: string;
  status: "pending" | "completed" | "failed";
  paymentMethod: string | null;
  description: string | null;
  createdAt: string;
}

export default function AdminTransactions() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["/api/admin/transactions/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return await apiRequest("POST", `/api/admin/transactions/${transactionId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Transaction Approved",
        description: "The transaction has been approved and processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/all"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve",
        description: error.message || "Failed to approve transaction",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return await apiRequest("POST", `/api/admin/transactions/${transactionId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: "Transaction Rejected",
        description: "The transaction has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/all"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject",
        description: error.message || "Failed to reject transaction",
        variant: "destructive",
      });
    },
  });

  const formatPaymentMethod = (method: string | null) => {
    if (!method) return "N/A";
    const methods: Record<string, string> = {
      bank_transfer: "Bank Transfer",
      mobile_money: "Mobile Money",
      crypto: "Cryptocurrency",
      paypal: "PayPal",
      cash: "Cash",
    };
    return methods[method] || method;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const transactions = data?.transactions || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2 flex items-center gap-2">
          <Receipt className="h-8 w-8" />
          Transaction Approvals
        </h1>
        <p className="text-muted-foreground">Review and approve deposit and withdrawal requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
          <CardDescription>
            {transactions.length} pending transaction{transactions.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No pending transactions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === "deposit" ? (
                          <ArrowDownCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="h-5 w-5 text-red-600" />
                        )}
                        <Badge variant={transaction.type === "deposit" ? "default" : "secondary"}>
                          {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{formatPaymentMethod(transaction.paymentMethod)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(transaction.id)}
                          disabled={approveMutation.isPending}
                          data-testid={`button-approve-transaction-${transaction.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(transaction.id)}
                          disabled={rejectMutation.isPending}
                          data-testid={`button-reject-transaction-${transaction.id}`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
