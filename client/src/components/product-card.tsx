import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, MoreVertical } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  status: "active" | "pending" | "flagged";
  stock?: number;
  onView?: () => void;
  onEdit?: () => void;
  onMore?: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  category,
  image,
  status,
  stock = 0,
  onView,
  onEdit,
  onMore,
}: ProductCardProps) {
  const statusColors = {
    active: "bg-chart-3 text-white",
    pending: "bg-chart-5 text-chart-5-foreground",
    flagged: "bg-destructive text-destructive-foreground",
  };

  const isLowStock = stock < 10 && stock > 0;
  const isOutOfStock = stock === 0;

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-product-${id}`}>
      <div className="relative aspect-square">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        <Badge className={`absolute top-2 right-2 ${statusColors[status]}`} data-testid={`badge-status-${id}`}>
          {status}
        </Badge>
        {isLowStock && (
          <Badge className="absolute top-2 left-2 bg-chart-5 text-chart-5-foreground">
            Low Stock
          </Badge>
        )}
        {isOutOfStock && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            Out of Stock
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <Badge variant="outline" className="text-xs">{category}</Badge>
        <h3 className="font-semibold text-lg line-clamp-2" data-testid={`text-name-${id}`}>{name}</h3>
        <p className="text-2xl font-bold font-mono text-accent" data-testid={`text-price-${id}`}>
          ${price.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground" data-testid={`text-stock-${id}`}>
          Stock: {stock} units
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onView}
          data-testid={`button-view-${id}`}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
          data-testid={`button-edit-${id}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onMore}
          data-testid={`button-more-${id}`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
