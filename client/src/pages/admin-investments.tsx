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
import { Check, X } from "lucide-react";

export default function AdminInvestments() {
  //todo: remove mock functionality
  const investments = [
    { id: "1", user: "John Doe", projectName: "Tech Growth Fund", amount: 50000, roi: 15.3, status: "pending", requestedAt: "2024-03-15" },
    { id: "2", user: "Jane Smith", projectName: "Green Energy ETF", amount: 30000, roi: 8.7, status: "pending", requestedAt: "2024-03-14" },
    { id: "3", user: "Mike Johnson", projectName: "Real Estate REIT", amount: 25000, roi: 0, status: "pending", requestedAt: "2024-03-13" },
    { id: "4", user: "Sarah Williams", projectName: "Crypto Portfolio", amount: 15000, roi: 22.8, status: "approved", requestedAt: "2024-03-12" },
    { id: "5", user: "Tom Brown", projectName: "Blue Chip Stocks", amount: 40000, roi: 6.5, status: "approved", requestedAt: "2024-03-11" },
  ];

  const statusColors = {
    pending: "bg-chart-5 text-chart-5-foreground",
    approved: "bg-chart-3 text-white",
    rejected: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Investment Management</h1>
        <p className="text-muted-foreground">Approve and manage investment requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono">
              {investments.filter(i => i.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Investment Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-accent">
              ${investments.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-chart-3">
              {(investments.reduce((sum, i) => sum + i.roi, 0) / investments.length).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Investment Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expected ROI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">{investment.user}</TableCell>
                  <TableCell>{investment.projectName}</TableCell>
                  <TableCell className="font-mono">${investment.amount.toLocaleString()}</TableCell>
                  <TableCell className="font-mono">{investment.roi}%</TableCell>
                  <TableCell>
                    <Badge className={statusColors[investment.status as keyof typeof statusColors]}>
                      {investment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(investment.requestedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {investment.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-approve-${investment.id}`}
                        >
                          <Check className="h-4 w-4 text-chart-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-reject-${investment.id}`}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" data-testid={`button-view-${investment.id}`}>
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
