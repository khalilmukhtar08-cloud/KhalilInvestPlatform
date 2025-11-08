import { StatCard } from "@/components/stat-card";
import { Users, TrendingUp, Building2, ShoppingCart, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  //todo: remove mock functionality
  const stats = [
    { title: "Total Users", value: "1,247", icon: Users, trend: { value: 15.3, isPositive: true } },
    { title: "Total Investments", value: "$8.5M", icon: TrendingUp, trend: { value: 23.1, isPositive: true } },
    { title: "ROI Generated", value: "$1.2M", icon: DollarSign, trend: { value: 18.7, isPositive: true } },
    { title: "Active Listings", value: "342", icon: Building2, trend: { value: 7.4, isPositive: true } },
    { title: "Products Sold", value: "2,845", icon: ShoppingCart, trend: { value: 12.5, isPositive: true } },
    { title: "Platform Activity", value: "94%", icon: Activity, trend: { value: 3.2, isPositive: true } },
  ];

  //todo: remove mock functionality
  const recentActivity = [
    { user: "John Doe", action: "New Investment Request", amount: "$50,000", status: "pending", time: "5 min ago" },
    { user: "Jane Smith", action: "Property Listed", amount: "$450,000", status: "pending", time: "12 min ago" },
    { user: "Mike Johnson", action: "Product Added", amount: "$299", status: "approved", time: "1 hour ago" },
    { user: "Sarah Williams", action: "Investment Approved", amount: "$30,000", status: "approved", time: "2 hours ago" },
    { user: "Tom Brown", action: "Property Promoted", amount: "$25", status: "approved", time: "3 hours ago" },
  ];

  const statusColors = {
    pending: "bg-chart-5 text-chart-5-foreground",
    approved: "bg-chart-3 text-white",
    rejected: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Admin Overview</h1>
        <p className="text-muted-foreground">Platform analytics and recent activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart.js revenue chart will be implemented here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart.js user growth chart will be implemented here
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{activity.user}</TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell className="font-mono">{activity.amount}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[activity.status as keyof typeof statusColors]}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{activity.time}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" data-testid={`button-view-${index}`}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
