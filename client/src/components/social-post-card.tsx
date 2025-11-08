import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, Twitter, Calendar, Eye } from "lucide-react";
import { SiTiktok } from "react-icons/si";

interface SocialPostCardProps {
  id: string;
  caption: string;
  platforms: ("facebook" | "instagram" | "linkedin" | "tiktok" | "twitter")[];
  createdAt: string;
  status: "draft" | "scheduled" | "published";
  scheduledFor?: string;
  onView?: () => void;
  onEdit?: () => void;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  tiktok: SiTiktok,
  twitter: Twitter,
};

const platformColors = {
  facebook: "text-blue-600",
  instagram: "text-pink-600",
  linkedin: "text-blue-700",
  tiktok: "text-black dark:text-white",
  twitter: "text-sky-500",
};

export function SocialPostCard({
  id,
  caption,
  platforms,
  createdAt,
  status,
  scheduledFor,
  onView,
  onEdit,
}: SocialPostCardProps) {
  const statusColors = {
    draft: "bg-secondary text-secondary-foreground",
    scheduled: "bg-chart-5 text-chart-5-foreground",
    published: "bg-chart-3 text-white",
  };

  return (
    <Card className="hover-elevate" data-testid={`card-post-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex gap-2">
          {platforms.map((platform) => {
            const Icon = platformIcons[platform];
            return (
              <div
                key={platform}
                className={`${platformColors[platform]}`}
                data-testid={`icon-platform-${platform}-${id}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            );
          })}
        </div>
        <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm line-clamp-3" data-testid={`text-caption-${id}`}>{caption}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
          {scheduledFor && status === "scheduled" && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(scheduledFor).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
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
          className="flex-1"
          onClick={onEdit}
          data-testid={`button-edit-${id}`}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
