import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface InvestmentCardProps {
  id: string;
  projectName: string;
  amount: number;
  roi: number;
  status: "pending" | "approved" | "rejected";
  startDate: string;
  endDate: string;
  onView?: () => void;
}

export function InvestmentCard({
  id,
  projectName,
  amount,
  roi,
  status,
  startDate,
  endDate,
  onView,
}: InvestmentCardProps) {
  const statusColors = {
    pending: "bg-chart-5 text-chart-5-foreground",
    approved: "bg-chart-3 text-white",
    rejected: "bg-destructive text-destructive-foreground",
  };

  const daysRemaining = Math.max(
    0,
    Math.floor((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );
  const totalDays = Math.floor(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const progress = Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100);

  return (
    <Card className="hover-elevate" data-testid={`card-investment-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">{projectName}</CardTitle>
        <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Investment Amount</p>
            <p className="text-2xl font-bold font-mono" data-testid={`text-amount-${id}`}>${amount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">ROI</p>
            <p className={`text-2xl font-bold font-mono flex items-center gap-1 ${roi >= 0 ? 'text-chart-3' : 'text-destructive'}`} data-testid={`text-roi-${id}`}>
              {roi >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {roi >= 0 ? '+' : ''}{roi}%
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{daysRemaining} days remaining</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onView}
            data-testid={`button-view-${id}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
