import { TrendingDown, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TodaySpendingCardProps {
  amount?: number;
  currency?: string;
}

const TodaySpendingCard = ({ 
  amount = 0, 
  currency = "USD" 
}: TodaySpendingCardProps) => {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <Card className="border-border/50 bg-card backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {today}
          </CardTitle>
          <TrendingDown className="h-5 w-5 text-destructive" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Today's Spending
          </p>
          <p className="text-4xl font-bold text-foreground">
            {formattedAmount}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaySpendingCard;

