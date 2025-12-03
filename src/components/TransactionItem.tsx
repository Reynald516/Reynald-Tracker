import { ShoppingBag, Coffee, Utensils, Car, Home, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  timestamp: Date;
}

interface TransactionItemProps {
  transaction: Transaction;
}

const categoryIcons: Record<string, typeof ShoppingBag> = {
  shopping: ShoppingBag,
  food: Utensils,
  coffee: Coffee,
  transport: Car,
  utilities: Home,
  other: MoreHorizontal,
};

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const Icon = categoryIcons[transaction.category.toLowerCase()] || MoreHorizontal;
  
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: transaction.currency,
  }).format(transaction.amount);

  const timeAgo = formatTimeAgo(transaction.timestamp);

  return (
    <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {transaction.merchant}
          </p>
          <p className="text-sm text-muted-foreground">
            {timeAgo}
          </p>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-lg text-foreground">
            {formattedAmount}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {transaction.category}
          </p>
        </div>
      </div>
    </Card>
  );
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

export default TransactionItem;
