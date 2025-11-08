import { SocialPostCard } from "@/components/social-post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Calendar, CheckCircle } from "lucide-react";

export default function AdminSocial() {
  //todo: remove mock functionality
  const posts = [
    { id: "1", caption: "Excited to share our latest investment insights! 🚀 #Investing #Finance", platforms: ["facebook" as const, "twitter" as const, "linkedin" as const], createdAt: "2024-03-15", status: "published" as const },
    { id: "2", caption: "New property listings now available in downtown! Check them out 🏢", platforms: ["instagram" as const, "facebook" as const], createdAt: "2024-03-14", status: "scheduled" as const, scheduledFor: "2024-03-20" },
    { id: "3", caption: "Market update: Tech stocks showing strong growth this quarter", platforms: ["linkedin" as const, "twitter" as const], createdAt: "2024-03-13", status: "published" as const },
    { id: "4", caption: "Behind the scenes at our investment office! #WorkLife", platforms: ["instagram" as const, "tiktok" as const], createdAt: "2024-03-12", status: "draft" as const },
    { id: "5", caption: "Investment tips for beginners: Start small and diversify", platforms: ["facebook" as const, "linkedin" as const, "twitter" as const], createdAt: "2024-03-11", status: "published" as const },
    { id: "6", caption: "Weekly market analysis: What to watch this week", platforms: ["linkedin" as const], createdAt: "2024-03-10", status: "scheduled" as const, scheduledFor: "2024-03-17" },
  ];

  const publishedCount = posts.filter(p => p.status === "published").length;
  const scheduledCount = posts.filter(p => p.status === "scheduled").length;
  const draftCount = posts.filter(p => p.status === "draft").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Social Media Management</h1>
        <p className="text-muted-foreground">Monitor user social media activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-chart-3">{publishedCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-chart-5">{scheduledCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono">{draftCount}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">All Social Media Posts</h2>
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
