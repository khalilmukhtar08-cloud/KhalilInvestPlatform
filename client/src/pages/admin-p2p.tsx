import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

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

export default function AdminP2P() {
  const { toast } = useToast();

  const { data: ordersData, isLoading } = useQuery<{ orders: P2POrder[] }>({
    queryKey: ["/api/p2p/orders"],
  });

  const completeOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", `/api/p2p/orders/${orderId}/complete`, {});
    },
    onSuccess: () => {
      toast({
        title: "Order completed",
        description: "The P2P order has been marked as completed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to complete order",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", `/api/p2p/orders/${orderId}/cancel`, {});
    },
    onSuccess: () => {
      toast({
        title: "Order cancelled",
        description: "The P2P order has been cancelled",
      });
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

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("DELETE", `/api/p2p/orders/${orderId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Order deleted",
        description: "The P2P order has been permanently deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete order",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const orders = ordersData?.orders || [];

  const stats = [
    {
      title: "Total Orders",
      value: orders.length.toString(),
    },
    {
      title: "Open Orders",
      value: orders.filter((o) => o.status === "open").length.toString(),
    },
    {
      title: "In Progress",
      value: orders.filter((o) => o.status === "in_progress").length.toString(),
    },
    {
      title: "Completed",
      value: orders.filter((o) => o.status === "completed").length.toString(),
    },
    {
      title: "Buy Orders",
      value: orders.filter((o) => o.type === "buy").length.toString(),
    },
    {
      title: "Sell Orders",
      value: orders.filter((o) => o.type === "sell").length.toString(),
    },
  ];

  const statusColors = {
    open: "bg-chart-3 text-white",
    in_progress: "bg-chart-5 text-chart-5-foreground",
    completed: "bg-chart-1 text-white",
    cancelled: "bg-destructive text-destructive-foreground",
  };

  const typeColors = {
    buy: "bg-chart-2 text-white",
    sell: "bg-chart-4 text-white",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading P2P orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">P2P Management</h1>
        <p className="text-muted-foreground">Monitor and manage all P2P trading orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="gap-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All P2P Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Limits</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell>
                        <Badge className={typeColors[order.type]}>
                          {order.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${parseFloat(order.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>${parseFloat(order.price).toFixed(2)}</TableCell>
                      <TableCell className="text-sm">
                        ${parseFloat(order.minLimit).toFixed(0)} - ${parseFloat(order.maxLimit).toFixed(0)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {order.paymentMethod.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completeOrderMutation.mutate(order.id)}
                              disabled={completeOrderMutation.isPending}
                              data-testid={`button-complete-${order.id}`}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {order.status === "open" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelOrderMutation.mutate(order.id)}
                              disabled={cancelOrderMutation.isPending}
                              data-testid={`button-cancel-${order.id}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {(order.status === "completed" || order.status === "cancelled") && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteOrderMutation.mutate(order.id)}
                              disabled={deleteOrderMutation.isPending}
                              data-testid={`button-delete-${order.id}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No P2P orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
