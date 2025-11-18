import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/stat-card";
import { InvestmentCard } from "@/components/investment-card";
import { DollarSign, TrendingUp, Building2, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Investment {
  id: string;
  projectName: string;
  amount: string;
  roi: string;
  status: "pending" | "approved" | "rejected";
  startDate: string;
  endDate: string;
}

interface Property {
  id: string;
  status: string;
}

interface Product {
  id: string;
  status: string;
}

export default function UserDashboard() {
  const { data: investmentsData, isLoading: investmentsLoading } = useQuery<{ investments: Investment[] }>({
    queryKey: ["/api/investments"],
  });

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery<{ properties: Property[] }>({
    queryKey: ["/api/properties"],
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/products"],
  });

  const { data: walletData } = useQuery({
    queryKey: ["/api/wallet/balance"],
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<{ data: any[] }>({
    queryKey: ["/api/analytics/portfolio"],
  });

  const investments = investmentsData?.investments || [];
  const properties = propertiesData?.properties || [];
  const products = productsData?.products || [];
  const walletBalance = parseFloat((walletData as any)?.balance || "0");

  const totalPortfolio = investments
    .filter((inv) => inv.status === "approved")
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0) + walletBalance;

  const activeInvestments = investments.filter((inv) => inv.status === "approved").length;

  const propertiesListed = properties.filter((prop) => prop.status === "approved" || prop.status === "pending").length;

  const productsSold = products.filter((prod) => prod.status === "active").length;

  const stats = [
    {
      title: "Total Portfolio",
      value: `$${totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Active Investments",
      value: activeInvestments.toString(),
      icon: TrendingUp,
      trend: { value: 3.2, isPositive: true },
    },
    {
      title: "Properties Listed",
      value: propertiesListed.toString(),
      icon: Building2,
      trend: { value: 0, isPositive: true },
    },
    {
      title: "Products Active",
      value: productsSold.toString(),
      icon: ShoppingCart,
      trend: { value: 18.7, isPositive: true },
    },
  ];

  const recentInvestments = investments
    .filter((inv) => inv.status === "approved")
    .slice(0, 3);

  const isLoading = investmentsLoading || propertiesLoading || productsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's an overview of your investment portfolio</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : analyticsData?.data && analyticsData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Investments"
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Wallet Balance"
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  name="Total Portfolio"
                  dot={{ fill: 'hsl(var(--chart-3))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available yet. Start investing to see your portfolio performance!
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">Recent Investments</h2>
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
        ) : recentInvestments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentInvestments.map((investment) => (
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
              <p className="text-muted-foreground">No approved investments yet. Start investing to see them here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
