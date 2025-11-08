import { PropertyCard } from "@/components/property-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, CheckCircle } from "lucide-react";
import propertyImg1 from "@assets/generated_images/Real_estate_property_placeholder_0bfd4ab9.png";
import propertyImg2 from "@assets/generated_images/Commercial_property_placeholder_3cde5200.png";

export default function AdminRealEstate() {
  //todo: remove mock functionality
  const properties = [
    { id: "1", title: "Modern Family Home", price: 450000, location: "Los Angeles, CA", image: propertyImg1, status: "pending" as const, type: "residential" as const },
    { id: "2", title: "Downtown Office Building", price: 1200000, location: "New York, NY", image: propertyImg2, status: "pending" as const, type: "commercial" as const },
    { id: "3", title: "Beachfront Villa", price: 850000, location: "Miami, FL", image: propertyImg1, status: "approved" as const, type: "residential" as const, promoted: true },
    { id: "4", title: "Industrial Warehouse", price: 650000, location: "Chicago, IL", image: propertyImg2, status: "approved" as const, type: "commercial" as const },
    { id: "5", title: "Luxury Apartment", price: 320000, location: "San Francisco, CA", image: propertyImg1, status: "pending" as const, type: "residential" as const },
    { id: "6", title: "Retail Complex", price: 2100000, location: "Houston, TX", image: propertyImg2, status: "approved" as const, type: "commercial" as const },
  ];

  const pendingCount = properties.filter(p => p.status === "pending").length;
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
  const approvedCount = properties.filter(p => p.status === "approved").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Real Estate Management</h1>
        <p className="text-muted-foreground">Review and approve property listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-accent">
              ${(totalValue / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Listings</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-chart-3">{approvedCount}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">All Property Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              onView={() => console.log(`View property ${property.id}`)}
              onEdit={() => console.log(`Edit property ${property.id}`)}
              onPromote={() => console.log(`Promote property ${property.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
