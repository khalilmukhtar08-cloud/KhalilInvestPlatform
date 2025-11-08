import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Edit, Star } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  status: "pending" | "approved" | "rejected";
  type: "residential" | "commercial" | "land";
  promoted?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onPromote?: () => void;
}

export function PropertyCard({
  id,
  title,
  price,
  location,
  image,
  status,
  type,
  promoted = false,
  onView,
  onEdit,
  onPromote,
}: PropertyCardProps) {
  const statusColors = {
    pending: "bg-chart-5 text-chart-5-foreground",
    approved: "bg-chart-3 text-white",
    rejected: "bg-destructive text-destructive-foreground",
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-property-${id}`}>
      <div className="relative aspect-video">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
            {status}
          </Badge>
          {promoted && (
            <Badge className="bg-accent text-accent-foreground">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
        </div>
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground capitalize">
          {type}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1" data-testid={`text-title-${id}`}>{title}</h3>
        <div className="flex items-center text-sm text-muted-foreground gap-1">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1" data-testid={`text-location-${id}`}>{location}</span>
        </div>
        <p className="text-2xl font-bold font-mono text-accent" data-testid={`text-price-${id}`}>
          ${price.toLocaleString()}
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
        {!promoted && (
          <Button 
            variant="default" 
            size="sm"
            onClick={onPromote}
            data-testid={`button-promote-${id}`}
          >
            <Star className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
