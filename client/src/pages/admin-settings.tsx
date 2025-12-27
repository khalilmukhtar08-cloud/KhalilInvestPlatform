import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [investmentCommission, setInvestmentCommission] = useState("10");
  const [ecommerceCommission, setEcommerceCommission] = useState("5");
  const [listingFee, setListingFee] = useState("10");

  const handleSaveCommissions = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Commissions saved:", { investmentCommission, ecommerceCommission, listingFee });
    toast({
      title: "Settings saved",
      description: "Commission rates have been updated successfully.",
    });
  };

  const handleSaveAPIKeys = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("API keys saved");
    toast({
      title: "API keys saved",
      description: "Your API keys have been securely updated.",
    });
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email config saved");
    toast({
      title: "Email configuration saved",
      description: "Email settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform parameters and integrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission & Fees</CardTitle>
          <CardDescription>Set commission rates and listing fees</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveCommissions} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investment-commission">Investment Commission (%)</Label>
                <Input
                  id="investment-commission"
                  type="number"
                  value={investmentCommission}
                  onChange={(e) => setInvestmentCommission(e.target.value)}
                  data-testid="input-investment-commission"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ecommerce-commission">E-commerce Commission (%)</Label>
                <Input
                  id="ecommerce-commission"
                  type="number"
                  value={ecommerceCommission}
                  onChange={(e) => setEcommerceCommission(e.target.value)}
                  data-testid="input-ecommerce-commission"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listing-fee">Real Estate Listing Fee ($)</Label>
                <Input
                  id="listing-fee"
                  type="number"
                  value={listingFee}
                  onChange={(e) => setListingFee(e.target.value)}
                  data-testid="input-listing-fee"
                />
              </div>
            </div>
            <Button type="submit" data-testid="button-save-commissions">
              <Save className="h-4 w-4 mr-2" />
              Save Commission Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage external service integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveAPIKeys} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alpaca-key">Alpaca API Key</Label>
              <Input
                id="alpaca-key"
                type="password"
                placeholder="Enter Alpaca API key"
                data-testid="input-alpaca-key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finnhub-key">Finnhub API Key</Label>
              <Input
                id="finnhub-key"
                type="password"
                placeholder="Enter Finnhub API key"
                data-testid="input-finnhub-key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="polygon-key">Polygon.io API Key</Label>
              <Input
                id="polygon-key"
                type="password"
                placeholder="Enter Polygon.io API key"
                data-testid="input-polygon-key"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="google-maps-key">Google Maps API Key</Label>
              <Input
                id="google-maps-key"
                type="password"
                placeholder="Enter Google Maps API key"
                data-testid="input-google-maps-key"
              />
            </div>
            <Button type="submit" data-testid="button-save-api-keys">
              <Save className="h-4 w-4 mr-2" />
              Save API Keys
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Configure email notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-user">Email Username</Label>
              <Input
                id="email-user"
                type="email"
                placeholder="khalilproject04@gmail.com"
                data-testid="input-email-user"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-pass">Email Password</Label>
              <Input
                id="email-pass"
                type="password"
                placeholder="Enter email password"
                data-testid="input-email-pass"
              />
            </div>
            <Button type="submit" data-testid="button-save-email">
              <Save className="h-4 w-4 mr-2" />
              Save Email Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
