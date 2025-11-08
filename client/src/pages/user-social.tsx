import { useState } from "react";
import { SocialPostCard } from "@/components/social-post-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Sparkles, Calendar, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function UserSocial() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);

  //todo: remove mock functionality
  const posts = [
    { id: "1", caption: "Excited to share our latest investment insights! 🚀 #Investing #Finance", platforms: ["facebook" as const, "twitter" as const, "linkedin" as const], createdAt: "2024-03-15", status: "published" as const },
    { id: "2", caption: "New property listings now available in downtown! Check them out 🏢", platforms: ["instagram" as const, "facebook" as const], createdAt: "2024-03-14", status: "scheduled" as const, scheduledFor: "2024-03-20" },
    { id: "3", caption: "Market update: Tech stocks showing strong growth this quarter", platforms: ["linkedin" as const, "twitter" as const], createdAt: "2024-03-13", status: "published" as const },
    { id: "4", caption: "Behind the scenes at our investment office! #WorkLife", platforms: ["instagram" as const, "tiktok" as const], createdAt: "2024-03-12", status: "draft" as const },
  ];

  //todo: remove mock functionality
  const connectedAccounts = [
    { platform: "facebook", connected: true },
    { platform: "instagram", connected: true },
    { platform: "linkedin", connected: true },
    { platform: "tiktok", connected: false },
    { platform: "twitter", connected: true },
  ];

  const handleAISuggest = () => {
    //todo: remove mock functionality
    setCaption("🚀 Exciting investment opportunities ahead! Join us as we explore the future of finance. #InvestSmart #WealthBuilding");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Post created:", { caption, platforms });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Social Media</h1>
          <p className="text-muted-foreground">Manage your social media presence</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-post">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Social Media Post</DialogTitle>
                <DialogDescription>
                  Write and schedule posts across multiple platforms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="caption">Post Caption</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAISuggest}
                      data-testid="button-ai-suggest"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI Suggest
                    </Button>
                  </div>
                  <Textarea
                    id="caption"
                    placeholder="What's on your mind?"
                    rows={6}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    data-testid="textarea-caption"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Select Platforms</Label>
                  <div className="space-y-2">
                    {["facebook", "instagram", "linkedin", "twitter", "tiktok"].map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform}
                          checked={platforms.includes(platform)}
                          onCheckedChange={(checked) => {
                            setPlatforms(checked
                              ? [...platforms, platform]
                              : platforms.filter((p) => p !== platform)
                            );
                          }}
                          data-testid={`checkbox-${platform}`}
                        />
                        <label
                          htmlFor={platform}
                          className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {platform}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" data-testid="button-schedule">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button type="submit" data-testid="button-post-now">
                  <Send className="h-4 w-4 mr-2" />
                  Post Now
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your social media connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {connectedAccounts.map((account) => (
              <Badge
                key={account.platform}
                variant={account.connected ? "default" : "outline"}
                className="capitalize"
              >
                {account.platform}
                {account.connected ? " ✓" : " (Disconnected)"}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">Your Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <SocialPostCard
              key={post.id}
              {...post}
              onView={() => console.log(`View post ${post.id}`)}
              onEdit={() => console.log(`Edit post ${post.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
