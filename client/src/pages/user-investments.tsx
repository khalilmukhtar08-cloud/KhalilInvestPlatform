import { useState } from "react";
import { InvestmentCard } from "@/components/investment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function UserInvestments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //todo: remove mock functionality
  const investments = [
    { id: "1", projectName: "Tech Growth Fund", amount: 50000, roi: 15.3, status: "approved" as const, startDate: "2024-01-01", endDate: "2024-12-31" },
    { id: "2", projectName: "Green Energy ETF", amount: 30000, roi: 8.7, status: "approved" as const, startDate: "2024-02-15", endDate: "2025-02-15" },
    { id: "3", projectName: "Real Estate REIT", amount: 25000, roi: -2.1, status: "pending" as const, startDate: "2024-03-01", endDate: "2025-03-01" },
    { id: "4", projectName: "Crypto Portfolio", amount: 15000, roi: 22.8, status: "approved" as const, startDate: "2024-01-15", endDate: "2024-07-15" },
    { id: "5", projectName: "Blue Chip Stocks", amount: 40000, roi: 6.5, status: "approved" as const, startDate: "2024-02-01", endDate: "2025-02-01" },
    { id: "6", projectName: "Emerging Markets", amount: 20000, roi: 0, status: "rejected" as const, startDate: "2024-03-15", endDate: "2025-03-15" },
  ];

  //todo: remove mock functionality
  const marketData = [
    { symbol: "AAPL", price: 178.25, change: 2.3 },
    { symbol: "GOOGL", price: 142.85, change: -1.2 },
    { symbol: "BTC", price: 64250, change: 5.7 },
    { symbol: "ETH", price: 3420, change: 3.4 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New investment request submitted");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
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
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Request New Investment</DialogTitle>
                <DialogDescription>
                  Submit a new investment request for admin approval
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Investment Project</Label>
                  <Select>
                    <SelectTrigger id="project" data-testid="select-project">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Tech Growth Fund</SelectItem>
                      <SelectItem value="green">Green Energy ETF</SelectItem>
                      <SelectItem value="realestate">Real Estate REIT</SelectItem>
                      <SelectItem value="crypto">Crypto Portfolio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="10000"
                    min="1000"
                    data-testid="input-amount"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" data-testid="button-submit-investment">
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((investment) => (
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
