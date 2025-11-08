import { StatCard } from "@/components/stat-card";
import { InvestmentCard } from "@/components/investment-card";
import { DollarSign, TrendingUp, Building2, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserDashboard() {
  //todo: remove mock functionality
  const stats = [
    { title: "Total Portfolio", value: "$125,430", icon: DollarSign, trend: { value: 12.5, isPositive: true } },
    { title: "Active Investments", value: "8", icon: TrendingUp, trend: { value: 3.2, isPositive: true } },
    { title: "Properties Listed", value: "3", icon: Building2, trend: { value: 0, isPositive: true } },
    { title: "Products Sold", value: "24", icon: ShoppingCart, trend: { value: 18.7, isPositive: true } },
  ];

  //todo: remove mock functionality
  const recentInvestments = [
    {
      id: "1",
      projectName: "Tech Growth Fund",
      amount: 50000,
      roi: 15.3,
      status: "approved" as const,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    {
      id: "2",
      projectName: "Green Energy ETF",
      amount: 30000,
      roi: 8.7,
      status: "approved" as const,
      startDate: "2024-02-15",
      endDate: "2025-02-15",
    },
    {
      id: "3",
      projectName: "Real Estate REIT",
      amount: 25000,
      roi: -2.1,
      status: "pending" as const,
      startDate: "2024-03-01",
      endDate: "2025-03-01",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's an overview of your investment portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart.js visualization will be implemented here showing ROI over time
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">Recent Investments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentInvestments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              {...investment}
              onView={() => console.log(`View investment ${investment.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
