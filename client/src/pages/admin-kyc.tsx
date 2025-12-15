import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileCheck, Check, X, User } from "lucide-react";
import { useState } from "react";

interface KycUser {
  id: string;
  name: string;
  email: string;
  kycStatus: string;
  kycFullName: string;
  kycPhone: string;
  kycAddress: string;
  kycCity: string;
  kycCountry: string;
  kycIdType: string;
  kycIdNumber: string;
}

export default function AdminKyc() {
  const { toast } = useToast();
  const [rejectReason, setRejectReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ users: KycUser[] }>({
    queryKey: ["/api/admin/kyc/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/kyc/${userId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "KYC Approved",
        description: "User verification has been approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/pending"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve",
        description: error.message || "Failed to approve KYC",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return await apiRequest("POST", `/api/admin/kyc/${userId}/reject`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "KYC Rejected",
        description: "User verification has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/pending"] });
      setRejectReason("");
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject",
        description: error.message || "Failed to reject KYC",
        variant: "destructive",
      });
    },
  });

  const handleReject = () => {
    if (selectedUserId) {
      rejectMutation.mutate({ userId: selectedUserId, reason: rejectReason });
    }
  };

  const formatIdType = (type: string) => {
    const types: Record<string, string> = {
      passport: "Passport",
      national_id: "National ID",
      drivers_license: "Driver's License",
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const users = data?.users || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2 flex items-center gap-2">
          <FileCheck className="h-8 w-8" />
          KYC Management
        </h1>
        <p className="text-muted-foreground">Review and approve user identity verification requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>
            {users.length} pending verification request{users.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No pending KYC verifications</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>ID Type</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.kycFullName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatIdType(user.kycIdType)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{user.kycIdNumber}</TableCell>
                    <TableCell>
                      {user.kycCity}, {user.kycCountry}
                    </TableCell>
                    <TableCell>{user.kycPhone}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(user.id)}
                          disabled={approveMutation.isPending}
                          data-testid={`button-approve-kyc-${user.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedUserId(user.id)}
                              data-testid={`button-reject-kyc-${user.id}`}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject KYC Verification</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejecting this verification request.
                              </DialogDescription>
                            </DialogHeader>
                            <Input
                              placeholder="Reason for rejection"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              data-testid="input-reject-reason"
                            />
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={rejectMutation.isPending}
                                data-testid="button-confirm-reject"
                              >
                                Reject
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
