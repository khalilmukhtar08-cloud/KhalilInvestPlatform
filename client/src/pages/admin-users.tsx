import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, Ban, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminUsers() {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  //todo: remove mock functionality
  const users = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "user", joinedAt: "2024-01-15", investments: 5, status: "active" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user", joinedAt: "2024-02-01", investments: 3, status: "active" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", role: "user", joinedAt: "2024-02-10", investments: 8, status: "active" },
    { id: "4", name: "Sarah Williams", email: "sarah@example.com", role: "user", joinedAt: "2024-02-20", investments: 2, status: "blocked" },
    { id: "5", name: "Tom Brown", email: "tom@example.com", role: "user", joinedAt: "2024-03-01", investments: 6, status: "active" },
  ];

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Bulk email sent");
    setIsEmailDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage all platform users</p>
        </div>
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-send-bulk-email">
              <Mail className="h-4 w-4 mr-2" />
              Send Bulk Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSendEmail}>
              <DialogHeader>
                <DialogTitle>Send Bulk Email</DialogTitle>
                <DialogDescription>
                  Send notifications or announcements to all users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Important announcement"
                    data-testid="input-subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Write your message..."
                    rows={8}
                    data-testid="textarea-message"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" data-testid="button-send-email">
                  Send to All Users
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Investments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono">{user.investments}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" data-testid={`button-view-${user.id}`}>
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-block-${user.id}`}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-delete-${user.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
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
