import { useState } from "react";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import propertyImg1 from "@assets/generated_images/Real_estate_property_placeholder_0bfd4ab9.png";
import propertyImg2 from "@assets/generated_images/Commercial_property_placeholder_3cde5200.png";

export default function UserRealEstate() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //todo: remove mock functionality
  const properties = [
    { id: "1", title: "Modern Family Home", price: 450000, location: "Los Angeles, CA", image: propertyImg1, status: "approved" as const, type: "residential" as const, promoted: true },
    { id: "2", title: "Downtown Office Building", price: 1200000, location: "New York, NY", image: propertyImg2, status: "approved" as const, type: "commercial" as const },
    { id: "3", title: "Beachfront Villa", price: 850000, location: "Miami, FL", image: propertyImg1, status: "pending" as const, type: "residential" as const },
    { id: "4", title: "Industrial Warehouse", price: 650000, location: "Chicago, IL", image: propertyImg2, status: "approved" as const, type: "commercial" as const },
    { id: "5", title: "Luxury Apartment", price: 320000, location: "San Francisco, CA", image: propertyImg1, status: "pending" as const, type: "residential" as const },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New property submitted");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Real Estate</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-property">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>List New Property</DialogTitle>
                <DialogDescription>
                  Add a property listing ($10 listing fee applies)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    placeholder="Modern Family Home"
                    data-testid="input-title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="450000"
                      data-testid="input-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type</Label>
                    <Select>
                      <SelectTrigger id="type" data-testid="select-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    data-testid="input-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property..."
                    rows={4}
                    data-testid="textarea-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" data-testid="button-submit-property">
                  Submit Listing ($10 fee)
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
  );
}
