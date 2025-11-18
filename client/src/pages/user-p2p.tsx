import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, ArrowUpDown, Filter, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const p2pOrderSchema = z.object({
  type: z.enum(["buy", "sell"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  price: z.coerce.number().positive("Price must be positive"),
  minLimit: z.coerce.number().positive("Minimum limit must be positive"),
  maxLimit: z.coerce.number().positive("Maximum limit must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type P2POrderFormData = z.infer<typeof p2pOrderSchema>;

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

export default function UserP2P() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"buy" | "sell">("buy");
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null);
  const [tradeAmount, setTradeAmount] = useState("");

  const { data: openBuyOrders } = useQuery<{ orders: P2POrder[] }>({
    queryKey: ["/api/p2p/orders/open/buy"],
  });

  const { data: openSellOrders } = useQuery<{ orders: P2POrder[] }>({
    queryKey: ["/api/p2p/orders/open/sell"],
  });

  const { data: myOrders } = useQuery<{ orders: P2POrder[] }>({
    queryKey: ["/api/p2p/orders/my"],
  });

  const form = useForm<P2POrderFormData>({
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

  const createOrderMutation = useMutation({
    mutationFn: async (data: P2POrderFormData) => {
      return await apiRequest("POST", "/api/p2p/orders", data);
    },
    onSuccess: () => {
      toast({
        title: "Order created successfully",
        description: "Your P2P order has been created and is now open",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
      setIsDialogOpen(false);
      form.reset();
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

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", `/api/p2p/orders/${orderId}/cancel`, {});
    },
    onSuccess: () => {
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully",
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

  const handleSubmit = (data: P2POrderFormData) => {
    if (data.minLimit > data.maxLimit) {
      toast({
        title: "Invalid limits",
        description: "Minimum limit cannot be greater than maximum limit",
        variant: "destructive",
      });
      return;
    }
    createOrderMutation.mutate(data);
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

  const statusColors = {
    open: "bg-chart-3 text-white",
    in_progress: "bg-chart-5 text-chart-5-foreground",
    completed: "bg-chart-1 text-white",
    cancelled: "bg-destructive text-destructive-foreground",
  };

  const buyOrders = openBuyOrders?.orders || [];
  const sellOrders = openSellOrders?.orders || [];
  const userOrders = myOrders?.orders || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">P2P Trading</h1>
          <p className="text-muted-foreground">Buy and sell directly with other users</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-p2p-order">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogHeader>
                  <DialogTitle>Create P2P Order</DialogTitle>
                  <DialogDescription>
                    Create a new buy or sell order for P2P trading
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                    control={form.control}
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
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createOrderMutation.isPending} data-testid="button-submit-order">
                    {createOrderMutation.isPending ? "Creating..." : "Create Order"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "buy" | "sell")}>
        <TabsList className="grid w-full grid-cols-3">
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
                        onClick={() => cancelOrderMutation.mutate(order.id)}
                        disabled={cancelOrderMutation.isPending}
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
    </div>
  );
}
