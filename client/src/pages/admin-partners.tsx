import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PartnerApi, PartnerProject, PartnerInvestment } from "@shared/schema";

const SECTORS = ["stocks", "crypto", "real_estate", "crowdfunding", "bonds", "commodities"] as const;
const STATUSES = ["pending", "active", "inactive", "rejected"] as const;

type PartnerFormData = {
  companyName: string;
  baseUrl: string;
  apiKey: string;
  apiSecret?: string;
  webhookSecret?: string;
  sector: typeof SECTORS[number];
  description?: string;
  commissionRate: number;
};

const defaultFormData: PartnerFormData = {
  companyName: "",
  baseUrl: "",
  apiKey: "",
  apiSecret: "",
  webhookSecret: "",
  sector: "stocks",
  description: "",
  commissionRate: 5,
};

export default function AdminPartners() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerApi | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>(defaultFormData);

  const { data: partners, isLoading: partnersLoading } = useQuery<PartnerApi[]>({
    queryKey: ["/api/admin/partners"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<PartnerProject[]>({
    queryKey: ["/api/admin/partner-projects"],
  });

  const { data: investments, isLoading: investmentsLoading } = useQuery<PartnerInvestment[]>({
    queryKey: ["/api/admin/partner-investments"],
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: PartnerFormData) => {
      const response = await apiRequest("POST", "/api/admin/partners", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({ title: "Partner created successfully" });
      setIsAddDialogOpen(false);
      setFormData(defaultFormData);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create partner", description: error.message, variant: "destructive" });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PartnerFormData> }) => {
      const response = await apiRequest("PATCH", `/api/admin/partners/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({ title: "Partner updated successfully" });
      setIsEditDialogOpen(false);
      setEditingPartner(null);
      setFormData(defaultFormData);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update partner", description: error.message, variant: "destructive" });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({ title: "Partner deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete partner", description: error.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/partners/${id}/toggle`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({ title: "Partner status toggled successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to toggle partner status", description: error.message, variant: "destructive" });
    },
  });

  const syncPartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/partners/${id}/sync`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partner-projects"] });
      toast({ title: "Partner synced successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to sync partner", description: error.message, variant: "destructive" });
    },
  });

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    createPartnerMutation.mutate(formData);
  };

  const handleEditPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner) {
      updatePartnerMutation.mutate({ id: editingPartner.id, data: formData });
    }
  };

  const openEditDialog = (partner: PartnerApi) => {
    setEditingPartner(partner);
    setFormData({
      companyName: partner.companyName,
      baseUrl: partner.baseUrl,
      apiKey: partner.apiKey,
      apiSecret: partner.apiSecret || "",
      webhookSecret: partner.webhookSecret || "",
      sector: partner.sector as typeof SECTORS[number],
      description: partner.description || "",
      commissionRate: parseFloat(partner.commissionRate) || 5,
    });
    setIsEditDialogOpen(true);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-chart-5 text-chart-5-foreground",
    active: "bg-chart-3 text-white",
    inactive: "bg-muted text-muted-foreground",
    rejected: "bg-destructive text-destructive-foreground",
  };

  const sectorLabels: Record<string, string> = {
    stocks: "Stocks",
    crypto: "Crypto",
    real_estate: "Real Estate",
    crowdfunding: "Crowdfunding",
    bonds: "Bonds",
    commodities: "Commodities",
  };

  const totalPartners = partners?.length || 0;
  const activePartners = partners?.filter((p) => p.isActive)?.length || 0;
  const totalProjects = projects?.length || 0;
  const totalInvestmentValue = investments?.reduce(
    (sum, inv) => sum + parseFloat(inv.amount),
    0
  ) || 0;

  const isLoading = partnersLoading || projectsLoading || investmentsLoading;

  const PartnerForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="Partner Company Name"
            required
            data-testid="input-company-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            value={formData.baseUrl}
            onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
            placeholder="https://api.partner.com"
            required
            data-testid="input-base-url"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            placeholder="API Key"
            required
            data-testid="input-api-key"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apiSecret">API Secret (Optional)</Label>
          <Input
            id="apiSecret"
            type="password"
            value={formData.apiSecret}
            onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
            placeholder="API Secret"
            data-testid="input-api-secret"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
          <Input
            id="webhookSecret"
            type="password"
            value={formData.webhookSecret}
            onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
            placeholder="Webhook Secret"
            data-testid="input-webhook-secret"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sector">Sector</Label>
          <Select
            value={formData.sector}
            onValueChange={(value) => setFormData({ ...formData, sector: value as typeof SECTORS[number] })}
          >
            <SelectTrigger data-testid="select-sector">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sectorLabels[sector]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Partner description..."
            rows={3}
            data-testid="textarea-description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="commissionRate">Commission Rate (%)</Label>
          <Input
            id="commissionRate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
            data-testid="input-commission-rate"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={createPartnerMutation.isPending || updatePartnerMutation.isPending}
          data-testid={isEdit ? "button-update-partner" : "button-create-partner"}
        >
          {(createPartnerMutation.isPending || updatePartnerMutation.isPending)
            ? "Saving..."
            : isEdit
            ? "Update Partner"
            : "Add Partner"}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Partner Management</h1>
          <p className="text-muted-foreground">Manage partner API integrations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setFormData(defaultFormData)}
              data-testid="button-add-partner"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Partner</DialogTitle>
              <DialogDescription>
                Configure a new partner API integration
              </DialogDescription>
            </DialogHeader>
            <PartnerForm onSubmit={handleAddPartner} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partner APIs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold font-mono" data-testid="text-total-partners">
                {totalPartners}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold font-mono text-chart-3" data-testid="text-active-partners">
                {activePartners}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partner Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold font-mono" data-testid="text-total-projects">
                {totalProjects}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partner Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold font-mono text-accent" data-testid="text-total-investments">
                ${totalInvestmentValue.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Partner APIs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners && partners.length > 0 ? (
                  partners.map((partner) => (
                    <TableRow key={partner.id} data-testid={`row-partner-${partner.id}`}>
                      <TableCell className="font-medium">{partner.companyName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sectorLabels[partner.sector] || partner.sector}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[partner.status] || "bg-muted"}>
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{partner.commissionRate}%</TableCell>
                      <TableCell>
                        {partner.isActive ? (
                          <ToggleRight className="h-5 w-5 text-chart-3" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {partner.lastSyncAt
                          ? new Date(partner.lastSyncAt).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(partner)}
                          data-testid={`button-edit-${partner.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActiveMutation.mutate(partner.id)}
                          disabled={toggleActiveMutation.isPending}
                          data-testid={`button-toggle-${partner.id}`}
                        >
                          {partner.isActive ? (
                            <ToggleRight className="h-4 w-4 text-chart-3" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePartnerMutation.mutate(partner.id)}
                          disabled={deletePartnerMutation.isPending}
                          data-testid={`button-delete-${partner.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => syncPartnerMutation.mutate(partner.id)}
                          disabled={syncPartnerMutation.isPending}
                          data-testid={`button-sync-${partner.id}`}
                        >
                          <RefreshCw className={`h-4 w-4 ${syncPartnerMutation.isPending ? "animate-spin" : ""}`} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No partner APIs configured. Add your first partner to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>
              Update partner API configuration
            </DialogDescription>
          </DialogHeader>
          <PartnerForm onSubmit={handleEditPartner} isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
